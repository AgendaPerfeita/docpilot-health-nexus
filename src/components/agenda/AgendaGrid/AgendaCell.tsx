import React from "react";
import { useDrop } from "react-dnd";
import { AGENDAMENTO_TYPE } from "./constants";

interface AgendaCellProps {
  diaStr: string;
  hora: string;
  onCellClick: () => void;
  onMoveAgendamento?: (id: string, novoDia: string, novoHora: string) => void;
  isHovered?: boolean;
  canDrop?: boolean;
}

export function AgendaCell({ 
  diaStr, 
  hora, 
  onCellClick, 
  onMoveAgendamento,
  isHovered = false,
  canDrop = false
}: AgendaCellProps) {
  const [{ isOver }, drop] = useDrop({
    accept: AGENDAMENTO_TYPE,
    drop: (item: any) => {
      console.log('Drop na célula:', { from: `${item.dia}_${item.hora}`, to: `${diaStr}_${hora}` });
      if (onMoveAgendamento && item.id) {
        onMoveAgendamento(item.id, diaStr, hora);
      }
    },
    canDrop: (item: any) => {
      // Sempre permitir drop, exceto na mesma posição
      return !(item.dia === diaStr && item.hora === hora);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });
  
  const showHighlight = isHovered || isOver;
  const showValid = showHighlight && canDrop;
  const showInvalid = showHighlight && !canDrop;
  
  return (
    <td
      ref={drop}
      className="border-b border-r h-8 cursor-pointer transition-all duration-150 relative"
      style={{ 
        width: 120, 
        minWidth: 120, 
        maxWidth: 120,
        backgroundColor: showValid 
          ? 'rgba(34, 197, 94, 0.15)' 
          : showInvalid 
          ? 'rgba(239, 68, 68, 0.15)' 
          : 'transparent',
        borderColor: showValid 
          ? 'rgba(34, 197, 94, 0.6)' 
          : showInvalid 
          ? 'rgba(239, 68, 68, 0.6)' 
          : 'rgb(229, 231, 235)',
        borderWidth: showHighlight ? '2px' : '1px',
      }}
      onClick={onCellClick}
    >
      {showValid && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
        </div>
      )}
      {showInvalid && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-1 bg-red-500 rounded shadow-lg" />
        </div>
      )}
    </td>
  );
}