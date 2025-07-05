
import React from 'react'
import { Clock, Play, Pause } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PatientHeaderProps {
  patientData: {
    nome: string
    idade: { anos: number; meses: number; dias: number }
    convenio: string
  }
  timer: {
    isRunning: boolean
    isPaused: boolean
    formattedTime: string
    productivity: 'alta' | 'média' | 'baixa'
    estimatedCompletion: string
    resume: () => void
    pause: () => void
  }
}

export function PatientHeader({ patientData, timer }: PatientHeaderProps) {
  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
          {patientData.nome.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{patientData.nome}</h3>
          <p className="text-sm text-gray-600">
            {patientData.idade.anos} anos, {patientData.idade.meses} meses, {patientData.idade.dias} dias
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span>Convênio: <strong>{patientData.convenio}</strong></span>
      </div>
      
      {timer.isRunning && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-mono text-lg font-semibold text-blue-900">
                {timer.formattedTime}
              </span>
            </div>
            <div className="flex gap-1">
              {timer.isPaused ? (
                <Button size="sm" variant="outline" onClick={timer.resume}>
                  <Play className="w-3 h-3" />
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={timer.pause}>
                  <Pause className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <Badge variant={timer.productivity === 'alta' ? 'default' : timer.productivity === 'média' ? 'secondary' : 'destructive'}>
              Produtividade {timer.productivity}
            </Badge>
            <span className="text-gray-600">
              Est: {timer.estimatedCompletion}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
