import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
// Define types locally since they may not exist in the generated types
interface PlantonistaSessao {
  id: string;
  medico_id: string;
  local_trabalho: string;
  turno: string;
  data_inicio: string;
  data_fim?: string;
  status: string;
  created_at: string;
}

interface PlantonistaAtendimento {
  id: string;
  sessao_id: string;
  medico_id: string;
  paciente_nome?: string;
  paciente_idade?: number;
  paciente_sexo?: string;
  queixa_principal?: string;
  anamnese?: any;
  exame_fisico?: any;
  sinais_vitais?: any;
  resultados_exames?: any;
  conduta_inicial?: any;
  diagnostico_final?: string;
  conduta_final?: string;
  evolucao?: string;
  status?: string;
  reavaliacao_agendada?: string;
  created_at: string;
  updated_at: string;
}

interface InsertPlantonistaSessao {
  medico_id: string;
  local_trabalho: string;
  turno: string;
  data_inicio?: string;
  status?: string;
}

interface InsertPlantonistaAtendimento {
  sessao_id: string;
  medico_id: string;
  paciente_nome?: string;
  paciente_idade?: number;
  paciente_sexo?: string;
  queixa_principal?: string;
  anamnese?: any;
  exame_fisico?: any;
  sinais_vitais?: any;
  resultados_exames?: any;
  conduta_inicial?: any;
  diagnostico_final?: string;
  conduta_final?: string;
  evolucao?: string;
  status?: string;
  reavaliacao_agendada?: string;
}

const PlantonistaContext = createContext<any>(null);

