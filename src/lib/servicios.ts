import { env } from './http';
import { avisar as avisarBase, enviarTelegram } from './alertas';
import { redisConfigurado, ejecutarRedis } from './almacen';
import { crearContadoresMemoria, crearContadoresRedis, type Contadores } from './contadores';
import { leerConfig } from './cupos';

let memoria: ReturnType<typeof crearContadoresMemoria> | null = null;

/** Contadores reales: Redis en producción, memoria del proceso en desarrollo. */
export function contadoresReales(): Contadores {
  if (redisConfigurado()) return crearContadoresRedis(ejecutarRedis);
  return (memoria ??= crearContadoresMemoria());
}

export const configLimites = () => leerConfig(env);

/** Clave para las huellas de IP y correo. Si no hay ADMIN_TOKEN usa una fija: las huellas caducan en 26 horas. */
export const secretoHuella = () => env('ADMIN_TOKEN') || 'amigo-invisible';

/** Canal de avisos (Telegram) o null si no está configurado. */
export function canalAvisos(): ((texto: string) => Promise<boolean>) | null {
  const token = env('TELEGRAM_BOT_TOKEN');
  const chat = env('TELEGRAM_CHAT_ID');
  const servidor = env('TELEGRAM_API_URL') || undefined; // solo para pruebas con un servidor falso
  return token && chat ? (texto) => enviarTelegram(token, chat, texto, fetch, servidor) : null;
}

/** Envía un aviso informativo al administrador sin limitar su frecuencia. Nunca lanza errores. */
export async function notificar(texto: string): Promise<boolean> {
  const canal = canalAvisos();
  if (!canal) return false;
  try { return await canal(texto); } catch { return false; }
}

export const avisar = (tipo: string, texto: string, ventanaSegundos?: number) =>
  avisarBase(tipo, texto, { contadores: contadoresReales(), enviar: canalAvisos() }, ventanaSegundos);
