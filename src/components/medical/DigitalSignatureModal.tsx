import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Shield, Smartphone, FileCheck, AlertCircle } from 'lucide-react';
import { useDigitalSignature, CertificateInfo } from '@/hooks/useDigitalSignature';
import { toast } from 'sonner';

interface DigitalSignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentTitle: string;
  documentContent: string;
  documentType: string;
  onSignatureComplete: (result: any) => void;
}

export const DigitalSignatureModal = ({
  open,
  onOpenChange,
  documentId,
  documentTitle,
  documentContent,
  documentType,
  onSignatureComplete
}: DigitalSignatureModalProps) => {
  const [selectedCertificate, setSelectedCertificate] = useState<CertificateInfo | null>(null);
  const [a1Password, setA1Password] = useState('');
  const [step, setStep] = useState<'select' | 'sign' | 'complete'>('select');
  
  const {
    loading,
    certificates,
    signDocument,
    processCertificateA1,
    detectCertificateA3,
    addCertificate
  } = useDigitalSignature();

  const handleA1Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!a1Password) {
      toast.error('Digite a senha do certificado A1');
      return;
    }

    try {
      const certificate = await processCertificateA1(file, a1Password);
      addCertificate(certificate);
      setSelectedCertificate(certificate);
      toast.success('Certificado A1 carregado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar certificado A1');
    }
  };

  const handleA3Detection = async () => {
    const certificate = await detectCertificateA3();
    if (certificate) {
      addCertificate(certificate);
      setSelectedCertificate(certificate);
      toast.success('Token A3 detectado com sucesso!');
    }
  };

  const handleSign = async () => {
    if (!selectedCertificate) {
      toast.error('Selecione um certificado');
      return;
    }

    setStep('sign');
    const result = await signDocument(documentId, documentContent, documentType, selectedCertificate);
    
    if (result.success) {
      setStep('complete');
      onSignatureComplete(result);
    } else {
      setStep('select');
    }
  };

  const resetModal = () => {
    setStep('select');
    setSelectedCertificate(null);
    setA1Password('');
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetModal();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assinatura Digital - {documentTitle}
          </DialogTitle>
        </DialogHeader>

        {step === 'select' && (
          <Tabs defaultValue="a1" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="a1">Certificado A1</TabsTrigger>
              <TabsTrigger value="a3">Token A3</TabsTrigger>
            </TabsList>

            <TabsContent value="a1" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Certificado A1 (.p12)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="password">Senha do Certificado</Label>
                    <Input
                      id="password"
                      type="password"
                      value={a1Password}
                      onChange={(e) => setA1Password(e.target.value)}
                      placeholder="Digite a senha do certificado"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificate">Arquivo do Certificado</Label>
                    <Input
                      id="certificate"
                      type="file"
                      accept=".p12,.pfx"
                      onChange={handleA1Upload}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="a3" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    Token A3 / Smart Card
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center p-8 border-2 border-dashed rounded-lg">
                      <div className="text-center">
                        <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground mb-4">
                          Conecte seu token A3 ou smart card
                        </p>
                        <Button onClick={handleA3Detection}>
                          Detectar Token
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      Certifique-se de que o token está conectado
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {step === 'select' && certificates.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Certificados Disponíveis</h3>
            <div className="space-y-2">
              {certificates.map((cert, index) => (
                <Card 
                  key={index}
                  className={`cursor-pointer transition-colors ${
                    selectedCertificate === cert ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedCertificate(cert)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {cert.type === 'A1' ? <Upload className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                        <div>
                          <p className="font-medium">{cert.name || `Certificado ${cert.type}`}</p>
                          <p className="text-sm text-muted-foreground">Tipo: {cert.type}</p>
                        </div>
                      </div>
                      <Badge variant={cert.type === 'A1' ? 'default' : 'secondary'}>
                        {cert.type}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {step === 'sign' && (
          <div className="text-center space-y-4 py-8">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <h3 className="font-medium">Processando Assinatura Digital</h3>
            <p className="text-sm text-muted-foreground">
              Aguarde enquanto o documento é assinado digitalmente...
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="text-center space-y-4 py-8">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <FileCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-green-900">Documento Assinado com Sucesso!</h3>
            <p className="text-sm text-muted-foreground">
              O documento foi assinado digitalmente e está pronto para uso
            </p>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {step === 'complete' ? 'Fechar' : 'Cancelar'}
          </Button>
          {step === 'select' && selectedCertificate && (
            <Button onClick={handleSign} disabled={loading}>
              <Shield className="h-4 w-4 mr-2" />
              Assinar Documento
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};