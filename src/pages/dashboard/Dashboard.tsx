
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
  


  // Remove console logs for performance
  // Only log in development mode
  if (process.env.NODE_ENV === 'development') {
    console.log('[DASHBOARD] Renderizando Dashboard. Profile:', profile);
    if (profile) {
      console.log('[DASHBOARD] Tipo:', profile.tipo, '| Plano:', profile.plano_medico);
    }
  }

  const quickActions = [
    {
      title: "Nova Consulta",
      description: "Agendar nova consulta",
      href: "/clinica/agenda",
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

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">
            Olá, {profile?.nome || 'Usuário'}!
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {profile?.tipo === 'medico' && `${profile?.especialidade || 'Médico'} - CRM: ${profile?.crm || 'N/A'}`}
            {profile?.tipo === 'clinica' && 'Painel da Clínica'}
            {profile?.tipo === 'hospital' && 'Painel Hospitalar'}
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
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

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-2">
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">Ações Rápidas</CardTitle>
            <CardDescription className="text-sm">
              Acesse rapidamente as funcionalidades mais utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {quickActions.map((action, index) => {
                if (action.type === "modal") {
                  return (
                    <PacienteSelectorModal
                      key={index}
                      trigger={
                        <Button
                          variant="outline"
                          className="h-16 sm:h-20 w-full flex-col gap-2 hover:bg-muted text-center"
                        >
                          <div className={`p-2 rounded-md ${action.color} text-white`}>
                            {action.icon}
                          </div>
                          <div className="text-center">
                            <div className="font-medium text-xs sm:text-sm">{action.title}</div>
                            <div className="text-xs text-muted-foreground hidden sm:block">{action.description}</div>
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
                      className="h-16 sm:h-20 w-full flex-col gap-2 hover:bg-muted text-center"
                    >
                      <div className={`p-2 rounded-md ${action.color} text-white`}>
                        {action.icon}
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-xs sm:text-sm">{action.title}</div>
                        <div className="text-xs text-muted-foreground hidden sm:block">{action.description}</div>
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
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-5 w-5" />
              Próximas Consultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Calendar className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma consulta agendada</p>
              <Link to="/clinica/agenda">
                <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                  Agendar consulta
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="text-center py-6 sm:py-8 text-muted-foreground">
              <Activity className="h-6 sm:h-8 w-6 sm:w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nenhuma atividade recente</p>
            </div>
          </CardContent>
        </Card>

        {/* Stats Summary */}
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Resumo do Mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-4 sm:px-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Consultas realizadas</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Novos pacientes</span>
              <span className="font-medium">0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Receita gerada</span>
              <span className="font-medium">R$ 0,00</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Taxa de ocupação</span>
              <span className="font-medium">0%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      {profile?.tipo === 'medico' && profile?.plano_medico !== 'premium' && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-4 sm:pt-6 px-4 sm:px-6">
            <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5 sm:mt-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-orange-800">
                Você está no plano gratuito
              </p>
              <p className="text-sm text-orange-700">
                Faça upgrade para acessar recursos avançados como IA médica e relatórios detalhados.
              </p>
            </div>
            <Link to="/planos-acesso" className="w-full sm:w-auto">
              <Button size="sm" className="w-full sm:w-auto">
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