export const PlantonistaProvider = ({ children }: { children: React.ReactNode }) => {
  const [sessoes, setSessoes] = useState<PlantonistaSessao[]>([]);
  const [atendimentos, setAtendimentos] = useState<PlantonistaAtendimento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar sessões do médico
  const buscarSessoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .select('*')
        .order('data_inicio', { ascending: false });
      if (error) throw error;
      setSessoes(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessões');
    } finally {
      setLoading(false);
    }
  };

  // Buscar atendimentos de uma sessão
  const buscarAtendimentos = async (sessaoId: string) => {
    try {
      setLoading(true);
      console.log('DEBUG buscarAtendimentos - sessaoId:', sessaoId);
      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .select('*')
        .eq('sessao_id', sessaoId)
        .order('created_at', { ascending: false });
      console.log('DEBUG buscarAtendimentos - data:', data, 'error:', error);
      if (error) throw error;
      setAtendimentos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar atendimentos');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova sessão
  const criarSessao = async (dados: InsertPlantonistaSessao) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .insert([dados])
        .select()
        .single();
      if (error) throw error;
      setSessoes(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar sessão');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar sessão
  const finalizarSessao = async (sessaoId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('plantonista_sessoes')
        .update({ 
          status: 'finalizada',
          data_fim: new Date().toISOString()
        })
        .eq('id', sessaoId);
      if (error) throw error;
      setSessoes(prev => 
        prev.map(s => 
          s.id === sessaoId 
            ? { ...s, status: 'finalizada', data_fim: new Date().toISOString() }
            : s
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao finalizar sessão');
    } finally {
      setLoading(false);
    }
  };

  // Criar novo atendimento
  const criarAtendimento = async (dados: InsertPlantonistaAtendimento) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .insert([dados])
        .select(); // Removido .single() para garantir retorno de array
      console.log('DEBUG criarAtendimento - data retornado do insert:', data);
      if (error) {
        console.error('Supabase error:', error);
        if (error.message) console.error('Supabase error.message:', error.message);
        if (error.details) console.error('Supabase error.details:', error.details);
        if (error.hint) console.error('Supabase error.hint:', error.hint);
        throw error;
      }
      if (data && data.length > 0) {
        setAtendimentos(prev => [data[0], ...prev]);
        return data[0];
      }
      return null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar atendimento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar atendimento (reavaliação)
  const atualizarAtendimento = async (atendimentoId: string, dados: Partial<PlantonistaAtendimento>) => {
    try {
      setLoading(true);
      // Garantir que exame_fisico, anamnese, conduta_inicial sejam objetos se enviados
      const updateData = { ...dados };
      if (typeof updateData.exame_fisico === 'string') {
        updateData.exame_fisico = { texto: updateData.exame_fisico };
      }
      if (typeof updateData.anamnese === 'string') {
        updateData.anamnese = { texto: updateData.anamnese };
      }
      if (typeof updateData.conduta_inicial === 'string') {
        updateData.conduta_inicial = { texto: updateData.conduta_inicial };
      }
      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .update(updateData)
        .eq('id', atendimentoId)
        .select()
        .single();
      if (error) throw error;
      setAtendimentos(prev =>
        prev.map(a => a.id === atendimentoId ? data : a)
      );
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar atendimento');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Buscar sessão ativa
  const buscarSessaoAtiva = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .select('*')
        .eq('status', 'ativa')
        .order('data_inicio', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data || null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessão ativa');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Buscar reavaliações pendentes
  const buscarReavaliacoesPendentes = async (sessaoId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .select('*')
        .eq('sessao_id', sessaoId)
        .not('reavaliacao_agendada', 'is', null)
        .eq('status', 'primeiro_atendimento')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar reavaliações');
      return;
    } finally {
      setLoading(false);
    }
  };

  // Buscar plantões do mês atual do médico logado
  const buscarPlantoesMes = async (medicoId: string) => {
    try {
      setLoading(true);
      
      // Data atual (hoje)
      const hoje = new Date();
      const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
      
      // Formatar datas para o formato do Supabase
      // Buscar apenas a partir de HOJE, não do início do mês
      const dataInicio = hoje.toISOString().split('T')[0];
      const dataFim = ultimoDiaMes.toISOString().split('T')[0];
      
             // Buscar plantões fixos do mês
       const { data: plantoesFixos, error: errorFixos } = await supabase
         .from('plantonista_plantao_fixo_realizado')
         .select(`
           id,
           data,
           valor,
           status_plantao,
           escala_fixa_id
         `)
         .gte('data', dataInicio)
         .lte('data', dataFim)
         .order('data', { ascending: true });
       
       if (errorFixos) throw errorFixos;
       
       // Buscar escalas fixas do médico
       const { data: escalasFixas, error: errorEscalas } = await supabase
         .from('plantonista_escala_fixa')
         .select('*')
         .eq('medico_id', medicoId);
       
              if (errorEscalas) throw errorEscalas;
      
      // Buscar plantões coringa do mês
      const { data: plantoesCoringa, error: errorCoringa } = await supabase
        .from('plantonista_plantao_coringa')
        .select('*')
        .eq('medico_id', medicoId)
        .gte('data', dataInicio)
        .lte('data', dataFim)
        .order('data', { ascending: true });
      
      if (errorCoringa) throw errorCoringa;
      
             // Combinar e formatar os dados
       const plantoesCombinados = [
         ...(plantoesFixos || []).map(plantao => {
           // Encontrar a escala fixa correspondente
           const escala = escalasFixas?.find(e => e.id === plantao.escala_fixa_id);
           return {
             id: plantao.id,
             tipo: 'fixo',
             data: plantao.data,
             horario: escala ? `${escala.horario_inicio.toString().slice(0, 5)} - ${escala.horario_fim.toString().slice(0, 5)}` : '00:00 - 00:00',
             valor: plantao.valor,
             status: plantao.status_plantao || 'agendado'
           };
         }),
                 ...(plantoesCoringa || []).map(plantao => ({
           id: plantao.id,
           tipo: 'coringa',
           data: plantao.data,
           horario: `${plantao.horario_inicio.toString().slice(0, 5)} - ${plantao.horario_fim.toString().slice(0, 5)}`,
           valor: plantao.valor,
           status: plantao.status_plantao || 'agendado'
         }))
      ];
      
      // Ordenar por data
      return plantoesCombinados.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar plantões');
      return [];
    } finally {
      setLoading(false);
    }
  };

  return (
    <PlantonistaContext.Provider value={{
      sessoes,
      atendimentos,
      loading,
      error,
      buscarSessoes,
      buscarAtendimentos,
      criarSessao,
      finalizarSessao,
      criarAtendimento,
      atualizarAtendimento,
      buscarSessaoAtiva,
      buscarReavaliacoesPendentes,
      buscarPlantoesMes,
      limparErro: () => setError(null)
    }}>
      {children}
    </PlantonistaContext.Provider>
  );
};

export const usePlantonista = () => {
  const context = useContext(PlantonistaContext);
  if (!context) throw new Error('usePlantonista must be used within a PlantonistaProvider');
  return context;
}; 