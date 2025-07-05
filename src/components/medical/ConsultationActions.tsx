
import React from 'react'
import { Play, Square } from 'lucide-react'
import { Button } from "@/components/ui/button"

interface ConsultationActionsProps {
  isConsultationActive: boolean
  onStartConsultation: () => void
  onFinishConsultation: () => void
}

export function ConsultationActions({ isConsultationActive, onStartConsultation, onFinishConsultation }: ConsultationActionsProps) {
  return (
    <div className="p-4 border-t">
      {!isConsultationActive ? (
        <Button 
          onClick={onStartConsultation}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          <Play className="w-4 h-4 mr-2" />
          Iniciar Atendimento
        </Button>
      ) : (
        <Button 
          onClick={onFinishConsultation}
          variant="destructive"
          className="w-full"
          size="lg"
        >
          <Square className="w-4 h-4 mr-2" />
          Finalizar Atendimento
        </Button>
      )}
    </div>
  )
}
