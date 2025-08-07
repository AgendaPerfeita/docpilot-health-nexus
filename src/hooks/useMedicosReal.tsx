import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export interface MedicoCompleto {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  crm?: string;
  especialidade?: string;
  status: 'ativo' | 'inativo' | 'pendente';
  tipo: 'medico';
  ativo: boolean;
  plano_medico: 'free' | 'premium';
  permite_atendimento_individual: boolean;
  permite_ia: boolean;
  permite_relatorios_avancados: boolean;
  created_at: string;
  updated_at: string;
  // Dados de vínculo
  vinculo_ativo?: boolean;
  data_vinculo?: string;
  // Estatísticas
  total_consultas?: number;
  receita_total?: number;
  ultima_consulta?: string;
}

export const useMedicosReal = () => {
  const { profile } = useAuth();
  const [medicos, setMedicos] = useState<MedicoCompleto[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarMedicos = async () => {
    try {
      setLoading(true);

      if (!profile) {
        throw new Error('Usuário não autenticado');
      }

      let query;

      if (profile.tipo === 'clinica') {
        // Se for clínica, buscar médicos vinculados
        query = supabase
          .from('clinica_medicos')
          .select(`
            *,
            profiles!clinica_medicos_medico_id_fkey (
              id,
              nome,
              email,
              telefone,
              documento,
              crm,
              especialidade,
              tipo,
              ativo,
              plano_medico,
              permite_atendimento_individual,
              permite_ia,
              permite_relatorios_avancados,
              created_at,
              updated_at
            )
          `)
          .eq('clinica_id', profile.id);
      } else if (profile.tipo === 'staff') {
        // Se for staff, buscar médicos da clínica
        query = supabase
          .from('clinica_medicos')
          .select(`
            *,
            profiles!clinica_medicos_medico_id_fkey (
              id,
              nome,
              email,
              telefone,
              documento,
              crm,
              especialidade,
              tipo,
              ativo,
              plano_medico,
              permite_atendimento_individual,
              permite_ia,
              permite_relatorios_avancados,
              created_at,
              updated_at
            )
          `)
          .eq('clinica_id', profile.clinica_id);
      } else {
        // Se for médico, apenas mostrar seus próprios dados
        const { data: medicoData, error: medicoError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profile.id)
          .eq('tipo', 'medico')
          .single();

        if (medicoError) throw medicoError;

        const medicoCompleto: MedicoCompleto = {
          id: medicoData.id,
          nome: medicoData.nome,
          email: medicoData.email,
          telefone: medicoData.telefone,
          cpf: medicoData.documento,
          crm: medicoData.crm,
          especialidade: medicoData.especialidade,
          status: (medicoData.ativo ? 'ativo' : 'inativo') as 'ativo' | 'inativo' | 'pendente',
          tipo: 'medico' as const,
          ativo: medicoData.ativo,
          plano_medico: (medicoData.plano_medico || 'free') as 'free' | 'premium',
          permite_atendimento_individual: medicoData.permite_atendimento_individual,
          permite_ia: medicoData.permite_ia,
          permite_relatorios_avancados: medicoData.permite_relatorios_avancados,
          created_at: medicoData.created_at,
          updated_at: medicoData.updated_at
        };

        setMedicos([medicoCompleto]);
        return;
      }

      const { data, error } = await query;

      if (error) throw error;

      const medicosFormatados: MedicoCompleto[] = data?.map(item => {
        const medico = item.profiles;
        return {
          id: medico.id,
          nome: medico.nome,
          email: medico.email,
          telefone: medico.telefone,
          cpf: medico.documento,
          crm: medico.crm,
          especialidade: medico.especialidade,
          status: (item.ativo && medico.ativo ? 'ativo' : 'inativo') as 'ativo' | 'inativo' | 'pendente',
          tipo: 'medico' as const,
          ativo: medico.ativo,
          plano_medico: (medico.plano_medico || 'free') as 'free' | 'premium',
          permite_atendimento_individual: medico.permite_atendimento_individual,
          permite_ia: medico.permite_ia,
          permite_relatorios_avancados: medico.permite_relatorios_avancados,
          created_at: medico.created_at,
          updated_at: medico.updated_at,
          vinculo_ativo: item.ativo,
          data_vinculo: item.created_at
        };
      }) || [];

      // Buscar estatísticas dos médicos
      for (const medico of medicosFormatados) {
        const { data: consultasData } = await supabase
          .from('consultas')
          .select('valor, created_at')
          .eq('medico_id', medico.id)
          .eq('status', 'concluida');

        if (consultasData) {
          medico.total_consultas = consultasData.length;
          medico.receita_total = consultasData.reduce((sum, c) => sum + (c.valor || 0), 0);
          
          if (consultasData.length > 0) {
            const consultasOrdenadas = consultasData.sort((a, b) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            medico.ultima_consulta = consultasOrdenadas[0].created_at;
          }
        }
      }

      setMedicos(medicosFormatados);
    } catch (error) {
      console.error('Erro ao carregar médicos:', error);
      toast.error('Erro ao carregar lista de médicos');
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusVinculo = async (medicoId: string, ativo: boolean) => {
    try {
      setLoading(true);

      if (!profile || (profile.tipo !== 'clinica' && profile.tipo !== 'staff')) {
        throw new Error('Apenas clínicas podem alterar vínculos');
      }

      const clinicaId = profile.tipo === 'clinica' ? profile.id : profile.clinica_id;

      const { error } = await supabase
        .from('clinica_medicos')
        .update({ ativo })
        .eq('clinica_id', clinicaId)
        .eq('medico_id', medicoId);

      if (error) throw error;

      setMedicos(prev => prev.map(m => 
        m.id === medicoId 
          ? { ...m, vinculo_ativo: ativo, status: ativo && m.ativo ? 'ativo' : 'inativo' }
          : m
      ));

      toast.success(`Vínculo ${ativo ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao atualizar vínculo:', error);
      toast.error('Erro ao atualizar vínculo do médico');
    } finally {
      setLoading(false);
    }
  };

  const atualizarPlanoMedico = async (medicoId: string, plano: 'free' | 'premium') => {
    try {
      setLoading(true);

      const updates = {
        plano_medico: plano,
        permite_atendimento_individual: plano === 'premium',
        permite_ia: plano === 'premium',
        permite_relatorios_avancados: plano === 'premium'
      };

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', medicoId);

      if (error) throw error;

      setMedicos(prev => prev.map(m => 
        m.id === medicoId 
          ? { 
              ...m, 
              plano_medico: plano,
              permite_atendimento_individual: plano === 'premium',
              permite_ia: plano === 'premium',
              permite_relatorios_avancados: plano === 'premium'
            }
          : m
      ));

      toast.success('Plano do médico atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      toast.error('Erro ao atualizar plano do médico');
    } finally {
      setLoading(false);
    }
  };

  const obterEstatisticas = () => {
    const total = medicos.length;
    const ativos = medicos.filter(m => m.status === 'ativo').length;
    const especialidades = new Set(medicos.map(m => m.especialidade).filter(Boolean)).size;
    const receitaTotal = medicos.reduce((sum, m) => sum + (m.receita_total || 0), 0);
    const consultasTotal = medicos.reduce((sum, m) => sum + (m.total_consultas || 0), 0);

    return {
      total,
      ativos,
      especialidades,
      receitaTotal,
      consultasTotal,
      receitaMedia: total > 0 ? receitaTotal / total : 0
    };
  };

  useEffect(() => {
    if (profile) {
      carregarMedicos();
    }
  }, [profile]);

  return {
    medicos,
    loading,
    carregarMedicos,
    atualizarStatusVinculo,
    atualizarPlanoMedico,
    obterEstatisticas
  };
};