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
import { User, Bell, Settings, Calendar, Clock, Plus, Trash2 } from "lucide-react"

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

  // Configurações de agenda
  const [agendaConfig, setAgendaConfig] = useState({
    horarioInicioManha: '08:00',
    horarioFimManha: '12:00',
    horarioInicioTarde: '14:00',
    horarioFimTarde: '18:00',
    duracaoConsulta: 30,
    intervalos: [
      { inicio: '10:00', fim: '10:15', tipo: 'intervalo', descricao: 'Intervalo manhã' },
      { inicio: '16:00', fim: '16:15', tipo: 'intervalo', descricao: 'Intervalo tarde' }
    ],
    diasSemana: {
      segunda: true,
      terca: true,
      quarta: true,
      quinta: true,
      sexta: true,
      sabado: false,
      domingo: false
    },
    permitirEncaixe: true,
    antecedenciaMinima: 24, // horas
    limiteCancelamento: 2 // horas
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

  const handleAgendaConfigChange = (field: string, value: any) => {
    setAgendaConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiaSemanaChange = (dia: string, ativo: boolean) => {
    setAgendaConfig(prev => ({
      ...prev,
      diasSemana: {
        ...prev.diasSemana,
        [dia]: ativo
      }
    }));
  };

  const adicionarIntervalo = () => {
    setAgendaConfig(prev => ({
      ...prev,
      intervalos: [
        ...prev.intervalos,
        { inicio: '12:00', fim: '12:15', tipo: 'intervalo', descricao: 'Novo intervalo' }
      ]
    }));
  };

  const removerIntervalo = (index: number) => {
    setAgendaConfig(prev => ({
      ...prev,
      intervalos: prev.intervalos.filter((_, i) => i !== index)
    }));
  };

  const atualizarIntervalo = (index: number, field: string, value: string) => {
    setAgendaConfig(prev => ({
      ...prev,
      intervalos: prev.intervalos.map((intervalo, i) => 
        i === index ? { ...intervalo, [field]: value } : intervalo
      )
    }));
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
          <TabsList className={`grid w-full ${profile?.tipo === 'medico' ? 'grid-cols-5' : 'grid-cols-3'}`}>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            {profile?.tipo === 'medico' && (
              <>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
                <TabsTrigger value="plano">Plano de Acesso</TabsTrigger>
              </>
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
            <>
              <TabsContent value="agenda">
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Configurações de Agenda
                      </CardTitle>
                      <CardDescription>
                        Configure seus horários de atendimento e preferências da agenda
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Horários de funcionamento */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Horários de Funcionamento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <h4 className="font-medium text-primary">Manhã</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>Início</Label>
                                <Input
                                  type="time"
                                  value={agendaConfig.horarioInicioManha}
                                  onChange={(e) => handleAgendaConfigChange('horarioInicioManha', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Fim</Label>
                                <Input
                                  type="time"
                                  value={agendaConfig.horarioFimManha}
                                  onChange={(e) => handleAgendaConfigChange('horarioFimManha', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                          <div className="space-y-4">
                            <h4 className="font-medium text-primary">Tarde</h4>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-2">
                                <Label>Início</Label>
                                <Input
                                  type="time"
                                  value={agendaConfig.horarioInicioTarde}
                                  onChange={(e) => handleAgendaConfigChange('horarioInicioTarde', e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Fim</Label>
                                <Input
                                  type="time"
                                  value={agendaConfig.horarioFimTarde}
                                  onChange={(e) => handleAgendaConfigChange('horarioFimTarde', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Duração da consulta */}
                      <div className="space-y-2">
                        <Label>Duração padrão da consulta (minutos)</Label>
                        <Select 
                          value={agendaConfig.duracaoConsulta.toString()} 
                          onValueChange={(value) => handleAgendaConfigChange('duracaoConsulta', parseInt(value))}
                        >
                          <SelectTrigger className="w-48">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 minutos</SelectItem>
                            <SelectItem value="20">20 minutos</SelectItem>
                            <SelectItem value="30">30 minutos</SelectItem>
                            <SelectItem value="45">45 minutos</SelectItem>
                            <SelectItem value="60">60 minutos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Dias da semana */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Dias de Atendimento</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(agendaConfig.diasSemana).map(([dia, ativo]) => (
                            <div key={dia} className="flex items-center space-x-2">
                              <Switch
                                id={dia}
                                checked={ativo}
                                onCheckedChange={(checked) => handleDiaSemanaChange(dia, checked)}
                              />
                              <Label htmlFor={dia} className="capitalize">
                                {dia === 'terca' ? 'Terça' : 
                                 dia === 'quarta' ? 'Quarta' :
                                 dia === 'quinta' ? 'Quinta' :
                                 dia === 'sabado' ? 'Sábado' : dia}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Intervalos */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">Intervalos</h3>
                          <Button onClick={adicionarIntervalo} size="sm" variant="outline">
                            <Plus className="h-4 w-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                        <div className="space-y-2">
                          {agendaConfig.intervalos.map((intervalo, index) => (
                            <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <Input
                                type="time"
                                value={intervalo.inicio}
                                onChange={(e) => atualizarIntervalo(index, 'inicio', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">até</span>
                              <Input
                                type="time"
                                value={intervalo.fim}
                                onChange={(e) => atualizarIntervalo(index, 'fim', e.target.value)}
                                className="w-32"
                              />
                              <Input
                                placeholder="Descrição"
                                value={intervalo.descricao}
                                onChange={(e) => atualizarIntervalo(index, 'descricao', e.target.value)}
                                className="flex-1"
                              />
                              <Button
                                onClick={() => removerIntervalo(index)}
                                size="sm"
                                variant="outline"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Regras de agendamento */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Regras de Agendamento</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Antecedência mínima (horas)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={agendaConfig.antecedenciaMinima}
                              onChange={(e) => handleAgendaConfigChange('antecedenciaMinima', parseInt(e.target.value) || 0)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Limite para cancelamento (horas)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={agendaConfig.limiteCancelamento}
                              onChange={(e) => handleAgendaConfigChange('limiteCancelamento', parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="permitirEncaixe"
                            checked={agendaConfig.permitirEncaixe}
                            onCheckedChange={(checked) => handleAgendaConfigChange('permitirEncaixe', checked)}
                          />
                          <Label htmlFor="permitirEncaixe">Permitir consultas de encaixe</Label>
                        </div>
                      </div>

                      <Button className="w-full">
                        Salvar Configurações da Agenda
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="plano">
                <PlanoMedicoSelector />
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}