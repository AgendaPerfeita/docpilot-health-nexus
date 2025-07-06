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
  // Drag do card
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

  // Estado de resize local
  const [isResizing, setIsResizing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startDur, setStartDur] = useState(agendamento.duracao || 30);

  // Mouse events para resize visual
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
      const minutos = Math.round(deltaY / 10) * 5;
      let novaDuracao = startDur + minutos;
      if (novaDuracao < 5) novaDuracao = 5;
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

  // Duração visual durante o resize
  const visualDuracao = resizePreview && resizePreview.id === agendamento.id ? resizePreview.duracao : agendamento.duracao || 30;
  const visualLinhas = Math.max(1, Math.round(visualDuracao / 15));

  return (
    <td
      rowSpan={visualLinhas}
      className={`border-b border-r relative align-top p-0 transition-all duration-200`}
      style={{ 
        minWidth: 120, 
        zIndex: isResizing ? 10 : undefined, 
        opacity: isDragging ? 0.3 : 1,
        backgroundColor: isDragging ? '#f8f9fa' : '#ffffff',
        transform: isDragging ? 'scale(0.98)' : 'scale(1)',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
      }}
      ref={dragCard}
    >
      <div className="absolute inset-0 flex flex-col justify-between h-full select-none">
        <div className={`p-2 text-xs font-semibold rounded-t transition-all duration-200 ${
          isDragging ? 'bg-blue-50 text-blue-700' : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800'
        }`}>
          <div className="flex items-center gap-1 mb-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="font-bold">{hora} - {addMinutes(hora, visualDuracao)}</span>
          </div>
          <div className="text-blue-600">{agendamento.paciente || "Agendado"}</div>
        </div>
        {/* Handle de resize visual melhorado */}
        <div
          className="w-full h-3 cursor-s-resize bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 transition-all duration-200 rounded-b flex items-center justify-center group"
          style={{ position: 'absolute', bottom: 0 }}
          title="Arraste para redimensionar"
          onMouseDown={onResizeMouseDown}
        >
          <div className="flex space-x-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </td>
  );
}