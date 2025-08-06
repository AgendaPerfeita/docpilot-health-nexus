import React, { useState, useEffect } from 'react';
import { MapPin,
  Plus,
  Edit,
  Trash2,
  Building,
  Clock,
  Users,
  Star,
  Phone,
  Mail,
  Globe,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';

const tiposLocal = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'clinica', label: 'Clínica' },
  { value: 'upa', label: 'UPA' },
  { value: 'ubs', label: 'UBS' },
  { value: 'outro', label: 'Outro' }
];

// Funções utilitárias para moeda
function formatarMoedaBR(valor: string | number) {
  if (valor === '' || valor === null || valor === undefined) return '';
  const num = typeof valor === 'number' ? valor : Number(valor);
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function desformatarMoedaBR(valor: string) {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

const now = new Date();
const mesAtual = now.getMonth() + 1;
const anoAtual = now.getFullYear();

const LocaisTrabalho: React.FC = () => {
  const { profile } = useAuth();
  const [locais, setLocais] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: '',
    tipo: 'clinica',
    endereco: '',
    telefone: '',
    email: '',
    regra: 'fixo', // 'fixo' ou 'faixa'
    faixas: [{ atendimentos: '', valor: '' }],
    status: 'ativo'
  });
  const [contabilidade, setContabilidade] = useState<'todas_semanas' | 'media_mensal'>('todas_semanas');
  const [salvando, setSalvando] = useState(false);
  const { plantoes, escalas } = usePlantoesFinanceiro();
  const [statusFiltro, setStatusFiltro] = useState<'todos' | 'ativo' | 'inativo'>('ativo');

  // Buscar locais do usuário
  const fetchLocais = async () => {
    if (!profile) return;
    const { data } = await supabase.from('plantonista_locais_trabalho').select('*').eq('medico_id', profile.id);
    setLocais(data || []);
  };
  useEffect(() => {
    fetchLocais();
  }, [profile]);

  // Função para salvar local
  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    try {
      let payload: any = {
        ...form,
        medico_id: profile.id,
        regra: form.regra as 'fixo' | 'faixa',
        faixas: form.regra === 'faixa'
          ? form.faixas.map(fx => ({
              ...fx,
              valor: String(desformatarMoedaBR(fx.valor) || 0),
              atendimentos: String(fx.atendimentos || '')
            }))
           : [{ atendimentos: '0', valor: String(desformatarMoedaBR(form.faixas[0]?.valor || '0')) }],
      };
      if (form.regra === 'faixa') {
        payload.contabilidade = contabilidade;
      }
      // Remover campos não existentes na tabela
      if (form.regra === 'faixa') {
        payload = { ...payload, contabilidade };
      }
      // Não envie contabilidade se não for faixa
      console.log('Payload enviado para Supabase:', payload);
      if (editId) {
        // --- BLOCO DE EDIÇÃO ---
        let valorAntigo = null;
        // Buscar local antigo para comparar valor e faixas
        const { data: localAntigo } = await supabase.from('plantonista_locais_trabalho').select('*').eq('id', editId).single();
        valorAntigo = localAntigo?.faixas?.[0]?.valor || null;
        const faixasAntigas = JSON.stringify(localAntigo?.faixas || []);
        await supabase.from('plantonista_locais_trabalho').update(payload).eq('id', editId);
        // Se o valor foi alterado (fixo) OU faixas foram alteradas (faixa), atualizar plantões futuros
        const valorNovo = payload.faixas[0].valor;
        const faixasNovas = JSON.stringify(payload.faixas || []);
        const regraNova = payload.regra;
        const regraAntiga = localAntigo?.regra;
        if (
          (valorAntigo !== null && valorNovo !== valorAntigo && regraNova === 'fixo') ||
          (regraNova === 'faixa' && (faixasAntigas !== faixasNovas || regraAntiga !== regraNova))
        ) {
          // Buscar escalas fixas desse local
          const { data: escalas } = await supabase.from('plantonista_escala_fixa').select('id, valor_mensal').eq('local_id', editId);
          if (escalas && escalas.length > 0) {
            const hoje = new Date().toISOString().slice(0, 10);
            // Para regra de faixa, usar a maior faixa cadastrada como valor mensal (simulação)
            let valorFaixaMaior = 0;
            if (regraNova === 'faixa' && payload.faixas.length > 0) {
              valorFaixaMaior = Math.max(...payload.faixas.map((f: any) => Number(f.valor) || 0));
            }
            for (const escala of escalas) {
              // Atualizar valor_mensal da escala
              const novoValorMensal = regraNova === 'faixa' ? valorFaixaMaior : Number(valorNovo);
              await supabase.from('plantonista_escala_fixa').update({ valor_mensal: novoValorMensal }).eq('id', escala.id);
              // Buscar plantões futuros dessa escala
              const { data: plantoes } = await supabase.from('plantonista_plantao_fixo_realizado').select('id, data').eq('escala_fixa_id', escala.id).gte('data', hoje);
              if (plantoes && plantoes.length > 0) {
                // Recalcular valor de cada plantão do mês
                for (const plantao of plantoes) {
                  const mesAno = plantao.data.slice(0, 7); // yyyy-mm
                  const { data: plantoesMes } = await supabase.from('plantonista_plantao_fixo_realizado').select('id').eq('escala_fixa_id', escala.id).like('data', `${mesAno}-%`);
                  const totalPlantoesNoMes = plantoesMes ? plantoesMes.length : 1;
                  const valorPorPlantao = totalPlantoesNoMes > 0 ? novoValorMensal / totalPlantoesNoMes : 0;
                  await supabase.from('plantonista_plantao_fixo_realizado').update({ valor: valorPorPlantao }).eq('id', plantao.id);
                }
              }
            }
          }
        }
        // Chamar recálculo automático ao salvar edição
        await handleRecalcularPlantoesFuturos({ id: editId, ...payload });
        await fetchLocais();
      } else {
        // --- BLOCO DE CRIAÇÃO ---
        await supabase.from('plantonista_locais_trabalho').insert(payload);
        await fetchLocais();
      }
      setModalOpen(false);
      setEditId(null);
      setForm({ nome: '', tipo: 'clinica', endereco: '', telefone: '', email: '', regra: 'fixo', faixas: [{ atendimentos: '', valor: '' }], status: 'ativo' });
    } finally {
      setSalvando(false);
    }
  }

  // Função para editar local
  function handleEditar(local: any) {
    setEditId(local.id);
    setForm({
      nome: local.nome,
      tipo: local.tipo,
      endereco: local.endereco || '',
      telefone: local.telefone || '',
      email: local.email || '',
      regra: local.regra || 'fixo',
      faixas: local.faixas || [{ atendimentos: '', valor: '' }],
      status: local.status || 'ativo'
    });
    setContabilidade(local.contabilidade || 'todas_semanas');
    setModalOpen(true);
  }

  // Função para desativar local
  async function handleDesativar(localId: string) {
    await supabase.from('plantonista_locais_trabalho').update({ status: 'inativo' }).eq('id', localId);
    await fetchLocais();
  }

  // Função para calcular valor do plantão e plantões/mês
  function getValorEPlantoes(local: any) {
    // Usar plantões do hook
    const plantoesLocal = plantoes.filter(p => p.local === local.nome);
    // Total de plantões
    const plantoesMes = plantoesLocal.length;
    // Soma dos valores
    const valorTotal = plantoesLocal.reduce((acc, p) => acc + (Number(p.valor) || 0), 0);
    // Valor médio do plantão
    const valorMedio = plantoesMes > 0 ? valorTotal / plantoesMes : 0;
    return {
      valor: valorMedio,
      plantoesMes,
    };
  }

  // Função para recalcular valores dos plantões futuros manualmente
  async function handleRecalcularPlantoesFuturos(local: any) {
    const regraAtual = local.regra;
    const faixas = local.faixas || [];
    const valorFixo = faixas[0]?.valor || 0;
    let valorMensal = regraAtual === 'faixa' && faixas.length > 0
      ? Math.max(...faixas.map((f: any) => Number(f.valor) || 0))
      : Number(valorFixo);
    // Buscar todas as escalas do local
    const { data: escalas } = await supabase.from('plantonista_escala_fixa').select('id').eq('local_id', local.id);
    console.log('[Recalcular] Escalas encontradas para o local', local.id, escalas);
    if (escalas && escalas.length > 0) {
      const hoje = new Date().toISOString().slice(0, 10);
      for (const escala of escalas) {
        // Buscar todos os plantões futuros dessa escala
        const { data: plantoesFuturos } = await supabase
          .from('plantonista_plantao_fixo_realizado')
          .select('id, data')
          .eq('escala_fixa_id', escala.id)
          .gte('data', hoje);
        console.log(`[Recalcular] Escala ${escala.id} - Plantões futuros encontrados:`, plantoesFuturos);
        if (plantoesFuturos && plantoesFuturos.length > 0) {
          // Agrupar plantões futuros por mês (YYYY-MM)
          const plantoesFuturosPorMes: Record<string, any[]> = {};
          for (const plantao of plantoesFuturos) {
            const mesAno = plantao.data.slice(0, 7); // yyyy-mm
            if (!plantoesFuturosPorMes[mesAno]) plantoesFuturosPorMes[mesAno] = [];
            plantoesFuturosPorMes[mesAno].push(plantao);
          }
          // Para cada mês, buscar todos os plantões do mês/escala (futuros e passados)
          for (const mesAno in plantoesFuturosPorMes) {
            // Buscar todos os plantões do mês/escala (usando intervalo de datas)
            const inicioMes = `${mesAno}-01`;
            const fimMes = `${mesAno}-31`;
            const { data: plantoesMesTodos } = await supabase
              .from('plantonista_plantao_fixo_realizado')
              .select('id')
              .eq('escala_fixa_id', escala.id)
              .gte('data', inicioMes)
              .lte('data', fimMes);
            const totalPlantoesNoMes = plantoesMesTodos ? plantoesMesTodos.length : 1;
            const valorPorPlantao = totalPlantoesNoMes > 0 ? valorMensal / totalPlantoesNoMes : 0;
            const plantaoIdsFuturos = plantoesFuturosPorMes[mesAno].map(p => p.id);
            console.log(`[Recalcular] Escala ${escala.id} - Mês ${mesAno} - Atualizando plantões futuros:`, plantaoIdsFuturos, 'Valor por plantão:', valorPorPlantao, 'Total plantões no mês:', totalPlantoesNoMes);
            await supabase.from('plantonista_plantao_fixo_realizado').update({ valor: valorPorPlantao }).in('id', plantaoIdsFuturos);
          }
        } else {
          console.log(`[Recalcular] Escala ${escala.id} - Nenhum plantão futuro encontrado.`);
        }
      }
    } else {
      console.log('[Recalcular] Nenhuma escala encontrada para o local', local.id);
    }
    // Atualizar valor_mensal das escalas do local
    await supabase.from('plantonista_escala_fixa').update({ valor_mensal: valorMensal }).eq('local_id', local.id);
    await fetchLocais();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🏢 Locais de Trabalho</h1>
            <p className="text-gray-600">Gestão de locais onde você atua como plantonista</p>
          </div>
          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditId(null); setForm({ nome: '', tipo: 'clinica', endereco: '', telefone: '', email: '', regra: 'fixo', faixas: [{ atendimentos: '', valor: '' }], status: 'ativo' }); }}>Novo Local</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editId ? 'Editar Local' : 'Novo Local'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSalvar} className="space-y-3">
                <div>
                  <Label>Nome do Local</Label>
                  <Input value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} required />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v }))}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposLocal.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Endereço (opcional)</Label>
                  <Input value={form.endereco} onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
                </div>
                <div>
                  <Label>Telefone (opcional)</Label>
                  <Input value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
                </div>
                <div>
                  <Label>Email (opcional)</Label>
                  <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Regra de Cálculo do Valor do Plantão</Label>
                  <Select value={form.regra} onValueChange={v => setForm(f => ({ ...f, regra: v }))}>
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixo">Valor fixo mensal</SelectItem>
                      <SelectItem value="faixa">Por faixa de atendimentos semanais</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {form.regra === 'faixa' && (
                  <div className="space-y-2">
                    <Label>Faixas de atendimentos por semana (ex: 30 = R$3.000, 60 = R$5.000)</Label>
                    {form.faixas.map((faixa, i) => (
                      <div key={i} className="flex gap-2 mb-1 items-center">
                        <Input type="number" placeholder="Atendimentos" value={faixa.atendimentos} onChange={e => setForm(f => ({ ...f, faixas: f.faixas.map((fx, j) => j === i ? { ...fx, atendimentos: e.target.value } : fx) }))} required />
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">R$</span>
                          <Input
                            inputMode="numeric"
                            placeholder="Valor mensal"
                            value={formatarMoedaBR(faixa.valor)}
                            onChange={e => {
                              const raw = e.target.value.replace(/\D/g, '');
                              setForm(f => ({
                                ...f,
                                faixas: f.faixas.map((fx, j) => j === i ? { ...fx, valor: raw } : fx)
                              }));
                            }}
                            required
                            min={0}
                          />
                        </div>
                        <Button type="button" variant="outline" onClick={() => setForm(f => ({ ...f, faixas: f.faixas.filter((_, j) => j !== i) }))}>Remover</Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" onClick={() => setForm(f => ({ ...f, faixas: [...f.faixas, { atendimentos: '', valor: '' }] }))}>Adicionar Faixa</Button>
                    <div className="mt-2">
                      <Label>Como a meta é avaliada?</Label>
                      <Select value={contabilidade} onValueChange={v => setContabilidade(v as 'todas_semanas' | 'media_mensal')}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todas_semanas">Preciso atingir a meta em todas as semanas do mês</SelectItem>
                          <SelectItem value="media_mensal">A média semanal no mês deve atingir a meta</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-gray-500 mt-1">
                        {contabilidade === 'todas_semanas'
                          ? 'Se em alguma semana não atingir a meta, o valor mensal será ajustado para a menor faixa atingida.'
                          : 'O total de atendimentos do mês dividido pelo número de semanas deve ser igual ou maior que a meta.'}
                      </div>
                    </div>
                  </div>
                )}
                {form.regra === 'fixo' && (
                  <div>
                    <Label>Valor fixo mensal (R$)</Label>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-1">R$</span>
                      <Input
                        inputMode="numeric"
                        value={formatarMoedaBR(form.faixas[0]?.valor || '')}
                        onChange={e => {
                          const raw = e.target.value.replace(/\D/g, '');
                          setForm(f => ({ ...f, faixas: [{ atendimentos: '', valor: raw }] }));
                        }}
                        required
                        min={0}
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 justify-end mt-4">
                  <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={salvando}>{editId ? 'Salvar Alterações' : 'Cadastrar Local'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {/* Filtro de status */}
        <div className="flex justify-end mt-4">
          <Select value={statusFiltro} onValueChange={v => setStatusFiltro(v as 'todos' | 'ativo' | 'inativo')}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      {/* Cards de Locais */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locais
          .filter(local => statusFiltro === 'todos' ? true : local.status === statusFiltro)
          .map(local => {
          const { valor, plantoesMes } = getValorEPlantoes(local);
          return (
            <div key={local.id} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{local.nome}</h2>
                  <span className="text-sm text-gray-600">{tiposLocal.find(t => t.value === local.tipo)?.label || local.tipo}</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${local.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{local.status}</span>
              </div>
              <div className="text-sm text-gray-700">{local.endereco}</div>
              <div className="text-sm text-gray-700">{local.telefone}</div>
              <div className="text-sm text-gray-700">{local.email}</div>
              <div className="mt-2">
                <div className="font-semibold text-gray-800">Valor Plantão</div>
                <div className="text-lg font-bold text-blue-700">{valor && !isNaN(Number(valor)) ? Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : valor}</div>
              </div>
              <div className="mt-1">
                <div className="font-semibold text-gray-800">Plantões/Mês</div>
                <div className="text-lg font-bold text-indigo-700">{plantoesMes}</div>
              </div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => handleEditar(local)}>Editar</Button>
                {local.status === 'ativo' && (
                  <Button size="sm" variant="destructive" onClick={() => handleDesativar(local.id)}>Desativar</Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocaisTrabalho; 