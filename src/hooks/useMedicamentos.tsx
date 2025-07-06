
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Medicamento {
  id: string;
  nome: string;
  principio_ativo?: string;
  categoria?: string;
  dosagens_comuns?: string[];
  frequencias_comuns?: string[];
  interacoes?: string[];
  observacoes?: string;
}

export const useMedicamentos = () => {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedicamentos = async (searchTerm: string = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('medicamentos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,principio_ativo.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setMedicamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicamentos();
  }, []);

  return {
    medicamentos,
    loading,
    fetchMedicamentos
  };
};
