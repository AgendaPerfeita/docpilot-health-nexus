
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface MedicoCadastroData {
  nome: string;
  email: string;
  telefone?: string;
  cpf: string;
  crm: string;
  especialidade: string;
  valorConsulta?: number;
  comissao?: number;
  permissoes: {
    prontuario: boolean;
    agenda: boolean;
    financeiro: boolean;
    admin: boolean;
    ia: boolean;
  };
}

export const useMedicosCadastro = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const generateSecurePassword = async (): Promise<string> => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-secure-password', {
        body: { length: 12, includeSymbols: true }
      });

      if (error) throw error;
      return data.password;
    } catch (error) {
      console.error('Error generating secure password:', error);
      // Fallback to client-side generation if edge function fails
      return Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();
    }
  };

  const cadastrarMedico = async (dados: MedicoCadastroData) => {
    if (profile?.tipo !== 'clinica') {
      throw new Error('Apenas clínicas podem cadastrar médicos');
    }

    setLoading(true);
    try {
      // Verificar se já existe um médico com este email
      const { data: medicoExistente } = await supabase
        .from('profiles')
        .select('id, nome, email')
        .eq('email', dados.email)
        .eq('tipo', 'medico')
        .single();

      if (medicoExistente) {
        // Médico já existe, apenas vincular
        const { data: vinculoExistente } = await supabase
          .from('clinica_medicos')
          .select('id')
          .eq('clinica_id', profile.id)
          .eq('medico_id', medicoExistente.id)
          .single();

        if (vinculoExistente) {
          throw new Error('Este médico já está vinculado à clínica');
        }

        // Criar vínculo
        const { error: vinculoError } = await supabase
          .from('clinica_medicos')
          .insert({
            clinica_id: profile.id,
            medico_id: medicoExistente.id,
            ativo: true
          });

        if (vinculoError) throw vinculoError;

        toast({
          title: "Médico vinculado com sucesso!",
          description: `${medicoExistente.nome} foi vinculado à clínica.`,
        });

        return { tipo: 'vinculo_existente', medico: medicoExistente };
      }

      // Gerar senha segura usando edge function
      const senhaTemporaria = await generateSecurePassword();

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: dados.email,
        password: senhaTemporaria,
        email_confirm: true,
        user_metadata: {
          nome: dados.nome,
          tipo: 'medico',
          documento: dados.cpf,
          telefone: dados.telefone,
          especialidade: dados.especialidade,
          crm: dados.crm
        }
      });

      if (authError) throw authError;

      // Criar perfil
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: dados.email,
          nome: dados.nome,
          tipo: 'medico',
          documento: dados.cpf,
          telefone: dados.telefone,
          especialidade: dados.especialidade,
          crm: dados.crm,
          plano_medico: 'free',
          permite_atendimento_individual: false,
          permite_ia: dados.permissoes.ia,
          permite_relatorios_avancados: dados.permissoes.financeiro
        })
        .select()
        .single();

      if (profileError) throw profileError;

      // Criar vínculo com a clínica
      const { error: vinculoError } = await supabase
        .from('clinica_medicos')
        .insert({
          clinica_id: profile.id,
          medico_id: profileData.id,
          ativo: true
        });

      if (vinculoError) throw vinculoError;

      // Enviar credenciais por email
      await supabase.functions.invoke('send-medico-credentials', {
        body: {
          to: dados.email,
          nome: dados.nome,
          email: dados.email,
          senha: senhaTemporaria,
          clinicaNome: profile.nome
        }
      });

      toast({
        title: "Médico cadastrado com sucesso!",
        description: `${dados.nome} foi cadastrado e as credenciais foram enviadas por email.`,
      });

      return { 
        tipo: 'cadastro_novo', 
        medico: profileData, 
        credenciais: { 
          email: dados.email, 
          senha: senhaTemporaria 
        } 
      };

    } catch (error: any) {
      console.error('Erro ao cadastrar médico:', error);
      toast({
        title: "Erro ao cadastrar médico",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    cadastrarMedico,
    loading
  };
};
