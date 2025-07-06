import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlanoMedicoSelector } from "@/components/PlanoMedicoSelector"
import { EspecialidadeCombobox } from "@/components/ui/especialidade-combobox"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { formatarTelefone } from "@/lib/formatters"
import { User, Bell, Settings } from "lucide-react"

export default function Configuracoes() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    crmEstado: '',
    crmNumero: '',
    especialidade: '',
    endereco: ''
  });

  // Estados brasileiros para o CRM
  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Função para extrair estado e número do CRM
  const extrairCRM = (crm: string) => {
    if (!crm) return { estado: '', numero: '' };
    
    // Padrões comuns de CRM: CRM/SP 123456, CRM-SP 123456, SP 123456, etc.
    const match = crm.match(/(?:CRM[\/\-]?)?([A-Z]{2})\s*(\d+)/);
    if (match) {
      return { estado: match[1], numero: match[2] };
    }
    
    // Se não conseguir extrair, retorna como está
    return { estado: '', numero: crm };
  };

  // Inicializar formData com dados do perfil
  useEffect(() => {
    if (profile) {
      const crmExtraido = extrairCRM(profile.crm || '');
      setFormData({
        nome: profile.nome || '',
        email: profile.email || '',
        telefone: profile.telefone ? formatarTelefone(profile.telefone) : '',
        crmEstado: crmExtraido.estado,
        crmNumero: crmExtraido.numero,
        especialidade: profile.especialidade || '',
        endereco: profile.endereco || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTelefoneChange = (telefone: string) => {
    const telefoneFormatado = formatarTelefone(telefone);
    setFormData(prev => ({ ...prev, telefone: telefoneFormatado }));
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Montar CRM completo para salvar
      const crmCompleto = formData.crmEstado && formData.crmNumero 
        ? `CRM/${formData.crmEstado} ${formData.crmNumero}` 
        : '';

      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone.replace(/\D/g, ''), // Remove formatação antes de salvar
          crm: crmCompleto,
          especialidade: formData.especialidade,
          endereco: formData.endereco
        })
        .eq('user_id', profile.user_id);

      if (error) throw error;

      // Recarregar o perfil do banco de dados
      await refreshProfile();
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações e preferências do sistema
          </p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList className={`grid w-full ${profile?.tipo === 'medico' ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            {profile?.tipo === 'medico' && (
              <TabsTrigger value="plano">Plano de Acesso</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome</Label>
                    <Input 
                      id="nome" 
                      value={formData.nome} 
                      onChange={(e) => handleInputChange('nome', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      value={formData.email} 
                      onChange={(e) => handleInputChange('email', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input 
                      id="telefone" 
                      value={formData.telefone} 
                      onChange={(e) => handleTelefoneChange(e.target.value)}
                      placeholder="(11) 99999-0000" 
                      maxLength={15}
                    />
                  </div>
                  {profile?.tipo === 'medico' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="crm">CRM</Label>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">CRM/</span>
                          <Select 
                            value={formData.crmEstado} 
                            onValueChange={(value) => handleInputChange('crmEstado', value)}
                          >
                            <SelectTrigger className="w-20">
                              <SelectValue placeholder="UF" />
                            </SelectTrigger>
                            <SelectContent>
                              {estados.map((estado) => (
                                <SelectItem key={estado} value={estado}>
                                  {estado}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Input 
                            id="crmNumero" 
                            value={formData.crmNumero} 
                            onChange={(e) => handleInputChange('crmNumero', e.target.value.replace(/\D/g, ''))}
                            placeholder="123456" 
                            maxLength={6}
                            className="flex-1"
                          />
                        </div>
                        {formData.crmEstado && formData.crmNumero && (
                          <p className="text-xs text-muted-foreground">
                            CRM/{formData.crmEstado} {formData.crmNumero}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="especialidade">Especialidade</Label>
                        <EspecialidadeCombobox
                          value={formData.especialidade}
                          onValueChange={(value) => handleInputChange('especialidade', value)}
                          placeholder="Selecione uma especialidade..."
                        />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <Textarea 
                    id="endereco" 
                    value={formData.endereco} 
                    onChange={(e) => handleInputChange('endereco', e.target.value)}
                    placeholder="Endereço completo" 
                  />
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notificacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificações
                </CardTitle>
                <CardDescription>
                  Configure como você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações por email</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações por SMS</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>WhatsApp</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações pelo WhatsApp</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sistema">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações do Sistema
                </CardTitle>
                <CardDescription>
                  Preferências gerais do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Modo Escuro</Label>
                    <p className="text-sm text-muted-foreground">Alterar tema da interface</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Confirmações</Label>
                    <p className="text-sm text-muted-foreground">Pedir confirmação para ações importantes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {profile?.tipo === 'medico' && (
            <TabsContent value="plano">
              <PlanoMedicoSelector />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}