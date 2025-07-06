
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Search, 
  Plus, 
  Filter,
  Calendar,
  User,
  Stethoscope,
  Download,
  Eye,
  Edit
} from "lucide-react";
import { Link } from "react-router-dom";
import { useProntuarios } from "@/hooks/useProntuarios";
import { PacienteSelectorModal } from "@/components/prontuario/PacienteSelectorModal";

const ProntuarioIndex = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("todos");
  const { prontuarios, loading } = useProntuarios();

  const filteredProntuarios = prontuarios?.filter(prontuario => {
    const matchesSearch = prontuario.paciente?.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prontuario.queixa_principal?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "todos") return matchesSearch;
    if (selectedFilter === "recentes") {
      const isRecent = new Date(prontuario.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return matchesSearch && isRecent;
    }
    if (selectedFilter === "pendentes") {
      return matchesSearch && !prontuario.hipotese_diagnostica;
    }
    
    return matchesSearch;
  }) || [];

  const stats = [
    {
      title: "Total de Prontuários",
      value: prontuarios?.length || 0,
      icon: FileText,
      color: "text-blue-600"
    },
    {
      title: "Esta Semana",
      value: prontuarios?.filter(p => 
        new Date(p.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0,
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Pendentes",
      value: prontuarios?.filter(p => !p.hipotese_diagnostica).length || 0,
      icon: Stethoscope,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Prontuários</h1>
          <p className="text-muted-foreground">
            Gerencie e acompanhe os prontuários médicos
          </p>
        </div>
        <PacienteSelectorModal />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 max-w-sm">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por paciente ou queixa..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Button
                variant={selectedFilter === "todos" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("todos")}
              >
                Todos
              </Button>
              <Button
                variant={selectedFilter === "recentes" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("recentes")}
              >
                Recentes
              </Button>
              <Button
                variant={selectedFilter === "pendentes" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("pendentes")}
              >
                Pendentes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Prontuários List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Prontuários</CardTitle>
          <CardDescription>
            {filteredProntuarios.length} prontuário(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProntuarios.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Nenhum prontuário encontrado" : "Nenhum prontuário cadastrado"}
              </p>
              <PacienteSelectorModal 
                trigger={
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Prontuário
                  </Button>
                }
              />
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProntuarios.map((prontuario) => (
                <div
                  key={prontuario.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium truncate">
                          {prontuario.paciente?.nome || 'Paciente não identificado'}
                        </h3>
                        {!prontuario.hipotese_diagnostica && (
                          <Badge variant="outline" className="text-orange-600">
                            Pendente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {prontuario.queixa_principal || 'Sem queixa registrada'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(prontuario.data_atendimento).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          Médico responsável
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
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

export default ProntuarioIndex;
