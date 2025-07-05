import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  User, 
  Calendar, 
  FileText, 
  Heart, 
  Clock, 
  Phone, 
  Mail, 
  MapPin,
  Edit3,
  Download,
  Upload,
  Bot,
  MessageCircle
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { callGeminiAPI } from "@/lib/gemini"

const AreaPaciente = () => {
  const { toast } = useToast()
  const [editingProfile, setEditingProfile] = useState(false)
  const [symptoms, setSymptoms] = useState('')
  const [iaAnalysis, setIaAnalysis] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Mock patient data
  const [patientData, setPatientData] = useState({
    id: '1',
    name: 'Maria Silva Santos',
    email: 'maria.silva@email.com',
    phone: '(11) 99999-1234',
    birthDate: '1985-05-15',
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123 - Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
    emergencyContact: 'João Silva - (11) 99999-5678',
    chronicConditions: 'Hipertensão arterial',
    allergies: 'Penicilina',
    continuousMedications: 'Losartana 50mg (1x ao dia)'
  })

  const appointments = [
    {
      id: '1',
      date: '2024-01-20',
      time: '14:00',
      doctor: 'Dr. João Silva',
      specialty: 'Cardiologia',
      status: 'agendada',
      type: 'Consulta de rotina'
    },
    {
      id: '2',
      date: '2024-01-15',
      time: '10:30',
      doctor: 'Dr. Ana Costa',
      specialty: 'Clínica Geral',
      status: 'realizada',
      type: 'Retorno'
    },
    {
      id: '3',
      date: '2024-01-10',
      time: '16:00',
      doctor: 'Dr. Carlos Oliveira',
      specialty: 'Endocrinologia',
      status: 'realizada',
      type: 'Primeira consulta'
    }
  ]

  const exams = [
    {
      id: '1',
      name: 'Hemograma Completo',
      date: '2024-01-12',
      doctor: 'Dr. Ana Costa',
      status: 'disponível',
      file: 'hemograma_12012024.pdf'
    },
    {
      id: '2',
      name: 'Eletrocardiograma',
      date: '2024-01-08',
      doctor: 'Dr. João Silva',
      status: 'disponível',
      file: 'ecg_08012024.pdf'
    },
    {
      id: '3',
      name: 'Ultrassom Abdome',
      date: '2024-01-05',
      doctor: 'Dr. Maria Santos',
      status: 'pendente',
      file: null
    }
  ]

  const handleAnalyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva seus sintomas.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    try {
      const analysis = await callGeminiAPI(
        `Como uma IA médica assistente, analise os seguintes sintomas de um paciente:
        
        Dados do Paciente:
        - Nome: ${patientData.name}
        - Idade: ${new Date().getFullYear() - new Date(patientData.birthDate).getFullYear()} anos
        - Condições Crônicas: ${patientData.chronicConditions}
        - Medicamentos de Uso Contínuo: ${patientData.continuousMedications}
        - Alergias: ${patientData.allergies}
        
        Sintomas: ${symptoms}
        
        Forneça uma análise preliminar educativa, possíveis causas, e recomende quando procurar atendimento médico. 
        IMPORTANTE: Deixe claro que esta é uma análise preliminar e não substitui consulta médica.
        Responda em português brasileiro de forma clara e acessível.`
      )
      
      setIaAnalysis(analysis)
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar os sintomas. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSaveProfile = () => {
    setEditingProfile(false)
    toast({
      title: "Perfil atualizado",
      description: "Suas informações foram salvas com sucesso."
    })
  }

  const downloadExam = (exam: any) => {
    toast({
      title: "Download iniciado",
      description: `Baixando ${exam.name}...`
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'bg-blue-100 text-blue-800'
      case 'realizada':
        return 'bg-green-100 text-green-800'
      case 'cancelada':
        return 'bg-red-100 text-red-800'
      case 'disponível':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Área do Paciente</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações e acompanhe seu histórico médico
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Heart className="h-4 w-4 mr-1" />
          Paciente
        </Badge>
      </div>

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="consultas">Consultas</TabsTrigger>
          <TabsTrigger value="exames">Exames</TabsTrigger>
          <TabsTrigger value="ia-saude">IA Saúde</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
        </TabsList>

        {/* Perfil */}
        <TabsContent value="perfil" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Mantenha seus dados sempre atualizados
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingProfile(!editingProfile)}
              >
                <Edit3 className="h-4 w-4 mr-2" />
                {editingProfile ? 'Cancelar' : 'Editar'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={patientData.name}
                    onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={patientData.email}
                    onChange={(e) => setPatientData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={patientData.phone}
                    onChange={(e) => setPatientData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={patientData.birthDate}
                    onChange={(e) => setPatientData(prev => ({ ...prev, birthDate: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    value={patientData.cpf}
                    onChange={(e) => setPatientData(prev => ({ ...prev, cpf: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contato de Emergência</Label>
                  <Input
                    id="emergencyContact"
                    value={patientData.emergencyContact}
                    onChange={(e) => setPatientData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    disabled={!editingProfile}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={`${patientData.address}, ${patientData.city} - ${patientData.state}, ${patientData.zipCode}`}
                  disabled={!editingProfile}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="chronicConditions">Condições Crônicas</Label>
                  <Textarea
                    id="chronicConditions"
                    value={patientData.chronicConditions}
                    onChange={(e) => setPatientData(prev => ({ ...prev, chronicConditions: e.target.value }))}
                    disabled={!editingProfile}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allergies">Alergias</Label>
                  <Textarea
                    id="allergies"
                    value={patientData.allergies}
                    onChange={(e) => setPatientData(prev => ({ ...prev, allergies: e.target.value }))}
                    disabled={!editingProfile}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="continuousMedications">Medicamentos de Uso Contínuo</Label>
                  <Textarea
                    id="continuousMedications"
                    value={patientData.continuousMedications}
                    onChange={(e) => setPatientData(prev => ({ ...prev, continuousMedications: e.target.value }))}
                    disabled={!editingProfile}
                    rows={3}
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditingProfile(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProfile}>
                    Salvar Alterações
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consultas */}
        <TabsContent value="consultas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Consultas
              </CardTitle>
              <CardDescription>
                Acompanhe suas consultas agendadas e realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex flex-col items-center">
                        <div className="text-sm font-medium">
                          {new Date(appointment.date).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-sm text-muted-foreground">{appointment.time}</div>
                      </div>
                      <div>
                        <div className="font-medium">{appointment.doctor}</div>
                        <div className="text-sm text-muted-foreground">{appointment.specialty}</div>
                        <div className="text-sm text-muted-foreground">{appointment.type}</div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exames */}
        <TabsContent value="exames" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Resultados de Exames
              </CardTitle>
              <CardDescription>
                Acesse e baixe seus resultados de exames
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <FileText className="h-8 w-8 text-blue-500" />
                      <div>
                        <div className="font-medium">{exam.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(exam.date).toLocaleDateString('pt-BR')} - {exam.doctor}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(exam.status)}>
                        {exam.status}
                      </Badge>
                      {exam.file && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadExam(exam)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Baixar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA Saúde */}
        <TabsContent value="ia-saude" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Assistente de Saúde com IA
              </CardTitle>
              <CardDescription>
                Descreva seus sintomas e receba uma análise preliminar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="symptoms">Descreva seus sintomas</Label>
                <Textarea
                  id="symptoms"
                  placeholder="Ex: Estou sentindo dor de cabeça há 2 dias, acompanhada de febre baixa..."
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleAnalyzeSymptoms}
                disabled={isAnalyzing || !symptoms.trim()}
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analisando...
                  </>
                ) : (
                  <>
                    <Bot className="h-4 w-4 mr-2" />
                    Analisar Sintomas
                  </>
                )}
              </Button>

              {iaAnalysis && (
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-lg">Análise Preliminar</CardTitle>
                    <CardDescription>
                      Esta análise é apenas informativa e não substitui consulta médica
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{iaAnalysis}</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mensagens */}
        <TabsContent value="mensagens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Central de Mensagens
              </CardTitle>
              <CardDescription>
                Comunicação com seus médicos e clínicas
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma mensagem no momento
              </p>
              <Button variant="outline">
                Nova Mensagem
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AreaPaciente