import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearContadoresMemoria } from '../src/lib/contadores.ts';
import { avisar, enviarTelegram } from '../src/lib/alertas.ts';

test('un aviso se envía una sola vez dentro de su ventana', async () => {
  const c = crearContadoresMemoria(); const enviados: string[] = [];
  const enviar = async (t: string) => { enviados.push(t); return true; };
  assert.equal(await avisar('error_envio', 'falló el envío', { contadores: c, enviar }), true);
  assert.equal(await avisar('error_envio', 'falló otra vez', { contadores: c, enviar }), false);
  assert.equal(enviados.length, 1);
  assert.equal(await avisar('bloqueo_ip', 'otro tipo', { contadores: c, enviar }), true, 'cada tipo tiene su propia ventana');
});

test('si el envío del aviso falla, no revienta y se puede reintentar', async () => {
  const c = crearContadoresMemoria(); let n = 0;
  const enviar = async () => { n++; if (n === 1) throw new Error('red'); return true; };
  assert.equal(await avisar('x', 't', { contadores: c, enviar }), false);
  assert.equal(await avisar('x', 't', { contadores: c, enviar }), true);
});

test('sin canal configurado no hace nada', async () => {
  assert.equal(await avisar('x', 't', { contadores: crearContadoresMemoria(), enviar: null }), false);
});

test('Telegram: envía el chat y el texto, y no filtra el token ni lanza errores', async () => {
  const llamadas: { url: string; cuerpo: any }[] = [];
  const f = (async (url: string, init: RequestInit) => { llamadas.push({ url, cuerpo: JSON.parse(String(init.body)) }); return { ok: true } as Response; }) as unknown as typeof fetch;
  assert.equal(await enviarTelegram('123:ABC', '42', 'hola', f), true);
  assert.equal(llamadas[0].url, 'https://api.telegram.org/bot123:ABC/sendMessage');
  assert.deepEqual(llamadas[0].cuerpo, { chat_id: '42', text: 'hola', disable_web_page_preview: true });
  const roto = (async () => { throw new Error('token 123:ABC inválido'); }) as unknown as typeof fetch;
  assert.equal(await enviarTelegram('123:ABC', '42', 'hola', roto), false);
  assert.equal(await enviarTelegram('', '42', 'hola', f), false);
});
