import { landings } from './landings.ts';
import { guias } from './guias.ts';

/** Una imagen de vista previa (Open Graph) por página, generada con scripts/generar-og.ts. */
export interface PaginaOg {
  /** Nombre del archivo sin extensión: se guarda en public/og/<archivo>.png. */
  archivo: string;
  etiqueta: string;
  titulo: string;
  subtitulo: string;
}

const capitalizar = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1);

export const rutaOg = (archivo: string): string => `/og/${archivo}.png`;

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

export function paginasOg(): PaginaOg[] {
  return [
    { archivo: 'crear', etiqueta: 'GRATIS · SIN REGISTRO', titulo: 'Crea tu sorteo de amigo invisible', subtitulo: 'Añade a los participantes y cada uno recibe su regalo secreto por email.' },
    { archivo: 'ideas-regalo', etiqueta: 'IDEAS DE REGALO', titulo: 'Ideas de regalo para el amigo invisible', subtitulo: 'Para 5, 10, 20 y 30 euros, según tu presupuesto.' },
    { archivo: 'reglas', etiqueta: 'CÓMO FUNCIONA', titulo: 'Reglas del amigo invisible', subtitulo: 'Todo lo que necesitas para organizar un sorteo perfecto.' },
    { archivo: 'privacidad', etiqueta: 'PRIVACIDAD', titulo: 'Tus datos, claros y por poco tiempo', subtitulo: 'No guardamos tu correo y borramos nombres y listas solos.' },
    { archivo: 'contacto', etiqueta: 'CONTACTO', titulo: 'Escríbenos', subtitulo: 'Dudas, errores o sugerencias sobre el amigo invisible.' },
    { archivo: 'guias', etiqueta: 'GUÍAS', titulo: 'Guías para organizar tu amigo invisible', subtitulo: 'Consejos prácticos para que todo salga bien.' },
    ...landings.map((l) => ({ archivo: l.slug, etiqueta: 'AMIGO INVISIBLE', titulo: l.h1, subtitulo: capitalizar(l.resumen) })),
    ...guias.map((g) => ({ archivo: `guia-${g.slug}`, etiqueta: 'GUÍA', titulo: g.h1, subtitulo: capitalizar(g.resumen) })),
  ];
}
