import { useState } from "react"
import { User, FileText, Calendar, Upload, Download, Shield, Bell, MessageCircle, Send, Paperclip, FileImage, File, Plus, Search, Clock, MapPin, Phone, Mail, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Consultation {
  id: string
  date: string
  doctor: string
  specialty: string
  status: 'completed' | 'scheduled' | 'cancelled'
  notes?: string
}

interface Prescription {
  id: string
  date: string
  doctor: string
  medications: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>
  status: 'active' | 'completed'
}

interface Exam {
  id: string
  name: string
  date: string
  status: 'scheduled' | 'completed' | 'pending'
  result?: string
  file?: string
}

interface Document {
  id: string
  name: string
  type: 'prescription' | 'certificate' | 'report' | 'other'
  date: string
  file: string
}

interface Message {
  id: string
  doctorId: string
  doctorName: string
  clinicName: string
  from: 'patient' | 'doctor'
  content: string
  timestamp: string
  read: boolean
}

interface Doctor {
  id: string
  name: string
  specialty: string
  clinicName: string
  lastMessage?: string
  lastMessageDate?: string
  unreadCount: number
}

const mockConsultations: Consultation[] = [
  {
    id: '1',
    date: '2024-01-09',
    doctor: 'Dr. João Silva',
    specialty: 'Clínico Geral',
    status: 'completed',
    notes: 'Consulta de rotina. Paciente apresentou melhora dos sintomas.'
  },
  {
    id: '2',
    date: '2024-01-15',
    doctor: 'Dr. Maria Santos',
    specialty: 'Cardiologia',
    status: 'scheduled'
  }
]

const mockPrescriptions: Prescription[] = [
  {
    id: '1',
    date: '2024-01-09',
    doctor: 'Dr. João Silva',
    medications: [
      {
        name: 'Paracetamol',
        dosage: '500mg',
        frequency: '6/6 horas',
        duration: '7 dias'
      },
      {
        name: 'Ibuprofeno',
        dosage: '400mg',
        frequency: '8/8 horas',
        duration: '5 dias'
      }
    ],
    status: 'active'
  }
]

const mockExams: Exam[] = [
  {
    id: '1',
    name: 'Hemograma Completo',
    date: '2024-01-10',
    status: 'completed',
    result: 'Normal',
    file: 'hemograma_ana_silva.pdf'
  },
  {
    id: '2',
    name: 'Raio-X Tórax',
    date: '2024-01-12',
    status: 'scheduled'
  }
]

const mockDocuments: Document[] = [
  {
    id: '1',
    name: 'Prescrição - Dr. João Silva',
    type: 'prescription',
    date: '2024-01-09',
    file: 'prescricao_joao_silva.pdf'
  },
  {
    id: '2',
    name: 'Atestado Médico',
    type: 'certificate',
    date: '2024-01-09',
    file: 'atestado_medico.pdf'
  }
]

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    specialty: 'Clínico Geral',
    clinicName: 'Clínica Saúde Total',
    lastMessage: 'Como você está se sentindo após a última consulta?',
    lastMessageDate: '2024-01-15T10:30:00',
    unreadCount: 2
  },
  {
    id: '2',
    name: 'Dra. Maria Santos',
    specialty: 'Cardiologia',
    clinicName: 'Centro Cardiológico',
    lastMessage: 'Seus exames estão prontos. Pode vir buscar.',
    lastMessageDate: '2024-01-14T16:45:00',
    unreadCount: 0
  },
  {
    id: '3',
    name: 'Dr. Carlos Oliveira',
    specialty: 'Ortopedia',
    clinicName: 'Instituto de Ortopedia',
    lastMessage: 'Vamos agendar sua próxima consulta de acompanhamento.',
    lastMessageDate: '2024-01-12T14:20:00',
    unreadCount: 1
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    doctorId: '1',
    doctorName: 'Dr. João Silva',
    clinicName: 'Clínica Saúde Total',
    from: 'doctor',
    content: 'Olá! Como você está se sentindo após a última consulta?',
    timestamp: '2024-01-15T10:30:00',
    read: false
  },
  {
    id: '2',
    doctorId: '1',
    doctorName: 'Dr. João Silva',
    clinicName: 'Clínica Saúde Total',
    from: 'patient',
    content: 'Estou bem, doutor. Só queria saber se posso fazer exercícios físicos.',
    timestamp: '2024-01-15T14:20:00',
    read: true
  },
  {
    id: '3',
    doctorId: '1',
    doctorName: 'Dr. João Silva',
    clinicName: 'Clínica Saúde Total',
    from: 'doctor',
    content: 'Sim, pode fazer exercícios leves. Evite apenas atividades muito intensas por enquanto.',
    timestamp: '2024-01-15T16:45:00',
    read: false
  },
  {
    id: '4',
    doctorId: '2',
    doctorName: 'Dra. Maria Santos',
    clinicName: 'Centro Cardiológico',
    from: 'doctor',
    content: 'Seus exames estão prontos. Pode vir buscar.',
    timestamp: '2024-01-14T16:45:00',
    read: true
  },
  {
    id: '5',
    doctorId: '3',
    doctorName: 'Dr. Carlos Oliveira',
    clinicName: 'Instituto de Ortopedia',
    from: 'doctor',
    content: 'Vamos agendar sua próxima consulta de acompanhamento.',
    timestamp: '2024-01-12T14:20:00',
    read: false
  }
]

