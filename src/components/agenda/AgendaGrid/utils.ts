export function addMinutes(hora: string, minutos: number) {
  const [h, m] = hora.split(":").map(Number);
  const date = new Date(0, 0, 0, h, m + minutos);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}