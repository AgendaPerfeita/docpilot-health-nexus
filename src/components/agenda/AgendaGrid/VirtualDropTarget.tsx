import React from "react";
import { useDrop } from "react-dnd";
import { AGENDAMENTO_TYPE } from "./constants";
import { VirtualDropTargetProps } from "./types";

export function VirtualDropTarget({ 
  diaStr, 
  hora, 
  dIdx, 
  hIdx, 
  deslocamento = 0, 
  ocupacao, 
  onMoveAgendamento, 
  agendamentosMap, 
  onHoverSlot, 
  clearDragSlot 
}: VirtualDropTargetProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: AGENDAMENTO_TYPE,
    drop: (item) => {
      const agItem = item as any;
      if (onMoveAgendamento) onMoveAgendamento(agItem.id, diaStr, hora);
      if (clearDragSlot) clearDragSlot();
    },
    canDrop: (item: any) => {
      // Verifica se há conflito temporal considerando a duração do item sendo arrastado
      const itemDuracao = (item as any).duracao || 30;
      const itemLinhas = Math.max(1, Math.round(itemDuracao / 15));
      
      // Verifica se todas as linhas necessárias estão livres
      for (let i = 0; i < itemLinhas; i++) {
        if (hIdx + i >= ocupacao.length || ocupacao[hIdx + i][dIdx]) {
          return false;
        }
      }
      return true;
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
        left: 120 * dIdx, // Posição absoluta sem deslocamento
        top: 32 * hIdx,
        width: 120,
        height: 32,
        zIndex: 1000,
        pointerEvents: 'auto',
        background: isOver && canDrop ? 'rgba(52,152,219,0.12)' : 
                   isOver && !canDrop ? 'rgba(231,76,60,0.08)' : 'transparent',
        border: isOver && canDrop ? '1px dashed #3498db' : 
                isOver && !canDrop ? '1px dashed #e74c3c' : 'none',
        borderRadius: '4px',
      }}
    />
  );
}