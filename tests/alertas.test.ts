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

test('el aviso de un sorteo nuevo solo lleva números, nunca nombres, correos ni el nombre del sorteo', async () => {
  const { textoNuevoSorteo } = await import('../src/lib/alertas.ts');
  const t = textoNuevoSorteo({ participantes: 10, usoHoy: 28, limite: 80, conFecha: true, conPresupuesto: false, excepciones: 2, simulado: false });
  assert.match(t, /Nuevo sorteo/);
  assert.match(t, /10 participantes/);
  assert.match(t, /28 de 80/);
  assert.match(t, /con fecha/i);
  assert.match(t, /2 excepciones/);
  assert.ok(!/@|http/.test(t), 'sin correos ni enlaces');
});

test('el aviso distingue un sorteo simulado y escribe bien el singular', async () => {
  const { textoNuevoSorteo } = await import('../src/lib/alertas.ts');
  assert.match(textoNuevoSorteo({ participantes: 3, usoHoy: 3, limite: 80, conFecha: false, conPresupuesto: true, excepciones: 1, simulado: true }), /simulado/i);
  const uno = textoNuevoSorteo({ participantes: 3, usoHoy: 3, limite: 80, conFecha: false, conPresupuesto: false, excepciones: 1, simulado: false });
  assert.match(uno, /1 excepción(?!es)/);
});

test('Telegram: se puede apuntar a otro servidor (para pruebas) sin cambiar nada más', async () => {
  const urls: string[] = [];
  const f = (async (url: string) => { urls.push(url); return { ok: true } as Response; }) as unknown as typeof fetch;
  assert.equal(await enviarTelegram('1:A', '2', 'x', f, 'http://localhost:4410/'), true);
  assert.equal(urls[0], 'http://localhost:4410/bot1:A/sendMessage');
});
