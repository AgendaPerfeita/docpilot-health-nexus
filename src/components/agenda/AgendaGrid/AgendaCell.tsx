import React from "react";
import { useDrop } from "react-dnd";
import { AGENDAMENTO_TYPE } from "./constants";
import { AgendaCellProps } from "./types";

export function AgendaCell({ 
  diaStr, 
  hora, 
  onCellClick, 
  children = null, 
  onMoveAgendamento, 
  agendamentosMap, 
  onHoverSlot, 
  dIdx, 
  hIdx, 
  clearDragSlot 
}: AgendaCellProps) {
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
      className={`border-b border-r h-8 cursor-pointer transition-all duration-200 relative hover:bg-blue-50/30`}
      style={{ 
        width: 120, 
        minWidth: 120, 
        maxWidth: 120, 
        boxSizing: 'border-box',
        backgroundColor: isOver && canDrop 
          ? 'rgba(59, 130, 246, 0.08)' 
          : isOver && !canDrop 
          ? 'rgba(239, 68, 68, 0.06)' 
          : 'transparent',
        borderColor: isOver && canDrop 
          ? '#3b82f6' 
          : isOver && !canDrop 
          ? '#ef4444' 
          : 'rgb(229, 231, 235)',
        transform: isOver ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isOver && canDrop 
          ? 'inset 0 0 0 1px #3b82f6, 0 2px 8px rgba(59, 130, 246, 0.15)' 
          : 'none'
      }}
      onClick={onCellClick}
      ref={drop}
    >
      {children}
      {isOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
      )}
    </td>
  );
}