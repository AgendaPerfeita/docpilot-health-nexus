import { useState } from "react"
import { Users, DollarSign, TrendingUp, Calculator, Plus, Search, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Professional {
  id: string
  name: string
  crm: string
  specialty: string
  commissionRates: {
    consulta: number
    exame: number
    procedimento: number
  }
  status: 'ativo' | 'inativo'
}

interface CommissionRecord {
  id: string
  professionalId: string
  professionalName: string
  service: string
  serviceType: 'consulta' | 'exame' | 'procedimento'
  serviceValue: number
  commissionRate: number
  commissionValue: number
  patient: string
  date: string
  status: 'pendente' | 'pago'
}

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Dr. João Silva',
    crm: 'CRM/SP 123456',
    specialty: 'Clínica Geral',
    commissionRates: {
      consulta: 60,
      exame: 40,
      procedimento: 50
    },
    status: 'ativo'
  },
  {
    id: '2',
    name: 'Dra. Ana Costa',
    crm: 'CRM/SP 789012',
    specialty: 'Cardiologia',
    commissionRates: {
      consulta: 65,
      exame: 45,
      procedimento: 55
    },
    status: 'ativo'
  },
  {
    id: '3',
    name: 'Dr. Carlos Lima',
    crm: 'CRM/SP 345678',
    specialty: 'Ortopedia',
    commissionRates: {
      consulta: 60,
      exame: 40,
      procedimento: 60
    },
    status: 'ativo'
  }
]

const mockCommissions: CommissionRecord[] = [
  {
    id: '1',
    professionalId: '1',
    professionalName: 'Dr. João Silva',
    service: 'Consulta Clínica',
    serviceType: 'consulta',
    serviceValue: 200,
    commissionRate: 60,
    commissionValue: 120,
    patient: 'Ana Silva',
    date: '2024-01-15',
    status: 'pendente'
  },
  {
    id: '2',
    professionalId: '2',
    professionalName: 'Dra. Ana Costa',
    service: 'Consulta Cardiológica',
    serviceType: 'consulta',
    serviceValue: 300,
    commissionRate: 65,
    commissionValue: 195,
    patient: 'Carlos Santos',
    date: '2024-01-14',
    status: 'pago'
  },
  {
    id: '3',
    professionalId: '1',
    professionalName: 'Dr. João Silva',
    service: 'Exame Cardiológico',
    serviceType: 'exame',
    serviceValue: 150,
    commissionRate: 40,
    commissionValue: 60,
    patient: 'Maria Oliveira',
    date: '2024-01-12',
    status: 'pago'
  }
]

