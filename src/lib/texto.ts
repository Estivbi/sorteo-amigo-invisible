/** Limpieza y comprobación del texto que escribe la gente: nombres, nombre del sorteo, ideas de regalo y correos. */

// Caracteres de formato que no se ven (ceros de ancho, RLO, LRE...): sirven para disfrazar texto y se eliminan.
const FORMATO = /[\u00ad\u061c\u180e\u200b-\u200f\u202a-\u202e\u2060-\u206f\ufeff\ufff9-\ufffb]/g;
// Controles y saltos de línea: se sustituyen por un espacio.
const CONTROLES = /[\u0000-\u001f\u007f-\u009f\u2028-\u2029]/g;

export function limpiarTexto(valor: unknown, max: number): string {
  if (typeof valor !== 'string') return '';
  return valor.replace(FORMATO, '').replace(CONTROLES, ' ').replace(/\s+/g, ' ').trim().slice(0, max).replace(/\s+$/, '');
}

const TLD = 'com|es|net|org|info|io|me|ly|xyz|top|ru|cn|co|app|dev|link|click|online|site|shop|store|biz|us|uk|de|fr|it|eu|tv|cc|ws|gl|tk|ml|ga|cf|gq|live|pro|club|vip|cat|gal|eus|ai|sh|to|be|nl|pt|mx|ar|cl|pe|ve|br';
const ENLACE = new RegExp(`(https?:|ftp:|www\\.|://|@|\\b[a-z0-9][a-z0-9-]*\\.(?:${TLD})\\b)`, 'i');

/** true si el texto lleva un enlace, un dominio, un correo o un usuario. No se admiten en campos que viajan por correo a terceros. */
export function tieneEnlaces(texto: string): boolean {
  return ENLACE.test(texto);
}

const PARTE_LOCAL = /^[a-z0-9._%+-]{1,64}$/;
const ETIQUETA = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

/** Validación estricta: solo ASCII y los caracteres habituales. Descarta lo que algunos sistemas de envío leerían como varios destinatarios. */
export function emailValido(email: string): boolean {
  if (typeof email !== 'string' || email.length > 254) return false;
  const partes = email.toLowerCase().split('@');
  if (partes.length !== 2) return false;
  const [local, dominio] = partes;
  if (!PARTE_LOCAL.test(local) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  const etiquetas = dominio.split('.');
  if (etiquetas.length < 2 || !etiquetas.every((e) => ETIQUETA.test(e))) return false;
  return /^[a-z]{2,24}$/.test(etiquetas[etiquetas.length - 1]);
}
