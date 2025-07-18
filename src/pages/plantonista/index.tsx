import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, DollarSign, FileText, MapPin, Plus, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlantonista } from '@/hooks/usePlantonista';
import { Tables } from '@/integrations/supabase/types';

type PlantonistaSessao = Tables<'plantonista_sessoes'>;
type PlantonistaAtendimento = Tables<'plantonista_atendimentos'>;

export default function PlantonistaDashboard() {
  const navigate = useNavigate();
  const { 
    sessoes,
    atendimentos,
    loading,
    buscarSessoes,
    buscarAtendimentos,
    buscarSessaoAtiva,
    buscarAtendimentoAtivo
  } = usePlantonista();

  const [sessaoAtiva, setSessaoAtiva] = useState<PlantonistaSessao | null>(null);
  const [atendimentoAtivo, setAtendimentoAtivo] = useState<PlantonistaAtendimento | null>(null);

  useEffect(() => {
    const init = async () => {
      await buscarSessoes();
      await buscarAtendimentos();
      
      const sessaoAtual = await buscarSessaoAtiva();
      setSessaoAtiva(sessaoAtual);
      
      const atendimentoAtual = await buscarAtendimentoAtivo();
      setAtendimentoAtivo(atendimentoAtual);
    };
    
    init();
  }, []);

  // Estatísticas do dia
  const sessaoHoje = sessoes.find(s => {
    const hoje = new Date().toDateString();
    return new Date(s.created_at || '').toDateString() === hoje;
  });

  const atendimentosHoje = atendimentos.filter(a => {
    const hoje = new Date().toDateString();
    return new Date(a.created_at || '').toDateString() === hoje;
  });

  const atendimentosFinalizados = atendimentosHoje.filter(a => a.status === 'finalizado');
  const tempoMedioAtendimento = atendimentosFinalizados.length > 0 
    ? Math.round(atendimentosFinalizados.reduce((acc, a) => {
        const inicio = new Date(a.created_at || '');
        const fim = new Date(a.updated_at || '');
        return acc + (fim.getTime() - inicio.getTime());
      }, 0) / atendimentosFinalizados.length / 60000) // em minutos
    : 0;

  const estatisticas = [
    {
      titulo: "Atendimentos Hoje",
      valor: atendimentosHoje.length.toString(),
      descricao: `${atendimentosFinalizados.length} finalizados`,
      icone: Users,
      cor: "text-blue-600"
    },
    {
      titulo: "Tempo Médio",
      valor: `${tempoMedioAtendimento}min`,
      descricao: "Por atendimento",
      icone: Clock,
      cor: "text-green-600"
    },
    {
      titulo: "Sessão Ativa",
      valor: sessaoAtiva ? "Ativa" : "Inativa",
      descricao: sessaoAtiva ? `${sessaoAtiva.local_trabalho}` : "Iniciar plantão",
      icone: Activity,
      cor: sessaoAtiva ? "text-green-600" : "text-gray-400"
    },
    {
      titulo: "Ganhos Estimados",
      valor: "R$ 0",
      descricao: "Baseado nos atendimentos",
      icone: DollarSign,
      cor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🩺 Dashboard Plantonista
            </h1>
            <p className="text-gray-600">
              Gerencie seus plantões e atendimentos com agilidade
            </p>
          </div>
          
          <div className="flex space-x-3">
            {!sessaoAtiva ? (
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-5 w-5 mr-2" />
                Iniciar Plantão
              </Button>
            ) : (
              <Button size="lg" variant="outline">
                <Activity className="h-5 w-5 mr-2" />
                Finalizar Plantão
              </Button>
            )}
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estatisticas.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
                    <p className="text-sm text-gray-500">{stat.descricao}</p>
                  </div>
                  <stat.icone className={`h-8 w-8 ${stat.cor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Atendimento Ativo */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-600" />
                Atendimento Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {atendimentoAtivo ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">{atendimentoAtivo.paciente_nome || 'Paciente Anônimo'}</h4>
                    <p className="text-sm text-gray-600">
                      Idade: {atendimentoAtivo.paciente_idade || 'N/I'} anos | 
                      Sexo: {atendimentoAtivo.paciente_sexo || 'N/I'}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-gray-700">Queixa Principal:</p>
                    <p className="text-sm text-gray-600">
                      {atendimentoAtivo.queixa_principal || 'Não informado'}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {atendimentoAtivo.status === 'primeiro_atendimento' ? 'Primeiro Atendimento' : 
                       atendimentoAtivo.status === 'em_acompanhamento' ? 'Em Acompanhamento' : 
                       atendimentoAtivo.status}
                    </Badge>
                    <Button size="sm" onClick={() => navigate('/plantonista/atendimento')}>
                      Continuar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Nenhum atendimento ativo</p>
                  <Button onClick={() => navigate('/plantonista/atendimento')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Atendimento
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navegação Rápida */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Acesso Rápido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/plantonista/atendimento')}
                >
                  <FileText className="h-6 w-6 mb-2" />
                  Atendimento
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/plantonista/historico')}
                >
                  <Clock className="h-6 w-6 mb-2" />
                  Histórico
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/plantonista/financeiro')}
                >
                  <DollarSign className="h-6 w-6 mb-2" />
                  Financeiro
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-20 flex-col"
                  onClick={() => navigate('/plantonista/locais')}
                >
                  <MapPin className="h-6 w-6 mb-2" />
                  Locais
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo de Sessões */}
        {sessoes.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Sessões Recentes</CardTitle>
              <CardDescription>Últimas sessões de plantão</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessoes.slice(0, 5).map((sessao) => (
                  <div key={sessao.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-semibold">{sessao.local_trabalho}</h4>
                      <p className="text-sm text-gray-600">
                        {sessao.turno} • {new Date(sessao.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={sessao.status === 'ativa' ? 'default' : 'secondary'}>
                        {sessao.status}
                      </Badge>
                      <p className="text-sm text-gray-600 mt-1">
                        {atendimentos.filter(a => a.sessao_id === sessao.id).length} atendimentos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}