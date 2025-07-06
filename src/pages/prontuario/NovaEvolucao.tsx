
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { formatarTelefone } from "@/lib/formatters";
import { ArrowLeft, User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MedicalLayout } from "@/components/medical/MedicalLayout";
import { supabase } from "@/integrations/supabase/client";

const NovaEvolucao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { criarProntuario } = useProntuarios();
  
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [currentProntuarioId, setCurrentProntuarioId] = useState<string | undefined>();
  const [pacienteFromDB, setPacienteFromDB] = useState<any>(null);
  const [fetchingPatient, setFetchingPatient] = useState(false);
  const [hasAttemptedDirectFetch, setHasAttemptedDirectFetch] = useState(false);
  const [prontuarioData, setProntuarioData] = useState({
    queixa_principal: '',
    historia_doenca_atual: '',
    exame_fisico: '',
    hipotese_diagnostica: '',
    conduta: '',
    observacoes: ''
  });

  // Debug logs
  console.log('NovaEvolucao - ID from params:', id);
  console.log('NovaEvolucao - All pacientes:', pacientes);
  console.log('NovaEvolucao - Loading pacientes:', loadingPacientes);
  console.log('NovaEvolucao - Current URL:', window.location.href);

  const paciente = pacientes.find(p => p.id === id) || pacienteFromDB;
  console.log('NovaEvolucao - Found paciente:', paciente);
  
  if (pacientes.length > 0) {
    console.log('NovaEvolucao - Comparing IDs:');
    pacientes.forEach(p => {
      console.log(`  - Patient ID: "${p.id}" vs URL ID: "${id}" - Match: ${p.id === id}`);
    });
  }

  useEffect(() => {
    console.log('NovaEvolucao - useEffect triggered:', { loadingPacientes, paciente: !!paciente, id, fetchingPatient, pacientesCount: pacientes.length, hasAttemptedDirectFetch });
    
    // If we're still loading pacientes, wait
    if (loadingPacientes) {
      console.log('NovaEvolucao - Still loading pacientes, waiting...');
      return;
    }
    
    // If we have pacientes loaded but no match found, and we're not already fetching directly
    if (pacientes.length > 0 && !paciente && id && !fetchingPatient && !hasAttemptedDirectFetch) {
      console.log('NovaEvolucao - Pacientes loaded but patient not found in list, attempting direct fetch');
      setFetchingPatient(true);
      setHasAttemptedDirectFetch(true);
      
      const fetchPatientDirectly = async () => {
        try {
          console.log('NovaEvolucao - Fetching patient directly with ID:', id);
          const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('NovaEvolucao - Direct fetch error:', error);
            throw error;
          }
          
          if (data) {
            console.log('NovaEvolucao - Found patient directly:', data);
            setPacienteFromDB(data);
            setFetchingPatient(false);
            return;
          }
          
          // If we get here, no patient was found
          throw new Error('Patient not found');
        } catch (error) {
          console.error('NovaEvolucao - Failed to fetch patient directly:', error);
          setFetchingPatient(false);
          toast({
            title: "Paciente não encontrado",
            description: "O paciente selecionado não foi encontrado.",
            variant: "destructive"
          });
          navigate('/prontuario');
        }
      };
      
      fetchPatientDirectly();
    }
    
    // If we have no pacientes loaded and we're not loading, try direct fetch as fallback
    if (pacientes.length === 0 && !loadingPacientes && id && !fetchingPatient && !pacienteFromDB && !hasAttemptedDirectFetch) {
      console.log('NovaEvolucao - No pacientes loaded and not loading, attempting direct fetch as fallback');
      setFetchingPatient(true);
      setHasAttemptedDirectFetch(true);
      
      const fetchPatientDirectly = async () => {
        try {
          console.log('NovaEvolucao - Fetching patient directly with ID (fallback):', id);
          const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) {
            console.error('NovaEvolucao - Direct fetch error (fallback):', error);
            throw error;
          }
          
          if (data) {
            console.log('NovaEvolucao - Found patient directly (fallback):', data);
            setPacienteFromDB(data);
            setFetchingPatient(false);
            return;
          }
          
          // If we get here, no patient was found
          throw new Error('Patient not found');
        } catch (error) {
          console.error('NovaEvolucao - Failed to fetch patient directly (fallback):', error);
          setFetchingPatient(false);
          toast({
            title: "Paciente não encontrado",
            description: "O paciente selecionado não foi encontrado.",
            variant: "destructive"
          });
          navigate('/prontuario');
        }
      };
      
      fetchPatientDirectly();
    }
  }, [paciente, loadingPacientes, navigate, toast, id, fetchingPatient, pacientes.length, pacienteFromDB, hasAttemptedDirectFetch]);

  useEffect(() => {
    if (!id) {
      toast({
        title: "ID do paciente não fornecido",
        description: "É necessário selecionar um paciente para criar uma evolução.",
        variant: "destructive"
      });
      navigate('/prontuario');
    }
  }, [id, navigate, toast]);

  const handleStartConsultation = () => {
    setIsConsultationActive(true);
  };

  const handleFinishConsultation = async () => {
    if (!paciente) return;

    try {
      const novoProntuario = await criarProntuario({
        paciente_id: paciente.id,
        data_atendimento: new Date().toISOString(),
        ...prontuarioData
      });

      toast({
        title: "Evolução salva com sucesso",
        description: "A evolução médica foi registrada no prontuário do paciente."
      });

      navigate(`/prontuario/paciente/${paciente.id}`);
    } catch (error: any) {
      toast({
        title: "Erro ao salvar evolução",
        description: error.message || "Ocorreu um erro ao salvar a evolução.",
        variant: "destructive"
      });
    }
    
    setIsConsultationActive(false);
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return { anos: 0, meses: 0, dias: 0 };
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return { anos: age - 1, meses: 0, dias: 0 };
    }
    return { anos: age, meses: 0, dias: 0 };
  };

  // Show loading spinner while either loading from usePacientes or fetching directly
  if (loadingPacientes || fetchingPatient) {
    console.log('NovaEvolucao - Showing loading state:', { loadingPacientes, fetchingPatient });
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando dados do paciente...</span>
      </div>
    );
  }

  // Only show error if we're not loading anything and have attempted all fetch methods
  if (!paciente && !loadingPacientes && !fetchingPatient && hasAttemptedDirectFetch) {
    console.log('NovaEvolucao - No patient found after all attempts');
    return null;
  }

  // If we don't have a patient yet but haven't attempted direct fetch, show loading
  if (!paciente) {
    console.log('NovaEvolucao - Patient not loaded yet, showing loading state');
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando dados do paciente...</span>
      </div>
    );
  }

  // Create patient data from real patient information
  const patientData = {
    nome: paciente.nome,
    idade: calculateAge(paciente.data_nascimento),
    convenio: paciente.convenio || "Particular",
    primeiraConsulta: new Date().toLocaleDateString('pt-BR'),
    antecedentes: {
      clinicos: null,
      cirurgicos: null,
      familiares: null,
      habitos: null,
      alergias: null,
      medicamentos: null
    },
    ultimosDiagnosticos: []
  };

  return (
    <div>
      {!isConsultationActive ? (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/prontuario')} className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Nova Evolução</h1>
              <p className="text-muted-foreground text-sm sm:text-base break-words">
                Registrar nova evolução para {paciente.nome}
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="h-5 w-5 mr-2" />
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium text-sm sm:text-base break-words">{paciente.nome}</p>
                </div>
                {paciente.convenio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Convênio</label>
                    <p className="font-medium text-sm sm:text-base">{paciente.convenio}</p>
                  </div>
                )}
                {paciente.telefone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="font-medium text-sm sm:text-base break-all">{formatarTelefone(paciente.telefone)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Start Consultation */}
          <Card>
            <CardContent className="p-4 sm:p-6 text-center">
              <h2 className="text-lg sm:text-xl font-semibold mb-2">Iniciar Atendimento</h2>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Clique para iniciar o atendimento e acessar a interface completa de evolução médica
              </p>
              <Button size="lg" onClick={handleStartConsultation} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                Iniciar Atendimento
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <MedicalLayout
          patientData={patientData}
          onStartConsultation={handleStartConsultation}
          onFinishConsultation={handleFinishConsultation}
          isConsultationActive={isConsultationActive}
          pacienteId={paciente.id}
          prontuarioId={currentProntuarioId}
        />
      )}
    </div>
  );
};

export default NovaEvolucao;
