import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar autenticação
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Token de autorização necessário');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Usuário não autenticado');
    }

    const { action, ...params } = await req.json();
    console.log(`Backup action: ${action} for user: ${user.id}`);

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
        throw new Error(`Ação não suportada: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro no backup system:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});

async function exportCompleto(supabase: any, userId: string, params: any) {
  // Criar log inicial
  const { data: logData } = await supabase
    .from('backup_logs')
    .insert({
      tipo: 'export_completo',
      status: 'processando',
      user_id: userId,
      parametros: params
    })
    .select()
    .single();

  try {
    // Obter dados completos usando a função do banco
    const { data: userData, error } = await supabase.rpc('get_user_complete_data', {
      target_user_id: userId
    });

    if (error) throw error;

    // Adicionar metadados
    const backupData = {
      metadata: {
        export_timestamp: new Date().toISOString(),
        version: '1.0',
        user_id: userId,
        type: 'export_completo'
      },
      data: userData
    };

    // Converter para JSON e calcular tamanho
    const jsonData = JSON.stringify(backupData, null, 2);
    const sizeBytes = new TextEncoder().encode(jsonData).length;

    // Upload para storage
    const fileName = `backup_completo_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('anexos-medicos')
      .upload(`backups/${fileName}`, jsonData, {
        contentType: 'application/json'
      });

    if (uploadError) throw uploadError;

    // Obter URL pública
    const { data: urlData } = await supabase.storage
      .from('anexos-medicos')
      .createSignedUrl(`backups/${fileName}`, 604800); // 7 dias

    // Atualizar log
    await supabase
      .from('backup_logs')
      .update({
        status: 'concluido',
        completed_at: new Date().toISOString(),
        arquivo_url: urlData?.signedUrl,
        tamanho_bytes: sizeBytes,
        resultado: {
          total_pacientes: Array.isArray(userData?.pacientes) ? userData.pacientes.length : 0,
          total_consultas: Array.isArray(userData?.consultas) ? userData.consultas.length : 0,
          total_prontuarios: Array.isArray(userData?.prontuarios) ? userData.prontuarios.length : 0,
          total_anexos: Array.isArray(userData?.anexos_medicos) ? userData.anexos_medicos.length : 0
        }
      })
      .eq('id', logData.id);

    return {
      success: true,
      backup_id: logData.id,
      download_url: urlData?.signedUrl,
      size_bytes: sizeBytes,
      summary: {
        total_pacientes: Array.isArray(userData?.pacientes) ? userData.pacientes.length : 0,
        total_consultas: Array.isArray(userData?.consultas) ? userData.consultas.length : 0,
        total_prontuarios: Array.isArray(userData?.prontuarios) ? userData.prontuarios.length : 0,
        total_anexos: Array.isArray(userData?.anexos_medicos) ? userData.anexos_medicos.length : 0
      }
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
  const { tabelas = [], data_inicio, data_fim } = params;

  const { data: logData } = await supabase
    .from('backup_logs')
    .insert({
      tipo: 'export_seletivo',
      status: 'processando',
      user_id: userId,
      parametros: params
    })
    .select()
    .single();

  try {
    const backupData: any = {
      metadata: {
        export_timestamp: new Date().toISOString(),
        version: '1.0',
        user_id: userId,
        type: 'export_seletivo',
        filters: { tabelas, data_inicio, data_fim }
      },
      data: {}
    };

    // Exportar apenas tabelas selecionadas
    if (tabelas.includes('pacientes')) {
      const { data } = await supabase
        .from('pacientes')
        .select('*')
        .gte('created_at', data_inicio || '1900-01-01')
        .lte('created_at', data_fim || '2100-01-01');
      backupData.data.pacientes = data || [];
    }

    if (tabelas.includes('consultas')) {
      const { data } = await supabase
        .from('consultas')
        .select('*')
        .gte('created_at', data_inicio || '1900-01-01')
        .lte('created_at', data_fim || '2100-01-01');
      backupData.data.consultas = data || [];
    }

    if (tabelas.includes('prontuarios')) {
      const { data } = await supabase
        .from('prontuarios')
        .select('*')
        .gte('created_at', data_inicio || '1900-01-01')
        .lte('created_at', data_fim || '2100-01-01');
      backupData.data.prontuarios = data || [];
    }

    const jsonData = JSON.stringify(backupData, null, 2);
    const sizeBytes = new TextEncoder().encode(jsonData).length;

    const fileName = `backup_seletivo_${userId}_${new Date().toISOString().split('T')[0]}.json`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('anexos-medicos')
      .upload(`backups/${fileName}`, jsonData, {
        contentType: 'application/json'
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = await supabase.storage
      .from('anexos-medicos')
      .createSignedUrl(`backups/${fileName}`, 604800);

    await supabase
      .from('backup_logs')
      .update({
        status: 'concluido',
        completed_at: new Date().toISOString(),
        arquivo_url: urlData?.signedUrl,
        tamanho_bytes: sizeBytes,
        resultado: {
          tabelas_exportadas: tabelas.length,
          total_registros: Object.values(backupData.data).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
        }
      })
      .eq('id', logData.id);

    return {
      success: true,
      backup_id: logData.id,
      download_url: urlData?.signedUrl,
      size_bytes: sizeBytes
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
  const { backup_data } = params;

  const { data: logData } = await supabase
    .from('backup_logs')
    .insert({
      tipo: 'import',
      status: 'processando',
      user_id: userId,
      parametros: { import_type: 'restore_backup' }
    })
    .select()
    .single();

  try {
    let importedCount = 0;

    // Validar estrutura do backup
    if (!backup_data.metadata || !backup_data.data) {
      throw new Error('Formato de backup inválido');
    }

    // Importar dados (apenas criação, não atualização para segurança)
    if (backup_data.data.pacientes) {
      for (const paciente of backup_data.data.pacientes) {
        const { id, created_at, updated_at, ...pacienteData } = paciente;
        
        // Verificar se já existe
        const { data: existing } = await supabase
          .from('pacientes')
          .select('id')
          .eq('cpf', pacienteData.cpf)
          .single();

        if (!existing) {
          await supabase.from('pacientes').insert(pacienteData);
          importedCount++;
        }
      }
    }

    await supabase
      .from('backup_logs')
      .update({
        status: 'concluido',
        completed_at: new Date().toISOString(),
        resultado: {
          registros_importados: importedCount,
          tipo_backup: backup_data.metadata.type
        }
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
  const { data, error } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return { backups: data };
}

async function downloadBackup(supabase: any, userId: string, backupId: string) {
  const { data: backup, error } = await supabase
    .from('backup_logs')
    .select('*')
    .eq('id', backupId)
    .eq('user_id', userId)
    .single();

  if (error || !backup) {
    throw new Error('Backup não encontrado');
  }

  if (backup.arquivo_url) {
    return { download_url: backup.arquivo_url };
  }

  throw new Error('URL de download não disponível');
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
    // Deletar arquivo do storage se existir
    if (backup.arquivo_url) {
      const fileName = backup.arquivo_url.split('/').pop();
      await supabase.storage
        .from('anexos-medicos')
        .remove([`backups/${fileName}`]);
    }

    // Deletar registro
    await supabase
      .from('backup_logs')
      .delete()
      .eq('id', backup.id);

    deletedCount++;
  }

  return { deleted_count: deletedCount };
}