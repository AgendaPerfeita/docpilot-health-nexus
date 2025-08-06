import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// WebUSB type extension
declare global {
  interface Navigator {
    usb?: {
      requestDevice(options: { filters: Array<{ vendorId?: number }> }): Promise<any>;
      getDevices(): Promise<any[]>;
    };
  }
}

export interface CertificateInfo {
  id?: string;
  type: 'A1' | 'A3';
  data?: string; // Base64 for A1
  password?: string; // For A1
  name?: string;
  cpf?: string;
  validUntil?: string;
  isActive?: boolean;
}

export interface SignatureResult {
  success: boolean;
  signatureId?: string;
  verificationCode?: string;
  timestamp?: string;
  hash?: string;
  error?: string;
}

const STORAGE_KEY = 'digital_certificates';

export const useDigitalSignature = () => {
  const [loading, setLoading] = useState(false);
  const [certificates, setCertificates] = useState<CertificateInfo[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<CertificateInfo | null>(null);

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
      if (!navigator.usb) {
        toast.error('WebUSB não suportado neste navegador');
        return null;
      }

      // Request device access
      const device = await navigator.usb.requestDevice({
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

  // Storage functions
  const encryptData = (data: string): string => {
    // Simple base64 encoding - in production use proper encryption
    return btoa(data);
  };

  const decryptData = (encrypted: string): string => {
    try {
      return atob(encrypted);
    } catch {
      return '';
    }
  };

  const loadCertificates = useCallback(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const decrypted = decryptData(stored);
        const parsed = JSON.parse(decrypted);
        setCertificates(parsed.certificates || []);
        const active = parsed.certificates?.find((cert: CertificateInfo) => cert.isActive);
        setActiveCertificate(active || null);
      }
    } catch (error) {
      console.error('Erro ao carregar certificados:', error);
    }
  }, []);

  const saveCertificate = useCallback(async (certificate: CertificateInfo) => {
    try {
      const newCert = {
        ...certificate,
        id: Date.now().toString(),
        isActive: true
      };

      // Deactivate other certificates
      const updatedCerts = certificates.map(cert => ({ ...cert, isActive: false }));
      updatedCerts.push(newCert);

      const toStore = { certificates: updatedCerts };
      const encrypted = encryptData(JSON.stringify(toStore));
      localStorage.setItem(STORAGE_KEY, encrypted);
      
      setCertificates(updatedCerts);
      setActiveCertificate(newCert);
    } catch (error) {
      console.error('Erro ao salvar certificado:', error);
      throw error;
    }
  }, [certificates]);

  const removeCertificate = useCallback(async (index: number) => {
    try {
      const updatedCerts = certificates.filter((_, i) => i !== index);
      const toStore = { certificates: updatedCerts };
      const encrypted = encryptData(JSON.stringify(toStore));
      localStorage.setItem(STORAGE_KEY, encrypted);
      
      setCertificates(updatedCerts);
      
      // If removed certificate was active, set another as active
      const removedCert = certificates[index];
      if (removedCert?.isActive) {
        const newActive = updatedCerts.find(cert => cert.type === 'A1') || updatedCerts[0] || null;
        if (newActive) {
          newActive.isActive = true;
          setActiveCertificate(newActive);
        } else {
          setActiveCertificate(null);
        }
      }
    } catch (error) {
      console.error('Erro ao remover certificado:', error);
      throw error;
    }
  }, [certificates]);

  const setActiveCert = useCallback(async (certificateId: string) => {
    try {
      const updatedCerts = certificates.map(cert => ({
        ...cert,
        isActive: cert.id === certificateId
      }));
      
      const toStore = { certificates: updatedCerts };
      const encrypted = encryptData(JSON.stringify(toStore));
      localStorage.setItem(STORAGE_KEY, encrypted);
      
      setCertificates(updatedCerts);
      setActiveCertificate(updatedCerts.find(cert => cert.isActive) || null);
    } catch (error) {
      console.error('Erro ao definir certificado ativo:', error);
      throw error;
    }
  }, [certificates]);

  const hasActiveCertificate = useCallback(() => {
    return activeCertificate !== null;
  }, [activeCertificate]);

  const signWithActiveCertificate = async (
    documentId: string,
    documentContent: string,
    documentType: string,
    additionalPassword?: string
  ): Promise<SignatureResult> => {
    if (!activeCertificate) {
      return { success: false, error: 'Nenhum certificado ativo configurado' };
    }

    const certificateForSigning = {
      ...activeCertificate,
      password: additionalPassword || activeCertificate.password
    };

    return signDocument(documentId, documentContent, documentType, certificateForSigning);
  };

  // Legacy functions for backward compatibility
  const addCertificate = (certificate: CertificateInfo) => {
    saveCertificate(certificate);
  };

  return {
    loading,
    certificates,
    activeCertificate,
    signDocument,
    validateSignature,
    processCertificateA1,
    detectCertificateA3,
    addCertificate,
    removeCertificate,
    loadCertificates,
    saveCertificate,
    setActiveCert,
    hasActiveCertificate,
    signWithActiveCertificate
  };
};