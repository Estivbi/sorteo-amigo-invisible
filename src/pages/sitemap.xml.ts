import type { APIRoute } from 'astro';
import { landings } from '../data/landings';

export const prerender = true;

const rutas = [
  { path: '/', prioridad: '1.0' },
  { path: '/crear', prioridad: '0.9' },
  ...landings.map((l) => ({ path: `/amigo-invisible/${l.slug}`, prioridad: '0.8' })),
  { path: '/ideas-regalo', prioridad: '0.7' },
  { path: '/reglas', prioridad: '0.6' },
  { path: '/privacidad', prioridad: '0.2' },
];

export const GET: APIRoute = ({ site }) => {
  const fecha = new Date().toISOString().slice(0, 10);
  const urls = rutas
    .map((r) => `  <url><loc>${new URL(r.path, site)}</loc><lastmod>${fecha}</lastmod><priority>${r.prioridad}</priority></url>`)
    .join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
