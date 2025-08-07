import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface TransacaoFinanceira {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  forma_pagamento: string;
  status: 'realizado' | 'pendente' | 'cancelado';
  paciente_id?: string;
  medico_id?: string;
  consulta_id?: string;
  created_at: string;
  updated_at: string;
}

export interface NovaTransacao {
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  forma_pagamento: string;
  paciente_id?: string;
  medico_id?: string;
  consulta_id?: string;
}

export const useTransacoesFinanceiras = () => {
  const [transacoes, setTransacoes] = useState<TransacaoFinanceira[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarTransacoes = async (mesAno?: string) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('transacoes_financeiras')
        .select(`
          *,
          pacientes(nome),
          profiles(nome)
        `)
        .order('data', { ascending: false });

      if (mesAno) {
        const [ano, mes] = mesAno.split('-');
        query = query
          .gte('data', `${ano}-${mes}-01`)
          .lt('data', `${ano}-${parseInt(mes) + 1}-01`);
      }

      const { data, error } = await query;

      if (error) throw error;

      const transacoesFormatadas = data?.map(item => ({
        id: item.id,
        tipo: item.tipo,
        descricao: item.descricao,
        valor: item.valor,
        categoria: item.categoria,
        data: item.data,
        forma_pagamento: item.forma_pagamento,
        status: item.status,
        paciente_id: item.paciente_id,
        medico_id: item.medico_id,
        consulta_id: item.consulta_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        paciente_nome: (item.pacientes as any)?.nome,
        medico_nome: (item.profiles as any)?.nome
      })) || [];

      setTransacoes(transacoesFormatadas);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      toast.error('Erro ao carregar transações financeiras');
    } finally {
      setLoading(false);
    }
  };

  const criarTransacao = async (novaTransacao: NovaTransacao) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('transacoes_financeiras')
        .insert([{
          tipo: novaTransacao.tipo,
          descricao: novaTransacao.descricao,
          valor: novaTransacao.valor,
          categoria: novaTransacao.categoria,
          data: novaTransacao.data,
          forma_pagamento: novaTransacao.forma_pagamento,
          status: 'realizado',
          paciente_id: novaTransacao.paciente_id,
          medico_id: novaTransacao.medico_id,
          consulta_id: novaTransacao.consulta_id
        }])
        .select()
        .single();

      if (error) throw error;

      toast.success('Transação criada com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast.error('Erro ao criar transação');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const atualizarStatusTransacao = async (transacaoId: string, status: string) => {
    try {
      setLoading(true);

      const { error } = await supabase
        .from('transacoes_financeiras')
        .update({ status })
        .eq('id', transacaoId);

      if (error) throw error;

      setTransacoes(prev => prev.map(t => 
        t.id === transacaoId 
          ? { ...t, status: status as any }
          : t
      ));

      toast.success('Status da transação atualizado!');
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      toast.error('Erro ao atualizar status da transação');
    } finally {
      setLoading(false);
    }
  };

  const obterResumoFinanceiro = (mesAno: string) => {
    const transacoesMes = transacoes.filter(t => t.data.startsWith(mesAno));
    
    const totalEntradas = transacoesMes
      .filter(t => t.tipo === 'entrada' && t.status === 'realizado')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const totalSaidas = transacoesMes
      .filter(t => t.tipo === 'saida' && t.status === 'realizado')
      .reduce((sum, t) => sum + t.valor, 0);
    
    const saldoLiquido = totalEntradas - totalSaidas;
    
    const transacoesPendentes = transacoesMes
      .filter(t => t.status === 'pendente')
      .length;

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      transacoesPendentes
    };
  };

  return {
    transacoes,
    loading,
    carregarTransacoes,
    criarTransacao,
    atualizarStatusTransacao,
    obterResumoFinanceiro
  };
};