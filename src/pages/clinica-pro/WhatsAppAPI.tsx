// Moved from root to clinica-pro folder

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  MessageSquare, 
  Send, 
  Users, 
  Calendar,
  Clock,
  Settings,
  Zap,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Bot,
  Phone
} from "lucide-react"

const WhatsAppAPI = () => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connected')
  const [automationEnabled, setAutomationEnabled] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [newMessage, setNewMessage] = useState("")

  // Mock data
  const messageStats = [
    { title: "Mensagens Enviadas", value: "1,234", icon: Send, color: "text-blue-600" },
    { title: "Taxa de Entrega", value: "98.5%", icon: CheckCircle, color: "text-green-600" },
    { title: "Pacientes Ativos", value: "156", icon: Users, color: "text-purple-600" },
    { title: "Tempo Médio Resposta", value: "2.3min", icon: Clock, color: "text-orange-600" }
  ]

  const automationRules = [
    {
      id: '1',
      name: 'Lembrete de Consulta',
      trigger: '24h antes da consulta',
      status: 'active',
      lastSent: '2024-01-15T10:30:00',
      messagesSent: 45
    },
    {
      id: '2',
      name: 'Confirmação de Agendamento',
      trigger: 'Após agendamento',
      status: 'active',
      lastSent: '2024-01-15T14:20:00',
      messagesSent: 23
    },
    {
      id: '3',
      name: 'Resultado de Exame',
      trigger: 'Exame disponível',
      status: 'paused',
      lastSent: '2024-01-14T16:45:00',
      messagesSent: 12
    }
  ]

  const messageTemplates = [
    {
      id: '1',
      name: 'Lembrete Consulta',
      category: 'appointment',
      content: 'Olá {nome}! Lembramos que você tem consulta marcada para {data} às {hora}. Em caso de imprevisto, favor entrar em contato.',
      variables: ['nome', 'data', 'hora']
    },
    {
      id: '2',
      name: 'Confirmação Agendamento',
      category: 'appointment',
      content: 'Olá {nome}! Sua consulta foi agendada com sucesso para {data} às {hora}. Aguardamos você!',
      variables: ['nome', 'data', 'hora']
    },
    {
      id: '3',
      name: 'Resultado Disponível',
      category: 'exam',
      content: 'Olá {nome}! Seu resultado de {exame} já está disponível. Você pode acessar através do link ou vir buscar na clínica.',
      variables: ['nome', 'exame']
    }
  ]

  const recentMessages = [
    {
      id: '1',
      patient: 'Ana Silva',
      phone: '(11) 99999-1111',
      message: 'Olá Ana! Lembramos que você tem consulta...',
      status: 'delivered',
      time: '10:30',
      type: 'automatic'
    },
    {
      id: '2',
      patient: 'João Santos',
      phone: '(11) 99999-2222',
      message: 'Seu resultado de hemograma está disponível...',
      status: 'read',
      time: '09:15',
      type: 'automatic'
    },
    {
      id: '3',
      patient: 'Maria Costa',
      phone: '(11) 99999-3333',
      message: 'Boa tarde! Preciso remarcar minha consulta.',
      status: 'received',
      time: '14:20',
      type: 'received'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-red-100 text-red-800'
      case 'delivered':
        return 'bg-blue-100 text-blue-800'
      case 'read':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'received':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-green-600'
      case 'connecting':
        return 'text-yellow-600'
      case 'disconnected':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">WhatsApp API</h1>
          <p className="text-muted-foreground">
            Comunicação automatizada com pacientes via WhatsApp Business
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
            <div className={`w-2 h-2 rounded-full mr-2 ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            {connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Clínica Pro
          </Badge>
        </div>
      </div>

      {/* Connection Status */}
      <Card className={`border-l-4 ${connectionStatus === 'connected' ? 'border-l-green-500 bg-green-50' : 'border-l-red-500 bg-red-50'}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageSquare className={`h-5 w-5 ${getConnectionStatusColor()}`} />
              <div>
                <CardTitle className="text-lg">Status da Conexão</CardTitle>
                <CardDescription>
                  {connectionStatus === 'connected' 
                    ? 'WhatsApp Business conectado e funcionando normalmente'
                    : 'Problema na conexão com WhatsApp Business'
                  }
                </CardDescription>
              </div>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configurar
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {messageStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Tabs defaultValue="messages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="automation">Automação</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        {/* Messages Tab */}
        <TabsContent value="messages" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Send Message */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Enviar Mensagem
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar template..." />
                    </SelectTrigger>
                    <SelectContent>
                      {messageTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Escreva sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Mensagem
                </Button>
              </CardContent>
            </Card>

            {/* Recent Messages */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Mensagens Recentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentMessages.map((message) => (
                    <div
                      key={message.id}
                      className="flex items-start justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{message.patient}</h4>
                          <Badge variant="outline" className="text-xs">
                            {message.phone}
                          </Badge>
                          <Badge className={getStatusColor(message.status)}>
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {message.message}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="text-xs text-muted-foreground">
                            {message.time}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {message.type === 'automatic' ? (
                              <>
                                <Bot className="h-3 w-3 mr-1" />
                                Automático
                              </>
                            ) : (
                              <>
                                <Phone className="h-3 w-3 mr-1" />
                                Recebida
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Automation Tab */}
        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Regras de Automação
                  </CardTitle>
                  <CardDescription>
                    Configure mensagens automáticas baseadas em eventos
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="automation-toggle">Automação</Label>
                    <Switch
                      id="automation-toggle"
                      checked={automationEnabled}
                      onCheckedChange={setAutomationEnabled}
                    />
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Regra
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{rule.name}</h3>
                        <Badge className={getStatusColor(rule.status)}>
                          {rule.status === 'active' ? 'Ativa' : 
                           rule.status === 'paused' ? 'Pausada' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Trigger: {rule.trigger}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>Último envio: {new Date(rule.lastSent).toLocaleString('pt-BR')}</span>
                        <span>Mensagens enviadas: {rule.messagesSent}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button variant="outline" size="sm">
                        {rule.status === 'active' ? 'Pausar' : 'Ativar'}
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Templates de Mensagem</CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {messageTemplates.map((template) => (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{template.name}</CardTitle>
                        <Badge variant="outline">{template.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-3">
                        {template.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map((variable) => (
                            <Badge key={variable} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Conexão</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Número do WhatsApp Business</Label>
                  <Input
                    id="phone-number"
                    placeholder="+55 (11) 99999-9999"
                    defaultValue="+55 (11) 99999-0000"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://sua-api.com/webhook"
                    defaultValue="https://smartdoc.com.br/webhook/whatsapp"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="verify-token">Token de Verificação</Label>
                  <Input
                    id="verify-token"
                    type="password"
                    placeholder="••••••••••••••••"
                  />
                </div>

                <Button className="w-full">
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Automação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Horário de Funcionamento</Label>
                    <p className="text-sm text-muted-foreground">
                      Mensagens automáticas só serão enviadas no horário comercial
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-time">Início</Label>
                    <Input
                      id="start-time"
                      type="time"
                      defaultValue="08:00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-time">Fim</Label>
                    <Input
                      id="end-time"
                      type="time"
                      defaultValue="18:00"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Mensagens de Fim de Semana</Label>
                    <p className="text-sm text-muted-foreground">
                      Permitir envio automático aos finais de semana
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Confirmação de Leitura</Label>
                    <p className="text-sm text-muted-foreground">
                      Solicitar confirmação de leitura das mensagens
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Button className="w-full">
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default WhatsAppAPI