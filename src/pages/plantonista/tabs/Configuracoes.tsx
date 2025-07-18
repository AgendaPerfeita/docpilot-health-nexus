import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  User, 
  Building, 
  Bell, 
  Shield,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

const Configuracoes: React.FC = () => {
  const [perfil, setPerfil] = useState({
    nome: 'Dr. João Silva',
    crm: '12345-SP',
    especialidade: 'Clínico Geral',
    email: 'joao.silva@email.com',
    telefone: '(11) 9999999'
  });

  const [locaisTrabalho, setLocaisTrabalho] = useState([
    { id: 1, nome: 'Hospital ABC', valor: 20 },
    { id: 2, nome: 'Clínica XYZ', valor: 150 }
  ]);

  const [preferencias, setPreferencias] = useState({
    notificacoesReavaliacao: true,
    backupAutomatico: true,
    modoEscuro: false,
    notificacoesEmail: false
  });

  const adicionarLocal = () => {
    const novoLocal = {
      id: Date.now(),
      nome: '',
      valor: 0
    };
    setLocaisTrabalho([...locaisTrabalho, novoLocal]);
  };

  const removerLocal = (id: number) => {
    setLocaisTrabalho(locaisTrabalho.filter(local => local.id !== id));
  };

  const salvarConfiguracoes = () => {
    // Implementar salvamento
    console.log('Configurações salvas');
  };

  return (
    <div className="space-y-6">
      {/* Perfil do Médico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Perfil do Médico</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nome">Nome Completo</Label>
              <Input
                id="nome"
                value={perfil.nome}
                onChange={(e) => setPerfil({...perfil, nome: e.target.value})}
                placeholder="Nome completo"
              />
            </div>
            
            <div>
              <Label htmlFor="crm">CRM</Label>
              <Input
                id="crm"
                value={perfil.crm}
                onChange={(e) => setPerfil({...perfil, crm: e.target.value})}
                placeholder="CRM"
              />
            </div>
            
            <div>
              <Label htmlFor="especialidade">Especialidade</Label>
              <Input
                id="especialidade"
                value={perfil.especialidade}
                onChange={(e) => setPerfil({...perfil, especialidade: e.target.value})}
                placeholder="Especialidade"
              />
            </div>
            
            <div>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={perfil.email}
                onChange={(e) => setPerfil({...perfil, email: e.target.value})}
                placeholder="E-mail"
              />
            </div>
            
            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={perfil.telefone}
                onChange={(e) => setPerfil({...perfil, telefone: e.target.value})}
                placeholder="Telefone"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locais de Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Locais de Trabalho</span>
            <Button size="sm" onClick={adicionarLocal}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locaisTrabalho.map((local) => (
              <div key={local.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <Input
                    value={local.nome}
                    onChange={(e) => {
                      const novosLocais = locaisTrabalho.map(l => 
                        l.id === local.id ? {...l, nome: e.target.value} : l
                      );
                      setLocaisTrabalho(novosLocais);
                    }}
                    placeholder="Nome do local"
                  />
                </div>
                <div className="w-32">
                  <Input
                    type="number"
                    value={local.valor}
                    onChange={(e) => {
                      const novosLocais = locaisTrabalho.map(l => 
                        l.id === local.id ? {...l, valor: Number(e.target.value)} : l
                      );
                      setLocaisTrabalho(novosLocais);
                    }}
                    placeholder="Valor"
                  />
                </div>
                <Button 
                  size="sm"
                  variant="destructive" 
                  onClick={() => removerLocal(local.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preferências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Preferências</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações de Reavaliação</Label>
                <p className="text-sm text-gray-600">Alertas quando pacientes retornarem</p>
              </div>
              <Switch
                checked={preferencias.notificacoesReavaliacao}
                onCheckedChange={(checked) => 
                  setPreferencias({...preferencias, notificacoesReavaliacao: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Backup Automático</Label>
                <p className="text-sm text-gray-600">Salvar dados automaticamente</p>
              </div>
              <Switch
                checked={preferencias.backupAutomatico}
                onCheckedChange={(checked) => 
                  setPreferencias({...preferencias, backupAutomatico: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Modo Escuro</Label>
                <p className="text-sm text-gray-600">Interface em tema escuro</p>
              </div>
              <Switch
                checked={preferencias.modoEscuro}
                onCheckedChange={(checked) => 
                  setPreferencias({...preferencias, modoEscuro: checked})
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Notificações por E-mail</Label>
                <p className="text-sm text-gray-600">Receber relatórios por e-mail</p>
              </div>
              <Switch
                checked={preferencias.notificacoesEmail}
                onCheckedChange={(checked) => 
                  setPreferencias({...preferencias, notificacoesEmail: checked})
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacidade e Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Privacidade e Segurança</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label>Dados dos Pacientes</Label>
              <p className="text-sm text-gray-600 mb-2">Os dados dos pacientes são mantidos por 30 dias e depois removidos automaticamente.</p>
              <Button variant="outline" size="sm">
                Exportar Meus Dados
              </Button>
            </div>
            
            <div>
              <Label>Conta</Label>
              <p className="text-sm text-gray-600 mb-2">Gerencie sua conta e configurações de segurança.</p>
              <Button variant="outline" size="sm">
                Alterar Senha
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão Salvar */}
      <div className="flex justify-end">
        <Button onClick={salvarConfiguracoes} className="bg-blue-600 hover:bg-blue-700">
          <Save className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
};

export default Configuracoes; 