import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, FileText, Plus, Search, Calendar, Stethoscope, Upload, Bot } from "lucide-react"

const mockRecords = [
  {
    id: 1,
    patient: "Maria Silva",
    date: "2024-01-15",
    type: "Consulta",
    diagnosis: "Diabetes tipo 2",
    prescription: "Metformina 850mg - 2x ao dia",
    status: "Ativo",
    aiGenerated: true
  },
  {
    id: 2,
    patient: "João Santos",
    date: "2024-01-10",
    type: "Retorno",
    diagnosis: "Hipertensão arterial",
    prescription: "Losartana 50mg - 1x ao dia",
    status: "Ativo",
    aiGenerated: false
  }
]

export default function Prontuario() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [symptoms, setSymptoms] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")

  const generateAISuggestion = () => {
    // Simulação de IA - em produção seria uma chamada para API
    const suggestion = `Baseado nos sintomas "${symptoms}", sugiro:
    
HIPÓTESE DIAGNÓSTICA:
- Infecção respiratória alta
- Rinosinusite aguda

CONDUTA SUGERIDA:
- Sintomáticos para alívio dos sintomas
- Hidratação adequada
- Repouso relativo
- Retorno se piora ou não melhora em 5-7 dias

PRESCRIÇÃO SUGERIDA:
- Paracetamol 750mg - 8/8h se dor/febre
- Descongestionante nasal - conforme necessidade
- Solução salina para higiene nasal

OBSERVAÇÕES:
- Avaliar necessidade de antibiótico se não houver melhora
- Orientar sinais de alarme para retorno`
    
    setAiSuggestion(suggestion)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuário Eletrônico</h1>
          <p className="text-muted-foreground">Gerencie prontuários com inteligência artificial</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Evolução
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Stethoscope className="h-5 w-5" />
                Nova Evolução Clínica
              </DialogTitle>
              <DialogDescription>
                Registre uma nova evolução no prontuário do paciente
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="evolucao" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="evolucao">Evolução</TabsTrigger>
                <TabsTrigger value="ia">Assistente IA</TabsTrigger>
                <TabsTrigger value="anexos">Anexos</TabsTrigger>
              </TabsList>
              
              <TabsContent value="evolucao" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Paciente</Label>
                    <Input placeholder="Buscar paciente..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Data da Consulta</Label>
                    <Input type="date" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Queixa Principal</Label>
                  <Textarea placeholder="Descreva a queixa principal do paciente..." />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>História da Doença Atual</Label>
                    <Textarea placeholder="História detalhada..." className="min-h-[100px]" />
                  </div>
                  <div className="space-y-2">
                    <Label>Exame Físico</Label>
                    <Textarea placeholder="Achados do exame físico..." className="min-h-[100px]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Hipótese Diagnóstica</Label>
                  <Textarea placeholder="CID-10 ou descrição do diagnóstico..." />
                </div>
                
                <div className="space-y-2">
                  <Label>Conduta/Prescrição</Label>
                  <Textarea placeholder="Medicamentos, orientações, exames solicitados..." className="min-h-[100px]" />
                </div>
              </TabsContent>
              
              <TabsContent value="ia" className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Assistente de IA</h3>
                  </div>
                  <p className="text-sm text-blue-700">
                    Descreva os sintomas e receba sugestões de diagnóstico e conduta
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Sintomas do Paciente</Label>
                  <Textarea 
                    placeholder="Ex: Paciente com febre há 3 dias, tosse seca, dor de cabeça..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                
                <Button onClick={generateAISuggestion} disabled={!symptoms.trim()}>
                  <Bot className="h-4 w-4 mr-2" />
                  Gerar Sugestão com IA
                </Button>
                
                {aiSuggestion && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Sugestão da IA:</h4>
                    <pre className="text-sm text-green-700 whitespace-pre-wrap font-mono">
                      {aiSuggestion}
                    </pre>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" variant="outline">
                        Usar Sugestão
                      </Button>
                      <Button size="sm" variant="ghost">
                        Editar
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="anexos" className="space-y-4">
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Upload de Exames</h3>
                  <p className="text-muted-foreground mb-4">
                    Arraste arquivos aqui ou clique para selecionar
                  </p>
                  <Button variant="outline">
                    Selecionar Arquivos
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Arquivos Anexados</Label>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="text-sm font-medium">Hemograma_completo.pdf</p>
                        <p className="text-xs text-muted-foreground">2.3 MB</p>
                      </div>
                      <Button variant="ghost" size="sm">Remover</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                Salvar Evolução
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Evoluções Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Geradas por IA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">5</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Prescrições Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">3</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">2</div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Prontuários */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prontuários Recentes</CardTitle>
              <CardDescription>Evoluções e registros clínicos</CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prontuários..."
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
                <TableHead>Tipo</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{record.patient}</div>
                      {record.aiGenerated && (
                        <Badge variant="secondary" className="text-xs">
                          <Bot className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(record.date).toLocaleDateString('pt-BR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{record.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {record.diagnosis}
                  </TableCell>
                  <TableCell>
                    <Badge variant={record.status === 'Ativo' ? 'default' : 'secondary'}>
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alertas Inteligentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Alertas Inteligentes
          </CardTitle>
          <CardDescription>
            Notificações automáticas baseadas em IA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
              <div>
                <p className="font-medium text-orange-800">Maria Silva - Retorno de Antibiótico</p>
                <p className="text-sm text-orange-600">Paciente deve retornar em 3 dias para avaliação</p>
              </div>
              <Button variant="outline" size="sm">
                Agendar Retorno
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
              <div>
                <p className="font-medium text-blue-800">João Santos - Exame Pendente</p>
                <p className="text-sm text-blue-600">Hemograma solicitado há 7 dias, sem resultado</p>
              </div>
              <Button variant="outline" size="sm">
                Contatar Paciente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}