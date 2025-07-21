import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { addDays, format, startOfMonth, endOfMonth, isSameDay, getDay } from 'date-fns';

export interface PlantaoFixoRealizado {
  id: string;
  escala_fixa_id: string;
  data: string;
  valor: number;
  status_pagamento: string;
  data_pagamento_prevista: string;
  data_pagamento_efetiva: string | null;
  foi_passado: boolean;
  substituto_id: string | null;
  substituto_nome: string | null;
  justificativa_passagem: string | null;
  local_id: string;
}

export interface PlantaoCoringa {
  id: string;
  medico_id: string;
  data: string;
  horario_inicio: string;
  horario_fim: string;
  valor: number;
  status_pagamento: string;
  data_pagamento_prevista: string;
  data_pagamento_efetiva: string | null;
  local_id: string;
  created_at?: string;
  updated_at?: string;
  motivo_cancelamento?: string | null;
  data_cancelamento?: string | null;
}

export function usePlantoesFinanceiro(mes: number, ano: number) {
  const { profile } = useAuth();
  const [plantoesFixos, setPlantoesFixos] = useState<PlantaoFixoRealizado[]>([]);
  const [plantoesCoringa, setPlantoesCoringa] = useState<PlantaoCoringa[]>([]);
  const [loading, setLoading] = useState(false);

  const generateAndFetchShifts = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Step 1: Chamar a função no servidor para garantir que os plantões do mês estão corretos
      const { error: rpcError } = await supabase.rpc('generate_monthly_shifts', {
        p_user_id: profile.id,
        p_ano: ano,
        p_mes: mes
      });

      if (rpcError) {
        console.error('Erro ao gerar plantões no servidor:', rpcError);
        // Opcional: Adicionar um toast para notificar o usuário do erro.
      }

      // Step 2: Buscar os dados agora corretos do banco de dados
      const { data: escalas } = await supabase
        .from('plantonista_escala_fixa')
        .select('id')
        .eq('medico_id', profile.id);
      const escalaIds = (escalas || []).map(e => e.id);

      const mesStr = String(mes).padStart(2, '0');
      const inicio = `${ano}-${mesStr}-01`;
      const lastDay = new Date(ano, mes, 0).getDate();
      const fim = `${ano}-${mesStr}-${String(lastDay).padStart(2, '0')}`;

      let fixos: any[] = [];
      if (escalaIds.length > 0) {
        const { data: fixosData, error: errorFixos } = await supabase
          .from('plantonista_plantao_fixo_realizado')
          .select('*')
          .in('escala_fixa_id', escalaIds)
          .gte('data', inicio)
          .lte('data', fim)
          .order('data', { ascending: true });
        if (errorFixos) throw errorFixos;
        fixos = fixosData || [];
      }

      const { data: coringa, error: errorCoringa } = await supabase
        .from('plantonista_plantao_coringa')
        .select('*')
        .eq('medico_id', profile.id)
        .gte('data', inicio)
        .lte('data', fim)
        .order('data', { ascending: true });
      if (errorCoringa) throw errorCoringa;

      setPlantoesFixos(fixos as PlantaoFixoRealizado[]);
      setPlantoesCoringa((coringa || []) as PlantaoCoringa[]);
    } catch (e) {
      console.error('Falha ao gerar ou buscar plantões:', e);
      setPlantoesFixos([]);
      setPlantoesCoringa([]);
    } finally {
      setLoading(false);
    }
  }, [profile, mes, ano]);

  useEffect(() => {
    generateAndFetchShifts();
  }, [generateAndFetchShifts]);

  // Função para criar novo plantão coringa
  type CriarPlantaoCoringaData = {
    data: string;
    horario_inicio: string;
    horario_fim: string;
    valor: number;
    data_pagamento_prevista: string;
    local_id: string;
  };
  const criarPlantaoCoringa = async (dados: CriarPlantaoCoringaData) => {
    if (!profile) return;
    setLoading(true);
    try {
      await supabase
        .from('plantonista_plantao_coringa')
        .insert({
          ...dados,
          medico_id: profile.id,
          status_pagamento: 'pendente',
          data_pagamento_efetiva: null,
        });
      await generateAndFetchShifts();
    } finally {
      setLoading(false);
    }
  };

  // Função utilitária para meses/anos disponíveis (exemplo: últimos 2 anos)
  const getMesesAnosDisponiveis = () => {
    const anos: number[] = [];
    const anoAtual = new Date().getFullYear();
    for (let a = anoAtual - 1; a <= anoAtual; a++) anos.push(a);
    const meses = [
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Março' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' },
    ];
    return { meses, anos };
  };

  // Totais
  const totalFixos = plantoesFixos.reduce((acc, p) => acc + (!p.foi_passado ? 1 : 0), 0);
  const totalCoringa = plantoesCoringa.reduce((acc, p) => acc + (!('motivo_cancelamento' in p && p.motivo_cancelamento) ? p.valor : 0), 0);
  const totalPago =
    plantoesFixos.filter(p => p.status_pagamento === 'pago' && !p.foi_passado).reduce((acc, p) => acc + 1, 0) +
    plantoesCoringa.filter(p => p.status_pagamento === 'pago' && !('motivo_cancelamento' in p && p.motivo_cancelamento)).reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = totalFixos + totalCoringa - totalPago;

  // Marcar pagamento
  const marcarPagoFixo = async (plantaoId: string) => {
    await supabase
      .from('plantonista_plantao_fixo_realizado')
      .update({ status_pagamento: 'pago', data_pagamento_efetiva: new Date().toISOString() })
      .eq('id', plantaoId);
    generateAndFetchShifts();
  };
  const marcarPagoCoringa = async (plantaoId: string) => {
    await supabase
      .from('plantonista_plantao_coringa')
      .update({ status_pagamento: 'pago', data_pagamento_efetiva: new Date().toISOString() })
      .eq('id', plantaoId);
    generateAndFetchShifts();
  };

  // Passar plantão fixo
  const passarPlantaoFixo = async (plantaoId: string, substitutoId: string | null, substitutoNome: string | null, justificativa: string | null) => {
    await supabase
      .from('plantonista_plantao_fixo_realizado')
      .update({ foi_passado: true, substituto_id: substitutoId, substituto_nome: substitutoNome, justificativa_passagem: justificativa })
      .eq('id', plantaoId);
    generateAndFetchShifts();
  };

  return {
    plantoesFixos,
    plantoesCoringa,
    totalFixos,
    totalCoringa,
    totalPago,
    totalPendente,
    loading,
    marcarPagoFixo,
    marcarPagoCoringa,
    passarPlantaoFixo,
    criarPlantaoCoringa,
    getMesesAnosDisponiveis,
    refetch: generateAndFetchShifts
  };
} 