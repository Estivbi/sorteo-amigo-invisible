import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  INDEXNOW_KEY,
  DEFAULT_HOST,
  obtenerRutasIndexNow,
  construirPeticionIndexNow,
} from '../scripts/indexnow.ts';

test('la clave de IndexNow coincide con el archivo alojado en public/', () => {
  assert.equal(INDEXNOW_KEY.length, 32);
  const archivoClave = new URL(`../public/${INDEXNOW_KEY}.txt`, import.meta.url);
  assert.ok(existsSync(archivoClave), 'el archivo .txt de la clave debe existir en public/');
  const contenido = readFileSync(archivoClave, 'utf-8').trim();
  assert.equal(contenido, INDEXNOW_KEY);
});

test('construirPeticionIndexNow genera el formato estándar de IndexNow', () => {
  const req = construirPeticionIndexNow('mi-dominio.com');
  assert.equal(req.host, 'mi-dominio.com');
  assert.equal(req.key, INDEXNOW_KEY);
  assert.equal(req.keyLocation, `https://mi-dominio.com/${INDEXNOW_KEY}.txt`);
  assert.ok(req.urlList.length >= 10);
  assert.ok(req.urlList.includes('https://mi-dominio.com/'));
  assert.ok(req.urlList.includes('https://mi-dominio.com/crear'));
  assert.ok(req.urlList.includes('https://mi-dominio.com/guias'));
  assert.ok(req.urlList.includes('https://mi-dominio.com/contacto'));
});

test('todas las rutas de IndexNow son válidas y únicas', () => {
  const rutas = obtenerRutasIndexNow();
  assert.equal(new Set(rutas).size, rutas.length, 'rutas duplicadas');
  for (const r of rutas) {
    assert.ok(r.startsWith('/'), `ruta inválida: ${r}`);
  }
});

