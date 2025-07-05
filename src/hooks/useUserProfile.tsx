import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ClinicaMedico {
  id: string;
  clinica_id: string;
  medico_id: string;
  ativo: boolean;
  clinica?: {
    nome: string;
    email: string;
  };
  medico?: {
    nome: string;
    especialidade: string;
    crm: string;
  };
}

export const useUserProfile = () => {
  const { profile } = useAuth();
  const [clinicaMedicos, setClinicaMedicos] = useState<ClinicaMedico[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchClinicaMedicos = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('clinica_medicos')
        .select(`
          *,
          clinica:profiles!clinica_medicos_clinica_id_fkey(nome, email),
          medico:profiles!clinica_medicos_medico_id_fkey(nome, especialidade, crm)
        `)
        .eq('ativo', true);

      if (profile.tipo === 'clinica') {
        query = query.eq('clinica_id', profile.id);
      } else if (profile.tipo === 'medico') {
        query = query.eq('medico_id', profile.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setClinicaMedicos(data || []);
    } catch (error) {
      console.error('Erro ao buscar clínica-médicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const vincularMedico = async (medicoId: string) => {
    if (profile?.tipo !== 'clinica') {
      throw new Error('Apenas clínicas podem vincular médicos');
    }

    const { error } = await supabase
      .from('clinica_medicos')
      .insert({
        clinica_id: profile.id,
        medico_id: medicoId,
        ativo: true
      });

    if (error) throw error;
    await fetchClinicaMedicos();
  };

  const desvincularMedico = async (vinculoId: string) => {
    const { error } = await supabase
      .from('clinica_medicos')
      .update({ ativo: false })
      .eq('id', vinculoId);

    if (error) throw error;
    await fetchClinicaMedicos();
  };

  const buscarMedicos = async (termo: string = '') => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, especialidade, crm, email')
      .eq('tipo', 'medico')
      .eq('ativo', true)
      .ilike('nome', `%${termo}%`);

    if (error) throw error;
    return data || [];
  };

  useEffect(() => {
    if (profile) {
      fetchClinicaMedicos();
    }
  }, [profile]);

  return {
    profile,
    clinicaMedicos,
    loading,
    vincularMedico,
    desvincularMedico,
    buscarMedicos,
    refetch: fetchClinicaMedicos
  };
};