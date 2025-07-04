import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export default function NovaEvolucao() {
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
  return (
    <form className="space-y-6 max-w-2xl mx-auto" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold">Nova Evolução Clínica</h2>
      <p className="text-muted-foreground mb-4">Registre uma nova evolução no prontuário do paciente</p>
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
        <Button variant="outline" type="button">Cancelar</Button>
        <Button type="submit">Salvar Evolução</Button>
      </div>
    </form>
  )
} 