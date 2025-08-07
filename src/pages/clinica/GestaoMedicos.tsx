import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useMedicosReal } from "@/hooks/useMedicosReal";
import { useMedicosCadastro, MedicoCadastroData } from "@/hooks/useMedicosCadastro";
import { formatarTelefone } from "@/lib/formatters";
import { 
  UserPlus, 
  Users, 
  Search, 
  Stethoscope,
  Mail,
  Phone,
  Edit,
  CheckCircle,
  XCircle,
  Shield,
  Calendar,
  DollarSign
} from "lucide-react";

const GestaoMedicos = () => {
  const { medicos, loading: medicosLoading, obterEstatisticas, atualizarStatusVinculo, atualizarPlanoMedico } = useMedicosReal();
  const { cadastrarMedico, loading: cadastroLoading } = useMedicosCadastro();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState<MedicoCadastroData>({
    nome: "",
    email: "",
    telefone: "",
    cpf: "",
    crm: "",
    especialidade: "",
    valorConsulta: 0,
    comissao: 0,
    permissoes: {
      prontuario: true,
      agenda: true,
      financeiro: false,
      admin: false,
      ia: true
    }
  });

  const handleInputChange = (field: keyof MedicoCadastroData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permission: keyof MedicoCadastroData['permissoes'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissoes: {
        ...prev.permissoes,
        [permission]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await cadastrarMedico(formData);
      setShowForm(false);
      setFormData({
        nome: "",
        email: "",
        telefone: "",
        cpf: "",
        crm: "",
        especialidade: "",
        valorConsulta: 0,
        comissao: 0,
        permissoes: {
          prontuario: true,
          agenda: true,
          financeiro: false,
          admin: false,
          ia: true
        }
      });
    } catch (error) {
      // Error handling is done within the hook
    }
  };

  const filteredMedicos = medicos.filter(medico =>
    medico.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medico.especialidade && medico.especialidade.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (medico.crm && medico.crm.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = obterEstatisticas();

  const statsCards = [
    {
      title: "Total de Médicos",
      value: stats.total,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Médicos Ativos",
      value: stats.ativos,
      icon: CheckCircle,
      color: "text-green-600"
    },
    {
      title: "Especialidades",
      value: stats.especialidades,
      icon: Stethoscope,
      color: "text-purple-600"
    },
    {
      title: "Receita Total",
      value: `R$ ${(stats.receitaTotal / 1000).toFixed(0)}k`,
      icon: DollarSign,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Médicos</h1>
          <p className="text-muted-foreground">
            Gerencie os médicos da sua clínica e seus planos
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Cadastrar Médico
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Médico</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="dados">Dados Básicos</TabsTrigger>
                  <TabsTrigger value="permissoes">Permissões</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dados" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="nome" className="text-sm font-medium">Nome Completo *</label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => handleInputChange("nome", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email *</label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="telefone" className="text-sm font-medium">Telefone</label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => handleInputChange("telefone", e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="cpf" className="text-sm font-medium">CPF *</label>
                      <Input
                        id="cpf"
                        value={formData.cpf}
                        onChange={(e) => handleInputChange("cpf", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="crm" className="text-sm font-medium">CRM *</label>
                      <Input
                        id="crm"
                        value={formData.crm}
                        onChange={(e) => handleInputChange("crm", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="especialidade" className="text-sm font-medium">Especialidade</label>
                      <Input
                        id="especialidade"
                        value={formData.especialidade}
                        onChange={(e) => handleInputChange("especialidade", e.target.value)}
                        placeholder="Ex: Cardiologia"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="valorConsulta" className="text-sm font-medium">Valor da Consulta (R$)</label>
                      <Input
                        id="valorConsulta"
                        type="number"
                        value={formData.valorConsulta}
                        onChange={(e) => handleInputChange("valorConsulta", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="comissao" className="text-sm font-medium">Comissão (%)</label>
                      <Input
                        id="comissao"
                        type="number"
                        value={formData.comissao}
                        onChange={(e) => handleInputChange("comissao", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="permissoes" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Acesso ao Prontuário</label>
                        <p className="text-sm text-muted-foreground">
                          Permite criar e visualizar prontuários médicos
                        </p>
                      </div>
                      <Switch
                        checked={formData.permissoes.prontuario}
                        onCheckedChange={(value) => handlePermissionChange("prontuario", value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Gestão de Agenda</label>
                        <p className="text-sm text-muted-foreground">
                          Permite gerenciar consultas e horários
                        </p>
                      </div>
                      <Switch
                        checked={formData.permissoes.agenda}
                        onCheckedChange={(value) => handlePermissionChange("agenda", value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Relatórios Financeiros</label>
                        <p className="text-sm text-muted-foreground">
                          Permite visualizar relatórios e dados financeiros
                        </p>
                      </div>
                      <Switch
                        checked={formData.permissoes.financeiro}
                        onCheckedChange={(value) => handlePermissionChange("financeiro", value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Inteligência Artificial</label>
                        <p className="text-sm text-muted-foreground">
                          Permite usar recursos de IA médica (gratuito para médicos vinculados)
                        </p>
                      </div>
                      <Switch
                        checked={formData.permissoes.ia}
                        onCheckedChange={(value) => handlePermissionChange("ia", value)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <label className="text-base font-medium">Administração</label>
                        <p className="text-sm text-muted-foreground">
                          Permite gerenciar outros médicos e configurações da clínica
                        </p>
                      </div>
                      <Switch
                        checked={formData.permissoes.admin}
                        onCheckedChange={(value) => handlePermissionChange("admin", value)}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={cadastroLoading}>
                  {cadastroLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Cadastrando...
                    </>
                  ) : (
                    "Cadastrar Médico"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {statsCards.map((stat, index) => {
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

      {/* Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar médico por nome, especialidade ou CRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Doctors List */}
      <Card>
        <CardHeader>
          <CardTitle>Médicos Cadastrados</CardTitle>
          <CardDescription>
            {filteredMedicos.length} médico(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medicosLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Carregando médicos...</p>
            </div>
          ) : filteredMedicos.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Nenhum médico encontrado" : "Nenhum médico cadastrado"}
              </p>
              <Button onClick={() => setShowForm(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Cadastrar Primeiro Médico
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredMedicos.map((medico) => (
                <div
                  key={medico.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-medium">{medico.nome}</h3>
                        <Badge variant={medico.status === 'ativo' ? 'default' : 'secondary'}>
                          {medico.status}
                        </Badge>
                        <Badge variant="outline">
                          {medico.plano_medico === 'premium' ? 'Premium' : 'Free'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {medico.email}
                        </span>
                        {medico.telefone && (
                          <span className="flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {formatarTelefone(medico.telefone)}
                          </span>
                        )}
                        {medico.crm && <span>{medico.crm}</span>}
                        {medico.especialidade && <span>{medico.especialidade}</span>}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        {medico.permite_ia && (
                          <Badge variant="outline" className="text-xs">IA</Badge>
                        )}
                        {medico.permite_atendimento_individual && (
                          <Badge variant="outline" className="text-xs">Atend. Individual</Badge>
                        )}
                        {medico.permite_relatorios_avancados && (
                          <Badge variant="outline" className="text-xs">Relatórios</Badge>
                        )}
                        {medico.total_consultas && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="h-3 w-3 mr-1" />
                            {medico.total_consultas} consultas
                          </Badge>
                        )}
                        {medico.receita_total && (
                          <Badge variant="outline" className="text-xs">
                            <DollarSign className="h-3 w-3 mr-1" />
                            R$ {medico.receita_total.toLocaleString()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    {medico.vinculo_ativo !== undefined && (
                      <Button 
                        variant={medico.vinculo_ativo ? "destructive" : "default"}
                        size="sm"
                        onClick={() => atualizarStatusVinculo(medico.id, !medico.vinculo_ativo)}
                      >
                        {medico.vinculo_ativo ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
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

export default GestaoMedicos;