
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { formatarTelefone } from "@/lib/formatters";
import { useConsultas } from "@/hooks/useConsultas";
import { 
  Search, 
  Plus, 
  User, 
  Calendar, 
  FileText, 
  Phone, 
  Mail,
  Clock,
  Activity,
  CheckCircle
} from "lucide-react";
import { PacienteSelector } from "@/components/shared/PacienteSelector";

const PacientesList = () => {
  const navigate = useNavigate();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { prontuarios, loading: loadingProntuarios } = useProntuarios();
  const { consultas, loading: loadingConsultas } = useConsultas();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelector, setShowSelector] = useState(false);
  
  // Get today's date for filtering
  const today = new Date().toISOString().split('T')[0];
  
  // Filter today's consultations
  const consultasHoje = consultas.filter(consulta => 
    consulta.data_consulta.startsWith(today)
  );

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paciente.cpf?.includes(searchTerm) ||
    paciente.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPacienteStats = (pacienteId: string) => {
    const pacienteProntuarios = prontuarios.filter(p => p.paciente_id === pacienteId);
    const ultimoAtendimento = pacienteProntuarios.length > 0 
      ? new Date(Math.max(...pacienteProntuarios.map(p => new Date(p.data_atendimento).getTime())))
      : null;

    return {
      totalEvolucoes: pacienteProntuarios.length,
      ultimoAtendimento
    };
  };

  const handleSelectPaciente = (paciente: any) => {
    navigate(`/prontuario/paciente/${paciente.id}`);
    setShowSelector(false);
  };
  
  const handleNovaEvolucao = (paciente: any) => {
    navigate(`/prontuario/paciente/${paciente.id}/nova`);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  const formatTime = (dateString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendada':
      case 'confirmada':
        return 'bg-blue-100 text-blue-800';
      case 'em_andamento':
        return 'bg-yellow-100 text-yellow-800';
      case 'concluida':
        return 'bg-green-100 text-green-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'agendada':
        return 'Agendada';
      case 'confirmada':
        return 'Confirmada';
      case 'em_andamento':
        return 'Em Atendimento';
      case 'concluida':
        return 'Concluída';
      case 'cancelada':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (loadingPacientes || loadingProntuarios || loadingConsultas) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight truncate">Prontuários</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gerencie consultas e prontuários médicos
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowSelector(true)} className="w-full sm:w-auto">
            <Search className="h-4 w-4 mr-2" />
            Buscar Paciente
          </Button>
          <Button onClick={() => setShowSelector(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Nova Evolução
          </Button>
        </div>
      </div>

      {/* Quick Selector */}
      {showSelector && (
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg">Selecionar Paciente</CardTitle>
            <CardDescription className="text-sm">
              Selecione um paciente para criar nova evolução ou acessar prontuário
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <PacienteSelector 
              onSelect={handleSelectPaciente}
              placeholder="Digite para buscar ou selecionar paciente..."
              className="w-full"
            />
            <div className="flex gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowSelector(false)}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for different views */}
      <Tabs defaultValue="hoje" className="w-full">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-2 min-w-[300px]">
            <TabsTrigger value="hoje" className="text-sm">Pacientes do Dia</TabsTrigger>
            <TabsTrigger value="todos" className="text-sm">Todos os Pacientes</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Today's Patients Tab */}
        <TabsContent value="hoje" className="space-y-4">
          <Card>
            <CardHeader className="px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Consultas de Hoje ({consultasHoje.length})
              </CardTitle>
              <CardDescription className="text-sm">
                Pacientes agendados para {new Intl.DateTimeFormat('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                }).format(new Date())}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {consultasHoje.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma consulta agendada para hoje
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {consultasHoje.map((consulta) => (
                    <Card key={consulta.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                            <div className="bg-primary/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                              <User className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                                <h3 className="font-semibold text-sm sm:text-base truncate">
                                  {consulta.paciente?.nome || 'Paciente não encontrado'}
                                </h3>
                                <div className="flex flex-wrap gap-1">
                                  <Badge className={`${getStatusColor(consulta.status)} text-xs`}>
                                    {getStatusLabel(consulta.status)}
                                  </Badge>
                                  {consulta.paciente?.convenio && (
                                    <Badge variant="outline" className="text-xs">
                                      {consulta.paciente.convenio}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(consulta.data_consulta)}
                                </div>
                                <div className="flex items-center">
                                  <Activity className="h-3 w-3 mr-1" />
                                  {consulta.duracao_minutos} min
                                </div>
                                {consulta.paciente?.telefone && (
                                  <div className="flex items-center">
                                    <Phone className="h-3 w-3 mr-1" />
                                    <span className="truncate">{formatarTelefone(consulta.paciente.telefone)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                            <Button 
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/prontuario/paciente/${consulta.paciente_id}`)}
                              className="w-full sm:w-auto text-xs"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              Prontuário
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/prontuario/paciente/${consulta.paciente_id}/nova`)}
                              className="w-full sm:w-auto text-xs"
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Nova Evolução
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* All Patients Tab */}
        <TabsContent value="todos" className="space-y-4">
          {/* Search */}
          <Card>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Patients List */}
          <div className="grid gap-4">
            {filteredPacientes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8 px-4 sm:px-6">
                  <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vá para a aba CRM para cadastrar novos pacientes
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPacientes.map((paciente) => {
                const stats = getPacienteStats(paciente.id);
                return (
                  <Card key={paciente.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                          <div className="bg-primary/10 p-2 sm:p-3 rounded-full flex-shrink-0">
                            <User className="h-5 sm:h-6 w-5 sm:w-6 text-primary" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                              <h3 className="font-semibold text-base sm:text-lg truncate">{paciente.nome}</h3>
                              <div className="flex flex-wrap gap-1">
                                {calculateAge(paciente.data_nascimento) && (
                                  <Badge variant="secondary" className="text-xs">
                                    {calculateAge(paciente.data_nascimento)}
                                  </Badge>
                                )}
                                {paciente.convenio && (
                                  <Badge variant="outline" className="text-xs">{paciente.convenio}</Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground mb-2">
                              {paciente.telefone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span className="truncate">{formatarTelefone(paciente.telefone)}</span>
                                </div>
                              )}
                              {paciente.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3 w-3 mr-1" />
                                  <span className="truncate">{paciente.email}</span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                              <div className="flex items-center text-blue-600">
                                <FileText className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                                {stats.totalEvolucoes} evolução(ões)
                              </div>
                              {stats.ultimoAtendimento && (
                                <div className="flex items-center text-green-600">
                                  <Clock className="h-3 sm:h-4 w-3 sm:w-4 mr-1" />
                                  Último: {formatDate(stats.ultimoAtendimento)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
                          <Button 
                            variant="outline"
                            onClick={() => navigate(`/prontuario/paciente/${paciente.id}`)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                            size="sm"
                          >
                            <FileText className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                            Ver Prontuário
                          </Button>
                          <Button 
                            onClick={() => handleNovaEvolucao(paciente)}
                            className="w-full sm:w-auto text-xs sm:text-sm"
                            size="sm"
                          >
                            <Plus className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />
                            Nova Evolução
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PacientesList;
