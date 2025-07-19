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
}

export function usePlantoesFinanceiro(mes: number, ano: number) {
  const { profile } = useAuth();
  const [plantoesFixos, setPlantoesFixos] = useState<PlantaoFixoRealizado[]>([]);
  const [plantoesCoringa, setPlantoesCoringa] = useState<PlantaoCoringa[]>([]);
  const [loading, setLoading] = useState(false);

  // Função para gerar plantões realizados do mês a partir das escalas fixas
  const gerarPlantoesFixosDoMes = async () => {
    if (!profile) return;
    // Buscar escalas fixas do médico
    const { data: escalas } = await supabase
      .from('plantonista_escala_fixa')
      .select('id, local_id, dia_semana, valor_mensal, horario_inicio, horario_fim, carga_horaria, data_pagamento, created_at, updated_at')
      .eq('medico_id', profile.id);
    if (!escalas) return;
    // Buscar plantões já realizados do mês
    const mesStr = String(mes).padStart(2, '0');
    const inicio = `${ano}-${mesStr}-01`;
    const fim = `${ano}-${mesStr}-31`;
    const escalaIds = (escalas || []).map(e => e.id);
    let realizados: any[] = [];
    if (escalaIds.length > 0) {
      const { data: realizadosData } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select('*')
        .in('escala_fixa_id', escalaIds)
        .gte('data', inicio)
        .lte('data', fim);
      realizados = realizadosData || [];
    }
    // Para cada escala, gerar datas do mês
    for (const escala of escalas) {
      let data = startOfMonth(new Date(ano, mes - 1, 1));
      const end = endOfMonth(data);
      // Calcular quantos plantões para essa escala neste mês
      let totalPlantoesNoMes = 0;
      let tempData = startOfMonth(new Date(ano, mes - 1, 1));
      while (tempData <= end) {
        if (getDay(tempData) === escala.dia_semana) {
          totalPlantoesNoMes++;
        }
        tempData = addDays(tempData, 1);
      }
      while (data <= end) {
        if (getDay(data) === escala.dia_semana) {
          const jaExiste = realizados && realizados.filter(p => p.escala_fixa_id === escala.id && p.data === format(data, 'yyyy-MM-dd')).length > 0;
          if (!jaExiste) {
            await supabase.from('plantonista_plantao_fixo_realizado').insert({
              escala_fixa_id: escala.id,
              data: format(data, 'yyyy-MM-dd'),
              valor: totalPlantoesNoMes > 0 ? Number((Number(escala.valor_mensal) / totalPlantoesNoMes).toFixed(2)) : 0,
              status_pagamento: 'pendente',
              data_pagamento_prevista: format(data, 'yyyy-MM-dd'),
              foi_passado: false,
              local_id: escala.local_id
            });
          }
        }
        data = addDays(data, 1);
      }
    }
  };

  const fetchPlantoes = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      // Buscar escalas do médico
      const { data: escalas } = await supabase
        .from('plantonista_escala_fixa')
        .select('id')
        .eq('medico_id', profile.id);
      const escalaIds = (escalas || []).map(e => e.id);
      // Buscar plantões fixos realizados do mês
      const mesStr = String(mes).padStart(2, '0');
      const inicio = `${ano}-${mesStr}-01`;
      const fim = `${ano}-${mesStr}-31`;
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
      // Buscar plantões coringa do mês
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
      setPlantoesFixos([]);
      setPlantoesCoringa([]);
    } finally {
      setLoading(false);
    }
  }, [profile, mes, ano]);

  // Chamar geração automática ao iniciar o hook
  useEffect(() => {
    gerarPlantoesFixosDoMes();
  }, [profile, mes, ano]);

  useEffect(() => {
    fetchPlantoes();
  }, [fetchPlantoes]);

  // Função para criar novo plantão coringa
  const criarPlantaoCoringa = async (dados: Omit<PlantaoCoringa, 'id' | 'status_pagamento' | 'data_pagamento_efetiva' | 'created_at' | 'updated_at'>) => {
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
      await fetchPlantoes();
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
  const totalFixos = plantoesFixos.reduce((acc, p) => acc + (p.foi_passado ? 0 : 1), 0);
  const totalCoringa = plantoesCoringa.reduce((acc, p) => acc + p.valor, 0);
  const totalPago =
    plantoesFixos.filter(p => p.status_pagamento === 'pago' && !p.foi_passado).reduce((acc, p) => acc + 1, 0) +
    plantoesCoringa.filter(p => p.status_pagamento === 'pago').reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = totalFixos + totalCoringa - totalPago;

  // Marcar pagamento
  const marcarPagoFixo = async (plantaoId: string) => {
    await supabase
      .from('plantonista_plantao_fixo_realizado')
      .update({ status_pagamento: 'pago', data_pagamento_efetiva: new Date().toISOString() })
      .eq('id', plantaoId);
    fetchPlantoes();
  };
  const marcarPagoCoringa = async (plantaoId: string) => {
    await supabase
      .from('plantonista_plantao_coringa')
      .update({ status_pagamento: 'pago', data_pagamento_efetiva: new Date().toISOString() })
      .eq('id', plantaoId);
    fetchPlantoes();
  };

  // Passar plantão fixo
  const passarPlantaoFixo = async (plantaoId: string, substitutoId: string | null, substitutoNome: string | null, justificativa: string | null) => {
    await supabase
      .from('plantonista_plantao_fixo_realizado')
      .update({ foi_passado: true, substituto_id: substitutoId, substituto_nome: substitutoNome, justificativa_passagem: justificativa })
      .eq('id', plantaoId);
    fetchPlantoes();
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
    refetch: fetchPlantoes
  };
} 