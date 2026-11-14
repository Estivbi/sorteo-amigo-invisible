/** Contadores con caducidad: en Redis (producción) o en memoria (desarrollo y tests). Sin dependencias del entorno. */

export interface ItemContador { clave: string; n: number; ttl: number }
export type Metricas = Record<string, Record<string, number>>;

export interface Contadores {
  /** Suma n a cada contador y devuelve el valor nuevo de cada uno, en el mismo orden. */
  incrementar(items: ItemContador[]): Promise<number[]>;
  decrementar(items: { clave: string; n: number }[]): Promise<void>;
  /** true solo la primera vez que se pide esa clave dentro de su ventana (SET NX EX). */
  unaVez(clave: string, ttl: number): Promise<boolean>;
  /** Lee el valor actual de cada contador (0 si no existe). */
  leer(claves: string[]): Promise<number[]>;
  /** Borra una clave (por ejemplo, para liberar la ventana de un aviso que no se pudo entregar). */
  olvidar(clave: string): Promise<void>;
  /** Suma a las estadísticas del día (un hash por día). */
  metricas(dia: string, sumas: Record<string, number>): Promise<void>;
  leerMetricas(dias: string[]): Promise<Metricas>;
}

const TTL_METRICAS = 90 * 86400;

export function crearContadoresMemoria(): Contadores & { claves(): string[] } {
  const valores = new Map<string, { v: number; exp: number }>();
  const hashes = new Map<string, Record<string, number>>();
  const vivo = (clave: string) => { const e = valores.get(clave); if (e && e.exp <= Date.now()) { valores.delete(clave); return undefined; } return e; };
  return {
    async incrementar(items) {
      return items.map(({ clave, n, ttl }) => {
        const e = vivo(clave) ?? { v: 0, exp: Date.now() + ttl * 1000 };
        e.v += n; valores.set(clave, e); return e.v;
      });
    },
    async decrementar(items) { for (const { clave, n } of items) { const e = vivo(clave); if (e) e.v = Math.max(0, e.v - n); } },
    async leer(claves) { return claves.map((c) => vivo(c)?.v ?? 0); },
    async olvidar(clave) { valores.delete(clave); },
    async unaVez(clave, ttl) { if (vivo(clave)) return false; valores.set(clave, { v: 1, exp: Date.now() + ttl * 1000 }); return true; },
    async metricas(dia, sumas) { const h = hashes.get(dia) ?? {}; for (const [k, n] of Object.entries(sumas)) h[k] = (h[k] ?? 0) + n; hashes.set(dia, h); },
    async leerMetricas(dias) { return Object.fromEntries(dias.map((d) => [d, { ...(hashes.get(d) ?? {}) }])); },
    claves: () => [...valores.keys(), ...hashes.keys()],
  };
}

export type EjecutarRedis = (comandos: unknown[][]) => Promise<{ result: unknown }[]>;

export function crearContadoresRedis(ejecutar: EjecutarRedis): Contadores {
  return {
    async incrementar(items) {
      const cmds = items.flatMap(({ clave, n, ttl }) => [['INCRBY', clave, n], ['EXPIRE', clave, ttl]]);
      const r = await ejecutar(cmds);
      return items.map((_, i) => Number(r[i * 2]?.result ?? 0));
    },
    async decrementar(items) { if (items.length) await ejecutar(items.map(({ clave, n }) => ['DECRBY', clave, n])); },
    async leer(claves) { const r = await ejecutar(claves.map((c) => ['GET', c])); return claves.map((_, i) => Number(r[i]?.result ?? 0)); },
    async olvidar(clave) { await ejecutar([['DEL', clave]]); },
    async unaVez(clave, ttl) { const [r] = await ejecutar([['SET', clave, '1', 'NX', 'EX', ttl]]); return r?.result === 'OK'; },
    async metricas(dia, sumas) {
      const clave = `metricas:${dia}`;
      const cmds: unknown[][] = Object.entries(sumas).map(([k, n]) => ['HINCRBY', clave, k, n]);
      if (cmds.length) await ejecutar([...cmds, ['EXPIRE', clave, TTL_METRICAS]]);
    },
    async leerMetricas(dias) {
      const r = await ejecutar(dias.map((d) => ['HGETALL', `metricas:${d}`]));
      return Object.fromEntries(dias.map((d, i) => {
        const plano = (r[i]?.result as string[] | undefined) ?? []; const h: Record<string, number> = {};
        for (let k = 0; k + 1 < plano.length; k += 2) h[plano[k]] = Number(plano[k + 1]);
        return [d, h];
      }));
    },
  };
}
