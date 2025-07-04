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
  },
  {
    id: '4',
    patientId: '2',
    from: 'patient',
    content: 'Doutor, anexei o resultado do hemograma.',
    timestamp: '2024-01-14T16:30:00',
    read: true
  },
  {
    id: '5',
    patientId: '2',
    from: 'doctor',
    content: 'Obrigado! Vou analisar os resultados e entrar em contato em breve.',
    timestamp: '2024-01-14T17:00:00',
    read: true
  },
  {
    id: '6',
    patientId: '3',
    from: 'doctor',
    content: 'Olá! Lembre-se da consulta de retorno amanhã às 14h.',
    timestamp: '2024-01-13T09:00:00',
    read: false
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
    scheduledDate: '2024-01-15',
    notes: 'Paciente deve estar em jejum de 4 horas'
  },
  {
    id: '2',
    patientId: '1',
    name: 'Eletrocardiograma',
    type: 'uploaded',
    date: '2024-01-13',
    status: 'completed',
    file: 'ecg_ana.pdf',
    requestedBy: 'Dr. João Silva',
    observations: 'Avaliação cardiológica de rotina',
    priority: 'medium',
    labName: 'CardioLab',
    cost: 120.00,
    insurance: 'Unimed',
    resultDate: '2024-01-13',
    resultSummary: 'Ritmo sinusal, FC 72 bpm, eixo normal. Sem alterações significativas.',
    notes: 'Exame normal'
  },
  {
    id: '3',
    patientId: '2',
    name: 'Hemograma Completo',
    type: 'uploaded',
    date: '2024-01-10',
    status: 'completed',
    file: 'hemograma_carlos.pdf',
    requestedBy: 'Dr. João Silva',
    observations: 'Avaliação de anemia e infecção',
    priority: 'medium',
    labName: 'LabExame',
    cost: 45.00,
    insurance: 'Amil',
    resultDate: '2024-01-10',
    resultSummary: 'Hemoglobina 12.5 g/dL, leucócitos 8.500/mm³. Valores normais.',
    notes: 'Resultados dentro da normalidade'
  },
  {
    id: '4',
    patientId: '2',
    name: 'Glicemia em Jejum',
    type: 'requested',
    date: '2024-01-11',
    status: 'in_progress',
    requestedBy: 'Dr. João Silva',
    observations: 'Controle de diabetes mellitus',
    priority: 'high',
    labName: 'LabExame',
    cost: 25.00,
    insurance: 'Amil',
    scheduledDate: '2024-01-16',
    notes: 'Jejum de 8-12 horas obrigatório'
  },
  {
    id: '5',
    patientId: '3',
    name: 'Glicemia em Jejum',
    type: 'requested',
    date: '2024-01-11',
    status: 'requested',
    requestedBy: 'Dr. João Silva',
    observations: 'Rastreamento de diabetes',
    priority: 'medium',
    labName: 'LabExame',
    cost: 25.00,
    insurance: 'Particular',
    scheduledDate: '2024-01-18',
    notes: 'Jejum de 8-12 horas obrigatório'
  },
  {
    id: '6',
    patientId: '3',
    name: 'Perfil Lipídico',
    type: 'requested',
    date: '2024-01-11',
    status: 'requested',
    requestedBy: 'Dr. João Silva',
    observations: 'Avaliação de risco cardiovascular',
    priority: 'medium',
    labName: 'LabExame',
    cost: 35.00,
    insurance: 'Particular',
    scheduledDate: '2024-01-18',
    notes: 'Jejum de 12 horas obrigatório'
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'requested': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluído'
      case 'in_progress': return 'Em Andamento'
      case 'requested': return 'Solicitado'
      case 'pending': return 'Pendente'
      default: return 'Desconhecido'
    }
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
              <CardTitle>Conversas com Pacientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(() => {
                  // Agrupar mensagens por paciente
                  const patientConversations = patients.map(patient => {
                    const patientMessages = messages.filter(m => m.patientId === patient.id)
                    const lastMessage = patientMessages[patientMessages.length - 1]
                    const unreadCount = patientMessages.filter(m => !m.read && m.from === 'patient').length
                    
                    return {
                      patient,
                      lastMessage,
                      unreadCount,
                      messageCount: patientMessages.length
                    }
                  }).filter(conv => conv.messageCount > 0) // Só mostrar pacientes com mensagens
                    .sort((a, b) => {
                      // Ordenar por data da última mensagem (mais recente primeiro)
                      if (!a.lastMessage && !b.lastMessage) return 0
                      if (!a.lastMessage) return 1
                      if (!b.lastMessage) return -1
                      return new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
                    })

                  return patientConversations.map((conversation) => (
                    <div key={conversation.patient.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-lg">{conversation.patient.name}</span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unreadCount} nova{conversation.unreadCount > 1 ? 's' : ''}
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {conversation.messageCount} mensagem{conversation.messageCount > 1 ? 'ns' : ''}
                            </Badge>
                          </div>
                          
                          {conversation.lastMessage && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={conversation.lastMessage.from === 'patient' ? 'outline' : 'default'}>
                                  {conversation.lastMessage.from === 'patient' ? 'Paciente' : 'Médico'}
                                </Badge>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(conversation.lastMessage.timestamp).toLocaleString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground bg-muted/30 p-2 rounded">
                                {conversation.lastMessage.content}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedPatient(conversation.patient)
                              setIsMessageDialogOpen(true)
                            }}
                          >
                            <MessageCircle className="h-4 w-4 mr-1" />
                            Ver Conversa
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exams" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Exames por Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(() => {
                  // Agrupar exames por paciente
                  const patientExams = patients.map(patient => {
                    const patientExamsList = exams.filter(e => e.patientId === patient.id)
                    const uploadedExams = patientExamsList.filter(e => e.type === 'uploaded')
                    const requestedExams = patientExamsList.filter(e => e.type === 'requested')
                    
                    return {
                      patient,
                      uploadedExams,
                      requestedExams,
                      totalExams: patientExamsList.length
                    }
                  }).filter(p => p.totalExams > 0) // Só mostrar pacientes com exames
                    .sort((a, b) => b.totalExams - a.totalExams) // Ordenar por quantidade de exames

                  return patientExams.map((patientExam) => (
                    <div key={patientExam.patient.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">{patientExam.patient.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {patientExam.totalExams} exame{patientExam.totalExams > 1 ? 'ns' : ''} no total
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">
                            {patientExam.uploadedExams.length} anexado{patientExam.uploadedExams.length > 1 ? 's' : ''}
                          </Badge>
                          <Badge variant="secondary">
                            {patientExam.requestedExams.length} solicitado{patientExam.requestedExams.length > 1 ? 's' : ''}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Todos os Exames do Paciente */}
                        {patientExam.uploadedExams.concat(patientExam.requestedExams)
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((exam) => (
                          <div key={exam.id} className="border rounded-lg p-4 bg-muted/20">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-base">{exam.name}</h4>
                                  <Badge className={`text-xs ${getStatusColor(exam.status)}`}>
                                    {getStatusText(exam.status)}
                                  </Badge>
                                  <Badge className={`text-xs ${getPriorityColor(exam.priority)}`}>
                                    {exam.priority === 'urgent' ? 'Urgente' : 
                                     exam.priority === 'high' ? 'Alta' : 
                                     exam.priority === 'medium' ? 'Média' : 'Baixa'}
                                  </Badge>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-1">
                                    <p><span className="font-medium">Solicitado por:</span> {exam.requestedBy}</p>
                                    <p><span className="font-medium">Data da solicitação:</span> {new Date(exam.date).toLocaleDateString('pt-BR')}</p>
                                    <p><span className="font-medium">Laboratório:</span> {exam.labName}</p>
                                    <p><span className="font-medium">Convênio:</span> {exam.insurance}</p>
                                    {exam.scheduledDate && (
                                      <p><span className="font-medium">Data agendada:</span> {new Date(exam.scheduledDate).toLocaleDateString('pt-BR')}</p>
                                    )}
                                    {exam.cost && (
                                      <p><span className="font-medium">Valor:</span> R$ {exam.cost.toFixed(2)}</p>
                                    )}
                                  </div>
                                  
                                  <div className="space-y-1">
                                    {exam.observations && (
                                      <div>
                                        <p className="font-medium">Observações médicas:</p>
                                        <p className="text-muted-foreground text-xs bg-white p-2 rounded border">
                                          {exam.observations}
                                        </p>
                                      </div>
                                    )}
                                    {exam.notes && (
                                      <div>
                                        <p className="font-medium">Instruções:</p>
                                        <p className="text-muted-foreground text-xs bg-white p-2 rounded border">
                                          {exam.notes}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Resultados (se disponível) */}
                                {exam.resultSummary && (
                                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                                    <div className="flex items-center gap-2 mb-2">
                                      <FileText className="h-4 w-4 text-green-600" />
                                      <span className="font-medium text-green-800">Resultado</span>
                                      {exam.resultDate && (
                                        <span className="text-xs text-green-600">
                                          {new Date(exam.resultDate).toLocaleDateString('pt-BR')}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-green-700">{exam.resultSummary}</p>
                                  </div>
                                )}

                                {/* Ações */}
                                <div className="flex items-center gap-2 mt-3">
                                  {exam.file && (
                                    <Button variant="outline" size="sm">
                                      <Download className="h-3 w-3 mr-1" />
                                      Baixar Resultado
                                    </Button>
                                  )}
                                  <Button variant="outline" size="sm">
                                    <MessageCircle className="h-3 w-3 mr-1" />
                                    Enviar Lembrete
                                  </Button>
                                  {exam.status === 'requested' && (
                                    <Button variant="outline" size="sm">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      Reagendar
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog para enviar mensagem */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Conversa com {selectedPatient?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-80 overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg">
              {selectedPatient && getPatientMessages(selectedPatient.id)
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((message) => (
                <div key={message.id} className={`flex ${message.from === 'doctor' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs p-3 rounded-lg text-sm shadow-sm ${
                    message.from === 'doctor' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-900 border'
                  }`}>
                    <div className="mb-1">
                      <span className="text-xs opacity-70">
                        {message.from === 'doctor' ? 'Você' : selectedPatient.name}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <div className="mt-2 text-xs opacity-70">
                      {new Date(message.timestamp).toLocaleString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
              {selectedPatient && getPatientMessages(selectedPatient.id).length === 0 && (
                <div className="text-center text-muted-foreground py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma mensagem ainda</p>
                  <p className="text-sm">Inicie uma conversa enviando uma mensagem</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Textarea 
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                rows={3}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
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