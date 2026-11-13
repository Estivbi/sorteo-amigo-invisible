import { env } from './http';
import { ttlSegundos } from './ttl';

/** Lo único que se guarda de cada participante. Nunca se guardan correos. */
export interface RegistroAmigo {
  n: string; // nombre
  w: string; // lista de deseos
  r: string; // token del participante al que regala
  g: string; // nombre del sorteo
  d: string | null; // fecha del intercambio
  b: number | null; // presupuesto
}

const TOKEN_RE = /^[A-Za-z0-9_-]{22}$/;
export const tokenValido = (t: unknown): t is string => typeof t === 'string' && TOKEN_RE.test(t);

export function generarToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const urlRedis = () => env('UPSTASH_REDIS_REST_URL') || env('KV_REST_API_URL');
const tokenRedis = () => env('UPSTASH_REDIS_REST_TOKEN') || env('KV_REST_API_TOKEN');
const enDesarrollo = () => Boolean((import.meta.env as { DEV?: boolean }).DEV);

/** En producción hace falta Redis; en desarrollo se usa memoria para poder probar sin cuenta. */
/** true si hay una base Redis real configurada (no la memoria de desarrollo). */
export const redisConfigurado = () => Boolean(urlRedis() && tokenRedis());

export const almacenDisponible = () => Boolean(urlRedis() && tokenRedis()) || enDesarrollo();

const memoria = new Map<string, { v: string; exp: number }>();
const clave = (t: string) => `amigo:${t}`;

export async function ejecutarRedis(comandos: unknown[][]): Promise<{ result: unknown }[]> {
  const res = await fetch(`${urlRedis()}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${tokenRedis()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comandos),
  });
  if (!res.ok) throw new Error(`redis_${res.status}`);
  return (await res.json()) as { result: unknown }[];
}

export async function guardarRegistros(registros: Record<string, RegistroAmigo>, eventDate: string | null): Promise<void> {
  const ttl = ttlSegundos(eventDate);
  const entradas = Object.entries(registros);
  if (!urlRedis()) {
    for (const [t, r] of entradas) memoria.set(clave(t), { v: JSON.stringify(r), exp: Date.now() + ttl * 1000 });
    return;
  }
  await ejecutarRedis(entradas.map(([t, r]) => ['SET', clave(t), JSON.stringify(r), 'EX', ttl]));
}

export async function leerRegistro(token: string): Promise<RegistroAmigo | null> {
  if (!tokenValido(token)) return null;
  let crudo: string | null = null;
  if (!urlRedis()) {
    const e = memoria.get(clave(token));
    crudo = e && e.exp > Date.now() ? e.v : null;
  } else {
    const [r] = await ejecutarRedis([['GET', clave(token)]]);
    crudo = typeof r?.result === 'string' ? r.result : null;
  }
  if (!crudo) return null;
  try {
    return JSON.parse(crudo) as RegistroAmigo;
  } catch {
    return null;
  }
}

/** Cambia la lista conservando la caducidad original. Devuelve false si el enlace no existe o caducó. */
export async function actualizarLista(token: string, lista: string): Promise<boolean> {
  const actual = await leerRegistro(token);
  if (!actual) return false;
  const nuevo = JSON.stringify({ ...actual, w: lista });
  if (!urlRedis()) {
    const e = memoria.get(clave(token));
    if (e) memoria.set(clave(token), { ...e, v: nuevo });
    return true;
  }
  await ejecutarRedis([['SET', clave(token), nuevo, 'KEEPTTL']]);
  return true;
}
