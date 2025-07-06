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
      className={`border-b border-r h-8 cursor-pointer transition relative`}
      style={{ width: 120, minWidth: 120, maxWidth: 120, boxSizing: 'border-box' }}
      onClick={onCellClick}
      ref={drop}
    >
      {children}
    </td>
  );
}