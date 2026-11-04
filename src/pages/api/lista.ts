import type { APIRoute } from 'astro';
import { actualizarLista, tokenValido } from '../../lib/almacen';
import { ipDe, json, origenPermitido } from '../../lib/http';
import { permitido } from '../../lib/limite';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!origenPermitido(request)) return json({ error: 'origen', mensaje: 'Origen no permitido.' }, 403);
  if (!permitido(`lista:${ipDe(request, clientAddress)}`, 30)) return json({ error: 'limite', mensaje: 'Demasiados cambios seguidos. Espera unos minutos.' }, 429);

  let cuerpo: { token?: unknown; wishlist?: unknown };
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: 'json', mensaje: 'Petición no válida.' }, 400);
  }
  if (!tokenValido(cuerpo.token) || typeof cuerpo.wishlist !== 'string') return json({ error: 'datos', mensaje: 'Datos no válidos.' }, 400);

  const lista = cuerpo.wishlist.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 200);
  try {
    const ok = await actualizarLista(cuerpo.token, lista);
    if (!ok) return json({ error: 'caducado', mensaje: 'Este enlace ha caducado.' }, 404);
    return json({ ok: true, wishlist: lista });
  } catch {
    return json({ error: 'almacen', mensaje: 'No hemos podido guardar los cambios. Inténtalo de nuevo.' }, 502);
  }
};
