
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

    // Renderizar outras seções quando necessário
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeSection === 'acompanhamentos' && 'Tabela de acompanhamentos'}
            {activeSection === 'exames' && 'Exames e procedimentos'}
            {activeSection === 'prescricoes' && 'Prescrições'}
            {activeSection === 'documentos' && 'Documentos e atestados'}
            {activeSection === 'imagens' && 'Imagens e anexos'}
          </h3>
          <p className="text-gray-600">Esta seção está em desenvolvimento</p>
        </div>
      </div>
    )
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
