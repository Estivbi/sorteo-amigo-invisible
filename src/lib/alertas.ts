import type { Contadores } from './contadores';

/** Envía un mensaje por Telegram. Nunca lanza errores ni deja el token en los mensajes de error. */
export async function enviarTelegram(token: string, chatId: string, texto: string, fetchFn: typeof fetch = fetch): Promise<boolean> {
  if (!token || !chatId) return false;
  try {
    const res = await fetchFn(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: texto, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(4000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

interface Dependencias {
  contadores: Contadores;
  /** Función que entrega el texto al canal de avisos, o null si no hay canal configurado. */
  enviar: ((texto: string) => Promise<boolean>) | null;
}

/**
 * Avisa como mucho una vez por tipo dentro de la ventana, para que un fallo repetido no inunde el canal.
 * Si el envío falla, libera la ventana para poder reintentar.
 */
export async function avisar(tipo: string, texto: string, { contadores, enviar }: Dependencias, ventanaSegundos = 3600): Promise<boolean> {
  if (!enviar) return false;
  const clave = `alerta:${tipo}`;
  try {
    if (!(await contadores.unaVez(clave, ventanaSegundos))) return false;
    let entregado = false;
    try { entregado = await enviar(texto); } catch { entregado = false; }
    if (!entregado) await contadores.olvidar(clave);
    return entregado;
  } catch {
    return false;
  }
}
