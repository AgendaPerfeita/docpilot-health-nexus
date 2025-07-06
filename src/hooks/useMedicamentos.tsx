import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Medicamento {
  id: string;
  nome: string;
  principio_ativo?: string;
  categoria?: string;
  dosagens_comuns?: string[];
  frequencias_comuns?: string[];
  observacoes?: string;
  interacoes?: string[];
  ativo: boolean;
  created_at: string;
}

export const useMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedicamentos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medicamentos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setMedicamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const buscarMedicamentos = async (termo: string) => {
    const { data, error } = await supabase
      .from('medicamentos')
      .select('*')
      .ilike('nome', `%${termo}%`)
      .eq('ativo', true)
      .order('nome')
      .limit(10);

    if (error) throw error;
    return data || [];
  };

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  return {
    medicamentos,
    loading,
    buscarMedicamentos,
    refetch: fetchMedicamentos
  };
};