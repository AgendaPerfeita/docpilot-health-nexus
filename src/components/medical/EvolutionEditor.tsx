import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RichTextEditor } from './RichTextEditor'
import { VitalSignsSection } from './VitalSignsSection'
import { PhysicalExamSection } from './PhysicalExamSection'
import { AIAssistantCard } from './AIAssistantCard'
import { RenalFunctionCalculator } from './RenalFunctionCalculator'
import { Save, FileText, User, Clock, AlertCircle, Printer, History } from 'lucide-react'
import { useProntuarios } from '@/hooks/useProntuarios'
import { useToast } from '@/hooks/use-toast'
import { useConsultationState } from '@/hooks/useConsultationState'

interface EvolutionEditorProps {
  pacienteId?: string
  prontuarioId?: string
  patientData?: any
  onSave?: (data: any) => void
}

export function EvolutionEditor({ 
  pacienteId, 
  prontuarioId, 
  patientData,
  onSave 
}: EvolutionEditorProps) {
  const { atualizarProntuario, criarProntuario } = useProntuarios()
  const { toast } = useToast()
  const { updateConsultationState } = useConsultationState(pacienteId)
  const [activeTab, setActiveTab] = useState('anamnese')
  const [isSaving, setIsSaving] = useState(false)
  
  const [evolutionData, setEvolutionData] = useState({
    queixa_principal: '',
    historia_doenca_atual: '',
    exame_fisico: '',
    hipotese_diagnostica: '',
    conduta: '',
    observacoes: ''
  })

  const [sinaisVitais, setSinaisVitais] = useState({
    peso: '',
    altura: '',
    imc: '',
    pa_sistolica: '',
    pa_diastolica: '',
    fc: '',
    temp: '',
    sat_o2: '',
    fr: '',
    hgt: ''
  })

  const [exameFisico, setExameFisico] = useState({
    geral: '',
    cardiovascular: '',
    respiratorio: '',
    abdominal: '',
    neurologico: '',
    pele: '',
    orl: '',
    outros: ''
  })

  const handleFieldChange = (field: string, value: string) => {
    setEvolutionData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Atualizar estado persistente
    updateConsultationState({
      prontuarioData: {
        ...evolutionData,
        [field]: value
      }
    })
  }

  const handleVitalSignChange = (field: string, value: string) => {
    setSinaisVitais(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePhysicalExamChange = (field: string, value: string) => {
    setExameFisico(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSuggestionApplied = (field: string, value: string) => {
    if (field === 'diagnostico') {
      handleFieldChange('hipotese_diagnostica', value)
    } else if (field === 'conduta') {
      handleFieldChange('conduta', value)
    } else if (field === 'examesComplementares') {
      handleFieldChange('observacoes', value)
    } else {
      handleFieldChange(field, value)
    }
  }

  const handleSave = async () => {
    if (!pacienteId) {
      toast({
        title: "Erro",
        description: "ID do paciente não encontrado",
        variant: "destructive"
      })
      return
    }

    setIsSaving(true)
    try {
      if (prontuarioId) {
        // Atualizar prontuário existente
        await atualizarProntuario(prontuarioId, evolutionData)
        toast({
          title: "Evolução salva",
          description: "As informações foram atualizadas com sucesso"
        })
      } else {
        // Criar novo prontuário
        const novoProntuario = await criarProntuario({
          paciente_id: pacienteId,
          data_atendimento: new Date().toISOString(),
          ...evolutionData
        })
        toast({
          title: "Evolução criada",
          description: "Nova evolução médica registrada com sucesso"
        })
      }
      
      if (onSave) {
        onSave(evolutionData)
      }
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar a evolução",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header com informações do paciente */}
      {patientData && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {patientData.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-lg truncate">{patientData.nome}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {patientData.idade.anos} anos
                    </span>
                    <span className="hidden sm:inline">Convênio: {patientData.convenio}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date().toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="sm:hidden text-sm text-muted-foreground mt-1">
                    Convênio: {patientData.convenio}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="gap-2 w-full sm:w-auto"
                  size="sm"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Salvando...' : 'Salvar'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none" size="sm">
                    <Printer className="h-4 w-4" />
                    <span className="hidden sm:inline">Imprimir</span>
                  </Button>
                  <Button variant="outline" className="gap-2 flex-1 sm:flex-none" size="sm">
                    <History className="h-4 w-4" />
                    <span className="hidden sm:inline">Histórico</span>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Assistant Card */}
      <AIAssistantCard
        patientData={patientData}
        vitalSigns={sinaisVitais}
        physicalExam={exameFisico}
        onSuggestionApplied={handleSuggestionApplied}
      />

      {/* Editor de Evolução */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-6">
        <div className="xl:col-span-2 order-2 xl:order-1">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evolução Médica
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <div className="overflow-x-auto">
                  <TabsList className="grid grid-cols-5 min-w-full h-auto">
                    <TabsTrigger value="anamnese" className="text-xs sm:text-sm py-2">
                      <span className="hidden sm:inline">Anamnese</span>
                      <span className="sm:hidden">Anam.</span>
                    </TabsTrigger>
                    <TabsTrigger value="sinais" className="text-xs sm:text-sm py-2">
                      <span className="hidden sm:inline">Sinais Vitais</span>
                      <span className="sm:hidden">Sinais</span>
                    </TabsTrigger>
                    <TabsTrigger value="exame" className="text-xs sm:text-sm py-2">
                      <span className="hidden sm:inline">Exame Físico</span>
                      <span className="sm:hidden">Exame</span>
                    </TabsTrigger>
                    <TabsTrigger value="diagnostico" className="text-xs sm:text-sm py-2">
                      <span className="hidden sm:inline">Diagnóstico</span>
                      <span className="sm:hidden">Diag.</span>
                    </TabsTrigger>
                    <TabsTrigger value="conduta" className="text-xs sm:text-sm py-2">
                      <span className="hidden sm:inline">Conduta</span>
                      <span className="sm:hidden">Cond.</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="anamnese" className="space-y-4">
                  <RichTextEditor
                    title="Queixa Principal"
                    value={evolutionData.queixa_principal}
                    onChange={(value) => handleFieldChange('queixa_principal', value)}
                    placeholder="Descreva a queixa principal do paciente..."
                    rows={3}
                    showAIFeatures={true}
                    patientData={patientData}
                  />
                  
                  <RichTextEditor
                    title="História da Doença Atual"
                    value={evolutionData.historia_doenca_atual}
                    onChange={(value) => handleFieldChange('historia_doenca_atual', value)}
                    placeholder="Detalhe a história da doença atual..."
                    rows={6}
                    showAIFeatures={true}
                    patientData={patientData}
                  />
                </TabsContent>

                <TabsContent value="sinais" className="space-y-4">
                  <VitalSignsSection
                    sinaisVitais={sinaisVitais}
                    onChange={handleVitalSignChange}
                    isRequired={false}
                  />
                </TabsContent>

                <TabsContent value="exame" className="space-y-4">
                  <PhysicalExamSection
                    exame={exameFisico}
                    onChange={handlePhysicalExamChange}
                    isRequired={false}
                  />
                </TabsContent>

                <TabsContent value="diagnostico" className="space-y-4">
                  <RichTextEditor
                    title="Hipótese Diagnóstica"
                    value={evolutionData.hipotese_diagnostica}
                    onChange={(value) => handleFieldChange('hipotese_diagnostica', value)}
                    placeholder="Descreva as hipóteses diagnósticas..."
                    rows={4}
                    showAIFeatures={true}
                    patientData={patientData}
                  />
                </TabsContent>

                <TabsContent value="conduta" className="space-y-4">
                  <RichTextEditor
                    title="Conduta Médica"
                    value={evolutionData.conduta}
                    onChange={(value) => handleFieldChange('conduta', value)}
                    placeholder="Descreva a conduta médica adotada..."
                    rows={5}
                    showAIFeatures={true}
                    patientData={patientData}
                  />
                  
                  <RichTextEditor
                    title="Observações"
                    value={evolutionData.observacoes}
                    onChange={(value) => handleFieldChange('observacoes', value)}
                    placeholder="Observações adicionais..."
                    rows={3}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Painel lateral com informações */}
        <div className="space-y-4 order-1 xl:order-2">
          {/* Card de status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Status do Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Última alteração:</span>
                <Badge variant="secondary">
                  {new Date().toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Status:</span>
                <Badge variant={prontuarioId ? "default" : "secondary"}>
                  {prontuarioId ? "Editando" : "Novo"}
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          {/* Calculadora de Função Renal */}
          <RenalFunctionCalculator 
            age={patientData?.idade?.anos}
            weight={sinaisVitais.peso}
            gender={patientData?.sexo}
          />
          
          {/* Informações do paciente */}
          {patientData && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Informações do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Nome:</span> {patientData.nome}
                </div>
                <div>
                  <span className="font-medium">Idade:</span> {patientData.idade.anos} anos
                </div>
                <div>
                  <span className="font-medium">Convênio:</span> {patientData.convenio}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}