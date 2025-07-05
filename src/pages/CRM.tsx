import { useState } from "react"
import { Users, TrendingUp, UserPlus, Phone, Mail, Calendar, Filter, Search, Plus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Lead {
  id: string
  name: string
  phone: string
  email: string
  source: string
  status: 'novo' | 'contactado' | 'agendado' | 'convertido' | 'perdido'
  lastContact: string
  notes: string
  totalSpent?: number
  averageTicket?: number
}

const mockLeads: Lead[] = [
  {
    id: '1',
    name: 'Ana Silva',
    phone: '(11) 99999-0001',
    email: 'ana@email.com',
    source: 'Instagram',
    status: 'novo',
    lastContact: '2024-01-15',
    notes: 'Interessada em consulta de rotina',
    totalSpent: 450,
    averageTicket: 150
  },
  {
    id: '2',
    name: 'Carlos Santos',
    phone: '(11) 99999-0002',
    email: 'carlos@email.com',
    source: 'Google',
    status: 'contactado',
    lastContact: '2024-01-14',
    notes: 'Precisa de exames cardiológicos',
    totalSpent: 850,
    averageTicket: 283
  },
  {
    id: '3',
    name: 'Maria Oliveira',
    phone: '(11) 99999-0003',
    email: 'maria@email.com',
    source: 'Indicação',
    status: 'convertido',
    lastContact: '2024-01-10',
    notes: 'Paciente convertido - consulta realizada',
    totalSpent: 1200,
    averageTicket: 400
  }
]

export default function CRM() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const [sourceFilter, setSourceFilter] = useState<string>('todos')
  const [isAddingLead, setIsAddingLead] = useState(false)

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'todos' || lead.status === statusFilter
    const matchesSource = sourceFilter === 'todos' || lead.source === sourceFilter
    
    return matchesSearch && matchesStatus && matchesSource
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'novo': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'contactado': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'agendado': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'convertido': return 'bg-green-100 text-green-800 border-green-200'
      case 'perdido': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusStats = () => {
    const stats = {
      novo: leads.filter(l => l.status === 'novo').length,
      contactado: leads.filter(l => l.status === 'contactado').length,
      agendado: leads.filter(l => l.status === 'agendado').length,
      convertido: leads.filter(l => l.status === 'convertido').length,
      perdido: leads.filter(l => l.status === 'perdido').length
    }
    return stats
  }

  const handleAddLead = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const newLead: Lead = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      source: formData.get('source') as string,
      status: 'novo',
      lastContact: new Date().toISOString().split('T')[0],
      notes: formData.get('notes') as string
    }
    
    setLeads([...leads, newLead])
    setIsAddingLead(false)
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Clínico</h1>
          <p className="text-muted-foreground">Gerencie leads e conversões</p>
        </div>
        <Dialog open={isAddingLead} onOpenChange={setIsAddingLead}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Lead
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo Lead</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddLead} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input id="name" name="name" required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="source">Origem</Label>
                <Select name="source" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar origem" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Site">Site</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" name="notes" placeholder="Notas sobre o lead..." />
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setIsAddingLead(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Lead</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              <span className="text-sm font-medium">Novos</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{stats.novo}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              <span className="text-sm font-medium">Contactados</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{stats.contactado}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              <span className="text-sm font-medium">Agendados</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{stats.agendado}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-medium">Convertidos</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{stats.convertido}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full" />
              <span className="text-sm font-medium">Perdidos</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">{stats.perdido}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Leads</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="contactado">Contactado</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Indicação">Indicação</SelectItem>
                  <SelectItem value="Site">Site</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLeads.map((lead) => (
              <div key={lead.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">{lead.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(lead.lastContact).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">{lead.source}</div>
                      {(lead.totalSpent || lead.averageTicket) && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          {lead.totalSpent && (
                            <div>Total Gasto: R$ {lead.totalSpent.toLocaleString('pt-BR')}</div>
                          )}
                          {lead.averageTicket && (
                            <div>Ticket Médio: R$ {lead.averageTicket.toLocaleString('pt-BR')}</div>
                          )}
                        </div>
                      )}
                    </div>
                    <Badge className={`${getStatusColor(lead.status)} capitalize`}>
                      {lead.status}
                    </Badge>
                  </div>
                </div>
                {lead.notes && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    <strong>Notas:</strong> {lead.notes}
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