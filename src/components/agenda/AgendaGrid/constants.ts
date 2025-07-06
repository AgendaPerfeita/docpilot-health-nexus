export const diasSemana = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

// Grid de 15 em 15 minutos, das 08:00 às 18:00
export const horarios = Array.from({ length: 40 }, (_, i) => {
  const hora = 8 + Math.floor(i / 4);
  const min = (i % 4) * 15;
  return `${hora.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
});

export const RESIZE_HANDLE_TYPE = "resize-handle";
export const AGENDAMENTO_TYPE = "agendamento-card";