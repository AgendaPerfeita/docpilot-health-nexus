import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Plus, Edit, Eye, Phone, Mail, Calendar, User } from "lucide-react"
import { usePacientes } from "@/hooks/usePacientes"
import { PacienteForm } from "@/components/modules/pacientes/PacienteForm"
import { useToast } from "@/hooks/use-toast"

export default function CRM() {
  const { pacientes, loading } = usePacientes()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const filteredPatients = pacientes.filter(patient =>
    patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (patient.cpf && patient.cpf.includes(searchTerm))
  )

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  }

  const handlePatientSaved = () => {
    setIsDialogOpen(false)
    toast({
      title: "Sucesso",
      description: "Paciente cadastrado com sucesso!"
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">CRM Clínico</h1>
          <p className="text-muted-foreground">Gerencie seus pacientes e relacionamento</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
              <DialogDescription>
                Cadastre um novo paciente no sistema
              </DialogDescription>
            </DialogHeader>
            <PacienteForm 
              onCancel={() => setIsDialogOpen(false)}
              onSuccess={handlePatientSaved}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pacientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pacientes.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Novos este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {pacientes.filter(p => {
                const created = new Date(p.created_at);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pacientes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>Gerencie todos os pacientes cadastrados</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pacientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Cadastrado em</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{patient.nome}</div>
                        <div className="text-sm text-muted-foreground">
                          {patient.data_nascimento ? 
                            `${calculateAge(patient.data_nascimento)} anos` : 
                            'Idade não informada'
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {patient.telefone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3" />
                            {patient.telefone}
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {patient.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">{patient.origem || 'Indicação'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {new Date(patient.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={patient.convenio ? 'secondary' : 'default'}>
                        {patient.convenio || 'Particular'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="default">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(patient); setIsViewDialogOpen(true) }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedPatient(patient); setIsEditDialogOpen(true) }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog para Visualizar Paciente */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Nome:</strong> {selectedPatient.nome}</div>
                <div><strong>Email:</strong> {selectedPatient.email || 'Não informado'}</div>
                <div><strong>Telefone:</strong> {selectedPatient.telefone || 'Não informado'}</div>
                <div><strong>CPF:</strong> {selectedPatient.cpf || 'Não informado'}</div>
                <div><strong>Data de Nascimento:</strong> {selectedPatient.data_nascimento ? new Date(selectedPatient.data_nascimento).toLocaleDateString('pt-BR') : 'Não informado'}</div>
                <div><strong>Convênio:</strong> {selectedPatient.convenio || 'Particular'}</div>
              </div>
              
              {selectedPatient.endereco && (
                <div className="bg-muted/30 p-4 rounded-lg">
                  <strong>Endereço:</strong>
                  <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                    <div>
                      <span className="text-muted-foreground">Endereço:</span>
                      <div>{selectedPatient.endereco}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cidade:</span>
                      <div>{selectedPatient.cidade || 'Não informado'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Estado:</span>
                      <div>{selectedPatient.estado || 'Não informado'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">CEP:</span>
                      <div>{selectedPatient.cep || 'Não informado'}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                <strong>Cadastrado em:</strong> {new Date(selectedPatient.created_at).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para Editar Paciente */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <PacienteForm 
              paciente={selectedPatient}
              onCancel={() => setIsEditDialogOpen(false)}
              onSuccess={() => {
                setIsEditDialogOpen(false)
                toast({
                  title: "Sucesso",
                  description: "Paciente atualizado com sucesso!"
                })
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}