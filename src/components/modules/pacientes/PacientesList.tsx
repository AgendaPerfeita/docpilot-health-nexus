import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePacientes, Paciente } from "@/hooks/usePacientes";
import { Search, Edit, Trash2, Plus, Phone, Mail } from "lucide-react";
import { formatarCPF, formatarTelefone } from "@/lib/formatters";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface PacientesListProps {
  onEdit?: (paciente: Paciente) => void;
  onNew?: () => void;
}

export const PacientesList = ({ onEdit, onNew }: PacientesListProps) => {
  const { pacientes, loading, deletarPaciente } = usePacientes();
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.cpf?.includes(searchTerm) ||
    paciente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, nome: string) => {
    try {
      await deletarPaciente(id);
      toast({
        title: "Sucesso",
        description: `Paciente ${nome} excluído com sucesso`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir paciente",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} anos`;
    }
    return `${age} anos`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Lista de Pacientes</CardTitle>
          {onNew && (
            <Button onClick={onNew}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8">Carregando pacientes...</div>
        ) : filteredPacientes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Idade</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Convênio</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPacientes.map((paciente) => (
                  <TableRow key={paciente.id}>
                    <TableCell className="font-medium">
                      {paciente.nome}
                    </TableCell>
                    <TableCell>
                      {calculateAge(paciente.data_nascimento)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {paciente.telefone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {formatarTelefone(paciente.telefone)}
                          </div>
                        )}
                        {paciente.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="h-3 w-3" />
                            {paciente.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{paciente.cpf ? formatarCPF(paciente.cpf) : "-"}</TableCell>
                    <TableCell>
                      {paciente.convenio ? (
                        <Badge variant="secondary">{paciente.convenio}</Badge>
                      ) : (
                        <Badge variant="outline">Particular</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {paciente.origem ? (
                        <Badge variant="outline">{paciente.origem}</Badge>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {paciente.endereco && (
                          <div>{paciente.endereco}</div>
                        )}
                        {paciente.bairro && (
                          <div className="text-muted-foreground">{paciente.bairro}</div>
                        )}
                        {paciente.cidade && paciente.estado && (
                          <div className="text-muted-foreground">{paciente.cidade} - {paciente.estado}</div>
                        )}
                        {!paciente.endereco && !paciente.bairro && !paciente.cidade && (
                          "-"
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        {onEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(paciente)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o paciente {paciente.nome}? 
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(paciente.id, paciente.nome)}
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};