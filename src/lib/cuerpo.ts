export type LecturaJson = { ok: true; cuerpo: Record<string, unknown> } | { ok: false; estado: 400 | 413 | 415; error: string };

/** Lee el JSON de una petición con límite de tamaño y comprobando el tipo de contenido. Nunca lanza. */
export async function leerJsonSeguro(request: Request, maxBytes = 64 * 1024): Promise<LecturaJson> {
  if (!(request.headers.get('content-type') ?? '').toLowerCase().includes('application/json')) return { ok: false, estado: 415, error: 'tipo_no_valido' };
  const declarado = Number(request.headers.get('content-length'));
  if (Number.isFinite(declarado) && declarado > maxBytes) return { ok: false, estado: 413, error: 'cuerpo_grande' };
  try {
    const texto = await request.text();
    if (new TextEncoder().encode(texto).length > maxBytes) return { ok: false, estado: 413, error: 'cuerpo_grande' };
    const json = JSON.parse(texto);
    if (json === null || typeof json !== 'object' || Array.isArray(json)) return { ok: false, estado: 400, error: 'json_invalido' };
    return { ok: true, cuerpo: json as Record<string, unknown> };
  } catch {
    return { ok: false, estado: 400, error: 'json_invalido' };
  }
}
