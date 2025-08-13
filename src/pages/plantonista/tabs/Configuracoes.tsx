import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
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
  const { profile, refreshProfile } = useAuth();
  const [perfil, setPerfil] = useState({
    nome: '',
    crm: '',
    especialidade: '',
    email: '',
    telefone: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: ''
  });

  const [locaisTrabalho, setLocaisTrabalho] = useState<any[]>([]);

  const [preferencias, setPreferencias] = useState({
    notificacoesReavaliacao: true,
    backupAutomatico: true,
    modoEscuro: false,
    notificacoesEmail: false
  });

  const [salvando, setSalvando] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (profile) {
      setPerfil({
        nome: profile.nome || '',
        crm: profile.crm || '',
        especialidade: profile.especialidade || '',
        email: profile.email || '',
        telefone: profile.telefone || '',
        endereco: profile.endereco || '',
        cidade: profile.cidade || '',
        estado: profile.estado || '',
        cep: profile.cep || ''
      });
    }
  }, [profile]);

  // Carregar locais de trabalho
  useEffect(() => {
    const carregarLocais = async () => {
      if (!profile?.id) return;
      
      const { data, error } = await supabase
        .from('plantonista_locais_trabalho')
        .select('*')
        .eq('medico_id', profile.id)
        .order('nome');
      
      if (!error && data) {
        setLocaisTrabalho(data);
      }
    };
    
    carregarLocais();
  }, [profile?.id]);

  const salvarPerfil = async () => {
    if (!profile?.id) return;
    
    setSalvando(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: perfil.nome,
          crm: perfil.crm,
          especialidade: perfil.especialidade,
          telefone: perfil.telefone,
          endereco: perfil.endereco,
          cidade: perfil.cidade,
          estado: perfil.estado,
          cep: perfil.cep
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
      await refreshProfile();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro ao salvar perfil');
    } finally {
      setSalvando(false);
    }
  };

  const salvarConfiguracoes = async () => {
    await salvarPerfil();
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
                disabled
                placeholder="E-mail (não pode ser alterado)"
                className="bg-gray-100"
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

            <div>
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                value={perfil.endereco}
                onChange={(e) => setPerfil({...perfil, endereco: e.target.value})}
                placeholder="Endereço completo"
              />
            </div>
            
            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                value={perfil.cidade}
                onChange={(e) => setPerfil({...perfil, cidade: e.target.value})}
                placeholder="Cidade"
              />
            </div>
            
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                value={perfil.estado}
                onChange={(e) => setPerfil({...perfil, estado: e.target.value})}
                placeholder="Estado"
                maxLength={2}
              />
            </div>
            
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={perfil.cep}
                onChange={(e) => setPerfil({...perfil, cep: e.target.value})}
                placeholder="CEP"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locais de Trabalho */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Locais de Trabalho</span>
              <Badge variant="secondary">{locaisTrabalho.length}</Badge>
            </div>
            <Button size="sm" onClick={() => window.open('/plantonista/locais', '_blank')}>
              <Building className="h-4 w-4 mr-2" />
              Gerenciar Locais
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {locaisTrabalho.length > 0 ? (
            <div className="space-y-3">
              {locaisTrabalho.slice(0, 5).map((local) => (
                <div key={local.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="font-medium">{local.nome}</p>
                      <p className="text-sm text-gray-600">{local.tipo}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {local.regra === 'fixo' ? 'Valor Fixo' : 'Por Faixa'}
                    </p>
                    <Badge variant={local.status === 'ativo' ? 'default' : 'secondary'}>
                      {local.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {locaisTrabalho.length > 5 && (
                <div className="text-center text-sm text-gray-500">
                  ... e mais {locaisTrabalho.length - 5} local(is)
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <Building className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-2">Nenhum local de trabalho cadastrado</p>
              <Button size="sm" onClick={() => window.open('/plantonista/locais', '_blank')}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Local
              </Button>
            </div>
          )}
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
        <Button 
          onClick={salvarConfiguracoes} 
          disabled={salvando}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          {salvando ? 'Salvando...' : 'Salvar Perfil'}
        </Button>
      </div>
    </div>
  );
};

export default Configuracoes; 