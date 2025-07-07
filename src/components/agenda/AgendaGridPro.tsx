import React, { useState, useRef } from "react";

// Tipos básicos
export interface Agendamento {
  id: string;
  dia: string; // yyyy-mm-dd
  hora: string; // HH:mm
  duracao: number; // minutos
  paciente?: string;
}

export interface AgendaGridProProps {
  semana: Date[];
  agendamentos: Agendamento[];
  onCellClick?: (dia: Date, hora: string) => void;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
  onResizeAgendamento?: (id: string, novaDuracao: number) => void;
}

// Gera slots de 15 em 15 minutos das 08:00 às 18:00
const horarios = Array.from({ length: 40 }, (_, i) => {
  const hora = 8 + Math.floor(i / 4);
  const min = (i % 4) * 15;
  return `${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
});

const colWidth = 120;
const rowHeight = 32;

function addMinutes(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutos);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

function slotId(dia: string, hora: string) {
  return `${dia}_${hora}`;
}

export const AgendaGridPro: React.FC<AgendaGridProProps> = ({ semana, agendamentos, onCellClick, onMoveAgendamento, onResizeAgendamento }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [overSlot, setOverSlot] = useState<string | null>(null);
  const [resizingId, setResizingId] = useState<string | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number | null>(null);
  const [resizeStartDur, setResizeStartDur] = useState<number>(0);
  const [resizePreviewDur, setResizePreviewDur] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Ocupação: mapa slotId -> agendamento
  const ocupacao = React.useMemo(() => {
    const map = new Map<string, Agendamento>();
    agendamentos.forEach(a => {
      const col = semana.findIndex(d => d.toISOString().split("T")[0] === a.dia);
      const row = horarios.indexOf(a.hora);
      if (col === -1 || row === -1) return;
      const linhas = Math.max(1, Math.round(a.duracao / 15));
      for (let l = 0; l < linhas; l++) {
        const slot = slotId(a.dia, horarios[row + l]);
        map.set(slot, a);
      }
    });
    return map;
  }, [agendamentos, semana]);

  // Mouse events para drag
  React.useEffect(() => {
    if (!draggingId) return;
    function handleMouseMove(e: MouseEvent) {
      setMousePos({ x: e.clientX, y: e.clientY });
      if (gridRef.current) {
        const rect = gridRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const col = Math.floor((x - 80) / colWidth);
        const row = Math.floor((y - 32) / rowHeight);
        if (col >= 0 && col < semana.length && row >= 0 && row < horarios.length) {
          const dia = semana[col].toISOString().split("T")[0];
          const hora = horarios[row];
          setOverSlot(slotId(dia, hora));
        }
      }
    }
    function handleMouseUp() {
      if (draggingId && overSlot && onMoveAgendamento) {
        const [novoDia, novoHora] = overSlot.split("_");
        const ag = agendamentos.find(a => a.id === draggingId);
        if (ag) {
          onMoveAgendamento(ag.id, novoDia, novoHora);
        }
      }
      setDraggingId(null);
      setOverSlot(null);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingId, overSlot, agendamentos, onMoveAgendamento, semana]);

  // Mouse events para resize
  React.useEffect(() => {
    if (!resizingId) return;
    function handleMouseMove(e: MouseEvent) {
      if (resizeStartY === null) return;
      const ag = agendamentos.find(a => a.id === resizingId);
      if (!ag) return;
      const deltaY = e.clientY - resizeStartY;
      let novaDur = Math.round((resizeStartDur + deltaY / rowHeight * 15) / 15) * 15;
      if (novaDur < 15) novaDur = 15;
      // Não permitir sobrepor outros cards
      const col = semana.findIndex(d => d.toISOString().split("T")[0] === ag.dia);
      const row = horarios.indexOf(ag.hora);
      let podeResize = true;
      for (let l = 1; l < Math.max(1, Math.round(novaDur / 15)); l++) {
        const slot = slotId(ag.dia, horarios[row + l]);
        const ocupado = ocupacao.get(slot);
        if (ocupado && ocupado.id !== ag.id) {
          podeResize = false;
          break;
        }
      }
      if (podeResize && novaDur !== ag.duracao) {
        setResizePreviewDur(novaDur);
      }
    }
    function handleMouseUp() {
      if (resizingId && resizePreviewDur && onResizeAgendamento) {
        onResizeAgendamento(resizingId, resizePreviewDur);
      }
      setResizingId(null);
      setResizeStartY(null);
      setResizeStartDur(0);
      setResizePreviewDur(null);
    }
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizingId, resizeStartY, resizeStartDur, resizePreviewDur, agendamentos, ocupacao, onResizeAgendamento, semana]);

  // Destacar todos os slots do destino durante o drag
  let highlightSlots: string[] = [];
  if (draggingId && overSlot) {
    const ag = agendamentos.find(a => a.id === draggingId);
    if (ag) {
      const [novoDia, novoHora] = overSlot.split("_");
      const startIdx = horarios.indexOf(novoHora);
      for (let l = 0; l < Math.max(1, Math.round(ag.duracao / 15)); l++) {
        const slot = slotId(novoDia, horarios[startIdx + l]);
        highlightSlots.push(slot);
      }
    }
  }

  return (
    <div
      ref={gridRef}
      className="relative"
      style={{
        display: "grid",
        gridTemplateColumns: `80px repeat(${semana.length}, ${colWidth}px)`,
        gridTemplateRows: `32px repeat(${horarios.length}, ${rowHeight}px)`,
        border: "1px solid #e5e7eb",
        background: "#fff",
        minWidth: 80 + semana.length * colWidth,
      }}
    >
      {/* Cabeçalho */}
      <div style={{ gridColumn: 1, gridRow: 1, background: "#f3f4f6" }} />
      {semana.map((dia, idx) => (
        <div
          key={idx}
          style={{
            gridColumn: idx + 2,
            gridRow: 1,
            background: "#f3f4f6",
            textAlign: "center",
            fontWeight: 600,
            fontSize: 13,
            borderLeft: "1px solid #e5e7eb",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          {dia.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" })}
        </div>
      ))}
      {/* Linhas de horários */}
      {horarios.map((hora, hIdx) => (
        <React.Fragment key={hora}>
          <div
            style={{
              gridColumn: 1,
              gridRow: hIdx + 2,
              fontSize: 12,
              color: "#888",
              borderBottom: "1px solid #e5e7eb",
              textAlign: "right",
              paddingRight: 4,
              background: "#f9fafb",
            }}
          >
            {hora}
          </div>
          {semana.map((dia, dIdx) => {
            const slot = slotId(dia.toISOString().split("T")[0], hora);
            const ocupado = ocupacao.get(slot);
            const isOver = highlightSlots.includes(slot);
            const podeDrop = !ocupado || (draggingId && ocupado.id === draggingId);
            return (
              <div
                key={dIdx}
                onClick={() => onCellClick && onCellClick(dia, hora)}
                style={{
                  width: colWidth,
                  height: rowHeight,
                  borderLeft: "1px solid #e5e7eb",
                  borderBottom: "1px solid #e5e7eb",
                  background: isOver ? (podeDrop ? "#d1fae5" : "#fee2e2") : undefined,
                  opacity: podeDrop ? 1 : 0.5,
                  transition: "background 0.1s, opacity 0.1s",
                  position: "relative",
                  zIndex: 1,
                  cursor: onCellClick ? "pointer" : undefined,
                }}
              />
            );
          })}
        </React.Fragment>
      ))}
      {/* Cards de agendamento */}
      {agendamentos.map((a) => (
        <DraggableResizableCard
          key={a.id}
          agendamento={a}
          semana={semana}
          horarios={horarios}
          colWidth={colWidth}
          rowHeight={rowHeight}
          dragging={draggingId === a.id}
          mousePos={mousePos}
          dragOffset={dragOffset}
          onDragStart={(id, offset) => {
            setDraggingId(id);
            setDragOffset(offset);
          }}
          setMousePos={setMousePos}
          resizing={resizingId === a.id}
          onResizeStart={(id, startY, startDur) => {
            setResizingId(id);
            setResizeStartY(startY);
            setResizeStartDur(startDur);
            setResizePreviewDur(null);
          }}
          dragPreviewSlot={overSlot}
          dragPreviewDuration={draggingId ? agendamentos.find(x => x.id === draggingId)?.duracao : undefined}
          resizePreviewDur={resizingId === a.id ? resizePreviewDur : undefined}
        />
      ))}
    </div>
  );
};

function DraggableResizableCard({ agendamento, semana, horarios, colWidth, rowHeight, dragging, mousePos, dragOffset, onDragStart, setMousePos, resizing, onResizeStart, dragPreviewSlot, dragPreviewDuration, resizePreviewDur }: any) {
  let col = semana.findIndex(d => d.toISOString().split("T")[0] === agendamento.dia);
  let row = horarios.indexOf(agendamento.hora);
  let linhas = Math.max(1, Math.round((resizePreviewDur ?? agendamento.duracao) / 15));
  let horaInicio = agendamento.hora;
  let horaFim = addMinutes(agendamento.hora, resizePreviewDur ?? agendamento.duracao);
  // Durante o drag, mostrar o card na posição e altura do slot de destino e exibir o novo horário
  if (dragging && dragPreviewSlot && dragPreviewDuration) {
    const [novoDia, novoHora] = dragPreviewSlot.split("_");
    col = semana.findIndex(d => d.toISOString().split("T")[0] === novoDia);
    row = horarios.indexOf(novoHora);
    linhas = Math.max(1, Math.round(dragPreviewDuration / 15));
    horaInicio = novoHora;
    horaFim = addMinutes(novoHora, dragPreviewDuration);
  }
  const style: React.CSSProperties = {
    position: "absolute",
    left: 80 + col * colWidth,
    top: 32 + row * rowHeight,
    width: colWidth - 8,
    height: linhas * rowHeight - 6,
    background: dragging ? "#e0f2fe" : "#fff",
    border: dragging ? "2.5px solid #2563eb" : "2px solid #3498db",
    borderRadius: 10,
    boxShadow: dragging ? "0 4px 16px 0 rgba(52,152,219,0.18)" : "0 2px 8px 0 rgba(52,152,219,0.08)",
    zIndex: dragging ? 1000 : 10,
    padding: 8,
    fontSize: 13,
    fontWeight: 500,
    color: "#222",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    cursor: dragging ? "grabbing" : resizing ? "ns-resize" : "grab",
    userSelect: "none",
    transition: dragging ? "none" : "box-shadow 0.1s, border 0.1s, background 0.1s",
    transform: dragging ? "rotate(2deg)" : "none",
  };
  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setMousePos({ x: e.clientX, y: e.clientY });
    onDragStart(agendamento.id, offset);
  }
  function handleResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onResizeStart(agendamento.id, e.clientY, agendamento.duracao);
  }
  return (
    <div onMouseDown={handleMouseDown} style={style}>
      <div>
        {horaInicio} - {horaFim}<br />
        {agendamento.paciente || "Agendado"}
      </div>
      {/* Handle de resize */}
      <div
        style={{
          width: "100%",
          height: 8,
          background: "#2563eb22",
          borderRadius: 4,
          cursor: "ns-resize",
          position: "absolute",
          left: 0,
          bottom: 0,
        }}
        onMouseDown={handleResizeMouseDown}
        title="Arraste para redimensionar"
      />
    </div>
  );
} 