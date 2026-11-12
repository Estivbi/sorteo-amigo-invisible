export const env = (k: string): string => ((import.meta.env as Record<string, string | undefined>)[k] ?? process.env[k] ?? '').toString();

export const json = (cuerpo: Record<string, unknown>, status = 200, cabeceras: Record<string, string> = {}) =>
  new Response(JSON.stringify(cuerpo), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...cabeceras } });

export function origenPermitido(request: Request): boolean {
  const permitido = env('ALLOWED_ORIGIN');
  if (!permitido) return true;
  const origen = request.headers.get('origin') ?? request.headers.get('referer');
  if (!origen) return false;
  try {
    const host = new URL(origen).hostname;
    return host === permitido || host.endsWith(`.${permitido}`);
  } catch {
    return false;
  }
}

export const ipDe = (request: Request, clientAddress?: string) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'desconocida';
