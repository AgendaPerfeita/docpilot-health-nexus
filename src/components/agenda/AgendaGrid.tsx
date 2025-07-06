import React, { useState } from "react";
import { useDrag, useDrop, DndProvider, useDragLayer } from "react-dnd";
import { HTML5Backend, getEmptyImage } from "react-dnd-html5-backend";

const diasSemana = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// Grid de 15 em 15 minutos, das 08:00 às 18:00
const horarios = Array.from({ length: 40 }, (_, i) => {
  const hora = 8 + Math.floor(i / 4);
  const min = (i % 4) * 15;
  return `${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
});

export interface AgendaGridProps {
  semana: Date[]; // Array de datas (um para cada dia da semana)
  onCellClick: (dia: Date, hora: string) => void;
  agendamentos?: { id?: string; dia: string; hora: string; duracao?: number; paciente?: string }[];
  onResizeAgendamento?: (id: string, novaDuracao: number) => void;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
}

function addMinutes(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutos);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

const RESIZE_HANDLE_TYPE = "resize-handle";
const AGENDAMENTO_TYPE = "agendamento-card";

function AgendamentoCard({ agendamento, hora, linhas, onResize, onMove, resizePreview, setResizePreview }) {
  // Drag do card
  const [{ isDragging }, dragCard, preview] = useDrag({
    type: AGENDAMENTO_TYPE,
    item: { id: agendamento.id, duracao: agendamento.duracao || 30, hora, paciente: agendamento.paciente },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Estado de resize local
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startDur, setStartDur] = useState(agendamento.duracao || 30);

  // Mouse events para resize visual
  function onResizeMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartY(e.clientY);
    setStartDur(resizePreview?.id === agendamento.id ? resizePreview.duracao : agendamento.duracao || 30);
    setResizePreview({ id: agendamento.id, duracao: agendamento.duracao || 30 });
    document.body.style.cursor = "ns-resize";
  }

  React.useEffect(() => {
    if (!isResizing) return;
    function onMouseMove(e) {
      const deltaY = e.clientY - startY;
      const minutos = Math.round(deltaY / 10) * 5;
      let novaDuracao = startDur + minutos;
      if (novaDuracao < 5) novaDuracao = 5;
      if (novaDuracao > 12 * 60) novaDuracao = 12 * 60;
      setResizePreview({ id: agendamento.id, duracao: novaDuracao });
    }
    function onMouseUp() {
      setIsResizing(false);
      document.body.style.cursor = "";
      if (resizePreview && resizePreview.id === agendamento.id && resizePreview.duracao !== agendamento.duracao) {
        onResize(agendamento.id, resizePreview.duracao);
      }
      setResizePreview(null);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing, startY, startDur, agendamento, onResize, resizePreview, setResizePreview]);

  React.useEffect(() => {
    if (preview) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview]);

  // Duração visual durante o resize
  const visualDuracao = resizePreview && resizePreview.id === agendamento.id ? resizePreview.duracao : agendamento.duracao || 30;
  const visualLinhas = Math.max(1, Math.round(visualDuracao / 15));

  return (
    <td
      rowSpan={visualLinhas}
      className={`border-b border-r relative bg-white align-top p-0`}
      style={{ minWidth: 120, zIndex: isResizing ? 10 : undefined, boxShadow: 'none' }}
      ref={dragCard}
    >
      <div className="absolute inset-0 flex flex-col justify-between h-full select-none">
        <div className="p-1 text-xs font-semibold">
          {hora} - {addMinutes(hora, visualDuracao)}<br />
          {agendamento.paciente || "Agendado"}
        </div>
        {/* Handle de resize visual */}
        <div
          className="w-full h-2 cursor-s-resize bg-primary/20 rounded-b"
          style={{ position: 'absolute', bottom: 0 }}
          title="Arraste para redimensionar"
          onMouseDown={onResizeMouseDown}
        />
      </div>
    </td>
  );
}

function AgendaCell({ diaStr, hora, onCellClick, children = null, onMoveAgendamento, agendamentosMap, onHoverSlot, dIdx, hIdx, clearDragSlot }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: AGENDAMENTO_TYPE,
    drop: (item: any) => {
      if (onMoveAgendamento) onMoveAgendamento(item.id, diaStr, hora);
      if (clearDragSlot) clearDragSlot(); // Limpa slot guide imediatamente após drop
    },
    canDrop: (item: any) => {
      return !agendamentosMap.get(`${diaStr}_${hora}`);
    },
    hover: (item, monitor) => {
      if (onHoverSlot) onHoverSlot(item, diaStr, hora, dIdx, hIdx);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  return (
    <td
      className={`border-b border-r h-8 cursor-pointer transition relative`}
      style={{ width: 120, minWidth: 120, maxWidth: 120, boxSizing: 'border-box' }}
      onClick={onCellClick}
      ref={drop}
    >
      {children}
    </td>
  );
}

function SlotGuide({ dragSlot, dragItem }) {
  if (!dragSlot || !dragItem) return null;
  const duracao = dragSlot.duracao || 30;
  // Calcular hora de início conforme célula de destino
  const horaInicio = dragSlot.hora || dragItem.hora;
  const horaFim = addMinutes(horaInicio, duracao);
  // Centralizar horizontalmente na coluna e alinhar verticalmente
  const cellWidth = 120;
  const x = dragSlot.cellLeft !== undefined ? dragSlot.cellLeft : dragSlot.x;
  const y = dragSlot.cellTop !== undefined ? dragSlot.cellTop : dragSlot.y;
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: cellWidth,
        height: Math.max(1, Math.round(duracao / 15)) * 32,
        zIndex: 2000,
        pointerEvents: "none",
        border: "2.5px solid #3498db",
        borderRadius: 10,
        background: "#fff",
        boxShadow: "none",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", color: "#222", fontWeight: 500, fontSize: 14 }}>
        {horaInicio} - {horaFim}<br />
        <span style={{ color: "#555", fontWeight: 400, fontSize: 13 }}>{dragItem.paciente || ""}</span>
      </div>
    </div>
  );
}

function VirtualDropTarget({ diaStr, hora, dIdx, hIdx, deslocamento = 0, ocupacao, onMoveAgendamento, agendamentosMap, onHoverSlot, clearDragSlot }) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: AGENDAMENTO_TYPE,
    drop: (item) => {
      const agItem = item as any;
      if (onMoveAgendamento) onMoveAgendamento(agItem.id, diaStr, hora);
      if (clearDragSlot) clearDragSlot();
    },
    canDrop: (item) => {
      // Só bloqueia se ocupacao[hIdx][dIdx] for true
      return !ocupacao[hIdx][dIdx];
    },
    hover: (item, monitor) => {
      if (onHoverSlot) onHoverSlot(item, diaStr, hora, dIdx, hIdx, monitor);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  return (
    <div
      ref={drop}
      style={{
        position: 'absolute',
        left: 120 * (dIdx - deslocamento),
        top: 32 * hIdx,
        width: 120,
        height: 32,
        zIndex: 1000,
        pointerEvents: 'auto',
        background: isOver ? 'rgba(52,152,219,0.08)' : 'transparent',
      }}
    />
  );
}

const AgendaGridInner: React.FC<AgendaGridProps> = ({ semana, onCellClick, agendamentos = [], onResizeAgendamento, onMoveAgendamento }) => {
  const [resizePreview, setResizePreview] = useState<{ id: string, duracao: number } | null>(null);
  const [dragSlot, setDragSlot] = useState<{ diaIdx: number, horaIdx: number, x: number, y: number, duracao: number, hora: string, cellLeft?: number, cellTop?: number } | null>(null);
  const agendamentosMap = React.useMemo(() => {
    const map = new Map();
    agendamentos.forEach(a => {
      map.set(`${a.dia}_${a.hora}`, a);
    });
    return map;
  }, [agendamentos]);
  const { item: dragItem, isDragging } = useDragLayer((monitor) => ({ item: monitor.getItem(), isDragging: monitor.isDragging() }));

  // DEBUG: log dragSlot and dragItem
  React.useEffect(() => {
    if (isDragging) {
      console.log("dragSlot:", dragSlot);
      console.log("dragItem:", dragItem);
    }
  }, [dragSlot, dragItem, isDragging]);

  function handleCellHover(item, diaStr, hora, dIdx, hIdx) {
    if (!item) return;
    const duracao = item.duracao || 30;
    // Centralizar SlotGuide na coluna e alinhar verticalmente pela célula
    const table = document.querySelector("table");
    let x = 88 + dIdx * 120;
    let y = 56 + hIdx * 32;
    let cellLeft;
    let cellTop;
    let offset = 1;
    let cell = null;
    if (table) {
      const headerRow = table.rows[0];
      const row = table.rows[hIdx + 1];
      if (headerRow && row) {
        // Descubra qual coluna do cabeçalho corresponde ao diaStr
        let targetCol = -1;
        for (let i = 0; i < headerRow.cells.length; i++) {
          const th = headerRow.cells[i];
          // O th pode ter a data no formato '09 de jul.' ou similar
          // Vamos comparar pelo dia do mês
          const diaDoMes = Number(diaStr.split('-')[2]);
          if (th.textContent && th.textContent.includes(diaDoMes.toString().padStart(2, '0'))) {
            targetCol = i;
            break;
          }
        }
        if (targetCol !== -1) {
          // Agora, na linha, pegue a célula DOM que está na mesma coluna visual
          let visualCol = 0;
          for (let i = 0; i < row.cells.length; i++) {
            const c = row.cells[i];
            const colspan = c.colSpan || 1;
            if (visualCol === targetCol) {
              cell = c;
              break;
            }
            visualCol += colspan;
          }
        }
      }
    }
    if (cell) {
      const rect = cell.getBoundingClientRect();
      x = rect.left;
      y = rect.top;
      cellLeft = rect.left;
      cellTop = rect.top;
    } else {
      // Fallback: calcula posição manualmente pelo grid
      const headerRow = table.rows[0];
      let targetCol = -1;
      for (let i = 0; i < headerRow.cells.length; i++) {
        const th = headerRow.cells[i];
        const diaDoMes = Number(diaStr.split('-')[2]);
        if (th.textContent && th.textContent.includes(diaDoMes.toString().padStart(2, '0'))) {
          targetCol = i;
          break;
        }
      }
      if (targetCol !== -1) {
        const tableRect = table.getBoundingClientRect();
        const colWidth = 120;
        const rowHeight = 32;
        x = tableRect.left + (targetCol * colWidth);
        y = tableRect.top + ((hIdx + 1) * rowHeight);
        cellLeft = x;
        cellTop = y;
      } else {
        // fallback final: posição do mouse
        const evt = window.event;
        if (evt && typeof evt === "object" && "clientX" in evt && "clientY" in evt) {
          x = (evt as MouseEvent).clientX;
          y = (evt as MouseEvent).clientY;
          cellLeft = x;
          cellTop = y;
        }
      }
    }
    setDragSlot({ diaIdx: dIdx, horaIdx: hIdx, x, y, duracao, hora, cellLeft, cellTop });
  }
  function clearDragSlot() {
    setDragSlot(null);
  }

  // Construir matriz de ocupação do grid para deslocamento de rowspans
  const diasCount = semana.length;
  const linhasCount = horarios.length;
  // ocupacao[linha][coluna] = true se ocupado por rowspan
  const ocupacao = Array.from({ length: linhasCount }, () => Array(diasCount).fill(false));
  // Para cada card, marque em quais linhas e colunas ele está ativo, ignorando o card em drag
  agendamentos.forEach(a => {
    if (isDragging && dragItem && a.id === dragItem.id) return; // Ignore o card em drag!
    const col = semana.findIndex(d => d.toISOString().split('T')[0] === a.dia);
    const startIdx = horarios.indexOf(a.hora);
    const duracao = a.duracao || 30;
    const linhas = Math.max(1, Math.round(duracao / 15));
    for (let l = 0; l < linhas; l++) {
      if (startIdx + l < linhasCount && col !== -1) {
        ocupacao[startIdx + l][col] = true;
      }
    }
  });
  // Função para contar quantos rowspans estão ativos à esquerda de uma célula na linha atual
  function deslocamentoRowspan(linha, coluna) {
    let count = 0;
    for (let c = 0; c < coluna; c++) {
      if (ocupacao[linha][c]) count++;
    }
    return count;
  }

  const rendered = {};

  return (
    <>
      {isDragging && dragSlot && dragItem && <SlotGuide dragSlot={dragSlot} dragItem={dragItem} />}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse" style={{ tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th className="w-20 bg-muted text-xs font-bold p-2 border-b" style={{ width: 80, minWidth: 80, maxWidth: 80 }} />
              {semana.map((dia, idx) => (
                <th key={idx} className="bg-muted text-xs font-bold p-2 border-b" style={{ width: 120, minWidth: 120, maxWidth: 120 }}>
                  {diasSemana[dia.getDay()]}<br />
                  {dia.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horarios.map((hora, hIdx) => (
              <tr key={hora}>
                <td className="text-xs text-muted-foreground p-1 border-r border-b align-top w-20" style={{ width: 80, minWidth: 80, maxWidth: 80 }}>{hora}</td>
                {semana.map((dia, dIdx) => {
                  const diaStr = dia.toISOString().split("T")[0];
                  const agendamento = agendamentosMap.get(`${diaStr}_${hora}`);
                  if (agendamento && !rendered[agendamento.id]) {
                    const duracao = agendamento.duracao || 30;
                    const linhas = Math.max(1, Math.round(duracao / 15));
                    rendered[agendamento.id] = true;
                    return (
                      <AgendamentoCard
                        key={agendamento.id}
                        agendamento={agendamento}
                        hora={hora}
                        linhas={linhas}
                        onResize={onResizeAgendamento}
                        onMove={onMoveAgendamento}
                        resizePreview={resizePreview}
                        setResizePreview={setResizePreview}
                      />
                    );
                  }
                  if (
                    agendamentos.some(a => {
                      if (a.dia !== diaStr) return false;
                      const startIdx = horarios.indexOf(a.hora);
                      const duracao = a.duracao || 30;
                      const linhas = Math.max(1, Math.round(duracao / 15));
                      return hIdx > startIdx && hIdx < startIdx + linhas;
                    })
                  ) {
                    if (isDragging) {
                      const desloc = deslocamentoRowspan(hIdx, dIdx);
                      return (
                        <VirtualDropTarget
                          key={diaStr + hora}
                          diaStr={diaStr}
                          hora={hora}
                          dIdx={dIdx}
                          hIdx={hIdx}
                          deslocamento={desloc}
                          ocupacao={ocupacao}
                          onMoveAgendamento={onMoveAgendamento}
                          agendamentosMap={agendamentosMap}
                          onHoverSlot={isDragging ? handleCellHover : undefined}
                          clearDragSlot={clearDragSlot}
                        />
                      );
                    }
                    return null;
                  }
                  return (
                    <AgendaCell
                      key={diaStr + hora}
                      diaStr={diaStr}
                      hora={hora}
                      onCellClick={() => onCellClick(dia, hora)}
                      onMoveAgendamento={onMoveAgendamento}
                      agendamentosMap={agendamentosMap}
                      onHoverSlot={isDragging ? handleCellHover : undefined}
                      dIdx={dIdx}
                      hIdx={hIdx}
                      clearDragSlot={clearDragSlot}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export const AgendaGrid: React.FC<AgendaGridProps> = (props) => (
  <DndProvider backend={HTML5Backend}>
    <div className="overflow-x-auto">
      <AgendaGridInner {...props} />
    </div>
  </DndProvider>
); 