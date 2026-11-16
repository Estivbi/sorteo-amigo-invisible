import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expandirExcepciones, leyendaExcepcion, siguienteModo, type FilaExcepcion } from '../src/lib/excepciones.ts';
import { asignar, ErrorSorteo } from '../src/lib/sorteo.ts';

const fila = (a: string, b: string, modo: FilaExcepcion['modo'] = 'ambos'): FilaExcepcion => ({ a, b, modo });

test('una fila en ambos sentidos genera las dos excepciones', () => {
  assert.deepEqual(expandirExcepciones([fila('1', '2')]), [{ from: '1', to: '2' }, { from: '2', to: '1' }]);
});

test('un solo sentido genera solo esa excepción: ida (a no regala a b) o vuelta (b no regala a a)', () => {
  assert.deepEqual(expandirExcepciones([fila('1', '2', 'ida')]), [{ from: '1', to: '2' }]);
  assert.deepEqual(expandirExcepciones([fila('1', '2', 'vuelta')]), [{ from: '2', to: '1' }]);
});

test('ignora filas incompletas o con la misma persona dos veces', () => {
  assert.deepEqual(expandirExcepciones([fila('', '2'), fila('1', ''), fila('3', '3'), fila('', '')]), []);
});

test('no repite excepciones cuando dos filas se solapan', () => {
  const r = expandirExcepciones([fila('1', '2'), fila('1', '2', 'ida'), fila('2', '1', 'ida')]);
  assert.equal(r.length, 2);
  assert.deepEqual(new Set(r.map((e) => `${e.from}>${e.to}`)), new Set(['1>2', '2>1']));
});

test('el modo cambia al pulsar la flecha: ambos, ida, vuelta y otra vez ambos', () => {
  assert.equal(siguienteModo('ambos'), 'ida');
  assert.equal(siguienteModo('ida'), 'vuelta');
  assert.equal(siguienteModo('vuelta'), 'ambos');
});

test('la leyenda explica en lenguaje llano qué significa cada sentido', () => {
  assert.equal(leyendaExcepcion(fila('1', '2', 'ambos'), 'Ana', 'Luis'), 'Ana y Luis no se regalarán entre sí.');
  assert.equal(leyendaExcepcion(fila('1', '2', 'ida'), 'Ana', 'Luis'), 'Ana no regalará a Luis, pero Luis sí podría regalar a Ana.');
  assert.equal(leyendaExcepcion(fila('1', '2', 'vuelta'), 'Ana', 'Luis'), 'Luis no regalará a Ana, pero Ana sí podría regalar a Luis.');
});

test('la leyenda pide elegir a las dos personas, distintas, cuando falta algo', () => {
  assert.match(leyendaExcepcion(fila('', '2'), '', 'Luis'), /Elige a las dos personas/);
  assert.match(leyendaExcepcion(fila('1', ''), 'Ana', ''), /Elige a las dos personas/);
  assert.match(leyendaExcepcion(fila('1', '1'), 'Ana', 'Ana'), /dos personas distintas/);
});

test('con tres personas, una pareja en ambos sentidos no tiene solución, y en un solo sentido sí', () => {
  const gente = ['1', '2', '3'].map((id) => ({ id, name: `P${id}`, email: `p${id}@ejemplo.com` }));
  assert.throws(() => asignar(gente, expandirExcepciones([fila('1', '2')])), (e) => e instanceof ErrorSorteo && e.codigo === 'sin_solucion');
  assert.equal(asignar(gente, expandirExcepciones([fila('1', '2', 'ida')])).length, 3);
});
