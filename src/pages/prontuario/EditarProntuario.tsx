import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { 
  ArrowLeft, 
  Save, 
  FileText, 
  Calendar, 
  User
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const EditarProntuario = () => {
  const { id: pacienteId, prontuarioId } = useParams<{ id: string; prontuarioId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pacientes, loading: loadingPacientes, buscarPacientePorId } = usePacientes();
  const { prontuarios, loading: loadingProntuarios, atualizarProntuario, buscarProntuarioPorId } = useProntuarios();
  const [pacienteFromDB, setPacienteFromDB] = useState<any>(null);
  const [prontuarioFromDB, setProntuarioFromDB] = useState<any>(null);
  const [fetchingPaciente, setFetchingPaciente] = useState(false);
  const [fetchingProntuario, setFetchingProntuario] = useState(false);

  // Debug logs
  console.log('EditarProntuario - pacienteId:', pacienteId);
  console.log('EditarProntuario - prontuarioId:', prontuarioId);
  console.log('EditarProntuario - All prontuarios:', prontuarios);
  console.log('EditarProntuario - All pacientes:', pacientes);

  const paciente = pacientes.find(p => p.id === pacienteId) || pacienteFromDB;
  const prontuario = prontuarios.find(p => p.id === prontuarioId) || prontuarioFromDB;

  console.log('EditarProntuario - Found paciente:', paciente);
  console.log('EditarProntuario - Found prontuario:', prontuario);

  const [formData, setFormData] = useState({
    queixa_principal: '',
    historia_doenca_atual: '',
    exame_fisico: '',
    hipotese_diagnostica: '',
    conduta: '',
    observacoes: ''
  });

  const [isSaving, setIsSaving] = useState(false);

  // Forçar carregamento dos dados se necessário
  useEffect(() => {
    if (pacienteId && prontuarioId) {
      console.log('EditarProntuario - Forçando carregamento dos dados...');
      // Os hooks já devem carregar automaticamente, mas vamos garantir
    }
  }, [pacienteId, prontuarioId]);

  // Buscar paciente diretamente se não encontrado na lista
  useEffect(() => {
    const fetchPacienteDirectly = async () => {
      if (!loadingPacientes && !paciente && pacienteId && !fetchingPaciente) {
        console.log('EditarProntuario - Paciente não encontrado na lista, buscando diretamente...');
        setFetchingPaciente(true);
        try {
          const pacienteData = await buscarPacientePorId(pacienteId);
          setPacienteFromDB(pacienteData);
        } catch (error) {
          console.error('EditarProntuario - Erro ao buscar paciente diretamente:', error);
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
        console.log('EditarProntuario - Prontuário não encontrado na lista, buscando diretamente...');
        setFetchingProntuario(true);
        try {
          const prontuarioData = await buscarProntuarioPorId(prontuarioId);
          setProntuarioFromDB(prontuarioData);
        } catch (error) {
          console.error('EditarProntuario - Erro ao buscar prontuário diretamente:', error);
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

  useEffect(() => {
    if (prontuario) {
      setFormData({
        queixa_principal: prontuario.queixa_principal || '',
        historia_doenca_atual: prontuario.historia_doenca_atual || '',
        exame_fisico: prontuario.exame_fisico || '',
        hipotese_diagnostica: prontuario.hipotese_diagnostica || '',
        conduta: prontuario.conduta || '',
        observacoes: prontuario.observacoes || ''
      });
    }
  }, [prontuario]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!prontuarioId) return;

    setIsSaving(true);
    try {
      await atualizarProntuario(prontuarioId, formData);
      toast({
        title: "Prontuário atualizado",
        description: "As alterações foram salvas com sucesso."
      });
      navigate(`/prontuario/paciente/${pacienteId}/visualizar/${prontuarioId}`);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
        <Button variant="outline" size="sm" onClick={() => navigate(`/prontuario/paciente/${pacienteId}/visualizar/${prontuarioId}`)} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Editar Evolução</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {paciente.nome} - {formatDate(prontuario.data_atendimento)}
          </p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Salvando..." : "Salvar"}
        </Button>
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
                <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                <p className="font-medium">{paciente.data_nascimento}</p>
              </div>
            )}
            {paciente.convenio && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Convênio</label>
                <p className="font-medium">{paciente.convenio}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Evolution Form */}
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
          <div className="space-y-2">
            <Label htmlFor="queixa_principal">Queixa Principal</Label>
            <Textarea
              id="queixa_principal"
              placeholder="Descreva a queixa principal do paciente..."
              value={formData.queixa_principal}
              onChange={(e) => handleInputChange('queixa_principal', e.target.value)}
              rows={3}
            />
          </div>

          {/* História da Doença Atual */}
          <div className="space-y-2">
            <Label htmlFor="historia_doenca_atual">História da Doença Atual</Label>
            <Textarea
              id="historia_doenca_atual"
              placeholder="Descreva a história da doença atual..."
              value={formData.historia_doenca_atual}
              onChange={(e) => handleInputChange('historia_doenca_atual', e.target.value)}
              rows={4}
            />
          </div>

          {/* Exame Físico */}
          <div className="space-y-2">
            <Label htmlFor="exame_fisico">Exame Físico</Label>
            <Textarea
              id="exame_fisico"
              placeholder="Descreva o exame físico realizado..."
              value={formData.exame_fisico}
              onChange={(e) => handleInputChange('exame_fisico', e.target.value)}
              rows={4}
            />
          </div>

          {/* Hipótese Diagnóstica */}
          <div className="space-y-2">
            <Label htmlFor="hipotese_diagnostica">Hipótese Diagnóstica</Label>
            <Textarea
              id="hipotese_diagnostica"
              placeholder="Descreva a hipótese diagnóstica..."
              value={formData.hipotese_diagnostica}
              onChange={(e) => handleInputChange('hipotese_diagnostica', e.target.value)}
              rows={3}
            />
          </div>

          {/* Conduta */}
          <div className="space-y-2">
            <Label htmlFor="conduta">Conduta</Label>
            <Textarea
              id="conduta"
              placeholder="Descreva a conduta médica..."
              value={formData.conduta}
              onChange={(e) => handleInputChange('conduta', e.target.value)}
              rows={3}
            />
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              placeholder="Observações adicionais..."
              value={formData.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditarProntuario; 