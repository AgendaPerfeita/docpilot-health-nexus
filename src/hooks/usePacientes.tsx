import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Paciente {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  data_nascimento?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  convenio?: string;
  numero_convenio?: string;
  responsavel_id: string;
  created_at: string;
  updated_at: string;
}

export const usePacientes = () => {
  const { profile } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPacientes = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .order('nome');

      if (error) throw error;
      setPacientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarPaciente = async (pacienteData: Omit<Paciente, 'id' | 'created_at' | 'updated_at' | 'responsavel_id'>) => {
    if (!profile) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('pacientes')
      .insert({
        ...pacienteData,
        responsavel_id: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    await fetchPacientes();
    return data;
  };

  const atualizarPaciente = async (id: string, pacienteData: Partial<Paciente>) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(pacienteData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchPacientes();
    return data;
  };

  const deletarPaciente = async (id: string) => {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    await fetchPacientes();
  };

  const buscarPacientes = async (termo: string) => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .or(`nome.ilike.%${termo}%,cpf.ilike.%${termo}%,email.ilike.%${termo}%`)
      .order('nome');

    if (error) throw error;
    return data || [];
  };

  useEffect(() => {
    if (profile) {
      fetchPacientes();
    }
  }, [profile]);

  return {
    pacientes,
    loading,
    criarPaciente,
    atualizarPaciente,
    deletarPaciente,
    buscarPacientes,
    refetch: fetchPacientes
  };
};