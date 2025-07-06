
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
      console.log('Drop event:', { itemId: item.id, targetDia: diaStr, targetHora: hora });
      if (onMoveAgendamento) onMoveAgendamento(item.id, diaStr, hora);
      if (clearDragSlot) clearDragSlot();
    },
    canDrop: (item: any) => {
      // Não permite drop no mesmo slot do mesmo agendamento
      const agendamentoExistente = agendamentosMap.get(`${diaStr}_${hora}`);
      if (agendamentoExistente && agendamentoExistente.id === item.id) {
        return false;
      }
      
      // Permite drop em qualquer lugar (sobreposição permitida)
      return true;
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
      className="border-b border-r h-8 cursor-pointer transition-all duration-300 relative agenda-cell"
      style={{ 
        width: 120, 
        minWidth: 120, 
        maxWidth: 120, 
        boxSizing: 'border-box',
        backgroundColor: isOver && canDrop 
          ? 'rgba(59, 130, 246, 0.12)' 
          : isOver && !canDrop 
          ? 'rgba(239, 68, 68, 0.08)' 
          : 'transparent',
        borderColor: isOver && canDrop 
          ? 'rgba(59, 130, 246, 0.4)' 
          : isOver && !canDrop 
          ? 'rgba(239, 68, 68, 0.4)' 
          : 'rgb(229, 231, 235)',
        transform: isOver ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isOver && canDrop 
          ? 'inset 0 0 0 2px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.15)' 
          : isOver && !canDrop
          ? 'inset 0 0 0 2px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(239, 68, 68, 0.1)'
          : 'none'
      }}
      onClick={onCellClick}
      ref={drop}
    >
      {children}
      {isOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              animation: 'pulse 1.2s ease-in-out infinite',
              boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.2)'
            }}
          />
        </div>
      )}
      {isOver && !canDrop && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            style={{
              width: '12px',
              height: '2px',
              borderRadius: '1px',
              backgroundColor: '#ef4444',
              opacity: 0.8
            }}
          />
        </div>
      )}
    </td>
  );
}
