
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AgendaConsultas } from "@/components/modules/consultas/AgendaConsultas"
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
  User,
  Eye
} from "lucide-react"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, isToday } from "date-fns"
import { ptBR } from "date-fns/locale"
import { usePacientes } from "@/hooks/usePacientes"

const Agenda = () => {
  const navigate = useNavigate()
  const { pacientes } = usePacientes()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date())
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week')
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [showPatientModal, setShowPatientModal] = useState(false)

  // Mock appointments data com pacientes reais
  const appointments = [
    {
      id: '1',
      patientId: pacientes[0]?.id || 'mock1',
      patientName: pacientes[0]?.nome || 'Maria Silva',
      time: '09:00',
      duration: 30,
      type: 'Consulta',
      status: 'confirmada',
      date: new Date(),
      notes: 'Consulta de rotina'
    },
    {
      id: '2',
      patientId: pacientes[1]?.id || 'mock2',
      patientName: pacientes[1]?.nome || 'João Santos',
      time: '10:30',
      duration: 45,
      type: 'Retorno',
      status: 'pendente',
      date: new Date(),
      notes: 'Acompanhamento pós-cirúrgico'
    },
    {
      id: '3',
      patientId: pacientes[2]?.id || 'mock3',
      patientName: pacientes[2]?.nome || 'Ana Costa',
      time: '14:00',
      duration: 30,
      type: 'Primeira consulta',
      status: 'confirmada',
      date: new Date(),
      notes: 'Paciente novo'
    }
  ]

  const stats = [
    {
      title: "Consultas Hoje",
      value: "12",
      icon: CalendarIcon,
      color: "text-blue-600"
    },
    {
      title: "Tempo Médio",
      value: "35 min",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Taxa de Ocupação",
      value: "85%",
      icon: Users,
      color: "text-purple-600"
    }
  ]

  const weekDays = eachDayOfInterval({
    start: startOfWeek(currentWeek, { weekStartsOn: 1 }),
    end: endOfWeek(currentWeek, { weekStartsOn: 1 })
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmada':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelada':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Consulta':
        return 'bg-blue-100 text-blue-800'
      case 'Retorno':
        return 'bg-purple-100 text-purple-800'
      case 'Primeira consulta':
        return 'bg-emerald-100 text-emerald-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleAppointmentClick = (appointment: any) => {
    setSelectedAppointment(appointment)
    setShowPatientModal(true)
  }

  const getPatientData = (patientId: string) => {
    return pacientes.find(p => p.id === patientId)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agenda</h1>
          <p className="text-muted-foreground">
            Gerencie seus horários e consultas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Calendar Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Calendário</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-md border-0"
              locale={ptBR}
            />
          </CardContent>
        </Card>

        {/* Main Schedule */}
        <div className="lg:col-span-3 space-y-6">
          {/* View Controls */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                  <h2 className="text-xl font-semibold">
                    {format(currentWeek, "MMMM yyyy", { locale: ptBR })}
                  </h2>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant={viewMode === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('day')}
                  >
                    Dia
                  </Button>
                  <Button
                    variant={viewMode === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('week')}
                  >
                    Semana
                  </Button>
                  <Button
                    variant={viewMode === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('month')}
                  >
                    Mês
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Week View */}
          {viewMode === 'week' && (
            <div className="grid gap-4 grid-cols-7">
              {weekDays.map((day) => (
                <Card key={day.toISOString()} className={`min-h-[400px] ${isToday(day) ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-center">
                      <div className={`${isToday(day) ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'EEE', { locale: ptBR })}
                      </div>
                      <div className={`text-lg ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {appointments.filter(apt => isSameDay(apt.date, day)).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-2 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{appointment.time}</span>
                          <Badge className={getStatusColor(appointment.status)}>
                            {appointment.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-1">
                          {appointment.patientName}
                        </div>
                        <Badge variant="outline" className={getTypeColor(appointment.type)}>
                          {appointment.type}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Day View */}
          {viewMode === 'day' && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
                </CardTitle>
                <CardDescription>
                  {appointments.filter(apt => isSameDay(apt.date, selectedDate)).length} consultas agendadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgendaConsultas />
              </CardContent>
            </Card>
          )}

          {/* Month View */}
          {viewMode === 'month' && (
            <Card>
              <CardHeader>
                <CardTitle>Visão Mensal</CardTitle>
                <CardDescription>
                  Visão geral do mês {format(currentWeek, "MMMM yyyy", { locale: ptBR })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
                  <p>Visão mensal em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Patient Modal */}
      <Dialog open={showPatientModal} onOpenChange={setShowPatientModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              Detalhes do Agendamento
            </DialogTitle>
          </DialogHeader>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Paciente</label>
                  <p className="font-medium">{selectedAppointment.patientName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Horário</label>
                  <p className="font-medium">{selectedAppointment.time}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                  <Badge variant="outline" className={getTypeColor(selectedAppointment.type)}>
                    {selectedAppointment.type}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <Badge className={getStatusColor(selectedAppointment.status)}>
                    {selectedAppointment.status}
                  </Badge>
                </div>
              </div>
              
              {selectedAppointment.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Observações</label>
                  <p className="text-sm mt-1">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="flex items-center space-x-2 pt-4">
                <Button 
                  onClick={() => {
                    navigate(`/prontuario/paciente/${selectedAppointment.patientId}`)
                    setShowPatientModal(false)
                  }}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Ver Prontuário
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    navigate(`/prontuario/paciente/${selectedAppointment.patientId}/nova`)
                    setShowPatientModal(false)
                  }}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Evolução
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Agenda
