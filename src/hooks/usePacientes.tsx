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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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

    // Chamada da função RPC sem genéricos, cast manual depois
    const { data: paciente, error: pacienteError } = await supabase.rpc('insert_paciente', {
      nome_param: dadosParaInserir.nome,
      email_param: dadosParaInserir.email || null,
      telefone_param: dadosParaInserir.telefone || null,
      cpf_param: dadosParaInserir.cpf || null,
      data_nascimento_param: dadosParaInserir.data_nascimento || null,
      endereco_param: dadosParaInserir.endereco || null,
      bairro_param: dadosParaInserir.bairro || null,
      cidade_param: dadosParaInserir.cidade || null,
      estado_param: dadosParaInserir.estado || null,
      cep_param: dadosParaInserir.cep || null,
      convenio_param: dadosParaInserir.convenio || null,
      numero_convenio_param: dadosParaInserir.numero_convenio || null,
      origem_param: dadosParaInserir.origem || 'Indicação'
    });

    console.log('🔍 criarPaciente - Resultado da inserção:', { paciente, error: pacienteError });

    if (pacienteError) {
      console.error('❌ criarPaciente - Erro na inserção:', pacienteError);
      
      // Tratar erro de CPF duplicado de forma mais amigável
      if (pacienteError.code === '23505' && pacienteError.message.includes('cpf')) {
        throw new Error(`Paciente com CPF ${dadosParaInserir.cpf} já está cadastrado no sistema.`);
      }
      
      // Tratar erro de email duplicado de forma mais amigável
      if (pacienteError.code === '23505' && pacienteError.message.includes('email')) {
        throw new Error(`Paciente com email ${dadosParaInserir.email} já está cadastrado no sistema.`);
      }
      
      throw pacienteError;
    }

    // A função RPC retorna um array, precisamos pegar o primeiro elemento
    const pacienteArray = paciente as Paciente[];
    const pacienteCriado: Paciente | undefined = Array.isArray(pacienteArray) && typeof pacienteArray[0] === 'object' ? pacienteArray[0] : undefined;
    
    if (!pacienteCriado || !pacienteCriado.id) {
      console.error('❌ criarPaciente - Paciente criado não tem ID válido:', pacienteCriado);
      throw new Error('Erro ao criar paciente: ID não encontrado');
    }

    console.log('✅ criarPaciente - Paciente criado com sucesso:', pacienteCriado);

    // Criar vínculos usando as tabelas de vínculo
    if (profile.tipo === 'clinica' || profile.tipo === 'staff') {
      const clinicaId = profile.tipo === 'clinica' ? profile.id : profile.clinica_id;
      console.log('🔍 criarPaciente - Criando vínculo com clínica:', clinicaId);
      
      // Verificar se o vínculo já existe
      const { data: vinculoExistente } = await supabase
        .from('paciente_clinica')
        .select('id')
        .eq('paciente_id', pacienteCriado.id)
        .eq('clinica_id', clinicaId)
        .single();
      
      if (!vinculoExistente) {
        const { error: vinculoError } = await supabase
          .from('paciente_clinica')
          .insert({ 
            paciente_id: pacienteCriado.id, 
            clinica_id: clinicaId 
          });
        
        if (vinculoError) {
          console.error('❌ criarPaciente - Erro ao criar vínculo clínica:', vinculoError);
          throw vinculoError;
        }
        console.log('✅ criarPaciente - Vínculo com clínica criado');
      } else {
        console.log('✅ criarPaciente - Vínculo com clínica já existe');
      }
    } else if (profile.tipo === 'medico') {
      // Criar vínculo médico-paciente
      const clinicaId = profile.clinica_id || profile.id; // Se médico não tem clínica, usar próprio ID
      console.log('🔍 criarPaciente - Criando vínculo médico-paciente:', profile.id, clinicaId);
      
      // Verificar se o vínculo já existe
      const { data: vinculoExistente } = await supabase
        .from('paciente_medico')
        .select('id')
        .eq('paciente_id', pacienteCriado.id)
        .eq('medico_id', profile.id)
        .single();
      
      if (!vinculoExistente) {
        const { error: vinculoError } = await supabase
          .from('paciente_medico')
          .insert({ 
            paciente_id: pacienteCriado.id, 
            medico_id: profile.id,
            clinica_id: clinicaId
          });
        
        if (vinculoError) {
          console.error('❌ criarPaciente - Erro ao criar vínculo médico:', vinculoError);
          throw vinculoError;
        }
        console.log('✅ criarPaciente - Vínculo médico-paciente criado');
      } else {
        console.log('✅ criarPaciente - Vínculo médico-paciente já existe');
      }
    }
      
    console.log('✅ criarPaciente - Vínculos criados com sucesso');
    await fetchPacientes();
    return paciente;
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
      fetchPacientes();
    }
  }, [profile?.id, refreshTrigger]);

  // Adicionar um useEffect para forçar atualização quando necessário
  useEffect(() => {
    if (profile?.id && pacientes.length > 0) {
      console.log('usePacientes - Pacientes carregados:', pacientes.length);
    }
  }, [pacientes.length, profile?.id]);

  return {
    pacientes,
    loading,
    criarPaciente,
    atualizarPaciente,
    deletarPaciente,
    buscarPacientes,
    buscarPacientePorId,
    buscarPacientePorIdSemRLS,
    refetch: fetchPacientes,
    refreshTrigger
  };
};