import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Eye, Edit, Trash2, Bot, AlertTriangle, Stethoscope, FileText, Upload } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const mockRecords = [
  {
    id: 1,
    patient: "Maria Silva",
    date: "2024-01-15",
    type: "Consulta",
    status: "Ativo",
    aiGenerated: true,
    queixa: "Dor abdominal há 2 dias",
    historia: "Dor em região epigástrica, sem irradiação, associada a náuseas. Nega vômitos ou febre.",
    exame: "Abdome plano, doloroso à palpação de epigástrio, sem sinais de irritação peritoneal.",
    diagnostico: "Dispepsia funcional",
    conduta: "Omeprazol 20mg/dia por 4 semanas. Orientada dieta leve.",
    examesComplementares: "Solicitado USG abdominal e exames laboratoriais.",
    observacoes: "Paciente ansiosa, orientada sobre sinais de alarme.",
    sinaisVitais: {
      pa: "120/80",
      fc: "78",
      temp: "36.7",
      peso: "68",
      altura: "165",
      imc: "24.98"
    }
  },
  {
    id: 2,
    patient: "João Santos",
    date: "2024-01-10",
    type: "Retorno",
    status: "Ativo",
    aiGenerated: false,
    queixa: "Acompanhamento de hipertensão",
    historia: "Em uso regular de losartana. Nega sintomas atuais.",
    exame: "PA 130/85 mmHg, FC 72 bpm, demais exames normais.",
    diagnostico: "Hipertensão arterial controlada",
    conduta: "Manter losartana 50mg/dia. Retorno em 3 meses.",
    examesComplementares: "Solicitado perfil lipídico.",
    observacoes: "Paciente orientado sobre adesão ao tratamento.",
    sinaisVitais: {
      pa: "130/85",
      fc: "72",
      temp: "36.5",
      peso: "82",
      altura: "175",
      imc: "26.78"
    }
  }
];

const mockSummary = [
  { label: "Evoluções Hoje", value: 8, icon: <Stethoscope className="h-5 w-5 text-blue-600" /> },
  { label: "Geradas por IA", value: 5, icon: <Bot className="h-5 w-5 text-purple-600" /> },
  { label: "Prescrições Pendentes", value: 3, icon: <FileText className="h-5 w-5 text-orange-600" /> },
  { label: "Alertas Ativos", value: 2, icon: <AlertTriangle className="h-5 w-5 text-red-600" /> },
];

const mockAlerts = [
  {
    id: 1,
    patient: "Maria Silva",
    title: "Retorno de Antibiótico",
    description: "Paciente deve retornar em 3 dias para avaliação",
    action: "Agendar Retorno"
  },
  {
    id: 2,
    patient: "João Santos",
    title: "Exame Pendente",
    description: "Hemograma solicitado há 7 dias, sem resultado",
    action: "Contatar Paciente"
  }
];

const mockPatient = {
  nome: "Maria Souza",
  alergias: "Dipirona, Amoxicilina",
  antecedentes: "Hipertensão, Diabetes"
};

