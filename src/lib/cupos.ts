import type { Contadores } from './contadores';

export interface ConfigLimites { globalDia: number; porDestinatario: number; porIpDia: number }

/** Lee los límites de las variables de entorno. Un valor ausente, no numérico o no positivo usa el de por defecto. */
export function leerConfig(env: (clave: string) => string): ConfigLimites {
  const num = (clave: string, defecto: number) => { const n = Number(env(clave)); return Number.isInteger(n) && n > 0 ? n : defecto; };
  return { globalDia: num('LIMITE_CORREOS_DIA', 80), porDestinatario: num('LIMITE_POR_DESTINATARIO', 5), porIpDia: num('LIMITE_SORTEOS_IP_DIA', 10) };
}

/** Día en curso con la hora de Madrid (AAAA-MM-DD): los contadores se reinician a medianoche de España. */
export function diaMadrid(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(ahora);
}

/** Los últimos n días (el más reciente primero), con la hora de Madrid. */
export function ultimosDias(n: number, ahora: Date = new Date()): string[] {
  return Array.from({ length: n }, (_, i) => diaMadrid(new Date(ahora.getTime() - i * 86400000)));
}

/** Huella HMAC-SHA256 (32 caracteres) para contar sin guardar correos ni IP en claro. */
export async function huella(valor: string, secreto: string): Promise<string> {
  const clave = await crypto.subtle.importKey('raw', new TextEncoder().encode(secreto), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const firma = await crypto.subtle.sign('HMAC', clave, new TextEncoder().encode(valor.trim().toLowerCase()));
  return [...new Uint8Array(firma)].map((b) => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}

export type Rechazo = { tipo: 'global' } | { tipo: 'ip' } | { tipo: 'destinatario'; nombre?: string };
export type ResultadoCupo = { ok: true; usoGlobal: number; liberar(): Promise<void> } | { ok: false; rechazo: Rechazo };

const TTL_DIA = 26 * 3600;

interface Entrada {
  contadores: Contadores;
  config: ConfigLimites;
  secreto: string;
  dia: string;
  ip: string;
  destinatarios: { nombre: string; email: string }[];
}

/**
 * Reserva el cupo de un sorteo antes de enviar nada: tope global del día, sorteos por IP y correos por destinatario.
 * Si algo no cabe devuelve lo reservado y rechaza. Si el envío falla después, `liberar()` lo devuelve.
 */
export async function reservarCupo({ contadores, config, secreto, dia, ip, destinatarios }: Entrada): Promise<ResultadoCupo> {
  const claveGlobal = `cupo:global:${dia}`;
  const claveIp = `cupo:ip:${dia}:${await huella(ip, secreto)}`;
  const clavesDest = await Promise.all(destinatarios.map(async (d) => `cupo:dest:${dia}:${await huella(d.email, secreto)}`));

  const items = [
    { clave: claveGlobal, n: destinatarios.length, ttl: TTL_DIA },
    { clave: claveIp, n: 1, ttl: TTL_DIA },
    ...clavesDest.map((clave) => ({ clave, n: 1, ttl: TTL_DIA })),
  ];
  const [global, porIp, ...porDest] = await contadores.incrementar(items);
  const devolver = () => contadores.decrementar(items.map(({ clave, n }) => ({ clave, n })));

  if (porIp > config.porIpDia) { await devolver(); return { ok: false, rechazo: { tipo: 'ip' } }; }
  const excedido = porDest.findIndex((n) => n > config.porDestinatario);
  if (excedido >= 0) { await devolver(); return { ok: false, rechazo: { tipo: 'destinatario', nombre: destinatarios[excedido].nombre } }; }
  if (global > config.globalDia) { await devolver(); return { ok: false, rechazo: { tipo: 'global' } }; }
  return { ok: true, usoGlobal: global, liberar: devolver };
}
