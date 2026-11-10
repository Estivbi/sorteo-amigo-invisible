import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ACCION_CREAR_SORTEO, URL_VERIFICACION, verificarTurnstile } from '../src/lib/turnstile.ts';

type Llamada = { url: string; cuerpo: URLSearchParams };
const falso = (respuesta: unknown, estado = 200) => {
  const llamadas: Llamada[] = [];
  const fn = (async (url: string, init: RequestInit) => {
    llamadas.push({ url, cuerpo: init.body as URLSearchParams });
    return { ok: estado >= 200 && estado < 300, json: async () => respuesta } as Response;
  }) as unknown as typeof fetch;
  return { fn, llamadas };
};

test('sin secreto y sin envío real, pasa (desarrollo o modo simulado)', async () => {
  const { fn, llamadas } = falso({});
  assert.deepEqual(await verificarTurnstile({ token: undefined, secret: '', exigido: false }, fn), { ok: true });
  assert.equal(llamadas.length, 0);
});

test('sin secreto pero con envío real, se rechaza: no hay relé de correo abierto', async () => {
  const r = await verificarTurnstile({ token: 'abc', secret: '', exigido: true }, falso({}).fn);
  assert.deepEqual(r, { ok: false, motivo: 'no_configurado' });
});

test('sin token, token vacío o gigante se rechaza sin llamar a Cloudflare', async () => {
  const { fn, llamadas } = falso({ success: true });
  for (const token of [undefined, null, '', 123, 'x'.repeat(2049)]) {
    assert.deepEqual(await verificarTurnstile({ token, secret: 's', exigido: true }, fn), { ok: false, motivo: 'sin_token' });
  }
  assert.equal(llamadas.length, 0);
});

test('token válido: envía secreto, token e IP a Cloudflare y acepta', async () => {
  const { fn, llamadas } = falso({ success: true, action: ACCION_CREAR_SORTEO });
  const r = await verificarTurnstile({ token: 'tok', secret: 'sec', ip: '203.0.113.7', exigido: true }, fn);
  assert.deepEqual(r, { ok: true });
  assert.equal(llamadas[0].url, URL_VERIFICACION);
  assert.equal(llamadas[0].cuerpo.get('secret'), 'sec');
  assert.equal(llamadas[0].cuerpo.get('response'), 'tok');
  assert.equal(llamadas[0].cuerpo.get('remoteip'), '203.0.113.7');
});

test('una IP rara no se envía a Cloudflare', async () => {
  const { fn, llamadas } = falso({ success: true });
  await verificarTurnstile({ token: 't', secret: 's', ip: 'desconocida', exigido: true }, fn);
  assert.equal(llamadas[0].cuerpo.has('remoteip'), false);
});

test('success distinto de true se rechaza', async () => {
  for (const respuesta of [{ success: false, 'error-codes': ['invalid-input-response'] }, {}, { success: 'true' }]) {
    assert.deepEqual(await verificarTurnstile({ token: 't', secret: 's', exigido: true }, falso(respuesta).fn), { ok: false, motivo: 'rechazado' });
  }
});

test('un token de otra acción se rechaza', async () => {
  const r = await verificarTurnstile({ token: 't', secret: 's', exigido: true }, falso({ success: true, action: 'otra_cosa' }).fn);
  assert.deepEqual(r, { ok: false, motivo: 'rechazado' });
});

test('si Cloudflare falla o no responde, se rechaza (fail closed)', async () => {
  assert.deepEqual(await verificarTurnstile({ token: 't', secret: 's', exigido: true }, falso({}, 500).fn), { ok: false, motivo: 'error' });
  const roto = (async () => { throw new Error('red'); }) as unknown as typeof fetch;
  assert.deepEqual(await verificarTurnstile({ token: 't', secret: 's', exigido: true }, roto), { ok: false, motivo: 'error' });
});
