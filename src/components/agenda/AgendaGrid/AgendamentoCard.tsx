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
    item: { id: agendamento.id, duracao: agendamento.duracao || 30, hora, paciente: agendamento.paciente },
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
      className={`border-b border-r relative bg-white align-top p-0`}
      style={{ minWidth: 120, zIndex: isResizing ? 10 : undefined, boxShadow: 'none' }}
      ref={dragCard}
    >
      <div className="absolute inset-0 flex flex-col justify-between h-full select-none">
        <div className="p-1 text-xs font-semibold">
          {hora} - {addMinutes(hora, visualDuracao)}<br />
          {agendamento.paciente || "Agendado"}
        </div>
        {/* Handle de resize visual */}
        <div
          className="w-full h-2 cursor-s-resize bg-primary/20 rounded-b"
          style={{ position: 'absolute', bottom: 0 }}
          title="Arraste para redimensionar"
          onMouseDown={onResizeMouseDown}
        />
      </div>
    </td>
  );
}