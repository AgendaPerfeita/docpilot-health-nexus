
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle, X } from 'lucide-react'

interface DiagnosticItem {
  data: string
  medico: string
  duracao: string
  tipo: string
}

interface PatientData {
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

interface PatientSummaryProps {
  patientData: PatientData
  showWelcomeBanner: boolean
  setShowWelcomeBanner: (show: boolean) => void
}

export function PatientSummary({ patientData, showWelcomeBanner, setShowWelcomeBanner }: PatientSummaryProps) {
  return (
    <div className="p-6 space-y-6">
      {showWelcomeBanner && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">SmartDoc de cara nova!</h3>
                <p className="text-sm text-blue-700 mb-3">
                  Você está testando o novo SmartDoc, feito para deixar o seu atendimento moderno, prático e ainda mais inteligente.
                </p>
                <Button variant="outline" size="sm" className="mr-2">
                  Voltar para a versão anterior
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowWelcomeBanner(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dados do Paciente */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Informações Básicas</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Primeira consulta:</strong> {patientData.primeiraConsulta}</div>
                <div><strong>Convênio:</strong> {patientData.convenio}</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Alertas Importantes</h4>
              {patientData.antecedentes.alergias && (
                <div className="flex items-start gap-2 p-2 bg-red-50 rounded text-sm">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  <div>
                    <strong>Alergias:</strong> {patientData.antecedentes.alergias}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Antecedentes */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-semibold mb-4">Antecedentes</h4>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(patientData.antecedentes).map(([key, value]) => (
              <div key={key} className="border rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                <div className="text-sm text-gray-600">
                  {value || (
                    <span className="text-gray-400 italic">Inserir informação</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Últimos Diagnósticos */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold">Últimos diagnósticos</h4>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Baixar PDF</Button>
              <Button variant="outline" size="sm">Imprimir</Button>
            </div>
          </div>
          <div className="space-y-3">
            {patientData.ultimosDiagnosticos && patientData.ultimosDiagnosticos.map((item: DiagnosticItem, index: number) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.data} - Por: {item.medico} - {item.duracao}</span>
                </div>
                <div className="font-medium">{item.tipo}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
