// Moved from root to clinica-pro folder

import { useState } from "react"
import { User, FileText, Calendar, Upload, Download, MessageCircle, Send, FileImage, File, Plus, Search, Phone, Mail, Clock, AlertCircle } from "lucide-react"
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
  status: 'pending' | 'completed' | 'requested' | 'in_progress'
  file?: string
  requestedBy?: string
  observations?: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  resultDate?: string
  resultSummary?: string
  labName?: string
  cost?: number
  insurance?: string
  scheduledDate?: string
  notes?: string
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
    patientId: '1',
    from: 'doctor',
    content: 'Claro! Pode fazer exercícios leves como caminhada, natação ou yoga. Evite exercícios de alto impacto por enquanto.',
    timestamp: '2024-01-15T15:00:00',
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
    requestedBy: 'Dr. João Silva',
    observations: 'Avaliar possível pneumonia. Paciente com tosse há 5 dias e febre.',
    priority: 'high',
    labName: 'Laboratório Central',
    cost: 85.50,
    insurance: 'Unimed',
    scheduledDate: '2024-01-18',
    notes: 'Paciente deve estar em jejum de 12h'
  }
]

const AcompanhamentoPacientes = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [newMessage, setNewMessage] = useState('')
  const [examFilter, setExamFilter] = useState('all')

  const filteredPatients = mockPatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  )

  const patientMessages = selectedPatient
    ? mockMessages.filter(msg => msg.patientId === selectedPatient.id)
    : []

  const patientExams = selectedPatient
    ? mockExams.filter(exam => exam.patientId === selectedPatient.id)
    : []

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedPatient) return
    
    // Here you would implement the actual message sending logic
    console.log('Sending message:', newMessage, 'to patient:', selectedPatient.id)
    setNewMessage('')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'requested':
        return 'bg-blue-100 text-blue-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acompanhamento de Pacientes</h1>
          <p className="text-muted-foreground">
            Comunicação e monitoramento contínuo dos seus pacientes
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Clínica Pro
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPatients.filter(p => p.status === 'active').length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Não Lidas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPatients.reduce((total, patient) => total + patient.unreadMessages, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exames Pendentes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockPatients.reduce((total, patient) => total + patient.pendingExams, 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">92%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Pacientes
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar paciente..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPatient?.id === patient.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPatient(patient)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate">{patient.name}</h3>
                    <div className="flex items-center space-x-1">
                      {patient.unreadMessages > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {patient.unreadMessages}
                        </Badge>
                      )}
                      {patient.pendingExams > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          {patient.pendingExams}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm opacity-75 truncate">{patient.email}</p>
                  <p className="text-xs opacity-60">{patient.phone}</p>
                  {patient.lastMessage && (
                    <p className="text-xs opacity-60 mt-1 truncate">
                      {patient.lastMessage}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Patient Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {selectedPatient.name}
                      </CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedPatient.email}
                        </span>
                        <span className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedPatient.phone}
                        </span>
                      </div>
                    </div>
                    <Badge variant={selectedPatient.status === 'active' ? 'default' : 'secondary'}>
                      {selectedPatient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs */}
              <Tabs defaultValue="messages" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="messages">Mensagens</TabsTrigger>
                  <TabsTrigger value="exams">Exames</TabsTrigger>
                  <TabsTrigger value="files">Arquivos</TabsTrigger>
                </TabsList>

                {/* Messages Tab */}
                <TabsContent value="messages">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5" />
                        Conversas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 max-h-80 overflow-y-auto mb-4">
                        {patientMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex ${message.from === 'doctor' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] p-3 rounded-lg ${
                                message.from === 'doctor'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs opacity-60 mt-1">
                                {new Date(message.timestamp).toLocaleString('pt-BR')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2">
                        <Textarea
                          placeholder="Digite sua mensagem..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1"
                          rows={2}
                        />
                        <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Exams Tab */}
                <TabsContent value="exams">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5" />
                          Exames
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Select value={examFilter} onValueChange={setExamFilter}>
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">Todos</SelectItem>
                              <SelectItem value="pending">Pendentes</SelectItem>
                              <SelectItem value="completed">Concluídos</SelectItem>
                              <SelectItem value="requested">Solicitados</SelectItem>
                            </SelectContent>
                          </Select>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm">
                                <Plus className="h-4 w-4 mr-2" />
                                Solicitar Exame
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Solicitar Novo Exame</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="examName">Nome do Exame</Label>
                                  <Input id="examName" placeholder="Ex: Hemograma completo" />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="examNotes">Observações</Label>
                                  <Textarea id="examNotes" placeholder="Observações para o exame..." />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="examPriority">Prioridade</Label>
                                  <Select>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecione a prioridade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="low">Baixa</SelectItem>
                                      <SelectItem value="medium">Média</SelectItem>
                                      <SelectItem value="high">Alta</SelectItem>
                                      <SelectItem value="urgent">Urgente</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button className="w-full">Solicitar Exame</Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {patientExams.map((exam) => (
                          <div key={exam.id} className="p-4 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-medium">{exam.name}</h3>
                                <Badge className={getPriorityColor(exam.priority)}>
                                  {exam.priority}
                                </Badge>
                              </div>
                              <Badge className={getStatusColor(exam.status)}>
                                {exam.status}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>Solicitado em: {new Date(exam.date).toLocaleDateString('pt-BR')}</p>
                              {exam.requestedBy && <p>Por: {exam.requestedBy}</p>}
                              {exam.labName && <p>Laboratório: {exam.labName}</p>}
                              {exam.scheduledDate && (
                                <p>Agendado para: {new Date(exam.scheduledDate).toLocaleDateString('pt-BR')}</p>
                              )}
                              {exam.observations && <p>Obs: {exam.observations}</p>}
                            </div>
                            <div className="flex items-center space-x-2 mt-3">
                              {exam.file && (
                                <Button variant="outline" size="sm">
                                  <Download className="h-4 w-4 mr-2" />
                                  Baixar Resultado
                                </Button>
                              )}
                              <Button variant="outline" size="sm">
                                <Calendar className="h-4 w-4 mr-2" />
                                Reagendar
                              </Button>
                            </div>
                          </div>
                        ))}

                        {patientExams.length === 0 && (
                          <div className="text-center py-8">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Nenhum exame encontrado</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Files Tab */}
                <TabsContent value="files">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <File className="h-5 w-5" />
                          Arquivos
                        </CardTitle>
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Arquivo
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <File className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-4">Nenhum arquivo enviado</p>
                        <Button variant="outline">
                          <Upload className="h-4 w-4 mr-2" />
                          Fazer Upload
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Selecione um paciente para ver os detalhes
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default AcompanhamentoPacientes