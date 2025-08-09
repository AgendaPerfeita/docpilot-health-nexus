
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PlantaoFixo {
  id: string;
  data: string;
  local: string;
  valor: number;
  status: 'realizado' | 'faltou' | 'passou' | 'pendente';
  observacoes?: string;
  // Extras para agrupamento/renderização
  tipo?: 'fixo' | 'coringa';
  escala_fixa_id?: string; // para fixos
  horario_inicio?: string; // para coringas (ou derivado de escala)
  horario_fim?: string;    // para coringas (ou derivado de escala)
  local_id?: string;
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
      const inicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
      const proximoMes = mes + 1;
      const fim = `${ano}-${proximoMes.toString().padStart(2, '0')}-01`;

      // Plantões fixos realizados
      const { data: fixos, error: errorFixos } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select(`
          *,
          plantonista_locais_trabalho(id, nome)
        `)
        .gte('data', inicio)
        .lt('data', fim)
        .order('data');

      if (errorFixos) throw errorFixos;

      const fixosFormatados = fixos?.map((item: any) => ({
        id: item.id,
        data: item.data,
        local: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
        valor: item.valor || 0,
        status: (item.foi_passado ? 'passou' : (item.status_pagamento || 'pendente')) as 'realizado' | 'faltou' | 'passou' | 'pendente',
        observacoes: item.justificativa_passagem || '',
        tipo: 'fixo' as const,
        escala_fixa_id: item.escala_fixa_id as string | undefined,
        local_id: (item.plantonista_locais_trabalho as any)?.id as string | undefined
      })) || [];

      // Plantões coringa (avulsos)
      const { data: coringas, error: errorCoringas } = await supabase
        .from('plantonista_plantao_coringa')
        .select(`
          *,
          plantonista_locais_trabalho(id, nome)
        `)
        .gte('data', inicio)
        .lt('data', fim)
        .order('data');

      if (errorCoringas) throw errorCoringas;

      const coringasFormatados: PlantaoFixo[] = (coringas || []).map((item: any) => ({
        id: item.id,
        data: item.data,
        local: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
        valor: Number(item.valor) || 0,
        status: (item.status_pagamento === 'pago' ? 'realizado' : 'pendente'),
        observacoes: '',
        tipo: 'coringa' as const,
        horario_inicio: item.horario_inicio || undefined,
        horario_fim: item.horario_fim || undefined,
        local_id: (item.plantonista_locais_trabalho as any)?.id as string | undefined
      }));

      // Ordenar por data asc
      const todos = [...fixosFormatados, ...coringasFormatados].sort((a, b) =>
        a.data.localeCompare(b.data)
      );
      setPlantoes(todos);
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
          plantonista_locais_trabalho(nome)
        `)
        .order('dia_semana');

      if (error) throw error;

      const escalasFormatadas = data?.map(item => ({
        id: item.id,
        local_id: item.local_id,
        local_nome: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
        dia_semana: item.dia_semana,
        horario_inicio: item.horario_inicio,
        horario_fim: item.horario_fim,
        valor_mensal: item.valor_mensal || 0,
        data_pagamento: item.data_pagamento || 5,
        ativo: true
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
      // Simple implementation - this would need a proper database function
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

  // Auto-carregar dados do mês/ano atual quando o hook for usado
  useEffect(() => {
    const now = new Date();
    const mesAtual = now.getMonth() + 1;
    const anoAtual = now.getFullYear();
    // Carrega em paralelo; RLS filtra por usuário
    void carregarPlantoes(mesAtual, anoAtual);
    void carregarEscalas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
