
import { useState } from 'react';
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
    plantoesFixos,
    plantoesCoringa,
    totalFixos,
    totalCoringa,
    totalPago,
    totalPendente,
    loading,
    marcarPagoFixo,
    marcarPagoCoringa,
    passarPlantaoFixo,
    getMesesAnosDisponiveis
  } = usePlantoesFinanceiro(selectedMonth, selectedYear);

  const { meses, anos } = getMesesAnosDisponiveis();

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
              <option key={ano} value={ano}>{ano}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Plantões Fixos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFixos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Coringa</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {totalCoringa.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pago</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ {totalPago.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ {totalPendente.toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Plantões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plantões Fixos */}
        <Card>
          <CardHeader>
            <CardTitle>Plantões Fixos</CardTitle>
            <CardDescription>Plantões da escala fixa do mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : plantoesFixos.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum plantão fixo encontrado
              </div>
            ) : (
              plantoesFixos.map((plantao) => (
                <div key={plantao.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(new Date(plantao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      R$ {plantao.valor.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={plantao.status_pagamento === 'pago' ? 'default' : 'secondary'}>
                      {plantao.status_pagamento}
                    </Badge>
                    {plantao.status_pagamento === 'pendente' && (
                      <Button
                        size="sm"
                        onClick={() => marcarPagoFixo(plantao.id)}
                        variant="outline"
                      >
                        Marcar Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Plantões Coringa */}
        <Card>
          <CardHeader>
            <CardTitle>Plantões Coringa</CardTitle>
            <CardDescription>Plantões extras do mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="text-center py-4">Carregando...</div>
            ) : plantoesCoringa.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Nenhum plantão coringa encontrado
              </div>
            ) : (
              plantoesCoringa.map((plantao) => (
                <div key={plantao.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">
                      {format(new Date(plantao.data), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {plantao.horario_inicio} - {plantao.horario_fim}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      R$ {plantao.valor.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={plantao.status_pagamento === 'pago' ? 'default' : 'secondary'}>
                      {plantao.status_pagamento}
                    </Badge>
                    {plantao.status_pagamento === 'pendente' && (
                      <Button
                        size="sm"
                        onClick={() => marcarPagoCoringa(plantao.id)}
                        variant="outline"
                      >
                        Marcar Pago
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GestaoFinanceira;
