import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Building,
  FileText,
  Download,
  Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegistroFinanceiro {
  id: string;
  data: string;
  local: string;
  turno: string;
  horas: number;
  valorHora: number;
  total: number;
  status: 'pendente' | 'pago';
  observacoes?: string;
}

export default function GestaoFinanceira() {
  const [periodo, setPeriodo] = useState('mes_atual');
  const [statusFiltro, setStatusFiltro] = useState('todos');

  const registros: RegistroFinanceiro[] = [
    {
      id: '1',
      data: '2024-01-15',
      local: 'Hospital Santa Casa',
      turno: 'Noturno',
      horas: 12,
      valorHora: 120,
      total: 1440,
      status: 'pago',
      observacoes: 'Plantão de emergência'
    },
    {
      id: '2',
      data: '2024-01-16',
      local: 'Clínica São José',
      turno: 'Diurno',
      horas: 8,
      valorHora: 100,
      total: 800,
      status: 'pendente',
      observacoes: 'Atendimento ambulatorial'
    },
    {
      id: '3',
      data: '2024-01-17',
      local: 'Hospital Santa Casa',
      turno: 'Noturno',
      horas: 12,
      valorHora: 120,
      total: 1440,
      status: 'pago'
    },
    {
      id: '4',
      data: '2024-01-18',
      local: 'UPA Central',
      turno: 'Diurno',
      horas: 6,
      valorHora: 110,
      total: 660,
      status: 'pendente'
    }
  ];

  const registrosFiltrados = registros.filter(registro => {
    if (statusFiltro === 'todos') return true;
    return registro.status === statusFiltro;
  });

  // Cálculos financeiros
  const totalGeral = registros.reduce((acc, reg) => acc + reg.total, 0);
  const totalPago = registros.filter(r => r.status === 'pago').reduce((acc, reg) => acc + reg.total, 0);
  const totalPendente = registros.filter(r => r.status === 'pendente').reduce((acc, reg) => acc + reg.total, 0);
  const horasTrabalhadas = registros.reduce((acc, reg) => acc + reg.horas, 0);

  const estatisticas = [
    {
      titulo: "Faturamento Total",
      valor: `R$ ${totalGeral.toFixed(2)}`,
      descricao: "Este mês",
      icone: DollarSign,
      cor: "text-green-600"
    },
    {
      titulo: "Recebido",
      valor: `R$ ${totalPago.toFixed(2)}`,
      descricao: "Pagamentos confirmados",
      icone: TrendingUp,
      cor: "text-blue-600"
    },
    {
      titulo: "Pendente",
      valor: `R$ ${totalPendente.toFixed(2)}`,
      descricao: "Aguardando pagamento",
      icone: Clock,
      cor: "text-orange-600"
    },
    {
      titulo: "Horas Trabalhadas",
      valor: `${horasTrabalhadas}h`,
      descricao: "Total no período",
      icone: Calendar,
      cor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              💰 Gestão Financeira
            </h1>
            <p className="text-gray-600">
              Controle de ganhos e pagamentos dos plantões
            </p>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Relatório
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {estatisticas.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.titulo}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.valor}</p>
                    <p className="text-sm text-gray-500">{stat.descricao}</p>
                  </div>
                  <stat.icone className={`h-8 w-8 ${stat.cor}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="h-5 w-5 mr-2" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Período</label>
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mes_atual">Mês Atual</SelectItem>
                    <SelectItem value="mes_anterior">Mês Anterior</SelectItem>
                    <SelectItem value="ultimo_trimestre">Último Trimestre</SelectItem>
                    <SelectItem value="ano_atual">Ano Atual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Registros */}
        <Card>
          <CardHeader>
            <CardTitle>Registros de Plantões</CardTitle>
            <CardDescription>
              Histórico detalhado de plantões e pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {registrosFiltrados.map((registro) => (
                <div key={registro.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h4 className="font-semibold flex items-center">
                            <Building className="h-4 w-4 mr-2 text-blue-600" />
                            {registro.local}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(registro.data).toLocaleDateString('pt-BR')} • {registro.turno}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium">{registro.horas}h</p>
                          <p className="text-xs text-gray-500">Horas</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-sm font-medium">R$ {registro.valorHora}</p>
                          <p className="text-xs text-gray-500">Por hora</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">
                            R$ {registro.total.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">Total</p>
                        </div>
                      </div>
                      
                      {registro.observacoes && (
                        <p className="text-sm text-gray-600 mt-2 ml-6">
                          {registro.observacoes}
                        </p>
                      )}
                    </div>
                    
                    <div className="ml-4">
                      <Badge 
                        variant={registro.status === 'pago' ? 'default' : 'secondary'}
                        className={registro.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                      >
                        {registro.status === 'pago' ? 'Pago' : 'Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Resumo Mensal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Resumo por Local</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from(new Set(registros.map(r => r.local))).map(local => {
                  const registrosLocal = registros.filter(r => r.local === local);
                  const totalLocal = registrosLocal.reduce((acc, r) => acc + r.total, 0);
                  const horasLocal = registrosLocal.reduce((acc, r) => acc + r.horas, 0);
                  
                  return (
                    <div key={local} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{local}</p>
                        <p className="text-sm text-gray-600">{horasLocal}h trabalhadas</p>
                      </div>
                      <p className="font-bold text-green-600">R$ {totalLocal.toFixed(2)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meta Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Progresso da Meta</span>
                    <span className="text-sm text-gray-600">R$ {totalGeral.toFixed(2)} / R$ 8.000,00</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min((totalGeral / 8000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((totalGeral / 8000) * 100).toFixed(1)}% da meta alcançada
                  </p>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    Faltam <span className="font-medium">R$ {Math.max(8000 - totalGeral, 0).toFixed(2)}</span> para atingir a meta
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}