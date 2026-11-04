import { test } from 'node:test';
import assert from 'node:assert/strict';
import { enlaceAmazon, ideasDeLista } from '../src/lib/afiliados.ts';

test('el enlace de Amazon lleva la etiqueta y la búsqueda codificada', () => {
  const u = new URL(enlaceAmazon('libros de misterio', 'miweb-21')!);
  assert.equal(u.hostname, 'www.amazon.es');
  assert.equal(u.searchParams.get('k'), 'libros de misterio');
  assert.equal(u.searchParams.get('tag'), 'miweb-21');
});

test('sin etiqueta válida o sin término no hay enlace', () => {
  assert.equal(enlaceAmazon('café', undefined), null);
  assert.equal(enlaceAmazon('café', ''), null);
  assert.equal(enlaceAmazon('café', 'mala etiqueta&x=1'), null);
  assert.equal(enlaceAmazon('   ', 'miweb-21'), null);
});

test('no se puede colar otro parámetro desde la lista de deseos', () => {
  const u = new URL(enlaceAmazon('café&tag=otro&x=1', 'miweb-21')!);
  assert.equal(u.searchParams.get('tag'), 'miweb-21');
  assert.equal(u.searchParams.get('x'), null);
});

test('separa ideas por comas, punto y coma y saltos de línea, sin repetir', () => {
  assert.deepEqual(ideasDeLista('Libros, café; Calcetines\nlibros , '), ['Libros', 'café', 'Calcetines']);
  assert.equal(ideasDeLista('a1,b2,c3,d4,e5,f6,g7,h8').length, 6);
  assert.deepEqual(ideasDeLista(''), []);
});
