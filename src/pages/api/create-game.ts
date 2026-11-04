import type { APIRoute } from 'astro';
import { asignar, ErrorSorteo, validarDatos } from '../../lib/sorteo';
import { construirCorreo, enviarCorreos } from '../../lib/email';
import { permitido } from '../../lib/limite';

export const prerender = false;

const json = (cuerpo: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });

const env = (k: string) => ((import.meta.env as Record<string, string | undefined>)[k] ?? process.env[k] ?? '').toString();

async function verificarRecaptcha(token: unknown): Promise<boolean> {
  const secreto = env('RECAPTCHA_SECRET');
  if (!secreto) return true; // sin configurar (desarrollo)
  if (typeof token !== 'string' || !token) return false;
  try {
    const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret: secreto, response: token }),
    });
    const r = (await res.json()) as { success?: boolean; score?: number };
    return Boolean(r.success) && (typeof r.score !== 'number' || r.score >= 0.5);
  } catch {
    return false;
  }
}

function origenPermitido(request: Request): boolean {
  const permitidoEnv = env('ALLOWED_ORIGIN');
  if (!permitidoEnv) return true;
  const origen = request.headers.get('origin') ?? request.headers.get('referer');
  if (!origen) return false;
  try {
    const host = new URL(origen).hostname;
    return host === permitidoEnv || host.endsWith(`.${permitidoEnv}`);
  } catch {
    return false;
  }
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!origenPermitido(request)) return json({ error: 'origen_no_permitido', mensaje: 'Origen no permitido.' }, 403);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'desconocida';
  if (!permitido(ip)) return json({ error: 'demasiadas_peticiones', mensaje: 'Has hecho demasiados sorteos seguidos. Espera unos minutos.' }, 429);

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: 'json_invalido', mensaje: 'Petición no válida.' }, 400);
  }

  // Trampa para bots: un humano nunca rellena este campo oculto.
  if (cuerpo.website) return json({ ok: true, sent: 0 });

  if (!(await verificarRecaptcha(cuerpo.recaptchaToken))) {
    return json({ error: 'recaptcha', mensaje: 'No hemos podido verificar que eres una persona. Recarga la página e inténtalo de nuevo.' }, 403);
  }

  try {
    const juego = validarDatos(cuerpo);
    const asignaciones = asignar(juego.participants, juego.exceptions);
    const correos = asignaciones.map((a) => construirCorreo(a, juego));
    const proveedor = await enviarCorreos(correos);
    // No se guarda nada ni se devuelve quién regala a quién.
    return json({ ok: true, sent: correos.length, simulado: proveedor === 'simulado' });
  } catch (err) {
    if (err instanceof ErrorSorteo) return json({ error: err.codigo, mensaje: err.message }, err.codigo === 'sin_solucion' ? 422 : 400);
    console.error('create-game: fallo al enviar', err instanceof Error ? err.message : 'desconocido');
    return json({ error: 'envio_fallido', mensaje: 'No hemos podido enviar los correos. Inténtalo de nuevo en unos minutos.' }, 502);
  }
};
