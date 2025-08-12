import React, { useEffect, useState, useCallback } from 'react';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, List, Grid3X3, ChevronLeft, ChevronRight, RefreshCw, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const now = new Date();
const mesAtual = now.getMonth() + 1;
const anoAtual = now.getFullYear();

const meses = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' }
];

const AgendaPlantonista: React.FC = () => {
  const { plantoes, escalas: escalasHook, loading, carregarPlantoes } = usePlantoesFinanceiro();
  const [mes, setMes] = useState(mesAtual);
  const [ano, setAno] = useState(anoAtual);
  const [escalas, setEscalas] = useState<any[]>([]);
  const [locais, setLocais] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<'lista' | 'calendario'>('lista');
  const { profile } = useAuth();

  // Buscar escalas fixas do usuário para o mês
  const fetchEscalas = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('plantonista_escala_fixa')
      .select('id, valor_mensal, horario_inicio, horario_fim')
      .eq('medico_id', profile.id);
    setEscalas(data || []);
  }, [profile]);

  // Buscar locais de trabalho do usuário
  const fetchLocais = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('plantonista_locais_trabalho')
      .select('id, nome')
      .eq('medico_id', profile.id);
    setLocais(data || []);
  }, [profile]);

  useEffect(() => {
    fetchEscalas();
    fetchLocais();
  }, [fetchEscalas, fetchLocais]);

  // Carregar plantões quando mudar mês/ano (sem causar loops)
  useEffect(() => {
    carregarPlantoes(mes, ano);
  }, [mes, ano]); // Não incluir carregarPlantoes na dependência

  // Calcular dias do mês
  const diasDoMes = React.useMemo(() => {
    const dataInicio = startOfMonth(new Date(ano, mes - 1));
    const dataFim = endOfMonth(new Date(ano, mes - 1));
    const dias = eachDayOfInterval({ start: dataInicio, end: dataFim });
    
    // Obter o dia da semana do primeiro dia (0 = Domingo, 1 = Segunda, etc.)
    const primeiroDiaSemana = dataInicio.getDay();
    
    // Adicionar dias vazios no início para alinhar com o grid
    const diasVazios = Array(primeiroDiaSemana).fill(null);
    
    return [...diasVazios, ...dias];
  }, [mes, ano]);

  // Navegar entre meses
  const mesAnterior = () => {
    if (mes === 1) {
      setMes(12);
      setAno(ano - 1);
    } else {
      setMes(mes - 1);
    }
  };

  const mesPosterior = () => {
    if (mes === 12) {
      setMes(1);
      setAno(ano + 1);
    } else {
      setMes(mes + 1);
    }
  };

  // Obter plantões para um dia específico
  const getPlantoesDoDia = (data: Date) => {
    const dataStr = format(data, 'yyyy-MM-dd');
    return plantoesFiltrados.filter(p => p.data === dataStr);
  };

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizado': return 'bg-green-100 text-green-800';
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Função helper para obter status do plantão (igual ao hook)
  const getPlantaoStatus = (plantao: any) => {
    // Se tem os novos campos, usa eles
    if (plantao.status_plantao) {
      return {
        status_plantao: plantao.status_plantao,
        status_pagamento: plantao.status_pagamento || 'pendente'
      };
    }
    
    // Senão, converte do sistema antigo
    const statusAntigo = plantao.status || plantao.status_pagamento;
    if (statusAntigo === 'pago') {
      return { status_plantao: 'realizado', status_pagamento: 'pago' };
    } else if (statusAntigo === 'passou') {
      return { status_plantao: 'transferido', status_pagamento: 'pendente' };
    } else if (statusAntigo === 'pendente') {
      return { status_plantao: 'agendado', status_pagamento: 'pendente' };
    } else if (statusAntigo === 'realizado') {
      return { status_plantao: 'realizado', status_pagamento: 'pendente' };
    } else if (statusAntigo === 'faltou') {
      return { status_plantao: 'faltou', status_pagamento: 'pendente' };
    } else if (statusAntigo === 'cancelado') {
      return { status_plantao: 'cancelado', status_pagamento: 'pendente' };
    }
    
    return { status_plantao: 'agendado', status_pagamento: 'pendente' };
  };

  // Filtrar plantões para mostrar apenas os relevantes
  const plantoesFiltrados = React.useMemo(() => {
    return plantoes.filter(plantao => {
      const statusInfo = getPlantaoStatus(plantao);
      
      // Mostrar apenas plantões agendados, realizados ou pendentes
      // Não mostrar cancelados, transferidos ou que faltaram
      return ['agendado', 'realizado'].includes(statusInfo.status_plantao);
    });
  }, [plantoes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 text-gray-800">
            <Calendar className="w-8 h-8 text-blue-600" />
            Agenda de Plantões
          </h1>
          <p className="text-gray-600 text-lg">Visualize e gerencie todos os seus plantões em um só lugar</p>
        </div>

        {/* Controles de Navegação */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={mesAnterior}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Mês Anterior
                </Button>
                <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                  {meses.find(m => m.value === mes.toString())?.label} {ano}
                  {loading && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                </h2>
                <Button variant="outline" size="sm" onClick={mesPosterior}>
                  Próximo Mês
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Toggle de Visualização */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'lista' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('lista')}
                    className="h-8 px-3"
                  >
                    <List className="h-4 w-4 mr-2" />
                    Lista
                  </Button>
                  <Button
                    variant={viewMode === 'calendario' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('calendario')}
                    className="h-8 px-3"
                  >
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    Calendário
                  </Button>
                </div>
                
                <Button variant="outline" size="sm" onClick={() => carregarPlantoes(mes, ano)}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Carregando...' : 'Atualizar'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo da Agenda */}
        {viewMode === 'lista' ? (
          /* Visualização em Lista */
          <div className="space-y-6">
            {/* Plantões Fixos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Plantões Fixos - {meses.find(m => m.value === mes.toString())?.label} {ano} ({plantoesFiltrados.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : plantoesFiltrados.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum plantão encontrado para este mês.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plantoesFiltrados
                      .sort((a, b) => a.data.localeCompare(b.data))
                      .map(plantao => (
                        <div
                          key={plantao.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">
                                {format(parseISO(plantao.data), 'dd', { locale: ptBR })}
                              </div>
                              <div className="text-xs text-gray-500 uppercase">
                                {format(parseISO(plantao.data), 'MMM', { locale: ptBR })}
                              </div>
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">{plantao.local}</span>
                                {/* Badge especial para plantões coringa */}
                                {plantao.tipo === 'coringa' && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    <Zap className="h-3 w-3 mr-1" /> Coringa
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600">
                                {plantao.horario_inicio && plantao.horario_fim ? (
                                  `${plantao.horario_inicio.substring(0, 5)} - ${plantao.horario_fim.substring(0, 5)}`
                                ) : (
                                  'Horário não definido'
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-700">
                                R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(parseISO(plantao.data), 'EEEE', { locale: ptBR })}
                              </div>
                            </div>
                            
                            <Badge className={getStatusColor(getPlantaoStatus(plantao).status_plantao)}>
                              {getPlantaoStatus(plantao).status_plantao}
                            </Badge>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Escalas Fixas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Escalas Fixas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {escalasHook.length === 0 ? (
                  <p className="text-gray-500">Nenhuma escala fixa cadastrada.</p>
                ) : (
                  <ul className="divide-y">
                    {escalasHook.map(e => (
                      <li key={e.id} className="py-3 flex items-center gap-4">
                        <Clock className="w-5 h-5 text-indigo-400" />
                        <span className="font-medium w-24">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][e.dia_semana]}
                        </span>
                        <span className="text-sm text-gray-500 w-48">
                          {e.local_nome} | {e.horario_inicio && e.horario_fim ? (
                            `${e.horario_inicio.substring(0, 5)} - ${e.horario_fim.substring(0, 5)}`
                          ) : (
                            'Horário não definido'
                          )}
                        </span>
                        <span className="text-sm text-gray-600">R$ {e.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                        <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-auto">{e.ativo ? 'Ativo' : 'Inativo'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Visualização em Calendário - Melhorada e Responsiva */
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Grid3X3 className="h-5 w-5" />
                Calendário de Plantões - {meses.find(m => m.value === mes.toString())?.label} {ano}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-[800px] max-w-full">
                    {/* Grid responsivo do calendário */}
                    <div className="grid grid-cols-7 gap-1 bg-gradient-to-br from-gray-50 to-gray-100 p-2 rounded-xl shadow-sm">
                      {/* Cabeçalhos dos dias da semana */}
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(dia => (
                        <div key={dia} className="p-3 text-center font-semibold text-gray-700 bg-white rounded-lg shadow-sm border border-gray-100 text-sm">
                          {dia}
                        </div>
                      ))}
                      
                      {/* Dias do mês - Layout compacto e responsivo */}
                      {diasDoMes.map((data, index) => {
                        // Se não há data (dia vazio), renderizar célula vazia
                        if (!data) {
                          return (
                            <div
                              key={`empty-${index}`}
                              className="min-h-[80px] p-1 bg-transparent rounded-lg"
                            />
                          );
                        }
                        
                        const plantoesDoDia = getPlantoesDoDia(data);
                        const isMesAtual = isSameMonth(data, new Date(ano, mes - 1));
                        const isHoje = isSameDay(data, new Date());
                        
                        return (
                          <div
                            key={index}
                            className={`
                              min-h-[80px] p-1 rounded-lg transition-all duration-200
                              ${isHoje 
                                ? 'bg-gradient-to-br from-blue-50 to-blue-100 ring-2 ring-blue-300 shadow-md' 
                                : 'bg-white hover:bg-gray-50 hover:shadow-md'
                              }
                              ${plantoesDoDia.length > 0 
                                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200' 
                                : 'border border-gray-200'
                              }
                              shadow-sm
                            `}
                          >
                            {/* Número do dia */}
                            <div className={`
                              text-xs font-bold mb-1 text-center rounded-full w-5 h-5 flex items-center justify-center mx-auto
                              ${isHoje 
                                ? 'bg-blue-500 text-white shadow-sm' 
                                : 'text-gray-700'
                              }
                            `}>
                              {format(data, 'd')}
                            </div>
                            
                            {/* Plantões do dia - Layout compacto */}
                            <div className="space-y-1">
                              {plantoesDoDia.slice(0, 2).map((plantao, idx) => (
                                <div
                                  key={`${plantao.id}-${idx}`}
                                  className="p-1.5 bg-white rounded-lg border-l-3 border-blue-500 shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                  {/* Local e tipo */}
                                  <div className="font-medium text-gray-800 truncate mb-1 flex items-center gap-1">
                                    <span className="truncate text-xs">{plantao.local}</span>
                                    {plantao.tipo === 'coringa' && (
                                      <Badge variant="outline" className="ml-auto flex-shrink-0 px-1 py-0.5 text-xs bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-300 shadow-sm">
                                        <Zap className="h-2.5 w-2.5 mr-0.5" />
                                      </Badge>
                                    )}
                                  </div>
                                  
                                  {/* Horário compacto */}
                                  <div className="text-gray-600 text-xs mb-1 flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5 text-gray-400" />
                                    {plantao.horario_inicio && plantao.horario_fim ? (
                                      `${plantao.horario_inicio.substring(0, 5)}-${plantao.horario_fim.substring(0, 5)}`
                                    ) : (
                                      '--:--'
                                    )}
                                  </div>
                                  
                                  {/* Valor e status compactos */}
                                  <div className="flex items-center justify-between">
                                    <span className="text-green-700 font-bold text-xs">
                                      R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                                    </span>
                                    <Badge className={`
                                      text-xs px-1.5 py-0.5 rounded-full font-medium shadow-sm
                                      ${getStatusColor(getPlantaoStatus(plantao).status_plantao)}
                                    `}>
                                      {getPlantaoStatus(plantao).status_plantao.charAt(0).toUpperCase()}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              
                              {/* Indicador de mais plantões */}
                              {plantoesDoDia.length > 2 && (
                                <div className="text-center text-xs text-gray-600 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full px-1.5 py-0.5 font-medium">
                                  +{plantoesDoDia.length - 2} mais
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgendaPlantonista;