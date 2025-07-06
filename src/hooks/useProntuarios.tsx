import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Prontuario {
  id: string;
  paciente_id: string;
  consulta_id?: string;
  medico_id: string;
  data_atendimento: string;
  queixa_principal?: string;
  historia_doenca_atual?: string;
  exame_fisico?: string;
  hipotese_diagnostica?: string;
  conduta?: string;
  prescricao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  paciente?: {
    nome: string;
    data_nascimento?: string;
    convenio?: string;
  };
  prescricoes?: Prescricao[];
}

export interface Prescricao {
  id: string;
  prontuario_id: string;
  medicamento: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
  created_at: string;
}

export const useProntuarios = () => {
  const { profile } = useAuth();
  const [prontuarios, setProntuarios] = useState<Prontuario[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProntuarios = async (pacienteId?: string) => {
    if (!profile) return;
    
    console.log('useProntuarios - Fetching prontuarios for profile:', profile.id, 'pacienteId:', pacienteId);
    setLoading(true);
    try {
      // Verificar se o usuário está autenticado
      const { data: { user } } = await supabase.auth.getUser();
      console.log('useProntuarios - Current auth user:', user?.id);
      
      if (!user) {
        console.error('useProntuarios - No authenticated user found');
        setProntuarios([]);
        return;
      }

      let query = supabase
        .from('prontuarios')
        .select(`
          *,
          paciente:pacientes(nome, data_nascimento, convenio),
          prescricoes(*)
        `)
        .order('data_atendimento', { ascending: false });

      if (pacienteId) {
        query = query.eq('paciente_id', pacienteId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('useProntuarios - Database error:', error);
        throw error;
      }
      
      console.log('useProntuarios - Fetched prontuarios count:', data?.length || 0);
      console.log('useProntuarios - Fetched prontuarios:', data);
      setProntuarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar prontuários:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarProntuario = async (prontuarioData: Omit<Prontuario, 'id' | 'created_at' | 'updated_at' | 'medico_id'>) => {
    if (!profile) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('prontuarios')
      .insert({
        ...prontuarioData,
        medico_id: profile.id
      })
      .select(`
        *,
        paciente:pacientes(nome, data_nascimento, convenio)
      `)
      .single();

    if (error) throw error;
    await fetchProntuarios();
    return data;
  };

  const atualizarProntuario = async (id: string, prontuarioData: Partial<Prontuario>) => {
    const { data, error } = await supabase
      .from('prontuarios')
      .update(prontuarioData)
      .eq('id', id)
      .select(`
        *,
        paciente:pacientes(nome, data_nascimento, convenio)
      `)
      .single();

    if (error) throw error;
    await fetchProntuarios();
    return data;
  };

  const adicionarPrescricao = async (prontuarioId: string, prescricaoData: Omit<Prescricao, 'id' | 'prontuario_id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('prescricoes')
      .insert({
        ...prescricaoData,
        prontuario_id: prontuarioId
      })
      .select()
      .single();

    if (error) throw error;
    await fetchProntuarios();
    return data;
  };

  const removerPrescricao = async (prescricaoId: string) => {
    const { error } = await supabase
      .from('prescricoes')
      .delete()
      .eq('id', prescricaoId);

    if (error) throw error;
    await fetchProntuarios();
  };

  const buscarProntuarios = async (termo: string) => {
    const { data, error } = await supabase
      .from('prontuarios')
      .select(`
        *,
        paciente:pacientes(nome, data_nascimento, convenio)
      `)
      .or(`queixa_principal.ilike.%${termo}%,hipotese_diagnostica.ilike.%${termo}%`)
      .order('data_atendimento', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const buscarProntuarioPorId = async (id: string) => {
    console.log('useProntuarios - buscando prontuário por ID:', id);
    const { data, error } = await supabase
      .from('prontuarios')
      .select(`
        *,
        paciente:pacientes(nome, data_nascimento, convenio),
        prescricoes(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('useProntuarios - Erro ao buscar prontuário por ID:', error);
      throw error;
    }
    
    console.log('useProntuarios - Prontuário encontrado por ID:', data);
    return data;
  };

  useEffect(() => {
    if (profile) {
      fetchProntuarios();
    }
  }, [profile]);

  return {
    prontuarios,
    loading,
    criarProntuario,
    atualizarProntuario,
    adicionarPrescricao,
    removerPrescricao,
    buscarProntuarios,
    buscarProntuarioPorId,
    refetch: fetchProntuarios
  };
};