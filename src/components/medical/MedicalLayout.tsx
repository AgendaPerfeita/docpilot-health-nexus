
import React, { useState, useEffect } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { useConsultationState } from '@/hooks/useConsultationState'
import { PatientHeader } from './PatientHeader'
import { SidebarNavigation } from './SidebarNavigation'
import { ConsultationActions } from './ConsultationActions'
import { PatientSummary } from './PatientSummary'
import { FinalizationSheet } from './FinalizationSheet'
import { FollowUpTable } from './FollowUpTable'
import { ExamsAndProcedures } from './ExamsAndProcedures'
import { PrescriptionsSection } from './PrescriptionsSection'
import { DocumentsSection } from './DocumentsSection'
import { ImagesSection } from './ImagesSection'
import { EvolutionEditor } from './EvolutionEditor'
import { MedicalLayoutProps, PatientData } from './types'

export function MedicalLayout({ 
  children, 
  patientData, 
  onStartConsultation, 
  onFinishConsultation, 
  isConsultationActive,
  pacienteId,
  prontuarioId
}: MedicalLayoutProps & { pacienteId?: string; prontuarioId?: string }) {
  const timer = useTimer()
  const { updateConsultationState } = useConsultationState(pacienteId)
  const [activeSection, setActiveSection] = useState('resumo')
  const [finalizationOpen, setFinalizationOpen] = useState(false)
  const [signatureType, setSignatureType] = useState<'none' | 'installed' | 'cloud'>('none')

  // Garante que o timer sempre inicia quando a consulta está ativa
  useEffect(() => {
    if (isConsultationActive && !timer.isRunning) {
      timer.start();
    }
    if (!isConsultationActive && timer.isRunning) {
      timer.stop();
    }
  }, [isConsultationActive]);

  // Atualizar o estado persistente com o tempo decorrido
  useEffect(() => {
    if (isConsultationActive && timer.isRunning) {
      updateConsultationState({
        elapsedSeconds: timer.seconds
      });
    }
  }, [timer.seconds, isConsultationActive]);

  const handleStartConsultation = () => {
    timer.start()
    onStartConsultation()
    setActiveSection('atendimento')
  }

  const handleFinishConsultation = () => {
    setFinalizationOpen(true)
  }

  const confirmFinish = () => {
    timer.stop()
    onFinishConsultation()
    setFinalizationOpen(false)
  }

  const renderSidebar = () => (
    <div className="hidden lg:block w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
      <PatientHeader patientData={patientData} timer={timer} />
      <SidebarNavigation 
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isConsultationActive={isConsultationActive}
      />
      <ConsultationActions
        isConsultationActive={isConsultationActive}
        onStartConsultation={handleStartConsultation}
        onFinishConsultation={handleFinishConsultation}
      />
    </div>
  )

  const renderContent = () => {
    if (activeSection === 'resumo') {
      return (
        <PatientSummary 
          patientData={patientData}
          showWelcomeBanner={false}
          setShowWelcomeBanner={() => {}}
        />
      )
    }

    if (activeSection === 'atendimento') {
      return (
        <EvolutionEditor 
          pacienteId={pacienteId}
          prontuarioId={prontuarioId}
          patientData={patientData}
        />
      )
    }

    if (activeSection === 'acompanhamentos') {
      return <FollowUpTable pacienteId={pacienteId} />
    }

    if (activeSection === 'exames') {
      return <ExamsAndProcedures pacienteId={pacienteId} />
    }

    if (activeSection === 'prescricoes') {
      return <PrescriptionsSection pacienteId={pacienteId} prontuarioId={prontuarioId} />
    }

    if (activeSection === 'documentos') {
      return <DocumentsSection pacienteId={pacienteId} />
    }

    if (activeSection === 'imagens') {
      return <ImagesSection pacienteId={pacienteId} />
    }

    return null
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50">
      {/* Mobile Header com navegação */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          {patientData && (
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {patientData.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate">{patientData.nome}</h3>
                <div className="text-xs text-muted-foreground">
                  {patientData.idade.anos} anos • {patientData.convenio}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Mobile Navigation */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {[
            { id: 'resumo', label: 'Resumo' },
            { id: 'atendimento', label: 'Atendimento' },
            { id: 'acompanhamentos', label: 'Acompanhamentos' },
            { id: 'exames', label: 'Exames' },
            { id: 'prescricoes', label: 'Prescrições' },
            { id: 'documentos', label: 'Documentos' },
            { id: 'imagens', label: 'Imagens' }
          ].map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {renderSidebar()}
      
      <div className="flex-1 overflow-auto" id="medical-content">
        {renderContent()}
      </div>

      <FinalizationSheet
        finalizationOpen={finalizationOpen}
        setFinalizationOpen={setFinalizationOpen}
        signatureType={signatureType}
        setSignatureType={setSignatureType}
        confirmFinish={confirmFinish}
      />
    </div>
  )
}
