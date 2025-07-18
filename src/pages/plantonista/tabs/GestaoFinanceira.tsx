import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  Plus,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';

const GestaoFinanceira: React.FC = () => {
  const [plantoesFixos] = useState([
    {
      id: 1,
      dia: 'Domingos',
      local: 'Hospital ABC',
      valorMes: 80,
      plantoesMes: 4,
      valorPlantao: 200,
      pago: true
    },
    {
      id: 2,
      dia: 'Segundas',
      local: 'Clínica XYZ',
      valorMes: 60,
      plantoesMes: 4,
      valorPlantao: 150,
      pago: false
    }
  ]);

  const [plantoesAvulsos] = useState([
    {
      id: 1,
      data: '2022-04-01',
      local: 'Hospital ABC',
      valor: 250,
      pago: true
    },
    {
      id: 2,
      data: '2022-04-25',
      local: 'Clínica XYZ',
      valor: 200,
      pago: false
    }
  ]);

  const totalMes = plantoesFixos.reduce((acc, p) => acc + p.valorMes, 0) +
                   plantoesAvulsos.reduce((acc, p) => acc + p.valor, 0);
  const totalPago = plantoesFixos.filter(p => p.pago).reduce((acc, p) => acc + p.valorMes, 0) +
                    plantoesAvulsos.filter(p => p.pago).reduce((acc, p) => acc + p.valor, 0);
  const totalPendente = totalMes - totalPago;

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Resumo Financeiro - Janeiro 2024</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total do Mês</p>
              <p className="text-2xl font-bold text-green-600">R$ {totalMes}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Pago</p>
              <p className="text-2xl font-bold text-blue-600">R$ {totalPago}</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Pendente</p>
              <p className="text-2xl font-bold text-orange-600">R$ {totalPendente}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plantões Fixos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Plantões Fixos</span>
            <Button size="sm" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plantoesFixos.map((plantao) => (
              <div key={plantao.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{plantao.dia} - {plantao.local}</p>
                    <p className="text-sm text-gray-600">
                      R$ {plantao.valorMes}/mês ({plantao.plantoesMes} plantões = R$ {plantao.valorPlantao} cada)
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {plantao.pago ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> Pago
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600">
                      <Clock className="h-3 w-3 mr-1" /> Pendente
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Plantões Avulsos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5" />
            <span>Plantões Avulsos</span>
            <Button size="sm" className="ml-auto">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {plantoesAvulsos.map((plantao) => (
              <div key={plantao.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Building className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{plantao.data} - {plantao.local}</p>
                    <p className="text-sm text-gray-60">Plantão avulso</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <p className="font-medium">R$ {plantao.valor}</p>
                  {plantao.pago ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" /> Pago
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-orange-600">
                      <Clock className="h-3 w-3 mr-1" /> Pendente
                    </Badge>
                  )}
                  <Button size="sm" variant="outline">
                    Marcar Pago
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GestaoFinanceira; 