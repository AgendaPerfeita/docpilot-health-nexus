import { useState } from "react"
import { User, FileText, Calendar, Upload, Download, Shield, Bell, MessageCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PatientPortalData {
  patient: {
    id: string
    name: string
    email: string
    phone: string
    birthDate: string
    cpf: string
    lastVisit: string
  }
  appointments: Array<{
    id: string
    date: string
    time: string
    professional: string
    service: string
    status: string
    notes?: string
  }>
  prescriptions: Array<{
    id: string
    date: string
    professional: string
    medications: string[]
    instructions: string
  }>
  exams: Array<{
    id: string
    name: string
    date: string
    type: string
    result?: string
    file?: string
  }>
  documents: Array<{
    id: string
    name: string
    type: string
    date: string
    size: string
  }>
}

const mockPatientData: PatientPortalData = {
  patient: {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-0001',
    birthDate: '1985-05-15',
    cpf: '123.456.789-00',
    lastVisit: '2024-01-10'
  },
  appointments: [
    {
      id: '1',
      date: '2024-01-15',
      time: '14:00',
      professional: 'Dr. João Silva',
      service: 'Consulta de Rotina',
      status: 'confirmado',
      notes: 'Exames de rotina solicitados'
    },
    {
      id: '2',
      date: '2024-01-10',
      time: '09:00',
      professional: 'Dr. João Silva',
      service: 'Consulta Inicial',
      status: 'realizado'
    }
  ],
  prescriptions: [
    {
      id: '1',
      date: '2024-01-10',
      professional: 'Dr. João Silva',
      medications: ['Paracetamol 500mg', 'Vitamina D3'],
      instructions: 'Paracetamol: 1 comprimido de 8/8h por 3 dias. Vitamina D3: 1 cápsula ao dia.'
    }
  ],
  exams: [
    {
      id: '1',
      name: 'Hemograma Completo',
      date: '2024-01-12',
      type: 'Laboratorial',
      result: 'Normal'
    },
    {
      id: '2',
      name: 'Raio-X Tórax',
      date: '2024-01-08',
      type: 'Imagem',
      result: 'Sem alterações'
    }
  ],
  documents: [
    {
      id: '1',
      name: 'Atestado Médico',
      type: 'PDF',
      date: '2024-01-10',
      size: '245 KB'
    },
    {
      id: '2',
      name: 'Prescrição Médica',
      type: 'PDF',
      date: '2024-01-10',
      size: '189 KB'
    }
  ]
}

export default function AreaPaciente() {
  const [patientData] = useState<PatientPortalData>(mockPatientData)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [message, setMessage] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200'
      case 'realizado': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Área do Paciente</h1>
          <p className="text-muted-foreground">Portal de acesso para pacientes</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" className="gap-2">
            <Shield className="h-4 w-4" />
            Enviar Link de Acesso
          </Button>
          <Button className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações Ativas
          </Button>
        </div>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Esta é uma simulação da área do paciente. Os pacientes acessam através de link seguro enviado por email/WhatsApp.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-foreground">2</span>
            </div>
            <p className="text-sm text-muted-foreground">Consultas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-foreground">1</span>
            </div>
            <p className="text-sm text-muted-foreground">Prescrições</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-purple-600" />
              <span className="text-2xl font-bold text-foreground">2</span>
            </div>
            <p className="text-sm text-muted-foreground">Exames</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-orange-600" />
              <span className="text-2xl font-bold text-foreground">2</span>
            </div>
            <p className="text-sm text-muted-foreground">Documentos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><strong>Nome:</strong> {patientData.patient.name}</div>
                <div><strong>Email:</strong> {patientData.patient.email}</div>
                <div><strong>Telefone:</strong> {patientData.patient.phone}</div>
                <div><strong>Data de Nascimento:</strong> {new Date(patientData.patient.birthDate).toLocaleDateString('pt-BR')}</div>
                <div><strong>Última Consulta:</strong> {new Date(patientData.patient.lastVisit).toLocaleDateString('pt-BR')}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Enviar Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Digite sua mensagem para a clínica..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button className="w-full">Enviar Mensagem</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultas">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.appointments.map((appointment) => (
                  <div key={appointment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {appointment.professional} - {appointment.service}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <strong>Observações:</strong> {appointment.notes}
                          </div>
                        )}
                      </div>
                      <Badge className={`${getStatusColor(appointment.status)} capitalize`}>
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescricoes">
          <Card>
            <CardHeader>
              <CardTitle>Prescrições Médicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.prescriptions.map((prescription) => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-foreground">
                          {new Date(prescription.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {prescription.professional}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <strong>Medicamentos:</strong>
                        <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                          {prescription.medications.map((med, index) => (
                            <li key={index}>{med}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <strong>Instruções:</strong>
                        <p className="text-sm text-muted-foreground mt-1">{prescription.instructions}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exames">
          <Card>
            <CardHeader>
              <CardTitle>Exames e Resultados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.exams.map((exam) => (
                  <div key={exam.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-foreground">{exam.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {exam.type} - {new Date(exam.date).toLocaleDateString('pt-BR')}
                        </div>
                        {exam.result && (
                          <div className="text-sm mt-1">
                            <strong>Resultado:</strong> <span className="text-green-600">{exam.result}</span>
                          </div>
                        )}
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientData.documents.map((doc) => (
                  <div key={doc.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-foreground">{doc.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doc.type} - {doc.size} - {new Date(doc.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Meu Perfil</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input id="name" value={patientData.patient.name} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={patientData.patient.email} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" value={patientData.patient.phone} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input id="cpf" value={patientData.patient.cpf} readOnly />
                </div>
              </div>

              <Button>Atualizar Dados</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}