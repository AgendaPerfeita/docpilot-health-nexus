import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  requiredPermission?: 'permiteIA' | 'permiteAtendimentoIndividual' | 'permiteRelatoriosAvancados';
  requiresPremium?: boolean;
  fallback?: ReactNode;
  showUpgradeMessage?: boolean;
}

export const PermissionGuard = ({ 
  children, 
  requiredPermission, 
  requiresPremium = false,
  fallback,
  showUpgradeMessage = true 
}: PermissionGuardProps) => {
  const { profile } = useAuth();

  // Se não há perfil, mostrar loading ou fallback
  if (!profile) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Para usuários que não são médicos, liberar acesso
  if (profile.tipo !== 'medico') {
    return <>{children}</>;
  }

  // Para médicos, verificar permissões básicas do perfil
  if (requiredPermission) {
    const hasPermission = profile[requiredPermission as keyof typeof profile];
    if (!hasPermission) {
      return fallback || (showUpgradeMessage ? <UpgradeMessage /> : null);
    }
  }

  // Verificar se precisa de plano premium
  if (requiresPremium && profile.plano_medico !== 'premium') {
    return fallback || (showUpgradeMessage ? <UpgradeMessage /> : null);
  }

  return <>{children}</>;
};

const UpgradeMessage = () => (
  <Alert className="border-orange-200 bg-orange-50">
    <Lock className="h-4 w-4" />
    <AlertDescription>
      <strong>Recurso Premium</strong>
      <p className="text-sm mt-1">
        Este recurso está disponível apenas para médicos com plano Premium. 
        Faça upgrade para ter acesso completo ao SmartDoc.
      </p>
    </AlertDescription>
  </Alert>
);