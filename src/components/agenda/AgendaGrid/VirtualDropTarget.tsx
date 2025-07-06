
import React from "react";
import { useDrop } from "react-dnd";
import { AGENDAMENTO_TYPE } from "./constants";
import { VirtualDropTargetProps } from "./types";

export function VirtualDropTarget({ 
  diaStr, 
  hora, 
  dIdx, 
  hIdx, 
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
      // Lógica mais permissiva - permite sobreposição parcial como no iClinic
      const itemDuracao = (item as any).duracao || 30;
      const itemLinhas = Math.max(1, Math.round(itemDuracao / 15));
      
      // Verificar se há conflito TOTAL (não permitir drop exatamente no mesmo slot)
      const agendamentoExistente = agendamentosMap.get(`${diaStr}_${hora}`);
      if (agendamentoExistente && agendamentoExistente.id !== item.id) {
        return false; // Não permite drop exatamente no mesmo início
      }
      
      // Verificar sobreposição com outros agendamentos
      let conflitosGraves = 0;
      for (let i = 0; i < itemLinhas; i++) {
        const horaIdx = hIdx + i;
        if (horaIdx >= ocupacao.length) break;
        
        // Verificar se há agendamento que INICIA neste slot
        const slotKey = `${diaStr}_${horaIdx < ocupacao.length ? Object.keys(ocupacao).find((_, idx) => idx === horaIdx) || hora : hora}`;
        if (ocupacao[horaIdx] && ocupacao[horaIdx][dIdx]) {
          const agendamentoNoSlot = Array.from(agendamentosMap.values()).find(a => 
            a.dia === diaStr && 
            ocupacao.findIndex(row => row === ocupacao[horaIdx]) === ocupacao.findIndex(row => row.includes(true)) &&
            a.id !== item.id
          );
          
          if (agendamentoNoSlot) {
            conflitosGraves++;
          }
        }
      }
      
      // Permite até 70% de sobreposição para flexibilidade (como iClinic)
      return conflitosGraves <= Math.floor(itemLinhas * 0.7);
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
        left: 80 + (120 * dIdx), // 80px para coluna de horário + largura das colunas
        top: 56 + (32 * hIdx), // 56px para header + altura das linhas
        width: 120,
        height: 32,
        zIndex: 1500,
        pointerEvents: 'auto',
        background: isOver && canDrop 
          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))' 
          : isOver && !canDrop 
          ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.08))' 
          : 'transparent',
        border: isOver && canDrop 
          ? '2px solid rgba(59, 130, 246, 0.4)' 
          : isOver && !canDrop 
          ? '2px solid rgba(239, 68, 68, 0.4)' 
          : 'none',
        borderRadius: '8px',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOver ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isOver && canDrop 
          ? '0 8px 25px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
          : isOver && !canDrop 
          ? '0 8px 25px rgba(239, 68, 68, 0.2)' 
          : 'none',
      }}
    >
      {isOver && canDrop && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#3b82f6',
            animation: 'pulse 1.5s ease-in-out infinite',
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.2)'
          }}
        />
      )}
    </div>
  );
}
