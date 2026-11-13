import type { APIRoute } from 'astro';
import { generarRobots } from '../lib/seo';

export const prerender = true;

export const GET: APIRoute = ({ site }) =>
  new Response(generarRobots(new URL('/sitemap.xml', site).toString()), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
