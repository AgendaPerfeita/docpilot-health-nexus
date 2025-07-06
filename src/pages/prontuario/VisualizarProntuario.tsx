import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { 
  ArrowLeft, 
  Edit, 
  FileText, 
  Calendar, 
  User, 
  Clock,
  Printer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VisualizarProntuario = () => {
  const { id: pacienteId, prontuarioId } = useParams<{ id: string; prontuarioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pacientes, loading: loadingPacientes, buscarPacientePorId } = usePacientes();
  const { prontuarios, loading: loadingProntuarios, buscarProntuarioPorId } = useProntuarios();
  const [pacienteFromDB, setPacienteFromDB] = useState<any>(null);
  const [prontuarioFromDB, setProntuarioFromDB] = useState<any>(null);
  const [fetchingPaciente, setFetchingPaciente] = useState(false);
  const [fetchingProntuario, setFetchingProntuario] = useState(false);

  // Debug logs
  console.log('VisualizarProntuario - pacienteId:', pacienteId);
  console.log('VisualizarProntuario - prontuarioId:', prontuarioId);
  console.log('VisualizarProntuario - All prontuarios:', prontuarios);
  console.log('VisualizarProntuario - All pacientes:', pacientes);

  const paciente = pacientes.find(p => p.id === pacienteId) || pacienteFromDB;
  const prontuario = prontuarios.find(p => p.id === prontuarioId) || prontuarioFromDB;

  console.log('VisualizarProntuario - Found paciente:', paciente);
  console.log('VisualizarProntuario - Found prontuario:', prontuario);

  // Forçar carregamento dos dados se necessário
  useEffect(() => {
    if (pacienteId && prontuarioId) {
      console.log('VisualizarProntuario - Forçando carregamento dos dados...');
      // Os hooks já devem carregar automaticamente, mas vamos garantir
    }
  }, [pacienteId, prontuarioId]);

  // Buscar paciente diretamente se não encontrado na lista
  useEffect(() => {
    const fetchPacienteDirectly = async () => {
      if (!loadingPacientes && !paciente && pacienteId && !fetchingPaciente) {
        console.log('VisualizarProntuario - Paciente não encontrado na lista, buscando diretamente...');
        setFetchingPaciente(true);
        try {
          const pacienteData = await buscarPacientePorId(pacienteId);
          setPacienteFromDB(pacienteData);
        } catch (error) {
          console.error('VisualizarProntuario - Erro ao buscar paciente diretamente:', error);
          toast({
            title: "Paciente não encontrado",
            description: "O paciente selecionado não foi encontrado.",
            variant: "destructive"
          });
          navigate('/prontuario');
        } finally {
          setFetchingPaciente(false);
        }
      }
    };

    fetchPacienteDirectly();
  }, [loadingPacientes, paciente, pacienteId, buscarPacientePorId, toast, navigate, fetchingPaciente]);

  // Buscar prontuário diretamente se não encontrado na lista
  useEffect(() => {
    const fetchProntuarioDirectly = async () => {
      if (!loadingProntuarios && !prontuario && prontuarioId && !fetchingProntuario) {
        console.log('VisualizarProntuario - Prontuário não encontrado na lista, buscando diretamente...');
        setFetchingProntuario(true);
        try {
          const prontuarioData = await buscarProntuarioPorId(prontuarioId);
          setProntuarioFromDB(prontuarioData);
        } catch (error) {
          console.error('VisualizarProntuario - Erro ao buscar prontuário diretamente:', error);
          toast({
            title: "Prontuário não encontrado",
            description: "O prontuário selecionado não foi encontrado.",
            variant: "destructive"
          });
          navigate(`/prontuario/paciente/${pacienteId}`);
        } finally {
          setFetchingProntuario(false);
        }
      }
    };

    fetchProntuarioDirectly();
  }, [loadingProntuarios, prontuario, prontuarioId, buscarProntuarioPorId, toast, navigate, pacienteId, fetchingProntuario]);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return "";
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return `${age - 1} anos`;
    }
    return `${age} anos`;
  };

  if (loadingPacientes || loadingProntuarios || fetchingPaciente || fetchingProntuario) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!paciente || !prontuario) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(`/prontuario/paciente/${pacienteId}`)} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Evolução Médica</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {paciente.nome} - {formatDate(prontuario.data_atendimento)}
          </p>
        </div>
        <div className="flex space-x-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate(`/prontuario/paciente/${pacienteId}/editar/${prontuarioId}`)}
            className="w-full sm:w-auto"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
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
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Nome</label>
              <p className="font-medium">{paciente.nome}</p>
            </div>
            {paciente.data_nascimento && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Idade</label>
                <p className="font-medium">{calculateAge(paciente.data_nascimento)}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Convênio</label>
              <p className="font-medium">{paciente.convenio || 'Particular'}</p>
            </div>
            {paciente.origem && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Origem</label>
                <p className="font-medium">{paciente.origem}</p>
              </div>
            )}
            {paciente.bairro && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                <p className="font-medium">{paciente.bairro}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evolution Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Evolução Médica
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          {/* Date and Time */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(prontuario.data_atendimento)}</span>
          </div>

          {/* Queixa Principal */}
          {prontuario.queixa_principal && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Queixa Principal</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prontuario.queixa_principal}</p>
              </div>
            </div>
          )}

          {/* História da Doença Atual */}
          {prontuario.historia_doenca_atual && (
            <div>
              <h3 className="font-semibold text-lg mb-2">História da Doença Atual</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prontuario.historia_doenca_atual}</p>
              </div>
            </div>
          )}

          {/* Exame Físico */}
          {prontuario.exame_fisico && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Exame Físico</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prontuario.exame_fisico}</p>
              </div>
            </div>
          )}

          {/* Hipótese Diagnóstica */}
          {prontuario.hipotese_diagnostica && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Hipótese Diagnóstica</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prontuario.hipotese_diagnostica}</p>
              </div>
            </div>
          )}

          {/* Conduta */}
          {prontuario.conduta && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Conduta</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prontuario.conduta}</p>
              </div>
            </div>
          )}

          {/* Prescrições */}
          {prontuario.prescricoes && prontuario.prescricoes.length > 0 && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Prescrições</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                {prontuario.prescricoes.map((prescricao, index) => (
                  <div key={prescricao.id} className="mb-3 last:mb-0">
                    <div className="font-medium">{prescricao.medicamento}</div>
                    <div className="text-sm text-muted-foreground">
                      {prescricao.dosagem} - {prescricao.frequencia} - {prescricao.duracao}
                    </div>
                    {prescricao.observacoes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        Obs: {prescricao.observacoes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Observações */}
          {prontuario.observacoes && (
            <div>
              <h3 className="font-semibold text-lg mb-2">Observações</h3>
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="whitespace-pre-wrap">{prontuario.observacoes}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VisualizarProntuario; 