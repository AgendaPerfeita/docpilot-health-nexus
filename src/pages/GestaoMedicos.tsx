import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Edit, Eye, UserCheck, Calendar, Clock, DollarSign, TrendingUp } from "lucide-react"

const mockMedicos = [
  {
    id: 1,
    name: "Dr. João Silva",
    crm: "CRM/SP 123456",
    specialty: "Cardiologia",
    email: "joao.silva@clinica.com",
    phone: "(11) 99999-9999",
    status: "ativo",
    plan: "CLINIC PRO",
    consultas: 156,
    revenue: 24800,
    schedule: "Seg-Sex: 8h-18h"
  },
  {
    id: 2,
    name: "Dra. Maria Santos",
    crm: "CRM/SP 789012",
    specialty: "Pediatria",
    email: "maria.santos@clinica.com",
    phone: "(11) 98888-8888",
    status: "ativo",
    plan: "CLINIC",
    consultas: 189,
    revenue: 30240,
    schedule: "Seg-Sex: 9h-17h"
  },
  {
    id: 3,
    name: "Dr. Carlos Lima",
    crm: "CRM/SP 345678",
    specialty: "Ortopedia",
    email: "carlos.lima@clinica.com",
    phone: "(11) 97777-7777",
    status: "ferias",
    plan: "DOCTOR",
    consultas: 98,
    revenue: 15680,
    schedule: "Ter-Sab: 7h-15h"
  }
]

export default function GestaoMedicos() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedMedico, setSelectedMedico] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  const filteredMedicos = mockMedicos.filter(medico =>
    medico.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medico.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Médicos</h1>
          <p className="text-muted-foreground">Gerencie a equipe médica e seus planos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Médico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Médico</DialogTitle>
              <DialogDescription>
                Adicione um novo médico à equipe
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="dados" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dados">Dados Pessoais</TabsTrigger>
                <TabsTrigger value="profissional">Profissional</TabsTrigger>
              </TabsList>
              
              <TabsContent value="dados" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input placeholder="Dr. Nome Sobrenome" />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="medico@clinica.com" />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input placeholder="(11) 99999-9999" />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF</Label>
                    <Input placeholder="000.000.000-00" />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="profissional" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CRM</Label>
                    <Input placeholder="CRM/UF 123456" />
                  </div>
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a especialidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cardiologia">Cardiologia</SelectItem>
                        <SelectItem value="pediatria">Pediatria</SelectItem>
                        <SelectItem value="ortopedia">Ortopedia</SelectItem>
                        <SelectItem value="ginecologia">Ginecologia</SelectItem>
                        <SelectItem value="neurologia">Neurologia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor da Consulta</Label>
                    <Input placeholder="R$ 180,00" />
                  </div>
                  <div className="space-y-2">
                    <Label>Comissão (%)</Label>
                    <Input placeholder="30" type="number" />
                  </div>
                </div>
              </TabsContent>

            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button>
                Cadastrar Médico
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Médicos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Médicos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">10</div>
            <p className="text-xs text-muted-foreground">83% da equipe</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 23.573</div>
            <p className="text-xs text-muted-foreground">Por médico/mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 2.847</div>
            <p className="text-xs text-muted-foreground">Custo mensal total</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Médicos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Equipe Médica</CardTitle>
              <CardDescription>Gerencie médicos, planos e permissões</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar médicos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Médico</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedicos.map((medico) => (
                <TableRow key={medico.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{medico.name}</div>
                      <div className="text-sm text-muted-foreground">{medico.crm}</div>
                      <div className="text-sm text-muted-foreground">{medico.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{medico.specialty}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        medico.plan === 'HOSPITAL' ? 'default' :
                        medico.plan === 'CLINIC PRO' ? 'secondary' : 'outline'
                      }
                    >
                      {medico.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {medico.consultas} consultas
                      </div>
                      <div className="flex items-center gap-1 text-sm text-green-600">
                        <DollarSign className="h-3 w-3" />
                        R$ {medico.revenue.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        medico.status === 'ativo' ? 'default' : 
                        medico.status === 'ferias' ? 'secondary' : 'destructive'
                      }
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      {medico.status.charAt(0).toUpperCase() + medico.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setSelectedMedico(medico); setIsViewDialogOpen(true) }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Médico</DialogTitle>
          </DialogHeader>
          {selectedMedico && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Informações</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="schedule">Agenda</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><strong>Nome:</strong> {selectedMedico.name}</div>
                  <div><strong>CRM:</strong> {selectedMedico.crm}</div>
                  <div><strong>Especialidade:</strong> {selectedMedico.specialty}</div>
                  <div><strong>Email:</strong> {selectedMedico.email}</div>
                  <div><strong>Telefone:</strong> {selectedMedico.phone}</div>
                  <div><strong>Plano:</strong> {selectedMedico.plan}</div>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Consultas este Mês</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedMedico.consultas}</div>
                      <p className="text-xs text-green-600">+12% vs mês anterior</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Receita Gerada</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">R$ {selectedMedico.revenue.toLocaleString()}</div>
                      <p className="text-xs text-green-600">+8% vs mês anterior</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Horário de Funcionamento</h4>
                  <p>{selectedMedico.schedule}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Próximos Compromissos</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">Maria Silva</p>
                        <p className="text-sm text-muted-foreground">Consulta de retorno</p>
                      </div>
                      <div className="text-sm">14:30</div>
                    </div>
                    <div className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">João Santos</p>
                        <p className="text-sm text-muted-foreground">Primeira consulta</p>
                      </div>
                      <div className="text-sm">15:00</div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}