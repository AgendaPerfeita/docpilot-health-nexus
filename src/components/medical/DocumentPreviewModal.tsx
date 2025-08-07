import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Download, Eye, Shield, Calendar, User, QrCode } from 'lucide-react';
import { DocumentoMedico } from '@/hooks/useDocumentos';
import { usePacientes } from '@/hooks/usePacientes';
import { useAuth } from '@/hooks/useAuth';
import { usePdfExport } from '@/hooks/usePdfExport';
import { useAuditoria } from '@/hooks/useAuditoria';
import { toast } from 'sonner';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentoMedico | null;
  onSign?: (document: DocumentoMedico) => void;
}

export const DocumentPreviewModal = ({ isOpen, onClose, document, onSign }: DocumentPreviewModalProps) => {
  const { pacientes } = usePacientes();
  const { profile } = useAuth();
  const { generatePrescriptionPdf } = usePdfExport();
  const { logVisualizacao, logDownload } = useAuditoria();
  const [isGenerating, setIsGenerating] = useState(false);

  if (!document) return null;

  const paciente = pacientes.find(p => p.id === document.paciente_id);
  
  // Registrar visualização quando o modal abrir
  useState(() => {
    if (isOpen && document.id) {
      logVisualizacao(document.id, {
        tipo_visualizacao: 'preview_modal',
        documento_tipo: document.tipo
      });
    }
  });

  const parseContent = () => {
    try {
      const lines = document.conteudo.split('\n');
      const sections = {
        paciente: '',
        medicamentos: [] as string[],
        instrucoes: '',
        observacoes: ''
      };

      let currentSection = '';
      
      lines.forEach(line => {
        if (line.includes('PACIENTE:')) {
          currentSection = 'paciente';
          sections.paciente = line.split('PACIENTE:')[1]?.trim() || '';
        } else if (line.includes('MEDICAMENTOS:')) {
          currentSection = 'medicamentos';
        } else if (line.includes('INSTRUÇÕES GERAIS:')) {
          currentSection = 'instrucoes';
        } else if (line.includes('OBSERVAÇÕES:')) {
          currentSection = 'observacoes';
        } else if (line.trim() && currentSection) {
          if (currentSection === 'medicamentos' && line.match(/^\d+\./)) {
            sections.medicamentos.push(line.trim());
          } else if (currentSection === 'instrucoes') {
            sections.instrucoes += line.trim() + ' ';
          } else if (currentSection === 'observacoes') {
            sections.observacoes += line.trim() + ' ';
          }
        }
      });

      return sections;
    } catch (error) {
      console.error('Erro ao parsear conteúdo:', error);
      return { paciente: '', medicamentos: [], instrucoes: '', observacoes: '' };
    }
  };

  const handleDownloadPdf = async () => {
    if (!paciente || !profile || !document) return;

    try {
      setIsGenerating(true);
      
      const content = parseContent();
      const medicamentos = content.medicamentos.map(med => {
        const parts = med.split(' - ');
        return {
          name: parts[0]?.replace(/^\d+\.\s*/, '') || '',
          dosage: parts[1] || '',
          duration: parts[2] || ''
        };
      });

      const pdfData = {
        paciente,
        medicamentos,
        instrucoes: content.instrucoes.trim(),
        observacoes: content.observacoes.trim(),
        medico: profile,
        numeroDocumento: document.numero_documento || '',
        dataEmissao: new Date(document.created_at).toLocaleDateString('pt-BR'),
        codigoVerificacao: document.assinado ? 'VER12345678' : undefined, // TODO: usar código real
        urlValidacao: document.url_validacao
      };

      const pdf = await generatePrescriptionPdf(pdfData);
      const fileName = `${document.tipo}_${document.numero_documento}.pdf`;
      pdf.save(fileName);

      // Log do download
      await logDownload(document.id, fileName);

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rascunho': return 'bg-gray-500';
      case 'finalizado': return 'bg-blue-500';
      case 'assinado': return 'bg-green-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const content = parseContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {document.titulo}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Informações do documento */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Informações do Documento
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">{document.tipo}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge className={getStatusColor(document.status || '')}>{document.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número:</span>
                  <span>{document.numero_documento}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Data:</span>
                  <span>{new Date(document.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {document.assinado && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Assinado:</span>
                    <div className="flex items-center gap-1 text-green-600">
                      <Shield className="h-3 w-3" />
                      <span className="text-xs">Sim</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Paciente
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Nome:</span>
                  <p className="font-medium">{content.paciente || paciente?.nome}</p>
                </div>
                {paciente?.data_nascimento && (
                  <div>
                    <span className="text-muted-foreground">Idade:</span>
                    <span className="ml-2">
                      {new Date().getFullYear() - new Date(paciente.data_nascimento).getFullYear()} anos
                    </span>
                  </div>
                )}
                {paciente?.cpf && (
                  <div>
                    <span className="text-muted-foreground">CPF:</span>
                    <span className="ml-2">{paciente.cpf}</span>
                  </div>
                )}
              </div>
            </div>

            {document.codigo_qr && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    Validação Digital
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    <p>Este documento possui QR Code para validação de autenticidade.</p>
                    <p className="mt-1 font-mono text-xs">VER12345678</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={handleDownloadPdf}
                disabled={isGenerating}
                className="w-full"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {isGenerating ? 'Gerando PDF...' : 'Download PDF'}
              </Button>
              
              {onSign && !document.assinado && (
                <Button
                  onClick={() => onSign(document)}
                  className="w-full"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Assinar Documento
                </Button>
              )}
            </div>
          </div>

          {/* Conteúdo do documento */}
          <div className="lg:col-span-2">
            <ScrollArea className="h-[600px] border rounded-lg p-4">
              <div className="space-y-6">
                {/* Medicamentos */}
                {content.medicamentos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Medicamentos Prescritos</h3>
                    <div className="space-y-2">
                      {content.medicamentos.map((med, index) => (
                        <div key={index} className="p-3 bg-muted rounded-lg">
                          <p className="font-medium">{med}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instruções */}
                {content.instrucoes && (
                  <div>
                    <h3 className="font-semibold mb-3">Instruções Gerais</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm leading-relaxed">{content.instrucoes}</p>
                    </div>
                  </div>
                )}

                {/* Observações */}
                {content.observacoes && (
                  <div>
                    <h3 className="font-semibold mb-3">Observações Médicas</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm leading-relaxed">{content.observacoes}</p>
                    </div>
                  </div>
                )}

                {/* Conteúdo bruto se não conseguir parsear */}
                {content.medicamentos.length === 0 && !content.instrucoes && !content.observacoes && (
                  <div>
                    <h3 className="font-semibold mb-3">Conteúdo Completo</h3>
                    <div className="p-3 bg-muted rounded-lg">
                      <pre className="text-sm whitespace-pre-wrap">{document.conteudo}</pre>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};