
import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: ('medico' | 'paciente' | 'clinica' | 'hospital' | 'staff' | 'plantonista')[];
  fallback?: ReactNode;
  showError?: boolean;
}

export const RoleGuard = ({ 
  children, 
  allowedRoles, 
  fallback,
  showError = true 
}: RoleGuardProps) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return fallback || (showError ? <UnauthorizedAccess message="Usuário não autenticado" /> : null);
  }

  if (!allowedRoles.includes(profile.tipo)) {
    return fallback || (showError ? (
      <UnauthorizedAccess message={`Acesso restrito. Necessário: ${allowedRoles.join(', ')}`} />
    ) : null);
  }

  return <>{children}</>;
};

const UnauthorizedAccess = ({ message }: { message: string }) => (
  <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <Alert className="max-w-md border-red-200 bg-red-50">
      <ShieldAlert className="h-4 w-4 text-red-600" />
      <AlertDescription>
        <strong className="text-red-800">Acesso Negado</strong>
        <p className="text-red-700 mt-1">{message}</p>
      </AlertDescription>
    </Alert>
  </div>
);
