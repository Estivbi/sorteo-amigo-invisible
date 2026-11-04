/** Texto obligatorio de Amazon Afiliados (España). Se muestra siempre que haya enlaces de afiliado. */
export const AVISO_AMAZON = 'Como afiliado de Amazon, obtengo ingresos por las compras adscritas que cumplen los requisitos aplicables.';

/** Atributos de enlace que exige Google para enlaces de pago o afiliados, más seguridad al abrir pestaña nueva. */
export const REL_AFILIADO = 'sponsored nofollow noopener noreferrer';

/** Convierte la lista de deseos libre ("libros, café; calcetines") en términos de búsqueda sueltos. */
export function ideasDeLista(lista: string, max = 6): string[] {
  const vistos = new Set<string>();
  return lista
    .split(/[,;\n]+/)
    .map((s) => s.replace(/\s+/g, ' ').trim().slice(0, 60))
    .filter((s) => {
      const clave = s.toLowerCase();
      if (s.length < 2 || vistos.has(clave)) return false;
      vistos.add(clave);
      return true;
    })
    .slice(0, max);
}

/** Enlace de búsqueda de Amazon España con la etiqueta de afiliado. Devuelve null si no hay etiqueta o término. */
export function enlaceAmazon(consulta: string, tag: string | undefined): string | null {
  const q = consulta.replace(/\s+/g, ' ').trim().slice(0, 80);
  const etiqueta = (tag ?? '').trim();
  if (!q || !/^[A-Za-z0-9_-]{3,40}$/.test(etiqueta)) return null;
  return `https://www.amazon.es/s?${new URLSearchParams({ k: q, tag: etiqueta })}`;
}
