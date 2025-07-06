
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { ArrowLeft, User, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MedicalLayout } from "@/components/medical/MedicalLayout";

const NovaEvolucao = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { criarProntuario } = useProntuarios();
  
  const [isConsultationActive, setIsConsultationActive] = useState(false);
  const [currentProntuarioId, setCurrentProntuarioId] = useState<string | undefined>();
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

  const paciente = pacientes.find(p => p.id === id);
  console.log('NovaEvolucao - Found paciente:', paciente);

  useEffect(() => {
    if (!loadingPacientes && !paciente) {
      toast({
        title: "Paciente não encontrado",
        description: "O paciente selecionado não foi encontrado.",
        variant: "destructive"
      });
      navigate('/prontuario');
    }
  }, [paciente, loadingPacientes, navigate, toast]);

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

  if (loadingPacientes) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!paciente) {
    return null;
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
        <div className="space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/prontuario')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Nova Evolução</h1>
              <p className="text-muted-foreground">
                Registrar nova evolução para {paciente.nome}
              </p>
            </div>
          </div>

          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados do Paciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="font-medium">{paciente.nome}</p>
                </div>
                {paciente.convenio && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Convênio</label>
                    <p className="font-medium">{paciente.convenio}</p>
                  </div>
                )}
                {paciente.telefone && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                    <p className="font-medium">{paciente.telefone}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Start Consultation */}
          <Card>
            <CardContent className="pt-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Iniciar Atendimento</h2>
              <p className="text-muted-foreground mb-4">
                Clique para iniciar o atendimento e acessar a interface completa de evolução médica
              </p>
              <Button size="lg" onClick={handleStartConsultation}>
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
