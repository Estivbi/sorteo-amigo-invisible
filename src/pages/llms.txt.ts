import type { APIRoute } from 'astro';
import { landings } from '../data/landings';
import { generarLlmsTxt } from '../lib/seo';

export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const base = site!.toString();
  const paginas = [
    { titulo: 'Crear un sorteo', ruta: '/crear', descripcion: 'formulario para organizar el sorteo y enviar los correos.' },
    ...landings.map((l) => ({ titulo: l.nav, ruta: `/amigo-invisible/${l.slug}`, descripcion: l.resumen })),
    { titulo: 'Ideas de regalo', ruta: '/ideas-regalo', descripcion: 'ideas de regalo para el amigo invisible según el presupuesto: 5, 10, 20 y 30 euros.' },
    { titulo: 'Reglas del amigo invisible', ruta: '/reglas', descripcion: 'cómo funciona el juego y consejos para organizarlo bien.' },
  ];
  return new Response(generarLlmsTxt(base, paginas), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
