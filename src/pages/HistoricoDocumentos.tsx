import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  FileText, 
  Shield, 
  AlertTriangle,
  Filter,
  RefreshCw,
  Archive
} from 'lucide-react';
import { useDocumentos, DocumentoMedico } from '@/hooks/useDocumentos';
import { usePacientes } from '@/hooks/usePacientes';
import { useAuditoria } from '@/hooks/useAuditoria';
import { DocumentPreviewModal } from '@/components/medical/DocumentPreviewModal';
import { usePdfExport } from '@/hooks/usePdfExport';
import { toast } from 'sonner';

export default function HistoricoDocumentos() {
  const { documentos, loading: loadingDocumentos } = useDocumentos();
  const { pacientes } = usePacientes();
  const { logs, getLogsSummary, getSecurityAlerts } = useAuditoria();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tipoFilter, setTipoFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentoMedico | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  // Filtrar documentos
  const filteredDocuments = documentos.filter(doc => {
    const paciente = pacientes.find(p => p.id === doc.paciente_id);
    const matchesSearch = 
      doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente?.nome.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || doc.status === statusFilter;
    const matchesTipo = !tipoFilter || doc.tipo === tipoFilter;
    const matchesDate = !dateFilter || new Date(doc.created_at).toDateString() === new Date(dateFilter).toDateString();

    return matchesSearch && matchesStatus && matchesTipo && matchesDate;
  });

  // Estatísticas
  const stats = {
    total: documentos.length,
    assinados: documentos.filter(doc => doc.assinado).length,
    pendentes: documentos.filter(doc => doc.status === 'finalizado' && !doc.assinado).length,
    rascunhos: documentos.filter(doc => doc.status === 'rascunho').length
  };

  const getStatusColor = (status: string, assinado: boolean) => {
    if (assinado) return 'bg-green-500';
    switch (status) {
      case 'rascunho': return 'bg-gray-500';
      case 'finalizado': return 'bg-blue-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string, assinado: boolean) => {
    if (assinado) return 'Assinado';
    switch (status) {
      case 'rascunho': return 'Rascunho';
      case 'finalizado': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const handlePreviewDocument = (document: DocumentoMedico) => {
    setSelectedDocument(document);
    setPreviewModalOpen(true);
  };

  const handleViewAudit = (document: DocumentoMedico) => {
    setSelectedDocument(document);
    setAuditModalOpen(true);
  };

  const exportToExcel = () => {
    // Implementar exportação para Excel
    toast.info('Funcionalidade de exportação em desenvolvimento');
  };

  const securityAlerts = getSecurityAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Histórico de Documentos</h1>
          <p className="text-muted-foreground">Gerencie e visualize todos os documentos médicos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Assinados</p>
                <p className="text-2xl font-bold">{stats.assinados}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">{stats.pendentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Archive className="h-8 w-8 text-gray-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Rascunhos</p>
                <p className="text-2xl font-bold">{stats.rascunhos}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas de Segurança */}
      {securityAlerts.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Segurança
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {securityAlerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-yellow-700">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span>{alert.message}</span>
                  <span className="text-xs text-yellow-600">
                    {new Date(alert.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="documentos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="auditoria">Auditoria</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar documentos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="assinado">Assinado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos</SelectItem>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="atestado">Atestado</SelectItem>
                    <SelectItem value="relatório">Relatório</SelectItem>
                    <SelectItem value="declaração">Declaração</SelectItem>
                    <SelectItem value="solicitação">Solicitação</SelectItem>
                    <SelectItem value="laudo">Laudo</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('');
                    setTipoFilter('');
                    setDateFilter('');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Documentos */}
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Documento</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.map((document) => {
                    const paciente = pacientes.find(p => p.id === document.paciente_id);
                    const summary = getLogsSummary(document.id);
                    
                    return (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{document.titulo}</p>
                            <p className="text-sm text-muted-foreground">
                              {document.numero_documento}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{paciente?.nome || 'N/A'}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{document.tipo}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(document.status || '', document.assinado || false)}>
                            {getStatusText(document.status || '', document.assinado || false)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(document.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewDocument(document)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewAudit(document)}
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Auditoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.slice(0, 50).map((log) => {
                    const document = documentos.find(d => d.id === log.documento_id);
                    
                    return (
                      <TableRow key={log.id}>
                        <TableCell className="text-sm">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{document?.titulo || 'Documento'}</p>
                            <p className="text-xs text-muted-foreground">
                              {document?.numero_documento}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{log.acao}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.usuario_tipo || 'Sistema'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {log.ip_address && (
                            <span className="text-muted-foreground">
                              IP: {log.ip_address}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Preview */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        document={selectedDocument}
      />

      {/* Modal de Auditoria */}
      <Dialog open={auditModalOpen} onOpenChange={setAuditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Auditoria do Documento</DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <h3 className="font-semibold">{selectedDocument.titulo}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedDocument.numero_documento}
                </p>
              </div>
              
              <div className="space-y-2">
                {logs
                  .filter(log => log.documento_id === selectedDocument.id)
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <Badge variant="outline" className="mr-2">{log.acao}</Badge>
                        <span className="text-sm">
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {log.ip_address && (
                        <span className="text-xs text-muted-foreground">
                          {log.ip_address}
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}