export default function ProntuarioIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [symptoms, setSymptoms] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [records, setRecords] = useState([...mockRecords]);
  const [form, setForm] = useState({
    paciente: "",
    data: "",
    queixa: "",
    historia: "",
    exame: "",
    diagnostico: "",
    conduta: "",
    examesComplementares: "",
    observacoes: "",
    sinaisVitais: {
      paSistolica: "",
      paDiastolica: "",
      fc: "",
      temp: "",
      peso: "",
      altura: "",
      imc: ""
    }
  });
  const [touched, setTouched] = useState({});
  const isRequired = (field) => [
    "paciente","data","queixa","historia","exame","diagnostico","conduta","examesComplementares","observacoes"
  ].includes(field);
  const validate = () => {
    for (const field of [
      "paciente","data","queixa","historia","exame","diagnostico","conduta","examesComplementares","observacoes"
    ]) {
      if (!form[field]) return false;
    }
    return true;
  };
  const handleSave = e => {
    e.preventDefault();
    setTouched({
      paciente: true, data: true, queixa: true, historia: true, exame: true, diagnostico: true, conduta: true, examesComplementares: true, observacoes: true
    });
    if (!validate()) return;
    setRecords([{
      id: records.length + 1,
      patient: form.paciente,
      date: form.data,
      type: form.conduta,
      diagnosis: form.diagnostico,
      prescription: form.conduta,
      status: "Ativo",
      aiGenerated: false,
      sinaisVitais: {
        pa: `${form.sinaisVitais.paSistolica}/${form.sinaisVitais.paDiastolica}`,
        fc: form.sinaisVitais.fc,
        temp: form.sinaisVitais.temp,
        peso: form.sinaisVitais.peso,
        altura: form.sinaisVitais.altura,
        imc: form.sinaisVitais.imc
      }
    }, ...records]);
    setIsDialogOpen(false);
    setForm({
      paciente: "",
      data: "",
      queixa: "",
      historia: "",
      exame: "",
      diagnostico: "",
      conduta: "",
      examesComplementares: "",
      observacoes: "",
      sinaisVitais: { paSistolica: "", paDiastolica: "", fc: "", temp: "", peso: "", altura: "", imc: "" }
    });
    setTouched({});
  };
  const navigate = useNavigate();
  const filteredRecords = mockRecords.filter(r =>
    r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handlePesoAlturaChange = (field, value) => {
    setForm(f => {
      const novosSinais = { ...f.sinaisVitais, [field]: value };
      const peso = parseFloat(novosSinais.peso.replace(',', '.'));
      const alturaCm = parseFloat(novosSinais.altura.replace(',', '.'));
      let imc = '';
      if (!isNaN(peso) && !isNaN(alturaCm) && alturaCm > 0) {
        const alturaM = alturaCm / 100;
        imc = (peso / (alturaM * alturaM)).toFixed(2);
      }
      return { ...f, sinaisVitais: { ...novosSinais, imc } };
    });
  };

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState(null);

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
                <form className="space-y-4" onSubmit={handleSave}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Paciente *</Label>
                      <Input
                        value={form.paciente}
                        onChange={e => setForm(f => ({ ...f, paciente: e.target.value }))}
                        placeholder="Buscar paciente..."
                        required
                      />
                      {touched.paciente && !form.paciente && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                    </div>
                    <div className="space-y-2">
                      <Label>Data da Consulta *</Label>
                      <Input
                        type="date"
                        value={form.data}
                        onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
                        required
                      />
                      {touched.data && !form.data && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                    </div>
                  </div>
                  {/* Sinais Vitais */}
                  <div className="flex gap-2 items-end">
                    <div>
                      <Label>PA (mmHg)</Label>
                      <div className="flex gap-1">
                        <Input
                          value={form.sinaisVitais.paSistolica}
                          onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, paSistolica: e.target.value } }))}
                          placeholder="Sistólica"
                          className="w-16"
                          maxLength={3}
                          inputMode="numeric"
                        />
                        <span className="self-center">/</span>
                        <Input
                          value={form.sinaisVitais.paDiastolica}
                          onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, paDiastolica: e.target.value } }))}
                          placeholder="Diastólica"
                          className="w-16"
                          maxLength={3}
                          inputMode="numeric"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>FC</Label>
                      <Input value={form.sinaisVitais.fc} onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, fc: e.target.value } }))} placeholder="bpm" />
                    </div>
                    <div>
                      <Label>Temp.</Label>
                      <Input value={form.sinaisVitais.temp} onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, temp: e.target.value } }))} placeholder="°C" />
                    </div>
                    <div>
                      <Label>Peso</Label>
                      <Input value={form.sinaisVitais.peso} onChange={e => handlePesoAlturaChange('peso', e.target.value)} placeholder="kg" />
                    </div>
                    <div>
                      <Label>Altura</Label>
                      <Input value={form.sinaisVitais.altura} onChange={e => handlePesoAlturaChange('altura', e.target.value)} placeholder="cm" />
                    </div>
                    <div>
                      <Label>IMC</Label>
                      <Input value={form.sinaisVitais.imc} readOnly placeholder="" />
                      {form.sinaisVitais.imc && (
                        <span className="text-xs text-muted-foreground block mt-1">
                          {(() => {
                            const imc = parseFloat(form.sinaisVitais.imc);
                            if (isNaN(imc)) return null;
                            if (imc < 18.5) return 'Baixo peso';
                            if (imc < 25) return 'Peso normal';
                            if (imc < 30) return 'Sobrepeso';
                            if (imc < 35) return 'Obesidade grau I';
                            if (imc < 40) return 'Obesidade grau II';
                            return 'Obesidade grau III';
                          })()}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Alergias/Antecedentes */}
                  <div className="space-y-2">
                    <Label>Alergias/Antecedentes</Label>
                    <Textarea value={mockPatient.alergias + (mockPatient.antecedentes ? ", " + mockPatient.antecedentes : "")} readOnly className="bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label>Queixa Principal *</Label>
                    <Textarea
                      value={form.queixa}
                      onChange={e => setForm(f => ({ ...f, queixa: e.target.value }))}
                      placeholder="Descreva a queixa principal do paciente..."
                      required
                    />
                    {touched.queixa && !form.queixa && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>História da Doença Atual *</Label>
                    <Textarea
                      value={form.historia}
                      onChange={e => setForm(f => ({ ...f, historia: e.target.value }))}
                      placeholder="História detalhada..."
                      required
                    />
                    {touched.historia && !form.historia && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Exame Físico *</Label>
                    <Textarea
                      value={form.exame}
                      onChange={e => setForm(f => ({ ...f, exame: e.target.value }))}
                      placeholder="Achados do exame físico..."
                      required
                    />
                    {touched.exame && !form.exame && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Hipótese Diagnóstica *</Label>
                    <Textarea
                      value={form.diagnostico}
                      onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))}
                      placeholder="CID-10 ou descrição do diagnóstico..."
                      required
                    />
                    {touched.diagnostico && !form.diagnostico && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Conduta/Prescrição *</Label>
                    <Textarea
                      value={form.conduta}
                      onChange={e => setForm(f => ({ ...f, conduta: e.target.value }))}
                      placeholder="Medicamentos, orientações, exames solicitados..."
                      required
                    />
                    {touched.conduta && !form.conduta && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Exames Complementares *</Label>
                    <Textarea
                      value={form.examesComplementares}
                      onChange={e => setForm(f => ({ ...f, examesComplementares: e.target.value }))}
                      placeholder="Exames solicitados, resultados recebidos..."
                      required
                    />
                    {touched.examesComplementares && !form.examesComplementares && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="space-y-2">
                    <Label>Observações Gerais *</Label>
                    <Textarea
                      value={form.observacoes}
                      onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
                      placeholder="Anotações adicionais..."
                      required
                    />
                    {touched.observacoes && !form.observacoes && <span className="text-red-500 text-xs">Campo obrigatório</span>}
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" type="button" onClick={() => { setIsDialogOpen(false); setForm({ paciente: "", data: "", queixa: "", historia: "", exame: "", diagnostico: "", conduta: "", examesComplementares: "", observacoes: "", sinaisVitais: { paSistolica: "", paDiastolica: "", fc: "", temp: "", peso: "", altura: "", imc: "" } }); setTouched({}); }}>Cancelar</Button>
                    <Button type="submit">Salvar Evolução</Button>
                  </div>
                </form>
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {mockSummary.map((item, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
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
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">Nenhum prontuário encontrado.</TableCell>
                </TableRow>
              ) : (
                filteredRecords.map(r => [
                  <TableRow key={r.id}>
                    <TableCell>
                      <button
                        className="font-medium hover:underline focus:outline-none"
                        onClick={() => setExpandedPatient(expandedPatient === r.patient ? null : r.patient)}
                      >
                        {r.patient}
                      </button>
                      {r.aiGenerated && (
                        <Badge variant="secondary" className="text-xs ml-2">
                          <Bot className="h-3 w-3 mr-1" />
                          IA
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(r.date).toLocaleDateString('pt-BR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.type}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {r.diagnostico || r.diagnosis || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'Ativo' ? 'default' : 'secondary'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(r); setIsDetailsOpen(true); }}>
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(r); setIsAlertOpen(true); }}>
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>,
                  expandedPatient === r.patient && (
                    <TableRow key={r.id + '-expanded'} className="bg-muted/40">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-4">
                          <div className="font-semibold text-sm mb-2">Atendimentos de {r.patient}</div>
                          <Table className="border">
                            <TableHeader>
                              <TableRow>
                                <TableHead>Data</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Diagnóstico</TableHead>
                                <TableHead>Ações</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {records.filter(rec => rec.patient === r.patient).map((rec) => (
                                <TableRow key={rec.id + '-sub'}>
                                  <TableCell>{new Date(rec.date).toLocaleDateString('pt-BR')}</TableCell>
                                  <TableCell>{rec.type}</TableCell>
                                  <TableCell>{rec.diagnostico || rec.diagnosis || '—'}</TableCell>
                                  <TableCell>
                                    <Button variant="ghost" size="sm" onClick={() => { setSelectedRecord(rec); setIsDetailsOpen(true); }}>
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                ])
              )}
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

      {/* Dialog de Detalhes do Prontuário */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes do Prontuário</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-2">
              <div><b>Paciente:</b> {selectedRecord.patient || selectedRecord.paciente || '—'}</div>
              <div><b>Data:</b> {selectedRecord.date ? new Date(selectedRecord.date).toLocaleDateString('pt-BR') : (selectedRecord.data ? new Date(selectedRecord.data).toLocaleDateString('pt-BR') : '—')}</div>
              <div><b>Tipo:</b> {selectedRecord.type || '—'}</div>
              <div><b>Status:</b> {selectedRecord.status || '—'}</div>
              <div><b>Diagnóstico:</b> {selectedRecord.diagnosis || selectedRecord.diagnostico || '—'}</div>
              <div><b>Prescrição:</b> {selectedRecord.prescription || selectedRecord.conduta || '—'}</div>
              <div><b>Queixa Principal:</b> {selectedRecord.queixa || '—'}</div>
              <div><b>História da Doença Atual:</b> {selectedRecord.historia || '—'}</div>
              <div><b>Exame Físico:</b> {selectedRecord.exame || '—'}</div>
              <div><b>Hipótese Diagnóstica:</b> {selectedRecord.diagnostico || selectedRecord.diagnosis || '—'}</div>
              <div><b>Conduta/Prescrição:</b> {selectedRecord.conduta || selectedRecord.prescription || '—'}</div>
              <div><b>Exames Complementares:</b> {selectedRecord.examesComplementares || '—'}</div>
              <div><b>Observações Gerais:</b> {selectedRecord.observacoes || '—'}</div>
              <div><b>Sinais Vitais:</b></div>
              <ul className="ml-4 text-sm">
                <li><b>PA:</b> {selectedRecord.sinaisVitais?.pa || selectedRecord.sinaisVitais?.paSistolica && selectedRecord.sinaisVitais?.paDiastolica ? `${selectedRecord.sinaisVitais.paSistolica}/${selectedRecord.sinaisVitais.paDiastolica}` : '—'}</li>
                <li><b>FC:</b> {selectedRecord.sinaisVitais?.fc || '—'}</li>
                <li><b>Temp:</b> {selectedRecord.sinaisVitais?.temp || '—'}</li>
                <li><b>Peso:</b> {selectedRecord.sinaisVitais?.peso || '—'}</li>
                <li><b>Altura:</b> {selectedRecord.sinaisVitais?.altura || '—'}</li>
                <li><b>IMC:</b> {selectedRecord.sinaisVitais?.imc || '—'}</li>
              </ul>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Dialog de Alertas do Prontuário */}
      <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alertas do Prontuário</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-2">
              <div><b>Paciente:</b> {selectedRecord.patient}</div>
              <div className="text-orange-700">Nenhum alerta crítico para este registro.</div>
              {/* Aqui você pode exibir alertas reais se houver */}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 