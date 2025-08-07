import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DashboardData {
  totalPatients: number;
  newPatientsThisMonth: number;
  totalRevenue: number;
  averageTicket: number;
  appointmentsThisMonth: number;
  conversionRate: number;
  patientsGrowth: number;
  revenueGrowth: number;
  appointmentsGrowth: number;
  ticketGrowth: number;
}

export interface SpecialtyData {
  name: string;
  count: number;
  percentage: number;
}

export interface OriginData {
  source: string;
  percentage: number;
  count: number;
}

export const useRelatoriosData = () => {
  const { profile } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [specialtyData, setSpecialtyData] = useState<SpecialtyData[]>([]);
  const [originData, setOriginData] = useState<OriginData[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarDashboard = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const currentMonth = new Date();
      currentMonth.setDate(1);
      const lastMonth = new Date(currentMonth);
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      // Buscar pacientes do usuário
      let pacientesQuery;
      if (profile.tipo === 'medico') {
        const { data: pacientesIds } = await supabase
          .rpc('get_paciente_ids_medico', { medico_id_param: profile.id });
        pacientesQuery = supabase
          .from('pacientes')
          .select('*')
          .in('id', pacientesIds || []);
      } else {
        const { data: pacientesIds } = await supabase
          .rpc('get_paciente_ids_clinica', { clinica_id_param: profile.id });
        pacientesQuery = supabase
          .from('pacientes')
          .select('*')
          .in('id', pacientesIds || []);
      }

      const { data: pacientes } = await pacientesQuery;

      // Calcular total de pacientes
      const totalPatients = pacientes?.length || 0;

      // Pacientes novos este mês
      const newPatientsThisMonth = pacientes?.filter(p => 
        new Date(p.created_at) >= currentMonth
      ).length || 0;

      // Pacientes novos mês anterior
      const newPatientsLastMonth = pacientes?.filter(p => {
        const createdAt = new Date(p.created_at);
        return createdAt >= lastMonth && createdAt < currentMonth;
      }).length || 0;

      // Crescimento de pacientes
      const patientsGrowth = newPatientsLastMonth > 0 
        ? ((newPatientsThisMonth - newPatientsLastMonth) / newPatientsLastMonth) * 100 
        : 0;

      // Buscar consultas
      const { data: consultas } = await supabase
        .from('consultas')
        .select('*')
        .eq(profile.tipo === 'medico' ? 'medico_id' : 'clinica_id', profile.id);

      // Consultas este mês
      const appointmentsThisMonth = consultas?.filter(c => 
        new Date(c.data_consulta) >= currentMonth
      ).length || 0;

      // Consultas mês anterior
      const appointmentsLastMonth = consultas?.filter(c => {
        const consultaDate = new Date(c.data_consulta);
        return consultaDate >= lastMonth && consultaDate < currentMonth;
      }).length || 0;

      // Crescimento de consultas
      const appointmentsGrowth = appointmentsLastMonth > 0 
        ? ((appointmentsThisMonth - appointmentsLastMonth) / appointmentsLastMonth) * 100 
        : 0;

      // Receita total e ticket médio
      const consultasComValor = consultas?.filter(c => c.valor) || [];
      const totalRevenue = consultasComValor.reduce((sum, c) => sum + (c.valor || 0), 0);
      const averageTicket = consultasComValor.length > 0 
        ? totalRevenue / consultasComValor.length 
        : 0;

      // Receita mês anterior para comparação
      const consultasLastMonth = consultas?.filter(c => {
        const consultaDate = new Date(c.data_consulta);
        return consultaDate >= lastMonth && consultaDate < currentMonth && c.valor;
      }) || [];

      const revenueLastMonth = consultasLastMonth.reduce((sum, c) => sum + (c.valor || 0), 0);
      const ticketLastMonth = consultasLastMonth.length > 0 
        ? revenueLastMonth / consultasLastMonth.length 
        : 0;

      const revenueGrowth = revenueLastMonth > 0 
        ? ((totalRevenue - revenueLastMonth) / revenueLastMonth) * 100 
        : 0;

      const ticketGrowth = ticketLastMonth > 0 
        ? ((averageTicket - ticketLastMonth) / ticketLastMonth) * 100 
        : 0;

      // Taxa de conversão simulada (pode ser calculada com dados reais de leads)
      const conversionRate = 68.5;

      setDashboardData({
        totalPatients,
        newPatientsThisMonth,
        totalRevenue,
        averageTicket,
        appointmentsThisMonth,
        conversionRate,
        patientsGrowth,
        revenueGrowth,
        appointmentsGrowth,
        ticketGrowth
      });

      // Carregar dados de especialidades
      await carregarEspecialidades();
      
      // Carregar origem dos pacientes
      await carregarOrigemPacientes();

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEspecialidades = async () => {
    if (!profile?.id) return;

    try {
      // Buscar consultas com dados do médico
      const { data: consultas } = await supabase
        .from('consultas')
        .select('*')
        .eq(profile.tipo === 'medico' ? 'medico_id' : 'clinica_id', profile.id);

      // Buscar perfis dos médicos para pegar especialidades
      const medicoIds = [...new Set(consultas?.map(c => c.medico_id))];
      const { data: medicos } = await supabase
        .from('profiles')
        .select('id, especialidade')
        .in('id', medicoIds);

      const especialidadeCount: { [key: string]: number } = {};
      const total = consultas?.length || 0;

      consultas?.forEach(consulta => {
        const medico = medicos?.find(m => m.id === consulta.medico_id);
        const especialidade = medico?.especialidade || 'Clínica Geral';
        especialidadeCount[especialidade] = (especialidadeCount[especialidade] || 0) + 1;
      });

      const specialtyData = Object.entries(especialidadeCount).map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      })).sort((a, b) => b.count - a.count);

      setSpecialtyData(specialtyData);
    } catch (error) {
      console.error('Erro ao carregar especialidades:', error);
    }
  };

  const carregarOrigemPacientes = async () => {
    if (!profile?.id) return;

    try {
      let pacientesQuery;
      if (profile.tipo === 'medico') {
        const { data: pacientesIds } = await supabase
          .rpc('get_paciente_ids_medico', { medico_id_param: profile.id });
        pacientesQuery = supabase
          .from('pacientes')
          .select('origem')
          .in('id', pacientesIds || []);
      } else {
        const { data: pacientesIds } = await supabase
          .rpc('get_paciente_ids_clinica', { clinica_id_param: profile.id });
        pacientesQuery = supabase
          .from('pacientes')
          .select('origem')
          .in('id', pacientesIds || []);
      }

      const { data: pacientes } = await pacientesQuery;

      const origemCount: { [key: string]: number } = {};
      const total = pacientes?.length || 0;

      pacientes?.forEach(paciente => {
        const origem = paciente.origem || 'Não informado';
        origemCount[origem] = (origemCount[origem] || 0) + 1;
      });

      const originData = Object.entries(origemCount).map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      })).sort((a, b) => b.count - a.count);

      setOriginData(originData);
    } catch (error) {
      console.error('Erro ao carregar origem dos pacientes:', error);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, [profile?.id]);

  return {
    dashboardData,
    specialtyData,
    originData,
    loading,
    carregarDashboard
  };
};