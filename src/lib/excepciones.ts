/** Excepciones del formulario: cada fila relaciona a dos personas y un sentido. */
export type Modo = 'ambos' | 'ida' | 'vuelta';

export interface FilaExcepcion {
  /** Id de la primera persona. */
  a: string;
  /** Id de la segunda persona. */
  b: string;
  /** ambos: no se regalan entre sí. ida: a no regala a b. vuelta: b no regala a a. */
  modo: Modo;
}

/** Par que entiende el sorteo: `from` no puede regalar a `to`. */
export interface ParExcepcion { from: string; to: string }

const SIGUIENTE: Record<Modo, Modo> = { ambos: 'ida', ida: 'vuelta', vuelta: 'ambos' };

/** Orden de la flecha al pulsarla: ambos, ida, vuelta y vuelta a empezar. */
export const siguienteModo = (modo: Modo): Modo => SIGUIENTE[modo];

/** Convierte las filas en pares `from → to` sin repetir y sin filas incompletas. */
export function expandirExcepciones(filas: FilaExcepcion[]): ParExcepcion[] {
  const pares = new Map<string, ParExcepcion>();
  const añadir = (from: string, to: string) => pares.set(`${from}>${to}`, { from, to });
  for (const { a, b, modo } of filas) {
    if (!a || !b || a === b) continue;
    if (modo !== 'vuelta') añadir(a, b);
    if (modo !== 'ida') añadir(b, a);
  }
  return [...pares.values()];
}

/** Frase que explica la excepción en lenguaje llano, para mostrarla debajo de la fila. */
export function leyendaExcepcion({ a, b, modo }: FilaExcepcion, nombreA: string, nombreB: string): string {
  if (!a || !b) return 'Elige a las dos personas.';
  if (a === b) return 'Elige dos personas distintas.';
  if (modo === 'ambos') return `${nombreA} y ${nombreB} no se regalarán entre sí.`;
  if (modo === 'ida') return `${nombreA} no regalará a ${nombreB}, pero ${nombreB} sí podría regalar a ${nombreA}.`;
  return `${nombreB} no regalará a ${nombreA}, pero ${nombreA} sí podría regalar a ${nombreB}.`;
}
