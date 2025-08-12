
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export interface PlantaoFixo {
  id: string;
  data: string;
  local: string;
  valor: number;
  // Novo sistema: dois campos separados
  status_plantao: 'agendado' | 'realizado' | 'transferido' | 'faltou' | 'cancelado';
  status_pagamento: 'pendente' | 'pago';
  // Campo antigo (para compatibilidade durante migração)
  status?: 'realizado' | 'faltou' | 'passou' | 'pendente' | 'cancelado' | 'pago';
  observacoes?: string;
  substituto?: string;
  substituto_nome?: string;
  foi_passado?: boolean;
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

// Função helper para compatibilidade durante migração
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

export const usePlantoesFinanceiro = () => {
  const [plantoes, setPlantoes] = useState<PlantaoFixo[]>([]);
  const [escalas, setEscalas] = useState<EscalaFixa[]>([]);
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();

  const carregarPlantoes = async (mes: number, ano: number) => {
    try {
      setLoading(true);
      const inicio = `${ano}-${mes.toString().padStart(2, '0')}-01`;
      const proximoMes = mes + 1;
      const fim = `${ano}-${proximoMes.toString().padStart(2, '0')}-01`;

      // Primeiro, carregar escalas para ter os horários
      const { data: escalasData, error: errorEscalas } = await supabase
        .from('plantonista_escala_fixa')
        .select(`
          *,
          plantonista_locais_trabalho(id, nome)
        `);

      if (errorEscalas) throw errorEscalas;

      // Criar mapa de escalas por local_id para facilitar acesso
      const escalasPorLocal = new Map();
      escalasData?.forEach((escala: any) => {
        escalasPorLocal.set(escala.local_id, {
          horario_inicio: escala.horario_inicio,
          horario_fim: escala.horario_fim,
          dia_semana: escala.dia_semana
        });
      });

      // Plantões fixos realizados
      const { data: fixos, error: errorFixos } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select(`
          *,
          plantonista_locais_trabalho(id, nome),
          plantonista_escala_fixa(id, horario_inicio, horario_fim)
        `)
        .gte('data', inicio)
        .lt('data', fim)
        .order('data');

      if (errorFixos) throw errorFixos;

      const fixosFormatados = fixos?.map((item: any) => {
        // Determinar horários baseado na escala ou local
        let horario_inicio, horario_fim;
        
        if (item.plantonista_escala_fixa) {
          horario_inicio = item.plantonista_escala_fixa.horario_inicio;
          horario_fim = item.plantonista_escala_fixa.horario_fim;
        } else if (item.local_id && escalasPorLocal.has(item.local_id)) {
          const escala = escalasPorLocal.get(item.local_id);
          horario_inicio = escala.horario_inicio;
          horario_fim = escala.horario_fim;
        }

        // Debug: verificar dados originais
        if (import.meta.env.DEV) {
          console.log('Plantão fixo:', {
            id: item.id,
            cancelado: item.cancelado,
            foi_passado: item.foi_passado,
            status_pagamento: item.status_pagamento,
            data: item.data
          });
        }

        return {
          id: item.id,
          data: item.data,
          local: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
          valor: item.valor || 0,
          // Novos campos obrigatórios
          status_plantao: (() => {
            if (item.status_plantao) return item.status_plantao;
            if (item.cancelado === true || item.status_pagamento === 'cancelado') return 'cancelado';
            if (item.foi_passado === true) return 'transferido';
            if (item.status_pagamento === 'faltou') return 'faltou';
            if (item.status_pagamento === 'realizado' || item.status_pagamento === 'pago') return 'realizado';
            return 'agendado';
          })() as any,
          status_pagamento: (item.status_pagamento === 'pago' ? 'pago' : 'pendente') as any,
          // Campo antigo para compatibilidade
          status: (() => {
            // Verificar primeiro se está cancelado
            if (item.cancelado === true || item.status_pagamento === 'cancelado') {
              return 'cancelado';
            }
            // Depois verificar se foi passado
            if (item.foi_passado === true) {
              return 'passou';
            }
            // Depois verificar outros status
            if (item.status_pagamento === 'pago') return 'realizado';
            if (item.status_pagamento === 'faltou') return 'faltou';
            return 'pendente';
          })() as 'realizado' | 'faltou' | 'passou' | 'pendente' | 'cancelado',
          observacoes: item.justificativa_passagem || '',
          substituto: item.substituto_nome || '',
          substituto_nome: item.substituto_nome,
          foi_passado: item.foi_passado,
          tipo: 'fixo' as const,
          escala_fixa_id: item.escala_fixa_id as string | undefined,
          local_id: (item.plantonista_locais_trabalho as any)?.id as string | undefined,
          horario_inicio,
          horario_fim
        };
      }) || [];

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

      const coringasFormatados: PlantaoFixo[] = (coringas || []).map((item: any) => {
        // Debug: verificar dados originais
        if (import.meta.env.DEV) {
          console.log('Plantão coringa:', {
            id: item.id,
            cancelado: item.cancelado,
            foi_passado: item.foi_passado,
            status_pagamento: item.status_pagamento,
            data: item.data
          });
        }

        return {
          id: item.id,
          data: item.data,
          local: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
          valor: Number(item.valor) || 0,
          // Novos campos obrigatórios
          status_plantao: (() => {
            if (item.status_plantao) return item.status_plantao;
            if (item.cancelado === true || item.status_pagamento === 'cancelado') return 'cancelado';
            if (item.foi_passado === true) return 'transferido';
            if (item.status_pagamento === 'faltou') return 'faltou';
            if (item.status_pagamento === 'realizado' || item.status_pagamento === 'pago') return 'realizado';
            return 'agendado';
          })() as any,
          status_pagamento: (item.status_pagamento === 'pago' ? 'pago' : 'pendente') as any,
          // Campo antigo para compatibilidade
          status: (() => {
            // Verificar primeiro se está cancelado
            if (item.cancelado === true || item.status_pagamento === 'cancelado') {
              return 'cancelado';
            }
            // Depois verificar se foi passado
            if (item.foi_passado === true) {
              return 'passou';
            }
            // Depois verificar outros status
            if (item.status_pagamento === 'pago') return 'realizado';
            if (item.status_pagamento === 'faltou') return 'faltou';
            return 'pendente';
          })() as 'realizado' | 'faltou' | 'passou' | 'pendente' | 'cancelado',
          observacoes: item.observacoes || '',
          substituto: item.substituto || '',
          substituto_nome: item.substituto_nome,
          foi_passado: item.foi_passado,
          tipo: 'coringa' as const,
          horario_inicio: item.horario_inicio || undefined,
          horario_fim: item.horario_fim || undefined,
          local_id: (item.plantonista_locais_trabalho as any)?.id as string | undefined
        };
      });

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
      
      // Chamar a função generate_monthly_shifts para gerar os plantões
      const { error } = await supabase.rpc('generate_monthly_shifts', {
        p_user_id: profile?.id || '',
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

  const gerarPlantoesMultiplosMeses = async (mesesIniciais: number = 6) => {
    try {
      setLoading(true);
      
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      
      // Gerar plantões para os próximos X meses
      for (let i = 0; i < mesesIniciais; i++) {
        const dataFutura = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
        const anoFuturo = dataFutura.getFullYear();
        const mesFuturo = dataFutura.getMonth() + 1;
        
        // Chamar a função generate_monthly_shifts para gerar os plantões
        const { error } = await supabase.rpc('generate_monthly_shifts', {
          p_user_id: profile?.id || '',
          p_ano: anoFuturo,
          p_mes: mesFuturo
        });

        if (error) {
          console.error(`Erro ao gerar plantões para ${mesFuturo}/${anoFuturo}:`, error);
          // Não falhar completamente, apenas logar o erro
        }
      }
      
      toast.success(`Plantões gerados para os próximos ${mesesIniciais} meses!`);
      await carregarPlantoes(mesAtual, anoAtual);
    } catch (error) {
      console.error('Erro ao gerar plantões:', error);
      toast.error('Erro ao gerar plantões');
    } finally {
      setLoading(false);
    }
  };

  // Função para gerar plantões automaticamente para escalas existentes
  const gerarPlantoesParaEscalasExistentes = async () => {
    try {
      if (!profile?.id) return;
      
      console.log('[AUTO-GENERATE] Iniciando geração automática para escalas existentes...');
      
      const hoje = new Date();
      const anoAtual = hoje.getFullYear();
      const mesAtual = hoje.getMonth() + 1;
      
      // Gerar plantões para os próximos 6 meses (apenas futuros)
      for (let i = 0; i < 6; i++) {
        const dataFutura = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
        const anoFuturo = dataFutura.getFullYear();
        const mesFuturo = dataFutura.getMonth() + 1;
        
        // Pular meses que já passaram
        if (dataFutura < new Date(hoje.getFullYear(), hoje.getMonth(), 1)) {
          console.log(`[AUTO-GENERATE] Pulando mês passado ${mesFuturo}/${anoFuturo}...`);
          continue;
        }
        
        console.log(`[AUTO-GENERATE] Gerando plantões para ${mesFuturo}/${anoFuturo}...`);
        
        // Chamar a função generate_monthly_shifts para gerar os plantões
        const { error } = await supabase.rpc('generate_monthly_shifts', {
          p_user_id: profile.id,
          p_ano: anoFuturo,
          p_mes: mesFuturo
        });

        if (error) {
          console.error(`[AUTO-GENERATE] Erro ao gerar plantões para ${mesFuturo}/${anoFuturo}:`, error);
        } else {
          console.log(`[AUTO-GENERATE] Plantões gerados com sucesso para ${mesFuturo}/${anoFuturo}`);
        }
      }
      
      console.log('[AUTO-GENERATE] Geração automática concluída');
    } catch (error) {
      console.error('[AUTO-GENERATE] Erro na geração automática:', error);
    }
  };

  const atualizarStatusPlantao = async (plantaoId: string, status: string, observacoes?: string, substituto?: string) => {
    try {
      setLoading(true);
      
      // Determinar se é fixo ou coringa baseado no ID ou estrutura
      const plantao = plantoes.find(p => p.id === plantaoId);
      const isFixo = plantao?.tipo === 'fixo';

      const updateData: any = {
        justificativa_passagem: observacoes || '',
        substituto_nome: substituto || ''
      };

      // Novo sistema: atualizar status_plantao
      if (status === 'transferido' || status === 'passou') {
        updateData.status_plantao = 'transferido';
        updateData.foi_passado = true;
        updateData.status_pagamento = 'pendente';
        updateData.cancelado = false;
        // Manter compatibilidade com sistema antigo
        updateData.status_pagamento = 'passou';
      } else if (status === 'cancelado') {
        updateData.status_plantao = 'cancelado';
        updateData.cancelado = true;
        updateData.status_pagamento = 'pendente';
        // Manter compatibilidade com sistema antigo
        updateData.status_pagamento = 'cancelado';
      } else {
        // Para: agendado, realizado, faltou
        updateData.status_plantao = status;
        updateData.cancelado = false;
        updateData.foi_passado = false;
        updateData.status_pagamento = 'pendente';
        // Manter compatibilidade com sistema antigo
        updateData.status_pagamento = status;
      }

      const tableName = isFixo ? 'plantonista_plantao_fixo_realizado' : 'plantonista_plantao_coringa';
      
      const { error } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('id', plantaoId);

      if (error) throw error;

      // Nota: O estado local será atualizado pelo re-fetch no componente
      // Isso evita inconsistências entre o estado local e o banco de dados

      toast.success('Status do plantão atualizado!');
      
      // Debug para verificar se o estado foi atualizado
      if (import.meta.env.DEV) {
        console.log('Status atualizado:', {
          plantaoId,
          novoStatus: updateData.status_plantao,
          statusPagamento: updateData.status_pagamento
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar plantão:', error);
      toast.error('Erro ao atualizar status do plantão');
    } finally {
      setLoading(false);
    }
  };

  // Função para cancelar todos os plantões futuros de uma escala fixa (dia/horário específico)
  const cancelarPlantaoFixoFuturo = async (escalaFixaId: string, localId: string, diaSemana: number, observacoes?: string) => {
    try {
      setLoading(true);
      
      const hoje = new Date();
      const dataAtual = hoje.toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Buscar todos os plantões fixos futuros desta escala
      const { data: plantoesFuturos, error } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select('*')
        .eq('escala_fixa_id', escalaFixaId)
        .eq('local_id', localId)
        .gte('data', dataAtual)
        .order('data');

      if (error) throw error;

      if (!plantoesFuturos || plantoesFuturos.length === 0) {
        toast.info('Não há plantões futuros para cancelar');
        return;
      }

      // Separar plantões para manter histórico (mês atual e anteriores) e excluir (próximos meses)
      const plantoesParaManter = plantoesFuturos.filter(p => {
        const dataPlantao = new Date(p.data);
        const mesPlantao = dataPlantao.getMonth();
        const anoPlantao = dataPlantao.getFullYear();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        // Manter plantões do mês atual e meses anteriores
        return (anoPlantao < anoAtual) || (anoPlantao === anoAtual && mesPlantao <= mesAtual);
      });

      const plantoesParaExcluir = plantoesFuturos.filter(p => {
        const dataPlantao = new Date(p.data);
        const mesPlantao = dataPlantao.getMonth();
        const anoPlantao = dataPlantao.getFullYear();
        const mesAtual = hoje.getMonth();
        const anoAtual = hoje.getFullYear();
        // Excluir plantões dos próximos meses
        return (anoPlantao > anoAtual) || (anoPlantao === anoAtual && mesPlantao > mesAtual);
      });

      // Cancelar plantões para manter histórico (mês atual e anteriores)
      if (plantoesParaManter.length > 0) {
        const { error: updateError } = await supabase
          .from('plantonista_plantao_fixo_realizado')
          .update({
            cancelado: true,
            status_pagamento: 'cancelado',
            justificativa_passagem: observacoes || 'Cancelado em lote - escala fixa removida'
          })
          .in('id', plantoesParaManter.map(p => p.id));

        if (updateError) throw updateError;
      }

      // Excluir plantões dos próximos meses (limpar relatório)
      if (plantoesParaExcluir.length > 0) {
        const { error: deleteError } = await supabase
          .from('plantonista_plantao_fixo_realizado')
          .delete()
          .in('id', plantoesParaExcluir.map(p => p.id));

        if (deleteError) throw deleteError;
      }

      // Atualizar o estado local
      setPlantoes(prev => prev.filter(p => 
        !(p.escala_fixa_id === escalaFixaId && 
          p.local_id === localId && 
          p.data >= dataAtual &&
          new Date(p.data).getMonth() > hoje.getMonth())
      ).map(p => 
        p.escala_fixa_id === escalaFixaId && 
        p.local_id === localId && 
        p.data >= dataAtual &&
        new Date(p.data).getMonth() <= hoje.getMonth()
          ? { 
              ...p, 
              status: 'cancelado' as any,
              observacoes: observacoes || 'Cancelado em lote - escala fixa removida'
            }
          : p
      ));

      const mensagem = [];
      if (plantoesParaManter.length > 0) {
        mensagem.push(`${plantoesParaManter.length} plantões mantidos no histórico`);
      }
      if (plantoesParaExcluir.length > 0) {
        mensagem.push(`${plantoesParaExcluir.length} plantões futuros excluídos`);
      }
      
      toast.success(mensagem.join(' e ') + ' com sucesso!');
    } catch (error) {
      console.error('Erro ao cancelar plantões fixos futuros:', error);
      toast.error('Erro ao cancelar plantões fixos');
    } finally {
      setLoading(false);
    }
  };

  const carregarPlantoesPeriodo = async (inicio: string, fim: string) => {
    try {
      // Primeiro, carregar escalas para ter os horários
      const { data: escalasData, error: errorEscalas } = await supabase
        .from('plantonista_escala_fixa')
        .select(`
          *,
          plantonista_locais_trabalho(id, nome)
        `);

      if (errorEscalas) throw errorEscalas;

      // Criar mapa de escalas por local_id para facilitar acesso
      const escalasPorLocal = new Map();
      escalasData?.forEach((escala: any) => {
        escalasPorLocal.set(escala.local_id, {
          horario_inicio: escala.horario_inicio,
          horario_fim: escala.horario_fim,
          dia_semana: escala.dia_semana
        });
      });

      // Plantões fixos realizados
      const { data: fixos, error: errorFixos } = await supabase
        .from('plantonista_plantao_fixo_realizado')
        .select(`
          *,
          plantonista_locais_trabalho(id, nome),
          plantonista_escala_fixa(id, horario_inicio, horario_fim)
        `)
        .gte('data', inicio)
        .lt('data', fim)
        .order('data');

      if (errorFixos) throw errorFixos;

      const fixosFormatados = fixos?.map((item: any) => {
        // Determinar horários baseado na escala ou local
        let horario_inicio, horario_fim;
        
        if (item.plantonista_escala_fixa) {
          horario_inicio = item.plantonista_escala_fixa.horario_inicio;
          horario_fim = item.plantonista_escala_fixa.horario_fim;
        } else if (item.local_id && escalasPorLocal.has(item.local_id)) {
          const escala = escalasPorLocal.get(item.local_id);
          horario_inicio = escala.horario_inicio;
          horario_fim = escala.horario_fim;
        }

        return {
          id: item.id,
          data: item.data,
          local: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
          valor: item.valor || 0,
          status: (() => {
            if (item.cancelado === true || item.status_pagamento === 'cancelado') {
              return 'cancelado';
            }
            if (item.foi_passado === true) {
              return 'passou';
            }
            if (item.status_pagamento === 'pago') return 'realizado';
            if (item.status_pagamento === 'faltou') return 'faltou';
            return 'pendente';
          })() as 'realizado' | 'faltou' | 'passou' | 'pendente' | 'cancelado',
          observacoes: item.justificativa_passagem || '',
          substituto: item.substituto_nome || '',
          tipo: 'fixo' as const,
          escala_fixa_id: item.escala_fixa_id as string | undefined,
          local_id: (item.plantonista_locais_trabalho as any)?.id as string | undefined,
          horario_inicio,
          horario_fim
        };
      }) || [];

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

      const coringasFormatados: PlantaoFixo[] = (coringas || []).map((item: any) => {
        return {
          id: item.id,
          data: item.data,
          local: (item.plantonista_locais_trabalho as any)?.nome || 'Local não encontrado',
          valor: Number(item.valor) || 0,
          // Novos campos obrigatórios
          status_plantao: (() => {
            if (item.status_plantao) return item.status_plantao;
            if (item.cancelado === true || item.status_pagamento === 'cancelado') return 'cancelado';
            if (item.foi_passado === true) return 'transferido';
            if (item.status_pagamento === 'faltou') return 'faltou';
            if (item.status_pagamento === 'realizado' || item.status_pagamento === 'pago') return 'realizado';
            return 'agendado';
          })() as any,
          status_pagamento: (item.status_pagamento === 'pago' ? 'pago' : 'pendente') as any,
          // Campo antigo para compatibilidade
          status: (() => {
            if (item.cancelado === true || item.status_pagamento === 'cancelado') {
              return 'cancelado';
            }
            if (item.foi_passado === true) {
              return 'passou';
            }
            if (item.status_pagamento === 'pago') return 'realizado';
            if (item.status_pagamento === 'faltou') return 'faltou';
            return 'pendente';
          })() as 'realizado' | 'faltou' | 'passou' | 'pendente' | 'cancelado',
          observacoes: item.observacoes || '',
          substituto: item.substituto || '',
          substituto_nome: item.substituto_nome,
          foi_passado: item.foi_passado,
          tipo: 'coringa' as const,
          horario_inicio: item.horario_inicio || undefined,
          horario_fim: item.horario_fim || undefined,
          local_id: (item.plantonista_locais_trabalho as any)?.id as string | undefined
        };
      });

      return [...fixosFormatados, ...coringasFormatados];
    } catch (error) {
      console.error('Erro ao carregar plantões do período:', error);
      toast.error('Erro ao carregar plantões do período');
      return [];
    }
  };

  const criarNovoPlantao = async (dados: {
    tipo: 'fixo' | 'coringa';
    local_id: string;
    data?: string;
    dia_semana?: number;
    horario_inicio: string;
    horario_fim: string;
    valor: number;
    dia_pagamento?: number;
  }) => {
    try {
      setLoading(true);
      
      if (dados.tipo === 'fixo') {
        // Criar escala fixa
        const { data: escala, error: errorEscala } = await supabase
          .from('plantonista_escala_fixa')
          .insert({
            local_id: dados.local_id,
            medico_id: '', // Será preenchido pelo RLS
            dia_semana: dados.dia_semana || 1,
            horario_inicio: dados.horario_inicio,
            horario_fim: dados.horario_fim,
            valor_mensal: dados.valor,
            data_pagamento: dados.dia_pagamento || 5,
            carga_horaria: 0
          })
          .select()
          .single();

        if (errorEscala) throw errorEscala;
        
        console.log('[CRIAR NOVO PLANTÃO] Escala fixa criada com sucesso:', escala);
        console.log('[CRIAR NOVO PLANTÃO] Profile ID:', profile?.id);
        
        // Após criar a escala fixa, gerar os plantões automaticamente para os próximos 6 meses
        const hoje = new Date();
        const anoAtual = hoje.getFullYear();
        const mesAtual = hoje.getMonth() + 1;
        
        console.log('[CRIAR NOVO PLANTÃO] Iniciando geração de plantões para os próximos 6 meses...');
        
        // Gerar plantões para os próximos 6 meses (apenas futuros)
        for (let i = 0; i < 6; i++) {
          const dataFutura = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
          const anoFuturo = dataFutura.getFullYear();
          const mesFuturo = dataFutura.getMonth() + 1;
          
          // Pular meses que já passaram
          if (dataFutura < new Date(hoje.getFullYear(), hoje.getMonth(), 1)) {
            console.log(`[CRIAR NOVO PLANTÃO] Pulando mês passado ${mesFuturo}/${anoFuturo}...`);
            continue;
          }
          
          console.log(`[CRIAR NOVO PLANTÃO] Gerando plantões para ${mesFuturo}/${anoFuturo}...`);
          
          // Chamar a função generate_monthly_shifts para gerar os plantões
          const { error: errorGeracao } = await supabase.rpc('generate_monthly_shifts', {
            p_user_id: profile?.id || '',
            p_ano: anoFuturo,
            p_mes: mesFuturo
          });

          if (errorGeracao) {
            console.error(`[CRIAR NOVO PLANTÃO] Erro ao gerar plantões para ${mesFuturo}/${anoFuturo}:`, errorGeracao);
            // Não falhar completamente, apenas logar o erro
          } else {
            console.log(`[CRIAR NOVO PLANTÃO] Plantões gerados com sucesso para ${mesFuturo}/${anoFuturo}`);
          }
        }
        
        toast.success('Escala fixa criada com sucesso!');
        await carregarEscalas();
        await carregarPlantoes(mesAtual, anoAtual);
      } else {
        // Criar plantão coringa
        const { data: plantao, error: errorPlantao } = await supabase
          .from('plantonista_plantao_coringa')
          .insert({
            local_id: dados.local_id,
            medico_id: '', // Será preenchido pelo RLS
            data: dados.data,
            horario_inicio: dados.horario_inicio,
            horario_fim: dados.horario_fim,
            valor: dados.valor,
            status_pagamento: 'pendente',
            data_pagamento_prevista: dados.data || new Date().toISOString().split('T')[0]
          })
          .select()
          .single();

        if (errorPlantao) throw errorPlantao;
        
        toast.success('Plantão coringa criado com sucesso!');
        await carregarPlantoes(new Date().getMonth() + 1, new Date().getFullYear());
      }
    } catch (error) {
      console.error('Erro ao criar plantão:', error);
      toast.error('Erro ao criar plantão');
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
    void gerarPlantoesParaEscalasExistentes(); // Adicionado para gerar plantões para escalas existentes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Função específica para marcar como pago (apenas altera status_pagamento)
  const marcarComoPago = async (plantaoId: string) => {
    try {
      setLoading(true);
      
      const plantao = plantoes.find(p => p.id === plantaoId);
      const isFixo = plantao?.tipo === 'fixo';
      const tableName = isFixo ? 'plantonista_plantao_fixo_realizado' : 'plantonista_plantao_coringa';
      
      const { error } = await supabase
        .from(tableName)
        .update({ 
          status_pagamento: 'pago',
          data_pagamento_efetiva: new Date().toISOString().split('T')[0]
        })
        .eq('id', plantaoId);

      if (error) throw error;

      // Nota: O estado local será atualizado pelo re-fetch no componente

      toast.success('Plantão marcado como pago!');
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      toast.error('Erro ao marcar plantão como pago');
      throw error;
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
    gerarPlantoesMultiplosMeses,
    gerarPlantoesParaEscalasExistentes,
    atualizarStatusPlantao,
    marcarComoPago,
    cancelarPlantaoFixoFuturo,
    carregarPlantoesPeriodo,
    criarNovoPlantao
  };
};
