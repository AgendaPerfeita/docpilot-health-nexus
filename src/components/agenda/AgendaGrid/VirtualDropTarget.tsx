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
      
      // Permite sobreposição parcial (mais flexível como no iClinic)
      let conflitos = 0;
      for (let i = 0; i < itemLinhas; i++) {
        if (hIdx + i >= ocupacao.length || ocupacao[hIdx + i][dIdx]) {
          conflitos++;
        }
      }
      
      // Permite até 50% de sobreposição para maior flexibilidade
      return conflitos <= Math.floor(itemLinhas / 2);
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
        left: 120 * dIdx,
        top: 32 * hIdx,
        width: 120,
        height: 32,
        zIndex: 1000,
        pointerEvents: 'auto',
        background: isOver && canDrop 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(59, 130, 246, 0.08))' 
          : isOver && !canDrop 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.06))' 
          : 'transparent',
        border: isOver && canDrop 
          ? '2px dashed #3b82f6' 
          : isOver && !canDrop 
          ? '2px dashed #ef4444' 
          : 'none',
        borderRadius: '6px',
        transition: 'all 0.2s ease',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isOver && canDrop 
          ? '0 4px 12px rgba(59, 130, 246, 0.2)' 
          : isOver && !canDrop 
          ? '0 4px 12px rgba(239, 68, 68, 0.15)' 
          : 'none',
      }}
    />
  );
}