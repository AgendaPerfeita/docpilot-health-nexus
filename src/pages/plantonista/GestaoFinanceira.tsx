import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Building,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Download,
  Plus,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const GestaoFinanceira: React.FC = () => {
  const [activeTab, setActiveTab] = useState('resumo');

  // Dados mockados para demonstração
  const resumoFinanceiro = {
    mesAtual: 'Janeiro 2024',
    total: 1650,
    pago: 120,
    pendente: 450,
    plantoesFixos: 2,
    plantoesAvulsos: 3,
    totalPlantões: 5
  };

  const plantoes = [
    { id: 1, local: 'Hospital ABC', data: '15/224', turno: 'Noite', valor: 350, status: 'pago', tipo: 'fixo' },
    { id: 2, local: 'Hospital XYZ', data: '20/224', turno: 'Dia', valor: 400, status: 'pendente', tipo: 'avulso' },
    { id: 3, local: 'Hospital ABC', data: '25/224', turno: 'Noite', valor: 350, status: 'pago', tipo: 'fixo' },
    { id: 4, local: 'Clínica Central', data: '28/224', turno: 'Dia', valor: 300, status: 'pendente', tipo: 'avulso' }
  ];

  const receitasPorMes = [
    { mes: 'Jan', valor: 1650 },
    { mes: 'Fev', valor: 180 },
    { mes: 'Mar', valor: 1400 },
    { mes: 'Abr', valor: 2000 },
    { mes: 'Mai', valor: 1750 },
    { mes: 'Jun', valor: 1900 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 Gestão Financeira
            </h1>
            <p className="text-gray-600">
              Controle financeiro e relatórios de plantões
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Plantão
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Ganhos do Mês */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ganhos (Mês)</p>
                  <p className="text-2xl font-bold text-green-600">R$ {resumoFinanceiro.total}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Pago */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pago</p>
                  <p className="text-2xl font-bold text-blue-600">R$ {resumoFinanceiro.pago}</p>
                </div>
                <CreditCard className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Pendente */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendente</p>
                  <p className="text-2xl font-bold text-orange-600">R$ {resumoFinanceiro.pendente}</p>
                </div>
                <Receipt className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          {/* Total de Plantões */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Plantões</p>
                  <p className="text-2xl font-bold text-purple-600">{resumoFinanceiro.totalPlantões}</p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abas Principais */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
            <TabsTrigger
              value="resumo"
              className="flex items-center space-x-2 data-[state=active]:bg-green-50 data-[state=active]:text-green-700"
            >
              <PieChart className="h-4 w-4" />
              <span>Resumo</span>
            </TabsTrigger>

            <TabsTrigger
              value="plantoes"
              className="flex items-center space-x-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
            >
              <Calendar className="h-4 w-4" />
              <span>Plantões</span>
            </TabsTrigger>

            <TabsTrigger
              value="relatorios"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Relatórios</span>
            </TabsTrigger>

            <TabsTrigger
              value="configuracoes"
              className="flex items-center space-x-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700"
            >
              <Building className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <div className="mt-6">
            {/* Aba - Resumo */}
            <TabsContent value="resumo" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Receitas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Receitas dos Últimos 6Meses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {receitasPorMes.map((item, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.mes}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2"
                                style={{ width: `${(item.valor / 2000) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-semibold">R$ {item.valor}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Estatísticas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-blue-800">Plantões Fixos</p>
                        <p className="text-lg font-bold text-blue-600">{resumoFinanceiro.plantoesFixos}</p>
                      </div>
                      <Calendar className="h-6 w-6 text-blue-500" />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-green-800">Plantões Avulsos</p>
                        <p className="text-lg font-bold text-green-600">{resumoFinanceiro.plantoesAvulsos}</p>
                      </div>
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-orange-800">Taxa de Pagamento</p>
                        <p className="text-lg font-bold text-orange-600">
                          {Math.round((resumoFinanceiro.pago / resumoFinanceiro.total) * 100)}%
                        </p>
                      </div>
                      <CreditCard className="h-6 w-6 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba - Plantões */}
            <TabsContent value="plantoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Histórico de Plantões</CardTitle>
                    <div className="flex space-x-2">
                      <Select>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Filtrar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos</SelectItem>
                          <SelectItem value="pagos">Pagos</SelectItem>
                          <SelectItem value="pendentes">Pendentes</SelectItem>
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
                    {plantoes.map((plantao) => (
                      <div key={plantao.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex flex-col">
                            <h3 className="font-semibold text-gray-900">{plantao.local}</h3>
                            <p className="text-sm text-gray-600">
                              {plantao.data} - {plantao.turno}
                            </p>
                            <Badge variant={plantao.tipo === 'fixo' ? 'default' : 'secondary'}>
                              {plantao.tipo}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">
                            R$ {plantao.valor}
                          </span>
                          <Badge 
                            variant={plantao.status === 'pago' ? 'default' : 'destructive'}
                          >
                            {plantao.status}
                          </Badge>
                          <Button size="sm" variant="outline">
                            Detalhes
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
                    <CardTitle>Relatório Mensal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Gere relatórios detalhados de seus plantões e receitas.
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Relatório Anual</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">
                      Visão geral do ano com comparações e tendências.
                    </p>
                    <Button className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Relatório
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Aba - Configurações */}
            <TabsContent value="configuracoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações Financeiras</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valor-fixo">Valor Plantão Fixo</Label>
                      <Input id="valor-fixo" type="number" placeholder="R$ 0,00" />
                    </div>
                    <div>
                      <Label htmlFor="valor-avulso">Valor Plantão Avulso</Label>
                      <Input id="valor-avulso" type="number" placeholder="R$ 0,00" />
                    </div>
                  </div>
                  <Button>Salvar Configurações</Button>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default GestaoFinanceira; 