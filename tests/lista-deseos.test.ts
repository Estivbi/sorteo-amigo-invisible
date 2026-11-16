import { test } from 'node:test';
import assert from 'node:assert/strict';
import { analizarLista, resumirParaCorreo, MAX_LISTA } from '../src/lib/lista-deseos.ts';

const motivo = (t: string) => { const r = analizarLista(t); return r.ok ? null : r.motivo; };

test('acepta enlaces https de tiendas dentro de un texto y los separa del resto', () => {
  const r = analizarLista('Un libro https://www.amazon.es/dp/B0123456?psc=1 y café');
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.deepEqual(r.trozos.map((t) => t.tipo), ['texto', 'enlace', 'texto']);
    const e = r.trozos[1];
    assert.ok(e.tipo === 'enlace' && e.dominio === 'amazon.es' && e.url.startsWith('https://www.amazon.es/dp/B0123456'));
  }
});

test('acepta los enlaces cortos de Amazon, que son habituales en listas de deseos', () => {
  for (const url of ['https://amzn.to/3abcDEF', 'https://a.co/d/abc123', 'https://amzn.eu/d/xyz']) assert.equal(analizarLista(url).ok, true, url);
});

test('texto sin enlaces sigue siendo válido, y no da falsos positivos', () => {
  for (const t of ['', 'Libros de misterio, café y calcetines', 'p.ej. una bufanda', '10,50 euros', 'Nº 1.5 litros']) assert.equal(analizarLista(t).ok, true, t);
});

test('la puntuación pegada al final no forma parte del enlace', () => {
  const r = analizarLista('Mira https://www.zara.com/es/camisa, y también esto.');
  assert.equal(r.ok, true);
  if (r.ok) {
    const e = r.trozos.find((t) => t.tipo === 'enlace');
    assert.ok(e && e.tipo === 'enlace' && !e.url.endsWith(','));
  }
});

test('rechaza enlaces que no empiezan por https://, dominios sueltos, correos y usuarios', () => {
  for (const malo of ['http://tienda.example/a', 'ftp://algo', 'www.estafa.example', 'amazon.es/dp/123', 'escribe a ana@ejemplo.com', '@usuario', 'javascript:alert(1)', 'data:text/html;base64,AAAA', 'mailto:a@b.com']) {
    assert.notEqual(motivo(malo), null, malo);
  }
});

test('rechaza acortadores genéricos y enlaces de mensajería, que esconden el destino', () => {
  for (const malo of ['https://bit.ly/3xYz', 'https://tinyurl.com/abc', 'https://t.co/abc', 'https://goo.gl/abc', 'https://cutt.ly/abc', 'https://wa.me/34600000000', 'https://t.me/canal', 'https://sub.bit.ly/abc']) {
    assert.notEqual(motivo(malo), null, malo);
  }
});

test('rechaza direcciones IP, credenciales en la URL, puertos, dominios con punycode y hosts sin punto', () => {
  for (const malo of ['https://192.168.1.10/a', 'https://[::1]/a', 'https://usuario:clave@tienda.example/a', 'https://tienda.example:8443/a', 'https://xn--amazon-5ya.es/a', 'https://localhost/a', 'https://tienda/a']) {
    assert.notEqual(motivo(malo), null, malo);
  }
});

test('admite como mucho 3 enlaces', () => {
  const u = (n: number) => `https://tienda${n}.example/a`;
  assert.equal(analizarLista(`${u(1)} ${u(2)} ${u(3)}`).ok, true);
  assert.match(motivo(`${u(1)} ${u(2)} ${u(3)} ${u(4)}`) ?? '', /3 enlaces/);
});

test('el límite de la lista deja sitio para un enlace largo de una tienda', () => {
  assert.ok(MAX_LISTA >= 300);
});

test('para el correo, cada enlace se sustituye por su dominio y el enlace completo no sale', () => {
  const r = resumirParaCorreo('libro https://www.amazon.es/dp/B0123?tag=otro y café');
  assert.equal(r, 'libro [enlace de amazon.es] y café');
  assert.ok(!r.includes('http'));
  assert.equal(resumirParaCorreo('solo texto'), 'solo texto');
});
