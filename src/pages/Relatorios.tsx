import { useState } from "react"
import { BarChart3, TrendingUp, Users, Calendar, Download, Filter, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/PermissionGuard"
import { useAuth } from "@/hooks/useAuth";

interface ReportData {
  type: string
  title: string
  description: string
  lastGenerated: string
  status: 'disponivel' | 'processando' | 'erro'
  size?: string
}

const availableReports: ReportData[] = [
  {
    type: 'atendimentos',
    title: 'Relatório de Atendimentos',
    description: 'Consultas realizadas por período, profissional e especialidade',
    lastGenerated: '2024-01-15',
    status: 'disponivel',
    size: '2.4 MB'
  },
  {
    type: 'financeiro',
    title: 'Relatório Financeiro',
    description: 'Receitas, despesas e fluxo de caixa detalhado',
    lastGenerated: '2024-01-15',
    status: 'disponivel',
    size: '1.8 MB'
  },
  {
    type: 'pacientes',
    title: 'Relatório de Pacientes',
    description: 'Cadastros, retorno e perfil demográfico dos pacientes',
    lastGenerated: '2024-01-14',
    status: 'disponivel',
    size: '3.1 MB'
  },
  {
    type: 'comissoes',
    title: 'Relatório de Comissões',
    description: 'Comissões por profissional e período',
    lastGenerated: '2024-01-14',
    status: 'disponivel',
    size: '856 KB'
  },
  {
    type: 'performance',
    title: 'Relatório de Performance',
    description: 'Indicadores de desempenho e produtividade',
    lastGenerated: '2024-01-13',
    status: 'processando'
  },
  {
    type: 'marketing',
    title: 'Relatório de Marketing',
    description: 'Origem dos leads, conversões e ROI das campanhas',
    lastGenerated: '2024-01-12',
    status: 'disponivel',
    size: '1.2 MB'
  }
]

const analyticsData = {
  overview: {
    totalPatients: 1247,
    newPatientsThisMonth: 78,
    totalRevenue: 125000,
    averageTicket: 285,
    appointmentsThisMonth: 342,
    conversionRate: 68.5
  },
  trends: {
    patientsGrowth: 12.5,
    revenueGrowth: 8.3,
    appointmentsGrowth: -2.1,
    ticketGrowth: 15.7
  }
}

export default function Relatorios() {
  const { profile, loadingProfile } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('mensal')
  const [selectedReport, setSelectedReport] = useState('todos')
  const [dateRange, setDateRange] = useState({
    start: '2024-01-01',
    end: '2024-01-31'
  })

  if (loadingProfile || !profile) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Carregando perfil...</div>;
  }

  const filteredReports = availableReports.filter(report => 
    selectedReport === 'todos' || report.type === selectedReport
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'disponivel': return 'bg-green-100 text-green-800 border-green-200'
      case 'processando': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'erro': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleGenerateReport = (reportType: string) => {
    // Simular geração de relatório
    console.log(`Gerando relatório: ${reportType}`)
  }

  const handleDownloadReport = (reportType: string) => {
    // Simular download de relatório
    console.log(`Baixando relatório: ${reportType}`)
  }

  return (
    <PermissionGuard requiredPermission="permiteRelatoriosAvancados">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios e BI</h1>
          <p className="text-muted-foreground">Analytics e relatórios gerenciais</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Semanal</SelectItem>
              <SelectItem value="mensal">Mensal</SelectItem>
              <SelectItem value="trimestral">Trimestral</SelectItem>
              <SelectItem value="anual">Anual</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Total de Pacientes</span>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {analyticsData.overview.totalPatients.toLocaleString()}
                </div>
                <div className={`text-sm ${analyticsData.trends.patientsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.trends.patientsGrowth > 0 ? '+' : ''}{analyticsData.trends.patientsGrowth}% vs mês anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Receita Total</span>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  R$ {analyticsData.overview.totalRevenue.toLocaleString('pt-BR')}
                </div>
                <div className={`text-sm ${analyticsData.trends.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.trends.revenueGrowth > 0 ? '+' : ''}{analyticsData.trends.revenueGrowth}% vs mês anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Ticket Médio</span>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  R$ {analyticsData.overview.averageTicket.toLocaleString('pt-BR')}
                </div>
                <div className={`text-sm ${analyticsData.trends.ticketGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.trends.ticketGrowth > 0 ? '+' : ''}{analyticsData.trends.ticketGrowth}% vs mês anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-600" />
                  <span className="text-sm font-medium">Consultas no Mês</span>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {analyticsData.overview.appointmentsThisMonth}
                </div>
                <div className={`text-sm ${analyticsData.trends.appointmentsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analyticsData.trends.appointmentsGrowth > 0 ? '+' : ''}{analyticsData.trends.appointmentsGrowth}% vs mês anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-teal-600" />
                  <span className="text-sm font-medium">Novos Pacientes</span>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {analyticsData.overview.newPatientsThisMonth}
                </div>
                <div className="text-sm text-muted-foreground">
                  Este mês
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  <span className="text-sm font-medium">Taxa de Conversão</span>
                </div>
                <div className="text-2xl font-bold text-foreground mt-2">
                  {analyticsData.overview.conversionRate}%
                </div>
                <div className="text-sm text-muted-foreground">
                  Leads para consultas
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Atendimentos por Especialidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clínica Geral</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full w-3/4"></div>
                      </div>
                      <span className="text-sm font-medium">156</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cardiologia</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-2/3"></div>
                      </div>
                      <span className="text-sm font-medium">98</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Ortopedia</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full w-1/2"></div>
                      </div>
                      <span className="text-sm font-medium">72</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Outros</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full w-1/4"></div>
                      </div>
                      <span className="text-sm font-medium">45</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Origem dos Pacientes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Facebook</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full w-1/4"></div>
                      </div>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Instagram</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-pink-500 h-2 rounded-full w-1/5"></div>
                      </div>
                      <span className="text-sm font-medium">18%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Indicação</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full w-1/4"></div>
                      </div>
                      <span className="text-sm font-medium">22%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Google</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full w-1/6"></div>
                      </div>
                      <span className="text-sm font-medium">14%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Marketplace</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full w-1/8"></div>
                      </div>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">WhatsApp</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div className="bg-green-700 h-2 rounded-full w-1/8"></div>
                      </div>
                      <span className="text-sm font-medium">12%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Relatórios Disponíveis</CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedReport} onValueChange={setSelectedReport}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Tipo de relatório" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos os Relatórios</SelectItem>
                      <SelectItem value="atendimentos">Atendimentos</SelectItem>
                      <SelectItem value="financeiro">Financeiro</SelectItem>
                      <SelectItem value="pacientes">Pacientes</SelectItem>
                      <SelectItem value="comissoes">Comissões</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredReports.map((report) => (
                  <Card key={report.type}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <BarChart3 className="h-8 w-8 text-primary" />
                          <div>
                            <h3 className="font-medium text-foreground">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Última geração:</span>
                          <span>{new Date(report.lastGenerated).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {report.size && (
                          <div className="flex justify-between">
                            <span>Tamanho:</span>
                            <span>{report.size}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          onClick={() => handleGenerateReport(report.type)}
                          disabled={report.status === 'processando'}
                        >
                          Gerar Novo
                        </Button>
                        {report.status === 'disponivel' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleDownloadReport(report.type)}
                              className="gap-1"
                            >
                              <Download className="h-3 w-3" />
                              Baixar
                            </Button>
                            <Button size="sm" variant="outline" className="gap-1">
                              <Eye className="h-3 w-3" />
                              Visualizar
                            </Button>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Período</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Inicial</label>
                    <Input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Data Final</label>
                    <Input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    />
                  </div>
                </div>
                <Button className="w-full">Aplicar Filtros</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exportar Dados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Exporte seus dados em diferentes formatos para análise externa.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Exportar CSV
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Excel
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Exportar PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </PermissionGuard>
  )
}