export default function AreaPaciente() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [newMessage, setNewMessage] = useState('')
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [isChatDialogOpen, setIsChatDialogOpen] = useState(false)
  const [doctors] = useState<Doctor[]>(mockDoctors)
  const [messages, setMessages] = useState<Message[]>(mockMessages)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    
    // Simular envio de mensagem
    console.log('Mensagem enviada:', newMessage)
    setNewMessage('')
    setIsMessageDialogOpen(false)
  }

  const handleSendMessageToDoctor = () => {
    if (!newMessage.trim() || !selectedDoctor) return
    
    const message: Message = {
      id: Date.now().toString(),
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      clinicName: selectedDoctor.clinicName,
      from: 'patient',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setMessages([...messages, message])
    setNewMessage('')
  }

  const getDoctorMessages = (doctorId: string) => {
    return messages.filter(m => m.doctorId === doctorId).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) return <File className="h-4 w-4 text-red-500" />
    if (fileName.includes('.jpg') || fileName.includes('.png')) return <FileImage className="h-4 w-4 text-blue-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <Badge variant="default">Concluído</Badge>
      case 'scheduled':
        return <Badge variant="secondary">Agendado</Badge>
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Área do Paciente</h1>
          <p className="text-muted-foreground">Bem-vindo(a), Ana Silva</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="prescricoes">Prescrições</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Prescrições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Exames</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {doctors.reduce((total, doctor) => total + doctor.unreadCount, 0)}
                </div>
                <div className="text-xs text-muted-foreground">não lidas</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Próximas Consultas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockConsultations.filter(c => c.status === 'scheduled').map(consultation => (
                    <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{consultation.doctor}</div>
                        <div className="text-sm text-muted-foreground">{consultation.specialty}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(consultation.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {getStatusBadge(consultation.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Atividades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">Consulta realizada</div>
                      <div className="text-xs text-muted-foreground">09/01/2024</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">Exame disponível</div>
                      <div className="text-xs text-muted-foreground">10/01/2024</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium">Mensagem recebida</div>
                      <div className="text-xs text-muted-foreground">12/01/2024</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="consultas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Consultas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Médico</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockConsultations.map(consultation => (
                    <TableRow key={consultation.id}>
                      <TableCell>
                        {new Date(consultation.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{consultation.doctor}</TableCell>
                      <TableCell>{consultation.specialty}</TableCell>
                      <TableCell>{getStatusBadge(consultation.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescricoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Prescrições Médicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {mockPrescriptions.map(prescription => (
                  <div key={prescription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="font-medium">{prescription.doctor}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(prescription.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      {getStatusBadge(prescription.status)}
                    </div>
                    <div className="space-y-2">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <div>
                            <div className="font-medium">{med.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {med.dosage} - {med.frequency} - {med.duration}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exames" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exames</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exame</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Resultado</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockExams.map(exam => (
                    <TableRow key={exam.id}>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>
                        {new Date(exam.date).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>{getStatusBadge(exam.status)}</TableCell>
                      <TableCell>{exam.result || '-'}</TableCell>
                      <TableCell>
                        {exam.file && (
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockDocuments.map(document => (
                  <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getFileIcon(document.file)}
                      <div>
                        <div className="font-medium">{document.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(document.date).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mensagens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversas com Médicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctors.map(doctor => (
                  <div key={doctor.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => { setSelectedDoctor(doctor); setIsChatDialogOpen(true); }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">{doctor.name}</div>
                        <div className="text-sm text-muted-foreground">{doctor.specialty}</div>
                        <div className="text-sm text-muted-foreground">{doctor.clinicName}</div>
                        {doctor.lastMessage && (
                          <div className="text-sm text-muted-foreground mt-1">
                            {doctor.lastMessage.length > 50 ? doctor.lastMessage.substring(0, 50) + '...' : doctor.lastMessage}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {doctor.unreadCount > 0 && (
                        <Badge variant="destructive">{doctor.unreadCount}</Badge>
                      )}
                      {doctor.lastMessageDate && (
                        <div className="text-xs text-muted-foreground">
                          {new Date(doctor.lastMessageDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Dialog open={isChatDialogOpen} onOpenChange={setIsChatDialogOpen}>
            <DialogContent className="max-w-2xl h-[600px] flex flex-col">
              <DialogHeader>
                <DialogTitle>{selectedDoctor?.name}</DialogTitle>
                <DialogDescription>
                  {selectedDoctor?.specialty} - {selectedDoctor?.clinicName}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-y-auto space-y-4 p-4 border rounded-lg">
                {selectedDoctor && getDoctorMessages(selectedDoctor.id).map(message => (
                  <div key={message.id} className={`flex ${message.from === 'patient' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] p-3 rounded-lg ${
                      message.from === 'patient' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.from === 'patient' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {new Date(message.timestamp).toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 p-4 border-t">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessageToDoctor()}
                />
                <Button onClick={handleSendMessageToDoctor}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="perfil" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Nome</Label>
                  <div className="text-sm">Ana Silva</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <div className="text-sm">ana.silva@email.com</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <div className="text-sm">(11) 99999-0001</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data de Nascimento</Label>
                  <div className="text-sm">14/05/1985</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Última Consulta</Label>
                  <div className="text-sm">09/01/2024</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações Médicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Tipo Sanguíneo</Label>
                  <div className="text-sm">O+</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Alergias</Label>
                  <div className="text-sm">Penicilina</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Condições Crônicas</Label>
                  <div className="text-sm">Hipertensão</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Medicamentos em Uso</Label>
                  <div className="text-sm">Losartana 50mg</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}