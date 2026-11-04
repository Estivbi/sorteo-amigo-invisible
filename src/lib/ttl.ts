const DIA = 86400;
export const TTL_MIN = 7 * DIA;
export const TTL_SIN_FECHA = 45 * DIA;
export const TTL_MAX = 90 * DIA;

/** Segundos que se conservan los datos: hasta 7 días después del intercambio (45 días si no hay fecha), entre 7 y 90 días. */
export function ttlSegundos(eventDate: string | null, ahora: number = Date.now()): number {
  if (!eventDate) return TTL_SIN_FECHA;
  const fin = Date.parse(`${eventDate}T00:00:00Z`) + 7 * DIA * 1000;
  const segundos = Math.ceil((fin - ahora) / 1000);
  return Math.min(TTL_MAX, Math.max(TTL_MIN, segundos));
}
