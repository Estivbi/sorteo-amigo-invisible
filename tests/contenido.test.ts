import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { guias, getGuia } from '../src/data/guias.ts';
import { landings } from '../src/data/landings.ts';
import { paginasOg, partir, rutaOg } from '../src/data/og.ts';
import { correoContacto, correoLegible } from '../src/data/contacto.ts';

test('las guías tienen slug único y títulos y descripciones con longitud útil para buscadores', () => {
  const slugs = guias.map((g) => g.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  for (const g of guias) {
    assert.match(g.slug, /^[a-z0-9-]+$/, g.slug);
    assert.ok(g.title.length <= 65, `título largo: ${g.slug}`);
    assert.ok(g.description.length >= 70 && g.description.length <= 170, `descripción: ${g.slug} (${g.description.length})`);
    assert.match(g.publicada, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(getGuia(g.slug), g);
  }
});

test('cada guía tiene secciones con contenido y al menos dos preguntas frecuentes', () => {
  for (const g of guias) {
    assert.ok(g.secciones.length >= 4, g.slug);
    for (const s of g.secciones) assert.ok((s.parrafos?.length ?? 0) + (s.lista?.length ?? 0) > 0, `${g.slug}: ${s.titulo}`);
    assert.ok(g.faq.length >= 2, g.slug);
  }
});

test('ninguna guía incluye enlaces ni direcciones de correo en el texto', () => {
  const texto = JSON.stringify(guias);
  assert.ok(!/https?:\/\//.test(texto));
  assert.ok(!/@/.test(texto));
});

test('cada landing y cada guía tiene su imagen Open Graph generada', () => {
  const archivos = paginasOg().map((p) => p.archivo);
  for (const l of landings) assert.ok(archivos.includes(l.slug), l.slug);
  for (const g of guias) assert.ok(archivos.includes(`guia-${g.slug}`), g.slug);
  for (const a of archivos) assert.ok(existsSync(new URL(`../public${rutaOg(a)}`, import.meta.url)), `falta public${rutaOg(a)}`);
  assert.equal(new Set(archivos).size, archivos.length, 'archivos duplicados');
});

test('partir reparte el texto en líneas y recorta con puntos suspensivos si sobra', () => {
  assert.deepEqual(partir('uno dos tres', 20, 3), ['uno dos tres']);
  assert.deepEqual(partir('uno dos tres cuatro', 8, 3), ['uno dos', 'tres', 'cuatro']);
  const largo = partir('aaaa bbbb cccc dddd eeee ffff', 9, 2);
  assert.equal(largo.length, 2);
  assert.ok(largo[1].endsWith('…'));
});

test('el correo de contacto se compone sin dejar el arroba en la versión legible', () => {
  assert.match(correoContacto(), /^[^@\s]+@[^@\s]+\.[a-z]+$/);
  assert.ok(!correoLegible().includes('@'));
});
