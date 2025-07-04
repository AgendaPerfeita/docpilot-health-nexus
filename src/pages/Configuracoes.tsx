import { useState } from "react"
import { Settings, User, Bell, Shield, Palette, Clock, Mail, Smartphone, Building, CreditCard } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockConvenios } from "./mockConvenios"

interface ClinicSettings {
  name: string
  email: string
  phone: string
  address: string
  cnpj: string
  businessHours: {
    monday: { start: string; end: string; active: boolean }
    tuesday: { start: string; end: string; active: boolean }
    wednesday: { start: string; end: string; active: boolean }
    thursday: { start: string; end: string; active: boolean }
    friday: { start: string; end: string; active: boolean }
    saturday: { start: string; end: string; active: boolean }
    sunday: { start: string; end: string; active: boolean }
  }
  notifications: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    appointments: boolean
    payments: boolean
    marketing: boolean
  }
  subscription: {
    plan: 'free' | 'basic' | 'premium'
    expiresAt: string
    features: string[]
  }
}

interface Convenio {
  operadora: string;
  planos: string[];
}

const mockSettings: ClinicSettings = {
  name: 'Clínica SmartDoc',
  email: 'contato@smartdoc.com',
  phone: '(11) 99999-0000',
  address: 'Rua das Flores, 123 - São Paulo, SP',
  cnpj: '12.345.678/0001-90',
  businessHours: {
    monday: { start: '08:00', end: '18:00', active: true },
    tuesday: { start: '08:00', end: '18:00', active: true },
    wednesday: { start: '08:00', end: '18:00', active: true },
    thursday: { start: '08:00', end: '18:00', active: true },
    friday: { start: '08:00', end: '17:00', active: true },
    saturday: { start: '08:00', end: '12:00', active: true },
    sunday: { start: '08:00', end: '12:00', active: false }
  },
  notifications: {
    email: true,
    sms: false,
    whatsapp: true,
    appointments: true,
    payments: true,
    marketing: false
  },
  subscription: {
    plan: 'basic',
    expiresAt: '2024-12-31',
    features: ['Prontuário Eletrônico', 'Agendamento Online', 'Relatórios Básicos']
  }
}

