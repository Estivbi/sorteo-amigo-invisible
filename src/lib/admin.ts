import { createHash, timingSafeEqual } from 'node:crypto';

/** Compara el token recibido con el esperado en tiempo constante. Sin token configurado, nunca es válido. */
export function tokenValido(recibido: string | null | undefined, esperado: string): boolean {
  if (!esperado || !recibido) return false;
  const a = createHash('sha256').update(recibido).digest();
  const b = createHash('sha256').update(esperado).digest();
  return timingSafeEqual(a, b);
}

/** Extrae el token de una cabecera "Authorization: Bearer ...". */
export function tokenDeCabecera(cabecera: string | null): string | null {
  const m = /^Bearer\s+(.+)$/i.exec(cabecera ?? '');
  return m ? m[1].trim() : null;
}
