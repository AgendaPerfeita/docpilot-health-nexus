
import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle } from 'lucide-react'

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

export function PatientSummary({ patientData }: PatientSummaryProps) {
  return (
    <div className="p-6 space-y-6">
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  História Patológica Pregressa (HPP)
                </div>
                <div className="text-sm text-gray-600">
                  {patientData.antecedentes.clinicos === "Nega" ? (
                    <span className="text-gray-600 font-medium">Nega</span>
                  ) : patientData.antecedentes.clinicos ? (
                    patientData.antecedentes.clinicos
                  ) : (
                    <span className="text-gray-400 italic">Inserir informação</span>
                  )}
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Antec. Cirúrgicos
                </div>
                <div className="text-sm text-gray-600">
                  {patientData.antecedentes.cirurgicos === "Nega" ? (
                    <span className="text-gray-600 font-medium">Nega</span>
                  ) : patientData.antecedentes.cirurgicos ? (
                    patientData.antecedentes.cirurgicos
                  ) : (
                    <span className="text-gray-400 italic">Inserir informação</span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  História Familiar (HF)
                </div>
                <div className="text-sm text-gray-600">
                  {patientData.antecedentes.familiares === "Nega" ? (
                    <span className="text-gray-600 font-medium">Nega</span>
                  ) : patientData.antecedentes.familiares ? (
                    patientData.antecedentes.familiares
                  ) : (
                    <span className="text-gray-400 italic">Inserir informação</span>
                  )}
                </div>
              </div>
              <div className="border rounded-lg p-3">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  Hábitos de Vida
                </div>
                <div className="text-sm text-gray-600">
                  {patientData.antecedentes.habitos === "Nega" ? (
                    <span className="text-gray-600 font-medium">Nega</span>
                  ) : patientData.antecedentes.habitos ? (
                    patientData.antecedentes.habitos
                  ) : (
                    <span className="text-gray-400 italic">Inserir informação</span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-3 bg-red-50 border-red-200">
                <div className="text-sm font-medium text-red-700 mb-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Alergias e Reações Adversas
                </div>
                <div className="text-sm text-red-600 font-medium">
                  {patientData.antecedentes.alergias === "Nega" ? (
                    <span className="text-red-600 font-medium">Nega</span>
                  ) : patientData.antecedentes.alergias ? (
                    patientData.antecedentes.alergias
                  ) : (
                    <span className="text-gray-400 italic font-normal">Inserir informação</span>
                  )}
                </div>
              </div>
              <div className="border rounded-lg p-3 min-h-[80px]">
                <div className="text-sm font-medium text-gray-700 mb-2">
                  Medicamentos em uso
                </div>
                <div className="text-sm text-gray-600">
                  {patientData.antecedentes.medicamentos === "Nega" ? (
                    <span className="text-gray-600 font-medium">Nega</span>
                  ) : patientData.antecedentes.medicamentos ? (
                    <div className="space-y-1">
                      {patientData.antecedentes.medicamentos.split('\n').map((medicamento, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-blue-600 font-medium flex-shrink-0">•</span>
                          <span className="break-words leading-relaxed">{medicamento}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Inserir informação</span>
                  )}
                </div>
              </div>
            </div>
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
          <div className="space-y-3 min-h-[40px] flex items-center text-muted-foreground">
            {patientData.ultimosDiagnosticos && patientData.ultimosDiagnosticos.length > 0 ? (
              patientData.ultimosDiagnosticos.map((item: DiagnosticItem, index: number) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>{String(item.data)} - Por: {String(item.medico)} - {String(item.duracao)}</span>
                  </div>
                  <div className="font-medium">{String(item.tipo)}</div>
                </div>
              ))
            ) : (
              <span>Nenhum diagnóstico registrado.</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