export default function Comissoes() {
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals)
  const [commissions] = useState<CommissionRecord[]>(mockCommissions)
  const [selectedProfessional, setSelectedProfessional] = useState<string>('todos')
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7))
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddingProfessional, setIsAddingProfessional] = useState(false)

  const filteredCommissions = commissions.filter(commission => {
    const matchesProfessional = selectedProfessional === 'todos' || commission.professionalId === selectedProfessional
    const matchesMonth = commission.date.startsWith(selectedMonth)
    const matchesSearch = commission.professionalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         commission.patient.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesProfessional && matchesMonth && matchesSearch
  })

  const getCommissionSummary = () => {
    const currentMonthCommissions = commissions.filter(c => c.date.startsWith(selectedMonth))
    
    const totalCommissions = currentMonthCommissions.reduce((sum, c) => sum + c.commissionValue, 0)
    const paidCommissions = currentMonthCommissions.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.commissionValue, 0)
    const pendingCommissions = currentMonthCommissions.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.commissionValue, 0)
    
    return { totalCommissions, paidCommissions, pendingCommissions }
  }

  const getProfessionalSummary = (professionalId: string) => {
    const profCommissions = commissions.filter(c => c.professionalId === professionalId && c.date.startsWith(selectedMonth))
    const total = profCommissions.reduce((sum, c) => sum + c.commissionValue, 0)
    const paid = profCommissions.filter(c => c.status === 'pago').reduce((sum, c) => sum + c.commissionValue, 0)
    const pending = profCommissions.filter(c => c.status === 'pendente').reduce((sum, c) => sum + c.commissionValue, 0)
    
    return { total, paid, pending, count: profCommissions.length }
  }

  const handleAddProfessional = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    
    const newProfessional: Professional = {
      id: Date.now().toString(),
      name: formData.get('name') as string,
      crm: formData.get('crm') as string,
      specialty: formData.get('specialty') as string,
      commissionRates: {
        consulta: Number(formData.get('consultaRate')),
        exame: Number(formData.get('exameRate')),
        procedimento: Number(formData.get('procedimentoRate'))
      },
      status: 'ativo'
    }
    
    setProfessionals([...professionals, newProfessional])
    setIsAddingProfessional(false)
  }

  const summary = getCommissionSummary()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Controle de Comissões</h1>
          <p className="text-muted-foreground">Gestão de comissões por profissional</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Relatório
          </Button>
          <Dialog open={isAddingProfessional} onOpenChange={setIsAddingProfessional}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Novo Profissional
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Profissional</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddProfessional} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="crm">CRM</Label>
                    <Input id="crm" name="crm" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input id="specialty" name="specialty" required />
                </div>

                <div className="space-y-3">
                  <Label>Percentuais de Comissão (%)</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="consultaRate">Consultas</Label>
                      <Input id="consultaRate" name="consultaRate" type="number" min="0" max="100" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exameRate">Exames</Label>
                      <Input id="exameRate" name="exameRate" type="number" min="0" max="100" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="procedimentoRate">Procedimentos</Label>
                      <Input id="procedimentoRate" name="procedimentoRate" type="number" min="0" max="100" required />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setIsAddingProfessional(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Cadastrar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium">Total Comissões</span>
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              R$ {summary.totalCommissions.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium">Pagas</span>
            </div>
            <div className="text-2xl font-bold text-green-600 mt-2">
              R$ {summary.paidCommissions.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCommissions > 0 ? Math.round((summary.paidCommissions / summary.totalCommissions) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 mt-2">
              R$ {summary.pendingCommissions.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalCommissions > 0 ? Math.round((summary.pendingCommissions / summary.totalCommissions) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="comissoes">
        <TabsList>
          <TabsTrigger value="comissoes">Comissões</TabsTrigger>
          <TabsTrigger value="profissionais">Profissionais</TabsTrigger>
        </TabsList>

        <TabsContent value="comissoes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Comissões</CardTitle>
                <div className="flex gap-2">
                  <Input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-40"
                  />
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Profissional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {professionals.map((prof) => (
                        <SelectItem key={prof.id} value={prof.id}>{prof.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCommissions.map((commission) => (
                  <div key={commission.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{commission.professionalName}</div>
                        <div className="text-sm text-muted-foreground">
                          {commission.service} - {commission.patient}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(commission.date).toLocaleDateString('pt-BR')} • Serviço: R$ {commission.serviceValue.toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{commission.commissionRate}% de comissão</div>
                        <div className="font-bold text-foreground">R$ {commission.commissionValue.toLocaleString('pt-BR')}</div>
                      </div>
                      <Badge className={commission.status === 'pago' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200'}>
                        {commission.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profissionais" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {professionals.map((professional) => {
              const summary = getProfessionalSummary(professional.id)
              return (
                <Card key={professional.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{professional.name}</CardTitle>
                      <Badge className={professional.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {professional.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{professional.crm}</p>
                    <p className="text-sm text-muted-foreground">{professional.specialty}</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Percentuais de Comissão</h4>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div className="text-center">
                          <div className="font-medium">{professional.commissionRates.consulta}%</div>
                          <div className="text-muted-foreground">Consultas</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{professional.commissionRates.exame}%</div>
                          <div className="text-muted-foreground">Exames</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{professional.commissionRates.procedimento}%</div>
                          <div className="text-muted-foreground">Procedimentos</div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t">
                      <h4 className="font-medium mb-2">
                        Resumo - {new Date(selectedMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Atendimentos:</span>
                          <span className="font-medium">{summary.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total:</span>
                          <span className="font-medium">R$ {summary.total.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-green-600">
                          <span>Pago:</span>
                          <span className="font-medium">R$ {summary.paid.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Pendente:</span>
                          <span className="font-medium">R$ {summary.pending.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}