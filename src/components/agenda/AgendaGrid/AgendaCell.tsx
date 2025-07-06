import React from "react";
import { useDrop } from "react-dnd";
import { AGENDAMENTO_TYPE } from "./constants";

interface AgendaCellProps {
  diaStr: string;
  hora: string;
  onCellClick: () => void;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
  dragItem?: any;
  isDragging?: boolean;
}

export function AgendaCell({ 
  diaStr, 
  hora, 
  onCellClick, 
  onMoveAgendamento,
  dragItem,
  isDragging
}: AgendaCellProps) {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: AGENDAMENTO_TYPE,
    drop: (item: any) => {
      console.log('Drop:', { from: `${item.dia}_${item.hora}`, to: `${diaStr}_${hora}` });
      if (onMoveAgendamento && item.id) {
        onMoveAgendamento(item.id, diaStr, hora);
      }
    },
    canDrop: (item: any) => {
      // Não pode dropar no mesmo lugar
      return !(item.dia === diaStr && item.hora === hora);
    },
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
          ? 'rgba(59, 130, 246, 0.1)' 
          : isOver && !canDrop 
          ? 'rgba(239, 68, 68, 0.1)' 
          : 'transparent',
        borderColor: isOver && canDrop 
          ? 'rgba(59, 130, 246, 0.5)' 
          : isOver && !canDrop 
          ? 'rgba(239, 68, 68, 0.5)' 
          : 'rgb(229, 231, 235)',
      }}
      onClick={onCellClick}
    >
      {isOver && canDrop && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        </div>
      )}
      {isOver && !canDrop && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-0.5 bg-red-500 rounded" />
        </div>
      )}
    </td>
  );
}