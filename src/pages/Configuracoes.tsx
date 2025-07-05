import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { PlanoMedicoSelector } from "@/components/PlanoMedicoSelector"
import { useAuth } from "@/hooks/useAuth"
import { User, Bell, Settings } from "lucide-react"

export default function Configuracoes() {
  const { profile } = useAuth();
  
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
                    <Input id="nome" value={profile?.nome || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile?.email || ''} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={profile?.telefone || ''} placeholder="(11) 99999-0000" />
                  </div>
                  {profile?.tipo === 'medico' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="crm">CRM</Label>
                        <Input id="crm" value={profile?.crm || ''} placeholder="CRM/SP 123456" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="especialidade">Especialidade</Label>
                        <Input id="especialidade" value={profile?.especialidade || ''} placeholder="Clínica Geral" />
                      </div>
                    </>
                  )}
                </div>
                
                {profile?.endereco !== undefined && (
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Textarea id="endereco" value={profile?.endereco || ''} placeholder="Endereço completo" />
                  </div>
                )}

                <Button className="w-full">Salvar Alterações</Button>
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