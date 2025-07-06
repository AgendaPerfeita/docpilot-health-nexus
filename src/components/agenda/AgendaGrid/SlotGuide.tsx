import React from "react";
import { addMinutes } from "./utils";
import { SlotGuideProps } from "./types";

export function SlotGuide({ dragSlot, dragItem }: SlotGuideProps) {
  if (!dragSlot || !dragItem) return null;
  const duracao = dragSlot.duracao || 30;
  // Calcular hora de início conforme célula de destino
  const horaInicio = dragSlot.hora || dragItem.hora;
  const horaFim = addMinutes(horaInicio, duracao);
  // Centralizar horizontalmente na coluna e alinhar verticalmente
  const cellWidth = 120;
  const x = dragSlot.cellLeft !== undefined ? dragSlot.cellLeft : dragSlot.x;
  const y = dragSlot.cellTop !== undefined ? dragSlot.cellTop : dragSlot.y;
  return (
    <div
      style={{
        position: "fixed",
        left: x,
        top: y,
        width: cellWidth,
        height: Math.max(1, Math.round(duracao / 15)) * 32,
        zIndex: 2000,
        pointerEvents: "none",
        border: "2px dashed #3b82f6",
        borderRadius: 8,
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))",
        backdropFilter: "blur(4px)",
        boxShadow: "0 8px 32px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(59, 130, 246, 0.1)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        animation: "pulse 1.5s ease-in-out infinite",
        transform: "scale(1.02)",
      }}
    >
      <div style={{ 
        textAlign: "center", 
        color: "#1e40af", 
        fontWeight: 600, 
        fontSize: 12,
        textShadow: "0 1px 2px rgba(255,255,255,0.8)"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          gap: 4, 
          marginBottom: 2 
        }}>
          <div style={{
            width: 6,
            height: 6,
            backgroundColor: "#3b82f6",
            borderRadius: "50%",
            animation: "pulse 1s ease-in-out infinite"
          }}></div>
          <span>{horaInicio} - {horaFim}</span>
        </div>
        <div style={{ 
          color: "#64748b", 
          fontWeight: 500, 
          fontSize: 11 
        }}>
          {dragItem.paciente || "Agendamento"}
        </div>
      </div>
    </div>
  );
}