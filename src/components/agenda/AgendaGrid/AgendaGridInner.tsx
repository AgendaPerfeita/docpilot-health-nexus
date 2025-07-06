import React, { useState } from "react";
import { useDragLayer } from "react-dnd";
import { diasSemana, horarios } from "./constants";
import { AgendamentoCard } from "./AgendamentoCard";
import { AgendaCell } from "./AgendaCell";
import { SlotGuide } from "./SlotGuide";
import { VirtualDropTarget } from "./VirtualDropTarget";
import { AgendaGridProps } from "./types";

export const AgendaGridInner: React.FC<AgendaGridProps> = ({ 
  semana, 
  onCellClick, 
  agendamentos = [], 
  onResizeAgendamento, 
  onMoveAgendamento 
}) => {
  const [resizePreview, setResizePreview] = useState<{ id: string, duracao: number } | null>(null);
  const [dragSlot, setDragSlot] = useState<{ 
    diaIdx: number, 
    horaIdx: number, 
    x: number, 
    y: number, 
    duracao: number, 
    hora: string, 
    cellLeft?: number, 
    cellTop?: number 
  } | null>(null);
  
  const agendamentosMap = React.useMemo(() => {
    const map = new Map();
    agendamentos.forEach(a => {
      map.set(`${a.dia}_${a.hora}`, a);
    });
    return map;
  }, [agendamentos]);
  
  const { item: dragItem, isDragging } = useDragLayer((monitor) => ({ 
    item: monitor.getItem(), 
    isDragging: monitor.isDragging() 
  }));

  function handleCellHover(item: any, diaStr: string, hora: string, dIdx: number, hIdx: number) {
    if (!item) return;
    const duracao = item.duracao || 30;
    // Centralizar SlotGuide na coluna e alinhar verticalmente pela célula
    const table = document.querySelector("table");
    let x = 88 + dIdx * 120;
    let y = 56 + hIdx * 32;
    let cellLeft;
    let cellTop;
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
      const headerRow = table?.rows[0];
      let targetCol = -1;
      if (headerRow) {
        for (let i = 0; i < headerRow.cells.length; i++) {
          const th = headerRow.cells[i];
          const diaDoMes = Number(diaStr.split('-')[2]);
          if (th.textContent && th.textContent.includes(diaDoMes.toString().padStart(2, '0'))) {
            targetCol = i;
            break;
          }
        }
      }
      if (targetCol !== -1 && table) {
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
  
  // Função removida - não usaremos mais deslocamento baseado em rowspan
  // O alinhamento será baseado apenas na posição absoluta da coluna

  const rendered: Record<string, boolean> = {};

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
                      return (
                        <VirtualDropTarget
                          key={diaStr + hora}
                          diaStr={diaStr}
                          hora={hora}
                          dIdx={dIdx}
                          hIdx={hIdx}
                          deslocamento={0}
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