import { tieneEnlaces } from './texto.ts';

/** Longitud máxima de una lista de deseos: deja sitio para uno o dos enlaces largos de tienda. */
export const MAX_LISTA = 400;
export const MAX_ENLACES = 3;

/**
 * Acortadores y mensajería: esconden el destino real o abren conversaciones, y no sirven para una lista de regalos.
 * Los cortos de Amazon (amzn.to, amzn.eu, a.co) no están aquí a propósito: son habituales en listas de deseos.
 */
const BLOQUEADOS = [
  'bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'cutt.ly', 'is.gd', 'v.gd', 'ow.ly', 'buff.ly', 'rebrand.ly', 'shorturl.at',
  'tiny.cc', 'rb.gy', 'lnkd.in', 't.ly', 's.id', 'bl.ink', 'shorte.st', 'adf.ly',
  'wa.me', 'whatsapp.com', 't.me', 'telegram.me', 'discord.gg', 'linktr.ee',
];

const URL_EN_TEXTO = /https?:\/\/[^\s<>"']+/gi;
const PUNTUACION_FINAL = /[.,;:!?)\]}»”'"]+$/;
const ESQUEMAS_PELIGROSOS = /\b(?:javascript|data|vbscript|file|blob|mailto|tel|sms):/i;
const MSG_FORMATO = 'Los enlaces deben empezar por https://. No se admiten correos, usuarios ni direcciones sueltas.';

export type Trozo = { tipo: 'texto'; texto: string } | { tipo: 'enlace'; url: string; dominio: string };
export type Analisis = { ok: true; trozos: Trozo[] } | { ok: false; motivo: string };

type ResultadoUrl = { ok: true; url: string; dominio: string } | { ok: false; motivo: string };

function evaluarUrl(crudo: string): ResultadoUrl {
  let u: URL;
  try { u = new URL(crudo); } catch { return { ok: false, motivo: 'Hay un enlace que no es válido.' }; }
  if (u.protocol !== 'https:') return { ok: false, motivo: 'Los enlaces deben empezar por https://.' };
  if (u.username || u.password) return { ok: false, motivo: 'Los enlaces no pueden llevar usuario ni contraseña.' };
  if (u.port) return { ok: false, motivo: 'Los enlaces no pueden llevar un puerto.' };
  const host = u.hostname.toLowerCase();
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':') || host.startsWith('[')) return { ok: false, motivo: 'Los enlaces no pueden ser una dirección IP.' };
  const etiquetas = host.split('.');
  if (etiquetas.some((e) => e.startsWith('xn--'))) return { ok: false, motivo: 'Ese enlace usa un dominio con caracteres especiales que no admitimos.' };
  if (etiquetas.length < 2 || !/^[a-z]{2,24}$/.test(etiquetas[etiquetas.length - 1]) || !/^[a-z0-9.-]+$/.test(host)) return { ok: false, motivo: 'Hay un enlace que no es válido.' };
  if (BLOQUEADOS.some((b) => host === b || host.endsWith(`.${b}`))) return { ok: false, motivo: 'No se admiten acortadores ni enlaces de mensajería. Pega el enlace completo de la tienda.' };
  return { ok: true, url: u.href, dominio: host.replace(/^www\./, '') };
}

/** Separa el texto de la lista en trozos de texto y enlaces válidos, o explica por qué no se admite. */
export function analizarLista(texto: string): Analisis {
  const trozos: Trozo[] = [];
  let posicion = 0;
  let enlaces = 0;
  const añadirTexto = (t: string): string | null => {
    if (!t) return null;
    if (tieneEnlaces(t) || ESQUEMAS_PELIGROSOS.test(t)) return MSG_FORMATO;
    trozos.push({ tipo: 'texto', texto: t });
    return null;
  };

  for (const m of texto.matchAll(URL_EN_TEXTO)) {
    const inicio = m.index ?? 0;
    const crudo = m[0].replace(PUNTUACION_FINAL, '');
    const fallo = añadirTexto(texto.slice(posicion, inicio));
    if (fallo) return { ok: false, motivo: fallo };
    const r = evaluarUrl(crudo);
    if (!r.ok) return r;
    if (++enlaces > MAX_ENLACES) return { ok: false, motivo: `Puedes poner como mucho ${MAX_ENLACES} enlaces.` };
    trozos.push({ tipo: 'enlace', url: r.url, dominio: r.dominio });
    posicion = inicio + crudo.length;
  }
  const fallo = añadirTexto(texto.slice(posicion));
  if (fallo) return { ok: false, motivo: fallo };
  return { ok: true, trozos };
}

/** Para el correo: cada enlace se sustituye por su dominio. El enlace completo solo se ve en la página privada. */
export function resumirParaCorreo(texto: string): string {
  return texto.replace(URL_EN_TEXTO, (m) => {
    const r = evaluarUrl(m.replace(PUNTUACION_FINAL, ''));
    const resto = m.slice(m.replace(PUNTUACION_FINAL, '').length);
    return (r.ok ? `[enlace de ${r.dominio}]` : '[enlace]') + resto;
  });
}
