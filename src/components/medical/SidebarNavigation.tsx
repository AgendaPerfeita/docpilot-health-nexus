
import React from 'react'
import { Button } from "@/components/ui/button"
import { FileText, TestTube, Pill, Image } from 'lucide-react'

interface SidebarNavigationProps {
  activeSection: string
  setActiveSection: (section: string) => void
  isConsultationActive: boolean
}

const menuItems = [
  { id: 'resumo', label: 'Resumo', icon: FileText },
  { id: 'acompanhamentos', label: 'Tabela de acompanhamentos', icon: FileText },
  { id: 'atendimento', label: 'Atendimento', icon: FileText, active: true },
  { id: 'exames', label: 'Exames e procedimentos', icon: TestTube },
  { id: 'prescricoes', label: 'Prescrições', icon: Pill },
  { id: 'documentos', label: 'Documentos e atestados', icon: FileText },
  { id: 'imagens', label: 'Imagens e anexos', icon: Image }
]

export function SidebarNavigation({ activeSection, setActiveSection, isConsultationActive }: SidebarNavigationProps) {
  return (
    <div className="flex-1 p-4">
      {(!isConsultationActive && activeSection === 'resumo') ? (
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-left"
            onClick={() => setActiveSection('resumo')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Resumo
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveSection(item.id)}
            >
              <item.icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
