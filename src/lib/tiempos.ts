/** Cronómetro para la cabecera Server-Timing: mide cuánto tarda cada paso de una petición. */
export interface Cronometro {
  /** Cierra el paso que acaba de terminar y lo guarda con ese nombre. */
  marca(nombre: string): void;
  /** Valor de la cabecera Server-Timing con todos los pasos y el total. */
  cabecera(): string;
}

export function crearCronometro(ahora: () => number = () => performance.now()): Cronometro {
  const inicio = ahora();
  let ultimo = inicio;
  const pasos: [string, number][] = [];
  return {
    marca(nombre) {
      const t = ahora();
      pasos.push([nombre, t - ultimo]);
      ultimo = t;
    },
    cabecera() {
      const total = ahora() - inicio;
      return [...pasos, ['total', total] as [string, number]].map(([n, ms]) => `${n};dur=${ms.toFixed(1)}`).join(', ');
    },
  };
}
