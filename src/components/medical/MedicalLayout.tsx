
import React, { useState } from 'react'
import { useTimer } from '@/hooks/useTimer'
import { PatientHeader } from './PatientHeader'
import { SidebarNavigation } from './SidebarNavigation'
import { ConsultationActions } from './ConsultationActions'
import { PatientSummary } from './PatientSummary'
import { FinalizationSheet } from './FinalizationSheet'
import { MedicalLayoutProps, PatientData } from './types'

const mockPatientData: PatientData = {
  nome: "Maria Silva dos Santos", 
  idade: { anos: 45, meses: 3, dias: 9 },
  convenio: "Particular",
  primeiraConsulta: "04/07/2025",
  antecedentes: {
    clinicos: null,
    cirurgicos: null,
    familiares: null,
    habitos: null,
    alergias: "Dipirona, Penicilina",
    medicamentos: "Losartana 50mg 1x/dia"
  },
  ultimosDiagnosticos: [
    {
      data: "04/07/2025",
      medico: "Thiago Anver",
      duracao: "10 minutos",
      tipo: "Atendimento"
    }
  ]
}

export function MedicalLayout({ 
  children, 
  patientData = mockPatientData, 
  onStartConsultation, 
  onFinishConsultation, 
  isConsultationActive 
}: MedicalLayoutProps) {
  const timer = useTimer()
  const [activeSection, setActiveSection] = useState('resumo')
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
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

  return (
    <div className="flex h-screen bg-gray-50">
      {renderSidebar()}
      
      <div className="flex-1 overflow-auto">
        {activeSection === 'resumo' && !isConsultationActive ? (
          <PatientSummary 
            patientData={patientData}
            showWelcomeBanner={showWelcomeBanner}
            setShowWelcomeBanner={setShowWelcomeBanner}
          />
        ) : (
          children
        )}
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
