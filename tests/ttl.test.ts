import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ttlSegundos, TTL_MAX, TTL_MIN, TTL_SIN_FECHA } from '../src/lib/ttl.ts';

const DIA = 86400;
const ahora = Date.parse('2026-11-04T00:00:00Z');

test('sin fecha se conserva 45 días', () => assert.equal(ttlSegundos(null, ahora), TTL_SIN_FECHA));
test('con fecha caduca 7 días después del intercambio', () => assert.equal(ttlSegundos('2026-12-24', ahora), 57 * DIA));
test('fechas pasadas no bajan del mínimo', () => assert.equal(ttlSegundos('2020-01-01', ahora), TTL_MIN));
test('fechas lejanas no superan el máximo', () => assert.equal(ttlSegundos('2030-01-01', ahora), TTL_MAX));
