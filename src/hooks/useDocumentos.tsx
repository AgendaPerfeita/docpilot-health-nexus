
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DocumentoMedico {
  id: string;
  prontuario_id?: string;
  medico_id: string;
  paciente_id: string;
  tipo: 'atestado' | 'receita' | 'relatório' | 'declaração' | 'solicitação' | 'laudo';
  titulo: string;
  conteudo: string;
  template_usado?: string;
  numero_documento?: string;
  validade_ate?: string;
  assinado: boolean;
  hash_assinatura?: string;
  status: 'rascunho' | 'finalizado' | 'assinado' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export interface TemplateDocumento {
  id: string;
  nome: string;
  tipo: string;
  especialidade?: string;
  conteudo_template: string;
  variaveis?: any;
  ativo: boolean;
}

export const useDocumentos = () => {
  const { profile } = useAuth();
  const [documentos, setDocumentos] = useState<DocumentoMedico[]>([]);
  const [templates, setTemplates] = useState<TemplateDocumento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocumentos = async (pacienteId?: string) => {
    if (!profile) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('documentos_medicos')
        .select('*')
        .eq('medico_id', profile.id)
        .order('created_at', { ascending: false });

      if (pacienteId) {
        query = query.eq('paciente_id', pacienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Type assertion para garantir compatibilidade
      setDocumentos((data || []) as DocumentoMedico[]);
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('templates_documentos')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setTemplates((data || []) as TemplateDocumento[]);
    } catch (error) {
      console.error('Erro ao buscar templates:', error);
    }
  };

  const criarDocumento = async (documentoData: Omit<DocumentoMedico, 'id' | 'created_at' | 'updated_at' | 'medico_id'>) => {
    if (!profile) throw new Error('Usuário não autenticado');

    const { data, error } = await supabase
      .from('documentos_medicos')
      .insert({
        ...documentoData,
        medico_id: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    await fetchDocumentos();
    return data;
  };

  const atualizarDocumento = async (id: string, updates: Partial<DocumentoMedico>) => {
    const { data, error } = await supabase
      .from('documentos_medicos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    await fetchDocumentos();
    return data;
  };

  useEffect(() => {
    if (profile) {
      fetchDocumentos();
      fetchTemplates();
    }
  }, [profile]);

  return {
    documentos,
    templates,
    loading,
    fetchDocumentos,
    fetchTemplates,
    criarDocumento,
    atualizarDocumento
  };
};
