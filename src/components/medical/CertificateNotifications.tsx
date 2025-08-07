import React, { useState, useEffect } from 'react';
import { useDigitalSignature } from '@/hooks/useDigitalSignature';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  X, 
  Settings, 
  Bell,
  Calendar,
  Zap
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CertificateAlert {
  id: string;
  type: 'expiring' | 'expired' | 'invalid' | 'security';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
  dismissible: boolean;
  expiresAt?: Date;
}

export const CertificateNotifications: React.FC = () => {
  const { certificates, loading } = useDigitalSignature();
  const [alerts, setAlerts] = useState<CertificateAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && certificates.length > 0) {
      generateAlerts();
    }
  }, [certificates, loading]);

  const generateAlerts = () => {
    const newAlerts: CertificateAlert[] = [];
    const now = new Date();

    certificates.forEach((cert, index) => {
      // Simular data de expiração baseada no tipo de certificado
      const expirationDate = new Date();
      if (cert.type === 'A1') {
        expirationDate.setFullYear(expirationDate.getFullYear() + 1); // A1 geralmente dura 1 ano
      } else {
        expirationDate.setFullYear(expirationDate.getFullYear() + 3); // A3 geralmente dura 3 anos
      }

      const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      // Alertas de expiração
      if (daysUntilExpiration <= 0) {
        newAlerts.push({
          id: `expired_${index}`,
          type: 'expired',
          severity: 'high',
          title: 'Certificado Expirado',
          message: `Seu certificado ${cert.type} expirou. Renove imediatamente para continuar assinando documentos.`,
          action: 'Renovar Certificado',
          dismissible: false,
          expiresAt: expirationDate
        });
      } else if (daysUntilExpiration <= 7) {
        newAlerts.push({
          id: `expiring_7_${index}`,
          type: 'expiring',
          severity: 'high',
          title: 'Certificado Expira em Breve',
          message: `Seu certificado ${cert.type} expira em ${daysUntilExpiration} dias. Providencie a renovação.`,
          action: 'Renovar Agora',
          dismissible: true,
          expiresAt: expirationDate
        });
      } else if (daysUntilExpiration <= 30) {
        newAlerts.push({
          id: `expiring_30_${index}`,
          type: 'expiring',
          severity: 'medium',
          title: 'Certificado Próximo do Vencimento',
          message: `Seu certificado ${cert.type} expira em ${daysUntilExpiration} dias. Considere renovar em breve.`,
          action: 'Agendar Renovação',
          dismissible: true,
          expiresAt: expirationDate
        });
      }

      // Verificar se é um certificado ativo há muito tempo (sugerir backup)
      if (cert.isActive && daysUntilExpiration > 60) {
        newAlerts.push({
          id: `backup_${index}`,
          type: 'security',
          severity: 'low',
          title: 'Backup Recomendado',
          message: 'Recomendamos fazer backup regular de seus certificados e configurações.',
          action: 'Configurar Backup',
          dismissible: true
        });
      }
    });

    // Alerta se não há certificados
    if (certificates.length === 0) {
      newAlerts.push({
        id: 'no_certificates',
        type: 'invalid',
        severity: 'high',
        title: 'Nenhum Certificado Configurado',
        message: 'Você precisa configurar pelo menos um certificado digital para assinar documentos.',
        action: 'Configurar Certificado',
        dismissible: false
      });
    }

    // Filtrar alertas já dispensados
    const filteredAlerts = newAlerts.filter(alert => 
      !dismissedAlerts.includes(alert.id) || !alert.dismissible
    );

    setAlerts(filteredAlerts);
  };

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => [...prev, alertId]);
    toast({
      title: "Notificação dispensada",
      description: "A notificação foi dispensada com sucesso."
    });
  };

  const getAlertIcon = (type: CertificateAlert['type']) => {
    switch (type) {
      case 'expired':
      case 'expiring':
        return <Clock className="h-4 w-4" />;
      case 'invalid':
        return <AlertTriangle className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: CertificateAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950';
      case 'medium':
        return 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950';
      case 'low':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950';
      default:
        return '';
    }
  };

  const getTextColor = (severity: CertificateAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-800 dark:text-red-200';
      case 'medium':
        return 'text-amber-800 dark:text-amber-200';
      case 'low':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return '';
    }
  };

  const getIconColor = (severity: CertificateAlert['severity']) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-amber-600 dark:text-amber-400';
      case 'low':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return '';
    }
  };

  const handleActionClick = (alert: CertificateAlert) => {
    switch (alert.action) {
      case 'Renovar Certificado':
      case 'Renovar Agora':
        toast({
          title: "Renovação de Certificado",
          description: "Redirecionando para página de renovação...",
        });
        break;
      case 'Configurar Certificado':
        toast({
          title: "Configuração de Certificado",
          description: "Acesse as configurações para adicionar um certificado.",
        });
        break;
      case 'Configurar Backup':
        toast({
          title: "Backup Automático",
          description: "Configurando sistema de backup...",
        });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Notificações de Certificado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm text-gray-600">Verificando certificados...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleAlerts = alerts.filter(alert => 
    !dismissedAlerts.includes(alert.id) || !alert.dismissible
  );

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Certificados
          </CardTitle>
          <CardDescription>
            Todos os seus certificados estão em ordem.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {visibleAlerts.map((alert) => (
        <Alert 
          key={alert.id}
          className={getSeverityColor(alert.severity)}
        >
          <div className={getIconColor(alert.severity)}>
            {getAlertIcon(alert.type)}
          </div>
          <div className="flex-1">
            <AlertTitle className={getTextColor(alert.severity)}>
              <div className="flex items-center justify-between">
                <span>{alert.title}</span>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {alert.severity === 'high' ? 'Urgente' : 
                     alert.severity === 'medium' ? 'Atenção' : 'Info'}
                  </Badge>
                  {alert.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-6 w-6 p-0 hover:bg-transparent"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </AlertTitle>
            <AlertDescription className={getTextColor(alert.severity)}>
              <div className="mt-2">
                <p>{alert.message}</p>
                {alert.expiresAt && (
                  <div className="mt-2 flex items-center text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Expira em: {alert.expiresAt.toLocaleDateString('pt-BR')}
                  </div>
                )}
                {alert.action && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => handleActionClick(alert)}
                  >
                    <Zap className="h-3 w-3 mr-1" />
                    {alert.action}
                  </Button>
                )}
              </div>
            </AlertDescription>
          </div>
        </Alert>
      ))}
    </div>
  );
};