import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  Filter,
  Calendar,
  User,
  Stethoscope,
  Clock,
  FileText,
  Download,
  Eye,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePlantonista } from '@/hooks/usePlantonista';
import { saveAs } from 'file-saver';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

function exportToCSV(data: any[], filename: string) {
  if (!data.length) return;
  const header = Object.keys(data[0]);
  const csvRows = [header.join(',')];
  for (const row of data) {
    csvRows.push(header.map(field => '"' + String(row[field] ?? '').replace(/"/g, '""') + '"').join(','));
  }
  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
}

const Historico: React.FC = () => {
  const [activeTab, setActiveTab] = useState('atendimentos');
  const { sessoes, atendimentos, buscarSessoes, buscarAtendimentos, loading } = usePlantonista();
  const [todosAtendimentos, setTodosAtendimentos] = useState<any[]>([]);
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [modalAtendimento, setModalAtendimento] = useState<any | null>(null);
  const [modalSessao, setModalSessao] = useState<any | null>(null);

  // Buscar sessões e atendimentos ao montar
  useEffect(() => {
    async function fetchAll() {
      await buscarSessoes();
    }
    fetchAll();
  }, []);

  // Buscar atendimentos de todas as sessões
  useEffect(() => {
    async function fetchAtends() {
      if (!sessoes || sessoes.length === 0) return;
      
      const allAtendimentos: any[] = [];
      
      // Buscar atendimentos de cada sessão sequencialmente para evitar conflitos
      for (const sessao of sessoes) {
        await buscarAtendimentos(sessao.id);
        // Adicionar os atendimentos carregados com referência da sessão
        const atendimentosDaSessao = atendimentos.map(a => ({ 
          ...a, 
          sessao,
          sessao_local: sessao.local_trabalho 
        }));
        allAtendimentos.push(...atendimentosDaSessao);
      }
      
      setTodosAtendimentos(allAtendimentos);
    }
    fetchAtends();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessoes.length]);

  // Filtros
  let atendimentosFiltrados = todosAtendimentos.filter(a => {
    if (busca && !(
      (a.paciente_nome || a.paciente || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.queixa_principal || a.queixa || '').toLowerCase().includes(busca.toLowerCase()) ||
      (a.hipotese_diagnostica || a.diagnostico || '').toLowerCase().includes(busca.toLowerCase())
    )) return false;
    if (filtroStatus !== 'todos' && a.status !== filtroStatus) return false;
    return true;
  });

  // Mapear para o formato esperado pelo componente
  const atendimentosHistorico = atendimentosFiltrados.map(a => ({
    id: a.id,
    paciente: a.paciente_nome || a.paciente || '-',
    data: (a.created_at || a.data_atendimento || a.data || '').slice(0, 10),
    horario: (a.created_at || a.data_atendimento || a.data || '').slice(11, 16),
    queixa: a.queixa_principal || a.queixa || '-',
    diagnostico: a.diagnostico_final || a.hipotese_diagnostica || a.diagnostico || '-',
    status: a.status || '-',
    local: a.sessao_local || a.sessao?.local_trabalho || a.local || '-',
    raw: a // Manter dados originais para modal
  }));

  // Estatísticas reais
  const estatisticas = {
    totalAtendimentos: atendimentosHistorico.length,
    mediaMensal: Math.round(atendimentosHistorico.length / 12),
    tempoMedio: 45, // Pode ser calculado se houver campo de duração
    satisfacao: 4.8 // Placeholder, ajustar se houver campo real
  };

  // Sessões reais
  const sessoesHistorico = sessoes.map(sessao => ({
    id: sessao.id,
    local: sessao.local_trabalho || '-',
    data: (sessao.data_inicio || '').slice(0, 10),
    turno: sessao.turno || '-',
    atendimentos: todosAtendimentos.filter(a => a.sessao?.id === sessao.id).length,
    duracao: sessao.duracao || '-',
    status: sessao.status || '-'
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              📋 Histórico de Atendimentos
            </h1>
            <p className="text-gray-600">
              Consulta e análise de atendimentos anteriores
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => exportToCSV(atendimentosHistorico, 'atendimentos.csv')}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Atendimentos */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Atendimentos</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.totalAtendimentos}</p>
                </div>
                <Stethoscope className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          {/* Média Mensal */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Média Mensal</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.mediaMensal}</p>
                </div>
                <Calendar className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          {/* Tempo Médio */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tempo Médio
                  </p>
                  <p className="text-2 font-bold text-orange-600">{estatisticas.tempoMedio} min</p>
                </div>
                <Clock className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          {/* Satisfação */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Satisfação
                  </p>
                  <p className="text-2 font-bold text-purple-600">{estatisticas.satisfacao}/5</p>
                </div>
                <User className="h-8 w-8" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abas Principais */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white shadow-sm">
            <TabsTrigger
              value="atendimentos"
              className="flex items-center space-x-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <Stethoscope className="h-4 w-4" />
              <span>Atendimentos</span>
            </TabsTrigger>

            <TabsTrigger
              value="sessoes"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Calendar className="h-4 w-4" />
              <span>Sessões</span>
            </TabsTrigger>

            <TabsTrigger
              value="relatorios"
              className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <FileText className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <div className="mt-6">
            {/* Aba - Atendimentos */}
            <TabsContent value="atendimentos" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Histórico de Atendimentos</CardTitle>
                    <div className="flex space-x-2">
                      <Input placeholder="Buscar paciente..." className="w-64" value={busca} onChange={(e) => setBusca(e.target.value)} />
                      <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="finalizado">Finalizado</SelectItem>
                          <SelectItem value="encaminhado">Encaminhado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {atendimentosHistorico.map((atendimento) => (
                      <div key={atendimento.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900">{atendimento.paciente}</h3>
                            <p className="text-sm text-gray-600">{atendimento.queixa}</p>
                            <p className="text-xs text-gray-500">{atendimento.data} às {atendimento.horario}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{atendimento.local}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={atendimento.status === 'finalizado' ? 'default' : 'secondary'}
                          >
                            {atendimento.status}
                          </Badge>
                          <span className="text-sm font-medium text-gray-700">{atendimento.diagnostico}</span>
                          <Button size="sm" variant="outline" onClick={() => setModalAtendimento(atendimento)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba - Sessões */}
            <TabsContent value="sessoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Sessões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {sessoesHistorico.map((sessao) => (
                      <div key={sessao.id} className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900">{sessao.local}</h3>
                            <p className="text-sm text-gray-600">{sessao.data} - {sessao.turno}</p>
                            <p className="text-xs text-blue-600">Duração: {sessao.duracao}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="default">
                            {sessao.atendimentos} atendimentos
                          </Badge>
                          <Badge variant={sessao.status === 'finalizada' ? 'default' : sessao.status}>
                            {sessao.status}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => setModalSessao(sessao)}>
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba - Relatórios */}
            <TabsContent value="relatorios" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Relatório de Atendimentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Relatório detalhado de todos os atendimentos realizados.
                    </p>
                    <Button className="w-full" onClick={() => exportToCSV(atendimentosHistorico, 'relatorio_atendimentos.csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Relatório de Sessões</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Análise de desempenho por sessão de plantão.
                    </p>
                    <Button className="w-full" onClick={() => exportToCSV(sessoesHistorico, 'relatorio_sessoes.csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas Gerais</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Métricas e indicadores de performance.
                    </p>
                    <Button className="w-full" onClick={() => exportToCSV([estatisticas], 'relatorio_estatisticas.csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Análise de Tendências</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Evolução temporal dos atendimentos e diagnósticos.
                    </p>
                    <Button className="w-full" onClick={() => exportToCSV(atendimentosHistorico, 'relatorio_tendencias.csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <Dialog open={!!modalAtendimento} onOpenChange={() => setModalAtendimento(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Atendimento</DialogTitle>
          </DialogHeader>
          {modalAtendimento && (
            <div className="space-y-2">
              <div><b>Paciente:</b> {modalAtendimento.paciente}</div>
              <div><b>Data:</b> {modalAtendimento.data} {modalAtendimento.horario}</div>
              <div><b>Queixa:</b> {modalAtendimento.queixa}</div>
              <div><b>Diagnóstico:</b> {modalAtendimento.diagnostico}</div>
              <div><b>Status:</b> {modalAtendimento.status}</div>
              <div><b>Local:</b> {modalAtendimento.local}</div>
              {/* Adicione mais campos conforme necessário */}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setModalAtendimento(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!modalSessao} onOpenChange={() => setModalSessao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Sessão</DialogTitle>
          </DialogHeader>
          {modalSessao && (
            <div className="space-y-2">
              <div><b>Local:</b> {modalSessao.local}</div>
              <div><b>Data:</b> {modalSessao.data}</div>
              <div><b>Turno:</b> {modalSessao.turno}</div>
              <div><b>Status:</b> {modalSessao.status}</div>
              <div><b>Duração:</b> {modalSessao.duracao}</div>
              <div><b>Atendimentos:</b></div>
              <ul className="list-disc ml-6">
                {todosAtendimentos.filter(a => a.sessao?.id === modalSessao.id).map(a => (
                  <li key={a.id}>{a.paciente_nome || a.paciente || '-'} - {a.queixa_principal || a.queixa || '-'} - {a.status}</li>
                ))}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setModalSessao(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Historico; 