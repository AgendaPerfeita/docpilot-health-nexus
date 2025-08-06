
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlantaoFixo {
  id: string;
  data: string;
  local: string;
  valor: number;
  status: 'realizado' | 'faltou' | 'passou' | 'pendente';
  observacoes?: string;
}

export interface EscalaFixa {
  id: string;
  local_id: string;
  local_nome: string;
  dia_semana: number;
  horario_inicio: string;
  horario_fim: string;
  valor_mensal: number;
  data_pagamento: number;
  ativo: boolean;
}

export const usePlantoesFinanceiro = () => {
  const [plantoes, setPlantoes] = useState<PlantaoFixo[]>([]);
  const [escalas, setEscalas] = useState<EscalaFixa[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarPlantoes = async (mes: number, ano: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select(`
          *,
          plantonista_locais_trabalho!inner(nome)
        `)
        .gte('data', `${ano}-${mes.toString().padStart(2, '0')}-01`)
        .lt('data', `${ano}-${(mes + 1).toString().padStart(2, '0')}-01`)
        .order('data');

      if (error) throw error;

      const plantoesFormatados = data?.map(item => ({
        id: item.id,
        data: item.data,
        local: item.plantonista_locais_trabalho?.nome || 'Local não encontrado',
        valor: item.valor || 0,
        status: item.foi_passado ? 'passou' : (item.status_pagamento || 'pendente'),
        observacoes: item.observacoes
      })) || [];

      setPlantoes(plantoesFormatados);
    } catch (error) {
      console.error('Erro ao carregar plantões:', error);
      toast.error('Erro ao carregar plantões');
    } finally {
      setLoading(false);
    }
  };

  const carregarEscalas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_escala_fixa')
        .select(`
          *,
          plantonista_locais_trabalho!inner(nome)
        `)
        .order('dia_semana');

      if (error) throw error;

      const escalasFormatadas = data?.map(item => ({
        id: item.id,
        local_id: item.local_id,
        local_nome: item.plantonista_locais_trabalho?.nome || 'Local não encontrado',
        dia_semana: item.dia_semana,
        horario_inicio: item.horario_inicio,
        horario_fim: item.horario_fim,
        valor_mensal: item.valor_mensal || 0,
        data_pagamento: item.data_pagamento || 5,
        ativo: item.ativo || false
      })) || [];

      setEscalas(escalasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar escalas:', error);
      toast.error('Erro ao carregar escalas');
    } finally {
      setLoading(false);
    }
  };

  const gerarPlantoesDoMes = async (ano: number, mes: number) => {
    try {
      setLoading(true);
      const { error } = await supabase.rpc('generate_monthly_shifts', {
        p_user_id: (await supabase.auth.getUser()).data.user?.id,
        p_ano: ano,
        p_mes: mes
      });

      if (error) throw error;

      toast.success('Plantões do mês gerados com sucesso!');
      await carregarPlantoes(mes, ano);
    } catch (error) {
      console.error('Erro ao gerar plantões:', error);
      toast.error('Erro ao gerar plantões do mês');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusPlantao = async (plantaoId: string, status: string, observacoes?: string) => {
    try {
      setLoading(true);
      const updateData: any = {
        foi_passado: status === 'passou',
        observacoes: observacoes
      };

      if (status !== 'passou') {
        updateData.status_pagamento = status;
      }

      const { error } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .update(updateData)
        .eq('id', plantaoId);

      if (error) throw error;

      setPlantoes(prev => prev.map(p => 
        p.id === plantaoId 
          ? { ...p, status: status as any, observacoes }
          : p
      ));

      toast.success('Status do plantão atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar plantão:', error);
      toast.error('Erro ao atualizar status do plantão');
    } finally {
      setLoading(false);
    }
  };

  return {
    plantoes,
    escalas,
    loading,
    carregarPlantoes,
    carregarEscalas,
    gerarPlantoesDoMes,
    atualizarStatusPlantao
  };
};
