import React, { useState } from "react";
import { useDragLayer } from "react-dnd";
import { diasSemana, horarios } from "./constants";
import { AgendamentoCard } from "./AgendamentoCard";
import { AgendaCell } from "./AgendaCell";
import { DragPreview } from "./DragPreview";
import { AgendaGridProps } from "./types";

export const AgendaGridInner: React.FC<AgendaGridProps> = ({ 
  semana, 
  onCellClick, 
  agendamentos = [], 
  onResizeAgendamento, 
  onMoveAgendamento 
}) => {
  const [resizePreview, setResizePreview] = useState<{ id: string, duracao: number } | null>(null);
  
  const agendamentosMap = React.useMemo(() => {
    const map = new Map();
    agendamentos.forEach(a => {
      map.set(`${a.dia}_${a.hora}`, a);
    });
    return map;
  }, [agendamentos]);
  
  const { isDragging, item: dragItem, currentOffset } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
    item: monitor.getItem(),
    currentOffset: monitor.getClientOffset()
  }));

  const rendered: Record<string, boolean> = {};

  return (
    <>
      <div className="overflow-x-auto relative">
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
                    if (isDragging && dragItem && a.id === dragItem.id) return false;
                    
                    const startIdx = horarios.indexOf(a.hora);
                    const duracao = a.duracao || 30;
                    const linhas = Math.max(1, Math.round(duracao / 15));
                    return hIdx > startIdx && hIdx < startIdx + linhas;
                  });
                  
                  // Se ocupada por span, não renderizar célula
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
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Preview do drag */}
      {isDragging && dragItem && currentOffset && (
        <DragPreview 
          item={dragItem} 
          currentOffset={currentOffset}
        />
      )}
    </>
  );
};