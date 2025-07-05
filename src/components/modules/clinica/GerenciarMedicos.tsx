import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useConvites } from "@/hooks/useConvites";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, UserMinus, Stethoscope, Mail, Clock, Send, RotateCcw } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const GerenciarMedicos = () => {
  const { profile, clinicaMedicos, loading, vincularMedico, desvincularMedico, buscarMedicos } = useUserProfile();
  const { convites, loading: convitesLoading, criarConvite, cancelarConvite, reenviarConvite } = useConvites();
  const [searchTerm, setSearchTerm] = useState("");
  const [medicos, setMedicos] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("buscar");
  const { toast } = useToast();

  // Form states para convite
  const [conviteForm, setConviteForm] = useState({
    email: "",
    nome: "",
    especialidade: "",
    crm: ""
  });

  // Verificar se é uma clínica
  if (profile?.tipo !== 'clinica') {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">
            Esta funcionalidade está disponível apenas para clínicas.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Aviso",
        description: "Digite um termo para buscar médicos",
        variant: "destructive"
      });
      return;
    }

    setSearchLoading(true);
    try {
      const resultados = await buscarMedicos(searchTerm);
      // Filtrar médicos que já estão vinculados
      const medicosVinculados = clinicaMedicos.map(cm => cm.medico_id);
      const medicosDisponiveis = resultados.filter(medico => 
        !medicosVinculados.includes(medico.id)
      );
      setMedicos(medicosDisponiveis);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao buscar médicos",
        variant: "destructive"
      });
    } finally {
      setSearchLoading(false);
    }
  };

  const handleVincular = async (medicoId: string) => {
    try {
      await vincularMedico(medicoId);
      toast({
        title: "Sucesso",
        description: "Médico vinculado com sucesso"
      });
      setDialogOpen(false);
      setMedicos([]);
      setSearchTerm("");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao vincular médico",
        variant: "destructive"
      });
    }
  };

  const handleDesvincular = async (vinculoId: string, nomeMetico: string) => {
    try {
      await desvincularMedico(vinculoId);
      toast({
        title: "Sucesso",
        description: `Médico ${nomeMetico} desvinculado com sucesso`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao desvincular médico",
        variant: "destructive"
      });
    }
  };

  const handleConvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!conviteForm.email || !conviteForm.nome) {
      toast({
        title: "Erro",
        description: "Email e nome são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const resultado = await criarConvite(conviteForm);
      
      if (resultado.tipo === 'vinculo_existente') {
        toast({
          title: "Médico vinculado!",
          description: `${resultado.medico.nome} foi vinculado à clínica e notificado por email.`
        });
      } else {
        toast({
          title: "Convite enviado!",
          description: `Convite enviado para ${conviteForm.email}. O médico receberá um email para criar sua conta.`
        });
      }
      
      setConviteForm({ email: "", nome: "", especialidade: "", crm: "" });
      setDialogOpen(false);
      setActiveTab("buscar");
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao processar convite",
        variant: "destructive"
      });
    }
  };

  const handleCancelarConvite = async (conviteId: string) => {
    try {
      await cancelarConvite(conviteId);
      toast({
        title: "Sucesso",
        description: "Convite cancelado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cancelar convite",
        variant: "destructive"
      });
    }
  };

  const handleReenviarConvite = async (conviteId: string) => {
    try {
      await reenviarConvite(conviteId);
      toast({
        title: "Sucesso",
        description: "Convite reenviado com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao reenviar convite",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    const colors: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      pendente: 'default',
      aceito: 'default',
      expirado: 'secondary'
    };
    return colors[status] || 'default';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Médicos da Clínica ({clinicaMedicos.length}/5)
            </CardTitle>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button disabled={clinicaMedicos.length >= 5}>
                  <Plus className="mr-2 h-4 w-4" />
                  Vincular Médico
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Adicionar Médico à Clínica</DialogTitle>
                </DialogHeader>
                
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="buscar">Buscar Existente</TabsTrigger>
                    <TabsTrigger value="convidar">Convidar Novo</TabsTrigger>
                    <TabsTrigger value="convites">Convites Pendentes</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="buscar" className="space-y-4">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Label htmlFor="search">Nome do médico</Label>
                        <Input
                          id="search"
                          placeholder="Digite o nome do médico..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={handleSearch} disabled={searchLoading}>
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {medicos.length > 0 && (
                      <div className="border rounded-lg max-h-64 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Especialidade</TableHead>
                              <TableHead>CRM</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead className="text-right">Ação</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {medicos.map((medico) => (
                              <TableRow key={medico.id}>
                                <TableCell className="font-medium">{medico.nome}</TableCell>
                                <TableCell>{medico.especialidade || "-"}</TableCell>
                                <TableCell>{medico.crm || "-"}</TableCell>
                                <TableCell>{medico.email}</TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    size="sm"
                                    onClick={() => handleVincular(medico.id)}
                                  >
                                    Vincular
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {searchLoading && (
                      <div className="text-center py-4">
                        Buscando médicos...
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="convidar" className="space-y-4">
                    <form onSubmit={handleConvite} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="medico@email.com"
                            value={conviteForm.email}
                            onChange={(e) => setConviteForm(prev => ({ ...prev, email: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nome">Nome Completo *</Label>
                          <Input
                            id="nome"
                            placeholder="Dr. Nome Sobrenome"
                            value={conviteForm.nome}
                            onChange={(e) => setConviteForm(prev => ({ ...prev, nome: e.target.value }))}
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="especialidade">Especialidade</Label>
                          <Input
                            id="especialidade"
                            placeholder="Cardiologia"
                            value={conviteForm.especialidade}
                            onChange={(e) => setConviteForm(prev => ({ ...prev, especialidade: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="crm">CRM</Label>
                          <Input
                            id="crm"
                            placeholder="CRM/UF 12345"
                            value={conviteForm.crm}
                            onChange={(e) => setConviteForm(prev => ({ ...prev, crm: e.target.value }))}
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit">
                          <Send className="mr-2 h-4 w-4" />
                          Enviar Convite
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="convites" className="space-y-4">
                    {convitesLoading ? (
                      <div className="text-center py-4">Carregando convites...</div>
                    ) : convites.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum convite pendente
                      </div>
                    ) : (
                      <div className="border rounded-lg max-h-64 overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nome</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Enviado em</TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {convites.map((convite) => (
                              <TableRow key={convite.id}>
                                <TableCell className="font-medium">{convite.nome}</TableCell>
                                <TableCell>{convite.email}</TableCell>
                                <TableCell>
                                  <Badge variant={getStatusColor(convite.status)}>
                                    {convite.status}
                                  </Badge>
                                </TableCell>
                                <TableCell>{formatDate(convite.created_at)}</TableCell>
                                <TableCell className="text-right">
                                  <div className="flex gap-1 justify-end">
                                    {convite.status === 'pendente' && (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleReenviarConvite(convite.id)}
                                        >
                                          <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleCancelarConvite(convite.id)}
                                        >
                                          <Clock className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando médicos...</div>
          ) : clinicaMedicos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum médico vinculado à clínica
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Especialidade</TableHead>
                  <TableHead>CRM</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clinicaMedicos.map((vinculo) => (
                  <TableRow key={vinculo.id}>
                    <TableCell className="font-medium">
                      {vinculo.medico?.nome || "Nome não disponível"}
                    </TableCell>
                    <TableCell>
                      {vinculo.medico?.especialidade || "-"}
                    </TableCell>
                    <TableCell>
                      {vinculo.medico?.crm || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={vinculo.ativo ? "default" : "secondary"}>
                        {vinculo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Em desenvolvimento",
                              description: "Funcionalidade de edição em breve"
                            });
                          }}
                        >
                          Editar
                        </Button>
                        {vinculo.ativo && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <UserMinus className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Desvincular Médico</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja desvincular {vinculo.medico?.nome || "este médico"} da clínica?
                                  Esta ação pode ser revertida posteriormente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => handleDesvincular(vinculo.id, vinculo.medico?.nome || "médico")}
                                >
                                  Desvincular
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {clinicaMedicos.length >= 5 && (
        <Card>
          <CardContent className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Limite máximo de 5 médicos atingido. Para vincular um novo médico, 
              é necessário desvincular um médico existente.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};