import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useActiveClinica } from './useActiveClinica';
import { supabase } from '@/integrations/supabase/client';

export interface MedicoPermissions {
  plano: 'free' | 'premium';
  permiteAtendimentoIndividual: boolean;
  permiteIA: boolean;
  permiteRelatoriosAvancados: boolean;
}

export const useMedicoPermissions = () => {
  const { profile } = useAuth();
  const { activeClinica } = useActiveClinica();
  const [permissions, setPermissions] = useState<MedicoPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    if (!profile || profile.tipo !== 'medico') {
      setPermissions(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plano_medico, permite_atendimento_individual, permite_ia, permite_relatorios_avancados')
        .eq('id', profile.id)
        .single();

      if (error) throw error;

      // Se médico está vinculado a uma clínica, usa permissões expandidas
      const isVinculadoClinica = !!activeClinica;
      
      setPermissions({
        plano: data.plano_medico as 'free' | 'premium',
        permiteAtendimentoIndividual: data.permite_atendimento_individual,
        // Médicos vinculados a clínicas sempre têm acesso à IA
        permiteIA: data.permite_ia || isVinculadoClinica,
        permiteRelatoriosAvancados: data.permite_relatorios_avancados
      });
    } catch (error) {
      console.error('Erro ao buscar permissões do médico:', error);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const updatePlano = async (novoPlano: 'free' | 'premium') => {
    if (!profile || profile.tipo !== 'medico') return;

    const updates = {
      plano_medico: novoPlano,
      permite_atendimento_individual: novoPlano === 'premium',
      permite_ia: novoPlano === 'premium',
      permite_relatorios_avancados: novoPlano === 'premium'
    };

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);

      if (error) throw error;
      await fetchPermissions();
    } catch (error) {
      console.error('Erro ao atualizar plano do médico:', error);
      throw error;
    }
  };

  const temPermissao = (permissao: keyof MedicoPermissions) => {
    if (!permissions) return false;
    return permissions[permissao];
  };

  const isFree = () => permissions?.plano === 'free';
  const isPremium = () => permissions?.plano === 'premium';

  useEffect(() => {
    fetchPermissions();
  }, [profile, activeClinica]);

  return {
    permissions,
    loading,
    temPermissao,
    isFree,
    isPremium,
    updatePlano,
    refetch: fetchPermissions
  };
};