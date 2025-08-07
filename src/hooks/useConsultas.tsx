import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Consulta {
  id: string;
  paciente_id: string;
  medico_id: string;
  clinica_id?: string;
  data_consulta: string;
  duracao_minutos: number;
  status: 'agendada' | 'confirmada' | 'em_andamento' | 'concluida' | 'cancelada';
  tipo_consulta: 'consulta' | 'retorno' | 'emergencia';
  valor?: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  paciente?: {
    nome: string;
    telefone?: string;
    convenio?: string;
  };
  medico?: {
    nome: string;
    especialidade?: string;
  };
}

export const useConsultas = () => {
  const { profile } = useAuth();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConsultas = useCallback(async (data?: string) => {
    if (!profile) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('consultas')
        .select(`
          *,
          paciente:pacientes(nome, telefone, convenio),
          medico:profiles!consultas_medico_id_fkey(nome, especialidade)
        `)
        .order('data_consulta', { ascending: true });

      // Se for staff, filtrar por clinica_id
      if (profile.tipo === 'staff' && profile.clinica_id) {
        query = query.eq('clinica_id', profile.clinica_id);
      }

      if (data) {
        const startDate = new Date(data);
        const endDate = new Date(data);
        endDate.setDate(endDate.getDate() + 1);
        
        query = query
          .gte('data_consulta', startDate.toISOString())
          .lt('data_consulta', endDate.toISOString());
      }

      const { data: consultasData, error } = await query;
      if (error) throw error;
      
      setConsultas((consultasData as Consulta[]) || []);
    } catch (error) {
      console.error('Erro ao buscar consultas:', error);
    } finally {
      setLoading(false);
    }
  }, [profile]);

  const criarConsulta = async (consultaData: Omit<Consulta, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('consultas')
      .insert(consultaData)
      .select(`
        *,
        paciente:pacientes(nome, telefone, convenio),
        medico:profiles!consultas_medico_id_fkey(nome, especialidade)
      `)
      .single();

    if (error) throw error;
    await fetchConsultas();
    return data;
  };

  const atualizarConsulta = async (id: string, consultaData: Partial<Consulta>) => {
    const { data, error } = await supabase
      .from('consultas')
      .update(consultaData)
      .eq('id', id)
      .select(`
        *,
        paciente:pacientes(nome, telefone, convenio),
        medico:profiles!consultas_medico_id_fkey(nome, especialidade)
      `)
      .single();

    if (error) throw error;
    await fetchConsultas();
    return data;
  };

  const deletarConsulta = async (id: string) => {
    const { error } = await supabase
      .from('consultas')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchConsultas();
  };

  const getConsultasHoje = useCallback(() => {
    const hoje = new Date().toISOString().split('T')[0];
    return consultas.filter(consulta => 
      consulta.data_consulta.startsWith(hoje)
    );
  }, [consultas]);

  const getConsultasPorStatus = useCallback((status: Consulta['status']) => {
    return consultas.filter(consulta => consulta.status === status);
  }, [consultas]);

  useEffect(() => {
    if (profile) {
      fetchConsultas();
    }
  }, [profile?.id, fetchConsultas]); // Fix: Add fetchConsultas dependency

  return {
    consultas,
    loading,
    criarConsulta,
    atualizarConsulta,
    deletarConsulta,
    getConsultasHoje,
    getConsultasPorStatus,
    refetch: fetchConsultas
  };
};