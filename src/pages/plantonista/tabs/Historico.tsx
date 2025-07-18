import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar,
  Building,
  User,
  Stethoscope,
  FileText
} from 'lucide-react';

const Historico: React.FC = () => {
  const [periodo, setPeriodo] = useState(30);
  const [local, setLocal] = useState('todos');
  const [busca, setBusca] = useState('');
  const atendimentos = [
    {
      id: 1,
      data: '2024-05-20',
      paciente: 'João Silva',
      idade: 45,
      queixa: 'Dor torácica',
      local: 'Hospital ABC',
      status: 'finalizado',
      diagnostico: 'Pericardite aguda'
    },
    {
      id: 2,
      data: '2024-05-19',
      paciente: 'Maria Santos',
      idade: 32,
      queixa: 'Cefaleia',
      local: 'Clínica XYZ',
      status: 'finalizado',
      diagnostico: 'Enxaqueca'
    },
    {
      id: 3,
      data: '2024-05-18',
      paciente: 'Pedro Costa',
      idade: 58,
      queixa: 'Dispneia',
      local: 'Hospital ABC',
      status: 'finalizado',
      diagnostico: 'Insuficiência cardíaca'
    }
  ];

  const locais = ['Todos', 'Hospital ABC', 'Clínica XYZ'];
  const periodos = [
    { value: 7, label: 'Últimos 7 dias' },
    { value: 30, label: 'Últimos 30 dias' },
    { value: 90, label: 'Últimos 90 dias' }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Período:</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periodos.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700">Local:</label>
              <Select value={local} onValueChange={setLocal}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locais.map((l) => (
                    <SelectItem key={l} value={l.toLowerCase()}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Buscar:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por paciente, queixa, diagnóstico..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"               />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="h-5 w-5" />
            <span>Resumo do Período</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Total de Atendimentos</p>
              <p className="text-2xl font-bold text-blue-600">{atendimentos.length}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Finalizados</p>
              <p className="text-2xl font-bold text-green-600">
                {atendimentos.filter(a => a.status === 'finalizado').length}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Locais Diferentes</p>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(atendimentos.map(a => a.local)).size}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-gray-600">Média Idade</p>
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(atendimentos.reduce((acc, a) => acc + a.idade,0) / atendimentos.length)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Atendimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Histórico de Atendimentos</span>
            <Badge variant="secondary" className="ml-auto">{atendimentos.length} registros</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {atendimentos.map((atendimento) => (
              <div key={atendimento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="font-medium">{atendimento.paciente}</p>
                      <p className="text-sm text-gray-600">{atendimento.idade} anos</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Stethoscope className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">{atendimento.queixa}</p>
                      <p className="text-xs text-gray-500">{atendimento.diagnostico}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium">{atendimento.data}</p>
                    <div className="flex items-center space-x-1">
                      <Building className="h-3 w-3 text-gray-400" />
                      <p className="text-xs text-gray-500">{atendimento.local}</p>
                    </div>
                  </div>
                  
                  <Badge className="bg-green-100 text-green-800">{atendimento.status}</Badge>
                  
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {atendimentos.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Nenhum atendimento encontrado</p>
              <p className="text-sm text-gray-500">Tente ajustar os filtros</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Historico; 