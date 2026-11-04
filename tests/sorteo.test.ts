import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asignar, ErrorSorteo, validarDatos, type Participante } from '../src/lib/sorteo.ts';

const gente = (n: number): Participante[] =>
  Array.from({ length: n }, (_, i) => ({ id: String(i), name: `P${i}`, email: `p${i}@ejemplo.com` }));
const base = (extra: Record<string, unknown> = {}) => ({ gameName: 'Oficina', participants: gente(4), exceptions: [], ...extra });

test('nadie se toca a sí mismo y cada persona recibe y regala una sola vez', () => {
  for (let i = 0; i < 200; i++) {
    const r = asignar(gente(6), []);
    assert.ok(r.every((a) => a.giver.id !== a.receiver.id));
    assert.equal(new Set(r.map((a) => a.receiver.id)).size, 6);
  }
});

test('respeta las excepciones', () => {
  for (let i = 0; i < 200; i++) {
    const r = asignar(gente(4), [{ from: '0', to: '1' }, { from: '1', to: '0' }]);
    assert.ok(!r.some((a) => a.giver.id === '0' && a.receiver.id === '1'));
    assert.ok(!r.some((a) => a.giver.id === '1' && a.receiver.id === '0'));
  }
});

test('avisa si las excepciones hacen imposible el sorteo', () => {
  const ex = [{ from: '0', to: '1' }, { from: '0', to: '2' }];
  assert.throws(() => asignar(gente(3), ex), (e) => e instanceof ErrorSorteo && e.codigo === 'sin_solucion');
});

test('rechaza menos de 3 y más de 40 participantes', () => {
  assert.throws(() => validarDatos(base({ participants: gente(2) })), /al menos 3/);
  assert.throws(() => validarDatos(base({ participants: gente(41) })), /máximo/);
});

test('rechaza correos inválidos o repetidos', () => {
  const malo = gente(3);
  malo[1].email = 'no-es-correo';
  assert.throws(() => validarDatos(base({ participants: malo })), /no es válido/);
  const dup = gente(3);
  dup[2].email = dup[0].email.toUpperCase();
  assert.throws(() => validarDatos(base({ participants: dup })), /repetido/);
});

test('normaliza el presupuesto vacío y descarta excepciones inválidas', () => {
  const d = validarDatos(base({ budget: '', exceptions: [{ from: '0', to: '0' }, { from: '9', to: '1' }, { from: '0', to: '1' }] }));
  assert.equal(d.budget, null);
  assert.deepEqual(d.exceptions, [{ from: '0', to: '1' }]);
});

test('rechaza presupuestos y fechas absurdos', () => {
  assert.throws(() => validarDatos(base({ budget: -3 })), /presupuesto/i);
  assert.throws(() => validarDatos(base({ eventDate: '25/12/2026' })), /fecha/i);
});
