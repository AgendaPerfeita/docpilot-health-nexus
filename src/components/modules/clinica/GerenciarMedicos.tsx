import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useToast } from "@/hooks/use-toast";
import { Search, Plus, UserMinus, Stethoscope, Mail } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export const GerenciarMedicos = () => {
  const { profile, clinicaMedicos, loading, vincularMedico, desvincularMedico, buscarMedicos } = useUserProfile();
  const [searchTerm, setSearchTerm] = useState("");
  const [medicos, setMedicos] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

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
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Buscar e Vincular Médico</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
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
                    <div className="border rounded-lg">
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
                </div>
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
                      {vinculo.ativo && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar desvinculação</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja desvincular o médico {vinculo.medico?.nome}? 
                                Este médico perderá acesso aos dados da clínica.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDesvincular(vinculo.id, vinculo.medico?.nome || "")}
                              >
                                Desvincular
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
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