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

test('rechaza correos inválidos', () => {
  const malo = gente(3);
  malo[1].email = 'no-es-correo';
  assert.throws(() => validarDatos(base({ participants: malo })), /no es válido/);
});

test('permite que varios participantes compartan el mismo correo, sin distinguir mayúsculas', () => {
  const comparten = gente(4);
  comparten[2].email = comparten[0].email.toUpperCase();
  const d = validarDatos(base({ participants: comparten }));
  assert.equal(d.participants.length, 4);
  assert.equal(d.participants[2].email, comparten[0].email.toLowerCase());
  const asignaciones = asignar(d.participants, d.exceptions);
  assert.equal(asignaciones.length, 4);
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

test('rechaza enlaces en el nombre del sorteo, en los nombres y en las ideas de regalo', () => {
  const con = (campo: 'gameName' | 'name' | 'wishlist', valor: string) => {
    const p = gente(3);
    if (campo === 'gameName') return base({ gameName: valor });
    (p[0] as any)[campo] = valor;
    return base({ participants: p });
  };
  for (const [campo, valor] of [['gameName', 'Gana en www.estafa.example'], ['name', 'Entra en http://estafa.example'], ['wishlist', 'mira bit.ly/3xYz']] as const) {
    assert.throws(() => validarDatos(con(campo, valor)), (e) => e instanceof ErrorSorteo && e.codigo === 'enlaces_no_permitidos', campo);
  }
});

test('un correo con caracteres que pueden colar más destinatarios es inválido', () => {
  const p = gente(3);
  p[0].email = 'a,b@ejemplo.com';
  assert.throws(() => validarDatos(base({ participants: p })), /no es válido/);
});

test('el texto se limpia de caracteres invisibles antes de guardarse', () => {
  const p = gente(3);
  p[0].name = 'A​n‮a';
  assert.equal(validarDatos(base({ participants: p })).participants[0].name, 'Ana');
});

test('las ideas de regalo admiten enlaces https de tiendas, pero los nombres no', () => {
  const conLista = gente(3);
  conLista[0].wishlist = 'Un libro https://www.amazon.es/dp/B0123456 y café';
  const d = validarDatos(base({ participants: conLista }));
  assert.equal(d.participants[0].wishlist, 'Un libro https://www.amazon.es/dp/B0123456 y café');
  const conNombre = gente(3);
  conNombre[0].name = 'Ana https://tienda.example';
  assert.throws(() => validarDatos(base({ participants: conNombre })), (e) => e instanceof ErrorSorteo && e.codigo === 'enlaces_no_permitidos');
});

test('una lista con un enlace sospechoso se rechaza con un motivo claro', () => {
  const p = gente(3);
  p[0].wishlist = 'mira https://bit.ly/3xYz';
  assert.throws(() => validarDatos(base({ participants: p })), (e) => e instanceof ErrorSorteo && e.codigo === 'enlaces_no_permitidos' && /acort/i.test(e.message));
});
