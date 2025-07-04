import { useState } from "react"
import { Calendar, Clock, Plus, User, Phone, MapPin, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Appointment {
  id: string
  patient: string
  phone: string
  service: string
  time: string
  duration: string
  status: 'confirmado' | 'pendente' | 'cancelado'
  professional: string
  notes?: string
}

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patient: 'Ana Silva',
    phone: '(11) 99999-0001',
    service: 'Consulta Clínica',
    time: '09:00',
    duration: '30min',
    status: 'confirmado',
    professional: 'Dr. João Silva',
    notes: 'Primeira consulta'
  },
  {
    id: '2',
    patient: 'Carlos Santos',
    phone: '(11) 99999-0002',
    service: 'Retorno',
    time: '10:00',
    duration: '20min',
    status: 'pendente',
    professional: 'Dr. João Silva'
  },
  {
    id: '3',
    patient: 'Maria Oliveira',
    phone: '(11) 99999-0003',
    service: 'Exame',
    time: '14:00',
    duration: '45min',
    status: 'confirmado',
    professional: 'Dra. Ana Costa'
  }
]

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)

  const filteredAppointments = appointments.filter(apt => 
    apt.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.service.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmado': return 'bg-green-100 text-green-800 border-green-200'
      case 'pendente': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelado': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleAddAppointment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      patient: formData.get('patient') as string,
      phone: formData.get('phone') as string,
      service: formData.get('service') as string,
      time: formData.get('time') as string,
      duration: formData.get('duration') as string,
      status: 'pendente',
      professional: formData.get('professional') as string,
      notes: formData.get('notes') as string
    }
    
    setAppointments([...appointments, newAppointment])
    setIsAddingAppointment(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie consultas e agendamentos</p>
        </div>
        <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Agendamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddAppointment} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Paciente</Label>
                  <Input id="patient" name="patient" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service">Serviço</Label>
                  <Select name="service" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar serviço" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="consulta">Consulta Clínica</SelectItem>
                      <SelectItem value="retorno">Retorno</SelectItem>
                      <SelectItem value="exame">Exame</SelectItem>
                      <SelectItem value="cirurgia">Cirurgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="professional">Profissional</Label>
                  <Select name="professional" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dr. João Silva">Dr. João Silva</SelectItem>
                      <SelectItem value="Dra. Ana Costa">Dra. Ana Costa</SelectItem>
                      <SelectItem value="Dr. Carlos Lima">Dr. Carlos Lima</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" name="time" type="time" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duração</Label>
                  <Select name="duration" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Duração" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">15 minutos</SelectItem>
                      <SelectItem value="30min">30 minutos</SelectItem>
                      <SelectItem value="45min">45 minutos</SelectItem>
                      <SelectItem value="60min">1 hora</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" placeholder="Observações adicionais..." />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddingAppointment(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Agendar</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-2xl font-bold text-foreground">12</span>
            </div>
            <p className="text-sm text-muted-foreground">Agendamentos Hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span className="text-2xl font-bold text-foreground">8</span>
            </div>
            <p className="text-sm text-muted-foreground">Confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-yellow-600" />
              <span className="text-2xl font-bold text-foreground">3</span>
            </div>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-red-600" />
              <span className="text-2xl font-bold text-foreground">1</span>
            </div>
            <p className="text-sm text-muted-foreground">Cancelados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agenda do Dia</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar paciente ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAppointments.map((appointment) => (
              <div key={appointment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="font-medium text-lg text-foreground">
                      {appointment.time}
                    </div>
                    <div className="border-l pl-4">
                      <div className="font-medium text-foreground">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {appointment.professional}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`${getStatusColor(appointment.status)} capitalize`}>
                      {appointment.status}
                    </Badge>
                    <div className="text-sm font-medium text-foreground">
                      {appointment.service}
                    </div>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    <strong>Obs:</strong> {appointment.notes}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}