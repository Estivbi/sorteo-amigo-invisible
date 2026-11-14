import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emailValido, limpiarTexto, tieneEnlaces } from '../src/lib/texto.ts';

test('limpiarTexto quita controles, ceros de ancho y caracteres que invierten el texto, y recorta', () => {
  assert.equal(limpiarTexto('  Ana‮odnuf  ', 60), 'Anaodnuf');
  assert.equal(limpiarTexto('A​n​a﻿', 60), 'Ana');
  assert.equal(limpiarTexto('línea1\r\nlínea2\t', 60), 'línea1 línea2');
  assert.equal(limpiarTexto('uno   dos', 60), 'uno dos');
  assert.equal(limpiarTexto('abcdef', 3), 'abc');
  assert.equal(limpiarTexto(123, 10), '');
});

test('limpiarTexto respeta tildes, eñes y emojis normales', () => {
  assert.equal(limpiarTexto('Peña, ¡niño! café ☕', 60), 'Peña, ¡niño! café ☕');
});

test('tieneEnlaces detecta enlaces, dominios, correos y usuarios', () => {
  for (const malo of ['http://x.example/a', 'https://estafa.example', 'www.estafa.example', 'mira bit.ly/3xYz', 'entra en estafa.com', 'banco-seguro.es/login', 'escribe a ana@ejemplo.com', '@usuario', 'wa.me/34600000000', 't.me/canal', 'ftp://algo', 'EJEMPLO.COM']) {
    assert.equal(tieneEnlaces(malo), true, malo);
  }
});

test('tieneEnlaces no da falsos positivos en texto normal en español', () => {
  for (const bueno of ['Libros de misterio, café y calcetines', 'p.ej. una bufanda', 'etc. y más cosas', 'Nº 1.5 litros', 'el vino blanco. Gracias', 'Ana María', 'Juego de mesa (para 4)', '10,50 euros']) {
    assert.equal(tieneEnlaces(bueno), false, bueno);
  }
});

test('emailValido acepta direcciones normales, incluidas las de Gmail con +', () => {
  for (const ok of ['ana@ejemplo.com', 'Ana.Perez@Ejemplo.ES', 'ana+navidad@gmail.com', 'a_b-c%d@sub.dominio.co.uk', 'x@a-b.com']) assert.equal(emailValido(ok), true, ok);
});

test('emailValido rechaza lo que puede colar más de un destinatario o romper el formato', () => {
  for (const malo of ['a,b@ejemplo.com', 'a;b@ejemplo.com', 'a(b)@ejemplo.com', 'a\\b@ejemplo.com', 'a b@ejemplo.com', '"a"@ejemplo.com', '<a@ejemplo.com>', 'a@b@ejemplo.com', 'a@ejemplo', 'a@.com', '.a@ejemplo.com', 'a.@ejemplo.com', 'a..b@ejemplo.com', 'a@ejemplo..com', 'a@-ejemplo.com', 'ñandú@ejemplo.com', 'a@[127.0.0.1]', 'a@ejemplo.c', '', 'sin-arroba.com', `${'a'.repeat(65)}@ejemplo.com`, `a@${'b'.repeat(250)}.com`]) {
    assert.equal(emailValido(malo), false, malo);
  }
});
