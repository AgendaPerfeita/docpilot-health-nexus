
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { 
  Search, 
  Plus, 
  User, 
  Calendar, 
  FileText, 
  Phone, 
  Mail,
  Clock
} from "lucide-react";
import { PacienteSelector } from "@/components/shared/PacienteSelector";

const PacientesList = () => {
  const navigate = useNavigate();
  const { pacientes, loading: loadingPacientes } = usePacientes();
  const { prontuarios, loading: loadingProntuarios } = useProntuarios();
  const [searchTerm, setSearchTerm] = useState("");
  const [showSelector, setShowSelector] = useState(false);

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuários</h1>
          <p className="text-muted-foreground">
            Selecione um paciente para visualizar seu prontuário
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSelector(true)}>
            <Search className="h-4 w-4 mr-2" />
            Buscar Paciente
          </Button>
          <Button onClick={() => navigate('/crm')}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Paciente
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
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

      {/* Quick Selector */}
      {showSelector && (
        <Card>
          <CardHeader>
            <CardTitle>Seleção Rápida</CardTitle>
          </CardHeader>
          <CardContent>
            <PacienteSelector 
              onSelect={handleSelectPaciente}
              placeholder="Digite para buscar ou selecionar paciente..."
              className="w-full"
            />
          </CardContent>
        </Card>
      )}

      {/* Patients List */}
      <div className="grid gap-4">
        {filteredPacientes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado"}
              </p>
              <Button onClick={() => navigate('/crm')}>
                <Plus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Paciente
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredPacientes.map((paciente) => {
            const stats = getPacienteStats(paciente.id);
            return (
              <Card key={paciente.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-primary/10 p-3 rounded-full">
                        <User className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{paciente.nome}</h3>
                          {calculateAge(paciente.data_nascimento) && (
                            <Badge variant="secondary">
                              {calculateAge(paciente.data_nascimento)}
                            </Badge>
                          )}
                          {paciente.convenio && (
                            <Badge variant="outline">{paciente.convenio}</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                          {paciente.telefone && (
                            <div className="flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {paciente.telefone}
                            </div>
                          )}
                          {paciente.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {paciente.email}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center text-blue-600">
                            <FileText className="h-4 w-4 mr-1" />
                            {stats.totalEvolucoes} evolução(ões)
                          </div>
                          {stats.ultimoAtendimento && (
                            <div className="flex items-center text-green-600">
                              <Clock className="h-4 w-4 mr-1" />
                              Último: {formatDate(stats.ultimoAtendimento)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={() => navigate(`/prontuario/paciente/${paciente.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Prontuário
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default PacientesList;
