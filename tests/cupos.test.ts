import { test } from 'node:test';
import assert from 'node:assert/strict';
import { crearContadoresMemoria } from '../src/lib/contadores.ts';
import { diaMadrid, huella, leerConfig, reservarCupo } from '../src/lib/cupos.ts';

const config = { globalDia: 10, porDestinatario: 2, porIpDia: 3 };
const gente = (n: number, desde = 0) => Array.from({ length: n }, (_, i) => ({ nombre: `P${desde + i}`, email: `p${desde + i}@ejemplo.com` }));
const base = (c: ReturnType<typeof crearContadoresMemoria>, extra = {}) => ({ contadores: c, config, secreto: 's', dia: '2026-11-13', ip: '203.0.113.7', ...extra });

test('la configuración lee las variables y usa valores por defecto razonables', () => {
  assert.deepEqual(leerConfig(() => ''), { globalDia: 80, porDestinatario: 15, porIpDia: 15 });
  assert.deepEqual(leerConfig((k) => ({ LIMITE_CORREOS_DIA: '50', LIMITE_POR_DESTINATARIO: '3', LIMITE_SORTEOS_IP_DIA: '4' })[k] ?? ''), { globalDia: 50, porDestinatario: 3, porIpDia: 4 });
  assert.deepEqual(leerConfig((k) => (k === 'LIMITE_CORREOS_DIA' ? 'abc' : '')).globalDia, 80, 'un valor inválido no rompe nada');
  assert.deepEqual(leerConfig((k) => (k === 'LIMITE_CORREOS_DIA' ? '-5' : '')).globalDia, 80, 'ni uno negativo');
});

test('el día se calcula con la hora de Madrid, no la de UTC', () => {
  assert.equal(diaMadrid(new Date('2026-11-13T23:30:00Z')), '2026-11-14'); // ya es 14 en Madrid (00:30)
  assert.equal(diaMadrid(new Date('2026-07-13T21:30:00Z')), '2026-07-13'); // verano: 23:30 del 13
});

test('la huella es estable, depende de la clave y no contiene el dato original', async () => {
  const a = await huella('Ana@Ejemplo.com', 'clave1');
  assert.equal(a, await huella('ana@ejemplo.com', 'clave1'), 'no distingue mayúsculas');
  assert.notEqual(a, await huella('ana@ejemplo.com', 'clave2'));
  assert.match(a, /^[0-9a-f]{32}$/);
  assert.ok(!a.includes('ana'));
});

test('un sorteo dentro de los límites reserva cupo y suma al contador global', async () => {
  const c = crearContadoresMemoria();
  const r = await reservarCupo({ ...base(c), destinatarios: gente(4) });
  assert.equal(r.ok, true);
  if (r.ok) assert.equal(r.usoGlobal, 4);
});

test('el tope global bloquea cuando el sorteo no cabe y no deja nada reservado', async () => {
  const c = crearContadoresMemoria();
  assert.equal((await reservarCupo({ ...base(c), destinatarios: gente(8) })).ok, true);
  const r = await reservarCupo({ ...base(c, { ip: '198.51.100.9' }), destinatarios: gente(4, 100) });
  assert.deepEqual(r, { ok: false, rechazo: { tipo: 'global' } });
  // al rechazar se devuelve lo reservado: un sorteo de 2 todavía cabe (8 + 2 = 10)
  assert.equal((await reservarCupo({ ...base(c, { ip: '198.51.100.9' }), destinatarios: gente(2, 200) })).ok, true);
});

test('el límite por destinatario bloquea y nombra a la persona', async () => {
  const c = crearContadoresMemoria();
  const mismos = gente(3);
  assert.equal((await reservarCupo({ ...base(c, { ip: '1.1.1.1' }), destinatarios: mismos })).ok, true);
  assert.equal((await reservarCupo({ ...base(c, { ip: '2.2.2.2' }), destinatarios: mismos })).ok, true);
  const r = await reservarCupo({ ...base(c, { ip: '3.3.3.3' }), destinatarios: mismos });
  assert.equal(r.ok, false);
  if (!r.ok) { assert.equal(r.rechazo.tipo, 'destinatario'); assert.match(r.rechazo.nombre ?? '', /^P\d$/); }
});

test('el límite por IP bloquea al cuarto sorteo del día', async () => {
  const c = crearContadoresMemoria();
  for (let i = 0; i < 3; i++) assert.equal((await reservarCupo({ ...base(c), destinatarios: gente(1, i * 10) })).ok, true);
  assert.deepEqual(await reservarCupo({ ...base(c), destinatarios: gente(1, 99) }), { ok: false, rechazo: { tipo: 'ip' } });
});

test('liberar devuelve el cupo si el envío falla', async () => {
  const c = crearContadoresMemoria();
  const r = await reservarCupo({ ...base(c), destinatarios: gente(10) });
  assert.equal(r.ok, true);
  if (r.ok) await r.liberar();
  assert.equal((await reservarCupo({ ...base(c), destinatarios: gente(10, 50) })).ok, true, 'el cupo volvió a estar libre');
});

test('al día siguiente los contadores empiezan de cero', async () => {
  const c = crearContadoresMemoria();
  assert.equal((await reservarCupo({ ...base(c), destinatarios: gente(10) })).ok, true);
  assert.equal((await reservarCupo({ ...base(c), destinatarios: gente(1, 70) })).ok, false);
  assert.equal((await reservarCupo({ ...base(c, { dia: '2026-11-14' }), destinatarios: gente(10, 80) })).ok, true);
});

test('las claves guardadas no contienen correos ni IP en claro', async () => {
  const c = crearContadoresMemoria();
  await reservarCupo({ ...base(c), destinatarios: gente(2) });
  const claves = c.claves().join('\n');
  assert.ok(!claves.includes('ejemplo.com') && !claves.includes('203.0.113.7'));
});

test('el contador permite leer el uso actual y los últimos días salen en orden', async () => {
  const c = crearContadoresMemoria();
  await reservarCupo({ ...base(c), destinatarios: gente(3) });
  assert.deepEqual(await c.leer(['cupo:global:2026-11-13', 'cupo:global:2026-11-12']), [3, 0]);
  const { ultimosDias } = await import('../src/lib/cupos.ts');
  assert.deepEqual(ultimosDias(3, new Date('2026-11-13T10:00:00Z')), ['2026-11-13', '2026-11-12', '2026-11-11']);
});
