/**
 * Notificación a Bing y buscadores compatibles mediante el protocolo IndexNow.
 * Uso: npm run indexnow
 */
import { landings } from '../src/data/landings.ts';
import { guias } from '../src/data/guias.ts';

export const INDEXNOW_KEY = 'e892c906a2cf4e819b91e92d7701dc28';
export const DEFAULT_HOST = 'sorteo-amigo-invisible.vercel.app';

export function obtenerRutasIndexNow(): string[] {
  return [
    '/',
    '/crear',
    ...landings.map((l) => `/amigo-invisible/${l.slug}`),
    '/ideas-regalo',
    '/reglas',
    '/guias',
    ...guias.map((g) => `/guias/${g.slug}`),
    '/contacto',
    '/privacidad',
  ];
}

export function construirPeticionIndexNow(host = DEFAULT_HOST, key = INDEXNOW_KEY) {
  const rutas = obtenerRutasIndexNow();
  const urlList = rutas.map((r) => `https://${host}${r}`);
  return {
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList,
  };
}

export async function notificarIndexNow(host = DEFAULT_HOST, key = INDEXNOW_KEY): Promise<{ ok: boolean; status: number; text: string }> {
  const cuerpo = construirPeticionIndexNow(host, key);
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(cuerpo),
    });
    const text = await res.text();
    return { ok: res.ok, status: res.status, text };
  } catch (err) {
    return { ok: false, status: 0, text: String(err) };
  }
}

// Ejecución directa desde línea de comandos
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(`Enviando ${obtenerRutasIndexNow().length} URLs a IndexNow...`);
  notificarIndexNow()
    .then((r) => {
      console.log(`Respuesta IndexNow (${r.status}): ${r.text || (r.ok ? 'OK' : 'Error')}`);
    })
    .catch(console.error);
}

