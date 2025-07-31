import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, AlertTriangle, CheckCircle, MessageSquare, Send } from "lucide-react"
import { callGeminiAPI } from "@/lib/gemini"
import { useToast } from "@/hooks/use-toast"

interface QuickAIAssistantProps {
  className?: string
}

interface ValidationQuestion {
  id: string
  label: string
  required: boolean
  answer?: string
}

interface AIResponse {
  answer: string
  validationQuestions?: ValidationQuestion[]
  finalAnswer?: string
}

export function QuickAIAssistant({ className }: QuickAIAssistantProps) {
  const { toast } = useToast()
  const [question, setQuestion] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null)
  const [validationQuestions, setValidationQuestions] = useState<ValidationQuestion[]>([])
  const [showFinalAnswer, setShowFinalAnswer] = useState(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{
    question: string
    answer: string
    validations?: string[]
  }>>([])

  const generateQuickResponse = async () => {
    if (!question.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, faça uma pergunta médica.",
        variant: "destructive"
      })
      return
    }

    setIsLoading(true)
    setAiResponse(null)
    setValidationQuestions([])

    try {
      const prompt = `
        Você é um assistente médico especializado para plantonistas. Sua função é AUXILIAR o plantonista com orientações baseadas em diretrizes oficiais. SEMPRE deixe claro que a decisão final é do médico e você é apenas um sistema de auxílio.

        PERGUNTA DO PLANTONISTA: ${question}

        REGRAS FUNDAMENTAIS:
        1. SEMPRE seguir diretrizes oficiais (SBD, ADA, AHA, etc.)
        2. SER CONSERVADOR - preferir abordagem gradual
        3. NÃO ser agressivo com tratamentos
        4. SEMPRE considerar risco-benefício
        5. Quando houver dúvida, ser mais conservador
        6. SEMPRE deixar claro que é AUXÍLIO, não decisão final
        7. NUNCA alucinar ou inventar informações
        8. Se não souber algo, dizer que não sabe

        CRITÉRIOS ESPECÍFICOS:
        - Diabetes: Insulina inicial só se HbA1c > 9% com sintomas OU glicemia ≥ 300 mg/dL
        - Hipertensão: Iniciar com monoterapia, não dupla terapia
        - Antibióticos: Só usar quando há evidência clara de infecção
        - Anticoagulação: Seguir critérios estritos de indicação
        - Emergências: Sempre considerar estabilização antes de tratamentos definitivos

        INSTRUÇÕES:
        1. Se a pergunta pode ser respondida diretamente sem necessidade de informações adicionais, responda apenas com a resposta.
        2. Se a resposta depende de informações específicas do paciente, forneça uma resposta inicial E crie perguntas de validação.
        3. Use formato JSON apenas quando necessário validação:

        Para resposta direta (sem validação):
        "Resposta direta e objetiva baseada em evidências médicas."

        Para resposta com validação:
        {
          "answer": "Resposta inicial baseada na pergunta",
          "validationQuestions": [
            {
              "id": "q1",
              "label": "Qual a idade gestacional da paciente?",
              "required": true
            },
            {
              "id": "q2", 
              "label": "A paciente tem alergia ao medicamento?",
              "required": true
            }
          ]
        }

        IMPORTANTE: 
        - Use perguntas diretas e específicas
        - Só use validação quando realmente necessário
        - Se usar JSON, coloque APENAS o JSON, sem texto antes ou depois.
        - Seja dinâmico: se a pergunta já tem a resposta, responda diretamente
        - SEMPRE seja preciso e criterioso nas recomendações
        - Considere o contexto completo da pergunta antes de responder
        - NÃO recomende tratamentos sem evidências sólidas
        - Seja conservador quando houver dúvidas
        - Considere sempre o risco-benefício
        - SEGUIR ESTRITAMENTE as diretrizes oficiais (SBD, ADA, etc.)
        - NÃO ser agressivo com tratamentos - preferir abordagem gradual
        - Para diabetes: HbA1c > 9% com sintomas OU glicemia ≥ 300 mg/dL para insulina inicial
        - SEMPRE incluir: "Esta é uma orientação baseada em diretrizes. A decisão final é do médico."
        - NUNCA alucinar ou inventar informações
        - Se não souber algo, dizer claramente que não sabe
      `

      const response = await callGeminiAPI(prompt)
      console.log('Resposta da IA:', response)
      
      // Tentar detectar se é JSON ou resposta direta
      const trimmedResponse = response.trim()
      
      // Procurar por JSON na resposta (pode ter texto antes ou depois)
      const jsonMatch = trimmedResponse.match(/\{[\s\S]*\}/)
      
      if (jsonMatch) {
        try {
          const parsedResponse = JSON.parse(jsonMatch[0])
          setAiResponse(parsedResponse)
          setValidationQuestions(parsedResponse.validationQuestions || [])
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON:', parseError)
          // Se falhar o parse, tratar como resposta direta
          setAiResponse({
            answer: response,
            validationQuestions: []
          })
          setValidationQuestions([])
        }
      } else {
        // Resposta direta sem validação
        setAiResponse({
          answer: response,
          validationQuestions: []
        })
        setValidationQuestions([])
      }
    } catch (error) {
      console.error('Erro ao gerar resposta:', error)
      toast({
        title: "Erro",
        description: "Não foi possível processar sua pergunta. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuestionAnswer = (id: string, answer: string) => {
    setValidationQuestions(prev => 
      prev.map(q => q.id === id ? { ...q, answer } : q)
    )
  }

  const generateFinalAnswer = async () => {
    if (!aiResponse) return

    setIsLoading(true)
    setShowFinalAnswer(false)

    try {
      const answeredQuestions = validationQuestions.filter(q => q.answer && q.answer.trim())
      const unansweredRequired = validationQuestions.filter(q => q.required && (!q.answer || !q.answer.trim()))

      if (unansweredRequired.length > 0) {
        toast({
          title: "Atenção",
          description: "Por favor, responda todas as perguntas obrigatórias.",
          variant: "destructive"
        })
        return
      }

      const prompt = `
        Com base na resposta inicial e nas respostas fornecidas, forneça uma resposta final objetiva e argumentada.

        PERGUNTA ORIGINAL: ${question}

        RESPOSTA INICIAL: ${aiResponse.answer}

        RESPOSTAS FORNECIDAS:
        ${answeredQuestions.map(q => `• ${q.label}: ${q.answer}`).join('\n')}

        HISTÓRICO DA CONVERSA:
        ${conversationHistory.map((item, index) => 
          `Pergunta ${index + 1}: ${item.question}\nResposta: ${item.answer}${item.validations ? `\nValidações: ${item.validations.join(', ')}` : ''}`
        ).join('\n\n')}

        REGRAS FUNDAMENTAIS PARA RESPOSTA FINAL:
        1. SEMPRE ser conservador e seguir diretrizes oficiais
        2. PREFERIR abordagem gradual sobre agressiva
        3. NÃO recomendar tratamentos sem evidências sólidas
        4. Quando houver dúvida, ser mais conservador
        5. SEMPRE considerar risco-benefício
        6. SEMPRE deixar claro que é AUXÍLIO, não decisão final
        7. NUNCA alucinar ou inventar informações
        8. Se não souber algo, dizer que não sabe

        CRITÉRIOS ESPECÍFICOS:
        - Diabetes: Insulina inicial só se HbA1c > 9% com sintomas OU glicemia ≥ 300 mg/dL
        - Hipertensão: Iniciar com monoterapia, não dupla terapia
        - Antibióticos: Só usar quando há evidência clara de infecção
        - Anticoagulação: Seguir critérios estritos de indicação
        - Emergências: Sempre considerar estabilização antes de tratamentos definitivos

        Forneça uma resposta final que:
        1. Confirme ou ajuste a resposta inicial baseada nas informações fornecidas
        2. Explique o raciocínio clínico baseado em diretrizes oficiais
        3. Seja objetiva e prática para o plantonista
        4. Inclua alertas importantes se aplicável
        5. Considere o contexto do histórico da conversa
        6. SEMPRE inclua fontes oficiais relevantes (ex: SBD, ADA, ANVISA, etc.)
        7. Seja preciso e criterioso - não recomende tratamentos sem evidências sólidas
        8. SEGUIR ESTRITAMENTE as diretrizes oficiais
        9. PREFERIR abordagem conservadora e gradual
        10. Para diabetes: só indicar insulina inicial se HbA1c > 9% com sintomas OU glicemia ≥ 300 mg/dL

        Formato da resposta:
        - Resposta clara e objetiva
        - Raciocínio clínico baseado em diretrizes
        - Fontes oficiais (breve e relevante)
        - Alertas importantes se aplicável
        - Conduta conservadora quando houver dúvidas
        - SEMPRE incluir: "Esta é uma orientação baseada em diretrizes. A decisão final é do médico."

        Responda de forma direta e profissional.
      `

      const finalResponse = await callGeminiAPI(prompt)
      setAiResponse(prev => prev ? { ...prev, finalAnswer: finalResponse } : null)
      setShowFinalAnswer(true)
      
      // Salvar no histórico
      const validations = answeredQuestions.map(q => 
        `${q.label}: ${q.answer}`
      )
      setConversationHistory(prev => [...prev, {
        question,
        answer: finalResponse,
        validations
      }])
    } catch (error) {
      console.error('Erro ao gerar resposta final:', error)
      toast({
        title: "Erro",
        description: "Não foi possível gerar a resposta final. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatMarkdown = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
  }

  const resetForm = () => {
    setQuestion('')
    setAiResponse(null)
    setValidationQuestions([])
    setShowFinalAnswer(false)
    setConversationHistory([])
  }

  return (
    <Card className={className}>
      <CardHeader className="bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            🚀 IA Rápida Independente
            <Badge variant="secondary">Quick Assist</Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Input da pergunta */}
          <div>
            <Label htmlFor="question" className="text-sm font-medium">
              Faça sua pergunta médica:
            </Label>
            <Textarea
              id="question"
              placeholder="Ex: Posso usar dipirona em uma gestante de 32 semanas? Ou: Qual a dose de paracetamol para uma criança de 5 anos?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="mt-2"
              rows={3}
            />
          </div>

          {/* Botão de envio */}
          <Button 
            onClick={generateQuickResponse}
            disabled={isLoading || !question.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <MessageSquare className="w-4 h-4 mr-2" />
                Perguntar à IA
              </>
            )}
          </Button>

          {/* Resposta da IA */}
          {aiResponse && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <h4 className="font-semibold text-sm mb-2">🤖 Resposta da IA:</h4>
                <div 
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ 
                    __html: formatMarkdown(aiResponse.answer || '')
                  }}
                />
              </div>

              {/* Perguntas de validação (apenas se existirem) */}
              {validationQuestions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">❓ Responda as perguntas:</h4>
                  <div className="space-y-3">
                    {validationQuestions.map((question) => (
                      <div key={question.id} className="space-y-2">
                        <Label className="text-sm font-medium">
                          {question.label}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <Input
                          placeholder="Digite sua resposta..."
                          value={question.answer || ''}
                          onChange={(e) => handleQuestionAnswer(question.id, e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <Button 
                    onClick={generateFinalAnswer}
                    disabled={isLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando resposta final...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Enviar Respostas
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Resposta final */}
              {showFinalAnswer && aiResponse.finalAnswer && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    Resposta Final:
                  </h4>
                  <div 
                    className="text-sm prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMarkdown(aiResponse.finalAnswer || '')
                    }}
                  />
                </div>
              )}

              {/* Botão de reset */}
              <Button 
                onClick={resetForm}
                variant="ghost"
                size="sm"
                className="w-full"
              >
                Nova Pergunta
              </Button>
            </div>
          )}

          {/* Histórico da Conversa */}
          {conversationHistory.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
              <h4 className="font-semibold text-sm mb-3">📋 Histórico da Conversa:</h4>
              <div className="space-y-3">
                {conversationHistory.map((item, index) => (
                  <div key={index} className="p-3 bg-white rounded border">
                    <div className="font-medium text-sm mb-1">
                      <span className="text-blue-600">Pergunta {index + 1}:</span> {item.question}
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      {item.answer}
                    </div>
                    {item.validations && item.validations.length > 0 && (
                      <div className="text-xs text-gray-500">
                        <span className="font-medium">Informações:</span> {item.validations.join(', ')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 