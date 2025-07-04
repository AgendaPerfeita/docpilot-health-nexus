import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Users, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react"

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral da sua clínica</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Hoje</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultas Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">284</div>
            <p className="text-xs text-muted-foreground">
              +18 este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 45.280</div>
            <p className="text-xs text-muted-foreground">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meta Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <Progress value={78} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              R$ 12.720 restantes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agenda do Dia e Tarefas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Agenda de Hoje
            </CardTitle>
            <CardDescription>
              Próximos compromissos agendados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: "09:00", patient: "Maria Silva", type: "Consulta", status: "confirmed" },
              { time: "10:30", patient: "João Santos", type: "Retorno", status: "pending" },
              { time: "14:00", patient: "Ana Costa", type: "Exame", status: "confirmed" },
              { time: "15:30", patient: "Carlos Lima", type: "Consulta", status: "confirmed" },
              { time: "16:30", patient: "Luiza Pereira", type: "Consulta", status: "pending" }
            ].map((appointment, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-muted-foreground">
                    {appointment.time}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{appointment.patient}</p>
                    <p className="text-xs text-muted-foreground">{appointment.type}</p>
                  </div>
                </div>
                <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"}>
                  {appointment.status === "confirmed" ? "Confirmada" : "Pendente"}
                </Badge>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver Agenda Completa
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Tarefas e Alertas
            </CardTitle>
            <CardDescription>
              Itens que precisam da sua atenção
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { task: "3 receitas para assinar", priority: "high", icon: AlertCircle },
              { task: "5 exames para avaliar", priority: "medium", icon: AlertCircle },
              { task: "2 pacientes para retorno", priority: "medium", icon: Clock },
              { task: "Backup do sistema realizado", priority: "low", icon: CheckCircle, completed: true },
              { task: "Atualizar dados do CRM", priority: "low", icon: AlertCircle }
            ].map((task, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${task.completed ? 'bg-muted/50' : ''}`}>
                <div className="flex items-center gap-3">
                  <task.icon className={`h-4 w-4 ${
                    task.completed ? 'text-green-500' : 
                    task.priority === 'high' ? 'text-red-500' : 
                    task.priority === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                  }`} />
                  <span className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.task}
                  </span>
                </div>
                {!task.completed && (
                  <Badge variant={
                    task.priority === 'high' ? 'destructive' : 
                    task.priority === 'medium' ? 'secondary' : 'outline'
                  }>
                    {task.priority === 'high' ? 'Urgente' : 
                     task.priority === 'medium' ? 'Normal' : 'Baixa'}
                  </Badge>
                )}
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver Todas as Tarefas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 159,20</div>
            <p className="text-xs text-muted-foreground">+5% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taxa de Retorno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">68%</div>
            <p className="text-xs text-muted-foreground">Pacientes que retornaram</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cancelamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3,2%</div>
            <p className="text-xs text-muted-foreground">-1% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}