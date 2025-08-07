import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertTriangle, Search, FileText, Shield, Clock, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ValidationResult {
  valid: boolean;
  signature?: {
    id: string;
    documento_id: string;
    timestamp_assinatura: string;
    tipo_certificado: string;
    status: string;
  };
  document?: {
    id: string;
    tipo: string;
    titulo: string;
    created_at: string;
    medico_nome: string;
    medico_crm: string;
    medico_especialidade: string;
  };
  message?: string;
}

export default function ValidarAssinatura() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(searchParams.get('code') || '');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setVerificationCode(code);
      handleValidate(code);
    }
  }, [searchParams]);

  const handleValidate = async (code?: string) => {
    const codeToValidate = code || verificationCode;
    if (!codeToValidate.trim()) {
      toast({
        title: "Código requerido",
        description: "Por favor, insira um código de verificação.",
        variant: "destructive"
      });
      return;
    }

    setValidating(true);
    setHasSearched(true);

    try {
      const { data, error } = await supabase.functions.invoke('validate-signature', {
        body: { verificationCode: codeToValidate }
      });

      if (error) {
        console.error('Erro na validação:', error);
        setValidationResult({
          valid: false,
          message: 'Erro ao validar a assinatura. Tente novamente.'
        });
      } else {
        setValidationResult(data);
      }
    } catch (error) {
      console.error('Erro na validação:', error);
      setValidationResult({
        valid: false,
        message: 'Erro de conexão. Verifique sua internet e tente novamente.'
      });
    } finally {
      setValidating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assinado': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'cancelado': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Validação de Assinatura Digital
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Verifique a autenticidade e integridade de documentos médicos assinados digitalmente.
            Insira o código de verificação para confirmar a validade da assinatura.
          </p>
        </div>

        {/* Search Form */}
        <Card className="max-w-md mx-auto mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Código de Verificação
            </CardTitle>
            <CardDescription>
              Insira o código que aparece no documento (formato: VER12345678)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="verification-code">Código</Label>
              <Input
                id="verification-code"
                placeholder="Ex: VER12345678"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                className="font-mono"
              />
            </div>
            <Button 
              onClick={() => handleValidate()} 
              disabled={validating || !verificationCode.trim()}
              className="w-full"
            >
              {validating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Validando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Validar Assinatura
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Validation Results */}
        {hasSearched && validationResult && (
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <div className="flex items-center space-x-2">
                {validationResult.valid ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <CardTitle className={validationResult.valid ? 'text-green-700' : 'text-red-700'}>
                  {validationResult.valid ? 'Assinatura Válida' : 'Assinatura Inválida'}
                </CardTitle>
              </div>
              <CardDescription>
                {validationResult.valid 
                  ? 'Este documento foi verificado e possui assinatura digital válida.'
                  : validationResult.message || 'A assinatura não pôde ser verificada.'
                }
              </CardDescription>
            </CardHeader>

            {validationResult.valid && validationResult.signature && validationResult.document && (
              <CardContent className="space-y-6">
                {/* Document Information */}
                <div>
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <FileText className="h-5 w-5 mr-2" />
                    Informações do Documento
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo:</span>
                      <span className="capitalize">{validationResult.document.tipo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Título:</span>
                      <span>{validationResult.document.titulo}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Data de Criação:</span>
                      <span>{formatDate(validationResult.document.created_at)}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Doctor Information */}
                <div>
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <User className="h-5 w-5 mr-2" />
                    Médico Responsável
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Nome:</span>
                      <span>{validationResult.document.medico_nome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">CRM:</span>
                      <span>{validationResult.document.medico_crm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Especialidade:</span>
                      <span>{validationResult.document.medico_especialidade || 'Não informada'}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Signature Information */}
                <div>
                  <h3 className="flex items-center text-lg font-semibold mb-3">
                    <Shield className="h-5 w-5 mr-2" />
                    Detalhes da Assinatura
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Status:</span>
                      <Badge className={getStatusColor(validationResult.signature.status)}>
                        {validationResult.signature.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tipo de Certificado:</span>
                      <span className="uppercase">{validationResult.signature.tipo_certificado}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Data da Assinatura:</span>
                      <span>{formatDate(validationResult.signature.timestamp_assinatura)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">ID da Assinatura:</span>
                      <span className="font-mono text-sm">{validationResult.signature.id}</span>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100">
                        Verificação de Segurança
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Esta validação confirma que o documento foi assinado digitalmente usando um certificado válido 
                        e que seu conteúdo não foi alterado desde a assinatura.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Instructions */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Como Validar um Documento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs font-bold px-1">1</span>
              </div>
              <p className="text-sm">Localize o código de verificação no documento (formato VER + 8 dígitos)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs font-bold px-1">2</span>
              </div>
              <p className="text-sm">Insira o código no campo acima ou escaneie o QR Code do documento</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-1 mt-0.5">
                <span className="text-blue-600 dark:text-blue-300 text-xs font-bold px-1">3</span>
              </div>
              <p className="text-sm">Clique em "Validar Assinatura" para verificar a autenticidade</p>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}