
import React, { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Play, Pause, Square, User, MapPin, Calendar, AlertCircle, FileText, TestTube, Pill, Image, X, Check } from 'lucide-react'
import { useTimer } from '@/hooks/useTimer'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

interface MedicalLayoutProps {
  children: React.ReactNode
  patientData: any
  onStartConsultation: () => void
  onFinishConsultation: () => void
  isConsultationActive: boolean
}

const mockPatientData = {
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

export function MedicalLayout({ children, patientData = mockPatientData, onStartConsultation, onFinishConsultation, isConsultationActive }: MedicalLayoutProps) {
  const timer = useTimer()
  const [activeSection, setActiveSection] = useState('resumo')
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true)
  const [finalizationOpen, setFinalizationOpen] = useState(false)
  const [signatureType, setSignatureType] = useState<'none' | 'installed' | 'cloud'>('none')

  const menuItems = [
    { id: 'resumo', label: 'Resumo', icon: FileText },
    { id: 'acompanhamentos', label: 'Tabela de acompanhamentos', icon: FileText },
    { id: 'atendimento', label: 'Atendimento', icon: FileText, active: true },
    { id: 'exames', label: 'Exames e procedimentos', icon: TestTube },
    { id: 'prescricoes', label: 'Prescrições', icon: Pill },
    { id: 'documentos', label: 'Documentos e atestados', icon: FileText },
    { id: 'imagens', label: 'Imagens e anexos', icon: Image }
  ]

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
      {/* Header do Paciente */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
            {patientData.nome.split(' ').map(n => n[0]).join('').substring(0, 2)}
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

      {/* Menu de Navegação */}
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

      {/* Botão de Ação */}
      <div className="p-4 border-t">
        {!isConsultationActive ? (
          <Button 
            onClick={handleStartConsultation}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar Atendimento
          </Button>
        ) : (
          <Button 
            onClick={handleFinishConsultation}
            variant="destructive"
            className="w-full"
            size="lg"
          >
            <Square className="w-4 h-4 mr-2" />
            Finalizar Atendimento
          </Button>
        )}
      </div>
    </div>
  )

  const renderResumoContent = () => (
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
            {patientData.ultimosDiagnosticos.map((item, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                  <Calendar className="w-4 h-4" />
                  {item.data} - Por: {item.medico} - {item.duracao}
                </div>
                <div className="font-medium">{item.tipo}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="flex h-screen bg-gray-50">
      {renderSidebar()}
      
      <div className="flex-1 overflow-auto">
        {activeSection === 'resumo' && !isConsultationActive ? (
          renderResumoContent()
        ) : (
          children
        )}
      </div>

      {/* Sheet para Finalização */}
      <Sheet open={finalizationOpen} onOpenChange={setFinalizationOpen}>
        <SheetContent side="right" className="w-96">
          <SheetHeader>
            <SheetTitle>Finalizar atendimento</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 space-y-6">
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Atenção!</p>
                  <p className="text-yellow-700 mt-1">
                    Ao finalizar um atendimento, você não poderá alterá-lo novamente. Deseja prosseguir?
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Assinar com:</h4>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="signature"
                    value="none"
                    checked={signatureType === 'none'}
                    onChange={(e) => setSignatureType(e.target.value as any)}
                  />
                  <span>Não assinar</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="signature"
                    value="installed"
                    checked={signatureType === 'installed'}
                    onChange={(e) => setSignatureType(e.target.value as any)}
                  />
                  <div>
                    <div>Certificado instalado</div>
                    <div className="text-sm text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Certificado válido
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="signature"
                    value="cloud"
                    checked={signatureType === 'cloud'}
                    onChange={(e) => setSignatureType(e.target.value as any)}
                  />
                  <span>Certificado na nuvem</span>
                </label>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setFinalizationOpen(false)}
              >
                Cancelar
              </Button>
              <Button 
                className="flex-1 bg-red-600 hover:bg-red-700"
                onClick={confirmFinish}
              >
                Finalizar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
