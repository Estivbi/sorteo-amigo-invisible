import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tokenDeCabecera, tokenValido } from '../src/lib/admin.ts';

test('solo acepta el token exacto y nunca sin token configurado', () => {
  assert.equal(tokenValido('secreto-largo', 'secreto-largo'), true);
  assert.equal(tokenValido('secreto-larg0', 'secreto-largo'), false);
  assert.equal(tokenValido('', 'secreto-largo'), false);
  assert.equal(tokenValido(null, 'secreto-largo'), false);
  assert.equal(tokenValido('cualquiera', ''), false, 'sin ADMIN_TOKEN configurado no entra nadie');
  assert.equal(tokenValido('', ''), false);
});

test('extrae el token de la cabecera Authorization', () => {
  assert.equal(tokenDeCabecera('Bearer abc123'), 'abc123');
  assert.equal(tokenDeCabecera('bearer   abc123  '), 'abc123');
  assert.equal(tokenDeCabecera('Basic abc'), null);
  assert.equal(tokenDeCabecera(null), null);
});
