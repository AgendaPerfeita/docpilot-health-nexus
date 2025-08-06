import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BackupLog {
  id: string;
  tipo: 'export_completo' | 'export_seletivo' | 'import' | 'restore';
  status: 'iniciado' | 'processando' | 'concluido' | 'erro';
  parametros?: any;
  resultado?: any;
  arquivo_url?: string;
  tamanho_bytes?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
}

export interface BackupConfig {
  backup_automatico: boolean;
  frequencia: 'diario' | 'semanal' | 'mensal';
  horario: string;
  retencao_dias: number;
  incluir_anexos: boolean;
  incluir_imagens: boolean;
  compressao: boolean;
  notificar_email: boolean;
}

export function useBackup() {
  const [loading, setLoading] = useState(false);
  const [backups, setBackups] = useState<BackupLog[]>([]);
  const [config, setConfig] = useState<BackupConfig | null>(null);

  const callBackupFunction = async (action: string, params: any = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('backup-system', {
        body: { action, ...params }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error(`Erro em ${action}:`, error);
      throw new Error(error.message || `Erro ao executar ${action}`);
    }
  };

  const exportarCompleto = async () => {
    setLoading(true);
    try {
      toast.info('Iniciando backup completo...', {
        description: 'Isso pode levar alguns minutos dependendo da quantidade de dados.'
      });

      const result = await callBackupFunction('export_completo');
      
      toast.success('Backup completo criado com sucesso!', {
        description: `${(result.size_bytes / 1024 / 1024).toFixed(2)} MB - ${result.summary.total_pacientes} pacientes, ${result.summary.total_consultas} consultas`
      });

      await listarBackups();
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar backup completo', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const exportarSeletivo = async (params: {
    tabelas: string[];
    data_inicio?: string;
    data_fim?: string;
  }) => {
    setLoading(true);
    try {
      toast.info('Iniciando backup seletivo...');

      const result = await callBackupFunction('export_seletivo', params);
      
      toast.success('Backup seletivo criado com sucesso!', {
        description: `${(result.size_bytes / 1024 / 1024).toFixed(2)} MB`
      });

      await listarBackups();
      return result;
    } catch (error: any) {
      toast.error('Erro ao criar backup seletivo', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const importarDados = async (backupData: any) => {
    setLoading(true);
    try {
      toast.info('Importando dados...', {
        description: 'Verificando e inserindo novos registros.'
      });

      const result = await callBackupFunction('import_dados', {
        backup_data: backupData
      });
      
      toast.success('Dados importados com sucesso!', {
        description: `${result.imported_count} registros importados`
      });

      await listarBackups();
      return result;
    } catch (error: any) {
      toast.error('Erro ao importar dados', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const listarBackups = async () => {
    try {
      const result = await callBackupFunction('listar_backups');
      setBackups(result.backups);
      return result.backups;
    } catch (error: any) {
      toast.error('Erro ao listar backups', {
        description: error.message
      });
      throw error;
    }
  };

  const downloadBackup = async (backupId: string) => {
    try {
      const result = await callBackupFunction('download_backup', { backup_id: backupId });
      
      if (result.download_url) {
        // Abrir URL em nova aba para download
        window.open(result.download_url, '_blank');
        toast.success('Download iniciado!');
      }
      
      return result;
    } catch (error: any) {
      toast.error('Erro ao baixar backup', {
        description: error.message
      });
      throw error;
    }
  };

  const limparBackupsAntigos = async () => {
    setLoading(true);
    try {
      const result = await callBackupFunction('cleanup_antigos');
      
      toast.success('Limpeza concluída!', {
        description: `${result.deleted_count} backups antigos removidos`
      });

      await listarBackups();
      return result;
    } catch (error: any) {
      toast.error('Erro na limpeza', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracao = async (novaConfig: Partial<BackupConfig>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('backup_configuracoes')
        .upsert({ 
          user_id: (await supabase.auth.getUser()).data.user?.id,
          ...novaConfig,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setConfig(data as BackupConfig);
      toast.success('Configuração salva com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao salvar configuração', {
        description: error.message
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const carregarConfiguracao = async () => {
    try {
      const { data, error } = await supabase
        .from('backup_configuracoes')
        .select('*')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      setConfig((data as BackupConfig) || {
        backup_automatico: true,
        frequencia: 'diario' as const,
        horario: '02:00:00',
        retencao_dias: 30,
        incluir_anexos: true,
        incluir_imagens: true,
        compressao: true,
        notificar_email: true
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao carregar configuração:', error);
      return null;
    }
  };

  return {
    loading,
    backups,
    config,
    exportarCompleto,
    exportarSeletivo,
    importarDados,
    listarBackups,
    downloadBackup,
    limparBackupsAntigos,
    salvarConfiguracao,
    carregarConfiguracao
  };
}