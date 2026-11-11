/** Verificación de Cloudflare Turnstile en el servidor. */
export const URL_VERIFICACION = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
export const ACCION_CREAR_SORTEO = 'crear_sorteo';

export type MotivoCaptcha = 'no_configurado' | 'sin_token' | 'rechazado' | 'error';
export interface ResultadoCaptcha {
  ok: boolean;
  motivo?: MotivoCaptcha;
}

interface Opciones {
  token: unknown;
  secret: string;
  ip?: string;
  /** true cuando se van a enviar correos de verdad: sin secreto configurado se rechaza la petición. */
  exigido: boolean;
  accion?: string;
}

const IP_RE = /^[0-9a-fA-F:.]{3,45}$/;

/**
 * Comprueba el token del widget. Si algo falla (red, respuesta rara) se rechaza: nunca se deja pasar por error.
 * Sin secreto solo se permite cuando no se envían correos reales (desarrollo o modo simulado).
 */
export async function verificarTurnstile(
  { token, secret, ip, exigido, accion = ACCION_CREAR_SORTEO }: Opciones,
  fetchFn: typeof fetch = fetch,
): Promise<ResultadoCaptcha> {
  if (!secret) return exigido ? { ok: false, motivo: 'no_configurado' } : { ok: true };
  if (typeof token !== 'string' || token.length === 0 || token.length > 2048) return { ok: false, motivo: 'sin_token' };

  const cuerpo = new URLSearchParams({ secret, response: token });
  if (ip && IP_RE.test(ip)) cuerpo.set('remoteip', ip);

  try {
    const res = await fetchFn(URL_VERIFICACION, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: cuerpo,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, motivo: 'error' };
    const r = (await res.json()) as { success?: boolean; action?: string };
    if (r.success !== true) return { ok: false, motivo: 'rechazado' };
    if (r.action && r.action !== accion) return { ok: false, motivo: 'rechazado' };
    return { ok: true };
  } catch {
    return { ok: false, motivo: 'error' };
  }
}
