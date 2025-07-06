
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, AlertTriangle, Pill, TestTube, FileText } from "lucide-react"
import { callGeminiAPI } from "@/lib/gemini"

interface AIAssistantCardProps {
  patientData: any
  vitalSigns: any
  physicalExam: any
  onSuggestionApplied: (field: string, value: string) => void
}

export function AIAssistantCard({ patientData, vitalSigns, physicalExam, onSuggestionApplied }: AIAssistantCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiInput, setAiInput] = useState({
    symptoms: "",
    age: "",
    sex: "",
    isPregnant: "",
    mainComplaint: "",
    currentMedications: ""
  })
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [analysisType, setAnalysisType] = useState("complete")

  const calculateRiskScores = () => {
    const scores = []
    
    // qSOFA Score para sepse
    let qSOFA = 0
    if (parseFloat(vitalSigns.fr) >= 22) qSOFA++
    if (parseFloat(vitalSigns.pa_sistolica) <= 100) qSOFA++
    // Glasgow seria necessário para o terceiro critério
    
    if (qSOFA >= 0) {
      scores.push({
        name: "qSOFA (Sepse)",
        score: qSOFA,
        risk: qSOFA >= 2 ? 'alto' : qSOFA === 1 ? 'moderado' : 'baixo',
        recommendation: qSOFA >= 2 ? "Alto risco de sepse - considerar UTI" : "Baixo risco de sepse"
      })
    }

    // Critérios de hipertensão
    const paS = parseFloat(vitalSigns.pa_sistolica)
    const paD = parseFloat(vitalSigns.pa_diastolica)
    if (paS > 0 && paD > 0) {
      let htRisk = 'baixo'
      let htRec = "Pressão normal"
      
      if (paS >= 180 || paD >= 110) {
        htRisk = 'alto'
        htRec = "Crise hipertensiva - tratamento imediato"
      } else if (paS >= 140 || paD >= 90) {
        htRisk = 'moderado'
        htRec = "Hipertensão arterial - seguimento"
      }
      
      scores.push({
        name: "Pressão Arterial",
        score: `${paS}/${paD}`,
        risk: htRisk,
        recommendation: htRec
      })
    }

    return scores
  }

  const assessSeverityCriteria = () => {
    const paS = parseFloat(vitalSigns.pa_sistolica)
    const fc = parseFloat(vitalSigns.fc)
    const temp = parseFloat(vitalSigns.temp)
    const fr = parseFloat(vitalSigns.fr)
    
    return {
      sepsis: (temp > 38 || temp < 36) && (fc > 90) && (fr > 20),
      hemodynamicInstability: paS < 90 || fc > 120,
      acuteDeterioration: temp > 39 || paS < 100 || fc > 130,
      internationRecommended: paS < 90 || temp > 39.5 || fr > 25
    }
  }

  const formatAIResponse = (response: string) => {
    return response
      // Substituir títulos com emojis por versões em negrito
      .replace(/🩺\s*HIPÓTESE DIAGNÓSTICA:/g, '**🩺 HIPÓTESE DIAGNÓSTICA:**')
      .replace(/⚡\s*CLASSIFICAÇÃO DE RISCO:/g, '**⚡ CLASSIFICAÇÃO DE RISCO:**')
      .replace(/💊\s*CONDUTA TERAPÊUTICA:/g, '**💊 CONDUTA TERAPÊUTICA:**')
      .replace(/💊\s*AJUSTE DE DOSE POR PESO\/IMC\/RIM:/g, '**💊 AJUSTE DE DOSE POR PESO/IMC/RIM:**')
      .replace(/🧪\s*EXAMES COMPLEMENTARES:/g, '**🧪 EXAMES COMPLEMENTARES:**')
      .replace(/⚠️\s*CRITÉRIOS DE INTERNAÇÃO:/g, '**⚠️ CRITÉRIOS DE INTERNAÇÃO:**')
      .replace(/📋\s*SEGUIMENTO:/g, '**📋 SEGUIMENTO:**')
      .replace(/🆔\s*CID-10 SUGERIDO:/g, '**🆔 CID-10 SUGERIDO:**')
      // Substituir asteriscos por hífens no início das linhas
      .replace(/^\s*\*\s+/gm, '- ')
      // Remover asteriscos duplos no meio das frases (exceto os títulos já convertidos)
      .replace(/(?<!\*)\*\*(?!\*)/g, '**')
      // Limpar linhas vazias excessivas
      .replace(/\n\s*\n\s*\n/g, '\n\n')
  }

  const generateAdvancedAISuggestion = async () => {
    if (!aiInput.symptoms.trim()) return
    
    setIsLoading(true)
    
    try {
      const riskScores = calculateRiskScores()
      const severityCriteria = assessSeverityCriteria()
      
      const prompt = `
        Como assistente médico especializado, analise os dados completos do paciente e forneça uma avaliação clínica abrangente:

        DADOS DO PACIENTE:
        - Idade: ${aiInput.age}
        - Sexo: ${aiInput.sex}
        ${aiInput.sex === "Feminino" && aiInput.isPregnant ? `- Gestante: ${aiInput.isPregnant}` : ""}
        - Medicamentos atuais: ${aiInput.currentMedications}
        - Alergias: ${patientData.alergias || 'Não informado'}
        - Antecedentes: ${patientData.antecedentes || 'Não informado'}

        SINAIS VITAIS:
        - PA: ${vitalSigns.pa_sistolica}/${vitalSigns.pa_diastolica} mmHg
        - FC: ${vitalSigns.fc} bpm
        - Temp: ${vitalSigns.temp}°C
        - FR: ${vitalSigns.fr} irpm
        - Sat O2: ${vitalSigns.sat_o2}%
        - HGT: ${vitalSigns.hgt} mg/dL
        - Peso: ${vitalSigns.peso}kg, Altura: ${vitalSigns.altura}cm, IMC: ${vitalSigns.imc}

        EXAME FÍSICO:
        - Geral: ${physicalExam.geral}
        - Cardiovascular: ${physicalExam.cardiovascular}
        - Respiratório: ${physicalExam.respiratorio}
        - Abdominal: ${physicalExam.abdominal}
        - Neurológico: ${physicalExam.neurologico}

        QUEIXA PRINCIPAL: ${aiInput.mainComplaint}
        SINTOMAS: ${aiInput.symptoms}

        ESCORES DE RISCO CALCULADOS:
        ${riskScores.map(score => `- ${score.name}: ${score.score} (${score.risk})`).join('\n')}

        CRITÉRIOS DE GRAVIDADE:
        - Sepse: ${severityCriteria.sepsis ? 'SIM' : 'NÃO'}
        - Instabilidade hemodinâmica: ${severityCriteria.hemodynamicInstability ? 'SIM' : 'NÃO'}
        - Risco de deterioração: ${severityCriteria.acuteDeterioration ? 'SIM' : 'NÃO'}

        Forneça análise estruturada EXATAMENTE neste formato com formatação limpa:

        🩺 HIPÓTESE DIAGNÓSTICA:
        [Liste os possíveis diagnósticos diferenciais em ordem de probabilidade usando hífens (-) ao invés de asteriscos]

        ⚡ CLASSIFICAÇÃO DE RISCO:
        [Análise dos escores calculados e recomendações usando hífens (-)]

        💊 CONDUTA TERAPÊUTICA:
        [Tratamento inicial com doses ajustadas por peso/idade/função renal usando hífens (-)]

        💊 AJUSTE DE DOSE POR PESO/IMC/RIM:
        [Alertas específicos sobre ajustes de medicação necessários usando hífens (-)]

        🧪 EXAMES COMPLEMENTARES:
        [Exames prioritários baseados na hipótese diagnóstica usando hífens (-)]

        ⚠️ CRITÉRIOS DE INTERNAÇÃO:
        [Avaliação da necessidade de internação baseada nos critérios de gravidade usando hífens (-)]

        📋 SEGUIMENTO:
        [Orientações de retorno e sinais de alerta usando hífens (-)]

        🆔 CID-10 SUGERIDO:
        [Código(s) CID-10 mais apropriado(s) usando hífens (-)]

        IMPORTANTE: Use sempre hífens (-) ao invés de asteriscos (*) para listagens. Mantenha formatação profissional e limpa.
        Seja preciso, baseado em evidências e considere as particularidades do paciente.
      `
      
      const response = await callGeminiAPI(prompt)
      const formattedResponse = formatAIResponse(response)
      setAiSuggestion(formattedResponse)
    } catch (error) {
      console.error('Erro ao gerar sugestão com IA:', error)
      setAiSuggestion('❌ Erro ao gerar sugestão. Verifique sua conexão e tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  const extractAndApplySuggestion = (sectionName: string, fieldName: string) => {
    if (!aiSuggestion) return
    
    const regex = new RegExp(`\\*\\*${sectionName}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\s*\\*\\*[🩺⚡💊🧪⚠️📋🆔]+|$)`, 'i')
    const match = aiSuggestion.match(regex)
    
    if (match && match[1]) {
      const content = match[1].trim()
      onSuggestionApplied(fieldName, content)
    }
  }

  const riskScores = calculateRiskScores()
  const severityCriteria = assessSeverityCriteria()

  return (
    <Card className="mb-6 border-blue-200">
      <CardHeader className="bg-blue-50 p-3 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            🤖 Assistente de IA Médica Avançado
            <Badge variant="secondary" className="hidden sm:inline-flex">Powered by Gemini</Badge>
            {(severityCriteria.sepsis || severityCriteria.hemodynamicInstability) && (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            )}
          </CardTitle>
          <Badge variant="secondary" className="sm:hidden self-start">Powered by Gemini</Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-3 sm:p-6">
        {!isOpen ? (
          <Button onClick={() => setIsOpen(true)} className="w-full" size="lg">
            Abrir Assistente de IA
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Inputs básicos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="ai_age">Idade</Label>
                <Input
                  id="ai_age"
                  placeholder="35"
                  value={aiInput.age}
                  onChange={(e) => setAiInput(prev => ({...prev, age: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="ai_sex">Sexo</Label>
                <Select value={aiInput.sex} onValueChange={(value) => setAiInput(prev => ({...prev, sex: value}))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {aiInput.sex === "Feminino" && (
                <div>
                  <Label htmlFor="ai_pregnant">Gestante?</Label>
                  <Select value={aiInput.isPregnant} onValueChange={(value) => setAiInput(prev => ({...prev, isPregnant: value}))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Não">Não</SelectItem>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não sei">Não sei</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="ai_main_complaint">Queixa Principal</Label>
              <Input
                id="ai_main_complaint"
                placeholder="Ex: Dor no peito há 2 horas"
                value={aiInput.mainComplaint}
                onChange={(e) => setAiInput(prev => ({...prev, mainComplaint: e.target.value}))}
              />
            </div>

            <div>
              <Label htmlFor="ai_symptoms">Sintomas Detalhados</Label>
              <Textarea
                id="ai_symptoms"
                placeholder="Descreva os sintomas completos, evolução, fatores de melhora/piora, sintomas associados..."
                value={aiInput.symptoms}
                onChange={(e) => setAiInput(prev => ({...prev, symptoms: e.target.value}))}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="ai_medications">Medicamentos em Uso</Label>
              <Input
                id="ai_medications"
                placeholder="Ex: Losartana 50mg 1x/dia, Metformina 850mg 2x/dia"
                value={aiInput.currentMedications}
                onChange={(e) => setAiInput(prev => ({...prev, currentMedications: e.target.value}))}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                onClick={generateAdvancedAISuggestion} 
                disabled={isLoading || !aiInput.symptoms.trim()}
                className="flex-1"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4 mr-2" />
                    Gerar Análise Completa
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setIsOpen(false)} className="sm:w-auto">
                Fechar
              </Button>
            </div>

            {aiSuggestion && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3 gap-3">
                  <h4 className="font-semibold text-lg">📋 Análise da IA</h4>
                  <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                    <Button size="sm" variant="outline" onClick={() => extractAndApplySuggestion('🩺 HIPÓTESE DIAGNÓSTICA', 'diagnostico')} className="flex-1 sm:flex-none">
                      <FileText className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Aplicar </span>Diagnóstico
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => extractAndApplySuggestion('💊 CONDUTA TERAPÊUTICA', 'conduta')} className="flex-1 sm:flex-none">
                      <Pill className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Aplicar </span>Conduta
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => extractAndApplySuggestion('🧪 EXAMES COMPLEMENTARES', 'examesComplementares')} className="flex-1 sm:flex-none">
                      <TestTube className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline">Aplicar </span>Exames
                    </Button>
                  </div>
                </div>
                <div className="whitespace-pre-wrap text-sm prose prose-sm max-w-none" 
                     dangerouslySetInnerHTML={{ __html: aiSuggestion.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                
                {/* Classificação de Risco Automática */}
                <div className="mt-6 p-4 border-t bg-blue-50 rounded-b-lg">
                  <h5 className="font-semibold text-sm mb-3">📋 Classificação de Risco Automática</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {riskScores.map((score, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm font-medium">{score.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{score.score}</span>
                          <Badge variant={score.risk === 'alto' ? 'destructive' : score.risk === 'moderado' ? 'default' : 'secondary'}>
                            {score.risk.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4">
                    <h6 className="font-medium text-sm mb-2">Critérios de Gravidade</h6>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={severityCriteria.sepsis ? "text-red-600" : "text-green-600"}>
                          {severityCriteria.sepsis ? "❌" : "✅"}
                        </span>
                        <span>Sinais de Sepse</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={severityCriteria.hemodynamicInstability ? "text-red-600" : "text-green-600"}>
                          {severityCriteria.hemodynamicInstability ? "❌" : "✅"}
                        </span>
                        <span>Instabilidade Hemodinâmica</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={severityCriteria.acuteDeterioration ? "text-red-600" : "text-green-600"}>
                          {severityCriteria.acuteDeterioration ? "❌" : "✅"}
                        </span>
                        <span>Risco de Deterioração</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={severityCriteria.internationRecommended ? "text-red-600" : "text-green-600"}>
                          {severityCriteria.internationRecommended ? "❌" : "✅"}
                        </span>
                        <span>Recomendação de Internação</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
