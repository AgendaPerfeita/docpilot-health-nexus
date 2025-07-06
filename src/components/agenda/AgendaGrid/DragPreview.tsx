import React from "react";
import { addMinutes } from "./utils";

interface DragPreviewProps {
  item: any;
  currentOffset: { x: number; y: number };
  hoveredCell?: { diaStr: string; hora: string; diaIdx: number; horaIdx: number } | null;
}

export function DragPreview({ item, currentOffset, hoveredCell }: DragPreviewProps) {
  if (!item || !currentOffset) return null;

  const duracao = item.duracao || 30;
  const altura = Math.max(1, Math.round(duracao / 15)) * 32;
  
  // Usar a hora da célula hovereada se disponível, senão usar a original
  const horaExibida = hoveredCell?.hora || item.hora;
  const horaFim = addMinutes(horaExibida, duracao);
  
  // Determinar se pode fazer drop
  const canDrop = hoveredCell && !(item.dia === hoveredCell.diaStr && item.hora === hoveredCell.hora);

  return (
    <div
      style={{
        position: 'fixed',
        left: currentOffset.x - 60,
        top: currentOffset.y - altura/2,
        width: 120,
        height: altura,
        zIndex: 2000,
        pointerEvents: 'none',
        backgroundColor: canDrop 
          ? 'rgba(34, 197, 94, 0.95)' 
          : hoveredCell 
          ? 'rgba(239, 68, 68, 0.95)' 
          : 'rgba(59, 130, 246, 0.95)',
        border: `2px solid ${canDrop ? '#22c55e' : hoveredCell ? '#ef4444' : '#3b82f6'}`,
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
        boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(4px)',
        transform: 'rotate(-2deg)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
        <div style={{
          width: 6,
          height: 6,
          backgroundColor: 'white',
          borderRadius: '50%',
          animation: 'pulse 1s ease-in-out infinite'
        }} />
        <span>{horaExibida} - {horaFim}</span>
      </div>
      <div style={{ fontSize: 10, opacity: 0.9 }}>
        {item.paciente || "Agendamento"}
      </div>
      {hoveredCell && (
        <div style={{ fontSize: 9, opacity: 0.8, marginTop: 2 }}>
          {canDrop ? "✓ Soltar aqui" : "✗ Mesmo local"}
        </div>
      )}
    </div>
  );
}