import type { APIRoute } from 'astro';
import { actualizarLista, tokenValido } from '../../lib/almacen';
import { ipDe, json, origenPermitido } from '../../lib/http';
import { permitido } from '../../lib/limite';
import { leerJsonSeguro } from '../../lib/cuerpo';
import { limpiarTexto } from '../../lib/texto';
import { analizarLista, MAX_LISTA } from '../../lib/lista-deseos';

export const prerender = false;

export const POST: APIRoute = async ({ request, clientAddress }) => {
  if (!origenPermitido(request)) return json({ error: 'origen', mensaje: 'Origen no permitido.' }, 403);
  if (!permitido(`lista:${ipDe(request, clientAddress)}`, 30)) return json({ error: 'limite', mensaje: 'Demasiados cambios seguidos. Espera unos minutos.' }, 429);

  const lectura = await leerJsonSeguro(request, 8 * 1024);
  if (!lectura.ok) return json({ error: lectura.error, mensaje: 'Petición no válida.' }, lectura.estado);
  const cuerpo = lectura.cuerpo as { token?: unknown; wishlist?: unknown };
  if (!tokenValido(cuerpo.token) || typeof cuerpo.wishlist !== 'string') return json({ error: 'datos', mensaje: 'Datos no válidos.' }, 400);

  const lista = limpiarTexto(cuerpo.wishlist, MAX_LISTA);
  const analisis = analizarLista(lista);
  if (!analisis.ok) return json({ error: 'enlaces', mensaje: analisis.motivo }, 400);
  try {
    const ok = await actualizarLista(cuerpo.token, lista);
    if (!ok) return json({ error: 'caducado', mensaje: 'Este enlace ha caducado.' }, 404);
    return json({ ok: true, wishlist: lista });
  } catch {
    return json({ error: 'almacen', mensaje: 'No hemos podido guardar los cambios. Inténtalo de nuevo.' }, 502);
  }
};
