import React, { useEffect, useState } from 'react';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback } from 'react';
import { format, parseISO } from 'date-fns';

const now = new Date();
const mesAtual = now.getMonth() + 1;
const anoAtual = now.getFullYear();

const AgendaPlantonista: React.FC = () => {
  const { plantoes, escalas: escalasHook, loading } = usePlantoesFinanceiro();
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
    const totalPlantoes = plantoes.filter(p => p.id === escala.id).length;
    if (!totalPlantoes) return null;
    return escala.valor_mensal / totalPlantoes;
  }

  // Pode evoluir para visualização mensal/semanal futuramente

  // Usar plantões do hook
  const plantoesAtivos = plantoes;

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
            {plantoes.length === 0 && <p className="text-gray-500">Nenhum plantão encontrado para este mês.</p>}
            <ul className="divide-y">
              {plantoes.map(p => {
                return (
                  <li key={p.id} className="py-2 flex items-center gap-4">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="font-medium w-24">{p.data}</span>
                    <span className="text-sm text-gray-500 w-48">
                      {p.local}
                    </span>
                    <span className="text-sm text-gray-600">
                      R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-auto">{p.status}</span>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Escalas Fixas</CardTitle>
          </CardHeader>
          <CardContent>
            {escalasHook.length === 0 && <p className="text-gray-500">Nenhuma escala fixa cadastrada.</p>}
            <ul className="divide-y">
              {escalasHook.map(e => (
                <li key={e.id} className="py-2 flex items-center gap-4">
                  <Clock className="w-5 h-5 text-indigo-400" />
                  <span className="font-medium w-24">
                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][e.dia_semana]}
                  </span>
                  <span className="text-sm text-gray-500 w-48">
                    {e.local_nome} | {e.horario_inicio} - {e.horario_fim}
                  </span>
                  <span className="text-sm text-gray-600">R$ {e.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}/mês</span>
                  <span className="text-xs px-2 py-1 rounded bg-gray-100 ml-auto">{e.ativo ? 'Ativo' : 'Inativo'}</span>
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