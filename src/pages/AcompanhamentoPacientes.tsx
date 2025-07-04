import { useState } from "react"
import { User, FileText, Calendar, Upload, Download, MessageCircle, Send, FileImage, File, Plus, Search, Phone, Mail, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  lastMessage?: string
  lastMessageDate?: string
  unreadMessages: number
  pendingExams: number
  status: 'active' | 'inactive'
}

interface Message {
  id: string
  patientId: string
  from: 'patient' | 'doctor'
  content: string
  timestamp: string
  read: boolean
}

interface Exam {
  id: string
  patientId: string
  name: string
  type: 'uploaded' | 'requested'
  date: string
  status: 'pending' | 'completed' | 'requested'
  file?: string
  requestedBy?: string
}

const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@email.com',
    phone: '(11) 99999-0001',
    lastMessage: 'Estou bem, doutor. Só queria saber se posso fazer exercícios físicos.',
    lastMessageDate: '2024-01-15T14:20:00',
    unreadMessages: 2,
    pendingExams: 1,
    status: 'active'
  },
  {
    id: '2',
    name: 'Carlos Santos',
    email: 'carlos.santos@email.com',
    phone: '(11) 99999-0002',
    lastMessage: 'Doutor, anexei o resultado do hemograma.',
    lastMessageDate: '2024-01-14T16:30:00',
    unreadMessages: 0,
    pendingExams: 0,
    status: 'active'
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    phone: '(11) 99999-0003',
    unreadMessages: 1,
    pendingExams: 2,
    status: 'active'
  }
]

const mockMessages: Message[] = [
  {
    id: '1',
    patientId: '1',
    from: 'doctor',
    content: 'Olá! Como você está se sentindo após a última consulta?',
    timestamp: '2024-01-15T10:30:00',
    read: true
  },
  {
    id: '2',
    patientId: '1',
    from: 'patient',
    content: 'Estou bem, doutor. Só queria saber se posso fazer exercícios físicos.',
    timestamp: '2024-01-15T14:20:00',
    read: false
  },
  {
    id: '3',
    patientId: '2',
    from: 'patient',
    content: 'Doutor, anexei o resultado do hemograma.',
    timestamp: '2024-01-14T16:30:00',
    read: true
  }
]

const mockExams: Exam[] = [
  {
    id: '1',
    patientId: '1',
    name: 'Raio-X Tórax',
    type: 'requested',
    date: '2024-01-12',
    status: 'requested',
    requestedBy: 'Dr. João Silva'
  },
  {
    id: '2',
    patientId: '2',
    name: 'Hemograma Completo',
    type: 'uploaded',
    date: '2024-01-10',
    status: 'completed',
    file: 'hemograma_carlos.pdf'
  },
  {
    id: '3',
    patientId: '3',
    name: 'Glicemia em Jejum',
    type: 'requested',
    date: '2024-01-11',
    status: 'requested',
    requestedBy: 'Dr. João Silva'
  }
]

export default function AcompanhamentoPacientes() {
  const [activeTab, setActiveTab] = useState('patients')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [isRequestExamDialogOpen, setIsRequestExamDialogOpen] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [patients] = useState<Patient[]>(mockPatients)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [exams, setExams] = useState<Exam[]>(mockExams)

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedPatient) return
    
    const message: Message = {
      id: Date.now().toString(),
      patientId: selectedPatient.id,
      from: 'doctor',
      content: newMessage,
      timestamp: new Date().toISOString(),
      read: false
    }
    
    setMessages([...messages, message])
    setNewMessage('')
    setIsMessageDialogOpen(false)
  }

  const getPatientMessages = (patientId: string) => {
    return messages.filter(m => m.patientId === patientId)
  }

  const getPatientExams = (patientId: string) => {
    return exams.filter(e => e.patientId === patientId)
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.includes('.pdf')) return <File className="h-4 w-4 text-red-500" />
    if (fileName.includes('.jpg') || fileName.includes('.png')) return <FileImage className="h-4 w-4 text-blue-500" />
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Acompanhamento de Pacientes</h1>
          <p className="text-muted-foreground">Gerencie comunicação e exames dos pacientes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pacientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="patients" className="gap-2">
            <User className="h-4 w-4" />
            Pacientes
          </TabsTrigger>
          <TabsTrigger value="messages" className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Mensagens
          </TabsTrigger>
          <TabsTrigger value="exams" className="gap-2">
            <FileText className="h-4 w-4" />
            Exames
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Última Mensagem</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="font-medium">{patient.name}</div>
                            {patient.unreadMessages > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {patient.unreadMessages} nova{patient.unreadMessages > 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {patient.phone}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {patient.lastMessage ? (
                          <div className="max-w-xs">
                            <p className="text-sm truncate">{patient.lastMessage}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(patient.lastMessageDate!).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Nenhuma mensagem</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                          {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsMessageDialogOpen(true)
                            }}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(patient)
                              setIsRequestExamDialogOpen(true)
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mensagens Recentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.slice(0, 10).map((message) => {
                  const patient = patients.find(p => p.id === message.patientId)
                  return (
                    <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{patient?.name}</span>
                          <Badge variant={message.from === 'patient' ? 'outline' : 'default'}>
                            {message.from === 'patient' ? 'Paciente' : 'Médico'}
                          </Badge>
                          {!message.read && message.from === 'patient' && (
                            <Badge variant="destructive" className="text-xs">Nova</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{message.content}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(message.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedPatient(patient || null)
                          setIsMessageDialogOpen(true)
                        }}
                      >
                        Responder
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Exames Anexados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exams.filter(e => e.type === 'uploaded').map((exam) => {
                    const patient = patients.find(p => p.id === exam.patientId)
                    return (
                      <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getFileIcon(exam.file || '')}
                          <div>
                            <p className="font-medium">{exam.name}</p>
                            <p className="text-sm text-muted-foreground">{patient?.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(exam.date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Exames Solicitados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {exams.filter(e => e.type === 'requested').map((exam) => {
                    const patient = patients.find(p => p.id === exam.patientId)
                    return (
                      <div key={exam.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{exam.name}</p>
                          <p className="text-sm text-muted-foreground">{patient?.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(exam.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <Badge variant={exam.status === 'completed' ? 'default' : 'secondary'}>
                          {exam.status === 'completed' ? 'Concluído' : 'Pendente'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog para enviar mensagem */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Mensagem para {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-2">
              {selectedPatient && getPatientMessages(selectedPatient.id).map((message) => (
                <div key={message.id} className={`flex ${message.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-2 rounded-lg text-sm ${
                    message.from === 'doctor' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea 
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para solicitar exame */}
      <Dialog open={isRequestExamDialogOpen} onOpenChange={setIsRequestExamDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Solicitar Exame para {selectedPatient?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Exame</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o exame" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hemograma">Hemograma Completo</SelectItem>
                  <SelectItem value="glicemia">Glicemia em Jejum</SelectItem>
                  <SelectItem value="colesterol">Perfil Lipídico</SelectItem>
                  <SelectItem value="raio-x">Raio-X Tórax</SelectItem>
                  <SelectItem value="ecg">Eletrocardiograma</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Observações</Label>
              <Textarea placeholder="Observações sobre o exame..." />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRequestExamDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsRequestExamDialogOpen(false)}>
                Solicitar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 