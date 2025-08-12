
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
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
  RefreshCw,
  BarChart3,
  FileText,
  Download,
  ArrowRight,
  ArrowLeft,
  User
} from 'lucide-react';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { useAuth } from '@/hooks/useAuth';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const GestaoFinanceira: React.FC = () => {
  const { profile } = useAuth();
  const [mesAtual, setMesAtual] = useState(new Date().getMonth() + 1);
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear());
  const [plantoesResumo, setPlantoesResumo] = useState<any[]>([]);
  const [locais, setLocais] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('resumo');
  const [openAccordionsFixos, setOpenAccordionsFixos] = useState<string[]>([]);
  const [openAccordionsCoringas, setOpenAccordionsCoringas] = useState<string[]>([]);
  const [openSubAccordions, setOpenSubAccordions] = useState<string[]>([]);
  const [modalAcao, setModalAcao] = useState<{
    isOpen: boolean;
    plantao: any | null;
    tipo: 'passar' | 'cancelar' | null;
  }>({ isOpen: false, plantao: null, tipo: null });
  const [modalNovoPlantao, setModalNovoPlantao] = useState<{
    isOpen: boolean;
  }>({ isOpen: false });
  const [justificativa, setJustificativa] = useState('');
  const [substituto, setSubstituto] = useState('');
  
  // Estados para novo plantão (código original)
  const [novoPlantaoOpen, setNovoPlantaoOpen] = useState(false);
  const [tipoNovoPlantao, setTipoNovoPlantao] = useState<'fixo' | 'coringa'>('coringa');
  const [localFixo, setLocalFixo] = useState('');
  const [localCoringa, setLocalCoringa] = useState('');
  const [salvando, setSalvando] = useState(false);

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

  // Estados para novo plantão (mantido para compatibilidade)
  const [novoPlantao, setNovoPlantao] = useState({
    tipo: 'coringa' as 'fixo' | 'coringa',
    local_id: '',
    data: '',
    dia_semana: 1,
    horario_inicio: '',
    horario_fim: '',
    valor: 0,
    dia_pagamento: 5
  });
  
  const {
    plantoes,
    escalas,
    loading,
    carregarPlantoes,
    carregarEscalas,
    gerarPlantoesDoMes,
    gerarPlantoesMultiplosMeses,
    gerarPlantoesParaEscalasExistentes,
    atualizarStatusPlantao,
    marcarComoPago,
    cancelarPlantaoFixoFuturo,
    carregarPlantoesPeriodo,
    criarNovoPlantao
  } = usePlantoesFinanceiro();

  useEffect(() => {
    carregarPlantoes(mesAtual, anoAtual);
    carregarEscalas();
  }, [mesAtual, anoAtual]);

  // Carregar dados do resumo (últimos 6 meses)
  useEffect(() => {
    const carregarResumo = async () => {
      const hoje = new Date();
      const seisMesesAtras = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1);
      const inicio = seisMesesAtras.toISOString().split('T')[0];
      const fim = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1).toISOString().split('T')[0];
      
      const plantoesResumo = await carregarPlantoesPeriodo(inicio, fim);
      setPlantoesResumo(plantoesResumo);
    };
    
    carregarResumo();
  }, [carregarPlantoesPeriodo]);

  // Carregar locais de trabalho
  useEffect(() => {
    const carregarLocais = async () => {
      try {
        const { data, error } = await supabase
          .from('plantonista_locais_trabalho')
          .select('*')
          .order('nome');
        
        if (error) throw error;
        setLocais(data || []);
      } catch (error) {
        console.error('Erro ao carregar locais:', error);
        toast.error('Erro ao carregar locais');
      }
    };
    
    carregarLocais();
  }, []);

  // Função helper para obter status do plantão (compatibilidade)
  const getPlantaoStatus = (plantao: any) => {
    // Debug para acompanhar o que está acontecendo
    if (import.meta.env.DEV) {
      console.log('getPlantaoStatus input:', {
        id: plantao.id,
        status_plantao: plantao.status_plantao,
        status_pagamento: plantao.status_pagamento,
        status: plantao.status,
        foi_passado: plantao.foi_passado,
        cancelado: plantao.cancelado
      });
    }

    // Prioridade 1: Se tem os novos campos, usa eles
    if (plantao.status_plantao && plantao.status_pagamento) {
      return {
        status_plantao: plantao.status_plantao,
        status_pagamento: plantao.status_pagamento
      };
    }
    
    // Prioridade 2: Se tem só status_plantao, assume status_pagamento como pendente
    if (plantao.status_plantao) {
      return {
        status_plantao: plantao.status_plantao,
        status_pagamento: plantao.status_pagamento || 'pendente'
      };
    }
    
    // Prioridade 3: Conversão do sistema antigo usando lógica completa
    let statusPlantao: string;
    let statusPagamento: string;
    
    const statusAntigo = plantao.status || plantao.status_pagamento;
    
    // Determinar status_plantao
    if (plantao.cancelado === true || statusAntigo === 'cancelado') {
      statusPlantao = 'cancelado';
    } else if (plantao.foi_passado === true || statusAntigo === 'passou') {
      statusPlantao = 'transferido';
    } else if (statusAntigo === 'faltou') {
      statusPlantao = 'faltou';
    } else if (statusAntigo === 'realizado' || statusAntigo === 'pago') {
      statusPlantao = 'realizado';
    } else {
      statusPlantao = 'agendado';
    }
    
    // Determinar status_pagamento
    statusPagamento = statusAntigo === 'pago' ? 'pago' : 'pendente';
    
    const resultado = { status_plantao: statusPlantao, status_pagamento: statusPagamento };
    
    if (import.meta.env.DEV) {
      console.log('getPlantaoStatus output:', resultado);
    }
    
    return resultado;
  };

  // Calcular resumo dos últimos 6 meses usando useMemo
  const resumoMensal = useMemo(() => {
    const resumoMensal = [];
    const hoje = new Date();
    
    for (let i = 0; i < 6; i++) {
      const data = subMonths(hoje, i);
      const mes = data.getMonth() + 1;
      const ano = data.getFullYear();
      
      // Filtrar plantões do mês
      const plantoesMes = plantoesResumo.filter(p => {
        const [pAno, pMes] = p.data.split('-').map(Number);
        return pAno === ano && pMes === mes;
      });
      
      // Somar apenas plantões pagos (receita efetiva)
      const realizado = plantoesMes
        .filter(p => {
          const statusInfo = getPlantaoStatus(p);
          return statusInfo.status_pagamento === 'pago';
        })
        .reduce((acc, p) => acc + p.valor, 0);
      
      // Somar plantões que podem gerar receita (agendados + realizados + pagos)
      const previsto = plantoesMes
        .filter(p => {
          const statusInfo = getPlantaoStatus(p);
          return ['agendado', 'realizado'].includes(statusInfo.status_plantao) || statusInfo.status_pagamento === 'pago';
        })
        .reduce((acc, p) => acc + p.valor, 0);
      
      resumoMensal.push({
        mes: format(data, 'MMM/yyyy', { locale: ptBR }),
        realizado,
        previsto,
        data: data
      });
    }
    return resumoMensal.reverse();
  }, [plantoesResumo]);

  const calcularResumoFinanceiro = () => {
    // Filtrar plantões não cancelados
    const plantoesAtivos = plantoes.filter(p => {
      const status = getPlantaoStatus(p);
      return status.status_plantao !== 'cancelado';
    });
    
    // Plantões efetivamente pagos
    const totalPago = plantoesAtivos
      .filter(p => {
        const status = getPlantaoStatus(p);
        return status.status_pagamento === 'pago';
      })
      .reduce((acc, p) => acc + p.valor, 0);
    
    // Total previsto = apenas plantões que podem gerar receita (agendados + realizados + pagos)
    const totalPrevisto = plantoesAtivos
      .filter(p => {
        const status = getPlantaoStatus(p);
        return ['agendado', 'realizado'].includes(status.status_plantao) || status.status_pagamento === 'pago';
      })
      .reduce((acc, p) => acc + p.valor, 0);
    
    // Perdido = faltou + transferido
    const totalPerdido = plantoesAtivos
      .filter(p => {
        const status = getPlantaoStatus(p);
        return ['faltou', 'transferido'].includes(status.status_plantao);
      })
      .reduce((acc, p) => acc + p.valor, 0);
    
    // Contadores
    const plantoesAgendados = plantoesAtivos.filter(p => {
      const status = getPlantaoStatus(p);
      return status.status_plantao === 'agendado';
    }).length;
    
    const plantoesRealizados = plantoesAtivos.filter(p => {
      const status = getPlantaoStatus(p);
      return status.status_plantao === 'realizado';
    }).length;

    const plantoesFixos = plantoesAtivos.filter(p => p.tipo === 'fixo').length;
    const plantoesCoringa = plantoesAtivos.filter(p => p.tipo === 'coringa').length;

    return {
      totalPago,
      totalPrevisto,
      totalPerdido,
      plantoesAgendados,
      plantoesRealizados,
      plantoesFixos,
      plantoesCoringa
    };
  };

  const resumo = calcularResumoFinanceiro();

  const getStatusColor = (statusPlantao: string, statusPagamento?: string) => {
    // Se é pago, mostra como pago
    if (statusPagamento === 'pago') return 'bg-emerald-100 text-emerald-800';
    
    // Senão, usa status do plantão
    switch (statusPlantao) {
      case 'realizado': return 'bg-green-100 text-green-800';
      case 'faltou': return 'bg-red-100 text-red-800';
      case 'transferido': return 'bg-blue-100 text-blue-800';
      case 'agendado': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-gray-100 text-gray-800';
      // Compatibilidade com sistema antigo
      case 'passou': return 'bg-blue-100 text-blue-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'pago': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (statusPlantao: string, statusPagamento?: string) => {
    // Se é pago, mostra ícone de dinheiro
    if (statusPagamento === 'pago') return <DollarSign className="h-4 w-4" />;
    
    // Senão, usa status do plantão
    switch (statusPlantao) {
      case 'realizado': return <CheckCircle className="h-4 w-4" />;
      case 'faltou': return <XCircle className="h-4 w-4" />;
      case 'transferido': return <RefreshCw className="h-4 w-4" />;
      case 'agendado': return <Clock className="h-4 w-4" />;
      case 'cancelado': return <XCircle className="h-4 w-4" />;
      // Compatibilidade com sistema antigo
      case 'passou': return <RefreshCw className="h-4 w-4" />;
      case 'pendente': return <Clock className="h-4 w-4" />;
      case 'pago': return <DollarSign className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const parseLocalDate = (dateStr: string) => {
    const [y, m, d] = (dateStr || '').split('-').map(Number);
    if (!y || !m || !d) return new Date(dateStr);
    return new Date(y, m - 1, d);
  };

  const handleMarcarLocalComoPago = async (grupo: any) => {
    try {
      // Validar usando nova lógica de status
      const plantoesAgendados = grupo.plantoes.filter((p: any) => {
        const statusInfo = getPlantaoStatus(p);
        return statusInfo.status_plantao === 'agendado';
      });
      
      if (plantoesAgendados.length > 0) {
        toast.error(`Não é possível marcar como pago. Existem ${plantoesAgendados.length} plantão(ns) agendado(s). Todos os plantões devem estar como "realizado" antes de marcar como pago.`);
        return;
      }

      // Plantões que serão marcados como pagos (somente os realizados e não transferidos)
      const plantoesParaPagar = grupo.plantoes.filter((p: any) => {
        const statusInfo = getPlantaoStatus(p);
        return statusInfo.status_plantao === 'realizado' && 
               statusInfo.status_pagamento === 'pendente';
      });

      if (plantoesParaPagar.length === 0) {
        toast.error('Não há plantões realizados pendentes de pagamento neste local.');
        return;
      }

      // Confirmar ação
      const confirmMessage = `Confirmar pagamento de ${plantoesParaPagar.length} plantão(ns) no ${grupo.titulo}?\n\nValor total: R$ ${grupo.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      
      if (!confirm(confirmMessage)) return;

      // Marcar todos os plantões realizados como pagos
      for (const plantao of plantoesParaPagar) {
        await marcarComoPago(plantao.id);
      }

      // Forçar recarregamento dos dados
      await carregarPlantoes(mesAtual, anoAtual);

      toast.success(`${plantoesParaPagar.length} plantão(ns) marcado(s) como pago no ${grupo.titulo}!`);
      
    } catch (error) {
      console.error('Erro ao marcar local como pago:', error);
      toast.error('Erro ao processar pagamento');
    }
  };

  // Função para marcar grupo de plantões coringa como pago
  const handleMarcarCoringaComoPago = async (grupo: GrupoCoringaLocal) => {
    try {
      // Validar usando nova lógica de status
      const plantoesAgendados = grupo.plantoes.filter((p: any) => {
        const statusInfo = getPlantaoStatus(p);
        return statusInfo.status_plantao === 'agendado';
      });
      
      if (plantoesAgendados.length > 0) {
        toast.error(`Não é possível marcar como pago. Existem ${plantoesAgendados.length} plantão(ns) agendado(s). Todos os plantões devem estar como "realizado" antes de marcar como pago.`);
        return;
      }

      // Plantões que serão marcados como pagos (somente os realizados e não transferidos)
      const plantoesParaPagar = grupo.plantoes.filter((p: any) => {
        const statusInfo = getPlantaoStatus(p);
        return statusInfo.status_plantao === 'realizado' && 
               statusInfo.status_pagamento === 'pendente';
      });

      if (plantoesParaPagar.length === 0) {
        toast.error('Não há plantões realizados pendentes de pagamento neste local.');
        return;
      }

      // Confirmar ação
      const confirmMessage = `Confirmar pagamento de ${plantoesParaPagar.length} plantão(ns) coringa no ${grupo.titulo}?\n\nValor total: R$ ${grupo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
      
      if (!confirm(confirmMessage)) return;

      // Marcar todos os plantões realizados como pagos
      for (const plantao of plantoesParaPagar) {
        await marcarComoPago(plantao.id);
      }

      // Forçar recarregamento dos dados
      await carregarPlantoes(mesAtual, anoAtual);

      toast.success(`${plantoesParaPagar.length} plantão(ns) coringa marcado(s) como pago no ${grupo.titulo}!`);
      
    } catch (error) {
      console.error('Erro ao marcar coringas como pago:', error);
      toast.error('Erro ao processar pagamento dos coringas');
    }
  };

  // Função para formatar horários removendo segundos
  const formatHorario = (horario: string) => {
    if (!horario) return '';
    
    // Remove segundos se existirem (formato HH:MM:SS -> HH:MM)
    if (horario.includes(':')) {
      const parts = horario.split(':');
      if (parts.length >= 2) {
        // Retorna apenas HH:MM
        return `${parts[0]}:${parts[1]}`;
      }
    }
    
    return horario;
  };

  const getDiaSemanaNome = (diaSemana: number): string => {
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return dias[diaSemana] || 'Desconhecido';
  };

  // Função utilitária para calcular diferença de horário em hh:mm
  const calcularCargaHoraria = (horario_inicio: string, horario_fim: string) => {
    if (!horario_inicio || !horario_fim) return '';
    const [h1, m1] = horario_inicio.split(':').map(Number);
    const [h2, m2] = horario_fim.split(':').map(Number);
    let minutos = (h2 * 60 + m2) - (h1 * 60 + m1);
    if (minutos < 0) minutos += 24 * 60; // caso passe da meia-noite
    const horas = Math.floor(minutos / 60).toString().padStart(2, '0');
    const mins = (minutos % 60).toString().padStart(2, '0');
    return `${horas}:${mins}`;
  };

  // Função robusta para verificar sobreposição de horários em minutos
  const verificaSobreposicao = (inicio1: string, fim1: string, inicio2: string, fim2: string): boolean => {
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
  };

  const handleAcaoPlantao = (plantao: any, tipo: 'passar' | 'cancelar') => {
    setModalAcao({ isOpen: true, plantao, tipo });
    setJustificativa('');
    setSubstituto('');
  };

  const handleAlterarStatusPlantao = async (plantao: any, newStatus: string) => {
    try {
      // Para status que precisam de informações adicionais, abre modal
      if (newStatus === 'transferido') {
        setModalAcao({ isOpen: true, plantao, tipo: 'passar' });
        setJustificativa('');
        setSubstituto('');
        return;
      }

      // Para cancelamento de plantão fixo, abre modal específico
      if (newStatus === 'cancelado' && plantao.tipo === 'fixo') {
        setModalAcao({ isOpen: true, plantao, tipo: 'cancelar' });
        return;
      }

      // Para outros status, atualiza diretamente o status_plantao
      await atualizarStatusPlantao(plantao.id, newStatus);
      
      // Forçar recarregamento dos dados para garantir sincronização
      await carregarPlantoes(mesAtual, anoAtual);
      
      // Converter para mensagem amigável
      const statusMessages = {
        'agendado': 'Agendado',
        'realizado': 'Realizado',
        'faltou': 'Faltou',
        'cancelado': 'Cancelado'
      };
      
      toast.success(`Status alterado para "${statusMessages[newStatus] || newStatus}" com sucesso!`);
      
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status do plantão');
    }
  };

  const confirmarAcao = async () => {
    if (!modalAcao.plantao || !modalAcao.tipo) return;

    // Verificar se é cancelamento de plantão fixo
    if (modalAcao.tipo === 'cancelar' && modalAcao.plantao.tipo === 'fixo') {
      await confirmarCancelamentoFixo();
      return;
    }

    // Para plantões coringa ou passar plantão fixo individual
    const status = modalAcao.tipo === 'passar' ? 'transferido' : 'cancelado';
    await atualizarStatusPlantao(
      modalAcao.plantao.id, 
      status, 
      justificativa,
      substituto
    );

    // Forçar recarregamento dos dados
    await carregarPlantoes(mesAtual, anoAtual);

    setModalAcao({ isOpen: false, plantao: null, tipo: null });
    setJustificativa('');
    setSubstituto('');
  };

  // Função para cancelar plantão fixo no nível do FILHO (Dia/Horário)
  const handleCancelarPlantaoFixo = (escalaFixaId: string, localId: string, diaSemana: number, localNome: string, diaSemanaNome: string) => {
    setModalAcao({
      isOpen: true,
      plantao: {
        id: escalaFixaId,
        tipo: 'fixo',
        local: localNome,
        diaSemana: diaSemana,
        diaSemanaNome: diaSemanaNome,
        local_id: localId
      },
      tipo: 'cancelar'
    });
  };

  const confirmarCancelamentoFixo = async () => {
    if (!modalAcao.plantao || modalAcao.tipo !== 'cancelar') return;

    try {
      await cancelarPlantaoFixoFuturo(
        modalAcao.plantao.id, // escalaFixaId
        modalAcao.plantao.local_id || '',
        modalAcao.plantao.diaSemana || 1,
        justificativa
      );
      
      setModalAcao({ isOpen: false, plantao: null, tipo: null });
      setJustificativa('');
      setSubstituto('');
      
      // Recarregar os dados
      await carregarPlantoes(mesAtual, anoAtual);
    } catch (error) {
      console.error('Erro ao cancelar plantão fixo:', error);
    }
  };

  const handleNovoPlantao = () => {
    setNovoPlantaoOpen(true);
    // Resetar formulários
    setFixoForm({
      dia_semana: 1,
      horario_inicio: '08:00',
      horario_fim: '14:00',
      carga_horaria: '06:00',
      data_pagamento: 15
    });
    setCoringaForm({
      data: format(new Date(), 'yyyy-MM-dd'),
      horario_inicio: '08:00',
      horario_fim: '14:00',
      valor: '',
      data_pagamento_prevista: format(new Date(), 'yyyy-MM-dd')
    });
    setLocalFixo('');
    setLocalCoringa('');
    setTipoNovoPlantao('coringa');
  };

  const confirmarNovoPlantao = async () => {
    if (!novoPlantao.local_id || !novoPlantao.horario_inicio || !novoPlantao.horario_fim || novoPlantao.valor <= 0) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (novoPlantao.tipo === 'coringa' && !novoPlantao.data) {
      toast.error('Data é obrigatória para plantões coringa');
      return;
    }

    await criarNovoPlantao(novoPlantao);
    setModalNovoPlantao({ isOpen: false });
  };

  // Função para criar plantão fixo (código original)
  const handleCriarFixo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      if (!profile || !localFixo) return;
      
      // Buscar o local selecionado
      const local = locais.find(l => l.id === localFixo);
      if (!local) return;
      
      const valorFixo = local.faixas && Array.isArray(local.faixas) && local.faixas[0] && local.faixas[0].valor ? Number(local.faixas[0].valor) : 0;
      if (!valorFixo || valorFixo === 0) {
        toast.error('O valor na faixa de pagamento do local selecionado está zerado. Edite o local de trabalho e defina um valor antes de criar a escala.');
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
            toast.error('Já existe uma escala fixa para este dia e horário (independente do local). Ajuste para não sobrepor.');
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
      setNovoPlantaoOpen(false);
      toast.success('Escala fixa criada com sucesso!');
      await carregarEscalas();
    } catch (error) {
      console.error('Erro ao criar plantão fixo:', error);
      toast.error('Erro ao criar plantão fixo');
    } finally {
      setSalvando(false);
    }
  };

  // Função para criar plantão coringa (código original)
  const handleCriarCoringa = async (e: React.FormEvent) => {
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
            toast.error('O horário selecionado sobrepõe um plantão fixo existente.');
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
            toast.error('O horário selecionado sobrepõe um plantão coringa existente.');
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

      await supabase.from('plantonista_plantao_coringa').insert(payload);
      setLocalCoringa('');
      setNovoPlantaoOpen(false);
      toast.success('Plantão coringa criado com sucesso!');
      await carregarPlantoes(mesAtual, anoAtual);
    } catch (error) {
      console.error('Erro ao criar plantão coringa:', error);
      toast.error('Erro ao criar plantão coringa');
    } finally {
      setSalvando(false);
    }
  };

  // Agrupadores
  const plantoesFixos = plantoes.filter(p => p.tipo === 'fixo');
  const plantoesCoringa = plantoes.filter(p => p.tipo === 'coringa');

  // Mapear escalas por id para obter horários/local
  const escalaById = new Map<string, any>();
  escalas.forEach(e => {
    if (e.id) escalaById.set(e.id, e);
  });

  // Agrupar fixos hierarquicamente: LOCAL (PAI) -> DIA/HORÁRIO (FILHO) -> PLANTÕES
  interface GrupoLocal {
    key: string;
    titulo: string;
    localId: string; // Adicionar localId para busca da escala
    valorMensal: number;
    subgrupos: GrupoDiaHorario[];
  }

  interface GrupoDiaHorario {
    key: string;
    titulo: string;
    horario: string;
    diaSemana: number;
    itens: typeof plantoesFixos;
  }

  const gruposFixos: GrupoLocal[] = [];
  const tmpLocais: Record<string, { titulo: string; valorMensal: number; subgrupos: Record<string, typeof plantoesFixos> }> = {};

  // Primeiro, agrupar por local (PAI)
  for (const p of plantoesFixos) {
    const escalaId = p.escala_fixa_id;
    let localKey = `local:${p.local}`;
    let localTitulo = p.local;

    if (escalaId && escalaById.has(escalaId)) {
      const esc = escalaById.get(escalaId);
      localKey = `local:${esc.local_id}`;
      localTitulo = esc.local_nome || p.local;
    }

    if (!tmpLocais[localKey]) {
      tmpLocais[localKey] = {
        titulo: localTitulo,
        valorMensal: 0, // Será calculado somando os valores dos filhos
        subgrupos: {}
      };
    }

    // Agrupar por dia da semana e horário (FILHO)
    const diaSemana = escalaId && escalaById.has(escalaId) ? escalaById.get(escalaId).dia_semana : 0;
    const horarioInicio = escalaId && escalaById.has(escalaId) ? escalaById.get(escalaId).horario_inicio : '';
    const horarioFim = escalaId && escalaById.has(escalaId) ? escalaById.get(escalaId).horario_fim : '';
    
    const subgrupoKey = `${diaSemana}_${horarioInicio}_${horarioFim}`;

    if (!tmpLocais[localKey].subgrupos[subgrupoKey]) {
      tmpLocais[localKey].subgrupos[subgrupoKey] = [];
    }
    tmpLocais[localKey].subgrupos[subgrupoKey].push(p);
  }

  // Converter para estrutura final e calcular valorMensal somando os itens
  for (const [localKey, localData] of Object.entries(tmpLocais)) {
    let totalValorLocal = 0;
    const subgrupos: GrupoDiaHorario[] = [];
    
    for (const [subgrupoKey, itens] of Object.entries(localData.subgrupos)) {
      const [diaSemana, horarioInicio, horarioFim] = subgrupoKey.split('_');
      const titulo = `${getDiaSemanaNome(parseInt(diaSemana))}: ${formatHorario(horarioInicio)} - ${formatHorario(horarioFim)}`;
      
      // Só somar valores de plantões que geram receita (não cancelados, não transferidos, não faltou)
      const valorSubgrupo = itens.reduce((acc, item) => {
        const statusInfo = getPlantaoStatus(item);
        if (['agendado', 'realizado'].includes(statusInfo.status_plantao)) {
          return acc + (item.valor || 0);
        }
        return acc;
      }, 0);
      totalValorLocal += valorSubgrupo;
      
      subgrupos.push({
        key: subgrupoKey,
        titulo,
        horario: `${formatHorario(horarioInicio)} - ${formatHorario(horarioFim)}`,
        diaSemana: parseInt(diaSemana),
        itens: itens.sort((a, b) => a.data.localeCompare(b.data))
      });
    }

    // Ordenar subgrupos por dia da semana
    subgrupos.sort((a, b) => a.diaSemana - b.diaSemana);

    // Extrair o local_id da chave (pode ser o ID real ou o nome do local)
    const localId = localKey.replace('local:', '');
    
    gruposFixos.push({
      key: localKey,
      titulo: localData.titulo,
      localId: localId,
      valorMensal: totalValorLocal, // Soma dos valores dos filhos
      subgrupos
    });
  }

  // Ordenar grupos por título do local
  gruposFixos.sort((a, b) => a.titulo.localeCompare(b.titulo));

  // Agrupar plantões coringa por local (semelhante aos fixos)
  interface GrupoCoringaLocal {
    key: string;
    titulo: string;
    localId: string;
    valorTotal: number;
    plantoes: typeof plantoesCoringa;
  }

  const gruposCoringa: GrupoCoringaLocal[] = [];
  const tmpLocaisCoringa: Record<string, { titulo: string; valorTotal: number; plantoes: typeof plantoesCoringa }> = {};

  // Agrupar coringas por local
  for (const p of plantoesCoringa) {
    const localKey = `coringa:${p.local_id || p.local}`;
    const localTitulo = p.local;

    if (!tmpLocaisCoringa[localKey]) {
      tmpLocaisCoringa[localKey] = {
        titulo: localTitulo,
        valorTotal: 0,
        plantoes: []
      };
    }

    tmpLocaisCoringa[localKey].plantoes.push(p);
    
    // Só somar valores de plantões que geram receita (não cancelados, não transferidos, não faltou)
    const statusInfo = getPlantaoStatus(p);
    if (['agendado', 'realizado'].includes(statusInfo.status_plantao)) {
      tmpLocaisCoringa[localKey].valorTotal += p.valor;
    }
  }

  // Converter para array e ordenar plantões por data
  for (const [localKey, localData] of Object.entries(tmpLocaisCoringa)) {
    // Ordenar plantões por data
    const plantoesOrdenados = localData.plantoes.sort((a, b) => a.data.localeCompare(b.data));
    
    // Extrair o local_id da chave
    const localId = localKey.replace('coringa:', '');
    
    gruposCoringa.push({
      key: localKey,
      titulo: localData.titulo,
      localId: localId,
      valorTotal: localData.valorTotal,
      plantoes: plantoesOrdenados
    });
  }

  // Ordenar grupos por título do local
  gruposCoringa.sort((a, b) => a.titulo.localeCompare(b.titulo));

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
            onClick={handleNovoPlantao}
            variant="outline"
          >
            Novo Plantão
          </Button>
        </div>
      </div>

      {/* Tabs Principal */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="plantoes">Plantões</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        {/* TAB RESUMO */}
        <TabsContent value="resumo" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pago</p>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {resumo.totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Agendados</p>
                        <p className="text-2xl font-bold text-yellow-600">{resumo.plantoesAgendados}</p>
                      </div>
                      <div className="text-gray-300">|</div>
                      <div>
                        <p className="text-sm font-medium text-gray-600">Realizados</p>
                        <p className="text-2xl font-bold text-green-600">{resumo.plantoesRealizados}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards Grid de Receitas dos Últimos 6 Meses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Receitas dos Últimos 6 Meses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {resumoMensal.map((item, index) => (
                  <div key={index} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <h3 className="font-bold text-blue-600 text-lg mb-3">
                        {format(item.data, 'MMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                      </h3>
                      <div className="space-y-2">
                        <p className="text-xl font-bold text-green-600">
                          R$ {item.realizado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-600">
                          Prev: R$ {item.previsto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Resumo Total */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total Realizado:</span>
                    <span className="ml-2 text-lg font-bold text-green-600">
                      R$ {resumoMensal.reduce((acc, item) => acc + item.realizado, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Total Previsto:</span>
                    <span className="ml-2 text-lg font-bold text-blue-600">
                      R$ {resumoMensal.reduce((acc, item) => acc + item.previsto, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Plantões Fixos no Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-blue-600">{resumo.plantoesFixos}</p>
                  <p className="text-sm text-gray-600">Escalas regulares</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Plantões Coringa no Mês
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">{resumo.plantoesCoringa}</p>
                  <p className="text-sm text-gray-600">Plantões extras</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Taxa de Realização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {resumo.totalPrevisto > 0 ? Math.round((resumo.plantoesRealizados * 100) / (resumo.plantoesAgendados + resumo.plantoesRealizados)) : 0}%
                  </p>
                  <p className="text-sm text-gray-600">Plantões realizados</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB PLANTÕES */}
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
                  {/* Fixos */}
                  {gruposFixos.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Plantões Fixos</h3>
                      <Accordion 
                        type="multiple" 
                        value={openAccordionsFixos} 
                        onValueChange={setOpenAccordionsFixos}
                        className="w-full"
                      >
                        {gruposFixos.map(grupo => (
                          <AccordionItem key={grupo.key} value={grupo.key}>
                            <AccordionTrigger>
                              <div className="w-full flex items-center justify-between pr-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-semibold">{grupo.titulo}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium text-green-700">
                                    Valor Mensal: R$ {grupo.valorMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarcarLocalComoPago(grupo);
                                    }}
                                  >
                                    Marcar como Pago
                                  </Button>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                <Accordion 
                                  type="multiple" 
                                  value={openSubAccordions} 
                                  onValueChange={setOpenSubAccordions}
                                  className="w-full"
                                >
                                  {grupo.subgrupos.map(subgrupo => (
                                    <AccordionItem key={subgrupo.key} value={subgrupo.key}>
                                      <AccordionTrigger>
                                        <div className="w-full flex items-center justify-between pr-4">
                                          <h4 className="font-semibold text-blue-700">{subgrupo.titulo}</h4>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">{subgrupo.itens.length} dia(s)</span>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Encontrar a escala fixa correspondente
                                                const escalaFixa = escalas.find(esc => 
                                                  esc.local_id === grupo.localId && 
                                                  esc.dia_semana === subgrupo.diaSemana
                                                );
                                                if (escalaFixa) {
                                                  handleCancelarPlantaoFixo(
                                                    escalaFixa.id,
                                                    escalaFixa.local_id,
                                                    subgrupo.diaSemana,
                                                    grupo.titulo,
                                                    subgrupo.titulo
                                                  );
                                                }
                                              }}
                                              className="h-6 px-2 text-xs"
                                            >
                                              <XCircle className="h-3 w-3 mr-1" />
                                              Cancelar
                                            </Button>
                                          </div>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="space-y-2">
                                          {subgrupo.itens.map(plantao => (
                                            <div key={plantao.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                                              <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                  <span className="font-medium">{format(parseLocalDate(plantao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                                  <span className="text-xs text-gray-600">{format(parseLocalDate(plantao.data), 'EEEE', { locale: ptBR })}</span>
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {formatHorario(plantao.horario_inicio || '')} - {formatHorario(plantao.horario_fim || '')}
                                                </div>
                                              </div>
                                              <div className="flex items-center gap-3">
                                                <span className="font-semibold">R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                                <Badge className={`flex items-center gap-1 ${(() => {
                                                  const statusInfo = getPlantaoStatus(plantao);
                                                  return getStatusColor(statusInfo.status_plantao, statusInfo.status_pagamento);
                                                })()}`}>
                                                  {(() => {
                                                    const statusInfo = getPlantaoStatus(plantao);
                                                    return getStatusIcon(statusInfo.status_plantao, statusInfo.status_pagamento);
                                                  })()}
                                                  {(() => {
                                                    const statusInfo = getPlantaoStatus(plantao);
                                                    if (statusInfo.status_pagamento === 'pago') return 'Pago';
                                                    
                                                    switch (statusInfo.status_plantao) {
                                                      case 'agendado': return 'Agendado';
                                                      case 'realizado': return 'Realizado';
                                                      case 'transferido': return 'Transferido';
                                                      case 'faltou': return 'Faltou';
                                                      case 'cancelado': return 'Cancelado';
                                                      default: return statusInfo.status_plantao;
                                                    }
                                                  })()}
                                                </Badge>
                                                {(plantao.status === 'passou' || plantao.foi_passado) && plantao.substituto_nome && (
                                                  <span className="text-xs text-gray-600">→ {plantao.substituto_nome}</span>
                                                )}
                                                <div className="flex gap-2">
                                                  <Select
                                                    value={getPlantaoStatus(plantao).status_plantao}
                                                    onValueChange={(newStatus) => handleAlterarStatusPlantao(plantao, newStatus)}
                                                  >
                                                    <SelectTrigger className="h-8 w-32">
                                                      <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                      <SelectItem value="agendado">Agendado</SelectItem>
                                                      <SelectItem value="realizado">Realizado</SelectItem>
                                                      <SelectItem value="transferido">Transferido</SelectItem>
                                                      <SelectItem value="faltou">Faltou</SelectItem>
                                                      <SelectItem value="cancelado">Cancelado</SelectItem>
                                                    </SelectContent>
                                                  </Select>
                                                  {plantao.status === 'cancelado' && plantao.tipo === 'fixo' && (
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => handleAcaoPlantao(plantao, 'cancelar')}
                                                      className="h-8"
                                                    >
                                                      <XCircle className="h-3 w-3 mr-1" />
                                                      Cancelar Futuros
                                                    </Button>
                                                  )}
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  )}

                  {/* Plantões Coringa Agrupados por Local */}
                  {gruposCoringa.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Plantões Coringa</h3>
                      <Accordion 
                        type="multiple" 
                        value={openAccordionsCoringas} 
                        onValueChange={setOpenAccordionsCoringas}
                        className="w-full"
                      >
                        {gruposCoringa.map(grupo => (
                          <AccordionItem key={grupo.key} value={grupo.key}>
                            <AccordionTrigger>
                              <div className="w-full flex items-center justify-between pr-4">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500" />
                                  <span className="font-semibold">{grupo.titulo}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-sm font-medium text-green-700">
                                    Valor Total: R$ {grupo.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <Button 
                                    size="sm" 
                                    variant="default"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarcarCoringaComoPago(grupo);
                                    }}
                                  >
                                    Marcar como Pago
                                  </Button>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-2">
                                {grupo.plantoes.map(plantao => (
                                  <div key={plantao.id} className="flex items-center justify-between p-3 border rounded-md bg-gray-50">
                                    <div className="flex items-center gap-4">
                                      <div className="flex flex-col">
                                        <span className="font-medium">{format(parseLocalDate(plantao.data), 'dd/MM/yyyy', { locale: ptBR })}</span>
                                        <span className="text-xs text-gray-600">{format(parseLocalDate(plantao.data), 'EEEE', { locale: ptBR })}</span>
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {formatHorario(plantao.horario_inicio || '')} - {formatHorario(plantao.horario_fim || '')}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="font-semibold">R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                      <Badge className={`flex items-center gap-1 ${(() => {
                                        const statusInfo = getPlantaoStatus(plantao);
                                        return getStatusColor(statusInfo.status_plantao, statusInfo.status_pagamento);
                                      })()}`}>
                                        {(() => {
                                          const statusInfo = getPlantaoStatus(plantao);
                                          return getStatusIcon(statusInfo.status_plantao, statusInfo.status_pagamento);
                                        })()}
                                        {(() => {
                                          const statusInfo = getPlantaoStatus(plantao);
                                          if (statusInfo.status_pagamento === 'pago') return 'Pago';
                                          
                                          switch (statusInfo.status_plantao) {
                                            case 'agendado': return 'Agendado';
                                            case 'realizado': return 'Realizado';
                                            case 'transferido': return 'Transferido';
                                            case 'faltou': return 'Faltou';
                                            case 'cancelado': return 'Cancelado';
                                            default: return statusInfo.status_plantao;
                                          }
                                        })()}
                                      </Badge>
                                      {(plantao.status === 'passou' || plantao.foi_passado) && plantao.substituto_nome && (
                                        <span className="text-xs text-gray-600">→ {plantao.substituto_nome}</span>
                                      )}
                                      <div className="flex gap-2">
                                        <Select
                                          value={getPlantaoStatus(plantao).status_plantao}
                                          onValueChange={(newStatus) => handleAlterarStatusPlantao(plantao, newStatus)}
                                        >
                                          <SelectTrigger className="h-8 w-32">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="agendado">Agendado</SelectItem>
                                            <SelectItem value="realizado">Realizado</SelectItem>
                                            <SelectItem value="transferido">Transferido</SelectItem>
                                            <SelectItem value="faltou">Faltou</SelectItem>
                                            <SelectItem value="cancelado">Cancelado</SelectItem>
                                          </SelectContent>
                                        </Select>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleAcaoPlantao(plantao, 'passar')}
                                          className="h-8"
                                        >
                                          <RefreshCw className="h-3 w-3 mr-1" />
                                          Transferir
                                        </Button>
                                      </div>
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
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Nenhum plantão encontrado para este período</p>
                  <Button 
                    onClick={() => gerarPlantoesMultiplosMeses(6)}
                    className="mt-4"
                  >
                    Gerar Plantões (Próximos 6 Meses)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB RELATÓRIOS */}
        <TabsContent value="relatorios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Relatório Detalhado - {meses.find(m => m.value === mesAtual.toString())?.label} {anoAtual}
                </div>
                <div className="flex items-center gap-4 text-lg font-semibold">
                  <span className="text-blue-600">
                    Previsto: R$ {(() => {
                      const plantoesAtivos = plantoes.filter(p => {
                        const statusInfo = getPlantaoStatus(p);
                        return ['agendado', 'realizado'].includes(statusInfo.status_plantao) || statusInfo.status_pagamento === 'pago';
                      });
                      return plantoesAtivos.reduce((acc, p) => acc + p.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    })()}
                  </span>
                  <span className="text-green-600">
                    Pago: R$ {(() => {
                      const plantoesPagos = plantoes.filter(p => {
                        const statusInfo = getPlantaoStatus(p);
                        return statusInfo.status_pagamento === 'pago';
                      });
                      return plantoesPagos.reduce((acc, p) => acc + p.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
                    })()}
                  </span>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status Plantão</TableHead>
                    <TableHead>Status Pagamento</TableHead>
                    <TableHead>Substituto</TableHead>
                    <TableHead>Justificativa</TableHead>
                    <TableHead>Local</TableHead>
                    <TableHead>Hora</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plantoes
                    .sort((a, b) => a.data.localeCompare(b.data))
                    .map((plantao) => (
                    <TableRow key={plantao.id}>
                      <TableCell>
                        {format(parseLocalDate(plantao.data), 'dd/MM/yyyy', { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={plantao.tipo === 'fixo' ? 'default' : 'secondary'}>
                          {plantao.tipo === 'fixo' ? 'Fixo' : 'Coringa'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const statusInfo = getPlantaoStatus(plantao);
                            return getStatusIcon(statusInfo.status_plantao, statusInfo.status_pagamento);
                          })()}
                          <Badge className={(() => {
                            const statusInfo = getPlantaoStatus(plantao);
                            return getStatusColor(statusInfo.status_plantao, statusInfo.status_pagamento);
                          })()}>
                            {(() => {
                              const statusInfo = getPlantaoStatus(plantao);
                              switch (statusInfo.status_plantao) {
                                case 'agendado': return 'Agendado';
                                case 'realizado': return 'Realizado';
                                case 'transferido': return 'Transferido';
                                case 'faltou': return 'Faltou';
                                case 'cancelado': return 'Cancelado';
                                default: return statusInfo.status_plantao;
                              }
                            })()}
                          </Badge>
                          {(() => {
                            const statusInfo = getPlantaoStatus(plantao);
                            return (statusInfo.status_plantao === 'transferido' || plantao.foi_passado) && plantao.substituto_nome && (
                              <span className="text-xs text-gray-600">→ {plantao.substituto_nome}</span>
                            );
                          })()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={(() => {
                          const statusInfo = getPlantaoStatus(plantao);
                          return statusInfo.status_pagamento === 'pago' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800';
                        })()}>
                          {(() => {
                            const statusInfo = getPlantaoStatus(plantao);
                            return statusInfo.status_pagamento === 'pago' ? 'Pago' : 'Pendente';
                          })()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(plantao.status === 'passou' || plantao.foi_passado) ? (plantao.substituto_nome || 'N/A') : '-'}
                      </TableCell>
                      <TableCell>
                        {plantao.observacoes || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-gray-400" />
                          {plantao.local}
                        </div>
                      </TableCell>
                      <TableCell>
                        {plantao.horario_inicio && plantao.horario_fim 
                          ? `${formatHorario(plantao.horario_inicio)} - ${formatHorario(plantao.horario_fim)}`
                          : '-'
                        }
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Ação */}
      <Dialog open={modalAcao.isOpen} onOpenChange={(open) => setModalAcao({ ...modalAcao, isOpen: open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalAcao.tipo === 'passar' ? 'Transferir Plantão' : 
               modalAcao.plantao?.tipo === 'fixo' ? 'Cancelar Escala Fixa' : 'Cancelar Plantão'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {modalAcao.plantao && (
              <div className="p-4 bg-gray-50 rounded-lg">
                {modalAcao.plantao.tipo === 'fixo' ? (
                  <>
                    <p className="font-medium">
                      {modalAcao.tipo === 'passar' ? 'Plantão Fixo' : 'Escala Fixa'}: {modalAcao.plantao.data ? format(parseLocalDate(modalAcao.plantao.data), 'dd/MM/yyyy', { locale: ptBR }) : modalAcao.plantao.diaSemanaNome} - {modalAcao.plantao.local}
                    </p>
                    <p className="text-sm text-gray-600">
                      {modalAcao.tipo === 'passar' 
                        ? `Apenas este plantão será transferido. Valor: R$ ${modalAcao.plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        : 'Serão cancelados todos os plantões futuros desta escala (a partir de hoje)'
                      }
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-medium">
                      Plantão: {format(parseLocalDate(modalAcao.plantao.data), 'dd/MM/yyyy', { locale: ptBR })} - {modalAcao.plantao.local}
                    </p>
                    <p className="text-sm text-gray-600">
                      Valor: R$ {modalAcao.plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </>
                )}
              </div>
            )}
            
            {modalAcao.tipo === 'passar' && (
              <div className="space-y-2">
                <Label htmlFor="substituto">Substituto</Label>
                <Input
                  id="substituto"
                  value={substituto}
                  onChange={(e) => setSubstituto(e.target.value)}
                  placeholder="Nome do substituto"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="justificativa">Justificativa</Label>
              <Textarea
                id="justificativa"
                value={justificativa}
                onChange={(e) => setJustificativa(e.target.value)}
                placeholder={
                  modalAcao.tipo === 'passar' ? "Motivo da transferência do plantão..." : 
                  modalAcao.plantao?.tipo === 'fixo' ? "Motivo do cancelamento da escala fixa..." :
                  "Motivo do cancelamento..."
                }
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalAcao({ isOpen: false, plantao: null, tipo: null })}>
              Cancelar
            </Button>
            <Button onClick={confirmarAcao}>
              {modalAcao.tipo === 'passar' ? 'Confirmar Transferência' : 
               modalAcao.plantao?.tipo === 'fixo' ? 'Cancelar Escala Fixa' : 'Confirmar Cancelamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Novo Plantão */}
      <Dialog open={novoPlantaoOpen} onOpenChange={setNovoPlantaoOpen}>
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
                    setFixoForm(f => ({ ...f, horario_inicio: novoInicio, carga_horaria: calcularCargaHoraria(novoInicio, f.horario_fim) }));
                  }} required />
                </div>
                <div className="flex-1">
                  <Label>Horário Fim</Label>
                  <Input type="time" value={fixoForm.horario_fim} onChange={e => {
                    const novoFim = e.target.value;
                    setFixoForm(f => ({ ...f, horario_fim: novoFim, carga_horaria: calcularCargaHoraria(f.horario_inicio, novoFim) }));
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
  );
};

export default GestaoFinanceira;
