import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ConviteMedico {
  id: string;
  clinica_id: string;
  email: string;
  nome: string;
  especialidade?: string;
  crm?: string;
  status: 'pendente' | 'aceito' | 'expirado';
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export const useConvites = () => {
  const { profile } = useAuth();
  const [convites, setConvites] = useState<ConviteMedico[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConvites = async () => {
    if (profile?.tipo !== 'clinica') return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('convites_medicos')
        .select('*')
        .eq('clinica_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConvites((data || []) as ConviteMedico[]);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
    } finally {
      setLoading(false);
    }
  };

  const criarConvite = async (dados: {
    email: string;
    nome: string;
    especialidade?: string;
    crm?: string;
  }) => {
    if (profile?.tipo !== 'clinica') {
      throw new Error('Apenas clínicas podem criar convites');
    }

    // Verificar se já existe um médico com este email
    const { data: medicoExistente } = await supabase
      .from('profiles')
      .select('id, nome, email')
      .eq('email', dados.email)
      .eq('tipo', 'medico')
      .single();

    if (medicoExistente) {
      // Médico já existe, verificar se já está vinculado
      const { data: vinculoExistente } = await supabase
        .from('clinica_medicos')
        .select('id')
        .eq('clinica_id', profile.id)
        .eq('medico_id', medicoExistente.id)
        .single();

      if (vinculoExistente) {
        throw new Error('Este médico já está vinculado à clínica');
      }

      // Criar vínculo direto
      const { error: vinculoError } = await supabase
        .from('clinica_medicos')
        .insert({
          clinica_id: profile.id,
          medico_id: medicoExistente.id,
          ativo: true
        });

      if (vinculoError) throw vinculoError;

      // Enviar notificação por email
      await supabase.functions.invoke('send-medico-notification', {
        body: {
          to: dados.email,
          medicoNome: medicoExistente.nome,
          clinicaNome: profile.nome,
          tipo: 'vinculo'
        }
      });

      return { tipo: 'vinculo_existente', medico: medicoExistente };
    }

    // Médico não existe, criar convite
    const { data, error } = await supabase
      .from('convites_medicos')
      .insert({
        clinica_id: profile.id,
        email: dados.email,
        nome: dados.nome,
        especialidade: dados.especialidade,
        crm: dados.crm
      })
      .select()
      .single();

    if (error) throw error;

    // Enviar email de convite
    await supabase.functions.invoke('send-medico-invitation', {
      body: {
        to: dados.email,
        nome: dados.nome,
        clinicaNome: profile.nome,
        token: data.token
      }
    });

    await fetchConvites();
    return { tipo: 'convite_novo', convite: data };
  };

  const cancelarConvite = async (conviteId: string) => {
    const { error } = await supabase
      .from('convites_medicos')
      .update({ status: 'expirado' })
      .eq('id', conviteId);

    if (error) throw error;
    await fetchConvites();
  };

  const reenviarConvite = async (conviteId: string) => {
    const convite = convites.find(c => c.id === conviteId);
    if (!convite) throw new Error('Convite não encontrado');

    // Gerar novo token e nova data de expiração
    const { data, error } = await supabase
      .from('convites_medicos')
      .update({
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pendente'
      })
      .eq('id', conviteId)
      .select()
      .single();

    if (error) throw error;

    // Reenviar email
    await supabase.functions.invoke('send-medico-invitation', {
      body: {
        to: convite.email,
        nome: convite.nome,
        clinicaNome: profile?.nome,
        token: data.token
      }
    });

    await fetchConvites();
  };

  useEffect(() => {
    if (profile?.tipo === 'clinica') {
      fetchConvites();
    }
  }, [profile]);

  return {
    convites,
    loading,
    criarConvite,
    cancelarConvite,
    reenviarConvite,
    refetch: fetchConvites
  };
};