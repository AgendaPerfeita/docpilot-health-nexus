import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts'
import { TrendingUp, Users, DollarSign, Calendar, Download, Filter, Eye, AlertCircle } from "lucide-react"

const revenueData = [
  { month: 'Jan', receita: 45000, meta: 50000, consultas: 189 },
  { month: 'Fev', receita: 52000, meta: 50000, consultas: 207 },
  { month: 'Mar', receita: 48000, meta: 55000, consultas: 195 },
  { month: 'Abr', receita: 61000, meta: 55000, consultas: 234 },
  { month: 'Mai', receita: 58000, meta: 60000, consultas: 221 },
  { month: 'Jun', receita: 67000, meta: 60000, consultas: 256 }
]

const specialtyData = [
  { name: 'Cardiologia', value: 35, color: '#8884d8' },
  { name: 'Pediatria', value: 28, color: '#82ca9d' },
  { name: 'Ortopedia', value: 22, color: '#ffc658' },
  { name: 'Ginecologia', value: 15, color: '#ff7300' }
]

const patientFlowData = [
  { time: '08:00', novos: 5, retorno: 12 },
  { time: '09:00', novos: 8, retorno: 15 },
  { time: '10:00', novos: 6, retorno: 18 },
  { time: '11:00', novos: 4, retorno: 14 },
  { time: '14:00', novos: 7, retorno: 16 },
  { time: '15:00', novos: 9, retorno: 20 },
  { time: '16:00', novos: 5, retorno: 13 },
  { time: '17:00', novos: 3, retorno: 10 }
]

const satisfactionData = [
  { period: 'Sem 1', satisfacao: 4.2, nps: 68 },
  { period: 'Sem 2', satisfacao: 4.5, nps: 72 },
  { period: 'Sem 3', satisfacao: 4.3, nps: 70 },
  { period: 'Sem 4', satisfacao: 4.7, nps: 78 }
]

