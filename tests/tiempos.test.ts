import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearCronometro } from '../src/lib/tiempos.ts';

const reloj = (...instantes: number[]) => { let i = 0; return () => instantes[Math.min(i++, instantes.length - 1)]; };

test('cada paso mide el tiempo desde el anterior y se añade el total', () => {
  const c = crearCronometro(reloj(0, 120, 125, 500, 505));
  c.marca('captcha');
  c.marca('almacen');
  c.marca('correo');
  assert.equal(c.cabecera(), 'captcha;dur=120.0, almacen;dur=5.0, correo;dur=375.0, total;dur=505.0');
});

test('sin pasos, solo el total', () => {
  assert.equal(crearCronometro(reloj(10, 25)).cabecera(), 'total;dur=15.0');
});
