import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDigitalSignature } from "@/hooks/useDigitalSignature";
import { Shield, Key, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface QuickSignatureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentContent: string;
  documentType: string;
  onSignatureComplete: (result: any) => void;
}

export default function QuickSignatureModal({
  open,
  onOpenChange,
  documentId,
  documentContent,
  documentType,
  onSignatureComplete
}: QuickSignatureModalProps) {
  const { activeCertificate, signWithActiveCertificate, loading } = useDigitalSignature();
  const [password, setPassword] = useState('');

  const handleSign = async () => {
    if (!activeCertificate) {
      toast.error('Nenhum certificado configurado');
      return;
    }

    if (activeCertificate.type === 'A1' && !password) {
      toast.error('Digite a senha do certificado');
      return;
    }

    try {
      const result = await signWithActiveCertificate(
        documentId,
        documentContent,
        documentType,
        password
      );

      if (result.success) {
        onSignatureComplete(result);
        onOpenChange(false);
        setPassword('');
      }
    } catch (error) {
      console.error('Erro na assinatura:', error);
    }
  };

  const handleCancel = () => {
    setPassword('');
    onOpenChange(false);
  };

  if (!activeCertificate) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Assinatura Digital
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium">Nenhum certificado configurado</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Configure um certificado digital nas configurações para assinar documentos.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                Cancelar
              </Button>
              <Button 
                className="flex-1" 
                onClick={() => {
                  onOpenChange(false);
                  // Redirect to configurations
                  window.location.href = '/configuracoes';
                }}
              >
                Configurar Certificado
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Assinar Documento
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="p-3 border rounded-lg bg-muted/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{activeCertificate.name}</p>
                <p className="text-xs text-muted-foreground">
                  Certificado {activeCertificate.type}
                </p>
              </div>
            </div>
          </div>

          {activeCertificate.type === 'A1' && (
            <div className="space-y-2">
              <Label htmlFor="cert-password">Senha do Certificado</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cert-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSign()}
                />
              </div>
            </div>
          )}

          {activeCertificate.type === 'A3' && (
            <div className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-200">
                Certifique-se de que seu token/smart card está conectado e desbloqueado.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={handleCancel}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              className="flex-1" 
              onClick={handleSign}
              disabled={loading || (activeCertificate.type === 'A1' && !password)}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Assinando...
                </>
              ) : (
                'Assinar Documento'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}