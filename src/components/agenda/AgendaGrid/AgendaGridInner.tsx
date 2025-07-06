
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
    
    // Calcular posição baseada na tabela real
    const table = document.querySelector("table");
    let x = 88 + dIdx * 120;
    let y = 56 + hIdx * 32;
    let cellLeft = x;
    let cellTop = y;
    
    if (table) {
      try {
        // Encontrar célula específica
        const rows = table.rows;
        if (rows && rows[hIdx + 1] && rows[hIdx + 1].cells) {
          // Procurar a célula correta considerando colspans
          let targetCell = null;
          let currentCol = 0;
          
          for (let cellIdx = 0; cellIdx < rows[hIdx + 1].cells.length; cellIdx++) {
            const cell = rows[hIdx + 1].cells[cellIdx];
            if (currentCol === dIdx + 1) { // +1 porque a primeira coluna é o horário
              targetCell = cell;
              break;
            }
            currentCol += cell.colSpan || 1;
          }
          
          if (targetCell) {
            const rect = targetCell.getBoundingClientRect();
            cellLeft = rect.left;
            cellTop = rect.top;
          }
        }
      } catch (e) {
        console.log('Fallback para posição calculada:', e);
      }
    }
    
    setDragSlot({ diaIdx: dIdx, horaIdx: hIdx, x: cellLeft, y: cellTop, duracao, hora, cellLeft, cellTop });
  }
  
  function clearDragSlot() {
    setDragSlot(null);
  }

  // Construir matriz de ocupação mais flexível
  const diasCount = semana.length;
  const linhasCount = horarios.length;
  const ocupacao = Array.from({ length: linhasCount }, () => Array(diasCount).fill(false));
  
  // Marcar apenas slots que realmente têm conflito TOTAL (não parcial)
  agendamentos.forEach(a => {
    if (isDragging && dragItem && a.id === dragItem.id) return; // Ignorar item sendo arrastado
    
    const col = semana.findIndex(d => d.toISOString().split('T')[0] === a.dia);
    const startIdx = horarios.indexOf(a.hora);
    const duracao = a.duracao || 30;
    const linhas = Math.max(1, Math.round(duracao / 15));
    
    // Marcar apenas o slot inicial como ocupado para permitir sobreposição
    if (startIdx >= 0 && col !== -1 && startIdx < linhasCount) {
      ocupacao[startIdx][col] = true;
    }
  });

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
                  
                  // Renderizar agendamento se existe e não foi renderizado ainda
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
                  
                  // Verificar se esta célula está ocupada por um agendamento que se estende
                  const isOccupiedBySpan = agendamentos.some(a => {
                    if (a.dia !== diaStr) return false;
                    if (isDragging && dragItem && a.id === dragItem.id) return false; // Ignorar item sendo arrastado
                    
                    const startIdx = horarios.indexOf(a.hora);
                    const duracao = a.duracao || 30;
                    const linhas = Math.max(1, Math.round(duracao / 15));
                    return hIdx > startIdx && hIdx < startIdx + linhas;
                  });
                  
                  // Se está ocupada por span, renderizar drop target virtual durante drag
                  if (isOccupiedBySpan && isDragging) {
                    return (
                      <VirtualDropTarget
                        key={`${diaStr}_${hora}_virtual`}
                        diaStr={diaStr}
                        hora={hora}
                        dIdx={dIdx}
                        hIdx={hIdx}
                        ocupacao={ocupacao}
                        onMoveAgendamento={onMoveAgendamento}
                        agendamentosMap={agendamentosMap}
                        onHoverSlot={handleCellHover}
                        clearDragSlot={clearDragSlot}
                      />
                    );
                  }
                  
                  // Se ocupada por span mas não em drag, não renderizar nada (será coberta pelo rowspan)
                  if (isOccupiedBySpan) {
                    return null;
                  }
                  
                  // Renderizar célula normal
                  return (
                    <AgendaCell
                      key={`${diaStr}_${hora}`}
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
      
      {/* Overlay de drop targets virtuais para melhor detecção */}
      {isDragging && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            pointerEvents: 'none', 
            zIndex: 1000 
          }}
        >
          {horarios.map((hora, hIdx) => 
            semana.map((dia, dIdx) => {
              const diaStr = dia.toISOString().split("T")[0];
              return (
                <VirtualDropTarget
                  key={`overlay_${diaStr}_${hora}`}
                  diaStr={diaStr}
                  hora={hora}
                  dIdx={dIdx}
                  hIdx={hIdx}
                  ocupacao={ocupacao}
                  onMoveAgendamento={onMoveAgendamento}
                  agendamentosMap={agendamentosMap}
                  onHoverSlot={handleCellHover}
                  clearDragSlot={clearDragSlot}
                />
              );
            })
          )}
        </div>
      )}
    </>
  );
};
