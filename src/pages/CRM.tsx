import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Eye, Phone, Mail, Calendar, Instagram } from "lucide-react"
import { mockPatients } from "./mockPatients"
import { HistoricoEvolucoes } from "./HistoricoEvolucoes"
import { mockConvenios } from "./mockConvenios"

const mockPatientsWithOrigin = mockPatients.map(patient => ({
  ...patient,
  origem: ['Instagram', 'Google', 'Facebook', 'Indicação', 'WhatsApp', 'Marketplace'][Math.floor(Math.random() * 6)],
  totalGasto: Math.floor(Math.random() * 2000) + 200,
  ticketMedio: Math.floor(Math.random() * 400) + 100,
  totalConsultas: Math.floor(Math.random() * 10) + 1
}));

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [patients, setPatients] = useState(mockPatientsWithOrigin)
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    tipoConsulta: '',
    convenio: '',
    plano: '',
    status: 'ativo',
    origem: 'Indicação',
    notes: ''
  });

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getOriginIcon = (origem: string) => {
    switch (origem) {
      case 'Instagram': return <Instagram className="h-4 w-4" />
      default: return <div className="w-4 h-4 bg-primary rounded-full" />
    }
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Novo Paciente</DialogTitle>
              <DialogDescription>
                Cadastre um novo paciente no sistema
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <Input id="name" placeholder="Digite o nome completo" value={formState.name} onChange={e => setFormState(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@exemplo.com" value={formState.email} onChange={e => setFormState(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" placeholder="(11) 99999-9999" value={formState.phone} onChange={e => setFormState(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthDate">Data de Nascimento</Label>
                <Input id="birthDate" type="date" value={formState.birthDate} onChange={e => setFormState(f => ({ ...f, birthDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={formState.origem} onValueChange={origem => setFormState(f => ({ ...f, origem }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Como chegou até nós?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Google">Google</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Indicação">Indicação</SelectItem>
                    <SelectItem value="Marketplace">Marketplace</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Consulta</Label>
                <Select value={formState.tipoConsulta} onValueChange={tipoConsulta => setFormState(f => ({ ...f, tipoConsulta, convenio: '', plano: '' }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="convenio">Convênio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formState.tipoConsulta === 'convenio' && (
                <>
                  <div className="space-y-2">
                    <Label>Convênio</Label>
                    <Select value={formState.convenio} onValueChange={convenio => setFormState(f => ({ ...f, convenio, plano: '' }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o convênio" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockConvenios.map(c => (
                          <SelectItem key={c.operadora} value={c.operadora}>{c.operadora}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Plano</Label>
                    <Select value={formState.plano} onValueChange={plano => setFormState(f => ({ ...f, plano }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o plano" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockConvenios.find(c => c.operadora === formState.convenio)?.planos.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formState.status} onValueChange={status => setFormState(f => ({ ...f, status }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea id="notes" placeholder="Observações importantes sobre o paciente" value={formState.notes} onChange={e => setFormState(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => { setIsDialogOpen(false); setFormState({ name: '', email: '', phone: '', birthDate: '', tipoConsulta: '', convenio: '', plano: '', status: 'ativo', origem: 'Indicação', notes: '' }); }}>
                Cancelar
              </Button>
              <Button onClick={() => { setIsDialogOpen(false); setFormState({ name: '', email: '', phone: '', birthDate: '', tipoConsulta: '', convenio: '', plano: '', status: 'ativo', origem: 'Indicação', notes: '' }); }}>
                Salvar Paciente
              </Button>
            </div>
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
            <div className="text-2xl font-bold">284</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">267</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Novos este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">18</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retorno</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
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
                <TableHead>Última Consulta</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{patient.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {patient.phone}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {patient.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getOriginIcon(patient.origem)}
                      <span className="text-sm">{patient.origem}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.plan === 'Particular' ? 'default' : 'secondary'}>
                      {patient.plan}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.status === 'Ativo' ? 'default' : 'destructive'}>
                      {patient.status}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Nome:</strong> {selectedPatient.name}</div>
                <div><strong>Email:</strong> {selectedPatient.email}</div>
                <div><strong>Telefone:</strong> {selectedPatient.phone}</div>
                <div><strong>Data de Nascimento:</strong> {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}</div>
                <div><strong>Plano:</strong> {selectedPatient.plan}</div>
                <div><strong>Status:</strong> {selectedPatient.status}</div>
              </div>
              
              <div className="bg-muted/30 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  {getOriginIcon(selectedPatient.origem)}
                  <strong>{selectedPatient.origem}</strong>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Gasto:</span>
                    <div className="font-bold text-lg">R$ {selectedPatient.totalGasto?.toLocaleString('pt-BR') || '0'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Ticket Médio:</span>
                    <div className="font-bold text-lg">R$ {selectedPatient.ticketMedio?.toLocaleString('pt-BR') || '0'}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Consultas:</span>
                    <div className="font-bold text-lg">{selectedPatient.totalConsultas || 0}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Última Consulta:</span>
                    <div className="font-medium">{new Date(selectedPatient.lastVisit).toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </div>

              {selectedPatient.notes && (
                <div>
                  <strong>Observações:</strong> 
                  <p className="text-sm text-muted-foreground mt-1">{selectedPatient.notes}</p>
                </div>
              )}
              
              <HistoricoEvolucoes evolucoes={selectedPatient.evolucoes || []} />
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Paciente</DialogTitle>
          </DialogHeader>
          {selectedPatient && (
            <EditPatientForm patient={selectedPatient} onSave={updated => {
              setPatients(patients.map(p => p.id === updated.id ? updated : p))
              setIsEditDialogOpen(false)
            }} onCancel={() => setIsEditDialogOpen(false)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EditPatientForm({ patient, onSave, onCancel }) {
  const [form, setForm] = useState({ ...patient })
  const [plano, setPlano] = useState(form.plan.toLowerCase())
  return (
    <form className="grid grid-cols-2 gap-4 py-4" onSubmit={e => { e.preventDefault(); onSave(form) }}>
      <div className="space-y-2">
        <Label htmlFor="name">Nome Completo</Label>
        <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="birthDate">Data de Nascimento</Label>
        <Input id="birthDate" type="date" value={form.birthDate} onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label>Origem</Label>
        <Select value={form.origem || 'Indicação'} onValueChange={origem => setForm(f => ({ ...f, origem }))}>
          <SelectTrigger>
            <SelectValue placeholder="Como chegou até nós?" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Google">Google</SelectItem>
            <SelectItem value="Instagram">Instagram</SelectItem>
            <SelectItem value="Facebook">Facebook</SelectItem>
            <SelectItem value="Indicação">Indicação</SelectItem>
            <SelectItem value="Marketplace">Marketplace</SelectItem>
            <SelectItem value="WhatsApp">WhatsApp</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="plan">Plano</Label>
        <Select value={plano} onValueChange={v => {
          setPlano(v)
          setForm(f => ({ ...f, plan: v === 'particular' ? 'Particular' : 'Convênio', convenio: v === 'particular' ? '' : (mockConvenios[0] || '') }))
        }}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="particular">Particular</SelectItem>
            <SelectItem value="convenio">Convênio</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 space-y-2">
        <Label htmlFor="notes">Observações</Label>
        <Textarea id="notes" placeholder="Observações importantes sobre o paciente" value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
      </div>
      <div className="col-span-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}