import { useActiveClinica } from "@/hooks/useActiveClinica";
import { usePacientes } from "@/hooks/usePacientes";
import { useConsultas } from "@/hooks/useConsultas";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface AgendaHeaderProps {
  clinicaSelecionada: string | null;
  onChangeClinica: (clinicaId: string | null) => void;
  pacienteSelecionado: string | null;
  onChangePaciente: (pacienteId: string | null) => void;
  onImprimir: () => void;
}

export const AgendaHeader: React.FC<AgendaHeaderProps> = ({
  clinicaSelecionada,
  onChangeClinica,
  pacienteSelecionado,
  onChangePaciente,
  onImprimir,
}) => {
  const { availableClinicas } = useActiveClinica();
  const { pacientes } = usePacientes();
  const { consultas } = useConsultas();
  const [buscaPaciente, setBuscaPaciente] = useState("");

  // Filtrar pacientes conforme clínica selecionada
  // (Assumindo que paciente tem clinica_id, ajuste se necessário)
  const pacientesFiltrados = clinicaSelecionada && clinicaSelecionada !== "todas"
    ? pacientes.filter(p => p.clinica_id === clinicaSelecionada)
    : pacientes;

  // Agendamentos do dia, filtrados por clínica
  const hoje = new Date().toISOString().split('T')[0];
  const agendamentosHoje = consultas.filter(c =>
    c.data_consulta.startsWith(hoje) &&
    (clinicaSelecionada === "todas" || !clinicaSelecionada || c.clinica_id === clinicaSelecionada)
  );

  return (
    <div className="flex flex-col gap-2 mb-4">
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={clinicaSelecionada || "todas"} onValueChange={v => onChangeClinica(v === "todas" ? null : v)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecione a clínica" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as clínicas</SelectItem>
            {availableClinicas.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          className="w-64"
          placeholder="Buscar paciente..."
          value={buscaPaciente}
          onChange={e => setBuscaPaciente(e.target.value)}
          onBlur={() => {
            // Se digitar nome exato, selecionar paciente
            const found = pacientesFiltrados.find(p => p.nome.toLowerCase() === buscaPaciente.toLowerCase());
            if (found) onChangePaciente(found.id);
          }}
        />
        <Button variant="outline" onClick={onImprimir}>Imprimir agenda</Button>
      </div>
      {/* Resumo dos agendamentos do dia */}
      <div className="flex gap-2 overflow-x-auto py-1">
        {agendamentosHoje.length === 0 ? (
          <span className="text-muted-foreground text-sm">Nenhum agendamento para hoje</span>
        ) : (
          agendamentosHoje.map(a => (
            <div key={a.id} className="bg-primary/10 border rounded px-3 py-2 min-w-[180px] flex flex-col justify-between">
              <span className="font-semibold text-xs mb-1">{a.data_consulta.slice(11,16)} - {a.paciente?.nome || "Paciente"}</span>
              <span className="text-xs text-muted-foreground">{a.tipo_consulta}</span>
              <span className="text-xs">{a.status}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}; 