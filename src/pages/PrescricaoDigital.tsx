import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Plus, Send, FileText, Clock, CheckCircle, AlertCircle, Pill, User, Calendar } from "lucide-react"

const mockPrescriptions = [
  {
    id: 1,
    patient: "Maria Silva",
    date: "2024-01-05",
    status: "enviada",
    medications: [
      { name: "Dipirona 500mg", dosage: "1 comprimido de 6/6h", duration: "7 dias" },
      { name: "Amoxicilina 500mg", dosage: "1 cápsula de 8/8h", duration: "10 dias" }
    ]
  },
  {
    id: 2,
    patient: "João Santos",
    date: "2024-01-04",
    status: "assinada",
    medications: [
      { name: "Ibuprofeno 600mg", dosage: "1 comprimido de 12/12h", duration: "5 dias" }
    ]
  }
]

export default function PrescricaoDigital() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medications, setMedications] = useState([{ name: "", dosage: "", duration: "" }])

  const addMedication = () => {
    setMedications([...medications, { name: "", dosage: "", duration: "" }])
  }

  const updateMedication = (index: number, field: string, value: string) => {
    const updated = medications.map((med, i) => 
      i === index ? { ...med, [field]: value } : med
    )
    setMedications(updated)
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prescrição Digital</h1>
          <p className="text-muted-foreground">Crie e gerencie prescrições digitais com assinatura eletrônica</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Prescrição
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Nova Prescrição Digital</DialogTitle>
              <DialogDescription>
                Crie uma nova prescrição digital integrada com Memed
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="prescricao" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="prescricao">Prescrição</TabsTrigger>
                <TabsTrigger value="assinatura">Assinatura Digital</TabsTrigger>
              </TabsList>
              
              <TabsContent value="prescricao" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o paciente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="maria">Maria Silva</SelectItem>
                        <SelectItem value="joao">João Santos</SelectItem>
                        <SelectItem value="ana">Ana Costa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data da Consulta</Label>
                    <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-base font-semibold">Medicamentos</Label>
                    <Button onClick={addMedication} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Medicamento
                    </Button>
                  </div>
                  
                  {medications.map((medication, index) => (
                    <Card key={index} className="p-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Medicamento</Label>
                          <Input
                            placeholder="Nome do medicamento"
                            value={medication.name}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            list="medications-list"
                          />
                          <datalist id="medications-list">
                            <option value="Dipirona 500mg" />
                            <option value="Paracetamol 750mg" />
                            <option value="Ibuprofeno 600mg" />
                            <option value="Amoxicilina 500mg" />
                            <option value="Azitromicina 500mg" />
                          </datalist>
                        </div>
                        <div className="space-y-2">
                          <Label>Posologia</Label>
                          <Input
                            placeholder="Ex: 1 comp. de 8/8h"
                            value={medication.dosage}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Duração</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="Ex: 7 dias"
                              value={medication.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                            />
                            {medications.length > 1 && (
                              <Button
                                onClick={() => removeMedication(index)}
                                size="sm"
                                variant="destructive"
                              >
                                ×
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label>Observações Médicas</Label>
                  <Textarea
                    placeholder="Observações adicionais, orientações ao paciente..."
                    className="min-h-[100px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="assinatura" className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Assinatura Digital</h3>
                    <p className="text-muted-foreground mb-4">
                      Utilize seu certificado digital A1 ou A3 para assinar a prescrição
                    </p>
                    <Button className="mb-2">
                      Conectar Certificado Digital
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      Certificado válido e compatível com ICP-Brasil
                    </p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button>
                <Send className="h-4 w-4 mr-2" />
                Enviar Prescrição
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prescrições Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">+2 desde ontem</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Enviadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">45</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Economia Digital</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 1.280</div>
            <p className="text-xs text-muted-foreground">Economizado em papel</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Prescrições */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prescrições Recentes</CardTitle>
              <CardDescription>Gerencie suas prescrições digitais</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prescrições..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Medicamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {prescription.patient}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {new Date(prescription.date).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {prescription.medications.map((med, index) => (
                        <div key={index} className="flex items-center gap-1 text-sm">
                          <Pill className="h-3 w-3" />
                          {med.name}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        prescription.status === 'enviada' ? 'default' : 
                        prescription.status === 'assinada' ? 'secondary' : 'destructive'
                      }
                    >
                      {prescription.status === 'enviada' && <Send className="h-3 w-3 mr-1" />}
                      {prescription.status === 'assinada' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {prescription.status === 'pendente' && <Clock className="h-3 w-3 mr-1" />}
                      {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        Ver Detalhes
                      </Button>
                      {prescription.status === 'pendente' && (
                        <Button variant="outline" size="sm">
                          Assinar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}