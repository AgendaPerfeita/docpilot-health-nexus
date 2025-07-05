import { ReactNode } from 'react';
import { useMedicoPermissions } from '@/hooks/useMedicoPermissions';
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
  const { permissions, loading, temPermissao, isPremium } = useMedicoPermissions();

  // Não é médico - liberado
  if (profile?.tipo !== 'medico') {
    return <>{children}</>;
  }

  if (loading) {
    return <div className="animate-pulse bg-muted h-20 rounded" />;
  }

  // Verificar se tem a permissão específica
  if (requiredPermission && !temPermissao(requiredPermission)) {
    return fallback || (showUpgradeMessage ? <UpgradeMessage /> : null);
  }

  // Verificar se precisa de plano premium
  if (requiresPremium && !isPremium()) {
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