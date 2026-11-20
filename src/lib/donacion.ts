/** Enlace de donación que se usa si no hay `PUBLIC_DONATE_URL` o si el valor no es válido. */
export const DONACION_POR_DEFECTO = 'https://ko-fi.com/amigoinvisiblestibios';

/**
 * Devuelve siempre una URL https absoluta.
 * Una URL sin esquema (`ko-fi.com/usuario`) se abriría como ruta de la propia web, así que se completa con https://.
 * Si el valor no sirve (vacío, `javascript:`, con usuario y contraseña, sin dominio...), se usa el enlace por defecto.
 */
export function urlDonacion(valor?: string | null): string {
  const v = (valor ?? '').trim();
  if (!v) return DONACION_POR_DEFECTO;
  const conEsquema = /^[a-z][a-z0-9+.-]*:/i.test(v) ? v : `https://${v.replace(/^\/+/, '')}`;
  try {
    const u = new URL(conEsquema);
    if (!/^https?:$/.test(u.protocol) || u.username || u.password || !u.hostname.includes('.')) return DONACION_POR_DEFECTO;
    u.protocol = 'https:';
    return u.href;
  } catch {
    return DONACION_POR_DEFECTO;
  }
}
