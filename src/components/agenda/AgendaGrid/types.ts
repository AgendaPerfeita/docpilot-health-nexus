export interface AgendaGridProps {
  semana: Date[]; // Array de datas (um para cada dia da semana)
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

export interface AgendaCellProps {
  diaStr: string;
  hora: string;
  onCellClick: () => void;
  children?: React.ReactNode;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
  agendamentosMap: Map<string, any>;
  onHoverSlot?: (item: any, diaStr: string, hora: string, dIdx: number, hIdx: number) => void;
  dIdx: number;
  hIdx: number;
  clearDragSlot?: () => void;
}

export interface SlotGuideProps {
  dragSlot: { 
    diaIdx: number; 
    horaIdx: number; 
    x: number; 
    y: number; 
    duracao: number; 
    hora: string; 
    cellLeft?: number; 
    cellTop?: number 
  } | null;
  dragItem: any;
}

export interface VirtualDropTargetProps {
  diaStr: string;
  hora: string;
  dIdx: number;
  hIdx: number;
  deslocamento?: number;
  ocupacao: boolean[][];
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
  agendamentosMap: Map<string, any>;
  onHoverSlot?: (item: any, diaStr: string, hora: string, dIdx: number, hIdx: number, monitor?: any) => void;
  clearDragSlot?: () => void;
}