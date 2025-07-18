import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Clock, 
  Building, 
  Phone, 
  Mail,
  Edit,
  Trash2,
  Star
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface LocalTrabalho {
  id: string;
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  horarios: string;
  observacoes: string;
  favorito: boolean;
  ativo: boolean;
}

export default function LocaisTrabalho() {
  const [locais, setLocais] = useState<LocalTrabalho[]>([
    {
      id: '1',
      nome: 'Hospital Santa Casa',
      endereco: 'Rua das Flores, 123 - Centro',
      telefone: '(11) 3333-4444',
      email: 'contato@santacasa.com.br',
      horarios: 'Plantão noturno: 19h às 7h',
      observacoes: 'Unidade de emergência com UTI',
      favorito: true,
      ativo: true
    },
    {
      id: '2',
      nome: 'Clínica São José',
      endereco: 'Av. Paulista, 456 - Bela Vista',
      telefone: '(11) 2222-3333',
      email: 'plantao@clinicasaojose.com.br',
      horarios: 'Finais de semana: 8h às 18h',
      observacoes: 'Clínica de especialidades',
      favorito: false,
      ativo: true
    }
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [localEditando, setLocalEditando] = useState<LocalTrabalho | null>(null);
  const [novoLocal, setNovoLocal] = useState<Partial<LocalTrabalho>>({
    nome: '',
    endereco: '',
    telefone: '',
    email: '',
    horarios: '',
    observacoes: '',
    favorito: false,
    ativo: true
  });

  const handleSalvarLocal = () => {
    if (localEditando) {
      // Editar local existente
      setLocais(prev => prev.map(local => 
        local.id === localEditando.id 
          ? { ...localEditando, ...novoLocal }
          : local
      ));
    } else {
      // Adicionar novo local
      const id = Math.random().toString(36).substr(2, 9);
      setLocais(prev => [...prev, { ...novoLocal, id } as LocalTrabalho]);
    }
    
    setModalAberto(false);
    setLocalEditando(null);
    setNovoLocal({
      nome: '',
      endereco: '',
      telefone: '',
      email: '',
      horarios: '',
      observacoes: '',
      favorito: false,
      ativo: true
    });
  };

  const handleEditarLocal = (local: LocalTrabalho) => {
    setLocalEditando(local);
    setNovoLocal(local);
    setModalAberto(true);
  };

  const handleExcluirLocal = (id: string) => {
    setLocais(prev => prev.filter(local => local.id !== id));
  };

  const toggleFavorito = (id: string) => {
    setLocais(prev => prev.map(local => 
      local.id === id 
        ? { ...local, favorito: !local.favorito }
        : local
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🏢 Locais de Trabalho
            </h1>
            <p className="text-gray-600">
              Gestão de locais onde você atua como plantonista
            </p>
          </div>

          <Button onClick={() => setModalAberto(true)} size="lg">
            <Plus className="h-5 w-5 mr-2" />
            Novo Local
          </Button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Locais</p>
                  <p className="text-2xl font-bold text-gray-900">{locais.length}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Locais Ativos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {locais.filter(l => l.ativo).length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Favoritos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {locais.filter(l => l.favorito).length}
                  </p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Locais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {locais.map((local) => (
            <Card key={local.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center">
                      <Building className="h-5 w-5 mr-2 text-blue-600" />
                      {local.nome}
                      {local.favorito && (
                        <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      {local.endereco}
                    </CardDescription>
                  </div>
                  <Badge variant={local.ativo ? "default" : "secondary"}>
                    {local.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {local.telefone}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {local.email}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {local.horarios}
                  </div>
                  
                  {local.observacoes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      {local.observacoes}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorito(local.id)}
                    >
                      <Star className={`h-4 w-4 ${local.favorito ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditarLocal(local)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExcluirLocal(local.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modal para Adicionar/Editar Local */}
        <Dialog open={modalAberto} onOpenChange={setModalAberto}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {localEditando ? 'Editar Local de Trabalho' : 'Novo Local de Trabalho'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Local *</Label>
                <Input
                  id="nome"
                  value={novoLocal.nome || ''}
                  onChange={(e) => setNovoLocal(prev => ({ ...prev, nome: e.target.value }))}
                  placeholder="Ex: Hospital Santa Casa"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço *</Label>
                <Input
                  id="endereco"
                  value={novoLocal.endereco || ''}
                  onChange={(e) => setNovoLocal(prev => ({ ...prev, endereco: e.target.value }))}
                  placeholder="Rua, número, bairro"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={novoLocal.telefone || ''}
                    onChange={(e) => setNovoLocal(prev => ({ ...prev, telefone: e.target.value }))}
                    placeholder="(11) 9999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={novoLocal.email || ''}
                    onChange={(e) => setNovoLocal(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="contato@hospital.com.br"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="horarios">Horários de Trabalho</Label>
                <Input
                  id="horarios"
                  value={novoLocal.horarios || ''}
                  onChange={(e) => setNovoLocal(prev => ({ ...prev, horarios: e.target.value }))}
                  placeholder="Ex: Plantão noturno: 19h às 7h"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={novoLocal.observacoes || ''}
                  onChange={(e) => setNovoLocal(prev => ({ ...prev, observacoes: e.target.value }))}
                  placeholder="Informações adicionais..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setModalAberto(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSalvarLocal}
                disabled={!novoLocal.nome || !novoLocal.endereco}
              >
                {localEditando ? 'Salvar Alterações' : 'Adicionar Local'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}