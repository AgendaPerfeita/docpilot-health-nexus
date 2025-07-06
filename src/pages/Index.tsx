import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/landing" replace />;
  }

  // Redirecionar baseado no tipo de usuário
  switch (profile.tipo) {
    case 'medico':
      return <Navigate to="/dashboard" replace />;
    case 'paciente':
      return <Navigate to="/area-paciente" replace />;
    case 'clinica':
    case 'hospital':
      return <Navigate to="/dashboard" replace />;
    default:
      return <Navigate to="/landing" replace />;
  }
};

export default Index;
