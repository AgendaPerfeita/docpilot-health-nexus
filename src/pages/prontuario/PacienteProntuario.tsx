
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
  Plus, 
  FileText, 
  Calendar, 
  User, 
  Phone, 
  Mail,
  MapPin,
  CreditCard,
  Eye,
  Edit
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PacienteProntuario = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { prontuarios, loading: loadingProntuarios } = useProntuarios();

  const paciente = pacientes.find(p => p.id === id);
  const pacienteProntuarios = prontuarios.filter(p => p.paciente_id === id);

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

  if (loadingPacientes || loadingProntuarios) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!paciente) {
    return null;
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/prontuario')} className="w-full sm:w-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{paciente.nome}</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Prontuário médico completo
          </p>
        </div>
        <Button onClick={() => navigate(`/prontuario/paciente/${id}/nova`)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Nova Evolução</span>
          <span className="sm:hidden">Nova</span>
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
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="font-medium text-sm sm:text-base break-words">{paciente.nome}</p>
              </div>
              {paciente.data_nascimento && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Idade</label>
                  <p className="font-medium text-sm sm:text-base">{calculateAge(paciente.data_nascimento)}</p>
                </div>
              )}
              {paciente.cpf && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF</label>
                  <p className="font-medium text-sm sm:text-base">{paciente.cpf}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {paciente.telefone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="font-medium flex items-center text-sm sm:text-base">
                    <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="break-all">{paciente.telefone}</span>
                  </p>
                </div>
              )}
              {paciente.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium flex items-center text-sm sm:text-base">
                    <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="break-all">{paciente.email}</span>
                  </p>
                </div>
              )}
              {paciente.convenio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Convênio</label>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                    <Badge variant="secondary" className="text-xs sm:text-sm">{paciente.convenio}</Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3 sm:col-span-2 lg:col-span-1">
              {(paciente.endereco || paciente.cidade || paciente.estado) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="font-medium flex items-start text-sm sm:text-base">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="break-words">
                      {paciente.endereco && <>{paciente.endereco}<br /></>}
                      {paciente.cidade && paciente.estado && `${paciente.cidade}, ${paciente.estado}`}
                      {paciente.cep && <><br />CEP: {paciente.cep}</>}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <FileText className="h-5 w-5 mr-2" />
              <span className="hidden sm:inline">Histórico de Evoluções ({pacienteProntuarios.length})</span>
              <span className="sm:hidden">Evoluções ({pacienteProntuarios.length})</span>
            </CardTitle>
            <Button onClick={() => navigate(`/prontuario/paciente/${id}/nova`)} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Nova Evolução</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {pacienteProntuarios.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-8 sm:h-12 w-8 sm:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Nenhuma evolução registrada para este paciente
              </p>
              <Button onClick={() => navigate(`/prontuario/paciente/${id}/nova`)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Primeira Evolução
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pacienteProntuarios
                .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
                .map((prontuario) => (
                <div key={prontuario.id} className="border rounded-lg p-3 sm:p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm sm:text-base">{formatDate(prontuario.data_atendimento)}</span>
                      </div>
                      {prontuario.hipotese_diagnostica && (
                        <Badge variant="outline" className="text-xs self-start sm:self-center">Diagnóstico registrado</Badge>
                      )}
                    </div>
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Eye className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Visualizar</span>
                        <span className="sm:hidden">Ver</span>
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Edit</span>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {prontuario.queixa_principal && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Queixa: </span>
                        <span className="text-xs sm:text-sm break-words">{prontuario.queixa_principal}</span>
                      </div>
                    )}
                    
                    {prontuario.hipotese_diagnostica && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Diagnóstico: </span>
                        <span className="text-xs sm:text-sm break-words">{prontuario.hipotese_diagnostica}</span>
                      </div>
                    )}
                    
                    {prontuario.prescricoes && prontuario.prescricoes.length > 0 && (
                      <div>
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Prescrições: </span>
                        <span className="text-xs sm:text-sm">{prontuario.prescricoes.length} medicamento(s)</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PacienteProntuario;
