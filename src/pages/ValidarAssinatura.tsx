import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Search, CheckCircle, XCircle, FileText, User, Calendar } from 'lucide-react';
import { useDigitalSignature } from '@/hooks/useDigitalSignature';

export default function ValidarAssinatura() {
  const [verificationCode, setVerificationCode] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const { validateSignature } = useDigitalSignature();

  const handleValidate = async () => {
    if (!verificationCode.trim()) {
      return;
    }

    setLoading(true);
    const result = await validateSignature(verificationCode);
    setValidationResult(result);
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Shield className="h-8 w-8" />
            Validação de Assinatura Digital
          </h1>
          <p className="text-muted-foreground">
            Verifique a autenticidade e integridade de documentos assinados digitalmente
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Verificar Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o código de verificação (ex: VER12345678)"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
              <Button onClick={handleValidate} disabled={loading || !verificationCode.trim()}>
                {loading ? 'Verificando...' : 'Validar'}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground">
              <p>• O código de verificação está localizado no documento assinado</p>
              <p>• Format: VER seguido de 8 dígitos (ex: VER12345678)</p>
            </div>
          </CardContent>
        </Card>

        {validationResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {validationResult.valid ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Assinatura Válida
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600" />
                    Assinatura Inválida
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {validationResult.valid ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Documento:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <p className="font-medium">{validationResult.signature.documentTitle}</p>
                        <Badge variant="outline">{validationResult.signature.documentType}</Badge>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Médico Responsável:</span>
                      </div>
                      <div className="pl-6 space-y-1">
                        <p className="font-medium">{validationResult.signature.doctorName}</p>
                        <p className="text-sm text-muted-foreground">
                          CRM: {validationResult.signature.doctorCrm}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {validationResult.signature.doctorSpecialty}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Data da Assinatura:</span>
                      </div>
                      <div className="pl-6">
                        <p>{new Date(validationResult.signature.timestamp).toLocaleString('pt-BR')}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Certificado:</span>
                      </div>
                      <div className="pl-6">
                        <Badge variant="secondary">
                          Tipo {validationResult.signature.certificateType}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-900">Status da Verificação:</span>
                    </div>
                    <div className="pl-6 space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Integridade do documento verificada</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Assinatura digital válida</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm">Documento não foi alterado após a assinatura</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">Verificação Concluída</h4>
                    <p className="text-sm text-green-800">
                      Este documento foi assinado digitalmente e sua integridade foi verificada com sucesso. 
                      A assinatura é válida e o documento não foi alterado desde a assinatura.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-medium text-red-900 mb-2">Verificação Falhou</h4>
                    <p className="text-sm text-red-800">
                      {validationResult.error || 'Não foi possível validar a assinatura digital deste documento.'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Possíveis motivos:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1 pl-4">
                      <li>• Código de verificação incorreto ou inexistente</li>
                      <li>• Documento foi alterado após a assinatura</li>
                      <li>• Assinatura digital corrompida</li>
                      <li>• Documento não foi assinado digitalmente</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Sobre a Validação de Assinatura Digital</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">O que é verificado:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Integridade do documento</li>
                  <li>• Validade da assinatura digital</li>
                  <li>• Informações do signatário</li>
                  <li>• Data e hora da assinatura</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Segurança:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Criptografia SHA-256</li>
                  <li>• Certificados ICP-Brasil</li>
                  <li>• Timestamp confiável</li>
                  <li>• Trilha de auditoria</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}