import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Download,
  Plus,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const now = new Date();
const mesAtualDefault = now.getMonth() + 1;
const anoAtualDefault = now.getFullYear();

const GestaoFinanceira: React.FC = () => {
  // Para cards e abas principais: sempre mês/ano atual
  const mesAtual = mesAtualDefault;
  const anoAtual = anoAtualDefault;
  const [activeTab, setActiveTab] = useState('resumo');
  const {
    plantoesFixos,
    plantoesCoringa,
    loading,
    marcarPagoFixo,
    marcarPagoCoringa,
    passarPlantaoFixo,
    criarPlantaoCoringa,
    getMesesAnosDisponiveis,
    refetch // <-- Adicione refetch aqui
  } = usePlantoesFinanceiro(mesAtual, anoAtual);

  // Para relatório: filtro de mês/ano
  const { meses, anos } = getMesesAnosDisponiveis();
  const [mesRelatorio, setMesRelatorio] = useState(mesAtualDefault);
  const [anoRelatorio, setAnoRelatorio] = useState(anoAtualDefault);
  const {
    plantoesFixos: plantoesFixosRel,
    plantoesCoringa: plantoesCoringaRel
  } = usePlantoesFinanceiro(mesRelatorio, anoRelatorio);

  // Gráfico de receitas dos últimos 6 meses (dados reais)
  function getUltimos6Meses() {
    const meses = [];
    const hoje = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      meses.push({
        mes: d.toLocaleString('pt-BR', { month: 'short' }),
        ano: d.getFullYear(),
        value: d.getMonth() + 1
      });
    }
    return meses;
  }

  const receitasPorMes = getUltimos6Meses().map(({ mes, ano, value }) => {
    // Buscar plantões fixos e coringa do mês/ano
    const fixos = plantoesFixos.filter(p => {
      const d = parseISO(p.data);
      return d.getMonth() + 1 === value && d.getFullYear() === ano && !p.foi_passado;
    });
    const coringa = plantoesCoringa.filter(p => {
      const d = parseISO(p.data);
      return d.getMonth() + 1 === value && d.getFullYear() === ano && (!('motivo_cancelamento' in p && p.motivo_cancelamento));
    });
    const valor = fixos.reduce((acc, p) => acc + (typeof p.valor === 'number' ? p.valor : 0), 0) +
      coringa.reduce((acc, p) => acc + (typeof p.valor === 'number' ? p.valor : 0), 0);
    return { mes, valor };
  });

  const { profile } = useAuth();

  // Buscar escalas fixas do usuário para o mês
  const [escalas, setEscalas] = useState<any[]>([]);
  const [locais, setLocais] = useState<any[]>([]);
  const fetchEscalas = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('plantonista_escala_fixa')
      .select('id, valor_mensal, horario_inicio, horario_fim, local_id, dia_semana')
      .eq('medico_id', profile.id);
    setEscalas(data || []);
  }, [profile]);
  const fetchLocais = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('plantonista_locais_trabalho')
      .select('id, nome, faixas')
      .eq('medico_id', profile.id)
      .order('nome', { ascending: true });
    setLocais(data || []);
  }, [profile]);
  useEffect(() => {
    fetchEscalas();
    fetchLocais();
  }, [fetchEscalas, fetchLocais, mesAtual, anoAtual]);

  // Função para calcular o valor do plantão fixo
  function calcularValorPlantaoFixo(plantao: any) {
    const escala = escalas.find(e => e.id === plantao.escala_fixa_id);
    if (!escala) return null;
    // Contar quantos plantões fixos existem para essa escala no mês
    const totalPlantoes = plantoesFixos.filter(p => p.escala_fixa_id === escala.id).length;
    if (!totalPlantoes) return null;
    return escala.valor_mensal / totalPlantoes;
  }

  // Função para obter nome do local e horário
  function infoPlantaoFixo(plantao: any) {
    const escala = escalas.find(e => e.id === plantao.escala_fixa_id);
    const local = locais.find(l => l.id === plantao.local_id);
    const horario = escala ? `${escala.horario_inicio?.slice(0,5)} - ${escala.horario_fim?.slice(0,5)}` : '--';
    return `${local ? local.nome : '--'} | ${horario}`;
  }

  const [localFixo, setLocalFixo] = useState('');
  const [localCoringa, setLocalCoringa] = useState('');

  // Form state para fixo
  const [fixoForm, setFixoForm] = useState({
    dia_semana: 1,
    horario_inicio: '08:00',
    horario_fim: '14:00',
    carga_horaria: '06:00',
    data_pagamento: 15
  });
  // Form state para coringa
  const [coringaForm, setCoringaForm] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    horario_inicio: '08:00',
    horario_fim: '14:00',
    valor: '',
    data_pagamento_prevista: format(new Date(), 'yyyy-MM-dd')
  });
  const [salvando, setSalvando] = useState(false);

  // Função utilitária para calcular diferença de horário em hh:mm
  function calcularCargaHoraria(horario_inicio: string, horario_fim: string) {
    if (!horario_inicio || !horario_fim) return '';
    const [h1, m1] = horario_inicio.split(':').map(Number);
    const [h2, m2] = horario_fim.split(':').map(Number);
    let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutos < 0) minutos += 24 * 60; // caso passe da meia-noite
    const horas = Math.floor(minutos / 60).toString().padStart(2, '0');
    const mins = (minutos % 60).toString().padStart(2, '0');
    return `${horas}:${mins}`;
  }

  // Função robusta para verificar sobreposição de horários em minutos
  function verificaSobreposicao(inicio1: string, fim1: string, inicio2: string, fim2: string): boolean {
    const paraMinutos = (h: string) => {
        const [hora, minuto] = h.split(':').map(Number);
        return hora * 60 + minuto;
    };

    let i1 = paraMinutos(inicio1);
    let f1 = paraMinutos(fim1);
    let i2 = paraMinutos(inicio2);
    let f2 = paraMinutos(fim2);

    // Normaliza para plantões que viram a meia-noite
    if (f1 <= i1) f1 += 24 * 60;
    if (f2 <= i2) f2 += 24 * 60;

    // A lógica (i1 < f2 && i2 < f1) permite que os horários se "toquem" (ex: fim 19:00 e início 19:00)
    return i1 < f2 && i2 < f1;
  }

  // Função para criar plantão fixo
  async function handleCriarFixo(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (!profile || !localFixo) return;
      // Buscar o local selecionado
      const local = locais.find(l => l.id === localFixo);
      if (!local) return;

      const valorFixo = local.faixas && Array.isArray(local.faixas) && local.faixas[0] && local.faixas[0].valor ? Number(local.faixas[0].valor) : 0;
      
      if (!valorFixo || valorFixo === 0) {
        toast({
          title: 'Valor do local zerado',
          description: 'O valor na faixa de pagamento do local selecionado está zerado. Edite o local de trabalho e defina um valor antes de criar a escala.',
          variant: 'destructive'
        });
        setSalvando(false);
        return;
      }
      // Validação de sobreposição de horários (independente do local)
      const { data: escalasExistentes } = await supabase
        .from('plantonista_escala_fixa')
        .select('*')
        .eq('medico_id', profile.id)
        .eq('dia_semana', fixoForm.dia_semana);
      if (escalasExistentes) {
        for (const escala of escalasExistentes) {
          if (verificaSobreposicao(
            fixoForm.horario_inicio,
            fixoForm.horario_fim,
            escala.horario_inicio,
            escala.horario_fim
          )) {
            toast({
              title: 'Horário em conflito',
              description: 'Já existe uma escala fixa para este dia e horário (independente do local). Ajuste para não sobrepor.',
              variant: 'destructive'
            });
            setSalvando(false);
            return;
          }
        }
      }
      // Converter carga_horaria para 'HH:MM:00'
      const cargaHorariaFormatada = fixoForm.carga_horaria.length === 5 ? fixoForm.carga_horaria + ':00' : fixoForm.carga_horaria;
      const payload: any = {
        dia_semana: fixoForm.dia_semana,
        horario_inicio: fixoForm.horario_inicio,
        horario_fim: fixoForm.horario_fim,
        carga_horaria: cargaHorariaFormatada,
        data_pagamento: fixoForm.data_pagamento,
        medico_id: profile.id,
        local_id: localFixo,
        valor_mensal: valorFixo
      };
      console.log('Payload enviado para plantonista_escala_fixa:', payload);
      await supabase.from('plantonista_escala_fixa').insert(payload);
      setLocalFixo('');
    } finally {
      setSalvando(false);
    }
  }
  // Função para criar plantão coringa
  async function handleCriarCoringa(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      if (!profile || !localCoringa) return;

      // Buscar todos os plantões fixos e coringa do local para a data
      const { data: plantoesFixo } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select('id, data, escala_fixa_id')
        .eq('local_id', localCoringa)
        .eq('data', coringaForm.data);
        
      const { data: plantoesCoringa } = await supabase
        .from('plantonista_plantao_coringa')
        .select('id, data, horario_inicio, horario_fim')
        .eq('local_id', localCoringa)
        .eq('data', coringaForm.data);

      // Verificar sobreposição com plantões fixos
      if (Array.isArray(plantoesFixo)) {
        for (const p of plantoesFixo) {
          const escalaFixa = escalas.find(e => e.id === p.escala_fixa_id);
          if (!escalaFixa || !escalaFixa.horario_inicio || !escalaFixa.horario_fim) continue;
          
          if (verificaSobreposicao(coringaForm.horario_inicio, coringaForm.horario_fim, escalaFixa.horario_inicio, escalaFixa.horario_fim)) {
            toast({
              title: 'Conflito de plantão',
              description: 'O horário selecionado sobrepõe um plantão fixo existente.',
              variant: 'destructive'
            });
            setSalvando(false);
            return;
          }
        }
      }
      
      // Verificar sobreposição com plantões coringa
      if (Array.isArray(plantoesCoringa)) {
        for (const p of plantoesCoringa) {
          if (!p.horario_inicio || !p.horario_fim) continue;
          if (verificaSobreposicao(coringaForm.horario_inicio, coringaForm.horario_fim, p.horario_inicio, p.horario_fim)) {
            toast({
              title: 'Conflito de plantão',
              description: 'O horário selecionado sobrepõe um plantão coringa existente.',
              variant: 'destructive'
            });
            setSalvando(false);
            return;
          }
        }
      }

      const payload = {
        medico_id: profile.id,
        data: coringaForm.data,
        horario_inicio: coringaForm.horario_inicio,
        horario_fim: coringaForm.horario_fim,
        valor: Number(coringaForm.valor),
        data_pagamento_prevista: coringaForm.data_pagamento_prevista,
        local_id: localCoringa
      };

      await criarPlantaoCoringa(payload);
      setLocalCoringa('');
    } finally {
      setSalvando(false);
    }
  }

  const [repasseOpen, setRepasseOpen] = useState(false);
  const [repassePlantaoId, setRepassePlantaoId] = useState<string | null>(null);
  const [repasseSubstituto, setRepasseSubstituto] = useState('');
  const [repasseJustificativa, setRepasseJustificativa] = useState('');
  const [repasseSalvando, setRepasseSalvando] = useState(false);

  async function handleRepasseSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!repassePlantaoId) return;
    setRepasseSalvando(true);
    try {
      await passarPlantaoFixo(repassePlantaoId, null, repasseSubstituto, repasseJustificativa);
      setRepasseOpen(false);
      setRepassePlantaoId(null);
      setRepasseSubstituto('');
      setRepasseJustificativa('');
    } finally {
      setRepasseSalvando(false);
    }
  }

  const [cancelarModalOpen, setCancelarModalOpen] = useState(false);
  const [escalaParaCancelar, setEscalaParaCancelar] = useState<any>(null);
  const [motivoCancelamento, setMotivoCancelamento] = useState('');
  const [cancelando, setCancelando] = useState(false);

  // Função para cancelar/excluir escala fixa
  async function handleCancelarEscala() {
    if (!escalaParaCancelar || !motivoCancelamento.trim() || !profile) return;
    setCancelando(true);
    try {
      // 1. Inserir registro na tabela de cancelamento
      await supabase.from('plantonista_escala_fixa_cancelamentos').insert({
        escala_fixa_id: escalaParaCancelar.id,
        motivo: motivoCancelamento,
        usuario_id: profile.id
      });
      // 2. Marcar escala como inativa (status)
      // Se não houver campo 'status', pode-se deletar ou ajustar para exclusão lógica
      // await supabase.from('plantonista_escala_fixa').update({ ativa: false }).eq('id', escalaParaCancelar.id);
      await supabase.from('plantonista_escala_fixa').delete().eq('id', escalaParaCancelar.id);
      // 3. Remover ou marcar como cancelados os plantões futuros dessa escala
      const hoje = new Date().toISOString().slice(0, 10);
      await supabase.from('plantonista_plantao_fixo_realizado')
        .update({ status_pagamento: 'cancelado' })
        .eq('escala_fixa_id', escalaParaCancelar.id)
        .gte('data', hoje);
      setCancelarModalOpen(false);
      setEscalaParaCancelar(null);
      setMotivoCancelamento('');
      // Opcional: atualizar lista/escalas
    } finally {
      setCancelando(false);
    }
  }

  const [novoPlantaoOpen, setNovoPlantaoOpen] = useState(false);
  const [tipoNovoPlantao, setTipoNovoPlantao] = useState<'fixo' | 'coringa'>('coringa');

  // Modal de confirmação de pagamento
  const [modalPagamentoOpen, setModalPagamentoOpen] = useState(false);
  const [grupoParaPagar, setGrupoParaPagar] = useState<any>(null);
  const [valorConfirmado, setValorConfirmado] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Agrupar plantões fixos por local e mês
  function agruparPlantoesFixos(plantoes: any[]) {
    const grupos: Record<string, any> = {};
    plantoes.forEach(p => {
      const escala = escalas.find(e => e.id === p.escala_fixa_id);
      const local = escala ? escala.local_id : p.local_id;
      const mesAno = p.data.slice(0,7); // yyyy-mm
      const key = `${local}_${mesAno}`;
      if (!grupos[key]) grupos[key] = { local_id: local, mesAno, plantoes: [] };
      grupos[key].plantoes.push(p);
    });
    return Object.values(grupos);
  }

  // Função para obter nome do local
  function nomeLocal(local_id: string) {
    const local = locais.find(l => l.id === local_id);
    return local ? local.nome : '--';
  }

  // Função para obter valor mensal do grupo (soma de todas as escalas do local)
  function valorMensalGrupo(grupo: any) {
    const escalasDoLocal = escalas.filter(e => e.local_id === grupo.local_id);
    return escalasDoLocal.reduce((acc, e) => acc + (Number(e.valor_mensal) || 0), 0);
  }

  // Função para marcar todos os plantões do grupo como pagos e atualizar valor
  async function handleConfirmarPagamentoGrupo() {
    if (!grupoParaPagar || !valorConfirmado) return;
    const valorTotal = Number(valorConfirmado.replace(',', '.'));
    const plantoes = grupoParaPagar.plantoes;
    const valorPorPlantao = plantoes.length > 0 ? Number((valorTotal / plantoes.length).toFixed(2)) : 0;
    const ids = plantoes.map((p: any) => p.id);
    await supabase.from('plantonista_plantao_fixo_realizado')
      .update({ status_pagamento: 'pago', valor: valorPorPlantao, data_pagamento_efetiva: new Date().toISOString() })
      .in('id', ids);
    setModalPagamentoOpen(false);
    setGrupoParaPagar(null);
    setValorConfirmado('');
    if (inputRef.current) inputRef.current.value = '';
    // Refetch para atualizar tela
    if (typeof window !== 'undefined') window.location.reload();
  }

  const [gruposExpandido, setGruposExpandido] = useState<Record<string, boolean>>({});
  const [subgruposExpandido, setSubgruposExpandido] = useState<Record<string, boolean>>({});

  function toggleGrupoExpandido(key: string) {
    setGruposExpandido(prev => ({ ...prev, [key]: !prev[key] }));
  }
  function toggleSubgrupoExpandido(key: string) {
    setSubgruposExpandido(prev => ({ ...prev, [key]: !prev[key] }));
  }

  // Agrupar plantões fixos por local, mês e escala
  function agruparPlantoesFixosHierarquico(plantoes: any[]) {
    const grupos: Record<string, any> = {};
    plantoes.forEach(p => {
      const escala = escalas.find(e => e.id === p.escala_fixa_id);
      const local = escala ? escala.local_id : p.local_id;
      const mesAno = p.data.slice(0,7); // yyyy-mm
      const grupoKey = `${local}_${mesAno}`;
      if (!grupos[grupoKey]) grupos[grupoKey] = { local_id: local, mesAno, subgrupos: {} };
      if (escala) {
        const subKey = `${escala.dia_semana}_${escala.horario_inicio}_${escala.horario_fim}`;
        if (!grupos[grupoKey].subgrupos[subKey]) grupos[grupoKey].subgrupos[subKey] = { escala, plantoes: [] };
        grupos[grupoKey].subgrupos[subKey].plantoes.push(p);
      }
    });
    return Object.entries(grupos).map(([key, grupo]) => ({ ...grupo, key }));
  }

  // Função para obter nome do dia da semana
  const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  function nomeDiaSemana(num: number) {
    return diasSemana[num] || '';
  }

  // Filtrar plantões coringa ativos (não cancelados)
  const plantoesCoringaAtivos = plantoesCoringa.filter(p => p.status_pagamento !== 'cancelado');
  const plantoesCoringaRelAtivos = plantoesCoringaRel.filter(p => p.status_pagamento !== 'cancelado');

  // Totais sempre calculados localmente a partir do campo valor
  const totalFixos = plantoesFixos.reduce((acc, p) => acc + (typeof p.valor === 'number' && !p.foi_passado ? p.valor : 0), 0);
  const totalCoringa = plantoesCoringaAtivos.reduce((acc, p) => acc + (typeof p.valor === 'number' ? p.valor : 0), 0);
  const totalPago =
    plantoesFixos.filter(p => p.status_pagamento === 'pago' && !p.foi_passado).reduce((acc, p) => acc + (typeof p.valor === 'number' ? p.valor : 0), 0) +
    plantoesCoringaAtivos.filter(p => p.status_pagamento === 'pago').reduce((acc, p) => acc + (typeof p.valor === 'number' ? p.valor : 0), 0);
  const totalPendente = totalFixos + totalCoringa - totalPago;

  const [cancelarCoringaModalOpen, setCancelarCoringaModalOpen] = useState(false);
  const [coringaParaCancelar, setCoringaParaCancelar] = useState<any>(null);
  const [motivoCancelamentoCoringa, setMotivoCancelamentoCoringa] = useState('');
  const [cancelandoCoringa, setCancelandoCoringa] = useState(false);

  async function handleCancelarCoringa(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!coringaParaCancelar || !motivoCancelamentoCoringa.trim()) return;
    setCancelandoCoringa(true);
    try {
      console.log('[CANCELAR CORINGA] id:', coringaParaCancelar.id, 'motivo:', motivoCancelamentoCoringa);
      const { error, data } = await supabase.from('plantonista_plantao_coringa').update({
        status_pagamento: 'cancelado',
        motivo_cancelamento: motivoCancelamentoCoringa,
        data_cancelamento: new Date().toISOString()
      }).eq('id', coringaParaCancelar.id);
      console.log('[CANCELAR CORINGA] resultado update:', { error, data });
      if (error) {
        console.error('[CANCELAR CORINGA] erro:', error);
        toast({
          title: 'Erro ao cancelar plantão',
          description: error.message || 'Erro desconhecido.',
          variant: 'destructive'
        });
        setCancelandoCoringa(false);
        return;
      }
      setCancelarCoringaModalOpen(false);
      setCoringaParaCancelar(null);
      setMotivoCancelamentoCoringa('');
      if (typeof refetch === 'function') await refetch();
    } finally {
      setCancelandoCoringa(false);
    }
  }

  // Mesclar e ordenar todos os plantões por data
  const todosPlantoes = [
    ...plantoesFixosRel.map(p => ({ ...p, tipo: 'fixo' })),
    ...plantoesCoringaRel.map(p => ({ ...p, tipo: 'coringa' }))
  ].sort((a, b) => parseISO(a.data).getTime() - parseISO(b.data).getTime());

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 Gestão Financeira
            </h1>
            <p className="text-gray-600">
              Controle financeiro e relatórios de plantões
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Dialog open={novoPlantaoOpen} onOpenChange={setNovoPlantaoOpen}>
              <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plantão
            </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Plantão</DialogTitle>
                </DialogHeader>
                <div className="mb-4">
                  <Label>Tipo do Plantão</Label>
                  <Select value={tipoNovoPlantao} onValueChange={v => setTipoNovoPlantao(v as 'fixo' | 'coringa')}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixo">Fixo</SelectItem>
                      <SelectItem value="coringa">Coringa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {tipoNovoPlantao === 'fixo' ? (
                  <form onSubmit={handleCriarFixo} className="space-y-3">
                    <div>
                      <Label>Local de Trabalho</Label>
                      <Select value={localFixo} onValueChange={setLocalFixo} required>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Selecione o local" />
                        </SelectTrigger>
                        <SelectContent>
                          {locais.map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Dia da Semana</Label>
                      <Select value={String(fixoForm.dia_semana)} onValueChange={v => setFixoForm(f => ({ ...f, dia_semana: Number(v) }))}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Domingo</SelectItem>
                          <SelectItem value="1">Segunda</SelectItem>
                          <SelectItem value="2">Terça</SelectItem>
                          <SelectItem value="3">Quarta</SelectItem>
                          <SelectItem value="4">Quinta</SelectItem>
                          <SelectItem value="5">Sexta</SelectItem>
                          <SelectItem value="6">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Horário Início</Label>
                        <Input type="time" value={fixoForm.horario_inicio} onChange={e => {
                          const novoInicio = e.target.value;
                          setFixoForm(f => ({
                            ...f,
                            horario_inicio: novoInicio,
                            carga_horaria: calcularCargaHoraria(novoInicio, f.horario_fim)
                          }));
                        }} required />
                      </div>
                      <div className="flex-1">
                        <Label>Horário Fim</Label>
                        <Input type="time" value={fixoForm.horario_fim} onChange={e => {
                          const novoFim = e.target.value;
                          setFixoForm(f => ({
                            ...f,
                            horario_fim: novoFim,
                            carga_horaria: calcularCargaHoraria(f.horario_inicio, novoFim)
                          }));
                        }} required />
                      </div>
                    </div>
                    <div>
                      <Label>Carga Horária</Label>
                      <Input type="text" value={fixoForm.carga_horaria} readOnly required pattern="^\d{2}:\d{2}$" />
                      <span className="text-xs text-gray-500">Calculada automaticamente a partir dos horários.</span>
                    </div>
                    <div>
                      <Label>Dia do Pagamento</Label>
                      <Input type="number" value={fixoForm.data_pagamento} onChange={e => setFixoForm(f => ({ ...f, data_pagamento: Number(e.target.value) }))} required min={1} max={31} />
                    </div>
                    <Button type="submit" disabled={salvando} className="w-full mt-2">Salvar Plantão Fixo</Button>
                  </form>
                ) : (
                  <form onSubmit={handleCriarCoringa} className="space-y-3">
                    <div>
                      <Label>Local de Trabalho</Label>
                      <Select value={localCoringa} onValueChange={setLocalCoringa} required>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Selecione o local" />
                        </SelectTrigger>
                        <SelectContent>
                          {locais.map(l => (
                            <SelectItem key={l.id} value={l.id}>{l.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Data</Label>
                      <Input type="date" value={coringaForm.data} onChange={e => setCoringaForm(f => ({ ...f, data: e.target.value }))} required />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label>Horário Início</Label>
                        <Input type="time" value={coringaForm.horario_inicio} onChange={e => setCoringaForm(f => ({ ...f, horario_inicio: e.target.value }))} required />
                      </div>
                      <div className="flex-1">
                        <Label>Horário Fim</Label>
                        <Input type="time" value={coringaForm.horario_fim} onChange={e => setCoringaForm(f => ({ ...f, horario_fim: e.target.value }))} required />
                      </div>
                    </div>
                    <div>
                      <Label>Valor (R$)</Label>
                      <Input type="number" value={coringaForm.valor} onChange={e => setCoringaForm(f => ({ ...f, valor: e.target.value }))} required min={0} />
                    </div>
                    <div>
                      <Label>Data Pagamento Prevista</Label>
                      <Input type="date" value={coringaForm.data_pagamento_prevista} onChange={e => setCoringaForm(f => ({ ...f, data_pagamento_prevista: e.target.value }))} required />
                    </div>
                    <Button type="submit" disabled={salvando} className="w-full mt-2">Salvar Plantão Coringa</Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ganhos do Mês */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ganhos (Mês)</p>
                  <p className="text-2xl font-bold text-green-600">R$ {(totalFixos + totalCoringa).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          {/* Pago */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pago</p>
                  <p className="text-2xl font-bold text-blue-600">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          {/* Pendente */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendente</p>
                  <p className="text-2xl font-bold text-orange-600">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <Receipt className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          {/* Total de Plantões */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Plantões</p>
                  <p className="text-2xl font-bold text-purple-600">{plantoesFixos.length + plantoesCoringaAtivos.length}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abas Principais */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger
              value="resumo"
              className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <PieChart className="h-4 w-4" />
              <span>Resumo</span>
            </TabsTrigger>
            <TabsTrigger
              value="plantoes"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Calendar className="h-4 w-4" />
              <span>Plantões</span>
            </TabsTrigger>
            <TabsTrigger
              value="relatorios"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <div className="mt-6">
            {/* Aba - Resumo */}
            <TabsContent value="resumo" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Receitas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas dos Últimos 6 Meses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {receitasPorMes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.mes}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2"
                                style={{ width: `${Math.min((item.valor / 5000) * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Plantões Fixos</p>
                        <p className="text-lg font-bold text-blue-600">{plantoesFixos.length}</p>
                      </div>
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">Plantões Avulsos</p>
                        <p className="text-lg font-bold text-green-600">{plantoesCoringaAtivos.length}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-orange-800">Taxa de Pagamento</p>
                        <p className="text-lg font-bold text-orange-600">
                          {totalFixos + totalCoringa > 0 ? Math.round((totalPago / (totalFixos + totalCoringa)) * 100) : 0}%
                        </p>
                      </div>
                      <CreditCard className="h-6 w-6 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba - Plantões */}
            <TabsContent value="plantoes" className="space-y-4">
              {/* Plantões Fixos */}
              <Card>
                <CardHeader>
                  <CardTitle>Plantões Fixos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {agruparPlantoesFixosHierarquico(plantoesFixos).length === 0 && <p className="text-gray-500">Nenhum plantão fixo encontrado para este mês.</p>}
                    {agruparPlantoesFixosHierarquico(plantoesFixos).map(grupo => {
                      const grupoKey = grupo.key;
                      const expandido = gruposExpandido[grupoKey] !== false;
                      return (
                        <div key={grupoKey} className="mb-6 border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2 cursor-pointer select-none" onClick={() => toggleGrupoExpandido(grupoKey)}>
                            <div className="font-bold text-lg flex items-center gap-2">
                              <span>{nomeLocal(grupo.local_id)} ({grupo.mesAno.split('-').reverse().join('/')})</span>
                              <span className="text-xs text-gray-400">{expandido ? '▲' : '▼'}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-green-700">Valor Mensal: R$ {valorMensalGrupo(grupo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <Button size="sm" variant="default" onClick={e => { e.stopPropagation(); setGrupoParaPagar(grupo); setValorConfirmado(valorMensalGrupo(grupo).toString()); setModalPagamentoOpen(true); }}>Marcar como Pago</Button>
                            </div>
                          </div>
                          {expandido && (
                            <div className="space-y-4">
                              {Object.entries(grupo.subgrupos).map(([subKey, subgrupo]: any) => {
                                const escala = subgrupo.escala;
                                const subExpandido = subgruposExpandido[grupoKey + '_' + subKey] !== false;
                                return (
                                  <div key={subKey} className="border rounded mb-2">
                                    <div className="flex items-center gap-2 px-2 py-1 bg-gray-50 cursor-pointer select-none" onClick={() => toggleSubgrupoExpandido(grupoKey + '_' + subKey)}>
                                      <span className="font-semibold text-blue-700">{nomeDiaSemana(escala.dia_semana)} {escala.horario_inicio?.slice(0,5)} - {escala.horario_fim?.slice(0,5)}</span>
                                      <span className="text-xs text-gray-400">{subExpandido ? '▲' : '▼'}</span>
                                    </div>
                                    {subExpandido && (
                                      <div className="space-y-2 p-2">
                                        {subgrupo.plantoes.map((plantao: any) => (
                                          <div key={plantao.id} className="flex items-center justify-between p-2 border rounded">
                                            <div>
                                              <span className="font-medium">{format(parseISO(plantao.data), 'dd/MM/yyyy')}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                              <span className="text-sm text-gray-600">R$ {plantao.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                              {plantao.status_pagamento === 'pago' ? (
                                                <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" /> Pago</Badge>
                                              ) : (
                                                <Badge variant="outline" className="text-orange-600"><Clock className="h-3 w-3 mr-1" /> Pendente</Badge>
                                              )}
                                              {!plantao.foi_passado && plantao.status_pagamento !== 'pago' && (
                                                <Button size="sm" variant="outline" onClick={() => { setRepasseOpen(true); setRepassePlantaoId(plantao.id); }}>Passar Plantão</Button>
                                              )}
                                              <Button size="sm" variant="destructive" onClick={() => { setEscalaParaCancelar(plantao.escala_fixa_id); setCancelarModalOpen(true); }}>Cancelar</Button>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                    </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
              {/* Plantões Avulsos */}
              <Card>
                <CardHeader>
                  <CardTitle>Plantões Avulsos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plantoesCoringaAtivos.length === 0 && <p className="text-gray-500">Nenhum plantão avulso encontrado para este mês.</p>}
                    <ul className="divide-y">
                      {plantoesCoringaAtivos.map(p => {
                        const local = locais.find(l => l.id === p.local_id);
                        return (
                          <li key={p.id} className="py-2 flex items-center gap-4">
                            <Clock className="w-5 h-5 text-indigo-400" />
                            <span className="font-medium w-24">{format(parseISO(p.data), 'dd/MM/yyyy')}</span>
                            <span className="text-sm text-gray-600 w-48">{local ? local.nome : '--'}</span>
                            <span className="text-sm text-gray-500 w-32">
                                {p.horario_inicio && p.horario_fim ? `${p.horario_inicio.slice(0,5)} - ${p.horario_fim.slice(0,5)}` : ''}
                            </span>
                            <span className="text-sm text-gray-600">R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-auto">{p.status_pagamento}</span>
                            <Button size="sm" variant="destructive" onClick={() => { setCoringaParaCancelar(p); setCancelarCoringaModalOpen(true); }}>Cancelar</Button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba - Relatórios */}
            <TabsContent value="relatorios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Relatório Detalhado</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 mb-4">
                    <select
                      className="border rounded px-2 py-1"
                      value={mesRelatorio}
                      onChange={e => setMesRelatorio(Number(e.target.value))}
                    >
                      {meses.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <select
                      className="border rounded px-2 py-1"
                      value={anoRelatorio}
                      onChange={e => setAnoRelatorio(Number(e.target.value))}
                    >
                      {anos.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr>
                          <th className="px-2 py-1 text-left">Data</th>
                          <th className="px-2 py-1 text-left">Tipo</th>
                          <th className="px-2 py-1 text-left">Valor</th>
                          <th className="px-2 py-1 text-left">Status</th>
                          <th className="px-2 py-1 text-left">Substituto</th>
                          <th className="px-2 py-1 text-left">Justificativa</th>
                          <th className="px-2 py-1 text-left">Local</th>
                        </tr>
                      </thead>
                      <tbody>
                        {todosPlantoes.map(p => {
                          if (p.tipo === 'fixo') {
                            const pf = p as typeof plantoesFixosRel[number];
                            const escala = escalas.find(e => e.id === pf.escala_fixa_id);
                            const total = plantoesFixosRel.filter(x => x.escala_fixa_id === pf.escala_fixa_id).length;
                            const local = locais.find(l => l.id === pf.local_id);
                            const horario = escala ? `${escala.horario_inicio?.slice(0,5)} - ${escala.horario_fim?.slice(0,5)}` : '--';
                            return (
                              <tr key={pf.id} className="border-b">
                                <td className="px-2 py-1">{format(parseISO(pf.data), 'dd/MM/yyyy')}</td>
                                <td className="px-2 py-1">Fixo</td>
                                <td className="px-2 py-1">{escala && total ? `R$ ${(escala.valor_mensal / total).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}</td>
                                <td className="px-2 py-1">{pf.status_pagamento}</td>
                                <td className="px-2 py-1">{pf.substituto_nome || '-'}</td>
                                <td className="px-2 py-1">{pf.justificativa_passagem || '-'}</td>
                                <td className="px-2 py-1">{local ? local.nome : '--'} | {horario}</td>
                              </tr>
                            );
                          } else {
                            const pc = p as typeof plantoesCoringaRel[number];
                            const motivo = (pc as any).motivo_cancelamento || '-';
                            const local = locais.find(l => l.id === pc.local_id);
                            const horario = pc.horario_inicio && pc.horario_fim ? `${pc.horario_inicio.slice(0,5)} - ${pc.horario_fim.slice(0,5)}` : '--';
                            return (
                              <tr key={pc.id} className={`border-b ${pc.status_pagamento === 'cancelado' ? 'bg-red-50' : ''}`}>
                                <td className="px-2 py-1">{format(parseISO(pc.data), 'dd/MM/yyyy')}</td>
                                <td className="px-2 py-1">Coringa</td>
                                <td className="px-2 py-1">R$ {Number(pc.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                <td className="px-2 py-1">{pc.status_pagamento}</td>
                                <td className="px-2 py-1">-</td>
                                <td className="px-2 py-1">{pc.status_pagamento === 'cancelado' ? motivo : '-'}</td>
                                <td className="px-2 py-1">{local ? local.nome : '--'}{horario !== '--' ? ` | ${horario}` : ''}</td>
                              </tr>
                            );
                          }
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Modal de Repasse de Plantão */}
      <Dialog open={repasseOpen} onOpenChange={setRepasseOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Passar Plantão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRepasseSalvar} className="space-y-4">
            <div>
              <Label>Nome do Substituto</Label>
              <Input value={repasseSubstituto} onChange={e => setRepasseSubstituto(e.target.value)} required placeholder="Nome do médico substituto" />
            </div>
            <div>
              <Label>Justificativa</Label>
              <Input value={repasseJustificativa} onChange={e => setRepasseJustificativa(e.target.value)} required placeholder="Motivo do repasse" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setRepasseOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={repasseSalvando}>Salvar Repasse</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de cancelamento */}
      <Dialog open={cancelarModalOpen} onOpenChange={setCancelarModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Escala Fixa</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleCancelarEscala(); }} className="space-y-4">
            <div>
              <Label>Motivo do cancelamento</Label>
              <Input value={motivoCancelamento} onChange={e => setMotivoCancelamento(e.target.value)} required placeholder="Descreva o motivo" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelarModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={cancelando}>Confirmar Cancelamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmação de pagamento grupo fixo */}
      <Dialog open={modalPagamentoOpen} onOpenChange={setModalPagamentoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Pagamento Mensal</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <Label>Valor Recebido do Local</Label>
            <Input ref={inputRef} type="number" min={0} step="0.01" value={valorConfirmado} onChange={e => setValorConfirmado(e.target.value)} required />
            <span className="text-xs text-gray-500">O valor será dividido igualmente entre os plantões do mês.</span>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalPagamentoOpen(false)}>Cancelar</Button>
            <Button type="button" onClick={handleConfirmarPagamentoGrupo} disabled={!valorConfirmado}>Confirmar Pagamento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de cancelamento coringa */}
      <Dialog open={cancelarCoringaModalOpen} onOpenChange={setCancelarCoringaModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Plantão Coringa</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCancelarCoringa} className="space-y-4">
            <div>
              <Label>Motivo do cancelamento</Label>
              <Input value={motivoCancelamentoCoringa} onChange={e => setMotivoCancelamentoCoringa(e.target.value)} required placeholder="Descreva o motivo" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCancelarCoringaModalOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={cancelandoCoringa}>Confirmar Cancelamento</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GestaoFinanceira; 