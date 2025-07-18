import React, { useState } from 'react';
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

const Historico: React.FC = () => {
  const [activeTab, setActiveTab] = useState('atendimentos');

  // Dados mockados para demonstração
  const estatisticas = {
    totalAtendimentos: 156,
    mediaMensal: 26,
    tempoMedio: 45,
    satisfacao: 4.8
  };

  const atendimentosHistorico = [
    {
      id: 1,
      paciente: 'Maria Silva',
      data: '15/10/2024',
      horario: '21:30',
      queixa: 'Dor no peito',
      diagnostico: 'Angina pectoris',
      status: 'finalizado',
      local: 'Hospital ABC'
    },
    {
      id: 2,
      paciente: 'João Santos',
      data: '14/10/2024',
      horario: '22:15',
      queixa: 'Febre alta',
      diagnostico: 'Infecção respiratória',
      status: 'finalizado',
      local: 'Hospital ABC'
    },
    {
      id: 3,
      paciente: 'Ana Costa',
      data: '13/10/2024',
      horario: '23:45',
      queixa: 'Trauma craniano',
      diagnostico: 'Concussão leve',
      status: 'finalizado',
      local: 'Hospital ABC'
    },
    {
      id: 4,
      paciente: 'Carlos Oliveira',
      data: '12/10/2024',
      horario: '20:30',
      queixa: 'Dor abdominal',
      diagnostico: 'Apendicite',
      status: 'encaminhado',
      local: 'Hospital ABC'
    }
  ];

  const sessoesHistorico = [
    {
      id: 1,
      local: 'Hospital ABC',
      data: '15/01/2024',
      turno: 'Noite',
      atendimentos: 8,
      duracao: '12,5',
      status: 'finalizada'
    },
    {
      id: 2,
      local: 'Hospital ABC',
      data: '14/01/2024',
      turno: 'Noite',
      atendimentos: 6,
      duracao: '12,5',
      status: 'finalizada'
    },
    {
      id: 3,
      local: 'Hospital ABC',
      data: '13/01/2024',
      turno: 'Noite',
      atendimentos: 10,
      duracao: '12,5',
      status: 'finalizada'
    }
  ];

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
            <Button variant="outline">
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
                      <Input placeholder="Buscar paciente..." className="w-64" />
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="finalizados">Finalizados</SelectItem>
                          <SelectItem value="encaminhados">Encaminhados</SelectItem>
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
                          <Button size="sm" variant="outline">
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
                          <Button size="sm" variant="outline">
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
                    <Button className="w-full">
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
                    <Button className="w-full">
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
                    <Button className="w-full">
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
                    <Button className="w-full">
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
    </div>
  );
};

export default Historico; 