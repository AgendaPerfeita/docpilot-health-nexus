
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CatalogoExame {
  id: string;
  nome: string;
  codigo_tuss?: string;
  codigo_amb?: string;
  categoria: 'Laboratorial' | 'Imagem' | 'Funcional' | 'Procedimento';
  subcategoria?: string;
  descricao?: string;
  valor_referencia?: number;
}

export interface SolicitacaoExame {
  id: string;
  prontuario_id?: string;
  medico_id: string;
  paciente_id: string;
  exames: any[];
  indicacao_clinica?: string;
  convenio?: string;
  urgente: boolean;
  status: 'solicitado' | 'coletado' | 'resultado_disponivel' | 'analisado';
  data_solicitacao: string;
  data_resultado?: string;
  observacoes?: string;
  created_at: string;
}

export const useExames = () => {
  const { profile } = useAuth();
  const [catalogoExames, setCatalogoExames] = useState<CatalogoExame[]>([]);
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoExame[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCatalogoExames = async (searchTerm: string = '') => {
    setLoading(true);
    try {
      let query = supabase
        .from('catalogo_exames')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,codigo_tuss.ilike.%${searchTerm}%,codigo_amb.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Type assertion para garantir compatibilidade
      setCatalogoExames((data || []) as CatalogoExame[]);
    } catch (error) {
      console.error('Erro ao buscar catálogo de exames:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSolicitacoes = async (pacienteId?: string) => {
    if (!profile) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('solicitacoes_exames')
        .select('*')
        .eq('medico_id', profile.id)
        .order('data_solicitacao', { ascending: false });

      // Políticas RLS já controlam o acesso baseado no perfil

      if (pacienteId) {
        query = query.eq('paciente_id', pacienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transformar os dados para garantir compatibilidade de tipos
      const transformedData = (data || []).map(item => ({
        ...item,
        exames: Array.isArray(item.exames) ? item.exames : [],
        urgente: Boolean(item.urgente)
      })) as SolicitacaoExame[];
      
      setSolicitacoes(transformedData);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarSolicitacao = async (solicitacaoData: Omit<SolicitacaoExame, 'id' | 'created_at' | 'medico_id' | 'data_solicitacao'>) => {
    if (!profile) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('solicitacoes_exames')
      .insert({
        ...solicitacaoData,
        medico_id: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    await fetchSolicitacoes();
    return data;
  };

  const atualizarSolicitacao = async (id: string, updates: Partial<SolicitacaoExame>) => {
    const { data, error } = await supabase
      .from('solicitacoes_exames')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchSolicitacoes();
    return data;
  };

  useEffect(() => {
    if (profile) {
      fetchCatalogoExames();
      fetchSolicitacoes();
    }
  }, [profile]);

  return {
    catalogoExames,
    solicitacoes,
    loading,
    fetchCatalogoExames,
    fetchSolicitacoes,
    criarSolicitacao,
    atualizarSolicitacao
  };
};
