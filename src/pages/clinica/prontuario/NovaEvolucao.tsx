
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Save, Calendar, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { VitalSignsSection } from "@/components/medical/VitalSignsSection"
import { PhysicalExamSection } from "@/components/medical/PhysicalExamSection"
import { RiskAssessmentCard } from "@/components/medical/RiskAssessmentCard"
import { AIAssistantCard } from "@/components/medical/AIAssistantCard"
import { MedicalLayout } from "@/components/medical/MedicalLayout"

const mockPaciente = {
  nome: "Maria Silva dos Santos",
  idade: 45,
  sexo: "Feminino",
  alergias: "Dipirona, Penicilina",
  antecedentes: "Hipertensão arterial, Diabetes mellitus tipo 2",
  medicamentos: "Losartana 50mg 1x/dia, Metformina 850mg 2x/dia"
}

export default function NovaEvolucao() {
  const navigate = useNavigate()
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isConsultationActive, setIsConsultationActive] = useState(false)

  const [form, setForm] = useState({
    paciente: mockPaciente.nome,
    data: new Date().toISOString().slice(0, 10),
    queixa: "",
    historia: "",
    diagnostico: "",
    conduta: "",
    examesComplementares: "",
    observacoes: ""
  })

  const [sinaisVitais, setSinaisVitais] = useState({
    peso: "",
    altura: "",
    imc: "",
    pa_sistolica: "",
    pa_diastolica: "",
    fc: "",
    temp: "",
    sat_o2: "",
    fr: ""
  })

  const [exameFisico, setExameFisico] = useState({
    geral: "",
    cardiovascular: "",
    respiratorio: "",
    abdominal: "",
    neurologico: "",
    pele: "",
    orl: "",
    outros: ""
  })

  const calculateRiskScores = () => {
    const scores = []
    
    let qSOFA = 0
    if (parseFloat(sinaisVitais.fr) >= 22) qSOFA++
    if (parseFloat(sinaisVitais.pa_sistolica) <= 100) qSOFA++
    
    if (qSOFA >= 0) {
      scores.push({
        name: "qSOFA (Sepse)",
        score: qSOFA,
        risk: qSOFA >= 2 ? 'alto' : qSOFA === 1 ? 'moderado' : 'baixo',
        recommendation: qSOFA >= 2 ? "Alto risco de sepse - considerar UTI" : "Baixo risco de sepse"
      })
    }

    const paS = parseFloat(sinaisVitais.pa_sistolica)
    const paD = parseFloat(sinaisVitais.pa_diastolica)
    if (paS > 0 && paD > 0) {
      let htRisk = 'baixo'
      let htRec = "Pressão normal"
      
      if (paS >= 180 || paD >= 110) {
        htRisk = 'alto'
        htRec = "Crise hipertensiva - tratamento imediato"
      } else if (paS >= 140 || paD >= 90) {
        htRisk = 'moderado'
        htRec = "Hipertensão arterial - acompanhamento"
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
    const paS = parseFloat(sinaisVitais.pa_sistolica)
    const fc = parseFloat(sinaisVitais.fc)
    const temp = parseFloat(sinaisVitais.temp)
    const fr = parseFloat(sinaisVitais.fr)
    
    return {
      sepsis: (temp > 38 || temp < 36) && (fc > 90) && (fr > 20),
      hemodynamicInstability: paS < 90 || fc > 120,
      acuteDeterioration: temp > 39 || paS < 100 || fc > 130,
      internationRecommended: paS < 90 || temp > 39.5 || fr > 25
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setTouched({
      paciente: true, data: true, queixa: true, historia: true, 
      diagnostico: true, conduta: true, examesComplementares: true, observacoes: true
    })
    alert('Evolução salva com sucesso!')
  }

  const handleVitalSignsChange = (field: string, value: string) => {
    setSinaisVitais(prev => ({ ...prev, [field]: value }))
  }

  const handlePhysicalExamChange = (field: string, value: string) => {
    setExameFisico(prev => ({ ...prev, [field]: value }))
  }

  const handleAISuggestionApplied = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleStartConsultation = () => {
    setIsConsultationActive(true)
  }

  const handleFinishConsultation = () => {
    setIsConsultationActive(false)
    navigate('/prontuario')
  }

  const riskScores = calculateRiskScores()
  const severityCriteria = assessSeverityCriteria()

  const renderConsultationContent = () => (
    <div className="container mx-auto px-6 py-6 max-w-6xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados básicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados do Atendimento
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paciente">Paciente *</Label>
              <Input
                id="paciente"
                value={form.paciente}
                onChange={(e) => setForm(prev => ({ ...prev, paciente: e.target.value }))}
                className={touched.paciente && !form.paciente ? 'border-red-500' : ''}
              />
            </div>
            <div>
              <Label htmlFor="data">Data do Atendimento *</Label>
              <Input
                id="data"
                type="date"
                value={form.data}
                onChange={(e) => setForm(prev => ({ ...prev, data: e.target.value }))}
                className={touched.data && !form.data ? 'border-red-500' : ''}
              />
            </div>
          </CardContent>
        </Card>

        {/* Sinais Vitais */}
        <VitalSignsSection
          sinaisVitais={sinaisVitais}
          onChange={handleVitalSignsChange}
          isRequired={true}
        />

        {/* Assistente de IA */}
        <AIAssistantCard
          patientData={mockPaciente}
          vitalSigns={sinaisVitais}
          physicalExam={exameFisico}
          onSuggestionApplied={handleAISuggestionApplied}
        />

        {/* Classificação de Risco */}
        {(riskScores.length > 0 || Object.values(severityCriteria).some(Boolean)) && (
          <RiskAssessmentCard
            riskScores={riskScores}
            severityCriteria={severityCriteria}
          />
        )}

        {/* Queixa Principal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Queixa Principal *
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva a queixa principal do paciente..."
              value={form.queixa}
              onChange={(e) => setForm(prev => ({ ...prev, queixa: e.target.value }))}
              className={touched.queixa && !form.queixa ? 'border-red-500' : ''}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* História da Doença Atual */}
        <Card>
          <CardHeader>
            <CardTitle>História da Doença Atual *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva a evolução dos sintomas, fatores de melhora/piora, sintomas associados..."
              value={form.historia}
              onChange={(e) => setForm(prev => ({ ...prev, historia: e.target.value }))}
              className={touched.historia && !form.historia ? 'border-red-500' : ''}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Exame Físico Dirigido */}
        <PhysicalExamSection
          exame={exameFisico}
          onChange={handlePhysicalExamChange}
          isRequired={true}
        />

        {/* Hipótese Diagnóstica */}
        <Card>
          <CardHeader>
            <CardTitle>Hipótese Diagnóstica *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva as hipóteses diagnósticas principais e diferenciais..."
              value={form.diagnostico}
              onChange={(e) => setForm(prev => ({ ...prev, diagnostico: e.target.value }))}
              className={touched.diagnostico && !form.diagnostico ? 'border-red-500' : ''}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Conduta Terapêutica */}
        <Card>
          <CardHeader>
            <CardTitle>Conduta Terapêutica *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Descreva o plano terapêutico, medicações, orientações..."
              value={form.conduta}
              onChange={(e) => setForm(prev => ({ ...prev, conduta: e.target.value }))}
              className={touched.conduta && !form.conduta ? 'border-red-500' : ''}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Exames Complementares */}
        <Card>
          <CardHeader>
            <CardTitle>Exames Complementares *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Liste os exames solicitados e justificativas..."
              value={form.examesComplementares}
              onChange={(e) => setForm(prev => ({ ...prev, examesComplementares: e.target.value }))}
              className={touched.examesComplementares && !form.examesComplementares ? 'border-red-500' : ''}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Observações */}
        <Card>
          <CardHeader>
            <CardTitle>Observações e Seguimento *</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Orientações de retorno, sinais de alerta, seguimento..."
              value={form.observacoes}
              onChange={(e) => setForm(prev => ({ ...prev, observacoes: e.target.value }))}
              className={touched.observacoes && !form.observacoes ? 'border-red-500' : ''}
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Botão para salvar (apenas quando ativo) */}
        <div className="flex justify-end">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            Salvar Evolução
          </Button>
        </div>
      </form>
    </div>
  )

  return (
    <MedicalLayout
      patientData={mockPaciente}
      onStartConsultation={handleStartConsultation}
      onFinishConsultation={handleFinishConsultation}
      isConsultationActive={isConsultationActive}
    >
      {isConsultationActive && renderConsultationContent()}
    </MedicalLayout>
  )
}
