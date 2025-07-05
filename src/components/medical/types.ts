
export interface DiagnosticItem {
  data: string
  medico: string
  duracao: string
  tipo: string
}

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
  ultimosDiagnosticos: DiagnosticItem[]
}

export interface MedicalLayoutProps {
  children: React.ReactNode
  patientData: any
  onStartConsultation: () => void
  onFinishConsultation: () => void
  isConsultationActive: boolean
}
