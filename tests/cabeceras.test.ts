import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const cabeceras = Object.fromEntries((config.headers?.[0]?.headers ?? []).map((h: { key: string; value: string }) => [h.key, h.value]));

test('todas las rutas llevan cabeceras de seguridad básicas', () => {
  assert.equal(config.headers[0].source, '/(.*)');
  assert.equal(cabeceras['X-Content-Type-Options'], 'nosniff');
  assert.equal(cabeceras['X-Frame-Options'], 'DENY');
  assert.equal(cabeceras['Referrer-Policy'], 'strict-origin-when-cross-origin');
  assert.match(cabeceras['Permissions-Policy'], /camera=\(\)/);
  assert.match(cabeceras['Permissions-Policy'], /geolocation=\(\)/);
});

test('se conserva la redirección del dominio antiguo', () => {
  assert.equal(config.redirects[0].destination, 'https://amigoinvisible.stibios.com/:path*');
});
