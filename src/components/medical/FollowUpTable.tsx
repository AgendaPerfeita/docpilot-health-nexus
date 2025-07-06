
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, User, Plus, Search, Filter, Bell, CalendarDays, MoreHorizontal } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuItem } from "@/components/ui/dropdown-menu"

interface FollowUpEntry {
  id: string
  data: string
  hora: string
  medico: string
  tipo: 'Consulta' | 'Retorno' | 'Emergência' | 'Exame' | 'Procedimento'
  status: 'Agendado' | 'Realizado' | 'Cancelado' | 'Reagendado' | 'Faltou'
  observacoes: string
  duracao: string
  prioridade: 'Baixa' | 'Normal' | 'Alta' | 'Urgente'
  convenio?: string
  valor?: number
}

const mockFollowUps: FollowUpEntry[] = [
  {
    id: '1',
    data: '04/07/2025',
    hora: '14:30',
    medico: 'Dr. Thiago Anver',
    tipo: 'Consulta',
    status: 'Realizado',
    observacoes: 'Consulta inicial - avaliação geral. Paciente apresentou melhora significativa.',
    duracao: '45 min',
    prioridade: 'Normal',
    convenio: 'Particular',
    valor: 280
  },
  {
    id: '2',
    data: '18/07/2025',
    hora: '09:00',
    medico: 'Dr. Thiago Anver',
    tipo: 'Retorno',
    status: 'Agendado',
    observacoes: 'Retorno para avaliação de exames e ajuste de medicação',
    duracao: '30 min',
    prioridade: 'Alta',
    convenio: 'Particular',
    valor: 180
  },
  {
    id: '3',
    data: '25/07/2025',
    hora: '16:00',
    medico: 'Dr. Thiago Anver',
    tipo: 'Exame',
    status: 'Agendado',
    observacoes: 'Eletrocardiograma de controle',
    duracao: '20 min',
    prioridade: 'Normal'
  }
]

export function FollowUpTable() {
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>(mockFollowUps)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [tipoFilter, setTipoFilter] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<FollowUpEntry | null>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Realizado': return 'bg-green-100 text-green-800'
      case 'Agendado': return 'bg-blue-100 text-blue-800'
      case 'Cancelado': return 'bg-red-100 text-red-800'
      case 'Reagendado': return 'bg-yellow-100 text-yellow-800'
      case 'Faltou': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Consulta': return 'bg-purple-100 text-purple-800'
      case 'Retorno': return 'bg-blue-100 text-blue-800'
      case 'Emergência': return 'bg-red-100 text-red-800'
      case 'Exame': return 'bg-yellow-100 text-yellow-800'
      case 'Procedimento': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'Urgente': return 'bg-red-500 text-white'
      case 'Alta': return 'bg-orange-100 text-orange-800'
      case 'Normal': return 'bg-gray-100 text-gray-800'
      case 'Baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFollowUps = followUps.filter(item => {
    const matchesSearch = item.medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.observacoes.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !statusFilter || item.status === statusFilter
    const matchesTipo = !tipoFilter || item.tipo === tipoFilter
    
    return matchesSearch && matchesStatus && matchesTipo
  })

  const proximosRetornos = followUps.filter(item => 
    item.status === 'Agendado' && 
    new Date(item.data.split('/').reverse().join('-')) > new Date()
  ).length

  const totalRealizados = followUps.filter(item => item.status === 'Realizado').length

  return (
    <div className="p-6 space-y-6">
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Próximos</p>
                <p className="text-2xl font-bold">{proximosRetornos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-gray-600">Realizados</p>
                <p className="text-2xl font-bold">{totalRealizados}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-gray-600">Hoje</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-gray-600">Esta Semana</p>
                <p className="text-2xl font-bold">5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tabela de Acompanhamentos
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Data</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Hora</Label>
                    <Input type="time" />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="consulta">Consulta</SelectItem>
                        <SelectItem value="retorno">Retorno</SelectItem>
                        <SelectItem value="exame">Exame</SelectItem>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duração</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="45">45 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Observações</Label>
                    <Textarea placeholder="Observações sobre o agendamento..." />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={() => setDialogOpen(false)}>
                    Agendar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por médico ou observações..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Realizado">Realizado</SelectItem>
                <SelectItem value="Cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos</SelectItem>
                <SelectItem value="Consulta">Consulta</SelectItem>
                <SelectItem value="Retorno">Retorno</SelectItem>
                <SelectItem value="Exame">Exame</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Mais Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Prioridade</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFollowUps.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.data}</div>
                    <div className="text-sm text-gray-500">{item.hora}</div>
                  </TableCell>
                  <TableCell className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {item.medico}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTipoColor(item.tipo)}>
                      {item.tipo}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPrioridadeColor(item.prioridade)} variant="secondary">
                      {item.prioridade}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.duracao}
                  </TableCell>
                  <TableCell>
                    {item.valor ? `R$ ${item.valor.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={item.observacoes}>
                      {item.observacoes}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>Ver Detalhes</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuItem>Reagendar</DropdownMenuItem>
                        <DropdownMenuItem>Cancelar</DropdownMenuItem>
                        <DropdownMenuItem>Iniciar Consulta</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredFollowUps.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum agendamento encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
