import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Brain, Sparkles, ArrowLeft } from "lucide-react"
import { callGeminiAPI } from "@/lib/gemini"

export default function NovaEvolucao() {
  const navigate = useNavigate();
  
  // Simulação de dados do paciente selecionado
  const paciente = {
    nome: "Maria Souza",
    alergias: "Dipirona, Amoxicilina",
    antecedentes: "Hipertensão, Diabetes"
  }
  
  const [form, setForm] = useState({
    paciente: "",
    data: "",
    queixa: "",
    historia: "",
    exame: "",
    diagnostico: "",
    conduta: "",
    examesComplementares: "",
    observacoes: "",
    sinaisVitais: {
      pa: "",
      fc: "",
      temp: "",
      peso: "",
      altura: "",
      imc: ""
    }
  })
  
  const [touched, setTouched] = useState<{
    paciente?: boolean;
    data?: boolean;
    queixa?: boolean;
    historia?: boolean;
    exame?: boolean;
    diagnostico?: boolean;
    conduta?: boolean;
    examesComplementares?: boolean;
    observacoes?: boolean;
  }>({})
  
  // Estado para o assistente de IA
  const [aiSymptoms, setAiSymptoms] = useState("")
  const [aiAge, setAiAge] = useState("")
  const [aiSex, setAiSex] = useState("")
  const [aiGestante, setAiGestante] = useState("")
  const [aiSuggestion, setAiSuggestion] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [showAiCard, setShowAiCard] = useState(false)
  
  const isRequired = (field) => [
    "paciente","data","queixa","historia","exame","diagnostico","conduta","examesComplementares","observacoes"
  ].includes(field)
  
  const validate = () => {
    for (const field of [
      "paciente","data","queixa","historia","exame","diagnostico","conduta","examesComplementares","observacoes"
    ]) {
      if (!form[field]) return false
    }
    return true
  }
  
  const handleSubmit = e => {
    e.preventDefault()
    setTouched({
      paciente: true, data: true, queixa: true, historia: true, exame: true, diagnostico: true, conduta: true, examesComplementares: true, observacoes: true
    })
    if (!validate()) return
    // Salvar evolução
    alert('Evolução salva com sucesso!')
    navigate('/prontuario')
  }
  
  const handlePesoAlturaChange = (field, value) => {
    setForm(f => {
      const novosSinais = { ...f.sinaisVitais, [field]: value };
      const peso = parseFloat(novosSinais.peso.replace(',', '.'));
      const alturaCm = parseFloat(novosSinais.altura.replace(',', '.'));
      let imc = '';
      if (!isNaN(peso) && !isNaN(alturaCm) && alturaCm > 0) {
        const alturaM = alturaCm / 100;
        imc = (peso / (alturaM * alturaM)).toFixed(2);
      }
      return { ...f, sinaisVitais: { ...novosSinais, imc } };
    });
  };

  const generateAISuggestion = async () => {
    if (!aiSymptoms.trim() || !aiAge.trim() || !aiSex.trim()) return
    
    setIsAiLoading(true)
    setShowAiCard(true)
    
    try {
      const prompt = `
        Como médico assistente, analise os sintomas descritos e forneça sugestões de diagnóstico e conduta:

        Dados do Paciente:
        - Idade: ${aiAge}
        - Sexo: ${aiSex}
        ${aiSex === "Feminino" && aiGestante ? `- Gestante: ${aiGestante}` : ""}
        - Nome: ${form.paciente || 'Paciente'}
        - Alergias: ${paciente.alergias}
        - Antecedentes: ${paciente.antecedentes}
        - Sinais Vitais: PA: ${form.sinaisVitais.pa}, FC: ${form.sinaisVitais.fc}, Temp: ${form.sinaisVitais.temp}°C, Peso: ${form.sinaisVitais.peso}kg, Altura: ${form.sinaisVitais.altura}cm, IMC: ${form.sinaisVitais.imc}

        Sintomas: ${aiSymptoms}

        Responda EXATAMENTE neste formato estruturado:

        HIPÓTESE DIAGNÓSTICA:
        [Liste os possíveis diagnósticos diferenciais]

        CONDUTA SUGERIDA:
        [Descreva a conduta terapêutica inicial]

        PRESCRIÇÃO SUGERIDA:
        [Liste medicamentos e dosagens]

        EXAMES COMPLEMENTARES:
        [Liste exames sugeridos se necessário]

        OBSERVAÇÕES:
        [Orientações e sinais de alerta para retorno]

        Responda em português brasileiro de forma clara e profissional.
      `
      
      const response = await callGeminiAPI(prompt)
      setAiSuggestion(response)
    } catch (error) {
      console.error('Erro ao gerar sugestão com IA:', error)
      setAiSuggestion('Erro ao gerar sugestão. Tente novamente.')
    } finally {
      setIsAiLoading(false)
    }
  }

  const applyAISuggestion = () => {
    if (aiSuggestion) {
      const suggestion = aiSuggestion
      
      // Extrair seções usando regex mais preciso
      const extractSection = (sectionName: string) => {
        const regex = new RegExp(`${sectionName}:\\s*([\\s\\S]*?)(?=\\n\\s*[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞŸ]+:|$)`, 'i')
        const match = suggestion.match(regex)
        return match ? match[1].trim() : null
      }
      
      // Aplicar cada seção nos campos correspondentes
      const diagnostico = extractSection('HIPÓTESE DIAGNÓSTICA')
      const conduta = extractSection('CONDUTA SUGERIDA')
      const prescricao = extractSection('PRESCRIÇÃO SUGERIDA')
      const exames = extractSection('EXAMES COMPLEMENTARES')
      const observacoes = extractSection('OBSERVAÇÕES')
      
      // Atualizar formulário com as informações extraídas
      setForm(f => ({
        ...f,
        diagnostico: diagnostico || f.diagnostico,
        conduta: conduta || f.conduta,
        examesComplementares: exames || f.examesComplementares,
        observacoes: observacoes || f.observacoes
      }))
      
      // Feedback visual
      const appliedFields = []
      if (diagnostico) appliedFields.push('Diagnóstico')
      if (conduta) appliedFields.push('Conduta')
      if (exames) appliedFields.push('Exames')
      if (observacoes) appliedFields.push('Observações')
      
      if (appliedFields.length > 0) {
        alert(`Sugestão aplicada nos campos: ${appliedFields.join(', ')}`)
      } else {
        alert('Nenhuma informação pôde ser extraída automaticamente. Aplique manualmente.')
      }
    }
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => navigate('/prontuario')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h2 className="text-2xl font-bold">Nova Evolução Clínica</h2>
          <p className="text-muted-foreground">Registre uma nova evolução no prontuário do paciente</p>
        </div>
      </div>
      
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Paciente */}
        <div className="space-y-2">
          <Label>Paciente *</Label>
          <Input
            value={form.paciente}
            onChange={e => setForm(f => ({ ...f, paciente: e.target.value }))}
            placeholder="Buscar paciente..."
            required
          />
          {touched.paciente && !form.paciente && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Data da Consulta */}
        <div className="space-y-2">
          <Label>Data da Consulta *</Label>
          <Input
            type="date"
            value={form.data}
            onChange={e => setForm(f => ({ ...f, data: e.target.value }))}
            required
          />
          {touched.data && !form.data && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Sinais Vitais */}
        <div className="flex gap-2">
          <div>
            <Label>PA</Label>
            <Input value={form.sinaisVitais.pa} onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, pa: e.target.value } }))} placeholder="mmHg" />
          </div>
          <div>
            <Label>FC</Label>
            <Input value={form.sinaisVitais.fc} onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, fc: e.target.value } }))} placeholder="bpm" />
          </div>
          <div>
            <Label>Temp.</Label>
            <Input value={form.sinaisVitais.temp} onChange={e => setForm(f => ({ ...f, sinaisVitais: { ...f.sinaisVitais, temp: e.target.value } }))} placeholder="°C" />
          </div>
          <div>
            <Label>Peso</Label>
            <Input value={form.sinaisVitais.peso} onChange={e => handlePesoAlturaChange('peso', e.target.value)} placeholder="kg" />
          </div>
          <div>
            <Label>Altura</Label>
            <Input value={form.sinaisVitais.altura} onChange={e => handlePesoAlturaChange('altura', e.target.value)} placeholder="cm" />
          </div>
          <div>
            <Label>IMC</Label>
            <Input value={form.sinaisVitais.imc} readOnly placeholder="" />
            {form.sinaisVitais.imc && (
              <span className="text-xs text-muted-foreground block mt-1">
                {(() => {
                  const imc = parseFloat(form.sinaisVitais.imc);
                  if (isNaN(imc)) return null;
                  if (imc < 18.5) return 'Baixo peso';
                  if (imc < 25) return 'Peso normal';
                  if (imc < 30) return 'Sobrepeso';
                  if (imc < 35) return 'Obesidade grau I';
                  if (imc < 40) return 'Obesidade grau II';
                  return 'Obesidade grau III';
                })()}
              </span>
            )}
          </div>
        </div>
        
        {/* Alergias/Antecedentes */}
        <div className="space-y-2">
          <Label>Alergias/Antecedentes</Label>
          <Textarea value={paciente.alergias + (paciente.antecedentes ? ", " + paciente.antecedentes : "")} readOnly className="bg-muted" />
        </div>

        {/* Assistente de IA */}
        <Card className="border-2 border-dashed border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Assistente de IA
              <Badge variant="secondary" className="ml-auto">
                <Sparkles className="h-3 w-3 mr-1" />
                Beta
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div>
                <Label>Idade</Label>
                <Input
                  type="number"
                  min="0"
                  value={aiAge}
                  onChange={e => setAiAge(e.target.value)}
                  placeholder="Ex: 52"
                />
              </div>
              <div>
                <Label>Sexo</Label>
                <Select value={aiSex} onValueChange={setAiSex}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Feminino">Feminino</SelectItem>
                    <SelectItem value="Masculino">Masculino</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {aiSex === "Feminino" ? (
                <div>
                  <Label>Gestante?</Label>
                  <Select value={aiGestante} onValueChange={setAiGestante}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sim">Sim</SelectItem>
                      <SelectItem value="Não">Não</SelectItem>
                      <SelectItem value="Não sabe">Não sabe</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div></div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label>Sintomas do Paciente</Label>
              <Textarea
                value={aiSymptoms}
                onChange={(e) => setAiSymptoms(e.target.value)}
                placeholder="Ex: Paciente com febre há 3 dias, tosse seca, dor de cabeça..."
                rows={4}
              />
            </div>
            <Button 
              onClick={generateAISuggestion}
              disabled={!aiSymptoms.trim() || !aiAge.trim() || !aiSex.trim() || isAiLoading}
              className="w-full"
            >
              {isAiLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando Sugestão...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gerar Sugestão com IA
                </>
              )}
            </Button>
            {showAiCard && aiSuggestion && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Sugestão da IA</h4>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={applyAISuggestion}
                  >
                    Aplicar Sugestão
                  </Button>
                </div>
                <div className="text-sm whitespace-pre-wrap text-muted-foreground">
                  {aiSuggestion}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Queixa Principal */}
        <div className="space-y-2">
          <Label>Queixa Principal *</Label>
          <Textarea
            value={form.queixa}
            onChange={e => setForm(f => ({ ...f, queixa: e.target.value }))}
            placeholder="Descreva a queixa principal do paciente..."
            required
          />
          {touched.queixa && !form.queixa && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* História da Doença Atual */}
        <div className="space-y-2">
          <Label>História da Doença Atual *</Label>
          <Textarea
            value={form.historia}
            onChange={e => setForm(f => ({ ...f, historia: e.target.value }))}
            placeholder="História detalhada..."
            required
          />
          {touched.historia && !form.historia && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Exame Físico */}
        <div className="space-y-2">
          <Label>Exame Físico *</Label>
          <Textarea
            value={form.exame}
            onChange={e => setForm(f => ({ ...f, exame: e.target.value }))}
            placeholder="Achados do exame físico..."
            required
          />
          {touched.exame && !form.exame && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Hipótese Diagnóstica */}
        <div className="space-y-2">
          <Label>Hipótese Diagnóstica *</Label>
          <Textarea
            value={form.diagnostico}
            onChange={e => setForm(f => ({ ...f, diagnostico: e.target.value }))}
            placeholder="CID-10 ou descrição do diagnóstico..."
            required
          />
          {touched.diagnostico && !form.diagnostico && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Conduta/Prescrição */}
        <div className="space-y-2">
          <Label>Conduta/Prescrição *</Label>
          <Textarea
            value={form.conduta}
            onChange={e => setForm(f => ({ ...f, conduta: e.target.value }))}
            placeholder="Medicamentos, orientações, exames solicitados..."
            required
          />
          {touched.conduta && !form.conduta && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Exames Complementares */}
        <div className="space-y-2">
          <Label>Exames Complementares *</Label>
          <Textarea
            value={form.examesComplementares}
            onChange={e => setForm(f => ({ ...f, examesComplementares: e.target.value }))}
            placeholder="Exames solicitados, resultados recebidos..."
            required
          />
          {touched.examesComplementares && !form.examesComplementares && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Observações Gerais */}
        <div className="space-y-2">
          <Label>Observações Gerais *</Label>
          <Textarea
            value={form.observacoes}
            onChange={e => setForm(f => ({ ...f, observacoes: e.target.value }))}
            placeholder="Anotações adicionais..."
            required
          />
          {touched.observacoes && !form.observacoes && <span className="text-red-500 text-xs">Campo obrigatório</span>}
        </div>
        
        {/* Botões */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => navigate('/prontuario')}>
            Cancelar
          </Button>
          <Button type="submit">
            Salvar Evolução
          </Button>
        </div>
      </form>
    </div>
  )
} 