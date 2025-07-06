import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { profile, loading, loadingProfile } = useAuth();

  // Log temporário para debug
  console.log('Index render - loading:', loading, 'loadingProfile:', loadingProfile, 'profile:', profile);

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">
            {loading ? 'Carregando...' : 'Carregando perfil...'}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    console.log('No profile, redirecting to landing');
    return <Navigate to="/landing" replace />;
  }

  console.log('Profile found, redirecting to:', profile.tipo);

  // Redirecionar baseado no tipo de usuário
  switch (profile.tipo) {
    case 'medico':
      return <Navigate to="/dashboard" replace />;
    case 'paciente':
      return <Navigate to="/paciente" replace />;
    case 'clinica':
    case 'hospital':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/landing" replace />;
  }
};

export default Index;
