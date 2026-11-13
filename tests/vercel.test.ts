import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
const regla = config.redirects[0];
const host = new RegExp(`^${regla.has[0].value}$`);

test('el dominio antiguo de vercel.app se redirige de forma permanente al dominio nuevo, conservando la ruta', () => {
  assert.equal(regla.permanent, true);
  assert.equal(regla.source, '/:path*');
  assert.equal(regla.destination, 'https://amigoinvisible.stibios.com/:path*');
  assert.ok(host.test('sorteo-amigo-invisible.vercel.app'));
});

test('la regla no afecta al dominio nuevo ni a las URL de vista previa', () => {
  assert.ok(!host.test('amigoinvisible.stibios.com'), 'sin bucle de redirección');
  assert.ok(!host.test('sorteo-amigo-invisible-git-master-estivbis-projects.vercel.app'));
  assert.ok(!host.test('sorteo-amigo-invisible-abc123-estivbis-projects.vercel.app'));
  assert.ok(!host.test('sorteoXamigo-invisible.vercel.app'), 'el punto está escapado');
});
