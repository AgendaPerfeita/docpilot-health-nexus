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
import { User, Bell, Settings, Calendar, Clock, Plus, Trash2, FileText, Upload, Type, Image, Info, Eye, Shield } from "lucide-react"
import { useTheme } from 'next-themes';
import DigitalCertificateConfig from '@/components/certificates/DigitalCertificateConfig';

export default function Configuracoes() {
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
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

  // Configurações de receituário
  const [receituarioConfig, setReceituarioConfig] = useState({
    // Layout e design
    fonte: 'Arial',
    tamanhoFonte: 12,
    logoUrl: '',
    mostrarLogo: true,
    posicaoLogo: 'esquerda', // esquerda, centro, direita
    
    // Cabeçalho
    nomeClinica: '',
    enderecoClinica: '',
    telefoneClinica: '',
    emailClinica: '',
    mostrarCabecalho: true,
    
    // Informações do médico
    mostrarCRM: true,
    mostrarEspecialidade: true,
    
    // Assinatura
    tipoAssinatura: 'nome', // nome, digital, manuscrita
    assinaturaDigitalUrl: '',
    posicaoAssinatura: 'direita', // esquerda, centro, direita
    mostrarDataAssinatura: true,
    
    // Rodapé
    textoRodape: '',
    mostrarRodape: false,
    
    // Configurações gerais
    margemSuperior: 20,
    margemInferior: 20,
    margemEsquerda: 15,
    margemDireita: 15,
    espacamentoEntreLinhas: 1.2
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

  const handleReceituarioConfigChange = (field: string, value: any) => {
    setReceituarioConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        setReceituarioConfig(prev => ({
          ...prev,
          logoUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAssinaturaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const assinaturaUrl = e.target?.result as string;
        setReceituarioConfig(prev => ({
          ...prev,
          assinaturaDigitalUrl: assinaturaUrl
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // Montar CRM completo para salvar
      const crmCompleto = formData.crmEstado && formData.crmNumero 
        ? `CRM/${formData.crmEstado} ${formData.crmNumero}` 
        : '';
      const updateData = {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone.replace(/\D/g, ''),
        crm: crmCompleto,
        especialidade: formData.especialidade,
        endereco: formData.endereco
      };
      if (profile.tipo === 'clinica') {
        updateData['horarioInicioManha'] = agendaConfig.horarioInicioManha;
        updateData['horarioFimManha'] = agendaConfig.horarioFimManha;
        updateData['horarioInicioTarde'] = agendaConfig.horarioInicioTarde;
        updateData['horarioFimTarde'] = agendaConfig.horarioFimTarde;
      }
      const { error } = await supabase
        .from('profiles')
        .update(updateData)
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
          <TabsList className={`grid w-full ${profile?.tipo === 'medico' ? 'grid-cols-7' : 'grid-cols-4'}`}>
            <TabsTrigger value="perfil">Perfil</TabsTrigger>
            <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
            <TabsTrigger value="sistema">Sistema</TabsTrigger>
            <TabsTrigger value="agenda">Agenda</TabsTrigger>
            {profile?.tipo === 'medico' && (
              <>
                <TabsTrigger value="certificados">Certificados</TabsTrigger>
                <TabsTrigger value="receituario">Receituário</TabsTrigger>
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
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                  />
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

          {(profile?.tipo === 'medico' || profile?.tipo === 'clinica') && (
            <>
              <TabsContent value="agenda">
                <div className="space-y-4">
                  {profile?.tipo === 'medico' ? (
                    // Configuração para Médico - configurar por local de trabalho
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Configurações de Agenda - Médico
                        </CardTitle>
                        <CardDescription>
                          Configure seus horários de atendimento para cada local onde você trabalha
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Seletor de Local de Trabalho */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold">Local de Trabalho</h3>
                          <div className="flex gap-4">
                            <div className="space-y-2">
                              <Label>Configurar agenda para:</Label>
                              <Select defaultValue="individual">
                                <SelectTrigger className="w-64">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="individual">Atendimento Individual</SelectItem>
                                  {/* Aqui seria listado as clínicas vinculadas */}
                                  <SelectItem value="clinica-1">Clínica ABC - Centro</SelectItem>
                                  <SelectItem value="clinica-2">Hospital XYZ - Zona Norte</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

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
                  ) : (
                    // Configuração para Clínica - definir horários e visualizar médicos vinculados
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Configurações de Agenda - Clínica
                        </CardTitle>
                        <CardDescription>
                          Defina o horário de funcionamento da clínica. Os médicos só poderão configurar agendas dentro deste intervalo.
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
                        <Button className="w-full" onClick={handleSave} disabled={loading}>
                          {loading ? "Salvando..." : "Salvar Horários de Funcionamento"}
                        </Button>
                        {/* Lista de médicos vinculados */}
                        <div className="space-y-4 mt-8">
                          <h3 className="text-lg font-semibold">Médicos Vinculados</h3>
                          {/* Aqui deve ser renderizada a lista de médicos vinculados, como era antes */}
                          {/* Exemplo estático, substitua por renderização dinâmica se necessário */}
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="font-medium">Dr. João Silva</h4>
                                <p className="text-sm text-muted-foreground">Cardiologia - CRM 12345</p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Settings className="h-4 w-4 mr-2" />
                                Ver Agenda
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Horário Manhã:</span>
                                <p>08:00 - 12:00</p>
                              </div>
                              <div>
                                <span className="font-medium">Horário Tarde:</span>
                                <p>14:00 - 18:00</p>
                              </div>
                              <div>
                                <span className="font-medium">Duração consulta:</span>
                                <p>30 minutos</p>
                              </div>
                              <div>
                                <span className="font-medium">Dias ativos:</span>
                                <p>Seg, Ter, Qua, Qui, Sex</p>
                              </div>
                            </div>
                          </div>
                          {/* Repita para outros médicos vinculados... */}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="receituario">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Configurações */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configurações
                      </CardTitle>
                      <CardDescription>
                        Personalize o layout das suas prescrições
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 max-h-[600px] overflow-y-auto">
                      {/* Layout e Design */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Type className="h-5 w-5" />
                          Layout e Design
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Fonte</Label>
                            <Select 
                              value={receituarioConfig.fonte} 
                              onValueChange={(value) => handleReceituarioConfigChange('fonte', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Calibri">Calibri</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                                <SelectItem value="Georgia">Georgia</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Tamanho da Fonte</Label>
                            <Select 
                              value={receituarioConfig.tamanhoFonte.toString()} 
                              onValueChange={(value) => handleReceituarioConfigChange('tamanhoFonte', parseInt(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10pt</SelectItem>
                                <SelectItem value="11">11pt</SelectItem>
                                <SelectItem value="12">12pt</SelectItem>
                                <SelectItem value="14">14pt</SelectItem>
                                <SelectItem value="16">16pt</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>Espaçamento entre linhas</Label>
                            <Select 
                              value={receituarioConfig.espacamentoEntreLinhas.toString()} 
                              onValueChange={(value) => handleReceituarioConfigChange('espacamentoEntreLinhas', parseFloat(value))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">Simples</SelectItem>
                                <SelectItem value="1.2">1.2</SelectItem>
                                <SelectItem value="1.5">1.5</SelectItem>
                                <SelectItem value="2">Duplo</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Logotipo */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <Image className="h-5 w-5" />
                          Logotipo
                        </h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mostrarLogo"
                              checked={receituarioConfig.mostrarLogo}
                              onCheckedChange={(checked) => handleReceituarioConfigChange('mostrarLogo', checked)}
                            />
                            <Label htmlFor="mostrarLogo">Mostrar logotipo no cabeçalho</Label>
                          </div>
                          
                          {receituarioConfig.mostrarLogo && (
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label>Upload do Logotipo</Label>
                                <div className="flex items-center gap-4">
                                  <Button variant="outline" className="relative">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Escolher arquivo
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={handleLogoUpload}
                                      className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                  </Button>
                                  {receituarioConfig.logoUrl && (
                                    <div className="flex items-center gap-2">
                                      <img 
                                        src={receituarioConfig.logoUrl} 
                                        alt="Preview" 
                                        className="h-12 w-12 object-contain border rounded"
                                      />
                                      <span className="text-sm text-muted-foreground">Logo carregado</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Posição do Logo</Label>
                                <Select 
                                  value={receituarioConfig.posicaoLogo} 
                                  onValueChange={(value) => handleReceituarioConfigChange('posicaoLogo', value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="esquerda">Esquerda</SelectItem>
                                    <SelectItem value="centro">Centro</SelectItem>
                                    <SelectItem value="direita">Direita</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informações da Clínica */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Informações da Clínica/Consultório</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mostrarCabecalho"
                              checked={receituarioConfig.mostrarCabecalho}
                              onCheckedChange={(checked) => handleReceituarioConfigChange('mostrarCabecalho', checked)}
                            />
                            <Label htmlFor="mostrarCabecalho">Mostrar informações no cabeçalho</Label>
                          </div>
                          
                          {receituarioConfig.mostrarCabecalho && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label>Nome da Clínica/Consultório</Label>
                                <Input
                                  value={receituarioConfig.nomeClinica}
                                  onChange={(e) => handleReceituarioConfigChange('nomeClinica', e.target.value)}
                                  placeholder="Ex: Clínica Médica Dr. Silva"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Telefone</Label>
                                <Input
                                  value={receituarioConfig.telefoneClinica}
                                  onChange={(e) => handleReceituarioConfigChange('telefoneClinica', e.target.value)}
                                  placeholder="(11) 99999-9999"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Endereço</Label>
                                <Input
                                  value={receituarioConfig.enderecoClinica}
                                  onChange={(e) => handleReceituarioConfigChange('enderecoClinica', e.target.value)}
                                  placeholder="Rua, número, bairro, cidade"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                  value={receituarioConfig.emailClinica}
                                  onChange={(e) => handleReceituarioConfigChange('emailClinica', e.target.value)}
                                  placeholder="contato@clinica.com.br"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informações do Médico */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Informações do Médico</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mostrarCRM"
                              checked={receituarioConfig.mostrarCRM}
                              onCheckedChange={(checked) => handleReceituarioConfigChange('mostrarCRM', checked)}
                            />
                            <Label htmlFor="mostrarCRM">Mostrar CRM</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mostrarEspecialidade"
                              checked={receituarioConfig.mostrarEspecialidade}
                              onCheckedChange={(checked) => handleReceituarioConfigChange('mostrarEspecialidade', checked)}
                            />
                            <Label htmlFor="mostrarEspecialidade">Mostrar especialidade</Label>
                          </div>
                        </div>
                      </div>

                      {/* Assinatura */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Assinatura</h3>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label>Tipo de Assinatura</Label>
                            <Select 
                              value={receituarioConfig.tipoAssinatura} 
                              onValueChange={(value) => handleReceituarioConfigChange('tipoAssinatura', value)}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="nome">Apenas nome</SelectItem>
                                <SelectItem value="digital">Assinatura digital</SelectItem>
                                <SelectItem value="manuscrita">Espaço para assinatura manuscrita</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {receituarioConfig.tipoAssinatura === 'digital' && (
                            <div className="space-y-2">
                              <Label>Upload da Assinatura Digital</Label>
                              <div className="flex items-center gap-4">
                                <Button variant="outline" className="relative">
                                  <Upload className="h-4 w-4 mr-2" />
                                  Escolher arquivo
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAssinaturaUpload}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                  />
                                </Button>
                                {receituarioConfig.assinaturaDigitalUrl && (
                                  <div className="flex items-center gap-2">
                                    <img 
                                      src={receituarioConfig.assinaturaDigitalUrl} 
                                      alt="Preview Assinatura" 
                                      className="h-8 w-20 object-contain border rounded"
                                    />
                                    <span className="text-sm text-muted-foreground">Assinatura carregada</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Posição da Assinatura</Label>
                              <Select 
                                value={receituarioConfig.posicaoAssinatura} 
                                onValueChange={(value) => handleReceituarioConfigChange('posicaoAssinatura', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="esquerda">Esquerda</SelectItem>
                                  <SelectItem value="centro">Centro</SelectItem>
                                  <SelectItem value="direita">Direita</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="mostrarDataAssinatura"
                                checked={receituarioConfig.mostrarDataAssinatura}
                                onCheckedChange={(checked) => handleReceituarioConfigChange('mostrarDataAssinatura', checked)}
                              />
                              <Label htmlFor="mostrarDataAssinatura">Mostrar data na assinatura</Label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Rodapé */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Rodapé</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mostrarRodape"
                              checked={receituarioConfig.mostrarRodape}
                              onCheckedChange={(checked) => handleReceituarioConfigChange('mostrarRodape', checked)}
                            />
                            <Label htmlFor="mostrarRodape">Mostrar rodapé personalizado</Label>
                          </div>
                          
                          {receituarioConfig.mostrarRodape && (
                            <div className="space-y-2">
                              <Label>Texto do Rodapé</Label>
                              <Textarea
                                value={receituarioConfig.textoRodape}
                                onChange={(e) => handleReceituarioConfigChange('textoRodape', e.target.value)}
                                placeholder="Ex: Este medicamento não pode ser fracionado. Válido por 30 dias."
                                rows={3}
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Margens */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Margens (mm)</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Superior</Label>
                            <Input
                              type="number"
                              min="10"
                              max="50"
                              value={receituarioConfig.margemSuperior}
                              onChange={(e) => handleReceituarioConfigChange('margemSuperior', parseInt(e.target.value) || 20)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Inferior</Label>
                            <Input
                              type="number"
                              min="10"
                              max="50"
                              value={receituarioConfig.margemInferior}
                              onChange={(e) => handleReceituarioConfigChange('margemInferior', parseInt(e.target.value) || 20)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Esquerda</Label>
                            <Input
                              type="number"
                              min="10"
                              max="50"
                              value={receituarioConfig.margemEsquerda}
                              onChange={(e) => handleReceituarioConfigChange('margemEsquerda', parseInt(e.target.value) || 15)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Direita</Label>
                            <Input
                              type="number"
                              min="10"
                              max="50"
                              value={receituarioConfig.margemDireita}
                              onChange={(e) => handleReceituarioConfigChange('margemDireita', parseInt(e.target.value) || 15)}
                            />
                          </div>
                        </div>
                      </div>

                      <Button className="w-full">
                        Salvar Configurações do Receituário
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Preview do Receituário
                      </CardTitle>
                      <CardDescription>
                        Visualização em tempo real
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="bg-white border border-gray-200 mx-4 mb-4 shadow-sm" style={{ aspectRatio: '210/297' }}>
                        {/* Simulação da página A4 */}
                        <div 
                          className="h-full p-4 text-black"
                          style={{
                            fontFamily: receituarioConfig.fonte,
                            fontSize: `${receituarioConfig.tamanhoFonte}px`,
                            lineHeight: receituarioConfig.espacamentoEntreLinhas,
                            paddingTop: `${receituarioConfig.margemSuperior}px`,
                            paddingBottom: `${receituarioConfig.margemInferior}px`,
                            paddingLeft: `${receituarioConfig.margemEsquerda}px`,
                            paddingRight: `${receituarioConfig.margemDireita}px`,
                          }}
                        >
                          {/* Cabeçalho com Logo */}
                          {(receituarioConfig.mostrarLogo && receituarioConfig.logoUrl) || receituarioConfig.mostrarCabecalho ? (
                            <div className="border-b border-gray-300 pb-4 mb-6">
                              <div className={`flex items-start gap-4 ${
                                receituarioConfig.posicaoLogo === 'centro' ? 'justify-center text-center' :
                                receituarioConfig.posicaoLogo === 'direita' ? 'justify-end text-right' : 'justify-start text-left'
                              }`}>
                                {receituarioConfig.mostrarLogo && receituarioConfig.logoUrl && (
                                  <img 
                                    src={receituarioConfig.logoUrl} 
                                    alt="Logo" 
                                    className="h-16 w-auto object-contain"
                                  />
                                )}
                                {receituarioConfig.mostrarCabecalho && (
                                  <div className="flex-1">
                                    {receituarioConfig.nomeClinica && (
                                      <h1 className="font-bold text-lg mb-1">{receituarioConfig.nomeClinica}</h1>
                                    )}
                                    {receituarioConfig.enderecoClinica && (
                                      <p className="text-sm mb-1">{receituarioConfig.enderecoClinica}</p>
                                    )}
                                    <div className="text-sm">
                                      {receituarioConfig.telefoneClinica && (
                                        <span>Tel: {receituarioConfig.telefoneClinica}</span>
                                      )}
                                      {receituarioConfig.telefoneClinica && receituarioConfig.emailClinica && (
                                        <span> | </span>
                                      )}
                                      {receituarioConfig.emailClinica && (
                                        <span>Email: {receituarioConfig.emailClinica}</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : null}

                          {/* Informações do Médico */}
                          <div className="mb-6">
                            <p className="font-semibold">Dr(a). {formData.nome || 'Nome do Médico'}</p>
                            {receituarioConfig.mostrarEspecialidade && formData.especialidade && (
                              <p className="text-sm">{formData.especialidade}</p>
                            )}
                            {receituarioConfig.mostrarCRM && (formData.crmEstado || formData.crmNumero) && (
                              <p className="text-sm">CRM/{formData.crmEstado} {formData.crmNumero}</p>
                            )}
                          </div>

                          {/* Dados do Paciente */}
                          <div className="mb-6">
                            <p><strong>Paciente:</strong> João Silva</p>
                            <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                          </div>

                          {/* Prescrição de Exemplo */}
                          <div className="mb-8">
                            <h3 className="font-semibold mb-3">PRESCRIÇÃO MÉDICA</h3>
                            <div className="space-y-2">
                              <p>1. Dipirona Sódica 500mg</p>
                              <p className="text-sm ml-4">Tomar 1 comprimido de 6 em 6 horas se dor</p>
                              <p className="text-sm ml-4">Quantidade: 20 comprimidos</p>
                              
                              <p className="mt-4">2. Omeprazol 20mg</p>
                              <p className="text-sm ml-4">Tomar 1 cápsula pela manhã em jejum</p>
                              <p className="text-sm ml-4">Quantidade: 30 cápsulas</p>
                            </div>
                          </div>

                          {/* Área de Assinatura */}
                          <div className={`mt-auto ${
                            receituarioConfig.posicaoAssinatura === 'centro' ? 'text-center' :
                            receituarioConfig.posicaoAssinatura === 'direita' ? 'text-right' : 'text-left'
                          }`}>
                            {receituarioConfig.tipoAssinatura === 'digital' && receituarioConfig.assinaturaDigitalUrl ? (
                              <div>
                                <img 
                                  src={receituarioConfig.assinaturaDigitalUrl} 
                                  alt="Assinatura" 
                                  className="h-12 w-auto mx-auto"
                                />
                                <p className="text-sm border-t border-gray-400 pt-1 mt-2 inline-block">
                                  Dr(a). {formData.nome || 'Nome do Médico'}
                                </p>
                              </div>
                            ) : receituarioConfig.tipoAssinatura === 'manuscrita' ? (
                              <div>
                                <div className="h-16 border-b border-gray-400 mb-2" style={{ minWidth: '200px' }}></div>
                                <p className="text-sm">Dr(a). {formData.nome || 'Nome do Médico'}</p>
                              </div>
                            ) : (
                              <div>
                                <p className="text-sm border-b border-gray-400 pb-1 inline-block">
                                  Dr(a). {formData.nome || 'Nome do Médico'}
                                </p>
                              </div>
                            )}
                            {receituarioConfig.mostrarDataAssinatura && (
                              <p className="text-xs mt-2">{new Date().toLocaleDateString('pt-BR')}</p>
                            )}
                          </div>

                          {/* Rodapé */}
                          {receituarioConfig.mostrarRodape && receituarioConfig.textoRodape && (
                            <div className="border-t border-gray-300 pt-2 mt-4">
                              <p className="text-xs text-center">{receituarioConfig.textoRodape}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="certificados">
                <DigitalCertificateConfig />
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