export default function Configuracoes() {
  const [settings, setSettings] = useState<ClinicSettings>(mockSettings)
  const [activeTab, setActiveTab] = useState('geral')
  const [convenios, setConvenios] = useState<Convenio[]>([...mockConvenios])
  const [novaOperadora, setNovaOperadora] = useState("")

  const dayNames = {
    monday: 'Segunda-feira',
    tuesday: 'Terça-feira', 
    wednesday: 'Quarta-feira',
    thursday: 'Quinta-feira',
    friday: 'Sexta-feira',
    saturday: 'Sábado',
    sunday: 'Domingo'
  }

  const handleSave = () => {
    console.log('Salvando configurações:', settings)
  }

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'free': return <Badge variant="outline">Gratuito</Badge>
      case 'basic': return <Badge className="bg-blue-100 text-blue-800">Básico</Badge>
      case 'premium': return <Badge className="bg-purple-100 text-purple-800">Premium</Badge>
      default: return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie as configurações da clínica</p>
        </div>
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="horarios">Horários</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="integracao">Integração</TabsTrigger>
          <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Dados da Clínica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nome da Clínica</Label>
                  <Input
                    id="clinicName"
                    value={settings.name}
                    onChange={(e) => setSettings({...settings, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="clinicEmail">Email</Label>
                  <Input
                    id="clinicEmail"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings({...settings, email: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Telefone</Label>
                  <Input
                    id="clinicPhone"
                    value={settings.phone}
                    onChange={(e) => setSettings({...settings, phone: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicCnpj">CNPJ</Label>
                  <Input
                    id="clinicCnpj"
                    value={settings.cnpj}
                    onChange={(e) => setSettings({...settings, cnpj: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clinicAddress">Endereço</Label>
                  <Textarea
                    id="clinicAddress"
                    value={settings.address}
                    onChange={(e) => setSettings({...settings, address: e.target.value})}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Dados do Administrador
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nome Completo</Label>
                  <Input id="adminName" defaultValue="Dr. João Silva" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email</Label>
                  <Input id="adminEmail" type="email" defaultValue="joao.silva@smartdoc.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminCrm">CRM</Label>
                  <Input id="adminCrm" defaultValue="CRM/SP 123456" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminSpecialty">Especialidade</Label>
                  <Input id="adminSpecialty" defaultValue="Clínica Geral" />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Alterar Senha</h4>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button variant="outline" size="sm">Alterar Senha</Button>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Convênios Aceitos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {convenios.length === 0 && <span className="text-muted-foreground">Nenhum convênio cadastrado.</span>}
              {convenios.map((c, idx) => (
                <div key={idx} className="mb-4">
                  <Badge className="flex items-center gap-2 mb-1">
                    {c.operadora}
                    <Button size="sm" variant="ghost" onClick={() => setConvenios(convenios.filter((_, i) => i !== idx))}>
                      Remover Operadora
                    </Button>
                  </Badge>
                  <div className="ml-4 flex flex-wrap gap-2">
                    {c.planos.map((plano, pidx) => (
                      <Badge key={pidx} variant="secondary" className="flex items-center gap-2">
                        {plano}
                        <Button size="sm" variant="ghost" onClick={() => {
                          setConvenios(convenios.map((op, oi) =>
                            oi === idx
                              ? { ...op, planos: op.planos.filter((_, pi) => pi !== pidx) }
                              : op
                          ))
                        }}>
                          Remover
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {/* Formulário para adicionar novo plano à operadora */}
                  <form className="flex gap-2 mt-1" onSubmit={e => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    const novoPlano = (form.novoPlano as HTMLInputElement).value.trim();
                    if (novoPlano && !c.planos.includes(novoPlano)) {
                      setConvenios(convenios.map((op, oi) =>
                        oi === idx
                          ? { ...op, planos: [...op.planos, novoPlano] }
                          : op
                      ));
                      form.novoPlano.value = "";
                    }
                  }}>
                    <Input name="novoPlano" placeholder={`Novo plano para ${c.operadora}`} />
                    <Button type="submit">Adicionar Plano</Button>
                  </form>
                </div>
              ))}
              {/* Formulário para adicionar nova operadora */}
              <form className="flex gap-2 mt-2" onSubmit={e => {
                e.preventDefault();
                if (novaOperadora.trim() && !convenios.some(c => c.operadora.toLowerCase() === novaOperadora.trim().toLowerCase())) {
                  setConvenios([...convenios, { operadora: novaOperadora.trim(), planos: [] }]);
                  setNovaOperadora("");
                }
              }}>
                <Input
                  placeholder="Nova operadora"
                  value={novaOperadora}
                  onChange={e => setNovaOperadora(e.target.value)}
                />
                <Button type="submit">Adicionar Operadora</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="horarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horários de Funcionamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(settings.businessHours).map(([day, hours]) => (
                  <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-32">
                      <span className="font-medium">{dayNames[day as keyof typeof dayNames]}</span>
                    </div>
                    <Switch
                      checked={hours.active}
                      onCheckedChange={(checked) => 
                        setSettings({
                          ...settings,
                          businessHours: {
                            ...settings.businessHours,
                            [day]: { ...hours, active: checked }
                          }
                        })
                      }
                    />
                    {hours.active && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={hours.start}
                          onChange={(e) => 
                            setSettings({
                              ...settings,
                              businessHours: {
                                ...settings.businessHours,
                                [day]: { ...hours, start: e.target.value }
                              }
                            })
                          }
                          className="w-32"
                        />
                        <span>às</span>
                        <Input
                          type="time"
                          value={hours.end}
                          onChange={(e) => 
                            setSettings({
                              ...settings,
                              businessHours: {
                                ...settings.businessHours,
                                [day]: { ...hours, end: e.target.value }
                              }
                            })
                          }
                          className="w-32"
                        />
                      </div>
                    )}
                    {!hours.active && (
                      <span className="text-muted-foreground">Fechado</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Canais de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, email: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>SMS</span>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, sms: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">📱</span>
                    <span>WhatsApp</span>
                  </div>
                  <Switch
                    checked={settings.notifications.whatsapp}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, whatsapp: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tipos de Notificação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Agendamentos</span>
                    <p className="text-sm text-muted-foreground">Confirmações e lembretes</p>
                  </div>
                  <Switch
                    checked={settings.notifications.appointments}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, appointments: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Pagamentos</span>
                    <p className="text-sm text-muted-foreground">Cobranças e recebimentos</p>
                  </div>
                  <Switch
                    checked={settings.notifications.payments}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, payments: checked }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">Marketing</span>
                    <p className="text-sm text-muted-foreground">Novidades e promoções</p>
                  </div>
                  <Switch
                    checked={settings.notifications.marketing}
                    onCheckedChange={(checked) => 
                      setSettings({
                        ...settings,
                        notifications: { ...settings.notifications, marketing: checked }
                      })
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="integracao" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Integrações Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Google Agenda</span>
                    <p className="text-sm text-muted-foreground">Sincronizar agendamentos</p>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">WhatsApp Business</span>
                    <p className="text-sm text-muted-foreground">Envio automático de mensagens</p>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Conta Azul</span>
                    <p className="text-sm text-muted-foreground">Integração financeira</p>
                  </div>
                  <Button variant="outline" size="sm">Conectar</Button>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">Mercado Pago</span>
                    <p className="text-sm text-muted-foreground">Gateway de pagamento</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>APIs e Webhooks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="apiKey">Chave da API</Label>
                  <div className="flex gap-2">
                    <Input id="apiKey" value="sk_test_1234567890" readOnly />
                    <Button variant="outline" size="sm">Copiar</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="webhookUrl">URL do Webhook</Label>
                  <Input id="webhookUrl" placeholder="https://sua-api.com/webhook" />
                </div>

                <div className="space-y-2">
                  <Label>Eventos para Webhook</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="appointment-created" />
                      <label htmlFor="appointment-created" className="text-sm">Agendamento criado</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="payment-received" />
                      <label htmlFor="payment-received" className="text-sm">Pagamento recebido</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="patient-created" />
                      <label htmlFor="patient-created" className="text-sm">Paciente cadastrado</label>
                    </div>
                  </div>
                </div>

                <Button variant="outline">Testar Webhook</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assinatura" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Plano Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Plano:</span>
                  {getPlanBadge(settings.subscription.plan)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Vencimento:</span>
                  <span>{new Date(settings.subscription.expiresAt).toLocaleDateString('pt-BR')}</span>
                </div>

                <div>
                  <span className="font-medium">Recursos Incluídos:</span>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-2">
                    {settings.subscription.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>

                <div className="flex gap-2">
                  <Button>Upgrade</Button>
                  <Button variant="outline">Gerenciar</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Gratuito</span>
                    <span className="text-sm text-muted-foreground">R$ 0/mês</span>
                  </div>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Até 50 pacientes</li>
                    <li>• Agendamento básico</li>
                    <li>• 1 usuário</li>
                  </ul>
                </div>

                <div className="border rounded-lg p-4 border-blue-200 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Básico</span>
                    <span className="text-sm font-medium">R$ 49/mês</span>
                  </div>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Até 500 pacientes</li>
                    <li>• Prontuário completo</li>
                    <li>• 3 usuários</li>
                    <li>• Relatórios básicos</li>
                  </ul>
                  <Badge className="mt-2 bg-blue-100 text-blue-800">Atual</Badge>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Premium</span>
                    <span className="text-sm font-medium">R$ 99/mês</span>
                  </div>
                  <ul className="text-sm text-muted-foreground">
                    <li>• Pacientes ilimitados</li>
                    <li>• Todas as funcionalidades</li>
                    <li>• Usuários ilimitados</li>
                    <li>• IA integrada</li>
                    <li>• Suporte prioritário</li>
                  </ul>
                  <Button className="mt-2 w-full" size="sm">Upgrade</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}