/**
 * Genera las imágenes de vista previa (1200x630) de cada página en public/og/.
 * Uso: npm run og
 * Las imágenes se guardan en el repositorio, así que no hace falta ejecutarlo en cada build.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';
import { paginasOg, type PaginaOg } from '../src/data/og.ts';

const ANCHO = 1200;
const ALTO = 630;
const MARGEN = 90;
const ANCHO_TEXTO = 700;

const esc = (t: string) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Parte el texto en líneas de como mucho `max` caracteres, y añade «…» si sobran más de `maxLineas`. */
export function partir(texto: string, max: number, maxLineas: number): string[] {
  const lineas: string[] = [];
  let actual = '';
  for (const palabra of texto.split(/\s+/)) {
    if (actual && (actual + ' ' + palabra).length > max) { lineas.push(actual); actual = palabra; }
    else actual = actual ? `${actual} ${palabra}` : palabra;
  }
  if (actual) lineas.push(actual);
  if (lineas.length <= maxLineas) return lineas;
  const recorte = lineas.slice(0, maxLineas);
  recorte[maxLineas - 1] = recorte[maxLineas - 1].replace(/[\s.,;:]*$/, '') + '…';
  return recorte;
}

function svgDe(p: PaginaOg): string {
  const tam = p.titulo.length <= 34 ? 84 : p.titulo.length <= 52 ? 68 : 58;
  const titulo = partir(p.titulo, Math.floor(ANCHO_TEXTO / (tam * 0.5)), 3);
  const subtitulo = partir(p.subtitulo, 44, 3);
  const altoTitulo = tam * 1.12;
  const altoSub = 42;
  const total = 30 + 36 + titulo.length * altoTitulo + 24 + subtitulo.length * altoSub;
  let y = (ALTO - total) / 2 + 30;
  const etiqueta = `<text x="${MARGEN}" y="${y}" font-family="Liberation Sans, Arial, sans-serif" font-weight="700" font-size="30" letter-spacing="4" fill="#e9b44c">${esc(p.etiqueta)}</text>`;
  y += 36 + tam * 0.85;
  const lineasTitulo = titulo.map((l, i) => `<text x="${MARGEN}" y="${(y + i * altoTitulo).toFixed(0)}" font-family="Liberation Serif, Georgia, serif" font-weight="700" font-size="${tam}" fill="#ffffff">${esc(l)}</text>`).join('');
  y += (titulo.length - 1) * altoTitulo + 24 + 46;
  const lineasSub = subtitulo.map((l, i) => `<text x="${MARGEN}" y="${(y + i * altoSub).toFixed(0)}" font-family="Liberation Sans, Arial, sans-serif" font-size="32" fill="#ffe9d2">${esc(l)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
  <defs>
    <linearGradient id="fondo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b3262e"/><stop offset="1" stop-color="#5e1218"/></linearGradient>
    <pattern id="puntos" width="110" height="110" patternUnits="userSpaceOnUse"><circle cx="55" cy="55" r="3" fill="#ffffff" fill-opacity="0.35"/></pattern>
  </defs>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#fondo)"/>
  <rect width="${ANCHO}" height="${ALTO}" fill="url(#puntos)"/>
  ${etiqueta}${lineasTitulo}${lineasSub}
  <g transform="translate(850 170) scale(4.4)">
    <rect x="8" y="26" width="48" height="30" rx="5" fill="#fbe7b5"/>
    <rect x="5" y="19" width="54" height="11" rx="4" fill="#e9b44c"/>
    <rect x="28" y="19" width="8" height="37" fill="#b3262e"/>
    <path d="M32 19c-9-12-20-4-12 0zM32 19c9-12 20-4 12 0z" fill="none" stroke="#b3262e" stroke-width="4" stroke-linejoin="round"/>
  </g>
</svg>`;
}

const principal = process.argv[1]?.endsWith('generar-og.ts');
if (principal) {
  mkdirSync(new URL('../public/og/', import.meta.url), { recursive: true });
  for (const p of paginasOg()) {
    const png = await sharp(Buffer.from(svgDe(p))).png({ compressionLevel: 9 }).toBuffer();
    writeFileSync(new URL(`../public/og/${p.archivo}.png`, import.meta.url), png);
    console.log(`public/og/${p.archivo}.png`);
  }
}
