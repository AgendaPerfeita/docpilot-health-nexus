import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { AGENDAMENTO_TYPE } from "./constants";
import { addMinutes } from "./utils";
import { AgendamentoCardProps } from "./types";

export function AgendamentoCard({ 
  agendamento, 
  hora, 
  linhas, 
  onResize, 
  onMove, 
  resizePreview, 
  setResizePreview 
}: AgendamentoCardProps) {
  const [{ isDragging }, dragCard, preview] = useDrag({
    type: AGENDAMENTO_TYPE,
    item: { 
      id: agendamento.id, 
      duracao: agendamento.duracao || 30, 
      hora: agendamento.hora, 
      dia: agendamento.dia,
      paciente: agendamento.paciente 
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Estado de resize
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startDur, setStartDur] = useState(agendamento.duracao || 30);

  // Mouse events para resize
  function onResizeMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartY(e.clientY);
    setStartDur(resizePreview?.id === agendamento.id ? resizePreview.duracao : agendamento.duracao || 30);
    setResizePreview({ id: agendamento.id!, duracao: agendamento.duracao || 30 });
    document.body.style.cursor = "ns-resize";
  }

  React.useEffect(() => {
    if (!isResizing) return;
    function onMouseMove(e: MouseEvent) {
      const deltaY = e.clientY - startY;
      const minutos = Math.round(deltaY / 4) * 5;
      let novaDuracao = startDur + minutos;
      if (novaDuracao < 15) novaDuracao = 15;
      if (novaDuracao > 12 * 60) novaDuracao = 12 * 60;
      setResizePreview({ id: agendamento.id!, duracao: novaDuracao });
    }
    function onMouseUp() {
      setIsResizing(false);
      document.body.style.cursor = "";
      if (resizePreview && resizePreview.id === agendamento.id && resizePreview.duracao !== agendamento.duracao && onResize) {
        onResize(agendamento.id!, resizePreview.duracao);  
      }
      setResizePreview(null);
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isResizing, startY, startDur, agendamento, onResize, resizePreview, setResizePreview]);

  React.useEffect(() => {
    if (preview) {
      preview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [preview]);

  const visualDuracao = resizePreview && resizePreview.id === agendamento.id ? resizePreview.duracao : agendamento.duracao || 30;
  const visualLinhas = Math.max(1, Math.round(visualDuracao / 15));

  return (
    <td
      rowSpan={visualLinhas}
      className="border-b border-r relative align-top p-0 transition-all duration-200"
      style={{ 
        minWidth: 120,
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      ref={dragCard}
    >
      <div className="absolute inset-0 flex flex-col h-full select-none">
        <div className="flex-1 p-2 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 text-xs font-semibold">
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span className="font-bold">{hora} - {addMinutes(hora, visualDuracao)}</span>
          </div>
          <div className="text-blue-600">{agendamento.paciente || "Agendado"}</div>
        </div>
        
        <div
          className="h-3 cursor-s-resize bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all duration-200 flex items-center justify-center group"
          onMouseDown={onResizeMouseDown}
        >
          <div className="flex space-x-0.5 opacity-60 group-hover:opacity-100">
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </td>
  );
}