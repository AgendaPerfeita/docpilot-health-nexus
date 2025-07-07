export interface AgendaGridProps {
  semana: Date[];
  onCellClick: (dia: Date, hora: string) => void;
  agendamentos?: { id?: string; dia: string; hora: string; duracao?: number; paciente?: string }[];
  onResizeAgendamento?: (id: string, novaDuracao: number) => void;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
}

export interface AgendamentoCardProps {
  agendamento: { id?: string; dia: string; hora: string; duracao?: number; paciente?: string };
  hora: string;
  linhas: number;
  onResize?: (id: string, novaDuracao: number) => void;
  onMove?: (id: string, novoDia: string, novoHora: string) => void;
  resizePreview: { id: string, duracao: number } | null;
  setResizePreview: (preview: { id: string, duracao: number } | null) => void;
}