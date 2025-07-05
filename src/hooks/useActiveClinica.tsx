import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from './useAuth';
import { useUserProfile } from './useUserProfile';

interface ClinicaContext {
  id: string;
  nome: string;
  email: string;
}

interface ActiveClinicaContextType {
  activeClinica: ClinicaContext | null;
  setActiveClinica: (clinica: ClinicaContext | null) => void;
  availableClinicas: ClinicaContext[];
  loading: boolean;
}

const ActiveClinicaContext = createContext<ActiveClinicaContextType | undefined>(undefined);

export const ActiveClinicaProvider = ({ children }: { children: React.ReactNode }) => {
  const { profile } = useAuth();
  const { clinicaMedicos } = useUserProfile();
  const [activeClinica, setActiveClinicaState] = useState<ClinicaContext | null>(null);
  const [loading, setLoading] = useState(true);

  // Clínicas disponíveis para o médico
  const availableClinicas: ClinicaContext[] = clinicaMedicos
    .filter(cm => cm.ativo && cm.clinica)
    .map(cm => ({
      id: cm.clinica_id,
      nome: cm.clinica!.nome,
      email: cm.clinica!.email
    }));

  // Função para alterar clínica ativa
  const setActiveClinica = (clinica: ClinicaContext | null) => {
    setActiveClinicaState(clinica);
    if (clinica) {
      localStorage.setItem('activeClinica', JSON.stringify(clinica));
    } else {
      localStorage.removeItem('activeClinica');
    }
  };

  // Carregar clínica ativa do localStorage ao inicializar
  useEffect(() => {
    if (profile?.tipo === 'medico' && availableClinicas.length > 0) {
      const stored = localStorage.getItem('activeClinica');
      if (stored) {
        try {
          const parsedClinica = JSON.parse(stored);
          // Verificar se a clínica ainda está disponível
          const isStillActive = availableClinicas.find(c => c.id === parsedClinica.id);
          if (isStillActive) {
            setActiveClinicaState(parsedClinica);
          } else {
            // Se não está mais disponível, definir a primeira disponível
            setActiveClinica(availableClinicas[0]);
          }
        } catch {
          setActiveClinica(availableClinicas[0]);
        }
      } else {
        // Se não tem preferência salva, usar a primeira disponível
        setActiveClinica(availableClinicas[0]);
      }
    } else if (profile?.tipo === 'clinica') {
      // Para clínicas, a clínica ativa é ela mesma
      setActiveClinicaState({
        id: profile.id,
        nome: profile.nome,
        email: profile.email
      });
    }
    setLoading(false);
  }, [profile, clinicaMedicos]);

  return (
    <ActiveClinicaContext.Provider value={{
      activeClinica,
      setActiveClinica,
      availableClinicas,
      loading
    }}>
      {children}
    </ActiveClinicaContext.Provider>
  );
};

export const useActiveClinica = () => {
  const context = useContext(ActiveClinicaContext);
  if (context === undefined) {
    throw new Error('useActiveClinica must be used within an ActiveClinicaProvider');
  }
  return context;
};