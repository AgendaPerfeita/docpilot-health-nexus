import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CertificateInfo {
  type: 'A1' | 'A3';
  data?: string; // Base64 for A1
  password?: string; // For A1
  name?: string;
  cpf?: string;
  validUntil?: string;
}

export interface SignatureResult {
  success: boolean;
  signatureId?: string;
  verificationCode?: string;
  timestamp?: string;
  hash?: string;
  error?: string;
}

export const useDigitalSignature = () => {
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);

  const signDocument = async (
    documentId: string,
    documentContent: string,
    documentType: string,
    certificate: CertificateInfo
  ): Promise<SignatureResult> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('digital-signature', {
        body: {
          documentId,
          documentContent,
          documentType,
          certificateType: certificate.type,
          certificateData: certificate.data,
          certificatePassword: certificate.password
        }
      });

      if (error) throw error;

      toast.success('Documento assinado digitalmente com sucesso!');
      return data;
    } catch (error) {
      console.error('Erro na assinatura digital:', error);
      toast.error('Erro ao assinar documento digitalmente');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const validateSignature = async (verificationCode: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('validate-signature', {
        body: { verificationCode }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro na validação:', error);
      toast.error('Erro ao validar assinatura');
      return { valid: false, error: error.message };
    }
  };

  const processCertificateA1 = (file: File, password: string): Promise<CertificateInfo> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const base64 = reader.result as string;
          const certificate: CertificateInfo = {
            type: 'A1',
            data: base64.split(',')[1], // Remove data:application/x-pkcs12;base64,
            password,
            name: file.name
          };
          resolve(certificate);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsDataURL(file);
    });
  };

  const detectCertificateA3 = async (): Promise<CertificateInfo | null> => {
    try {
      // Check if WebUSB is supported
      if (!('usb' in navigator)) {
        toast.error('WebUSB não suportado neste navegador');
        return null;
      }

      // Request device access
      const device = await (navigator as any).usb.requestDevice({
        filters: [
          { vendorId: 0x0529 }, // Common smart card reader vendor
          { vendorId: 0x072f },
          { vendorId: 0x04e6 }
        ]
      });

      if (device) {
        const certificate: CertificateInfo = {
          type: 'A3',
          name: 'Token/Smart Card detectado'
        };
        return certificate;
      }
    } catch (error) {
      console.log('Nenhum token detectado ou usuário cancelou');
    }
    return null;
  };

  const addCertificate = (certificate: CertificateInfo) => {
    setCertificates(prev => [...prev, certificate]);
  };

  const removeCertificate = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  return {
    loading,
    certificates,
    signDocument,
    validateSignature,
    processCertificateA1,
    detectCertificateA3,
    addCertificate,
    removeCertificate
  };
};