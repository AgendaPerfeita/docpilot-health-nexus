import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";
import { Shield, Upload, CreditCard, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DigitalCertificateConfig() {
  const { 
    certificates, 
    loadCertificates, 
    saveCertificate, 
    removeCertificate, 
    processCertificateA1, 
    detectCertificateA3 
  } = useDigitalSignature();
  
  const [uploadingA1, setUploadingA1] = useState(false);
  const [detectingA3, setDetectingA3] = useState(false);
  const [a1Password, setA1Password] = useState('');

  useEffect(() => {
    loadCertificates();
  }, []);

  const handleA1Upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !a1Password) {
      toast.error('Selecione um arquivo e digite a senha');
      return;
    }

    setUploadingA1(true);
    try {
      const certificate = await processCertificateA1(file, a1Password);
      await saveCertificate(certificate);
      setA1Password('');
      toast.success('Certificado A1 configurado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar certificado A1');
    } finally {
      setUploadingA1(false);
    }
  };

  const handleA3Detection = async () => {
    setDetectingA3(true);
    try {
      const certificate = await detectCertificateA3();
      if (certificate) {
        await saveCertificate(certificate);
        toast.success('Certificado A3 configurado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao detectar certificado A3');
    } finally {
      setDetectingA3(false);
    }
  };

  const handleRemoveCertificate = async (index: number) => {
    try {
      await removeCertificate(index);
      toast.success('Certificado removido com sucesso!');
    } catch (error) {
      toast.error('Erro ao remover certificado');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Certificados Digitais
        </CardTitle>
        <CardDescription>
          Configure seus certificados digitais para assinatura de documentos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {certificates.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Certificados Configurados</h3>
            {certificates.map((cert, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {cert.type === 'A1' ? (
                    <Upload className="h-4 w-4 text-blue-500" />
                  ) : (
                    <CreditCard className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="font-medium">{cert.name}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant={cert.type === 'A1' ? 'default' : 'secondary'}>
                        {cert.type}
                      </Badge>
                      {cert.validUntil && (
                        <span className="text-xs text-muted-foreground">
                          Válido até: {cert.validUntil}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCertificate(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <Tabs defaultValue="a1" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="a1">Certificado A1</TabsTrigger>
            <TabsTrigger value="a3">Certificado A3</TabsTrigger>
          </TabsList>
          
          <TabsContent value="a1" className="space-y-4">
            <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">
                    Certificado A1
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-200">
                    Arquivo .p12 ou .pfx armazenado localmente. Requer senha de acesso.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="a1-password">Senha do Certificado</Label>
                <Input
                  id="a1-password"
                  type="password"
                  value={a1Password}
                  onChange={(e) => setA1Password(e.target.value)}
                  placeholder="Digite a senha do certificado"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="a1-file">Arquivo do Certificado (.p12 ou .pfx)</Label>
                <Input
                  id="a1-file"
                  type="file"
                  accept=".p12,.pfx"
                  onChange={handleA1Upload}
                  disabled={uploadingA1}
                />
              </div>
              
              <Button 
                className="w-full" 
                disabled={!a1Password || uploadingA1}
                onClick={() => document.getElementById('a1-file')?.click()}
              >
                {uploadingA1 ? 'Processando...' : 'Configurar Certificado A1'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="a3" className="space-y-4">
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100">
                    Certificado A3
                  </h4>
                  <p className="text-sm text-green-700 dark:text-green-200">
                    Token USB ou Smart Card. Conecte o dispositivo antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full" 
              onClick={handleA3Detection}
              disabled={detectingA3}
            >
              {detectingA3 ? 'Detectando...' : 'Detectar Certificado A3'}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}