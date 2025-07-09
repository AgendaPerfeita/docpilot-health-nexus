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
  bairro?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  convenio?: string;
  numero_convenio?: string;
  origem?: string;
  created_at: string;
  updated_at: string;
  antecedentes_clinicos?: string;
  antecedentes_cirurgicos?: string;
  antecedentes_familiares?: string;
  antecedentes_habitos?: string;
  antecedentes_alergias?: string;
  medicamentos_em_uso?: any;
  ticket_medio?: number;
  total_consultas?: number;
  total_gasto?: number;
}

export const usePacientes = () => {
  const { profile } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPacientes = async () => {
    console.log('fetchPacientes called. Profile:', profile);
    if (!profile?.id) {
      console.log('fetchPacientes: profile.id ausente, abortando');
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('fetchPacientes: Current auth user:', user?.id);
      if (!user) {
        console.error('fetchPacientes: No authenticated user found');
        setPacientes([]);
        return;
      }
      let pacienteIds: string[] = [];

      if (profile.tipo === 'clinica' || profile.tipo === 'staff') {
        // Buscar IDs dos pacientes da clínica
        const clinicaId = profile.tipo === 'clinica' ? profile.id : profile.clinica_id;
        console.log('fetchPacientes: buscando pacientes da clínica', clinicaId);
        
        const { data: vinculos, error: errorVinculos } = await supabase
          .from('paciente_clinica')
          .select('paciente_id')
          .eq('clinica_id', clinicaId);
        
        if (errorVinculos) {
          console.error('fetchPacientes: Erro ao buscar vínculos da clínica:', errorVinculos);
          throw errorVinculos;
        }
        
        pacienteIds = vinculos?.map(v => v.paciente_id) || [];
        console.log('fetchPacientes: IDs de pacientes da clínica encontrados:', pacienteIds.length);

      } else if (profile.tipo === 'medico') {
        // Buscar IDs dos pacientes do médico
        console.log('fetchPacientes: buscando pacientes do médico', profile.id);
        
        const { data: vinculos, error: errorVinculos } = await supabase
          .from('paciente_medico')
          .select('paciente_id')
          .eq('medico_id', profile.id);
        
        if (errorVinculos) {
          console.error('fetchPacientes: Erro ao buscar vínculos do médico:', errorVinculos);
          throw errorVinculos;
        }
        
        pacienteIds = vinculos?.map(v => v.paciente_id) || [];
        console.log('fetchPacientes: IDs de pacientes do médico encontrados:', pacienteIds.length);
      }

      // Se não há pacientes vinculados, retornar array vazio
      if (pacienteIds.length === 0) {
        console.log('fetchPacientes: Nenhum paciente encontrado');
        setPacientes([]);
        return;
      }

      // Buscar dados dos pacientes
      const { data: pacientesData, error: errorPacientes } = await supabase
        .from('pacientes')
        .select('*')
        .in('id', pacienteIds)
        .order('nome');

      if (errorPacientes) {
        console.error('fetchPacientes: Erro ao buscar dados dos pacientes:', errorPacientes);
        throw errorPacientes;
      }

      console.log('fetchPacientes: Total de pacientes encontrados:', pacientesData?.length || 0);
      console.log('fetchPacientes: Pacientes:', pacientesData);
      setPacientes(pacientesData || []);
    } catch (error) {
      console.error('fetchPacientes: Error fetching pacientes:', error);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const criarPaciente = async (pacienteData: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => {
    if (!profile) throw new Error('Usuário não autenticado');

    console.log('🔍 criarPaciente - Profile:', profile);
    console.log('🔍 criarPaciente - PacienteData recebido:', pacienteData);

    // Tratar campos vazios para evitar erros no banco
    const dadosParaInserir = {
      ...pacienteData,
      data_nascimento: pacienteData.data_nascimento && pacienteData.data_nascimento.trim() !== '' 
        ? pacienteData.data_nascimento 
        : null,
      email: pacienteData.email && pacienteData.email.trim() !== '' 
        ? pacienteData.email 
        : null,
      telefone: pacienteData.telefone && pacienteData.telefone.trim() !== '' 
        ? pacienteData.telefone 
        : null,
      cpf: pacienteData.cpf && pacienteData.cpf.trim() !== '' 
        ? pacienteData.cpf 
        : null
    };

    console.log('🔍 criarPaciente - Dados para inserir:', dadosParaInserir);

    // Criar o paciente
    const { data: paciente, error: pacienteError } = await supabase
      .from('pacientes')
      .insert(dadosParaInserir)
      .select()
      .single();

    console.log('🔍 criarPaciente - Resultado da inserção:', { paciente, error: pacienteError });

    if (pacienteError) {
      console.error('❌ criarPaciente - Erro na inserção:', pacienteError);
      throw pacienteError;
    }

    console.log('✅ criarPaciente - Paciente criado com sucesso:', paciente);

    // Criar vínculos apropriados baseado no tipo de usuário
    try {
      if (profile.tipo === 'clinica') {
        // Clínica cria vínculo direto
        console.log('🔍 criarPaciente - Criando vínculo clínica:', profile.id);
        const { error: vinculoError } = await supabase
          .from('paciente_clinica')
          .insert({ 
            paciente_id: paciente.id, 
            clinica_id: profile.id 
          });
        
        if (vinculoError) {
          console.error('❌ criarPaciente - Erro ao criar vínculo clínica:', vinculoError);
          throw vinculoError;
        }
        
      } else if (profile.tipo === 'staff') {
        // Staff cria vínculo para a clínica onde trabalha
        if (!profile.clinica_id) {
          throw new Error('Staff deve estar vinculado a uma clínica');
        }
        console.log('🔍 criarPaciente - Staff criando vínculo para clínica:', profile.clinica_id);
        const { error: vinculoError } = await supabase
          .from('paciente_clinica')
          .insert({ 
            paciente_id: paciente.id, 
            clinica_id: profile.clinica_id 
          });
        
        if (vinculoError) {
          console.error('❌ criarPaciente - Erro ao criar vínculo clínica via staff:', vinculoError);
          throw vinculoError;
        }
        
      } else if (profile.tipo === 'medico') {
        console.log('🔍 criarPaciente - Médico criando vínculo:', profile.id);
        
        // Verificar se médico tem clínicas vinculadas
        const { data: clinicas, error: clinicasError } = await supabase
          .from('clinica_medicos')
          .select('clinica_id')
          .eq('medico_id', profile.id)
          .eq('ativo', true);
        
        if (clinicasError) {
          console.error('❌ Erro ao buscar clínicas do médico:', clinicasError);
          throw clinicasError;
        }
        
        if (clinicas && clinicas.length > 0) {
          // Médico vinculado a clínicas - criar vínculo para a primeira clínica
          const clinicaId = clinicas[0].clinica_id;
          console.log('🔍 criarPaciente - Médico vinculado, usando clínica:', clinicaId);
          
          // Criar vínculo médico-paciente
          const { error: vinculoMedicoError } = await supabase
            .from('paciente_medico')
            .insert({ 
              paciente_id: paciente.id, 
              medico_id: profile.id,
              clinica_id: clinicaId
            });
          
          if (vinculoMedicoError) {
            console.error('❌ criarPaciente - Erro ao criar vínculo médico:', vinculoMedicoError);
            throw vinculoMedicoError;
          }
          
          // Criar vínculo clínica-paciente também
          const { error: vinculoClinicaError } = await supabase
            .from('paciente_clinica')
            .insert({ 
              paciente_id: paciente.id, 
              clinica_id: clinicaId 
            });
          
          if (vinculoClinicaError) {
            console.error('❌ criarPaciente - Erro ao criar vínculo clínica:', vinculoClinicaError);
            throw vinculoClinicaError;
          }
          
        } else {
          // Médico individual - criar vínculo médico com auto-referência
          console.log('🔍 criarPaciente - Médico individual, criando auto-referência');
          const { error: vinculoError } = await supabase
            .from('paciente_medico')
            .insert({ 
              paciente_id: paciente.id, 
              medico_id: profile.id,
              clinica_id: profile.id // Auto-referência para médicos individuais
            });
          
          if (vinculoError) {
            console.error('❌ criarPaciente - Erro ao criar vínculo médico individual:', vinculoError);
            throw vinculoError;
          }
        }
      }
      
      console.log('✅ criarPaciente - Vínculos criados com sucesso');
      await fetchPacientes();
      return paciente;
      
    } catch (vinculoError) {
      // Se houve erro no vínculo, tentar deletar o paciente criado
      console.error('❌ Erro ao criar vínculos, deletando paciente:', vinculoError);
      await supabase.from('pacientes').delete().eq('id', paciente.id);
      throw vinculoError;
    }
  };

  const atualizarPaciente = async (id: string, pacienteData: any) => {
    console.log('Payload enviado para update:', pacienteData);
    const { data, error } = await supabase
      .from('pacientes')
      .update(pacienteData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
    console.log('Update retornou:', data);
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

  const buscarPacientePorId = async (id: string) => {
    console.log('usePacientes - buscando paciente por ID:', id);
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('usePacientes - Erro ao buscar paciente por ID:', error);
      throw error;
    }
    
    console.log('usePacientes - Paciente encontrado por ID:', data);
    return data;
  };

  const buscarPacientePorIdSemRLS = async (id: string) => {
    console.log('usePacientes - buscando paciente por ID sem RLS:', id);
    // Usar consulta direta bypassando RLS
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('usePacientes - Erro ao buscar paciente por ID sem RLS:', error);
      throw error;
    }
    
    console.log('usePacientes - Paciente encontrado por ID sem RLS:', data);
    return data;
  };

  useEffect(() => {
    if (profile?.id) {
      console.log('usePacientes - useEffect triggered with profile ID:', profile.id);
      // Só fazer fetch se não temos pacientes carregados
      if (pacientes.length === 0) {
        fetchPacientes();
      } else {
        console.log('usePacientes - Pacientes already loaded, skipping fetch');
      }
    }
  }, [profile?.id]);

  return {
    pacientes,
    loading,
    criarPaciente,
    atualizarPaciente,
    deletarPaciente,
    buscarPacientes,
    buscarPacientePorId,
    buscarPacientePorIdSemRLS,
    refetch: fetchPacientes
  };
};