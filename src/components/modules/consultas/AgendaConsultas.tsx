import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useConsultas, Consulta } from "@/hooks/useConsultas";
import { usePacientes } from "@/hooks/usePacientes";
import { useActiveClinica } from "@/hooks/useActiveClinica";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Plus, Edit, CheckCircle, XCircle, Building2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

export const AgendaConsultas = () => {
  const { consultas, loading, criarConsulta, atualizarConsulta, getConsultasHoje } = useConsultas();
  const { pacientes } = usePacientes();
  const { activeClinica } = useActiveClinica();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConsulta, setEditingConsulta] = useState<Consulta | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    paciente_id: "",
    data_consulta: "",
    duracao_minutos: 30,
    tipo_consulta: "consulta" as Consulta['tipo_consulta'],
    valor: "",
    observacoes: ""
  });

  const resetForm = () => {
    setFormData({
      paciente_id: "",
      data_consulta: "",
      duracao_minutos: 30,
      tipo_consulta: "consulta",
      valor: "",
      observacoes: ""
    });
    setEditingConsulta(null);
  };

  const handleOpenDialog = (consulta?: Consulta) => {
    if (consulta) {
      setEditingConsulta(consulta);
      setFormData({
        paciente_id: consulta.paciente_id,
        data_consulta: new Date(consulta.data_consulta).toISOString().slice(0, 16),
        duracao_minutos: consulta.duracao_minutos,
        tipo_consulta: consulta.tipo_consulta,
        valor: consulta.valor?.toString() || "",
        observacoes: consulta.observacoes || ""
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente_id || !formData.data_consulta) {
      toast({
        title: "Erro",
        description: "Paciente e data/hora são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      const consultaData = {
        ...formData,
        data_consulta: new Date(formData.data_consulta).toISOString(),
        valor: formData.valor ? parseFloat(formData.valor) : undefined,
        medico_id: "current-user-id", // TODO: pegar do contexto do usuário
        clinica_id: activeClinica?.id || null,
        status: 'agendada' as const
      };

      if (editingConsulta) {
        await atualizarConsulta(editingConsulta.id, consultaData);
        toast({ title: "Sucesso", description: "Consulta atualizada com sucesso" });
      } else {
        await criarConsulta(consultaData);
        toast({ title: "Sucesso", description: "Consulta agendada com sucesso" });
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao salvar consulta",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (consultaId: string, status: Consulta['status']) => {
    try {
      await atualizarConsulta(consultaId, { status });
      toast({
        title: "Sucesso",
        description: `Status da consulta atualizado para ${status}`
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar status",
        variant: "destructive"
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusColor = (status: Consulta['status']) => {
    const colors = {
      agendada: 'default',
      confirmada: 'secondary',
      em_andamento: 'destructive',
      concluida: 'outline',
      cancelada: 'outline'
    };
    return colors[status] as any;
  };

  const consultasHoje = getConsultasHoje();
  
  // Filtrar consultas por clínica ativa se for médico
  const consultasFiltradas = activeClinica 
    ? consultas.filter(consulta => consulta.clinica_id === activeClinica.id)
    : consultas;
    
  const consultasDia = consultasFiltradas.filter(consulta => 
    consulta.data_consulta.startsWith(selectedDate)
  );

  const consultasHojeFiltradas = consultasFiltradas.filter(consulta =>
    consulta.data_consulta.startsWith(new Date().toISOString().split('T')[0])
  );

  return (
    <div className="space-y-6">
      {/* Header com seletor de clínica */}
      {activeClinica && (
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Building2 className="h-5 w-5 text-primary" />
          <div>
            <p className="font-medium">Agenda da {activeClinica.nome}</p>
            <p className="text-sm text-muted-foreground">{activeClinica.email}</p>
          </div>
        </div>
      )}
      
      {/* Resumo do dia */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Hoje</p>
                <p className="text-2xl font-bold">{consultasHojeFiltradas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold">
                  {consultasHojeFiltradas.filter(c => c.status === 'concluida').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold">
                  {consultasHojeFiltradas.filter(c => ['agendada', 'confirmada'].includes(c.status)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">
                  {consultasHojeFiltradas.filter(c => c.status === 'cancelada').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agenda */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Agenda de Consultas</CardTitle>
            <div className="flex items-center gap-4">
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Consulta
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingConsulta ? "Editar Consulta" : "Agendar Nova Consulta"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="paciente">Paciente *</Label>
                        <Select 
                          value={formData.paciente_id} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, paciente_id: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o paciente" />
                          </SelectTrigger>
                          <SelectContent>
                            {pacientes.map((paciente) => (
                              <SelectItem key={paciente.id} value={paciente.id}>
                                {paciente.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="data_consulta">Data e Hora *</Label>
                        <Input
                          id="data_consulta"
                          type="datetime-local"
                          value={formData.data_consulta}
                          onChange={(e) => setFormData(prev => ({ ...prev, data_consulta: e.target.value }))}
                          required
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="duracao">Duração (min)</Label>
                        <Input
                          id="duracao"
                          type="number"
                          value={formData.duracao_minutos}
                          onChange={(e) => setFormData(prev => ({ ...prev, duracao_minutos: parseInt(e.target.value) }))}
                          min="15"
                          step="15"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="tipo">Tipo</Label>
                        <Select 
                          value={formData.tipo_consulta} 
                          onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_consulta: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="consulta">Consulta</SelectItem>
                            <SelectItem value="retorno">Retorno</SelectItem>
                            <SelectItem value="emergencia">Emergência</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="valor">Valor (R$)</Label>
                        <Input
                          id="valor"
                          type="number"
                          step="0.01"
                          value={formData.valor}
                          onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="observacoes">Observações</Label>
                      <Textarea
                        id="observacoes"
                        value={formData.observacoes}
                        onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        {editingConsulta ? "Atualizar" : "Agendar"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando consultas...</div>
          ) : consultasDia.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma consulta agendada para {formatDate(selectedDate)}
            </div>
          ) : (
            <div className="space-y-4">
              {consultasDia
                .sort((a, b) => new Date(a.data_consulta).getTime() - new Date(b.data_consulta).getTime())
                .map((consulta) => (
                  <Card key={consulta.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-medium">
                          {formatTime(consulta.data_consulta)}
                        </div>
                        <div>
                          <p className="font-medium">{consulta.paciente?.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {consulta.tipo_consulta} • {consulta.duracao_minutos}min
                            {consulta.valor && ` • R$ ${consulta.valor.toFixed(2)}`}
                            {activeClinica && consulta.clinica_id !== activeClinica.id && (
                              <span className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                                Outra clínica
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(consulta.status)}>
                          {consulta.status}
                        </Badge>
                        <div className="flex gap-1">
                          {consulta.status === 'agendada' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(consulta.id, 'confirmada')}
                            >
                              Confirmar
                            </Button>
                          )}
                          {consulta.status === 'confirmada' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(consulta.id, 'em_andamento')}
                            >
                              Iniciar
                            </Button>
                          )}
                          {consulta.status === 'em_andamento' && (
                            <Button
                              size="sm"
                              onClick={() => handleStatusChange(consulta.id, 'concluida')}
                            >
                              Concluir
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDialog(consulta)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {consulta.observacoes && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {consulta.observacoes}
                      </p>
                    )}
                  </Card>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};