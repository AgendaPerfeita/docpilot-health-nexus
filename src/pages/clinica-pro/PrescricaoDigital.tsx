// Moved from root to clinica-pro folder

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { 
  Pill, 
  Plus, 
  Search, 
  FileText, 
  User,
  Calendar,
  Clock,
  Printer,
  Send,
  Save,
  Trash2,
  Edit,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

const PrescricaoDigital = () => {
  const [selectedPatient, setSelectedPatient] = useState("")
  const [prescriptions, setPrescriptions] = useState<any[]>([])
  const [currentPrescription, setCurrentPrescription] = useState({
    medications: [] as any[],
    instructions: "",
    observations: "",
    validityDays: 30
  })

  // Mock data
  const patients = [
    { id: '1', name: 'Ana Silva', age: 35, allergies: ['Penicilina'] },
    { id: '2', name: 'João Santos', age: 42, allergies: [] },
    { id: '3', name: 'Maria Costa', age: 28, allergies: ['Dipirona'] }
  ]

  const commonMedications = [
    {
      name: "Paracetamol",
      concentrations: ["500mg", "750mg"],
      forms: ["Comprimido", "Suspensão oral"],
      contraindications: ["Insuficiência hepática grave"]
    },
    {
      name: "Ibuprofeno",
      concentrations: ["400mg", "600mg"],
      forms: ["Comprimido", "Suspensão oral"],
      contraindications: ["Úlcera péptica ativa", "Insuficiência renal"]
    },
    {
      name: "Amoxicilina",
      concentrations: ["500mg", "875mg"],
      forms: ["Comprimido", "Suspensão oral"],
      contraindications: ["Alergia a penicilinas"]
    }
  ]

  const recentPrescriptions = [
    {
      id: '1',
      patient: 'Ana Silva',
      date: '2024-01-15',
      medications: 2,
      status: 'active'
    },
    {
      id: '2',
      patient: 'João Santos',
      date: '2024-01-14',
      medications: 1,
      status: 'expired'
    },
    {
      id: '3',
      patient: 'Maria Costa',
      date: '2024-01-12',
      medications: 3,
      status: 'active'
    }
  ]

  const addMedication = (medication: any) => {
    const newMedication = {
      id: Date.now(),
      name: medication.name,
      concentration: "",
      form: "",
      dosage: "",
      frequency: "",
      duration: "",
      instructions: ""
    }
    
    setCurrentPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }))
  }

  const updateMedication = (id: number, field: string, value: string) => {
    setCurrentPrescription(prev => ({
      ...prev,
      medications: prev.medications.map(med => 
        med.id === id ? { ...med, [field]: value } : med
      )
    }))
  }

  const removeMedication = (id: number) => {
    setCurrentPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter(med => med.id !== id)
    }))
  }

  const savePrescription = () => {
    if (!selectedPatient || currentPrescription.medications.length === 0) {
      return
    }

    const newPrescription = {
      id: Date.now(),
      patientId: selectedPatient,
      patientName: patients.find(p => p.id === selectedPatient)?.name || '',
      date: new Date().toISOString().split('T')[0],
      medications: currentPrescription.medications.length,
      status: 'active',
      data: currentPrescription
    }

    setPrescriptions(prev => [newPrescription, ...prev])
    
    // Reset form
    setCurrentPrescription({
      medications: [],
      instructions: "",
      observations: "",
      validityDays: 30
    })
    setSelectedPatient("")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'expired':
        return 'bg-red-100 text-red-800'
      case 'used':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedPatientData = patients.find(p => p.id === selectedPatient)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prescrição Digital</h1>
          <p className="text-muted-foreground">
            Sistema completo de prescrições médicas digitais
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          Clínica Pro
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescrições Hoje</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescrições Ativas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medicamentos Únicos</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interações Detectadas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* New Prescription Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nova Prescrição
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Selection */}
              <div className="space-y-2">
                <Label htmlFor="patient">Selecionar Paciente</Label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha um paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} - {patient.age} anos
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Patient Info */}
              {selectedPatientData && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{selectedPatientData.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatientData.age} anos
                        </p>
                      </div>
                      {selectedPatientData.allergies.length > 0 && (
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="text-sm font-medium text-orange-700">Alergias:</p>
                            <p className="text-sm text-orange-600">
                              {selectedPatientData.allergies.join(', ')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Medication Search and Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Medicamentos</Label>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Medicamento
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Buscar Medicamento</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar medicamento..."
                            className="pl-8"
                          />
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {commonMedications.map((med, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded-lg cursor-pointer hover:bg-muted"
                              onClick={() => addMedication(med)}
                            >
                              <div className="font-medium">{med.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {med.concentrations.join(', ')} • {med.forms.join(', ')}
                              </div>
                              {med.contraindications.length > 0 && (
                                <div className="text-xs text-orange-600 mt-1">
                                  Contraindicações: {med.contraindications.join(', ')}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {/* Selected Medications */}
                <div className="space-y-4">
                  {currentPrescription.medications.map((med, index) => (
                    <Card key={med.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium">{med.name}</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMedication(med.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Concentração</Label>
                          <Select
                            value={med.concentration}
                            onValueChange={(value) => updateMedication(med.id, 'concentration', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="500mg">500mg</SelectItem>
                              <SelectItem value="750mg">750mg</SelectItem>
                              <SelectItem value="1g">1g</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Forma Farmacêutica</Label>
                          <Select
                            value={med.form}
                            onValueChange={(value) => updateMedication(med.id, 'form', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comprimido">Comprimido</SelectItem>
                              <SelectItem value="capsula">Cápsula</SelectItem>
                              <SelectItem value="suspensao">Suspensão oral</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Posologia</Label>
                          <Input
                            placeholder="Ex: 1 comprimido"
                            value={med.dosage}
                            onChange={(e) => updateMedication(med.id, 'dosage', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Frequência</Label>
                          <Select
                            value={med.frequency}
                            onValueChange={(value) => updateMedication(med.id, 'frequency', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1x">1x ao dia</SelectItem>
                              <SelectItem value="2x">2x ao dia</SelectItem>
                              <SelectItem value="3x">3x ao dia</SelectItem>
                              <SelectItem value="4x">4x ao dia</SelectItem>
                              <SelectItem value="6-6h">De 6 em 6 horas</SelectItem>
                              <SelectItem value="8-8h">De 8 em 8 horas</SelectItem>
                              <SelectItem value="12-12h">De 12 em 12 horas</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Duração</Label>
                          <Input
                            placeholder="Ex: 7 dias"
                            value={med.duration}
                            onChange={(e) => updateMedication(med.id, 'duration', e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Instruções Especiais</Label>
                          <Input
                            placeholder="Ex: Tomar com alimentos"
                            value={med.instructions}
                            onChange={(e) => updateMedication(med.id, 'instructions', e.target.value)}
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* General Instructions */}
              <div className="space-y-2">
                <Label htmlFor="instructions">Instruções Gerais</Label>
                <Textarea
                  id="instructions"
                  placeholder="Instruções gerais para o paciente..."
                  value={currentPrescription.instructions}
                  onChange={(e) => setCurrentPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Observations */}
              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações médicas..."
                  value={currentPrescription.observations}
                  onChange={(e) => setCurrentPrescription(prev => ({ ...prev, observations: e.target.value }))}
                  rows={2}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
                <Button onClick={savePrescription} disabled={!selectedPatient || currentPrescription.medications.length === 0}>
                  <FileText className="h-4 w-4 mr-2" />
                  Gerar Prescrição
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Prescrições Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prescription.patient}</h4>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status === 'active' ? 'Ativa' : 
                       prescription.status === 'expired' ? 'Expirada' : 'Usada'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(prescription.date).toLocaleDateString('pt-BR')}</span>
                    <span>{prescription.medications} medicamento(s)</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-1" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              ))}
              
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{prescription.patientName}</h4>
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status === 'active' ? 'Ativa' : 
                       prescription.status === 'expired' ? 'Expirada' : 'Usada'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{new Date(prescription.date).toLocaleDateString('pt-BR')}</span>
                    <span>{prescription.medications} medicamento(s)</span>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Printer className="h-4 w-4 mr-1" />
                      Imprimir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrescricaoDigital