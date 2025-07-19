import React, { useEffect, useState } from 'react';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';

const now = new Date();
const mesAtual = now.getMonth() + 1;
const anoAtual = now.getFullYear();

const AgendaPlantonista: React.FC = () => {
  const { plantoesFixos, plantoesCoringa, loading } = usePlantoesFinanceiro(mesAtual, anoAtual);
  const [mes, setMes] = useState(mesAtual);
  const [ano, setAno] = useState(anoAtual);
  const [escalas, setEscalas] = useState<any[]>([]);
  const [locais, setLocais] = useState<any[]>([]);
  const { profile } = useAuth();

  // Buscar escalas fixas do usuário para o mês
  const fetchEscalas = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('plantonista_escala_fixa')
      .select('id, valor_mensal, horario_inicio, horario_fim')
      .eq('medico_id', profile.id);
    setEscalas(data || []);
  }, [profile]);

  // Buscar locais de trabalho do usuário
  const fetchLocais = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('plantonista_locais_trabalho')
      .select('id, nome')
      .eq('medico_id', profile.id);
    setLocais(data || []);
  }, [profile]);

  useEffect(() => {
    fetchEscalas();
    fetchLocais();
  }, [fetchEscalas, fetchLocais, mes, ano]);

  // Função para calcular o valor do plantão fixo
  function calcularValorPlantaoFixo(plantao: any) {
    const escala = escalas.find(e => e.id === plantao.escala_fixa_id);
    if (!escala) return null;
    // Contar quantos plantões fixos existem para essa escala no mês
    const totalPlantoes = plantoesFixos.filter(p => p.escala_fixa_id === escala.id).length;
    if (!totalPlantoes) return null;
    return escala.valor_mensal / totalPlantoes;
  }

  // Pode evoluir para visualização mensal/semanal futuramente

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-7 h-7 text-blue-600" /> Agenda de Plantões
        </h1>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Plantões Fixos</CardTitle>
          </CardHeader>
          <CardContent>
            {plantoesFixos.length === 0 && <p className="text-gray-500">Nenhum plantão fixo encontrado para este mês.</p>}
            <ul className="divide-y">
              {plantoesFixos.map(p => {
                const valor = calcularValorPlantaoFixo(p);
                const escala = escalas.find(e => e.id === p.escala_fixa_id);
                const local = locais.find(l => l.id === p.local_id);
                return (
                  <li key={p.id} className="py-2 flex items-center gap-4">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">{new Date(p.data).toLocaleDateString('pt-BR')}</span>
                    <span className="text-sm text-gray-600">
                      {valor !== null ? `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '--'}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-auto">{p.status_pagamento}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {local ? local.nome : '--'}
                      {escala ? ` | ${escala.horario_inicio?.slice(0,5)} - ${escala.horario_fim?.slice(0,5)}` : ''}
                    </span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Plantões Coringa</CardTitle>
          </CardHeader>
          <CardContent>
            {plantoesCoringa.length === 0 && <p className="text-gray-500">Nenhum plantão coringa encontrado para este mês.</p>}
            <ul className="divide-y">
              {plantoesCoringa.map(p => (
                <li key={p.id} className="py-2 flex items-center gap-4">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium">{new Date(p.data).toLocaleDateString('pt-BR')}</span>
                  <span className="text-sm text-gray-600">R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-auto">{p.status_pagamento}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AgendaPlantonista; 