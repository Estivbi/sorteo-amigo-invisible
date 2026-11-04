/**
 * Limitador de peticiones por IP en memoria.
 * En serverless cada instancia tiene su propio contador, así que es una barrera de mejor esfuerzo:
 * la protección fuerte son reCAPTCHA y el tope de participantes por sorteo.
 */
const VENTANA_MS = 10 * 60 * 1000;
const MAX = 5;
const contadores = new Map<string, { n: number; desde: number }>();

export function permitido(ip: string, ahora = Date.now()): boolean {
  for (const [k, v] of contadores) if (ahora - v.desde > VENTANA_MS) contadores.delete(k);
  const actual = contadores.get(ip);
  if (!actual || ahora - actual.desde > VENTANA_MS) {
    contadores.set(ip, { n: 1, desde: ahora });
    return true;
  }
  actual.n += 1;
  return actual.n <= MAX;
}
