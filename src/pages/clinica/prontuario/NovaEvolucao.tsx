
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Save, 
  Bot,
  User,
  Calendar,
  Stethoscope,
  FileText,
  Loader2
} from "lucide-react";
import { usePacientes } from "@/hooks/usePacientes";
import { useProntuarios } from "@/hooks/useProntuarios";
import { analyzeMedicalData } from "@/lib/gemini";

const NovaEvolucao = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const pacienteId = searchParams.get('paciente');
  
  const { pacientes } = usePacientes();
  const { criarProntuario } = useProntuarios();

  // Estados do formulário
  const [selectedPaciente, setSelectedPaciente] = useState(pacienteId || "");
  const [dataAtendimento, setDataAtendimento] = useState(new Date().toISOString().split('T')[0]);
  const [queixaPrincipal, setQueixaPrincipal] = useState("");
  const [historiaDoencaAtual, setHistoriaDoencaAtual] = useState("");
  const [exameFisico, setExameFisico] = useState("");
  const [hipoteseDiagnostica, setHipoteseDiagnostica] = useState("");
  const [conduta, setConduta] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [saving, setSaving] = useState(false);

  // Estados da IA
  const [iaAnalyzing, setIaAnalyzing] = useState(false);

  const pacienteSelecionado = pacientes?.find(p => p.id === selectedPaciente);

  const handleIaAnalysis = async () => {
    if (!queixaPrincipal.trim()) {
      toast({
        title: "Dados insuficientes",
        description: "Informe pelo menos a queixa principal para usar a análise de IA.",
        variant: "destructive",
      });
      return;
    }

    setIaAnalyzing(true);
    
    try {
      const patientData = {
        name: pacienteSelecionado?.nome || 'Paciente não identificado',
        age: pacienteSelecionado?.data_nascimento ? 
          new Date().getFullYear() - new Date(pacienteSelecionado.data_nascimento).getFullYear() : 
          'N/A',
        chronicConditions: 'N/A', // Pode ser expandido se houver campo no paciente
        continuousMedications: 'N/A', // Pode ser expandido se houver campo no paciente
        allergies: 'N/A', // Pode ser expandido se houver campo no paciente
      };

      const symptoms = `${queixaPrincipal}${historiaDoencaAtual ? `\n\nHistória da doença atual: ${historiaDoencaAtual}` : ''}`;
      
      const analysis = await analyzeMedicalData(patientData, symptoms);
      
      // Parse da resposta da IA para preencher os campos
      // A IA retorna texto livre, então vamos usar regex para extrair informações
      const diagnosticoMatch = analysis.match(/(?:diagnóstico|hipótese|suspeita)[:\s]*([^\n]+)/i);
      const condutaMatch = analysis.match(/(?:conduta|tratamento|plano)[:\s]*([^\n]+)/i);
      const observacoesMatch = analysis.match(/(?:observações|orientações|recomendações)[:\s]*([^\n]+)/i);

      if (diagnosticoMatch) {
        setHipoteseDiagnostica(prev => prev || diagnosticoMatch[1].trim());
      }
      
      if (condutaMatch) {
        setConduta(prev => prev || condutaMatch[1].trim());
      }
      
      if (observacoesMatch) {
        setObservacoes(prev => prev || observacoesMatch[1].trim());
      }

      // Se não conseguiu fazer parse específico, adiciona toda a análise nas observações
      if (!diagnosticoMatch && !condutaMatch && !observacoesMatch) {
        setObservacoes(prev => prev ? `${prev}\n\nAnálise IA:\n${analysis}` : `Análise IA:\n${analysis}`);
      }

      toast({
        title: "Análise concluída!",
        description: "A IA analisou os dados e preencheu os campos automaticamente. Revise e ajuste conforme necessário.",
      });
    } catch (error) {
      console.error('Erro na análise da IA:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível completar a análise. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIaAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!selectedPaciente) {
      toast({
        title: "Erro",
        description: "Selecione um paciente",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      await criarProntuario({
        paciente_id: selectedPaciente,
        data_atendimento: dataAtendimento,
        queixa_principal: queixaPrincipal,
        historia_doenca_atual: historiaDoencaAtual,
        exame_fisico: exameFisico,
        hipotese_diagnostica: hipoteseDiagnostica,
        conduta: conduta,
        observacoes: observacoes,
      });

      toast({
        title: "Sucesso!",
        description: "Prontuário salvo com sucesso",
      });

      navigate("/prontuario");
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar prontuário",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/prontuario")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nova Evolução</h1>
            <p className="text-muted-foreground">
              Criar novo prontuário médico
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleIaAnalysis}
            disabled={iaAnalyzing || !queixaPrincipal.trim()}
            variant="outline"
            className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
          >
            {iaAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bot className="h-4 w-4 mr-2" />
            )}
            {iaAnalyzing ? "Analisando..." : "Analisar com IA"}
          </Button>
          <Button onClick={handleSave} disabled={saving || !selectedPaciente}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </div>

      {/* Formulário */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identificação do Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Identificação do Paciente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="paciente">Paciente *</Label>
                  <Select
                    value={selectedPaciente}
                    onValueChange={setSelectedPaciente}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {pacientes?.map((paciente) => (
                        <SelectItem key={paciente.id} value={paciente.id}>
                          {paciente.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data">Data do Atendimento</Label>
                  <Input
                    id="data"
                    type="date"
                    value={dataAtendimento}
                    onChange={(e) => setDataAtendimento(e.target.value)}
                  />
                </div>
              </div>

              {pacienteSelecionado && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <span className="text-sm font-medium">Convênio:</span>
                      <span className="ml-2 text-sm">
                        {pacienteSelecionado.convenio || "Particular"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Data Nascimento:</span>
                      <span className="ml-2 text-sm">
                        {pacienteSelecionado.data_nascimento 
                          ? new Date(pacienteSelecionado.data_nascimento).toLocaleDateString('pt-BR')
                          : "N/A"
                        }
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Anamnese */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Anamnese</span>
                {(queixaPrincipal || historiaDoencaAtual) && (
                  <Badge variant="secondary" className="ml-auto">
                    <Bot className="h-3 w-3 mr-1" />
                    Pronto para IA
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="queixa">Queixa Principal</Label>
                <Textarea
                  id="queixa"
                  placeholder="Descreva a queixa principal do paciente..."
                  value={queixaPrincipal}
                  onChange={(e) => setQueixaPrincipal(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="historia">História da Doença Atual</Label>
                <Textarea
                  id="historia"
                  placeholder="Descreva a história da doença atual..."
                  value={historiaDoencaAtual}
                  onChange={(e) => setHistoriaDoencaAtual(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exame Físico */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="h-5 w-5" />
                <span>Exame Físico</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="exame">Descrição do Exame</Label>
                <Textarea
                  id="exame"
                  placeholder="Descreva os achados do exame físico..."
                  value={exameFisico}
                  onChange={(e) => setExameFisico(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Avaliação e Plano */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliação e Plano</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnostico">Hipótese Diagnóstica</Label>
                <Textarea
                  id="diagnostico"
                  placeholder="Informe a hipótese diagnóstica..."
                  value={hipoteseDiagnostica}
                  onChange={(e) => setHipoteseDiagnostica(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="conduta">Conduta/Tratamento</Label>
                <Textarea
                  id="conduta"
                  placeholder="Descreva a conduta e tratamento..."
                  value={conduta}
                  onChange={(e) => setConduta(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais..."
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Informações da Consulta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Informações</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="secondary">Em Andamento</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Data:</span>
                <span>{new Date(dataAtendimento).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo:</span>
                <span>Consulta</span>
              </div>
            </CardContent>
          </Card>

          {/* Dica da IA */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-700">
                <Bot className="h-5 w-5" />
                <span>Assistente IA</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-purple-600 mb-3">
                Preencha a queixa principal e a história da doença atual para usar a análise inteligente.
              </p>
              <p className="text-xs text-purple-500">
                A IA analisará os dados e sugerirá diagnósticos e condutas baseados nas informações fornecidas.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NovaEvolucao;
