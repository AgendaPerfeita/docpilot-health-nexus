
import React, { useState, useEffect } from 'react'
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
import { useConsultas } from "@/hooks/useConsultas"

interface FollowUpTableProps {
  pacienteId?: string;
}

export function FollowUpTable({ pacienteId }: FollowUpTableProps) {
  const { consultas, loading } = useConsultas();
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [tipoFilter, setTipoFilter] = useState<string>('todos')
  const [dialogOpen, setDialogOpen] = useState(false)

  // Filter consultas by patient if pacienteId is provided
  const filteredConsultas = consultas.filter(consulta => {
    if (pacienteId && consulta.paciente_id !== pacienteId) return false;
    
    const matchesSearch = consulta.observacoes?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const matchesStatus = statusFilter === 'todos' || consulta.status === statusFilter;
    const matchesTipo = tipoFilter === 'todos' || consulta.tipo_consulta === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizada': return 'bg-green-100 text-green-800'
      case 'agendada': return 'bg-blue-100 text-blue-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      case 'reagendada': return 'bg-yellow-100 text-yellow-800'
      case 'faltou': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'consulta': return 'bg-purple-100 text-purple-800'
      case 'retorno': return 'bg-blue-100 text-blue-800'
      case 'emergencia': return 'bg-red-100 text-red-800'
      case 'exame': return 'bg-yellow-100 text-yellow-800'
      case 'procedimento': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const proximosRetornos = filteredConsultas.filter(item => 
    item.status === 'agendada' && 
    new Date(item.data_consulta) > new Date()
  ).length

  const totalRealizados = filteredConsultas.filter(item => item.status === 'concluida').length

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
                <p className="text-2xl font-bold">
                  {filteredConsultas.filter(c => 
                    new Date(c.data_consulta).toDateString() === new Date().toDateString()
                  ).length}
                </p>
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
                <p className="text-2xl font-bold">
                  {filteredConsultas.filter(c => {
                    const consultaDate = new Date(c.data_consulta);
                    const now = new Date();
                    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                    return consultaDate >= weekStart;
                  }).length}
                </p>
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
                placeholder="Buscar por observações..."
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
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="agendada">Agendado</SelectItem>
                <SelectItem value="realizada">Realizado</SelectItem>
                <SelectItem value="cancelada">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="consulta">Consulta</SelectItem>
                <SelectItem value="retorno">Retorno</SelectItem>
                <SelectItem value="exame">Exame</SelectItem>
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
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsultas.map((consulta) => (
                <TableRow key={consulta.id}>
                  <TableCell>
                    <div className="font-medium">
                      {new Date(consulta.data_consulta).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(consulta.data_consulta).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTipoColor(consulta.tipo_consulta)}>
                      {consulta.tipo_consulta}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(consulta.status)}>
                      {consulta.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {consulta.duracao_minutos} min
                  </TableCell>
                  <TableCell>
                    {consulta.valor ? `R$ ${consulta.valor.toFixed(2)}` : '-'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={consulta.observacoes || ''}>
                      {consulta.observacoes || '-'}
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

          {filteredConsultas.length === 0 && (
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
