import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AVISO_NO_RESPONDER, CABECERAS_AUTOMATICAS, construirCorreo, escaparHtml } from '../src/lib/email.ts';
import type { DatosSorteo, Participante } from '../src/lib/sorteo.ts';

const ana: Participante = { id: '0', name: 'Ana', email: 'ana@ejemplo.com' };
const beto: Participante = { id: '1', name: 'Beto <b>', email: 'beto@ejemplo.com', wishlist: 'libros & café' };
const juego: DatosSorteo = { gameName: 'Oficina "2026"', budget: 20, eventDate: '2026-12-23', participants: [ana, beto], exceptions: [] };

test('el correo avisa de que no se puede responder, en texto y en HTML', () => {
  const c = construirCorreo({ giver: ana, receiver: beto }, juego);
  assert.ok(c.text.includes(AVISO_NO_RESPONDER));
  assert.ok(c.html.includes(AVISO_NO_RESPONDER));
});

test('el correo no define Reply-To y las cabeceras lo marcan como automático', () => {
  const c = construirCorreo({ giver: ana, receiver: beto }, juego) as unknown as Record<string, unknown>;
  assert.ok(!('replyTo' in c) && !('reply_to' in c));
  assert.equal(CABECERAS_AUTOMATICAS['Auto-Submitted'], 'auto-generated');
  assert.equal(CABECERAS_AUTOMATICAS['X-Auto-Response-Suppress'], 'All');
});

test('los datos del usuario se escapan en el HTML', () => {
  const c = construirCorreo({ giver: ana, receiver: beto }, juego);
  assert.ok(!c.html.includes('<b>'));
  assert.ok(c.html.includes('Beto &lt;b&gt;'));
  assert.ok(c.html.includes('Oficina &quot;2026&quot;'));
  assert.equal(escaparHtml(`<a href="x">&'`), '&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
});

test('el enlace privado solo aparece si se pasa, y lleva el botón en HTML', () => {
  const sin = construirCorreo({ giver: ana, receiver: beto }, juego);
  assert.ok(!sin.text.includes('enlace privado'));
  const con = construirCorreo({ giver: ana, receiver: beto }, juego, 'https://ejemplo.com/amigo/abc');
  assert.ok(con.text.includes('https://ejemplo.com/amigo/abc'));
  assert.ok(con.html.includes('href="https://ejemplo.com/amigo/abc"'));
});

test('incluye presupuesto, fecha y la lista del amigo invisible', () => {
  const c = construirCorreo({ giver: ana, receiver: beto }, juego);
  assert.ok(c.text.includes('Presupuesto: 20'));
  assert.ok(c.text.includes('23 de diciembre de 2026'));
  assert.ok(c.text.includes('libros & café'));
});

test('los botones son de tabla, con el fondo en la celda, y no se parten en móviles estrechos', () => {
  const c = construirCorreo({ giver: ana, receiver: beto }, juego, 'https://ejemplo.com/amigo/abc');
  assert.ok(c.html.includes('<table role="presentation"'));
  assert.ok(c.html.includes('bgcolor="#b3262e"'));
  assert.ok(c.html.includes('bgcolor="#1f5d46"'));
  assert.ok(!c.html.includes('border-radius:999px'), 'sin enlaces en línea con relleno redondeado');
  assert.ok(c.html.includes('Mi enlace privado'));
});

test('declara soporte de modo claro y oscuro', () => {
  const c = construirCorreo({ giver: ana, receiver: beto }, juego);
  assert.ok(c.html.includes('<meta name="color-scheme" content="light dark">'));
});
