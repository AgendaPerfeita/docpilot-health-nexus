import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { usePacientes } from "@/hooks/usePacientes";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  FileText, 
  Save, 
  User, 
  Stethoscope,
  Bot,
  ArrowLeft
} from "lucide-react";
import { callGeminiAPI } from "@/lib/gemini";

const NovaEvolucao = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { pacientes } = usePacientes();
  const { profile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [iaAnalyzing, setIaAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    paciente_id: "",
    queixa_principal: "",
    historia_doenca_atual: "",
    exame_fisico: "",
    hipotese_diagnostica: "",
    conduta: "",
    prescricao: "",
    observacoes: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleIaAnalysis = async () => {
    if (!formData.queixa_principal && !formData.historia_doenca_atual) {
      toast({
        title: "Dados insuficientes",
        description: "Preencha a queixa principal ou história da doença atual para usar a IA.",
        variant: "destructive"
      });
      return;
    }

    setIaAnalyzing(true);
    try {
      const selectedPaciente = pacientes?.find(p => p.id === formData.paciente_id);
      const idade = selectedPaciente?.data_nascimento 
        ? new Date().getFullYear() - new Date(selectedPaciente.data_nascimento).getFullYear()
        : null;

      const prompt = `
        Como médico assistente, analise o caso clínico abaixo e forneça sugestões para:
        
        DADOS DO PACIENTE:
        - Nome: ${selectedPaciente?.nome || 'Não informado'}
        - Idade: ${idade || 'Não informada'} anos
        - Convênio: ${selectedPaciente?.convenio || 'Não informado'}
        
        QUEIXA PRINCIPAL: ${formData.queixa_principal}
        
        HISTÓRIA DA DOENÇA ATUAL: ${formData.historia_doenca_atual}
        
        EXAME FÍSICO: ${formData.exame_fisico || 'Não realizado ainda'}
        
        Por favor, forneça sugestões para:
        1. Hipóteses diagnósticas mais prováveis
        2. Conduta recomendada
        3. Exames complementares se necessários
        4. Observações importantes
        
        Responda de forma profissional e estruturada, como um médico experiente.
      `;

      const analysis = await callGeminiAPI(prompt);
      
      // Parse a resposta da IA e popule os campos
      const lines = analysis.split('\n');
      let currentSection = '';
      let hipotese = '';
      let conduta = '';
      let observacoes = '';
      
      lines.forEach(line => {
        if (line.toLowerCase().includes('hipótese') || line.toLowerCase().includes('diagnóstic')) {
          currentSection = 'hipotese';
        } else if (line.toLowerCase().includes('conduta') || line.toLowerCase().includes('tratamento')) {
          currentSection = 'conduta';
        } else if (line.toLowerCase().includes('observaç') || line.toLowerCase().includes('importante')) {
          currentSection = 'observacoes';
        } else if (line.trim() && !line.includes(':')) {
          if (currentSection === 'hipotese') {
            hipotese += line.trim() + '\n';
          } else if (currentSection === 'conduta') {
            conduta += line.trim() + '\n';
          } else if (currentSection === 'observacoes') {
            observacoes += line.trim() + '\n';
          }
        }
      });

      setFormData(prev => ({
        ...prev,
        hipotese_diagnostica: prev.hipotese_diagnostica || hipotese.trim(),
        conduta: prev.conduta || conduta.trim(),
        observacoes: prev.observacoes || observacoes.trim()
      }));

      toast({
        title: "Análise concluída",
        description: "A IA preencheu os campos com sugestões. Revise e ajuste conforme necessário."
      });

    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível processar a análise da IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIaAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.paciente_id) {
      toast({
        title: "Erro",
        description: "Selecione um paciente para continuar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('prontuarios')
        .insert({
          ...formData,
          medico_id: profile?.id,
          data_atendimento: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Prontuário salvo",
        description: "O prontuário foi criado com sucesso."
      });

      navigate('/prontuario');
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar o prontuário.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/prontuario')}>
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
        <Button
          onClick={handleIaAnalysis}
          disabled={iaAnalyzing || (!formData.queixa_principal && !formData.historia_doenca_atual)}
          variant="outline"
        >
          {iaAnalyzing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Analisando...
            </>
          ) : (
            <>
              <Bot className="h-4 w-4 mr-2" />
              Análise IA
            </>
          )}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Identificação do Paciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="paciente">Selecionar Paciente *</Label>
              <Select value={formData.paciente_id} onValueChange={(value) => handleInputChange("paciente_id", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um paciente..." />
                </SelectTrigger>
                <SelectContent>
                  {pacientes?.map((paciente) => (
                    <SelectItem key={paciente.id} value={paciente.id}>
                      {paciente.nome} - {paciente.telefone || 'Sem telefone'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Clinical History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              História Clínica
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="queixa_principal">Queixa Principal</Label>
              <Textarea
                id="queixa_principal"
                placeholder="Descreva a queixa principal do paciente..."
                value={formData.queixa_principal}
                onChange={(e) => handleInputChange("queixa_principal", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="historia_doenca_atual">História da Doença Atual</Label>
              <Textarea
                id="historia_doenca_atual"
                placeholder="Descreva a evolução dos sintomas..."
                value={formData.historia_doenca_atual}
                onChange={(e) => handleInputChange("historia_doenca_atual", e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Physical Examination */}
        <Card>
          <CardHeader>
            <CardTitle>Exame Físico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="exame_fisico">Achados do Exame Físico</Label>
              <Textarea
                id="exame_fisico"
                placeholder="Descreva os achados do exame físico..."
                value={formData.exame_fisico}
                onChange={(e) => handleInputChange("exame_fisico", e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis and Treatment */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Hipótese Diagnóstica</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="hipotese_diagnostica">Diagnóstico</Label>
                <Textarea
                  id="hipotese_diagnostica"
                  placeholder="Hipótese diagnóstica principal..."
                  value={formData.hipotese_diagnostica}
                  onChange={(e) => handleInputChange("hipotese_diagnostica", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Conduta</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="conduta">Plano Terapêutico</Label>
                <Textarea
                  id="conduta"
                  placeholder="Conduta médica e orientações..."
                  value={formData.conduta}
                  onChange={(e) => handleInputChange("conduta", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescription and Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Prescrição</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="prescricao">Medicamentos Prescritos</Label>
                <Textarea
                  id="prescricao"
                  placeholder="Lista de medicamentos e dosagens..."
                  value={formData.prescricao}
                  onChange={(e) => handleInputChange("prescricao", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Observações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Gerais</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Observações adicionais..."
                  value={formData.observacoes}
                  onChange={(e) => handleInputChange("observacoes", e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="flex justify-end space-x-4 pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/prontuario')}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Prontuário
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default NovaEvolucao;