import { useAuth } from "@/hooks/useAuth";
import { DashboardCards } from "@/components/modules/dashboard/DashboardCards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  Calendar, 
  TrendingUp, 
  Clock,
  FileText,
  Stethoscope,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { PacienteSelectorModal } from "@/components/prontuario/PacienteSelectorModal";

const Dashboard = () => {
  const { profile } = useAuth();

  const quickActions = [
    {
      title: "Nova Consulta",
      description: "Agendar nova consulta",
      href: "/agenda",
      icon: <Calendar className="h-5 w-5" />,
      color: "bg-blue-500",
      type: "link"
    },
    {
      title: "Novo Prontuário",
      description: "Criar prontuário médico",
      icon: <FileText className="h-5 w-5" />,
      color: "bg-green-500",
      type: "modal"
    },
    {
      title: "Pacientes",
      description: "Gerenciar pacientes",
      href: "/crm",
      icon: <Users className="h-5 w-5" />,
      color: "bg-purple-500",
      type: "link"
    },
    {
      title: "Prescrição",
      description: "Prescrição digital",
      href: "/prescricao-digital",
      icon: <Stethoscope className="h-5 w-5" />,
      color: "bg-orange-500",
      type: "link"
    }
  ];

  const recentActivities = [
    {
      id: 1,
      type: "consulta",
      title: "Consulta com Maria Silva",
      time: "10:30",
      status: "concluida"
    },
    {
      id: 2,
      type: "prontuario",
      title: "Prontuário - João Santos",
      time: "14:15",
      status: "pendente"
    },
    {
      id: 3,
      type: "paciente",
      title: "Novo paciente cadastrado",
      time: "16:20",
      status: "novo"
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patient: "Ana Costa",
      time: "09:00",
      type: "Consulta de rotina"
    },
    {
      id: 2,
      patient: "Carlos Lima",
      time: "10:30",
      type: "Retorno"
    },
    {
      id: 3,
      patient: "Beatriz Santos",
      time: "14:00",
      type: "Primeira consulta"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Olá, {profile?.nome || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground">
            {profile?.tipo === 'medico' && `${profile?.especialidade || 'Médico'} - CRM: ${profile?.crm || 'N/A'}`}
            {profile?.tipo === 'clinica' && 'Painel da Clínica'}
            {profile?.tipo === 'hospital' && 'Painel Hospitalar'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {profile?.tipo}
          </Badge>
          <Badge variant="secondary">
            Ativo
          </Badge>
        </div>
      </div>

      {/* Dashboard Cards */}
      <DashboardCards />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="col-span-full lg:col-span-2">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesse rapidamente as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickActions.map((action, index) => {
                if (action.type === "modal") {
                  return (
                    <PacienteSelectorModal
                      key={index}
                      trigger={
                        <Button
                          variant="outline"
                          className="h-20 w-full flex-col gap-2 hover:bg-muted"
                        >
                          <div className={`p-2 rounded-md ${action.color} text-white`}>
                            {action.icon}
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-muted-foreground">{action.description}</div>
                          </div>
                        </Button>
                      }
                    />
                  );
                }
                
                return (
                  <Link key={index} to={action.href!}>
                    <Button
                      variant="outline"
                      className="h-20 w-full flex-col gap-2 hover:bg-muted"
                    >
                      <div className={`p-2 rounded-md ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma consulta agendada</p>
              <Link to="/agenda">
                <Button variant="outline" size="sm" className="mt-2">
                  Agendar consulta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'concluida' ? 'bg-green-500' :
                    activity.status === 'pendente' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-muted-foreground capitalize">{activity.type}</div>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Consultas realizadas</span>
              <span className="font-medium">45</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Novos pacientes</span>
              <span className="font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receita gerada</span>
              <span className="font-medium">R$ 8.750</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxa de ocupação</span>
              <span className="font-medium">85%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {profile?.tipo === 'medico' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-orange-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-orange-800">
                Você está no plano gratuito
              </p>
              <p className="text-sm text-orange-700">
                Faça upgrade para acessar recursos avançados como IA médica e relatórios detalhados.
              </p>
            </div>
            <Link to="/planos-acesso">
              <Button size="sm">
                Fazer Upgrade
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
