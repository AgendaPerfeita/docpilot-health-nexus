import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface AuditoriaLog {
  id: string;
  documento_id: string;
  acao: 'criado' | 'assinado' | 'visualizado' | 'download' | 'compartilhado';
  usuario_id?: string;
  usuario_tipo?: 'medico' | 'paciente' | 'clinica' | 'staff';
  dados_contexto?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: string;
  created_at: string;
}

export const useAuditoria = () => {
  const { profile } = useAuth();
  const [logs, setLogs] = useState<AuditoriaLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAuditoriaLogs = async (documentoId?: string) => {
    if (!profile) return;

    setLoading(true);
    try {
      let query = supabase
        .from('documentos_auditoria')
        .select('*')
        .order('timestamp', { ascending: false });

      if (documentoId) {
        query = query.eq('documento_id', documentoId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setLogs(data || []);
    } catch (error) {
      console.error('Erro ao buscar logs de auditoria:', error);
    } finally {
      setLoading(false);
    }
  };

  const logVisualizacao = async (documentoId: string, contextData?: any) => {
    try {
      const { error } = await supabase.rpc('log_documento_visualization', {
        documento_id_param: documentoId,
        usuario_id_param: profile?.user_id,
        context_data: contextData
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar visualização:', error);
    }
  };

  const logDownload = async (documentoId: string, fileName?: string) => {
    try {
      const { error } = await supabase.rpc('log_documento_download', {
        documento_id_param: documentoId,
        usuario_id_param: profile?.user_id,
        file_name: fileName
      });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao registrar download:', error);
    }
  };

  const logCompartilhamento = async (documentoId: string, contextData?: any) => {
    try {
      const { data, error } = await supabase
        .from('documentos_auditoria')
        .insert({
          documento_id: documentoId,
          acao: 'compartilhado',
          usuario_id: profile?.user_id,
          usuario_tipo: profile?.tipo,
          dados_contexto: contextData
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao registrar compartilhamento:', error);
    }
  };

  const getLogsSummary = (documentoId: string) => {
    const documentLogs = logs.filter(log => log.documento_id === documentoId);
    
    return {
      totalVisualizacoes: documentLogs.filter(log => log.acao === 'visualizado').length,
      totalDownloads: documentLogs.filter(log => log.acao === 'download').length,
      ultimaVisualizacao: documentLogs.find(log => log.acao === 'visualizado')?.timestamp,
      ultimoDownload: documentLogs.find(log => log.acao === 'download')?.timestamp,
      compartilhamentos: documentLogs.filter(log => log.acao === 'compartilhado').length
    };
  };

  const getSecurityAlerts = () => {
    // Analisar padrões suspeitos nos logs
    const alerts = [];
    
    // Múltiplos downloads em pouco tempo
    const recentDownloads = logs.filter(log => 
      log.acao === 'download' && 
      new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // últimos 5 minutos
    );
    
    if (recentDownloads.length > 5) {
      alerts.push({
        type: 'warning',
        message: `${recentDownloads.length} downloads realizados nos últimos 5 minutos`,
        timestamp: new Date().toISOString()
      });
    }

    // Visualizações de múltiplos IPs
    const uniqueIPs = new Set(logs.map(log => log.ip_address).filter(Boolean));
    if (uniqueIPs.size > 10) {
      alerts.push({
        type: 'info',
        message: `Documentos acessados de ${uniqueIPs.size} IPs diferentes`,
        timestamp: new Date().toISOString()
      });
    }

    return alerts;
  };

  useEffect(() => {
    if (profile) {
      fetchAuditoriaLogs();
    }
  }, [profile]);

  return {
    logs,
    loading,
    fetchAuditoriaLogs,
    logVisualizacao,
    logDownload,
    logCompartilhamento,
    getLogsSummary,
    getSecurityAlerts
  };
};