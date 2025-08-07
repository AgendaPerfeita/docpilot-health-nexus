import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Usuário não autenticado')
    }

    const { action, ...params } = await req.json()

    let result;
    switch (action) {
      case 'export_completo':
        result = await exportCompleto(supabase, user.id, params);
        break;
      case 'export_seletivo':
        result = await exportSeletivo(supabase, user.id, params);
        break;
      case 'import_dados':
        result = await importDados(supabase, user.id, params);
        break;
      case 'listar_backups':
        result = await listarBackups(supabase, user.id);
        break;
      case 'download_backup':
        result = await downloadBackup(supabase, user.id, params.backup_id);
        break;
      case 'cleanup_antigos':
        result = await cleanupBackupsAntigos(supabase, user.id);
        break;
      default:
        throw new Error(`Ação não reconhecida: ${action}`)
    }

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Erro na função de backup:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

async function exportCompleto(supabase: any, userId: string, params: any) {
  console.log('Iniciando export completo para user:', userId);

  // Log do início da operação
  const { data: logData } = await supabase
    .from('backup_logs')
    .insert({
      user_id: userId,
      tipo: 'export_completo',
      status: 'processando',
      parametros: params
    })
    .select()
    .single();

  try {
    // Buscar todos os dados do usuário
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);

    const userProfileId = profileData?.[0]?.id;

    // Buscar pacientes vinculados
    const { data: pacientesData } = await supabase
      .rpc('get_pacientes_medico', { medico_id_param: userProfileId });

    // Buscar consultas
    const { data: consultasData } = await supabase
      .from('consultas')
      .select('*')
      .eq('medico_id', userProfileId);

    // Buscar prontuários
    const { data: prontuariosData } = await supabase
      .from('prontuarios')
      .select('*')
      .eq('medico_id', userProfileId);

    // Buscar anexos médicos
    const { data: anexosData } = await supabase
      .from('anexos_medicos')
      .select('*')
      .eq('medico_id', userProfileId);

    const backupData = {
      export_date: new Date().toISOString(),
      user_id: userId,
      profile: profileData?.[0],
      pacientes: pacientesData || [],
      consultas: consultasData || [],
      prontuarios: prontuariosData || [],
      anexos_medicos: anexosData || []
    };

    const backupJson = JSON.stringify(backupData, null, 2);
    const fileName = `backup_completo_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    
    // Upload para storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('anexos-medicos')
      .upload(`backups/${userId}/${fileName}`, backupJson, {
        contentType: 'application/json'
      });

    if (uploadError) throw uploadError;

    // Gerar URL assinada
    const { data: signedUrlData } = await supabase.storage
      .from('anexos-medicos')
      .createSignedUrl(`backups/${userId}/${fileName}`, 3600); // 1 hora

    const summary = {
      total_pacientes: backupData.pacientes.length,
      total_consultas: backupData.consultas.length,
      total_prontuarios: backupData.prontuarios.length,
      total_anexos: backupData.anexos_medicos.length
    };

    // Atualizar log com sucesso
    await supabase
      .from('backup_logs')
      .update({
        status: 'concluido',
        completed_at: new Date().toISOString(),
        arquivo_url: signedUrlData?.signedUrl,
        tamanho_bytes: new TextEncoder().encode(backupJson).length,
        resultado: { summary, file_path: uploadData.path }
      })
      .eq('id', logData.id);

    return {
      success: true,
      download_url: signedUrlData?.signedUrl,
      size_bytes: new TextEncoder().encode(backupJson).length,
      summary
    };

  } catch (error) {
    // Atualizar log com erro
    await supabase
      .from('backup_logs')
      .update({
        status: 'erro',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', logData.id);

    throw error;
  }
}

async function exportSeletivo(supabase: any, userId: string, params: any) {
  console.log('Iniciando export seletivo para user:', userId, 'params:', params);

  const { data: logData } = await supabase
    .from('backup_logs')
    .insert({
      user_id: userId,
      tipo: 'export_seletivo',
      status: 'processando',
      parametros: params
    })
    .select()
    .single();

  try {
    const { tabelas, data_inicio, data_fim } = params;
    const backupData: any = {
      export_date: new Date().toISOString(),
      user_id: userId,
      export_type: 'seletivo',
      filters: { tabelas, data_inicio, data_fim }
    };

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId);

    const userProfileId = profileData?.[0]?.id;

    // Exportar tabelas selecionadas
    if (tabelas.includes('pacientes')) {
      const { data } = await supabase
        .rpc('get_pacientes_medico', { medico_id_param: userProfileId });
      backupData.pacientes = data || [];
    }

    if (tabelas.includes('consultas')) {
      let query = supabase
        .from('consultas')
        .select('*')
        .eq('medico_id', userProfileId);
      
      if (data_inicio) query = query.gte('data_consulta', data_inicio);
      if (data_fim) query = query.lte('data_consulta', data_fim);
      
      const { data } = await query;
      backupData.consultas = data || [];
    }

    if (tabelas.includes('prontuarios')) {
      let query = supabase
        .from('prontuarios')
        .select('*')
        .eq('medico_id', userProfileId);
      
      if (data_inicio) query = query.gte('created_at', data_inicio);
      if (data_fim) query = query.lte('created_at', data_fim);
      
      const { data } = await query;
      backupData.prontuarios = data || [];
    }

    const backupJson = JSON.stringify(backupData, null, 2);
    const fileName = `backup_seletivo_${new Date().toISOString().split('T')[0]}_${Date.now()}.json`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('anexos-medicos')
      .upload(`backups/${userId}/${fileName}`, backupJson, {
        contentType: 'application/json'
      });

    if (uploadError) throw uploadError;

    const { data: signedUrlData } = await supabase.storage
      .from('anexos-medicos')
      .createSignedUrl(`backups/${userId}/${fileName}`, 3600);

    await supabase
      .from('backup_logs')
      .update({
        status: 'concluido',
        completed_at: new Date().toISOString(),
        arquivo_url: signedUrlData?.signedUrl,
        tamanho_bytes: new TextEncoder().encode(backupJson).length,
        resultado: { file_path: uploadData.path, tabelas_exportadas: tabelas }
      })
      .eq('id', logData.id);

    return {
      success: true,
      download_url: signedUrlData?.signedUrl,
      size_bytes: new TextEncoder().encode(backupJson).length,
      tabelas_exportadas: tabelas
    };

  } catch (error) {
    await supabase
      .from('backup_logs')
      .update({
        status: 'erro',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', logData.id);

    throw error;
  }
}

async function importDados(supabase: any, userId: string, params: any) {
  console.log('Iniciando importação para user:', userId);

  const { data: logData } = await supabase
    .from('backup_logs')
    .insert({
      user_id: userId,
      tipo: 'import',
      status: 'processando',
      parametros: { source: 'upload' }
    })
    .select()
    .single();

  try {
    const { backup_data } = params;
    
    if (!backup_data || typeof backup_data !== 'object') {
      throw new Error('Dados de backup inválidos');
    }

    let importedCount = 0;

    // Importar pacientes (apenas novos)
    if (backup_data.pacientes?.length) {
      for (const paciente of backup_data.pacientes) {
        const { error } = await supabase
          .from('pacientes')
          .insert(paciente)
          .select();
        
        if (!error) importedCount++;
      }
    }

    await supabase
      .from('backup_logs')
      .update({
        status: 'concluido',
        completed_at: new Date().toISOString(),
        resultado: { imported_count: importedCount }
      })
      .eq('id', logData.id);

    return {
      success: true,
      imported_count: importedCount
    };

  } catch (error) {
    await supabase
      .from('backup_logs')
      .update({
        status: 'erro',
        completed_at: new Date().toISOString(),
        error_message: error.message
      })
      .eq('id', logData.id);

    throw error;
  }
}

async function listarBackups(supabase: any, userId: string) {
  const { data: backups } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  return { backups: backups || [] };
}

async function downloadBackup(supabase: any, userId: string, backupId: string) {
  const { data: backup } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('id', backupId)
    .eq('user_id', userId)
    .single();

  if (!backup) {
    throw new Error('Backup não encontrado');
  }

  return {
    download_url: backup.arquivo_url,
    backup_info: backup
  };
}

async function cleanupBackupsAntigos(supabase: any, userId: string) {
  // Buscar configuração de retenção
  const { data: config } = await supabase
    .from('backup_configuracoes')
    .select('retencao_dias')
    .eq('user_id', userId)
    .single();

  const retencaoDias = config?.retencao_dias || 30;
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - retencaoDias);

  // Buscar backups antigos
  const { data: backupsAntigos } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('user_id', userId)
    .lt('created_at', dataLimite.toISOString());

  let deletedCount = 0;

  for (const backup of backupsAntigos || []) {
    try {
      // Remover arquivo do storage se existir
      if (backup.resultado?.file_path) {
        await supabase.storage
          .from('anexos-medicos')
          .remove([backup.resultado.file_path]);
      }

      // Remover registro do log
      await supabase
        .from('backup_logs')
        .delete()
        .eq('id', backup.id);

      deletedCount++;
    } catch (error) {
      console.error(`Erro ao deletar backup ${backup.id}:`, error);
    }
  }

  return {
    success: true,
    deleted_count: deletedCount
  };
}