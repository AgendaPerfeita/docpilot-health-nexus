
export interface PatientData {
  nome: string
  idade: { anos: number; meses: number; dias: number }
  convenio: string
  primeiraConsulta: string
  antecedentes: {
    clinicos: string | null
    cirurgicos: string | null
    familiares: string | null
    habitos: string | null
    alergias: string | null
    medicamentos: string | null
  }
  ultimosDiagnosticos: Array<{
    data: string
    medico: string
    duracao: string
    tipo: string
  }>
}

export interface MedicalLayoutProps {
  children?: React.ReactNode
  patientData: PatientData  // Removed optional and default
  onStartConsultation: () => void
  onFinishConsultation: () => void
  isConsultationActive: boolean
}
