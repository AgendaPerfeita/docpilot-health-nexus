import React from "react";
import { addMinutes } from "./utils";

interface DragPreviewProps {
  item: any;
  currentOffset: { x: number; y: number };
}

export function DragPreview({ item, currentOffset }: DragPreviewProps) {
  if (!item || !currentOffset) return null;

  const duracao = item.duracao || 30;
  const horaFim = addMinutes(item.hora, duracao);
  const altura = Math.max(1, Math.round(duracao / 15)) * 32;

  return (
    <div
      style={{
        position: 'fixed',
        left: currentOffset.x - 60,
        top: currentOffset.y - 20,
        width: 120,
        height: altura,
        zIndex: 9999,
        pointerEvents: 'none',
        backgroundColor: 'rgba(59, 130, 246, 0.9)',
        border: '2px solid #3b82f6',
        borderRadius: 8,
        padding: 8,
        color: 'white',
        fontSize: 12,
        fontWeight: 600,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.4)',
      }}
    >
      <div>{item.hora} - {horaFim}</div>
      <div style={{ fontSize: 10, opacity: 0.9 }}>
        {item.paciente || "Agendamento"}
      </div>
    </div>
  );
}