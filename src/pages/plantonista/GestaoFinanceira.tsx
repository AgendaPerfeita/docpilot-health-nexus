
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  PiggyBank,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const GestaoFinanceira: React.FC = () => {
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  
  const {
    plantoes,
    escalas,
    loading,
    carregarPlantoes,
    carregarEscalas,
    gerarPlantoesDoMes,
    atualizarStatusPlantao
  } = usePlantoesFinanceiro();

  useEffect(() => {
    carregarPlantoes(mesAtual, anoAtual);
    carregarEscalas();
  }, [mesAtual, anoAtual]);

  const calcularResumoFinanceiro = () => {
    const totalRealizado = plantoes
      .filter(p => p.status === 'realizado')
      .reduce((acc, p) => acc + p.valor, 0);
    
    const totalPrevisto = plantoes.reduce((acc, p) => acc + p.valor, 0);
    
    const totalPerdido = plantoes
      .filter(p => p.status === 'faltou')
      .reduce((acc, p) => acc + p.valor, 0);
    
    const plantoesPendentes = plantoes.filter(p => p.status === 'pendente').length;

    return {
      totalRealizado,
      totalPrevisto,
      totalPerdido,
      plantoesPendentes
    };
  };

  const resumo = calcularResumoFinanceiro();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'realizado': return 'bg-green-100 text-green-800';
      case 'faltou': return 'bg-red-100 text-red-800';
      case 'passou': return 'bg-blue-100 text-blue-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'realizado': return <CheckCircle className="h-4 w-4" />;
      case 'faltou': return <XCircle className="h-4 w-4" />;
      case 'passou': return <RefreshCw className="h-4 w-4" />;
      case 'pendente': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Corrigir datas em formato YYYY-MM-DD para data local (evita -1 dia por fuso)
  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
    if (!y || !m || !d) return new Date(dateStr);
    return new Date(y, m - 1, d);
  };

  // Agrupadores
  const plantoesFixos = plantoes.filter(p => p.tipo === 'fixo');
  const plantoesCoringa = plantoes.filter(p => p.tipo === 'coringa');

  // Mapear escalas por id para obter horários/local
  const escalaById = new Map<string, any>();
  escalas.forEach(e => {
    if (e.id) escalaById.set(e.id, e);
  });

  // Agrupar fixos por escala_fixa_id (quando existir) senão por local
  const gruposFixos: { key: string; titulo: string; horario?: string; itens: typeof plantoesFixos }[] = [];
  const tmp: Record<string, typeof plantoesFixos> = {};
  for (const p of plantoesFixos) {
    const key = p.escala_fixa_id || `local:${p.local}`;
    if (!tmp[key]) tmp[key] = [] as any;
    tmp[key].push(p);
  }
  for (const [key, itens] of Object.entries(tmp)) {
    // Derivar título e horário
    let titulo = itens[0]?.local || 'Local';
    let horario: string | undefined;
    const escalaId = itens[0]?.escala_fixa_id;
    if (escalaId && escalaById.has(escalaId)) {
      const esc = escalaById.get(escalaId);
      titulo = esc?.local_nome || titulo;
      if (esc?.horario_inicio && esc?.horario_fim) {
        horario = `${esc.horario_inicio} - ${esc.horario_fim}`;
      }
    }
    gruposFixos.push({ key, titulo, horario, itens: itens.sort((a,b)=>a.data.localeCompare(b.data)) });
  }
  gruposFixos.sort((a,b)=> a.titulo.localeCompare(b.titulo));

  // Corrige exibição de data YYYY-MM-DD (que pode ser interpretada em UTC) para data local
  // parseLocalDate já declarado acima

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

  const anos = Array.from({ length: 5 }, (_, i) => {
    const ano = new Date().getFullYear() - 2 + i;
    return { value: ano.toString(), label: ano.toString() };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header com Filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão Financeira</h1>
          <p className="text-gray-600">Controle seus plantões e rendimentos</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={mesAtual.toString()} onValueChange={(v) => setMesAtual(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {meses.map(mes => (
                <SelectItem key={mes.value} value={mes.value}>
                  {mes.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={anoAtual.toString()} onValueChange={(v) => setAnoAtual(parseInt(v))}>
            <SelectTrigger className="w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map(ano => (
                <SelectItem key={ano.value} value={ano.value}>
                  {ano.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button 
            onClick={() => gerarPlantoesDoMes(anoAtual, mesAtual)}
            variant="outline"
          >
            Gerar Plantões
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Realizado</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {resumo.totalRealizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Previsto</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {resumo.totalPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Perdido</p>
                <p className="text-2xl font-bold text-gray-900">
                  R$ {resumo.totalPerdido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{resumo.plantoesPendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Principal */}
      <Tabs defaultValue="plantoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plantoes">Plantões do Mês</TabsTrigger>
          <TabsTrigger value="escalas">Escalas Fixas</TabsTrigger>
        </TabsList>

        <TabsContent value="plantoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Plantões de {meses.find(m => m.value === mesAtual.toString())?.label} {anoAtual}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {plantoes.length > 0 ? (
                <div className="space-y-6">
                  {/* Fixos (agrupados por escala/local) */}
                  {gruposFixos.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Plantões Fixos</p>
                      <Accordion type="multiple" className="w-full">
                        {gruposFixos.map(grupo => (
                          <AccordionItem key={grupo.key} value={grupo.key}>
                            <AccordionTrigger>
                              <div className="w-full flex items-center justify-between pr-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-semibold">{grupo.titulo}</span>
                                  {grupo.horario && (
                                    <span className="text-xs text-gray-500">{grupo.horario}</span>
                                  )}
                                </div>
                                <span className="text-xs text-gray-500">{grupo.itens.length} dia(s)</span>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {grupo.itens.map(plantao => (
                                  <div key={plantao.id} className="flex items-center justify-between p-3 border rounded-md">
                                    <div className="flex items-center gap-4">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{format(parseLocalDate(plantao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                        <span className="text-xs text-gray-600">{format(parseLocalDate(plantao.data), 'EEEE', { locale: ptBR })}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold">R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                      <Badge className={`flex items-center gap-1 ${getStatusColor(plantao.status)}`}>
                                        {getStatusIcon(plantao.status)}
                                        {plantao.status}
                                      </Badge>
                                      <Select value={plantao.status} onValueChange={(status) => atualizarStatusPlantao(plantao.id, status)}>
                                        <SelectTrigger className="w-32">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="pendente">Pendente</SelectItem>
                                          <SelectItem value="realizado">Realizado</SelectItem>
                                          <SelectItem value="faltou">Faltou</SelectItem>
                                          <SelectItem value="passou">Passou</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}

                  {/* Coringas (avulsos) */}
                  {plantoesCoringa.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Plantões Coringa</p>
                      <div className="space-y-2">
                        {plantoesCoringa.sort((a,b)=> a.data.localeCompare(b.data)).map(plantao => (
                          <div key={plantao.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col">
                                <span className="font-medium">{format(parseLocalDate(plantao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                <span className="text-xs text-gray-600">{format(parseLocalDate(plantao.data), 'EEEE', { locale: ptBR })}</span>
                              </div>
                              <div className="text-xs text-gray-500">{plantao.horario_inicio} - {plantao.horario_fim}</div>
                              <div className="text-xs text-gray-600 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" /> {plantao.local}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-semibold">R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <Badge className={`flex items-center gap-1 ${getStatusColor(plantao.status)}`}>
                                {getStatusIcon(plantao.status)}
                                {plantao.status}
                              </Badge>
                              <Select value={plantao.status} onValueChange={(status) => atualizarStatusPlantao(plantao.id, status)}>
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendente">Pendente</SelectItem>
                                  <SelectItem value="realizado">Realizado</SelectItem>
                                  <SelectItem value="faltou">Faltou</SelectItem>
                                  <SelectItem value="passou">Passou</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum plantão encontrado para este período</p>
                  <Button 
                    onClick={() => gerarPlantoesDoMes(anoAtual, mesAtual)}
                    className="mt-4"
                  >
                    Gerar Plantões do Mês
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="escalas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PiggyBank className="h-5 w-5" />
                Escalas Fixas Configuradas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {escalas.length > 0 ? (
                <div className="space-y-4">
                  {escalas.map((escala) => (
                    <div 
                      key={escala.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="font-medium">{escala.local_nome}</p>
                          <p className="text-sm text-gray-600">
                            {['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][escala.dia_semana]} - 
                            {escala.horario_inicio} às {escala.horario_fim}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">
                          R$ {escala.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês
                        </p>
                        <p className="text-sm text-gray-600">
                          Pagamento: dia {escala.data_pagamento}
                        </p>
                      </div>
                      
                      <Badge variant={escala.ativo ? "default" : "secondary"}>
                        {escala.ativo ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <PiggyBank className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhuma escala fixa configurada</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Configure suas escalas fixas na seção "Locais de Trabalho"
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GestaoFinanceira;
