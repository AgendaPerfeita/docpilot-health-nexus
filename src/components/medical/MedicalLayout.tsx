
import React, { useState } from 'react'
import { useTimer } from '@/hooks/useTimer'
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
  const [activeSection, setActiveSection] = useState('resumo')
  const [finalizationOpen, setFinalizationOpen] = useState(false)
  const [signatureType, setSignatureType] = useState<'none' | 'installed' | 'cloud'>('none')

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
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-screen">
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
      return children
    }

    if (activeSection === 'acompanhamentos') {
      return <FollowUpTable pacienteId={pacienteId} />
    }

    if (activeSection === 'exames') {
      return <ExamsAndProcedures />
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
    <div className="flex h-screen bg-gray-50">
      {renderSidebar()}
      
      <div className="flex-1 overflow-auto">
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
