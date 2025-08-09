import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, DollarSign, FileText, MapPin, Plus, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlantonista } from '@/hooks/usePlantonista';
// Types will be imported from the context provider

export default function PlantonistaDashboard() {
  const navigate = useNavigate();
  const { 
    sessoes,
    atendimentos,
    loading,
    buscarSessaoAtiva,
    buscarAtendimentos,
    criarAtendimento
  } = usePlantonista();
  
  const [activeSession, setActiveSession] = useState<any>(null);
  const [todayAttendances, setTodayAttendances] = useState<any[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      const session = await buscarSessaoAtiva();
      setActiveSession(session);
      if (session) {
        await buscarAtendimentos(session.id);
      }
    };
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTodayAttendances(atendimentos);
  }, [atendimentos]);

  const todayRevenue = 0; // Placeholder - não há campo valor no tipo PlantonistaAtendimento

  const startNewAttendance = () => {
    navigate('/plantonista/atendimento');
  };

  const stats = [
    {
      title: "Atendimentos Hoje",
      value: todayAttendances?.length || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Receita Hoje",
      value: `R$ ${todayRevenue?.toFixed(2) || '0,00'}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Tempo Médio",
      value: "45 min",
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Avaliação",
      value: 4.8,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  const quickActions = [
    {
      title: "Novo Atendimento",
      description: "Iniciar atendimento de paciente",
      icon: Plus,
      action: () => startNewAttendance(),
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "Histórico",
      description: "Ver atendimentos anteriores",
      icon: FileText,
      action: () => navigate('/plantonista/historico'),
      color: "bg-green-50 hover:bg-green-600"
    },
    {
      title: "Financeiro",
      description: "Gestão financeira",
      icon: DollarSign,
      action: () => navigate('/plantonista/financeiro'),
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      title: "Locais de Trabalho",
      description: "Gerenciar locais",
      icon: MapPin,
      action: () => navigate('/plantonista/locais'),
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Plantonista</h1>
          <p className="text-gray-600 mt-1">
            {activeSession ? (
              <>
                Sessão ativa em <Badge variant="secondary">{activeSession.local_trabalho}</Badge>
              </>
            ) : (
              "Nenhuma sessão ativa"
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className={`h-5 w-5 ${activeSession ? 'text-green-500' : 'text-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {activeSession ? "Online" : "Offline"}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="hover:shadow-lg transition-all cursor-pointer hover:scale-105"
              onClick={action.action}
            >
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-full ${action.color} text-white`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Atividade Recente</h2>
        <Card>
          <CardHeader>
            <CardTitle>Últimos Atendimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendances && todayAttendances.length > 0 ? (
              <div className="space-y-3">
                {todayAttendances.slice(0, 5).map((attendance, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {attendance.paciente_nome || `Paciente ${attendance.id}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(attendance.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {attendance.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Nenhum atendimento hoje</p>
                <Button 
                  onClick={() => startNewAttendance()} 
                  className="mt-3"
                >
                  Iniciar Primeiro Atendimento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 