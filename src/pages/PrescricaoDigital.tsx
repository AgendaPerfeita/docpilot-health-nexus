import { useState, useEffect } from "react"
import { usePacientes } from "@/hooks/usePacientes"
import { useMedicamentos } from "@/hooks/useMedicamentos"
import { useDocumentos, DocumentoMedico } from "@/hooks/useDocumentos"
import { useAuth } from "@/hooks/useAuth"
import { usePdfExport } from "@/hooks/usePdfExport"
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
  const { documentos, criarDocumento, atualizarDocumento, loading: loadingDocumentos } = useDocumentos()
  const { profile } = useAuth()
  const { generatePrescriptionPdf } = usePdfExport()
  const { toast } = useToast()
  const { hasActiveCertificate } = useDigitalSignature()
  
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState("")
  const [medications, setMedications] = useState([{ name: "", dosage: "", duration: "" }])
  
  // Filtrar apenas prescrições dos documentos
  const prescricoes = documentos
    .filter(doc => doc.tipo === 'receita')
    .map(doc => {
      const paciente = pacientes.find(p => p.id === doc.paciente_id)
      return {
        id: doc.id,
        patient: paciente?.nome || "Paciente",
        date: doc.created_at,
        status: doc.status,
        medications: [],
        document: doc
      }
    })
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

  const handleSignatureComplete = async (result: any) => {
    console.log('Assinatura concluída:', result)
    setSignatureModalOpen(false)
    setQuickSignatureModalOpen(false)
    
    try {
      if (selectedPrescriptionForSign && selectedPrescriptionForSign.document) {
        // Atualizar status no banco
        await atualizarDocumento(selectedPrescriptionForSign.document.id, {
          status: 'assinado',
          assinado: true,
          hash_assinatura: result.signatureId || result.hash
        });
        
        // Gerar PDF assinado
        const pacienteData = pacientes.find(p => p.id === selectedPrescriptionForSign.document.paciente_id);
        if (pacienteData && profile) {
          const pdfData = {
            paciente: pacienteData,
            medicamentos: medications.filter(med => med.name.trim()),
            instrucoes: currentPrescription.instructions,
            observacoes: currentPrescription.observations,
            medico: profile,
            numeroDocumento: selectedPrescriptionForSign.document.numero_documento || '',
            dataEmissao: new Date().toLocaleDateString('pt-BR')
          };
          
          const pdf = generatePrescriptionPdf(pdfData);
          pdf.save(`receita_${selectedPrescriptionForSign.document.numero_documento}.pdf`);
        }
        
        // Reset form
        setSelectedPatient("")
        setMedications([{ name: "", dosage: "", duration: "" }])
        setCurrentPrescription({ instructions: "", observations: "" })
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.error('Erro ao finalizar assinatura:', error);
      toast({
        title: "Erro",
        description: "Erro ao finalizar a assinatura.",
        variant: "destructive"
      })
    }
    
    setSelectedPrescriptionForSign(null)
    
    toast({
      title: "Prescrição assinada!",
      description: "A prescrição foi assinada digitalmente com sucesso."
    })
  }

  const handleConnectCertificate = async () => {
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

    try {
      setLoading(true);
      
      // Primeiro, criar o documento no banco
      const numeroDocumento = generateDocumentNumber();
      const conteudo = createPrescriptionContent();
      
      const documentoData = {
        paciente_id: selectedPatient,
        tipo: 'receita' as const,
        titulo: `Receita Médica - ${numeroDocumento}`,
        conteudo,
        numero_documento: numeroDocumento,
        status: 'finalizado' as DocumentoMedico['status'],
        assinado: false
      };

      const documento = await criarDocumento(documentoData);
      
      // Encontrar dados do paciente selecionado
      const pacienteData = pacientes.find(p => p.id === selectedPatient)
      
      // Criar objeto da prescrição para assinatura
      const prescriptionForSign = {
        id: documento.id,
        patient: pacienteData?.nome || "Paciente",
        date: new Date().toISOString(),
        medications: medications.filter(med => med.name.trim()),
        instructions: currentPrescription.instructions,
        observations: currentPrescription.observations,
        status: "finalizado",
        document: documento
      }

      setSelectedPrescriptionForSign(prescriptionForSign)
      
      // Se já tem certificado configurado, usar assinatura rápida
      if (hasActiveCertificate()) {
        setQuickSignatureModalOpen(true)
      } else {
        // Senão, abrir modal de configuração
        setSignatureModalOpen(true)
      }
    } catch (error) {
      console.error('Erro ao preparar assinatura:', error);
      toast({
        title: "Erro",
        description: "Erro ao preparar a prescrição para assinatura.",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  }

  const generateDocumentNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4);
    return `RX${year}${month}${day}${timestamp}`;
  };

  const createPrescriptionContent = () => {
    const pacienteData = pacientes.find(p => p.id === selectedPatient);
    const medicamentosText = medications
      .filter(med => med.name.trim())
      .map((med, index) => 
        `${index + 1}. ${med.name}${med.dosage ? ` - ${med.dosage}` : ''}${med.duration ? ` - ${med.duration}` : ''}`
      )
      .join('\n');
    
    return `PRESCRIÇÃO MÉDICA

PACIENTE: ${pacienteData?.nome || 'N/A'}
DATA: ${new Date().toLocaleDateString('pt-BR')}

MEDICAMENTOS:
${medicamentosText}

INSTRUÇÕES GERAIS:
${currentPrescription.instructions || 'N/A'}

OBSERVAÇÕES:
${currentPrescription.observations || 'N/A'}`;
  };

  const handleSavePrescription = async (isDraft = false) => {
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

    try {
      setLoading(true);
      
      const numeroDocumento = generateDocumentNumber();
      const conteudo = createPrescriptionContent();
      
      const documentoData = {
        paciente_id: selectedPatient,
        tipo: 'receita' as const,
        titulo: `Receita Médica - ${numeroDocumento}`,
        conteudo,
        numero_documento: numeroDocumento,
        status: (isDraft ? 'rascunho' : 'finalizado') as DocumentoMedico['status'],
        assinado: false
      };

      await criarDocumento(documentoData);
      
      // Reset form
      setSelectedPatient("")
      setMedications([{ name: "", dosage: "", duration: "" }])
      setCurrentPrescription({ instructions: "", observations: "" })
      setIsDialogOpen(false)

      toast({
        title: isDraft ? "Rascunho salvo!" : "Prescrição salva!",
        description: isDraft ? "O rascunho foi salvo com sucesso." : "A prescrição foi criada com sucesso."
      })
    } catch (error) {
      console.error('Erro ao salvar prescrição:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar a prescrição. Tente novamente.",
        variant: "destructive"
      })
    } finally {
      setLoading(false);
    }
  };

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
              <Button 
                variant="outline" 
                onClick={() => handleSavePrescription(true)}
                disabled={loading}
              >
                <FileText className="h-4 w-4 mr-2" />
                Salvar Rascunho
              </Button>
              <Button 
                onClick={() => handleSavePrescription(false)}
                disabled={loading}
              >
                <Send className="h-4 w-4 mr-2" />
                Finalizar Prescrição
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
            <div className="text-2xl font-bold">
              {prescricoes.filter(p => 
                new Date(p.date).toDateString() === new Date().toDateString()
              ).length}
            </div>
            <p className="text-xs text-muted-foreground">Hoje</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aguardando Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {prescricoes.filter(p => p.status === 'finalizado').length}
            </div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assinadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {prescricoes.filter(p => p.status === 'assinado').length}
            </div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rascunhos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {prescricoes.filter(p => p.status === 'rascunho').length}
            </div>
            <p className="text-xs text-muted-foreground">Salvos</p>
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
              {loadingDocumentos ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Carregando prescrições...
                  </TableCell>
                </TableRow>
              ) : prescricoes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhuma prescrição encontrada
                  </TableCell>
                </TableRow>
              ) : (
                prescricoes.map((prescription) => (
                  <TableRow key={prescription.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{prescription.patient}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(prescription.date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Pill className="h-3 w-3" />
                        {prescription.document?.numero_documento || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          prescription.status === "assinado" ? "default" : 
                          prescription.status === "finalizado" ? "secondary" : 
                          "outline"
                        }
                        className={
                          prescription.status === "assinado" ? "bg-green-600 text-white" :
                          prescription.status === "finalizado" ? "bg-blue-600 text-white" :
                          "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {prescription.status === "assinado" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {prescription.status === "finalizado" && <Send className="h-3 w-3 mr-1" />}
                        {prescription.status === "rascunho" && <Clock className="h-3 w-3 mr-1" />}
                        {prescription.status === "assinado" ? "Assinada" : 
                         prescription.status === "finalizado" ? "Aguardando Assinatura" : 
                         "Rascunho"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <FileText className="h-4 w-4" />
                        </Button>
                        {prescription.status === "finalizado" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSignPrescription(prescription)}
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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