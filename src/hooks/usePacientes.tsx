import { useState, useEffect, useCallback, useRef } from 'react';
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
  const { profile, refreshProfile } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const lastFetchRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);
  const realtimeChannelRef = useRef<any>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const pollingActiveRef = useRef<boolean>(false);

  const fetchPacientes = useCallback(async (force = false) => {
    const now = Date.now();
    if (!profile?.id) {
      setLoading(false);
      return [];
    }
    if (!force && now - lastFetchRef.current < 500) {
      return pacientes;
    }
    lastFetchRef.current = now;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPacientes([]);
        return [];
      }
      let pacienteIds: string[] = [];
      if (profile.tipo === 'clinica' || profile.tipo === 'staff') {
        const clinicaId = profile.tipo === 'clinica' ? profile.id : profile.clinica_id;
        const { data: vinculos } = await supabase
          .from('paciente_clinica')
          .select('paciente_id')
          .eq('clinica_id', clinicaId);
        pacienteIds = vinculos?.map(v => v.paciente_id) || [];
      } else if (profile.tipo === 'medico') {
        const { data: vinculos } = await supabase
          .from('paciente_medico')
          .select('paciente_id')
          .eq('medico_id', profile.id);
        pacienteIds = vinculos?.map(v => v.paciente_id) || [];
      }
      if (pacienteIds.length === 0) {
        setPacientes([]);
        setLoading(false);
        return [];
      }
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('*')
        .in('id', pacienteIds)
        .order('nome');
      setPacientes(pacientesData || []);
      setLoading(false);
      return pacientesData || [];
    } catch (error) {
      setPacientes([]);
      setLoading(false);
      return [];
    }
  }, [profile]);

  // Optimized polling with longer intervals and fewer attempts
  const pollingAfterRealtime = useCallback(() => {
    if (pollingActiveRef.current) return; // já está rodando
    pollingActiveRef.current = true;
    let attempts = 0;
    const maxAttempts = 3; // Reduced from 6 to 3
    let lastPacientesIds: string = pacientes.map(p => p.id).join(',');
    if (process.env.NODE_ENV === 'development') {
      console.log('[Polling] Iniciando polling após evento realtime. Lista atual:', lastPacientesIds, `(length: ${pacientes.length})`);
    }
    const poll = async () => {
      attempts++;
      const newPacientes = await fetchPacientes(true);
      const newIds = (newPacientes || []).map(p => p.id).join(',');
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Polling] Attempt ${attempts}: ${newIds} (length: ${(newPacientes || []).length})`);
      }
      if (newIds !== lastPacientesIds || (newPacientes || []).length !== pacientes.length) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Polling] Lista mudou! Parando polling.');
        }
        pollingActiveRef.current = false;
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        return;
      }
      if (attempts >= maxAttempts) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Polling] Atingiu o máximo de tentativas. Parando polling.');
        }
        pollingActiveRef.current = false;
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        return;
      }
    };
    pollingRef.current = setInterval(poll, 1000); // Increased from 500ms to 1000ms
    // Executa o primeiro imediatamente
    poll();
  }, [fetchPacientes, pacientes]);

  const forceRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // CRUD
  const criarPaciente = useCallback(async (pacienteData: Omit<Paciente, 'id' | 'created_at' | 'updated_at'>) => {
    if (!profile) throw new Error('Usuário não autenticado');
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
    if (pacienteError) {
      if (pacienteError.code === '23505' && pacienteError.message.includes('cpf')) {
        throw new Error(`Paciente com CPF ${dadosParaInserir.cpf} já está cadastrado no sistema.`);
      }
      if (pacienteError.code === '23505' && pacienteError.message.includes('email')) {
        throw new Error(`Paciente com email ${dadosParaInserir.email} já está cadastrado no sistema.`);
      }
      throw pacienteError;
    }
    const pacienteArray = paciente as Paciente[];
    const pacienteCriado: Paciente | undefined = Array.isArray(pacienteArray) && typeof pacienteArray[0] === 'object' ? pacienteArray[0] : undefined;
    if (!pacienteCriado || !pacienteCriado.id) {
      throw new Error('Erro ao criar paciente: ID não encontrado');
    }
    // Vínculos
    if (profile.tipo === 'clinica' || profile.tipo === 'staff') {
      const clinicaId = profile.tipo === 'clinica' ? profile.id : profile.clinica_id;
      const { data: vinculoExistente, error: errorVinculo } = await supabase
        .from('paciente_clinica')
        .select('id')
        .eq('paciente_id', pacienteCriado.id)
        .eq('clinica_id', clinicaId)
        .maybeSingle(); // <-- usar maybeSingle
      if (errorVinculo && errorVinculo.code !== 'PGRST116') throw errorVinculo;
      if (!vinculoExistente) {
        const { error: vinculoError } = await supabase
          .from('paciente_clinica')
          .insert({ paciente_id: pacienteCriado.id, clinica_id: clinicaId });
        if (vinculoError) throw vinculoError;
      }
    } else if (profile.tipo === 'medico') {
      const clinicaId = profile.clinica_id || profile.id;
      const { data: vinculoExistente, error: errorVinculo } = await supabase
        .from('paciente_medico')
        .select('id')
        .eq('paciente_id', pacienteCriado.id)
        .eq('medico_id', profile.id)
        .maybeSingle(); // <-- usar maybeSingle
      if (errorVinculo && errorVinculo.code !== 'PGRST116') throw errorVinculo;
      if (!vinculoExistente) {
        const { error: vinculoError } = await supabase
          .from('paciente_medico')
          .insert({ paciente_id: pacienteCriado.id, medico_id: profile.id, clinica_id: clinicaId });
        if (vinculoError) throw vinculoError;
      }
    }
    // Profissional: Forçar refresh do JWT para garantir que o SELECT enxergue o novo vínculo imediatamente
    try {
      console.log('[Pacientes] Forçando refresh do JWT após criação de paciente e vínculos...');
      await supabase.auth.refreshSession();
      console.log('[Pacientes] JWT atualizado com sucesso. Buscando profile atualizado...');
      if (refreshProfile) {
        await refreshProfile();
        console.log('[Pacientes] Profile atualizado com sucesso após refresh do JWT.');
      } else {
        console.warn('[Pacientes] refreshProfile não está disponível no contexto.');
      }
    } catch (refreshError) {
      console.error('[Pacientes] Erro ao atualizar JWT ou profile:', refreshError);
    }
    forceRefresh();
    return paciente;
  }, [profile, forceRefresh, refreshProfile]);

  const atualizarPaciente = useCallback(async (id: string, pacienteData: any) => {
    const { data, error } = await supabase
      .from('pacientes')
      .update(pacienteData)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    forceRefresh();
    return data;
  }, [forceRefresh]);

  const deletarPaciente = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('pacientes')
      .delete()
      .eq('id', id);
    if (error) throw error;
    forceRefresh();
  }, [forceRefresh]);

  const buscarPacientes = useCallback(async (termo: string) => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .or(`nome.ilike.%${termo}%,cpf.ilike.%${termo}%,email.ilike.%${termo}%`)
      .order('nome');
    if (error) throw error;
    return data || [];
  }, []);

  const buscarPacientePorId = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  const buscarPacientePorIdSemRLS = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  }, []);

  // EFEITOS
  useEffect(() => {
    if (profile?.id) {
      fetchPacientes();
      isInitializedRef.current = true;
    }
  }, [profile?.id, refreshTrigger, fetchPacientes]);

  useEffect(() => {
    console.log('[Realtime] useEffect de assinatura executado para profile:', profile?.id);
    if (!profile?.id) return;
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
    const channel = supabase.channel('realtime-pacientes', {
      config: {
        broadcast: { self: false },
        presence: { key: profile.id },
      },
    });
    const tables = ['pacientes', 'paciente_clinica', 'paciente_medico'];
    console.log('[Realtime] Canal realtime-pacientes criado e assinando tabelas:', tables);
    tables.forEach((table) => {
      channel.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
        },
        (payload) => {
          console.log('[Realtime] Evento recebido:', payload);
          if (['INSERT', 'UPDATE', 'DELETE'].includes(payload.eventType)) {
            pollingAfterRealtime();
          }
        }
      );
    });
    channel.subscribe();
    realtimeChannelRef.current = channel;
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
        realtimeChannelRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      pollingActiveRef.current = false;
    };
  }, [profile?.id, pollingAfterRealtime]);

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
    forceRefresh,
    refreshTrigger
  };
};