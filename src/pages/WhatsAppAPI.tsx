import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { MessageSquare, Send, Settings, Users, BarChart3, CheckCircle, Clock, AlertCircle } from "lucide-react"

const mockMessages = [
  {
    id: 1,
    patient: "Maria Silva",
    phone: "+55 11 99999-9999",
    lastMessage: "Obrigada pelo lembrete da consulta!",
    type: "lembrete",
    status: "entregue",
    timestamp: "2024-01-05 14:30"
  },
  {
    id: 2,
    patient: "João Santos",
    phone: "+55 11 98888-8888",
    lastMessage: "Confirmo minha presença na consulta de amanhã",
    type: "confirmacao",
    status: "lido",
    timestamp: "2024-01-05 12:15"
  },
  {
    id: 3,
    patient: "Ana Costa",
    phone: "+55 11 97777-7777",
    lastMessage: "Resultados dos exames já estão disponíveis",
    type: "resultado",
    status: "enviando",
    timestamp: "2024-01-05 10:45"
  }
]

const templates = [
  {
    id: 1,
    name: "Lembrete de Consulta",
    content: "Olá {{nome}}! Lembramos que você tem consulta agendada para {{data}} às {{hora}}. Confirme sua presença respondendo esta mensagem.",
    category: "lembrete",
    active: true
  },
  {
    id: 2,
    name: "Confirmação de Agendamento",
    content: "{{nome}}, sua consulta foi agendada com sucesso para {{data}} às {{hora}}. Local: {{endereco}}",
    category: "confirmacao",
    active: true
  },
  {
    id: 3,
    name: "Resultado de Exames",
    content: "{{nome}}, seus resultados de exames já estão disponíveis. Acesse o portal do paciente ou retire na clínica.",
    category: "resultado",
    active: false
  }
]

export default function WhatsAppAPI() {
  const [isConnected, setIsConnected] = useState(true)
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">WhatsApp API</h1>
          <p className="text-muted-foreground">Comunicação automatizada com pacientes via WhatsApp Business</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Enviar Mensagem</DialogTitle>
                <DialogDescription>
                  Envie mensagem personalizada via WhatsApp
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Destinatário</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="maria">Maria Silva - (11) 99999-9999</SelectItem>
                      <SelectItem value="joao">João Santos - (11) 98888-8888</SelectItem>
                      <SelectItem value="ana">Ana Costa - (11) 97777-7777</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Template (Opcional)</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id.toString()}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem</Label>
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    className="min-h-[120px]"
                    value={
                      selectedTemplate ? 
                      templates.find(t => t.id.toString() === selectedTemplate)?.content || "" : 
                      ""
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsSendDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Status da API WhatsApp
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  {isConnected ? 'Conectado' : 'Desconectado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {isConnected ? 
                    'WhatsApp Business API ativo e funcionando' : 
                    'Verifique a conexão com o WhatsApp Business'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">+55 11 3333-3333</p>
              <p className="text-xs text-muted-foreground">Número da clínica</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mensagens Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">+12 desde ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">98,5%</div>
            <p className="text-xs text-muted-foreground">Mensagens entregues</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Leitura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">87,2%</div>
            <p className="text-xs text-muted-foreground">Mensagens lidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">34</div>
            <p className="text-xs text-muted-foreground">Consultas confirmadas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates de Mensagem */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Templates de Mensagem</CardTitle>
                <CardDescription>Gerencie modelos de mensagens automatizadas</CardDescription>
              </div>
              <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    Novo Template
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo Template</DialogTitle>
                    <DialogDescription>
                      Crie um novo template de mensagem
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nome do Template</Label>
                      <Input placeholder="Ex: Lembrete de Consulta" />
                    </div>
                    <div className="space-y-2">
                      <Label>Categoria</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lembrete">Lembrete</SelectItem>
                          <SelectItem value="confirmacao">Confirmação</SelectItem>
                          <SelectItem value="resultado">Resultado</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Mensagem</Label>
                      <Textarea
                        placeholder="Use {{nome}}, {{data}}, {{hora}} para personalizar..."
                        className="min-h-[100px]"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="active" />
                      <Label htmlFor="active">Template ativo</Label>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button>
                      Salvar Template
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {templates.map(template => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {template.content}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={template.active} 
                      size="sm"
                    />
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mensagens Recentes */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recentes</CardTitle>
            <CardDescription>Últimas interações via WhatsApp</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockMessages.map(message => (
                <div key={message.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{message.patient}</h4>
                      <Badge 
                        variant={
                          message.status === 'entregue' ? 'default' :
                          message.status === 'lido' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {message.status === 'entregue' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {message.status === 'lido' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {message.status === 'enviando' && <Clock className="h-3 w-3 mr-1" />}
                        {message.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {message.lastMessage}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{message.phone}</span>
                      <span>{message.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações Automáticas */}
      <Card>
        <CardHeader>
          <CardTitle>Automações</CardTitle>
          <CardDescription>Configure envios automáticos de mensagens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Lembrete de Consulta</h4>
                  <p className="text-sm text-muted-foreground">
                    Enviar 24h antes da consulta
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Confirmação de Agendamento</h4>
                  <p className="text-sm text-muted-foreground">
                    Enviar após confirmar consulta
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Resultado de Exames</h4>
                  <p className="text-sm text-muted-foreground">
                    Notificar quando disponível
                  </p>
                </div>
                <Switch />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Aniversário do Paciente</h4>
                  <p className="text-sm text-muted-foreground">
                    Enviar mensagem de parabéns
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Pesquisa de Satisfação</h4>
                  <p className="text-sm text-muted-foreground">
                    Enviar após consulta
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Campanha de Retorno</h4>
                  <p className="text-sm text-muted-foreground">
                    Para pacientes sem consulta há 6 meses
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}