import { test } from 'node:test';
import assert from 'node:assert/strict';
import { leerJsonSeguro } from '../src/lib/cuerpo.ts';

const pedir = (cuerpo: string, tipo = 'application/json', extra: Record<string, string> = {}) =>
  new Request('https://ejemplo.com/api', { method: 'POST', headers: { 'content-type': tipo, ...extra }, body: cuerpo });

test('lee un JSON normal', async () => {
  assert.deepEqual(await leerJsonSeguro(pedir('{"a":1}'), 1000), { ok: true, cuerpo: { a: 1 } });
});

test('rechaza un tipo de contenido que no es JSON (415)', async () => {
  assert.deepEqual(await leerJsonSeguro(pedir('{"a":1}', 'text/plain'), 1000), { ok: false, estado: 415, error: 'tipo_no_valido' });
});

test('rechaza un cuerpo demasiado grande, aunque no declare su tamaño (413)', async () => {
  const grande = JSON.stringify({ x: 'a'.repeat(5000) });
  assert.deepEqual(await leerJsonSeguro(pedir(grande), 1000), { ok: false, estado: 413, error: 'cuerpo_grande' });
});

test('rechaza un tamaño declarado mayor que el máximo sin leer el cuerpo (413)', async () => {
  const r = await leerJsonSeguro(pedir('{}', 'application/json', { 'content-length': '999999' }), 1000);
  assert.deepEqual(r, { ok: false, estado: 413, error: 'cuerpo_grande' });
});

test('rechaza JSON roto, o que no sea un objeto (400)', async () => {
  for (const malo of ['{roto', '[1,2]', '"texto"', 'null', '']) {
    assert.deepEqual(await leerJsonSeguro(pedir(malo), 1000), { ok: false, estado: 400, error: 'json_invalido' }, malo);
  }
});
