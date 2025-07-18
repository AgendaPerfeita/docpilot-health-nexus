import React, { useState } from 'react';
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

const LocaisTrabalho: React.FC = () => {
  const [activeTab, setActiveTab] = useState('locais');

  // Dados mockados para demonstração
  const estatisticas = {
    totalLocais: 4,
    locaisAtivos: 3,
    plantoesMes: 12,
    avaliacaoMedia: 4.6
  };

  const locaisTrabalho = [
    {
      id: 1,
      nome: 'Hospital ABC',
      tipo: 'Hospital',
      endereco: 'Rua das Flores, 123, Centro',
      telefone: '(11)99999999',
      email: 'contato@hospitalabc.com',
      horarios: '24h',
      valorPlantao: 350,
      status: 'ativo',
      avaliacao: 40.8,
      plantoesMes: 4
    },
    {
      id: 2,
      nome: 'Hospital XYZ',
      tipo: 'Hospital',
      endereco: 'Av. Principal, 456 - Jardins, São Paulo',
      telefone: '(11)88888888',
      email: 'rh@hospitalxyz.com',
      horarios: '24h',
      valorPlantao: 400,
      status: 'ativo',
      avaliacao: 40.5,
      plantoesMes: 3
    },
    {
      id: 3,
      nome: 'Clínica Central',
      tipo: 'Clínica',
      endereco: 'Rua do Comércio, 789, Vila Nova, São Paulo',
      telefone: '(11)77777777',
      email: 'plantao@clinicacentral.com',
      horarios: '8h às 18',
      valorPlantao: 300,
      status: 'ativo',
      avaliacao: 40.7,
      plantoesMes: 2
    },
    {
      id: 4,
      nome: 'Pronto Socorro Municipal',
      tipo: 'UPA',
      endereco: 'Rua da Saúde, 321, São Paulo',
      telefone: '(11)66666666',
      email: 'plantao@psmunicipal.com',
      horarios: '24h',
      valorPlantao: 280,
      status: 'inativo',
      avaliacao: 40.2,
      plantoesMes: 0
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏢 Locais de Trabalho
            </h1>
            <p className="text-gray-600">
              Gestão de locais onde você atua como plantonista
            </p>
          </div>

          {/* Ações Rápidas */}
          <div className="flex space-x-2">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Local
            </Button>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total de Locais */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Locais</p>
                  <p className="text-2xl font-bold text-purple-600">{estatisticas.totalLocais}</p>
                </div>
                <Building className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          {/* Locais Ativos */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Locais Ativos</p>
                  <p className="text-2xl font-bold text-green-600">{estatisticas.locaisAtivos}</p>
                </div>
                <MapPin className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Plantões no Mês */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plantões no Mês</p>
                  <p className="text-2xl font-bold text-blue-600">{estatisticas.plantoesMes}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          {/* Avaliação Média */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avaliação Média</p>
                  <p className="text-2xl font-bold text-orange-600">{estatisticas.avaliacaoMedia}/5</p>
                </div>
                <Star className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Abas Principais */}
      <div className="max-w-7xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white shadow-sm">
            <TabsTrigger
              value="locais"
              className="flex items-center space-x-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700"
            >
              <Building className="h-4 w-4" />
              <span>Meus Locais</span>
            </TabsTrigger>

            <TabsTrigger
              value="configuracoes"
              className="flex items-center space-x-2 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700"
            >
              <Settings className="h-4 w-4" />
              <span>Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <div className="mt-6">
            {/* Aba - Locais */}
            <TabsContent value="locais" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {locaisTrabalho.map((local) => (
                  <Card key={local.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center space-x-2">
                            <Building className="h-5 w-5 text-purple-500" />
                            <span>{local.nome}</span>
                          </CardTitle>
                          <p className="text-sm text-gray-600">{local.tipo}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={local.status === 'ativo' ? 'default' : 'secondary'}
                          >
                            {local.status}
                          </Badge>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium">{local.avaliacao}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{local.endereco}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{local.telefone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{local.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{local.horarios}</span>
                        </div>
                      </div>

                      <div className="flex justify-between pt-2 border-t">
                        <div>
                          <p className="text-sm font-medium text-gray-900">Valor Plantão</p>
                          <p className="text-lg font-bold text-green-600">{local.valorPlantao}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Plantões/Mês</p>
                          <p className="text-lg font-bold text-blue-600">{local.plantoesMes}</p>
                        </div>
                      </div>

                      <div className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Globe className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                        {local.status === 'inativo' && (
                          <Button size="sm" variant="destructive" className="flex-1">
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remover
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Aba - Configurações */}
            <TabsContent value="configuracoes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Locais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="notificacoes">Notificações de Plantões</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os locais</SelectItem>
                          <SelectItem value="ativos">Apenas ativos</SelectItem>
                          <SelectItem value="nenhum">Desativar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="preferencia">Preferência de Local</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mais-proximo">Mais próximo</SelectItem>
                          <SelectItem value="melhor-valor">Melhor valor</SelectItem>
                          <SelectItem value="mais-plantoes">Mais plantões</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações Gerais</Label>
                    <Textarea
                      id="observacoes"
                      placeholder="Observações sobre seus locais de trabalho..."
                      rows={3}
                    />
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

export default LocaisTrabalho; 