import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RASTREADORES_IA, generarLlmsTxt, generarRobots } from '../src/lib/seo.ts';

test('robots.txt permite todo salvo las rutas privadas y apunta al sitemap', () => {
  const r = generarRobots('https://ejemplo.com/sitemap.xml');
  assert.ok(r.startsWith('User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /amigo/\nDisallow: /estadisticas'));
  assert.ok(r.includes('Sitemap: https://ejemplo.com/sitemap.xml'));
});

test('cada rastreador de IA está permitido y también respeta las rutas privadas', () => {
  const r = generarRobots('https://ejemplo.com/sitemap.xml');
  for (const n of RASTREADORES_IA) assert.ok(r.includes(`User-agent: ${n}\n`), n);
  const grupoIa = r.slice(r.indexOf('User-agent: GPTBot'));
  assert.ok(grupoIa.includes('Allow: /\nDisallow: /api/\nDisallow: /amigo/\nDisallow: /estadisticas'));
  assert.ok(!/Disallow: \/\s*$/m.test(r), 'ningún bloqueo total');
});

test('llms.txt sigue el formato: título, resumen y enlaces absolutos', () => {
  const t = generarLlmsTxt('https://ejemplo.com/', [{ titulo: 'Crear un sorteo', ruta: '/crear', descripcion: 'formulario.' }]);
  assert.ok(t.startsWith('# Amigo Invisible\n\n> '));
  assert.ok(t.includes('- [Crear un sorteo](https://ejemplo.com/crear): formulario.'));
  assert.ok(t.includes('(https://ejemplo.com/privacidad)'));
  assert.ok(t.includes('entre 3 y 40 participantes'));
});
