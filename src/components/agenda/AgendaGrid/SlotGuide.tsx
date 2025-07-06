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
        border: "2.5px solid #3498db",
        borderRadius: 10,
        background: "#fff",
        boxShadow: "none",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ textAlign: "center", color: "#222", fontWeight: 500, fontSize: 14 }}>
        {horaInicio} - {horaFim}<br />
        <span style={{ color: "#555", fontWeight: 400, fontSize: 13 }}>{dragItem.paciente || ""}</span>
      </div>
    </div>
  );
}