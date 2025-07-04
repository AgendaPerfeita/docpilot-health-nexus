import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Search, Calendar, Bot, AlertTriangle, Stethoscope, FileText } from "lucide-react";

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

export default function ProntuarioIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState(null);
  const navigate = useNavigate();

  const filteredRecords = mockRecords.filter(r =>
    r.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.diagnostico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Prontuário Eletrônico</h1>
          <p className="text-muted-foreground">Gerencie prontuários com inteligência artificial</p>
        </div>
        <Button onClick={() => navigate('/prontuario/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Evolução
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockSummary.map((item, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                </div>
                {item.icon}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Prontuários Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prontuários</CardTitle>
              <CardDescription>
                Visualize e gerencie todos os prontuários dos pacientes
              </CardDescription>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum prontuário encontrado.
                  </TableCell>
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
                      {r.diagnostico || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.status === 'Ativo' ? 'default' : 'secondary'}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => { setSelectedRecord(r); setIsDetailsOpen(true); }}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>,
                  expandedPatient === r.patient && (
                    <TableRow key={r.id + '-expanded'} className="bg-muted/40">
                      <TableCell colSpan={6} className="p-0">
                        <div className="p-4">
                          <div className="font-semibold text-sm mb-2">Detalhes da Evolução</div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Queixa:</strong> {r.queixa}
                            </div>
                                                         <div>
                               <strong>Diagnóstico:</strong> {r.diagnostico}
                             </div>
                            <div>
                              <strong>Conduta:</strong> {r.conduta}
                            </div>
                            <div>
                              <strong>Sinais Vitais:</strong> PA: {r.sinaisVitais?.pa}, FC: {r.sinaisVitais?.fc}
                            </div>
                          </div>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Prontuário</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><strong>Paciente:</strong> {selectedRecord.patient}</div>
                <div><strong>Data:</strong> {new Date(selectedRecord.date).toLocaleDateString('pt-BR')}</div>
                <div><strong>Tipo:</strong> {selectedRecord.type}</div>
                <div><strong>Status:</strong> {selectedRecord.status}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Queixa Principal:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.queixa}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>História da Doença Atual:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.historia}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Exame Físico:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.exame}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Hipótese Diagnóstica:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.diagnostico || selectedRecord.diagnosis}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Conduta/Prescrição:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.conduta}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Exames Complementares:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.examesComplementares}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Observações Gerais:</strong></div>
                <div className="p-3 bg-muted rounded">{selectedRecord.observacoes}</div>
              </div>
              
              <div className="space-y-2">
                <div><strong>Sinais Vitais:</strong></div>
                <div className="grid grid-cols-3 gap-4 p-3 bg-muted rounded">
                  <div><strong>PA:</strong> {selectedRecord.sinaisVitais?.pa || '—'}</div>
                  <div><strong>FC:</strong> {selectedRecord.sinaisVitais?.fc || '—'}</div>
                  <div><strong>Temp:</strong> {selectedRecord.sinaisVitais?.temp || '—'}</div>
                  <div><strong>Peso:</strong> {selectedRecord.sinaisVitais?.peso || '—'}</div>
                  <div><strong>Altura:</strong> {selectedRecord.sinaisVitais?.altura || '—'}</div>
                  <div><strong>IMC:</strong> {selectedRecord.sinaisVitais?.imc || '—'}</div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 