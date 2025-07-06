
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Plus, Search, Filter } from 'lucide-react'

interface FollowUpEntry {
  id: string
  data: string
  medico: string
  tipo: 'Consulta' | 'Retorno' | 'Emergência' | 'Exame'
  status: 'Agendado' | 'Realizado' | 'Cancelado'
  observacoes: string
  duracao: string
}

const mockFollowUps: FollowUpEntry[] = [
  {
    id: '1',
    data: '04/07/2025',
    medico: 'Dr. Thiago Anver',
    tipo: 'Consulta',
    status: 'Realizado',
    observacoes: 'Consulta inicial - avaliação geral',
    duracao: '45 min'
  },
  {
    id: '2',
    data: '18/07/2025',
    medico: 'Dr. Thiago Anver',
    tipo: 'Retorno',
    status: 'Agendado',
    observacoes: 'Retorno para avaliação de exames',
    duracao: '30 min'
  }
]

export function FollowUpTable() {
  const [followUps, setFollowUps] = useState<FollowUpEntry[]>(mockFollowUps)
  const [searchTerm, setSearchTerm] = useState('')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Realizado': return 'bg-green-100 text-green-800'
      case 'Agendado': return 'bg-blue-100 text-blue-800'
      case 'Cancelado': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Consulta': return 'bg-purple-100 text-purple-800'
      case 'Retorno': return 'bg-blue-100 text-blue-800'
      case 'Emergência': return 'bg-red-100 text-red-800'
      case 'Exame': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredFollowUps = followUps.filter(item =>
    item.medico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.observacoes.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Tabela de Acompanhamentos
            </CardTitle>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
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
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFollowUps.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.data}</TableCell>
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
                  <TableCell className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {item.duracao}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {item.observacoes}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
