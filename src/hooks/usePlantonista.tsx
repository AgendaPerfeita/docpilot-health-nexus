import React, { createContext, useContext, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Tables, TablesInsert } from '@/integrations/supabase/types';

type PlantonistaSessao = Tables<'plantonista_sessoes'>;
type PlantonistaAtendimento = Tables<'plantonista_atendimentos'>;
type InsertPlantonistaSessao = TablesInsert<'plantonista_sessoes'>;
type InsertPlantonistaAtendimento = TablesInsert<'plantonista_atendimentos'>;

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .select('*')
        .eq('medico_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessoes(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar atendimentos
  const buscarAtendimentos = async (sessaoId?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = supabase
        .from('plantonista_atendimentos')
        .select('*')
        .eq('medico_id', user.id)
        .order('created_at', { ascending: false });

      if (sessaoId) {
        query = query.eq('sessao_id', sessaoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setAtendimentos(data || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Criar nova sessão
  const criarSessao = async (dados: InsertPlantonistaSessao) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .insert({
          ...dados,
          medico_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setSessoes(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Finalizar sessão
  const finalizarSessao = async (sessaoId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .update({
          status: 'finalizada',
          data_fim: new Date().toISOString()
        })
        .eq('id', sessaoId)
        .select()
        .single();

      if (error) throw error;
      setSessoes(prev => prev.map(s => s.id === sessaoId ? data : s));
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Criar novo atendimento
  const criarAtendimento = async (dados: InsertPlantonistaAtendimento) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .insert({
          ...dados,
          medico_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      setAtendimentos(prev => [data, ...prev]);
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Atualizar atendimento
  const atualizarAtendimento = async (atendimentoId: string, dados: Partial<PlantonistaAtendimento>) => {
    try {
      setLoading(true);
      
      // Garantir que campos JSON sejam tratados corretamente
      const updateData = { ...dados };
      if (typeof updateData.exame_fisico_estruturado === 'string') {
        updateData.exame_fisico_estruturado = updateData.exame_fisico_estruturado;
      }
      
      if (typeof updateData.anamnese === 'object' && updateData.anamnese !== null) {
        updateData.anamnese = updateData.anamnese;
      }
      
      if (typeof updateData.conduta_inicial === 'object' && updateData.conduta_inicial !== null) {
        updateData.conduta_inicial = updateData.conduta_inicial;
      }
      
      if (typeof updateData.sinais_vitais === 'object' && updateData.sinais_vitais !== null) {
        updateData.sinais_vitais = updateData.sinais_vitais;
      }
      
      if (typeof updateData.resultados_exames === 'object' && updateData.resultados_exames !== null) {
        updateData.resultados_exames = updateData.resultados_exames;
      }

      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .update(updateData)
        .eq('id', atendimentoId)
        .select()
        .single();

      if (error) throw error;
      setAtendimentos(prev => prev.map(a => a.id === atendimentoId ? data : a));
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar sessão ativa
  const buscarSessaoAtiva = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('plantonista_sessoes')
        .select('*')
        .eq('medico_id', user.id)
        .eq('status', 'ativa')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      setError(error.message);
      return null;
    }
  };

  // Buscar atendimento ativo
  const buscarAtendimentoAtivo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('plantonista_atendimentos')
        .select('*')
        .eq('medico_id', user.id)
        .in('status', ['primeiro_atendimento', 'em_acompanhamento'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error: any) {
      setError(error.message);
      return null;
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
      buscarAtendimentoAtivo,
      setError
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