export default function BIAvancado() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Intelligence</h1>
          <p className="text-muted-foreground">Análises avançadas e insights estratégicos para sua clínica</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="30">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Últimos 7 dias</SelectItem>
              <SelectItem value="30">Últimos 30 dias</SelectItem>
              <SelectItem value="90">Últimos 3 meses</SelectItem>
              <SelectItem value="365">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita Mensal</p>
                <p className="text-2xl font-bold">R$ 67.400</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12% vs mês anterior
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pacientes Ativos</p>
                <p className="text-2xl font-bold">1.247</p>
                <p className="text-xs text-blue-600 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" />
                  +8% este mês
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Ocupação</p>
                <p className="text-2xl font-bold">87%</p>
                <p className="text-xs text-purple-600 flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Acima da meta
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">NPS Score</p>
                <p className="text-2xl font-bold">78</p>
                <p className="text-xs text-yellow-600 flex items-center mt-1">
                  <Eye className="h-3 w-3 mr-1" />
                  Zona de excelência
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financeiro" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="operacional">Operacional</TabsTrigger>
          <TabsTrigger value="pacientes">Pacientes</TabsTrigger>
          <TabsTrigger value="qualidade">Qualidade</TabsTrigger>
          <TabsTrigger value="predictive">Preditivo</TabsTrigger>
        </TabsList>

        <TabsContent value="financeiro" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receita vs Meta</CardTitle>
                <CardDescription>Comparativo mensal de performance financeira</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value.toLocaleString()}`, '']} />
                    <Legend />
                    <Bar dataKey="receita" fill="#8884d8" name="Receita Real" />
                    <Bar dataKey="meta" fill="#82ca9d" name="Meta" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Especialidade</CardTitle>
                <CardDescription>Receita por área médica</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={specialtyData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {specialtyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise de Rentabilidade por Médico</CardTitle>
              <CardDescription>Performance individual da equipe médica</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Dr. João Silva", specialty: "Cardiologia", consultas: 156, receita: 31200, comissao: 9360 },
                  { name: "Dra. Maria Santos", specialty: "Pediatria", receita: 28400, consultas: 142, comissao: 8520 },
                  { name: "Dr. Carlos Lima", specialty: "Ortopedia", receita: 24800, consultas: 124, comissao: 7440 }
                ].map((medico, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{medico.name}</h4>
                      <p className="text-sm text-muted-foreground">{medico.specialty}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-8 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Consultas</p>
                        <p className="font-semibold">{medico.consultas}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Receita</p>
                        <p className="font-semibold text-green-600">R$ {medico.receita.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Comissão</p>
                        <p className="font-semibold text-blue-600">R$ {medico.comissao.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operacional" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Pacientes por Horário</CardTitle>
                <CardDescription>Distribuição de consultas ao longo do dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={patientFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="novos" stackId="1" stroke="#8884d8" fill="#8884d8" name="Novos Pacientes" />
                    <Area type="monotone" dataKey="retorno" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Retornos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Eficiência Operacional</CardTitle>
                <CardDescription>Métricas de performance da clínica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tempo Médio de Consulta</span>
                  <div className="text-right">
                    <span className="font-semibold">28 min</span>
                    <p className="text-xs text-green-600">-2 min vs média</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Taxa de No-Show</span>
                  <div className="text-right">
                    <span className="font-semibold">8.2%</span>
                    <p className="text-xs text-red-600">+1.2% vs mês anterior</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tempo de Espera Médio</span>
                  <div className="text-right">
                    <span className="font-semibold">12 min</span>
                    <p className="text-xs text-green-600">-3 min vs meta</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Utilização de Salas</span>
                  <div className="text-right">
                    <span className="font-semibold">92%</span>
                    <p className="text-xs text-blue-600">Otimizada</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pacientes" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Segmentação de Pacientes</CardTitle>
                <CardDescription>Análise do perfil dos pacientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Faixa Etária 0-18</span>
                      <span className="font-semibold">23%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Faixa Etária 19-35</span>
                      <span className="font-semibold">31%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '31%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Faixa Etária 36-50</span>
                      <span className="font-semibold">28%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Faixa Etária 50+</span>
                      <span className="font-semibold">18%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fidelização de Pacientes</CardTitle>
                <CardDescription>Análise de retenção e lifetime value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">R$ 2.847</p>
                    <p className="text-sm text-muted-foreground">Lifetime Value Médio</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold">68%</p>
                      <p className="text-xs text-muted-foreground">Taxa de Retorno</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold">4.2</p>
                      <p className="text-xs text-muted-foreground">Consultas por Ano</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Pacientes Novos</span>
                      <Badge variant="outline">15%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pacientes Regulares</span>
                      <Badge variant="secondary">72%</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pacientes VIP</span>
                      <Badge variant="default">13%</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="qualidade" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Satisfação do Paciente</CardTitle>
                <CardDescription>Evolução das avaliações ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={satisfactionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="satisfacao" stroke="#8884d8" name="Satisfação (0-5)" />
                    <Line type="monotone" dataKey="nps" stroke="#82ca9d" name="NPS Score" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Indicadores de Qualidade</CardTitle>
                <CardDescription>Métricas de excelência no atendimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tempo de Resposta WhatsApp</span>
                  <div className="text-right">
                    <span className="font-semibold">2.3 min</span>
                    <p className="text-xs text-green-600">Excelente</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolução no Primeiro Contato</span>
                  <div className="text-right">
                    <span className="font-semibold">87%</span>
                    <p className="text-xs text-green-600">+5% vs meta</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reclamações Formais</span>
                  <div className="text-right">
                    <span className="font-semibold">0.3%</span>
                    <p className="text-xs text-green-600">Muito baixo</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Recomendação NPS</span>
                  <div className="text-right">
                    <span className="font-semibold">78</span>
                    <p className="text-xs text-blue-600">Zona de excelência</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Insights Preditivos</CardTitle>
              <CardDescription>Análises baseadas em machine learning para tomada de decisão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Previsões para os Próximos 30 Dias</h4>
                  <div className="space-y-3">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <TrendingUp className="h-5 w-5 text-green-500 mt-1" />
                        <div>
                          <h5 className="font-medium">Receita Projetada</h5>
                          <p className="text-sm text-muted-foreground">R$ 72.400 (+8% vs atual)</p>
                          <p className="text-xs text-green-600">Alta probabilidade de atingir meta</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-blue-500 mt-1" />
                        <div>
                          <h5 className="font-medium">Novos Pacientes</h5>
                          <p className="text-sm text-muted-foreground">47 novos cadastros esperados</p>
                          <p className="text-xs text-blue-600">15% acima da média mensal</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mt-1" />
                        <div>
                          <h5 className="font-medium">Risco de Cancelamentos</h5>
                          <p className="text-sm text-muted-foreground">12 pacientes com alta probabilidade</p>
                          <p className="text-xs text-yellow-600">Recomenda ação proativa</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Recomendações Estratégicas</h4>
                  <div className="space-y-3">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h5 className="font-medium text-blue-900">Otimização de Agenda</h5>
                      <p className="text-sm text-blue-700 mt-1">
                        Terças-feiras às 14h têm baixa ocupação. Considere promoções específicas.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h5 className="font-medium text-green-900">Expansão de Especialidade</h5>
                      <p className="text-sm text-green-700 mt-1">
                        Demanda por neurologia cresceu 23%. Momento ideal para contratar especialista.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <h5 className="font-medium text-purple-900">Campanha de Retenção</h5>
                      <p className="text-sm text-purple-700 mt-1">
                        34 pacientes não retornam há 6 meses. Campanha personalizada pode recuperar 60%.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}