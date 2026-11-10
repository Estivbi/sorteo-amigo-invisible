import type { APIRoute } from 'astro';
import { asignar, ErrorSorteo, validarDatos } from '../../lib/sorteo';
import { construirCorreo, enviarCorreos, proveedorActivo } from '../../lib/email';
import { verificarTurnstile } from '../../lib/turnstile';
import { permitido } from '../../lib/limite';
import { almacenDisponible, generarToken, guardarRegistros, type RegistroAmigo } from '../../lib/almacen';
import { env, ipDe, json, origenPermitido } from '../../lib/http';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress, url, site }) => {
  if (!origenPermitido(request)) return json({ error: 'origen_no_permitido', mensaje: 'Origen no permitido.' }, 403);
  if (!permitido(ipDe(request, clientAddress))) return json({ error: 'demasiadas_peticiones', mensaje: 'Has hecho demasiados sorteos seguidos. Espera unos minutos.' }, 429);

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: 'json_invalido', mensaje: 'Petición no válida.' }, 400);
  }

  // Trampa para bots: un humano nunca rellena este campo oculto.
  if (cuerpo.website) return json({ ok: true, sent: 0 });

  // Con envío real de correos, el antibots es obligatorio; en desarrollo o modo simulado puede faltar.
  const captcha = await verificarTurnstile({
    token: cuerpo.captchaToken,
    secret: env('TURNSTILE_SECRET'),
    ip: ipDe(request, clientAddress),
    exigido: proveedorActivo() !== 'simulado',
  });
  if (!captcha.ok) {
    if (captcha.motivo === 'no_configurado') console.error('create-game: falta TURNSTILE_SECRET con el envío de correos activo');
    return captcha.motivo === 'no_configurado'
      ? json({ error: 'captcha_no_configurado', mensaje: 'La protección antibots no está configurada. Inténtalo más tarde.' }, 503)
      : json({ error: 'captcha', mensaje: 'No hemos podido verificar que eres una persona. Recarga la página e inténtalo de nuevo.' }, 403);
  }

  try {
    const juego = validarDatos(cuerpo);
    const asignaciones = asignar(juego.participants, juego.exceptions);

    // Enlaces privados: cada participante puede ver la lista de su amigo y editar la suya. Solo se guardan nombres y listas.
    const conEnlaces = almacenDisponible();
    const base = import.meta.env.DEV ? url.origin : (site ?? url).origin;
    const tokens = new Map(juego.participants.map((p) => [p.id, generarToken()]));
    if (conEnlaces) {
      const registros: Record<string, RegistroAmigo> = {};
      for (const { giver, receiver } of asignaciones) {
        registros[tokens.get(giver.id)!] = {
          n: giver.name, w: giver.wishlist ?? '', r: tokens.get(receiver.id)!, g: juego.gameName, d: juego.eventDate, b: juego.budget,
        };
      }
      await guardarRegistros(registros, juego.eventDate);
    }

    const correos = asignaciones.map((a) => construirCorreo(a, juego, conEnlaces ? `${base}/amigo/${tokens.get(a.giver.id)}` : undefined));
    const proveedor = await enviarCorreos(correos);
    if (proveedor === 'simulado' && import.meta.env.DEV) for (const a of asignaciones) console.info(`[dev] enlace de ${a.giver.name}: ${base}/amigo/${tokens.get(a.giver.id)}`);
    // Nunca se devuelve quién regala a quién.
    return json({ ok: true, sent: correos.length, simulado: proveedor === 'simulado' });
  } catch (err) {
    if (err instanceof ErrorSorteo) return json({ error: err.codigo, mensaje: err.message }, err.codigo === 'sin_solucion' ? 422 : 400);
    console.error('create-game: fallo', err instanceof Error ? err.message : 'desconocido');
    return json({ error: 'envio_fallido', mensaje: 'No hemos podido enviar los correos. Inténtalo de nuevo en unos minutos.' }, 502);
  }
};
