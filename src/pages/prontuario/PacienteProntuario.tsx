
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/prontuario')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{paciente.nome}</h1>
          <p className="text-muted-foreground">
            Prontuário médico completo
          </p>
        </div>
        <Button onClick={() => navigate(`/prontuario/paciente/${id}/nova`)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Evolução
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Nome Completo</label>
                <p className="font-medium">{paciente.nome}</p>
              </div>
              {paciente.data_nascimento && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Idade</label>
                  <p className="font-medium">{calculateAge(paciente.data_nascimento)}</p>
                </div>
              )}
              {paciente.cpf && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">CPF</label>
                  <p className="font-medium">{paciente.cpf}</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {paciente.telefone && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                  <p className="font-medium flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {paciente.telefone}
                  </p>
                </div>
              )}
              {paciente.email && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="font-medium flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {paciente.email}
                  </p>
                </div>
              )}
              {paciente.convenio && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Convênio</label>
                  <div className="flex items-center">
                    <CreditCard className="h-4 w-4 mr-2" />
                    <Badge variant="secondary">{paciente.convenio}</Badge>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {(paciente.endereco || paciente.cidade || paciente.estado) && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Endereço</label>
                  <p className="font-medium flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <span>
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Histórico de Evoluções ({pacienteProntuarios.length})
            </CardTitle>
            <Button onClick={() => navigate(`/prontuario/paciente/${id}/nova`)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Evolução
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pacienteProntuarios.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma evolução registrada para este paciente
              </p>
              <Button onClick={() => navigate(`/prontuario/paciente/${id}/nova`)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Evolução
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {pacienteProntuarios
                .sort((a, b) => new Date(b.data_atendimento).getTime() - new Date(a.data_atendimento).getTime())
                .map((prontuario) => (
                <div key={prontuario.id} className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{formatDate(prontuario.data_atendimento)}</span>
                      {prontuario.hipotese_diagnostica && (
                        <Badge variant="outline">Diagnóstico registrado</Badge>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                  
                  {prontuario.queixa_principal && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Queixa: </span>
                      <span className="text-sm">{prontuario.queixa_principal}</span>
                    </div>
                  )}
                  
                  {prontuario.hipotese_diagnostica && (
                    <div className="mb-2">
                      <span className="text-sm font-medium text-muted-foreground">Diagnóstico: </span>
                      <span className="text-sm">{prontuario.hipotese_diagnostica}</span>
                    </div>
                  )}
                  
                  {prontuario.prescricoes && prontuario.prescricoes.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Prescrições: </span>
                      <span className="text-sm">{prontuario.prescricoes.length} medicamento(s)</span>
                    </div>
                  )}
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
