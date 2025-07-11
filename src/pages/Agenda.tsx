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
import { AgendaGrid } from "@/components/agenda/AgendaGrid"
import { AgendamentoModal } from "@/components/agenda/AgendamentoModal"

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

const mockPatients = [
  {
    name: 'Ana Silva',
    phone: '(11) 99999-0001',
    history: [
      { date: '2024-04-01', type: 'Consulta', diagnosis: 'Rinite alérgica' },
      { date: '2024-03-10', type: 'Retorno', diagnosis: 'Rinite alérgica' }
    ]
  },
  {
    name: 'Carlos Santos',
    phone: '(11) 99999-0002',
    history: [
      { date: '2024-02-15', type: 'Exame', diagnosis: 'Colesterol alto' }
    ]
  }
];

const mockConvenios = [
  { nome: 'Unimed', planos: ['Uniplan', 'UniTop', 'UniGold'] },
  { nome: 'Amil', planos: ['Amil 200', 'Amil 400', 'Amil 700'] },
  { nome: 'Bradesco Saúde', planos: ['Top Nacional', 'Efetivo', 'Nacional Flex'] }
];

function getSemanaBase(date: Date) {
  // Retorna array de 7 datas, começando no domingo da semana de 'date'
  const diaSemana = date.getDay();
  const domingo = new Date(date);
  domingo.setDate(date.getDate() - diaSemana);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(domingo);
    d.setDate(domingo.getDate() + i);
    return d;
  });
}

export default function Agenda() {
  const [dataBase, setDataBase] = useState(new Date());
  const semana = getSemanaBase(dataBase);
  const [modal, setModal] = useState<{ open: boolean; dia: Date; hora: string } | null>(null);
  const [agendamentos, setAgendamentos] = useState<{ dia: string; hora: string; paciente?: string }[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingAppointment, setIsAddingAppointment] = useState(false)
  const [formState, setFormState] = useState({
    patient: '',
    phone: '',
    tipoConsulta: '',
    convenio: '',
    plano: '',
  });
  const [patientHistory, setPatientHistory] = useState<any[]>([]);

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phone = e.target.value;
    setFormState(f => ({ ...f, phone }));
    const found = mockPatients.find(p => p.phone === phone);
    if (found) {
      setFormState(f => ({ ...f, patient: found.name, phone }));
      setPatientHistory(found.history);
    } else {
      setPatientHistory([]);
    }
  };

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
    setFormState({ patient: '', phone: '', tipoConsulta: '', convenio: '', plano: '' });
    setPatientHistory([]);
  }

  const handleCellClick = (dia: Date, hora: string) => {
    setModal({ open: true, dia, hora });
  };

  const handleSaveAgendamento = (data: any) => {
    setAgendamentos((prev) => [
      ...prev,
      {
        dia: data.data,
        hora: data.hora,
        paciente: data.paciente,
      },
    ]);
    setModal(null);
  };

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-4 mb-2">
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setDataBase((d) => {
            const newDate = new Date(d);
            newDate.setDate(d.getDate() - 7);
            return newDate;
          })}
        >
          Semana anterior
        </button>
        <span className="font-semibold text-lg">
          Semana de {semana[0].toLocaleDateString("pt-BR")} a {semana[6].toLocaleDateString("pt-BR")}
        </span>
        <button
          className="px-2 py-1 border rounded"
          onClick={() => setDataBase((d) => {
            const newDate = new Date(d);
            newDate.setDate(d.getDate() + 7);
            return newDate;
          })}
        >
          Próxima semana
        </button>
      </div>
      <AgendaGrid semana={semana} onCellClick={handleCellClick} agendamentos={agendamentos} />
      {modal && (
        <AgendamentoModal
          open={modal.open}
          onClose={() => setModal(null)}
          onSave={handleSaveAgendamento}
          dataInicial={modal.dia}
          horaInicial={modal.hora}
        />
      )}
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate">Agenda</h1>
            <p className="text-muted-foreground text-sm sm:text-base">Gerencie consultas e agendamentos</p>
          </div>
          <Dialog open={isAddingAppointment} onOpenChange={setIsAddingAppointment}>
            <DialogTrigger asChild>
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Agendamento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddAppointment} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input id="phone" name="phone" required value={formState.phone} onChange={handlePhoneChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patient">Paciente</Label>
                    <Input id="patient" name="patient" required value={formState.patient} onChange={e => setFormState(f => ({ ...f, patient: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Consulta</Label>
                  <Select value={formState.tipoConsulta} onValueChange={tipoConsulta => setFormState(f => ({ ...f, tipoConsulta, convenio: '', plano: '' }))} name="tipoConsulta" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="particular">Particular</SelectItem>
                      <SelectItem value="convenio">Convênio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formState.tipoConsulta === 'convenio' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Convênio</Label>
                      <Select value={formState.convenio} onValueChange={convenio => setFormState(f => ({ ...f, convenio, plano: '' }))} name="convenio" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o convênio" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockConvenios.map(c => (
                            <SelectItem key={c.nome} value={c.nome}>{c.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Plano</Label>
                      <Select value={formState.plano} onValueChange={plano => setFormState(f => ({ ...f, plano }))} name="plano" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o plano" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockConvenios.find(c => c.nome === formState.convenio)?.planos.map(p => (
                            <SelectItem key={p} value={p}>{p}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                {patientHistory.length > 0 && (
                  <Card className="bg-muted/50 border-blue-200 mb-2">
                    <CardHeader>
                      <CardTitle>Histórico do Paciente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm space-y-1">
                        {patientHistory.map((h, i) => (
                          <li key={i} className="flex gap-2 items-center">
                            <span className="text-muted-foreground">{new Date(h.date).toLocaleDateString('pt-BR')}</span>
                            <span className="font-medium">{h.type}</span>
                            <span className="text-xs text-muted-foreground">{h.diagnosis}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsAddingAppointment(false)} className="w-full sm:w-auto">
                    Cancelar
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">Agendar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="text-xl sm:text-2xl font-bold text-foreground">12</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Agendamentos Hoje</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                <span className="text-xl sm:text-2xl font-bold text-foreground">8</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Confirmados</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-yellow-600" />
                <span className="text-xl sm:text-2xl font-bold text-foreground">3</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-600" />
                <span className="text-xl sm:text-2xl font-bold text-foreground">1</span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">Cancelados</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader className="px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="text-lg sm:text-xl">Agenda do Dia</CardTitle>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente ou serviço..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                      <div className="font-medium text-lg text-foreground">
                        {appointment.time}
                      </div>
                      <div className="sm:border-l sm:pl-4 w-full sm:w-auto">
                        <div className="font-medium text-foreground">{appointment.patient}</div>
                        <div className="text-sm text-muted-foreground space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
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
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
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
    </div>
  )
}