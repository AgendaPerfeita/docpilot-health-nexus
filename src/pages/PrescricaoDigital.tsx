import { useState, useEffect } from "react"
import { usePacientes } from "@/hooks/usePacientes"
import { useMedicamentos } from "@/hooks/useMedicamentos"
import { useToast } from "@/hooks/use-toast"
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
import { Search, Plus, Send, FileText, Clock, CheckCircle, AlertCircle, Pill, User, Calendar, Shield, ShieldCheck } from "lucide-react"
import { DigitalSignatureModal } from "@/components/medical/DigitalSignatureModal"
import QuickSignatureModal from "@/components/signatures/QuickSignatureModal"
import { useDigitalSignature } from "@/hooks/useDigitalSignature"


export default function PrescricaoDigital() {
  const { pacientes } = usePacientes()
  const { medicamentos } = useMedicamentos()
  const { toast } = useToast()
  const { hasActiveCertificate } = useDigitalSignature()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medications, setMedications] = useState([{ name: "", dosage: "", duration: "" }])
  const [prescricoes, setPrescricoes] = useState<any[]>([
    {
      id: "1",
      patient: "Maria Silva",
      date: "2024-01-15",
      medications: [{ name: "Dipirona 500mg" }, { name: "Omeprazol 20mg" }],
      status: "enviada"
    },
    {
      id: "2", 
      patient: "João Santos",
      date: "2024-01-14",
      medications: [{ name: "Amoxicilina 875mg" }],
      status: "assinada"
    },
    {
      id: "3",
      patient: "Ana Costa", 
      date: "2024-01-13",
      medications: [{ name: "Losartana 50mg" }, { name: "Sinvastatina 20mg" }],
      status: "pendente"
    }
  ])
  const [loading, setLoading] = useState(false)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [quickSignatureModalOpen, setQuickSignatureModalOpen] = useState(false)
  const [selectedPrescriptionForSign, setSelectedPrescriptionForSign] = useState<any>(null)
  const [currentPrescription, setCurrentPrescription] = useState({ instructions: "", observations: "" })

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

  const handleSignPrescription = (prescription: any) => {
    setSelectedPrescriptionForSign(prescription)
    setSignatureModalOpen(true)
  }

  const handleSignatureComplete = (result: any) => {
    console.log('Assinatura concluída:', result)
    setSignatureModalOpen(false)
    setQuickSignatureModalOpen(false)
    setSelectedPrescriptionForSign(null)
    
    // Atualizar status da prescrição para assinada
    if (selectedPrescriptionForSign) {
      const updatedPrescription = { ...selectedPrescriptionForSign, status: "assinada" }
      setPrescricoes([updatedPrescription, ...prescricoes])
      
      // Reset form
      setSelectedPatient("")
      setMedications([{ name: "", dosage: "", duration: "" }])
      setCurrentPrescription({ instructions: "", observations: "" })
      setIsDialogOpen(false)
    }
    
    toast({
      title: "Prescrição assinada!",
      description: "A prescrição foi assinada digitalmente com sucesso."
    })
  }

  const handleConnectCertificate = () => {
    // Validar se há dados mínimos
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente antes de assinar a prescrição",
        variant: "destructive"
      })
      return
    }

    if (medications.filter(med => med.name.trim()).length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos um medicamento antes de assinar",
        variant: "destructive"
      })
      return
    }

    // Encontrar dados do paciente selecionado
    const pacienteData = pacientes.find(p => p.id === selectedPatient)
    
    // Criar objeto da nova prescrição
    const newPrescription = {
      id: Date.now().toString(),
      patient: pacienteData?.nome || "Paciente",
      date: new Date().toISOString(),
      medications: medications.filter(med => med.name.trim()),
      instructions: currentPrescription.instructions,
      observations: currentPrescription.observations,
      status: "pendente"
    }

    setSelectedPrescriptionForSign(newPrescription)
    
    // Se já tem certificado configurado, usar assinatura rápida
    if (hasActiveCertificate()) {
      setQuickSignatureModalOpen(true)
    } else {
      // Senão, abrir modal de configuração
      setSignatureModalOpen(true)
    }
  }

  const handleSavePrescription = () => {
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente antes de salvar",
        variant: "destructive"
      })
      return
    }

    if (medications.filter(med => med.name.trim()).length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um medicamento",
        variant: "destructive"
      })
      return
    }

    const pacienteData = pacientes.find(p => p.id === selectedPatient)
    
    const newPrescription = {
      id: Date.now().toString(),
      patient: pacienteData?.nome || "Paciente",
      date: new Date().toISOString(),
      medications: medications.filter(med => med.name.trim()),
      instructions: currentPrescription.instructions,
      observations: currentPrescription.observations,
      status: "enviada"
    }

    setPrescricoes([newPrescription, ...prescricoes])
    
    // Reset form
    setSelectedPatient("")
    setMedications([{ name: "", dosage: "", duration: "" }])
    setCurrentPrescription({ instructions: "", observations: "" })
    setIsDialogOpen(false)

    toast({
      title: "Prescrição salva!",
      description: "A prescrição foi salva com sucesso."
    })
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
                          {pacientes.map((paciente) => (
                            <SelectItem key={paciente.id} value={paciente.id}>
                              {paciente.nome}
                            </SelectItem>
                          ))}
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
                            {medicamentos.map((med) => (
                              <option key={med.id} value={med.nome} />
                            ))}
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
                  <Label>Instruções Gerais</Label>
                  <Textarea
                    placeholder="Instruções gerais de uso, cuidados especiais..."
                    value={currentPrescription.instructions}
                    onChange={(e) => setCurrentPrescription({...currentPrescription, instructions: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Observações Médicas</Label>
                  <Textarea
                    placeholder="Observações adicionais, orientações ao paciente..."
                    value={currentPrescription.observations}
                    onChange={(e) => setCurrentPrescription({...currentPrescription, observations: e.target.value})}
                    className="min-h-[80px]"
                  />
                </div>
              </TabsContent>

              <TabsContent value="assinatura" className="space-y-4">
                <div className="text-center space-y-4">
                  {hasActiveCertificate() ? (
                    <div className="p-8 border-2 border-green-200 rounded-lg bg-green-50">
                      <ShieldCheck className="h-12 w-12 mx-auto mb-4 text-green-600" />
                      <h3 className="text-lg font-semibold mb-2 text-green-800">Certificado Configurado</h3>
                      <p className="text-green-700 mb-4">
                        Certificado digital ativo e pronto para assinar prescrições
                      </p>
                      <Button onClick={handleConnectCertificate} className="bg-green-600 hover:bg-green-700">
                        <Shield className="h-4 w-4 mr-2" />
                        Assinar Prescrição
                      </Button>
                    </div>
                  ) : (
                    <div className="p-8 border-2 border-dashed border-muted-foreground/25 rounded-lg">
                      <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-semibold mb-2">Certificado Digital Necessário</h3>
                      <p className="text-muted-foreground mb-4">
                        Configure seu certificado digital A1 ou A3 nas configurações do sistema
                      </p>
                      <Button variant="outline" onClick={() => window.location.href = '/configuracoes'}>
                        <Shield className="h-4 w-4 mr-2" />
                        Configurar Certificado
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Certificado válido e compatível com ICP-Brasil
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="outline" onClick={handleSavePrescription}>
                <FileText className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button onClick={handleSavePrescription}>
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
              {prescricoes.map((prescription) => (
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
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleSignPrescription(prescription)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
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

      {selectedPrescriptionForSign && (
        <>
          <DigitalSignatureModal
            open={signatureModalOpen}
            onOpenChange={setSignatureModalOpen}
            documentId={selectedPrescriptionForSign.id}
            documentTitle={`Prescrição - ${selectedPrescriptionForSign.patient}`}
            documentContent={JSON.stringify(selectedPrescriptionForSign)}
            documentType="receita"
            onSignatureComplete={handleSignatureComplete}
          />
          
          <QuickSignatureModal
            open={quickSignatureModalOpen}
            onOpenChange={setQuickSignatureModalOpen}
            documentId={selectedPrescriptionForSign.id}
            documentContent={JSON.stringify(selectedPrescriptionForSign)}
            documentType="receita"
            onSignatureComplete={handleSignatureComplete}
          />
        </>
      )}
    </div>
  )
}