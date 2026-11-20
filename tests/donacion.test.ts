import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DONACION_POR_DEFECTO, urlDonacion } from '../src/lib/donacion.ts';

test('una URL sin https:// se completa, para que no se abra como ruta de la propia web', () => {
  assert.equal(urlDonacion('ko-fi.com/amigoinvisiblestibios'), 'https://ko-fi.com/amigoinvisiblestibios');
  assert.equal(urlDonacion('www.buymeacoffee.com/alguien'), 'https://www.buymeacoffee.com/alguien');
  assert.equal(urlDonacion('paypal.me/alguien'), 'https://paypal.me/alguien');
  assert.equal(urlDonacion('//ko-fi.com/alguien'), 'https://ko-fi.com/alguien');
});

test('una URL completa se respeta, con espacios alrededor y pasando http a https', () => {
  assert.equal(urlDonacion('https://ko-fi.com/alguien'), 'https://ko-fi.com/alguien');
  assert.equal(urlDonacion('  https://ko-fi.com/alguien  '), 'https://ko-fi.com/alguien');
  assert.equal(urlDonacion('http://ko-fi.com/alguien'), 'https://ko-fi.com/alguien');
});

test('sin valor o con un valor no válido se usa el enlace por defecto', () => {
  for (const malo of [undefined, null, '', '   ', 'javascript:alert(1)', 'data:text/html,hola', 'ftp://ko-fi.com/x', 'https://usuario:clave@ko-fi.com/x', 'localhost', 'https://tienda', 'no es una url']) {
    assert.equal(urlDonacion(malo), DONACION_POR_DEFECTO, String(malo));
  }
});

test('el enlace por defecto es un https absoluto de Ko-fi', () => {
  assert.match(DONACION_POR_DEFECTO, /^https:\/\/ko-fi\.com\/[A-Za-z0-9_]+$/);
});
