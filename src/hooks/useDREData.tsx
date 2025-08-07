import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DREData {
  periodo: string;
  receitas: {
    consultas: number;
    exames: number;
    procedimentos: number;
    outros: number;
  };
  custos: {
    materiaisMedicos: number;
    laboratorio: number;
    equipamentos: number;
  };
  despesas: {
    salarios: number;
    aluguel: number;
    utilities: number;
    marketing: number;
    administrativas: number;
    outras: number;
  };
}

export interface DRETotals {
  receitaBruta: number;
  custosVariaveis: number;
  receitaLiquida: number;
  despesasFixas: number;
  lucroLiquido: number;
  margemBruta: number;
  margemLiquida: number;
}

export const useDREData = () => {
  const [dreData, setDREData] = useState<DREData[]>([]);
  const [loading, setLoading] = useState(false);

  const carregarDREData = async (anoInicio: number, anoFim: number) => {
    try {
      setLoading(true);

      // Buscar transações por período
      const { data: transacoes, error } = await supabase
        .from('transacoes_financeiras')
        .select('*')
        .gte('data', `${anoInicio}-01-01`)
        .lte('data', `${anoFim}-12-31`)
        .eq('status', 'realizado');

      if (error) throw error;

      // Agrupar por mês e categoria
      const dreDataMap = new Map<string, DREData>();

      transacoes?.forEach(transacao => {
        const periodo = transacao.data.substring(0, 7); // YYYY-MM
        
        if (!dreDataMap.has(periodo)) {
          dreDataMap.set(periodo, {
            periodo,
            receitas: {
              consultas: 0,
              exames: 0,
              procedimentos: 0,
              outros: 0
            },
            custos: {
              materiaisMedicos: 0,
              laboratorio: 0,
              equipamentos: 0
            },
            despesas: {
              salarios: 0,
              aluguel: 0,
              utilities: 0,
              marketing: 0,
              administrativas: 0,
              outras: 0
            }
          });
        }

        const dreItem = dreDataMap.get(periodo)!;

        if (transacao.tipo === 'entrada') {
          // Mapear categorias de receita
          switch (transacao.categoria.toLowerCase()) {
            case 'consultas':
              dreItem.receitas.consultas += transacao.valor;
              break;
            case 'exames':
              dreItem.receitas.exames += transacao.valor;
              break;
            case 'procedimentos':
              dreItem.receitas.procedimentos += transacao.valor;
              break;
            default:
              dreItem.receitas.outros += transacao.valor;
          }
        } else {
          // Mapear categorias de custos e despesas
          switch (transacao.categoria.toLowerCase()) {
            case 'materiais médicos':
            case 'materiais':
              dreItem.custos.materiaisMedicos += transacao.valor;
              break;
            case 'laboratório':
            case 'laboratorio':
              dreItem.custos.laboratorio += transacao.valor;
              break;
            case 'equipamentos':
              dreItem.custos.equipamentos += transacao.valor;
              break;
            case 'salários':
            case 'salarios':
              dreItem.despesas.salarios += transacao.valor;
              break;
            case 'aluguel':
              dreItem.despesas.aluguel += transacao.valor;
              break;
            case 'utilities':
            case 'energia':
            case 'água':
            case 'internet':
              dreItem.despesas.utilities += transacao.valor;
              break;
            case 'marketing':
              dreItem.despesas.marketing += transacao.valor;
              break;
            case 'despesas administrativas':
            case 'administrativas':
              dreItem.despesas.administrativas += transacao.valor;
              break;
            default:
              dreItem.despesas.outras += transacao.valor;
          }
        }
      });

      const dreDataArray = Array.from(dreDataMap.values())
        .sort((a, b) => b.periodo.localeCompare(a.periodo));

      setDREData(dreDataArray);
    } catch (error) {
      console.error('Erro ao carregar dados DRE:', error);
      toast.error('Erro ao carregar dados do DRE');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotais = (data: DREData): DRETotals => {
    const receitaBruta = Object.values(data.receitas).reduce((sum, value) => sum + value, 0);
    const custosVariaveis = Object.values(data.custos).reduce((sum, value) => sum + value, 0);
    const receitaLiquida = receitaBruta - custosVariaveis;
    const despesasFixas = Object.values(data.despesas).reduce((sum, value) => sum + value, 0);
    const lucroLiquido = receitaLiquida - despesasFixas;
    
    const margemBruta = receitaBruta > 0 ? (receitaLiquida / receitaBruta) * 100 : 0;
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
    
    return {
      receitaBruta,
      custosVariaveis,
      receitaLiquida,
      despesasFixas,
      lucroLiquido,
      margemBruta,
      margemLiquida
    };
  };

  const calcularCrescimento = (atual: number, anterior: number): number => {
    if (anterior === 0) return 0;
    return ((atual - anterior) / anterior) * 100;
  };

  useEffect(() => {
    const anoAtual = new Date().getFullYear();
    carregarDREData(anoAtual - 1, anoAtual);
  }, []);

  return {
    dreData,
    loading,
    carregarDREData,
    calcularTotais,
    calcularCrescimento
  };
};