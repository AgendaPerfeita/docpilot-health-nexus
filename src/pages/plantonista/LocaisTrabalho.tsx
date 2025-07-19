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
  const num = typeof valor === 'number' ? valor : Number(valor) / 100;
  return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function desformatarMoedaBR(valor: string) {
  if (!valor) return '';
  return valor.replace(/\D/g, '');
}

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
              valor: String((Number(desformatarMoedaBR(fx.valor) || 0) / 100)),
              atendimentos: String(fx.atendimentos || '')
            }))
           : [{ atendimentos: '0', valor: String((Number(desformatarMoedaBR(form.faixas[0]?.valor || '0')) / 100)) }],
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
        await supabase.from('plantonista_locais_trabalho').update(payload).eq('id', editId);
      } else {
        await supabase.from('plantonista_locais_trabalho').insert(payload);
      }
      await fetchLocais();
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

  // Função para calcular valor do plantão e plantões/mês
  function getValorEPlantoes(local: any) {
    // Aqui você pode integrar com o hook usePlantoesFinanceiro para buscar os plantões do mês e calcular o valor conforme a regra
    // Exemplo simplificado:
    // const { plantoesFixos, plantoesCoringa } = usePlantoesFinanceiro(mesAtual, anoAtual);
    // Filtrar plantões deste local e mês, somar valores, etc.
    return { valor: '...', plantoesMes: '...' };
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
      </div>
      {/* Cards de Locais */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locais.map(local => {
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
                {/* <Button size="sm" variant="outline">Ver Detalhes</Button> */}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocaisTrabalho; 