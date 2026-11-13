import type { APIRoute } from 'astro';
import { tokenDeCabecera, tokenValido } from '../../lib/admin';
import { diaMadrid, ultimosDias } from '../../lib/cupos';
import { env, ipDe, json } from '../../lib/http';
import { permitido } from '../../lib/limite';
import { configLimites, contadoresReales } from '../../lib/servicios';

export const prerender = false;

/** Estadísticas de uso de los últimos 14 días. Solo con el ADMIN_TOKEN en la cabecera Authorization. */
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const esperado = env('ADMIN_TOKEN');
  if (!esperado) return json({ error: 'no_configurado' }, 404);
  if (!permitido(`admin:${ipDe(request, clientAddress)}`, 10)) return json({ error: 'limite', mensaje: 'Demasiados intentos. Espera unos minutos.' }, 429);
  if (!tokenValido(tokenDeCabecera(request.headers.get('authorization')), esperado)) return json({ error: 'no_autorizado', mensaje: 'Token incorrecto.' }, 401);

  try {
    const contadores = contadoresReales();
    const dias = ultimosDias(14);
    const [metricas, [usoHoy]] = await Promise.all([contadores.leerMetricas(dias), contadores.leer([`cupo:global:${diaMadrid()}`])]);
    const limites = configLimites();
    return json({ hoy: { dia: dias[0], correos: usoHoy, limite: limites.globalDia }, limites, dias: dias.map((dia) => ({ dia, ...metricas[dia] })) });
  } catch {
    return json({ error: 'sin_datos', mensaje: 'No se han podido leer las estadísticas.' }, 502);
  }
};
