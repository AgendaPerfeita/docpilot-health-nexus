import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlantoesFinanceiro } from '@/hooks/usePlantoesFinanceiro';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

const GestaoFinanceira = () => {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const {
    plantoes,
    escalas,
    loading,
    carregarPlantoes,
    atualizarStatusPlantao
  } = usePlantoesFinanceiro();

  useEffect(() => {
    carregarPlantoes(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear, carregarPlantoes]);

  // Calculate totals from plantoes
  const totalPago = plantoes.filter(p => p.status === 'realizado').reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = plantoes.filter(p => p.status === 'pendente').reduce((acc, p) => acc + p.valor, 0);
  const totalGeral = plantoes.reduce((acc, p) => acc + p.valor, 0);

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  const anos = [2024, 2025, 2026].map(ano => ({ value: ano, label: ano.toString() }));

  const handleMarcarPago = async (plantaoId: string) => {
    await atualizarStatusPlantao(plantaoId, 'realizado');
  };

  const handleMarcarPendente = async (plantaoId: string) => {
    await atualizarStatusPlantao(plantaoId, 'pendente');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gestão Financeira</h2>
        <div className="flex gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            {meses.map(mes => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border rounded-md"
          >
            {anos.map(ano => (
              <option key={ano.value} value={ano.value}>
                {ano.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Plantões */}
      <Card>
        <CardHeader>
          <CardTitle>Plantões do Mês</CardTitle>
          <CardDescription>
            {format(new Date(selectedYear, selectedMonth - 1), 'MMMM yyyy', { locale: ptBR })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Carregando...</div>
          ) : plantoes.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Nenhum plantão encontrado para este período
            </div>
          ) : (
            <div className="space-y-2">
              {plantoes.map((plantao) => (
                <div
                  key={plantao.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-medium">{plantao.data}</p>
                      <p className="text-sm text-muted-foreground">{plantao.local}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium">
                        R$ {plantao.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    
                    <Badge variant={plantao.status === 'realizado' ? 'default' : 'secondary'}>
                      {plantao.status}
                    </Badge>
                    
                    <div className="flex gap-2">
                      {plantao.status === 'pendente' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarcarPago(plantao.id)}
                          variant="outline"
                        >
                          Marcar como Pago
                        </Button>
                      )}
                      {plantao.status === 'realizado' && (
                        <Button
                          size="sm"
                          onClick={() => handleMarcarPendente(plantao.id)}
                          variant="outline"
                        >
                          Marcar como Pendente
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoFinanceira;