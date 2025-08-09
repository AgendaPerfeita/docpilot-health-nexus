import React from "react";
import { useDrop } from "react-dnd";
import { AGENDAMENTO_TYPE } from "./constants";

interface AgendaCellProps {
  diaStr: string;
  hora: string;
  onCellClick: () => void;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
}

export function AgendaCell({ 
  diaStr, 
  hora, 
  onCellClick, 
  onMoveAgendamento
}: AgendaCellProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: AGENDAMENTO_TYPE,
    drop: (item: any) => {
      if (import.meta.env.DEV) {
        console.log('DROP:', { itemId: item.id, from: item.dia + '_' + item.hora, to: diaStr + '_' + hora });
      }
      if (onMoveAgendamento && item.id) {
        onMoveAgendamento(item.id, diaStr, hora);
      }
    },
    canDrop: () => true, // Sempre permite drop
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });
  
  return (
    <td
      ref={drop}
      className="border-b border-r h-8 cursor-pointer transition-all duration-200 relative"
      style={{ 
        width: 120, 
        minWidth: 120, 
        maxWidth: 120,
        backgroundColor: isOver && canDrop 
          ? 'rgba(34, 197, 94, 0.2)' 
          : 'transparent',
        borderColor: isOver && canDrop 
          ? '#22c55e' 
          : 'rgb(229, 231, 235)',
      }}
      onClick={onCellClick}
    >
      {isOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </td>
  );
}