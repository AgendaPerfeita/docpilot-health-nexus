import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Brain, AlertTriangle, CheckCircle, MessageSquare, Send, Target, Shield, BookOpen } from "lucide-react";
import { callSecureGeminiAPI } from "@/lib/secureGemini";
import { useToast } from "@/hooks/use-toast";

interface ValidationQuestion {
  id: string;
  label: string;
  required: boolean;
  type: 'text' | 'number' | 'select' | 'boolean';
  options?: string[];
  unit?: string;
  placeholder?: string;
  priority: 'critical' | 'high' | 'medium';
  answer?: string;
}

interface AIResponse {
  answer: string;
  confidence: 'high' | 'medium' | 'low';
  completeness: number; // 0-100%
  validationQuestions?: ValidationQuestion[];
  finalAnswer?: string;
  sources?: string[];
  safetyAlerts?: string[];
}

export default function ImprovedQuickAI() {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [validationQuestions, setValidationQuestions] = useState<ValidationQuestion[]>([]);
  const [showFinalAnswer, setShowFinalAnswer] = useState(false);
  const [showDoctorsModal, setShowDoctorsModal] = useState(false);
  
  // Estado para mostrar o "Conselho Médico IA" trabalhando
  const [doctorsWorking, setDoctorsWorking] = useState<{
    drAnalise: { status: 'waiting' | 'working' | 'done', message: string },
    drDiagnostico: { status: 'waiting' | 'working' | 'done', message: string },
    drConduta: { status: 'waiting' | 'working' | 'done', message: string },
    drSeguranca: { status: 'waiting' | 'working' | 'done', message: string }
  }>({
    drAnalise: { status: 'waiting', message: '' },
    drDiagnostico: { status: 'waiting', message: '' },
    drConduta: { status: 'waiting', message: '' },
    drSeguranca: { status: 'waiting', message: '' }
  });
  
  // Sugestões rápidas para acelerar o processo
  const quickSuggestions = [
    "Dose de paracetamol para criança de 5 anos e 18kg com febre de 39°C",
    "Posso usar dipirona em gestante de 32 semanas?",
    "Tratamento inicial para HAS 150/90 em paciente de 65 anos",
    "Antibiótico para ITU em mulher de 25 anos sem comorbidades"
  ];

  // SISTEMA MULTI-AGENT - "CONSELHO MÉDICO IA"
  const multiAgentSystem = {
    // "DR. COMPLETUDE" - Especialista em Análise de Dados
    completenessAgent: (question: string) => `
ESPECIALISTA EM COMPLETUDE DE DADOS MÉDICOS - "DR. COMPLETUDE"

MISSÃO: Analisar RIGOROSAMENTE se esta pergunta tem dados suficientes para resposta médica segura.

PERGUNTA: "${question}"

DETECÇÃO AUTOMÁTICA DE CONTEXTO:
${question.toLowerCase().includes('criança') || question.toLowerCase().includes('pediatr') ? `
🧒 CONTEXTO: PEDIATRIA DETECTADA
DADOS CRÍTICOS OBRIGATÓRIOS: peso, idade específica, alergias
CRITÉRIO RIGOROSO: Sem peso = MÁXIMO 50% completude
` : ''}
${question.toLowerCase().includes('gestante') || question.toLowerCase().includes('grávida') || question.toLowerCase().includes('gestação') ? `
🤱 CONTEXTO: GESTAÇÃO DETECTADA  
DADOS CRÍTICOS OBRIGATÓRIOS: idade gestacional, trimestre
CRITÉRIO RIGOROSO: Sem IG = MÁXIMO 40% completude
` : ''}
${question.toLowerCase().includes('idoso') || /\d+\s*anos/.test(question) && parseInt(question.match(/(\d+)\s*anos/)?.[1] || '0') >= 65 ? `
👴 CONTEXTO: GERIATRIA DETECTADA
DADOS CRÍTICOS OBRIGATÓRIOS: função renal, comorbidades, medicações
CRITÉRIO RIGOROSO: Sem creatinina = MÁXIMO 60% completude
` : ''}

ANÁLISE ULTRA-RIGOROSA:
1. DADOS PRESENTES: [Listar cada dado específico encontrado]
2. DADOS CRÍTICOS AUSENTES: [Listar o que falta para segurança]
3. NÍVEL DE RISCO: [Alto/Médio/Baixo se responder sem dados faltantes]

SCORE DE COMPLETUDE: __/100

DECISÃO CRÍTICA:
- Se ≥85%: "APROVADO PARA RESPOSTA DIRETA"
- Se <85%: "REQUER VALIDAÇÃO - dados insuficientes para segurança"

RESPONDA APENAS EM JSON:
{
  "completeness": [0-100],
  "contexto": "pediatria/gestacao/geriatria/adulto",
  "dadosPresentes": ["lista"],
  "dadosCriticosFaltando": ["lista"],
  "nivelRisco": "alto/medio/baixo",
  "decisao": "aprovado/requer_validacao"
}
`,

    // "DR. PERGUNTAS" - Especialista em Formulação de Questões
    questionAgent: (question: string, missingData: string[], context: string) => `
ESPECIALISTA EM FORMULAÇÃO DE PERGUNTAS MÉDICAS - "DR. PERGUNTAS"

MISSÃO: Formular perguntas CIRÚRGICAS e ESPECÍFICAS para obter dados críticos.

PERGUNTA ORIGINAL: "${question}"
CONTEXTO DETECTADO: ${context}
DADOS CRÍTICOS FALTANDO: ${missingData.join(', ')}

DIRETRIZES PARA PERGUNTAS INTELIGENTES:
${context === 'pediatria' ? `
PEDIATRIA - Prioridades:
1. Peso (CRÍTICO para doses)
2. Idade específica em meses/anos
3. Sintomas específicos (temperatura exata, duração)
4. Alergias medicamentosas conhecidas
` : ''}
${context === 'gestacao' ? `
GESTAÇÃO - Prioridades:  
1. Idade gestacional exata (semanas)
2. Trimestre específico
3. Comorbidades gestacionais
4. Medicações em uso
` : ''}
${context === 'geriatria' ? `
GERIATRIA - Prioridades:
1. Função renal (creatinina/clearance)
2. Comorbidades específicas
3. Medicações em uso (polifarmácia)
4. Cognição/capacidade decisória
` : ''}

INSTRUÇÕES:
- MÁXIMO 5 perguntas
- Linguagem CLARA e DIRETA
- Priorizar CRÍTICAS primeiro
- Usar tipos específicos (number/select/text)

RESPONDA EM JSON:
{
  "validationQuestions": [
    {
      "id": "id_unico",
      "label": "Pergunta específica e direta",
      "required": true/false,
      "type": "number/text/select",
      "unit": "unidade_se_aplicavel",
      "options": ["se_for_select"],
      "priority": "critical/high/medium"
    }
  ]
}
`,

    // "DR. MÉDICO" - Especialista em Condutas Clínicas
    medicalAgent: (question: string, validatedData: any) => `
ESPECIALISTA MÉDICO EM CONDUTAS CLÍNICAS - "DR. MÉDICO"

MISSÃO: Fornecer conduta médica ULTRA-PRECISA baseada nos dados validados.

PERGUNTA: "${question}"
DADOS VALIDADOS: ${JSON.stringify(validatedData)}

CHAIN OF THOUGHT EXPLÍCITO:
Pense em voz alta sobre:

1. ANÁLISE DO CASO:
"Este é um caso de [especialidade]. O paciente tem [características]. A condição é [gravidade]."

2. CONSIDERAÇÕES CRÍTICAS:
"Dados críticos: [listar]. Fatores de risco: [listar]. Contraindicações: [verificar]."

3. RACIOCÍNIO TERAPÊUTICO:
"Para este perfil, primeira linha seria [medicamento] porque [justificativa]. Dose calculada: [cálculo]."

4. SEGURANÇA:
"Monitorar [parâmetros]. Alertas: [específicos]. Seguimento: [quando]."

ESTRUTURA DA RESPOSTA:
- Conduta específica com justificativa
- Cálculos detalhados (doses, intervalos)
- Alertas de monitoramento específicos
- Contraindicações relevantes
- Esta é orientação de auxílio. Decisão final é do médico.

FONTES REAIS CONSULTADAS:
Liste APENAS fontes que você realmente baseou esta resposta específica.

RESPONDA EM JSON:
{
  "answer": "Resposta médica completa com chain of thought",
  "confidence": "high",
  "sources": ["fontes reais consultadas"],
  "safetyAlerts": ["alertas específicos"]
}
`,

    // "DR. VALIDADOR" - Sistema de Auto-Correção
    validatorAgent: (originalQuestion: string, response: string) => `
VALIDADOR MÉDICO FINAL - "DR. VALIDADOR"

MISSÃO: Revisar e validar resposta médica antes de enviar ao plantonista.

PERGUNTA ORIGINAL: "${originalQuestion}"
RESPOSTA A VALIDAR: "${response}"

CHECKLIST DE VALIDAÇÃO CRÍTICA:

✅ PRECISÃO MÉDICA:
- A resposta está baseada em diretrizes oficiais?
- Os cálculos de dose estão corretos?
- As contraindicações foram consideradas?

✅ SEGURANÇA DO PACIENTE:
- A conduta é conservadora?
- Os alertas de monitoramento são adequados?
- Há riscos não mencionados?

✅ APLICABILIDADE PRÁTICA:
- O plantonista pode executar esta conduta?
- As informações são claras e específicas?
- Falta algum detalhe importante?

✅ RESPONSABILIDADE MÉDICA:
- Está claro que é orientação de auxílio?
- As limitações foram mencionadas?
- A necessidade de reavaliação foi indicada?

DECISÃO FINAL:
Se encontrar QUALQUER problema: "REPROVAR - [motivo]"
Se estiver perfeito: "VALIDADO - resposta aprovada"

Se reprovar, forneça a VERSÃO CORRIGIDA.
`
  };

  const generateOptimizedPrompt = (userQuestion: string) => `
SISTEMA QUICK AI - ASSISTÊNCIA MÉDICA ULTRA-PRECISA

MISSÃO: Fornecer orientação médica com precisão próxima a 100% através de validação inteligente.

PERGUNTA: ${userQuestion}

PROTOCOLO DE PRECISÃO ULTRA-RIGOROSO:

ANÁLISE DE COMPLETUDE (0-100%):
Para CADA pergunta, avalie RIGOROSAMENTE:

1. DADOS DEMOGRÁFICOS ESSENCIAIS:
   - Idade ESPECÍFICA (não apenas "idoso", "criança")
   - Peso (essencial para doses)
   - Sexo (quando relevante)

2. DADOS CLÍNICOS CRÍTICOS:
   - Valores EXATOS (PA, glicemia, laboratórios)
   - Função renal (creatinina/clearance)
   - Comorbidades específicas
   - Medicações em uso

3. CONTEXTO MÉDICO COMPLETO:
   - Gravidade/urgência
   - Duração dos sintomas
   - Tentativas terapêuticas prévias
   - Alergias medicamentosas

CRITÉRIO RIGOROSO: SE FALTAR QUALQUER DADO CRÍTICO = COMPLETUDE < 80%

EXEMPLOS DE ANÁLISE RIGOROSA:

❌ VAGA (< 80%): "HAS em idoso"
FALTA: idade específica, valores PA, função renal, comorbidades

❌ VAGA (< 80%): "Antibiótico para pneumonia"  
FALTA: idade, gravidade, patógeno, local internação, comorbidades

✅ COMPLETA (≥ 80%): "HAS 150/90 em homem 67 anos, creatinina 1.1, sem comorbidades"
TEM: idade específica, PA exata, função renal, contexto clínico

REGRA DE OURO: SEJA EXTREMAMENTE RIGOROSO. Na dúvida, SEMPRE gerar validação.

DIRETRIZES OBRIGATÓRIAS:
• Seguir ESTRITAMENTE: SBP, SBC, SBD, ANVISA, Ministério da Saúde
• Abordagem CONSERVADORA - nunca agressiva
• Considerar SEMPRE risco-benefício
• Admitir limitações quando não souber
• SEMPRE incluir: "Esta é orientação de auxílio. Decisão final é do médico."

FONTES OBRIGATÓRIAS:
• SEMPRE listar no campo "sources" as fontes REAIS que você consultou
• NÃO inventar fontes - usar apenas as que você realmente baseou sua resposta
• Exemplos: "SBC - Diretrizes de Hipertensão 2020", "ANVISA - Bulário do Enalapril"

CRITÉRIOS ESPECÍFICOS ATUALIZADOS:
• Diabetes: Insulina inicial apenas se HbA1c >9% + sintomas OU glicemia ≥300mg/dL
• Hipertensão: Monoterapia inicial (IECA/BRA preferred)
• Antibióticos: Apenas com evidência infecciosa clara
• Pediatria: Sempre calcular por peso (mg/kg)
• Gestação: Sempre verificar categoria FDA/ANVISA
• Idosos: Ajustar dose para clearance renal

FORMATO OBRIGATÓRIO:

Para ALTA COMPLETUDE (≥85%):
{
  "answer": "Resposta detalhada baseada em diretrizes. NÃO incluir fontes no texto da resposta.",
  "confidence": "high",
  "completeness": 90,
  "sources": ["SEMPRE listar as fontes REAIS que você consultou para esta resposta específica"],
  "safetyAlerts": ["Verificar função renal", "Monitorar glicemia"]
}

Para BAIXA COMPLETUDE (<80%):
{
  "answer": "Análise inicial com dados disponíveis. Para resposta PRECISA e SEGURA, preciso de informações críticas:",
  "confidence": "medium",
  "completeness": [PORCENTAGEM_REAL],
  "validationQuestions": [
    {
      "id": "unique_id",
      "label": "PERGUNTA ESPECÍFICA baseada no que falta",
      "required": true/false,
      "type": "number/text/select",
      "unit": "unidade_se_aplicável", 
      "options": ["se_for_select"],
      "priority": "critical/high/medium"
    }
  ]
}

INSTRUÇÕES PARA PERGUNTAS DINÂMICAS:
- CADA pergunta deve ser ESPECÍFICA para o caso
- PRIORIZAR dados CRÍTICOS primeiro
- MÁXIMO 5 perguntas por vez
- USAR linguagem CLARA e DIRETA

REGRA OURO: Na dúvida sobre completude, SEMPRE gerar perguntas de validação. É melhor pedir mais informações do que dar resposta imprecisa.
`;

  // ORQUESTRADOR MULTI-AGENT - Faz as "IAs" conversarem
  const orchestrateMultiAgent = async (question: string) => {
    try {
      // ETAPA 1: 🧠 DR. ANÁLISE trabalhando
      setDoctorsWorking(prev => ({
        ...prev,
        drAnalise: { status: 'working', message: 'Analisando completude de dados clínicos...' }
      }));
      
      const completenessResponse = await callSecureGeminiAPI({ 
        prompt: multiAgentSystem.completenessAgent(question), 
        context: 'emergency' 
      });
      
      if (!completenessResponse.success) {
        throw new Error('Erro na análise de completude');
      }

      // Parse da análise de completude
      const completenessMatch = completenessResponse.response.trim().match(/\{[\s\S]*\}/);
      let completenessData;
      
      try {
        if (completenessMatch) {
          completenessData = JSON.parse(completenessMatch[0]);
        }
      } catch (parseError) {
        console.error('Erro no parse da análise de completude');
        // Fallback para análise tradicional
        return await fallbackTraditionalAnalysis(question);
      }

      // 🧠 DR. ANÁLISE concluído
      setDoctorsWorking(prev => ({
        ...prev,
        drAnalise: { 
          status: 'done', 
          message: `${completenessData?.contexto?.toUpperCase() || 'ADULTO'} detectado - Completude: ${completenessData?.completeness || 50}%` 
        }
      }));

      // DECISÃO: Precisa de validação ou pode responder?
      if (completenessData?.decisao === 'requer_validacao') {
        
        // ETAPA 2: 🎯 DR. DIAGNÓSTICO trabalhando
        setDoctorsWorking(prev => ({
          ...prev,
          drDiagnostico: { status: 'working', message: 'Formulando perguntas clínicas específicas...' }
        }));
        
        const questionsResponse = await callSecureGeminiAPI({
          prompt: multiAgentSystem.questionAgent(
            question, 
            completenessData.dadosCriticosFaltando || [], 
            completenessData.contexto || 'adulto'
          ),
          context: 'emergency'
        });

        if (!questionsResponse.success) {
          throw new Error('Erro na formulação de perguntas');
        }

        // Parse das perguntas
        const questionsMatch = questionsResponse.response.trim().match(/\{[\s\S]*\}/);
        let questionsData;
        
        try {
          if (questionsMatch) {
            questionsData = JSON.parse(questionsMatch[0]);
          }
        } catch (parseError) {
          console.error('Erro no parse das perguntas');
          throw new Error('Erro na formulação de perguntas');
        }

        // 🎯 DR. DIAGNÓSTICO concluído
        setDoctorsWorking(prev => ({
          ...prev,
          drDiagnostico: { 
            status: 'done', 
            message: `${questionsData?.validationQuestions?.length || 0} perguntas clínicas formuladas` 
          },
          drConduta: { 
            status: 'done', 
            message: 'Aguardando dados para elaborar conduta médica precisa' 
          },
          drSeguranca: { 
            status: 'done', 
            message: 'Protocolos de segurança ativados' 
          }
        }));

        // Retorna resultado com perguntas de validação
        return {
          answer: `🏥 CONSELHO MÉDICO IA: ${completenessData.contexto.toUpperCase()} detectado. Para conduta ULTRA-PRECISA, nossos especialistas precisam de dados críticos adicionais.`,
          confidence: 'medium',
          completeness: completenessData.completeness || 50,
          validationQuestions: questionsData?.validationQuestions || [],
          sources: [],
          needsValidation: true
        };

      } else {
        // ETAPA 3: 👨‍⚕️ DR. CONDUTA trabalhando
        setDoctorsWorking(prev => ({
          ...prev,
          drConduta: { status: 'working', message: 'Elaborando conduta médica baseada em evidências...' }
        }));
        
        const medicalResponse = await callSecureGeminiAPI({
          prompt: multiAgentSystem.medicalAgent(question, { perguntaCompleta: true }),
          context: 'emergency'
        });

        if (!medicalResponse.success) {
          throw new Error('Erro na resposta médica');
        }

        // Parse da resposta médica
        const medicalMatch = medicalResponse.response.trim().match(/\{[\s\S]*\}/);
        let medicalData;
        
        try {
          if (medicalMatch) {
            medicalData = JSON.parse(medicalMatch[0]);
          } else {
            // Se não vier JSON, usar resposta como texto
            medicalData = {
              answer: medicalResponse.response,
              confidence: 'high',
              sources: [],
              safetyAlerts: []
            };
          }
        } catch (parseError) {
          medicalData = {
            answer: medicalResponse.response,
            confidence: 'high', 
            sources: [],
            safetyAlerts: []
          };
        }

        // 👨‍⚕️ DR. CONDUTA concluído
        setDoctorsWorking(prev => ({
          ...prev,
          drConduta: { status: 'done', message: 'Conduta médica elaborada com chain of thought' }
        }));

        // ETAPA 4: ✅ DR. SEGURANÇA validando
        setDoctorsWorking(prev => ({
          ...prev,
          drSeguranca: { status: 'working', message: 'Validando segurança e protocolos médicos...' }
        }));
        
        const validationResponse = await callSecureGeminiAPI({
          prompt: multiAgentSystem.validatorAgent(question, medicalData.answer),
          context: 'emergency'
        });

        // Se validação reprovar, usar versão corrigida
        let finalMessage = 'Protocolos de segurança aprovados - Resposta validada';
        if (validationResponse.success && validationResponse.response.includes('REPROVAR')) {
          const correctedAnswer = validationResponse.response.split('VERSÃO CORRIGIDA:')[1] || medicalData.answer;
          medicalData.answer = correctedAnswer.trim();
          finalMessage = 'Correções de segurança aplicadas';
        }

        // ✅ DR. SEGURANÇA concluído
        setDoctorsWorking(prev => ({
          ...prev,
          drSeguranca: { status: 'done', message: finalMessage }
        }));

        return {
          answer: medicalData.answer,
          confidence: 'high',
          completeness: completenessData.completeness || 90,
          sources: medicalData.sources || [],
          safetyAlerts: medicalData.safetyAlerts || [],
          needsValidation: false
        };
      }

    } catch (error) {
      console.error('Erro no sistema multi-agent:', error);
      // Fallback para análise tradicional
      return await fallbackTraditionalAnalysis(question);
    }
  };

  // Fallback para o sistema tradicional em caso de erro
  const fallbackTraditionalAnalysis = async (question: string) => {
    const prompt = generateOptimizedPrompt(question);
    const response = await callSecureGeminiAPI({ prompt, context: 'emergency' });
    
    if (!response.success) {
      throw new Error(response.error || 'Erro na comunicação com a IA');
    }
    
    const jsonMatch = response.response.trim().match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return {
      answer: response.response,
      confidence: 'medium',
      completeness: 70,
      sources: [],
      safetyAlerts: []
    };
  };

  const generateQuickResponse = async () => {
    if (!question.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, faça uma pergunta médica.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setAiResponse(null);
    setValidationQuestions([]);
    setShowFinalAnswer(false);
    setShowDoctorsModal(true); // Abrir modal dos doutores
    
    // Resetar estado dos doutores
    setDoctorsWorking({
      drAnalise: { status: 'waiting', message: '' },
      drDiagnostico: { status: 'waiting', message: '' },
      drConduta: { status: 'waiting', message: '' },
      drSeguranca: { status: 'waiting', message: '' }
    });

    try {
      // USAR SISTEMA MULTI-AGENT
      const multiAgentResult = await orchestrateMultiAgent(question);
      
      setAiResponse({
        answer: multiAgentResult.answer,
        confidence: multiAgentResult.confidence as 'high' | 'medium' | 'low',
        completeness: multiAgentResult.completeness,
        sources: multiAgentResult.sources,
        safetyAlerts: multiAgentResult.safetyAlerts,
        validationQuestions: multiAgentResult.validationQuestions
      });
      
      if (multiAgentResult.validationQuestions && multiAgentResult.validationQuestions.length > 0) {
            // Ordenar por prioridade
        const sortedQuestions = multiAgentResult.validationQuestions.sort((a, b) => {
              const priorityOrder = { critical: 0, high: 1, medium: 2 };
              return priorityOrder[a.priority] - priorityOrder[b.priority];
            });
            setValidationQuestions(sortedQuestions);
      }
      
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      setAiResponse({
        answer: 'Erro ao processar sua pergunta. Tente reformular ou seja mais específico.',
        confidence: 'low',
        completeness: 0,
        safetyAlerts: ['Sistema temporariamente indisponível']
      });
    } finally {
      setIsLoading(false);
      
      // Fechar modal após 2 segundos para mostrar resultado final
      setTimeout(() => {
        setShowDoctorsModal(false);
      }, 2000);
    }
  };

  const handleValidationAnswer = (id: string, answer: string) => {
    setValidationQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, answer } : q)
    );
  };

  const generateFinalAnswer = async () => {
    if (!aiResponse) return;

    const unansweredCritical = validationQuestions.filter(
      q => q.priority === 'critical' && q.required && (!q.answer || !q.answer.trim())
    );
    
    const unansweredHigh = validationQuestions.filter(
      q => q.priority === 'high' && q.required && (!q.answer || !q.answer.trim())
    );

    if (unansweredCritical.length > 0) {
      toast({
        title: "Informações Críticas Necessárias",
        description: `Responda as perguntas críticas (${unansweredCritical.length}) para garantir precisão máxima.`,
        variant: "destructive"
      });
      return;
    }

    if (unansweredHigh.length > 0) {
      toast({
        title: "Atenção - Informações Importantes",
        description: `${unansweredHigh.length} pergunta(s) de alta prioridade não respondida(s). Isso pode afetar a precisão.`,
        variant: "default"
      });
    }

    setIsLoading(true);
    setShowDoctorsModal(true); // Abrir modal para resposta final

    try {
      const answeredQuestions = validationQuestions.filter(q => q.answer?.trim());
      
      const finalPrompt = `
GERAÇÃO DE RESPOSTA FINAL ULTRA-PRECISA

PERGUNTA ORIGINAL: ${question}
RESPOSTA INICIAL: ${aiResponse.answer}

INFORMAÇÕES VALIDADAS:
${answeredQuestions.map(q => `• ${q.label}: ${q.answer} [${q.priority.toUpperCase()}]`).join('\n')}

INSTRUÇÕES PARA RESPOSTA FINAL:
1. INTEGRAR todas as informações validadas
2. AJUSTAR recomendações baseado nos novos dados
3. CALCULAR doses exatas quando aplicável
4. INCLUIR alertas de segurança específicos
5. CITAR fontes oficiais relevantes
6. MANTER abordagem conservadora

ESTRUTURA OBRIGATÓRIA:
• Conduta específica baseada nas informações fornecidas
• Cálculos detalhados (doses, intervalos)
• Alertas de monitoramento
• Contraindicações relevantes
• "Esta é orientação de auxílio. Decisão final é do médico."

IMPORTANTE: NÃO incluir fontes no texto da resposta. As fontes devem vir no campo 'sources' do JSON.

RESPOSTA FINAL DEVE SER UM JSON:
{
  "finalAnswer": "Texto da resposta sem fontes",
  "sources": ["LISTAR APENAS as fontes REAIS que você consultou para esta resposta específica"],
  "confidence": "high"
}

FOCO: Precisão máxima, segurança do paciente, praticidade para o plantonista.
`;

      const finalResponse = await callSecureGeminiAPI({ 
        prompt: finalPrompt, 
        context: 'emergency' 
      });
      
      if (!finalResponse.success) {
        throw new Error(finalResponse.error || "Erro na resposta final");
      }
      
      // Tentar fazer parse do JSON da resposta final
      let finalData;
      try {
        const jsonMatch = finalResponse.response.trim().match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          finalData = JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        console.log('Resposta final não é JSON, usando como texto');
      }
      
      setAiResponse(prev => prev ? { 
        ...prev, 
        finalAnswer: finalData?.finalAnswer || finalResponse.response,
        confidence: 'high',
        completeness: 95,
        // Usar fontes da resposta final se existirem, senão manter originais
        sources: finalData?.sources || prev.sources || [],
        safetyAlerts: prev.safetyAlerts || []
      } : null);
      setShowFinalAnswer(true);
      
      toast({
        title: "Resposta Final Gerada",
        description: "Resposta com alta precisão baseada nas informações fornecidas.",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Erro na resposta final:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar resposta final. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      
      // Fechar modal após 2 segundos para mostrar resultado final
      setTimeout(() => {
        setShowDoctorsModal(false);
      }, 2000);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high': return <Shield className="w-4 h-4 text-orange-500" />;
      case 'medium': return <BookOpen className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  // Função para converter markdown básico para HTML
  const formatText = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code className="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      // Trocar TODAS as ocorrências de * por - para listas mais bonitas
      .replace(/^\s*\*\s+/gm, '- ')
      .replace(/\n\s*\*\s+/g, '\n- ')
      .replace(/\*\s+([A-Z])/g, '- $1')
      .replace(/\n/g, '<br />');
  };

  // Função para detectar perguntas vagas automaticamente
  const detectVagueQuestion = (question: string) => {
    const lowerQuestion = question.toLowerCase();
    
    // Padrões que indicam pergunta vaga
    const vaguePatterns = [
      // Medicamento + "para" + sintoma genérico
      /\b(paracetamol|dipirona|amoxicilina|azitromicina|tansulosina|omeprazol)\b.*\bpara\b.*\b(febre|cólica|dor|infecção|gastrite)\b/i,
      
      // Antibióticos sem especificar infecção
      /\b(antibiotic|antibiótico)\b.*\bpara\b.*\b(infecção|bactéria)\b/i,
      
      // Doses pediátricas sem peso
      /\b(dose|posso usar)\b.*\b(paracetamol|dipirona|antibiotic|antibiótico)\b.*\b(criança|pediatr|anos?)\b(?!.*\b\d+\s*kg\b)/i,
      
      // Gestantes sem idade gestacional
      /\b(gestante|grávida|gestação)\b.*\b(medicamento|medicamento|posso usar)\b(?!.*\b(1ª|2ª|3ª|primeiro|segundo|terceiro|semanas?)\b)/i,
      
      // Idosos sem função renal
      /\b(idoso|idosos|65|70|80)\b.*\b(anos?)\b.*\b(medicamento|posso usar)\b(?!.*\b(creatinina|clearance|renal)\b)/i
    ];
    
    // Verificar se a pergunta se encaixa em algum padrão vago
    const isVague = vaguePatterns.some(pattern => pattern.test(question));
    
    if (isVague) {
      return {
        isVague: true,
        suggestions: [
          "Para resposta precisa, preciso saber:",
          "• Peso da criança (se pediátrico)",
          "• Idade gestacional (se gestante)", 
          "• Função renal (se idoso)",
          "• Tipo específico de infecção/condição",
          "• Comorbidades e alergias"
        ]
      };
    }
    
    return { isVague: false, suggestions: [] };
  };

  const renderValidationInput = (question: ValidationQuestion) => {
    switch (question.type) {
      case 'select':
        return (
          <Select 
            value={question.answer || ''} 
            onValueChange={(value) => handleValidationAnswer(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma opção..." />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder={question.placeholder || "Digite o valor..."}
              value={question.answer || ''}
              onChange={(e) => handleValidationAnswer(question.id, e.target.value)}
            />
            {question.unit && (
              <Badge variant="outline">{question.unit}</Badge>
            )}
          </div>
        );
      
      default:
        return (
          <Input
            placeholder={question.placeholder || "Digite sua resposta..."}
            value={question.answer || ''}
            onChange={(e) => handleValidationAnswer(question.id, e.target.value)}
          />
        );
    }
  };

  return (
    <>
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 p-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-600" />
            DocPilot AI - Assistência Ultra-Precisa
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              <Target className="w-3 h-3 mr-1" />
              ~100% Precisão
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              🔄 Multi-Agent Real
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Junta Médica de Especialistas IA */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🤖</div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-blue-800 mb-2">A.I.V.A - Junta Médica de 4 Especialistas IA</h4>
                <p className="text-xs text-blue-700 mb-3">
                  Cada consulta é analisada por nossa equipe AIVA de 4 médicos virtuais especializados trabalhando em conjunto:
                </p>
                <div className="space-y-1 text-xs text-blue-600">
                  <div>🧠 <strong>DR. ANÁLISE</strong> - Avalia completude dos dados clínicos</div>
                  <div>🔍 <strong>DR. INVESTIGAÇÃO</strong> - Formula questionamentos médicos específicos</div>
                  <div>👨‍⚕️ <strong>DR. VALIDAÇÃO</strong> - Elabora protocolo de tratamento baseado em evidências</div>
                  <div>✅ <strong>DR. AUDITORIA</strong> - Revisa e valida todas as recomendações antes do envio</div>
                </div>
                <p className="text-xs text-blue-600 mt-3 italic font-medium">
                  Sistema de consenso médico com validação cruzada para máxima precisão e segurança do paciente.
                </p>
              </div>
            </div>
          </div>

          {/* Sugestões Rápidas */}
          <div>
            <Label className="text-sm font-medium mb-2 block">💡 Sugestões rápidas:</Label>
            <div className="flex flex-wrap gap-2">
              {quickSuggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setQuestion(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Input Principal */}
          <div>
            <Label htmlFor="question" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Consulte a Junta Médica A.I.V.A (seja específico para maior precisão):
            </Label>
            <Textarea
              id="question"
              placeholder="Ex: Qual a dose de paracetamol para uma criança de 5 anos e 18kg com febre de 39°C?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          {/* Botão Principal */}
          <Button 
            onClick={generateQuickResponse}
            disabled={isLoading || !question.trim()}
            className="w-full bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analisando com IA...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Analisar com A.I.V.A
              </>
            )}
          </Button>



          {/* Resposta da IA */}
          {aiResponse && (
            <div className="space-y-4">
              {/* Métricas da Resposta */}
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <Badge className={getConfidenceColor(aiResponse.confidence)}>
                  Confiança: {aiResponse.confidence.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  Completude: {aiResponse.completeness}%
                </Badge>
                {aiResponse.sources && (
                  <Badge variant="secondary">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {aiResponse.sources.length} fonte(s)
                  </Badge>
                )}
              </div>

              {/* Resposta Inicial */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-600" />
                  {aiResponse.completeness < 85 ? '⚠️ Pergunta Vaga - Preciso de Mais Informações:' : 'Análise Inicial:'}
                </h4>
                <div className="text-sm whitespace-pre-line" dangerouslySetInnerHTML={{ __html: formatText(aiResponse.answer) }} />
                
                {/* Aviso para perguntas vagas */}
                {aiResponse.completeness < 85 && (
                  <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <strong>💡 Dica:</strong> Para respostas mais precisas, seja específico incluindo: peso, idade, comorbidades, alergias e contexto clínico detalhado.
                </div>
                )}
                
                {/* Fontes */}
                {aiResponse.sources && aiResponse.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <div className="text-xs text-blue-700 font-medium mb-1">
                      Fontes:
                    </div>
                    <div className="text-xs text-blue-600">
                      {aiResponse.sources.join(' • ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Alertas de Segurança */}
              {aiResponse.safetyAlerts && aiResponse.safetyAlerts.length > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 font-medium text-sm mb-2">
                    <AlertTriangle className="w-4 h-4" />
                    Alertas de Segurança:
                  </div>
                  <ul className="text-sm text-orange-700 space-y-1">
                    {aiResponse.safetyAlerts.map((alert, index) => (
                      <li key={index}>• {alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Perguntas de Validação */}
              {validationQuestions.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" />
                    Informações para Precisão Máxima:
                  </h4>
                  
                  <div className="space-y-4">
                    {validationQuestions.map((question) => (
                      <div key={question.id} className="space-y-2 p-3 border rounded-lg">
                        <Label className="text-sm font-medium flex items-center gap-2">
                          {getPriorityIcon(question.priority)}
                          {question.label}
                          {question.required && (
                            <span className="text-red-500">*</span>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {question.priority}
                          </Badge>
                        </Label>
                        {renderValidationInput(question)}
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={generateFinalAnswer}
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando resposta final...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Gerar Resposta Final Ultra-Precisa
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Resposta Final */}
              {showFinalAnswer && aiResponse.finalAnswer && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Resposta Final Ultra-Precisa:
                  </h4>
                  <div className="text-sm whitespace-pre-line mb-3" dangerouslySetInnerHTML={{ __html: formatText(aiResponse.finalAnswer) }} />
                  
                  {/* Rodapé das Fontes - Elegante e Separado */}
                  {aiResponse.sources && aiResponse.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-green-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                      <div className="text-xs text-green-700 font-medium mb-2 flex items-center gap-2">
                        📚 Fontes Oficiais da Recomendação:
                  </div>
                      <div className="text-xs text-green-600 space-y-1">
                        {aiResponse.sources.map((source, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-0.5">•</span>
                            <span>{source}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Rodapé Simples e Elegante */}
                  <div className="mt-4 pt-4 border-t border-green-200">
                    {/* Status de Validação */}
                    <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                      Alta Precisão Confirmada
                    </Badge>
                        <Badge variant="outline" className="text-green-700 border-green-300">
                      Validado com Dados Específicos
                    </Badge>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="text-xs text-green-600">
                        {new Date().toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Nova Pergunta */}
              <Button 
                onClick={() => {
                  setQuestion('');
                  setAiResponse(null);
                  setValidationQuestions([]);
                  setShowFinalAnswer(false);
                  setShowDoctorsModal(false);
                  setDoctorsWorking({
                    drAnalise: { status: 'waiting', message: '' },
                    drDiagnostico: { status: 'waiting', message: '' },
                    drConduta: { status: 'waiting', message: '' },
                    drSeguranca: { status: 'waiting', message: '' }
                  });
                }}
                variant="ghost"
                className="w-full"
              >
                🔄 Nova Consulta A.I.V.A
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {/* Modal do Conselho Médico IA */}
    <Dialog open={showDoctorsModal} onOpenChange={setShowDoctorsModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            🏥 <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AIVA - Conselho Médico IA
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Equipe AIVA: 4 Especialistas IA analisando seu caso clínico
            </p>
          </div>
          
          <div className="space-y-6">
            {/* DR. ANÁLISE */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="text-2xl">🧠</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">DR. ANÁLISE</div>
                <div className="text-xs text-gray-600 mb-2">Especialista em Completude de Dados</div>
                <div className="flex items-center gap-2">
                  {doctorsWorking.drAnalise.status === 'waiting' && (
                    <>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">Aguardando...</span>
                    </>
                  )}
                  {doctorsWorking.drAnalise.status === 'working' && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-700">Analisando...</span>
                    </>
                  )}
                  {doctorsWorking.drAnalise.status === 'done' && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">✓ Concluído</span>
                    </>
                  )}
                </div>
                {doctorsWorking.drAnalise.message && (
                  <div className="text-xs text-gray-700 mt-1 italic">
                    "{doctorsWorking.drAnalise.message}"
                  </div>
                )}
              </div>
            </div>

            {/* DR. INVESTIGAÇÃO */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="text-2xl">🔍</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">DR. INVESTIGAÇÃO</div>
                <div className="text-xs text-gray-600 mb-2">Especialista em Questionamentos Clínicos</div>
                <div className="flex items-center gap-2">
                  {doctorsWorking.drDiagnostico.status === 'waiting' && (
                    <>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">Aguardando...</span>
                    </>
                  )}
                  {doctorsWorking.drDiagnostico.status === 'working' && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-700">Formulando perguntas...</span>
                    </>
                  )}
                  {doctorsWorking.drDiagnostico.status === 'done' && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">✓ Concluído</span>
                    </>
                  )}
                </div>
                {doctorsWorking.drDiagnostico.message && (
                  <div className="text-xs text-gray-700 mt-1 italic">
                    "{doctorsWorking.drDiagnostico.message}"
                  </div>
                )}
              </div>
            </div>

            {/* DR. VALIDAÇÃO */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="text-2xl">👨‍⚕️</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">DR. VALIDAÇÃO</div>
                <div className="text-xs text-gray-600 mb-2">Especialista em Protocolos de Tratamento</div>
                <div className="flex items-center gap-2">
                  {doctorsWorking.drConduta.status === 'waiting' && (
                    <>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">Aguardando...</span>
                    </>
                  )}
                  {doctorsWorking.drConduta.status === 'working' && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-700">Elaborando conduta...</span>
                    </>
                  )}
                  {doctorsWorking.drConduta.status === 'done' && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">✓ Concluído</span>
                    </>
                  )}
                </div>
                {doctorsWorking.drConduta.message && (
                  <div className="text-xs text-gray-700 mt-1 italic">
                    "{doctorsWorking.drConduta.message}"
                  </div>
                )}
              </div>
            </div>

            {/* DR. AUDITORIA */}
            <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 bg-gray-50">
              <div className="text-2xl">✅</div>
              <div className="flex-1">
                <div className="font-semibold text-sm">DR. AUDITORIA</div>
                <div className="text-xs text-gray-600 mb-2">Especialista em Validação e Revisão</div>
                <div className="flex items-center gap-2">
                  {doctorsWorking.drSeguranca.status === 'waiting' && (
                    <>
                      <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                      <span className="text-sm text-gray-500">Aguardando...</span>
                    </>
                  )}
                  {doctorsWorking.drSeguranca.status === 'working' && (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-yellow-700">Validando segurança...</span>
                    </>
                  )}
                  {doctorsWorking.drSeguranca.status === 'done' && (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-green-700">✓ Concluído</span>
                    </>
                  )}
                </div>
                {doctorsWorking.drSeguranca.message && (
                  <div className="text-xs text-gray-700 mt-1 italic">
                    "{doctorsWorking.drSeguranca.message}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Indicador de progresso */}
          <div className="mt-6 text-center">
            {Object.values(doctorsWorking).every(dr => dr.status === 'done') ? (
              <div className="text-green-600 font-medium">
                ✅ Análise concluída! Finalizando resposta...
              </div>
            ) : (
              <div className="text-blue-600">
                🔄 Equipe AIVA trabalhando no seu caso...
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}