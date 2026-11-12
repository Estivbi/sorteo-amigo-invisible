import type { Asignacion, DatosSorteo } from './sorteo';

const env = (k: string): string => ((import.meta.env as Record<string, string | undefined>)[k] ?? process.env[k] ?? '').toString();

export const escaparHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const eur = (n: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(n);
const fechaLarga = (iso: string) =>
  new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

function enlaceCalendario(juego: DatosSorteo): string | null {
  if (!juego.eventDate) return null;
  const inicio = juego.eventDate.replace(/-/g, '');
  const fin = new Date(`${juego.eventDate}T00:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() + 1);
  const finTxt = fin.toISOString().slice(0, 10).replace(/-/g, '');
  const q = new URLSearchParams({ action: 'TEMPLATE', text: `🎁 ${juego.gameName}`, dates: `${inicio}/${finTxt}` });
  return `https://calendar.google.com/calendar/render?${q}`;
}

/** Marca los correos como automáticos: los gestores de correo no devuelven respuestas automáticas (fuera de oficina, etc.). */
export const CABECERAS_AUTOMATICAS = { 'Auto-Submitted': 'auto-generated', 'X-Auto-Response-Suppress': 'All' };

/** Aviso al pie de cada correo: el sistema no tiene buzón de entrada. */
export const AVISO_NO_RESPONDER = 'Este correo se ha enviado automáticamente. Por favor, no respondas a este mensaje: nadie lo leerá.';

export interface Correo {
  to: string;
  subject: string;
  text: string;
  html: string;
}

/** Botón de correo "a prueba de móviles": el fondo va en una celda de tabla, así no se parte si el texto salta de línea. */
export function botonCorreo(url: string, texto: string, color: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:20px auto;max-width:100%"><tr><td align="center" bgcolor="${color}" style="background:${color};border-radius:24px"><a href="${escaparHtml(url)}" style="display:block;padding:14px 24px;color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:bold;text-decoration:none;border-radius:24px">${escaparHtml(texto)}</a></td></tr></table>`;
}

export function construirCorreo({ giver, receiver }: Asignacion, juego: DatosSorteo, enlace?: string): Correo {
  const lineas: string[] = [];
  const lineasHtml: string[] = [];
  const add = (txt: string, html = escaparHtml(txt)) => (lineas.push(txt), lineasHtml.push(`<li style="margin:6px 0">${html}</li>`));

  if (juego.budget) add(`Presupuesto: ${eur(juego.budget)}`);
  if (juego.eventDate) add(`Fecha del intercambio: ${fechaLarga(juego.eventDate)}`);
  if (receiver.wishlist) add(`Ideas que ha pedido ${receiver.name}: ${receiver.wishlist}`);
  const cal = enlaceCalendario(juego);

  const text = [
    `Hola ${giver.name},`,
    '',
    `Has sido seleccionado/a para el amigo invisible "${juego.gameName}".`,
    '',
    `Te ha tocado regalar a: ${receiver.name}`,
    '',
    ...lineas.map((l) => `- ${l}`),
    ...(cal ? ['', `Añadir al calendario: ${cal}`] : []),
    ...(enlace ? ['', `Tu enlace privado (ver la lista actualizada de ${receiver.name} y cambiar la tuya): ${enlace}`] : []),
    '',
    'Recuerda: es un secreto. ¡Feliz Navidad!',
    '',
    AVISO_NO_RESPONDER,
  ].join('\n');

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark"><title>Amigo invisible</title></head><body style="margin:0;background:#fff8ef;font-family:Arial,Helvetica,sans-serif;color:#2b1a14">
<div style="max-width:560px;margin:0 auto;padding:12px">
  <div style="background:#b3262e;color:#fff;border-radius:16px 16px 0 0;padding:24px;text-align:center">
    <div style="font-size:42px">🎁</div>
    <h1 style="margin:8px 0 0;font-size:24px">Amigo invisible</h1>
    <p style="margin:6px 0 0;color:#ffe9d2">${escaparHtml(juego.gameName)}</p>
  </div>
  <div style="background:#fff;border:1px solid #ecd9c5;border-top:0;border-radius:0 0 16px 16px;padding:20px 16px">
    <p>Hola <strong>${escaparHtml(giver.name)}</strong>,</p>
    <p>Te ha tocado regalar a:</p>
    <p style="font-size:28px;font-weight:bold;color:#b3262e;margin:8px 0 16px;text-align:center">${escaparHtml(receiver.name)}</p>
    ${lineasHtml.length ? `<ul style="padding-left:20px">${lineasHtml.join('')}</ul>` : ''}
    ${cal ? botonCorreo(cal, '📅 Añadir al calendario', '#1f5d46') : ''}
    ${enlace ? botonCorreo(enlace, '📝 Mi enlace privado', '#b3262e') + `<p style="color:#5f4a41;font-size:13px;text-align:center;margin:0 0 16px">Aquí ves la lista de ${escaparHtml(receiver.name)} y editas la tuya. No lo compartas: caduca unos días después del intercambio.</p>` : ''}
    <p style="color:#5f4a41;font-size:14px">Recuerda: es un secreto hasta el día del intercambio. ¡Feliz Navidad!</p>
    <p style="color:#5f4a41;font-size:12px;border-top:1px solid #ecd9c5;padding-top:12px;margin-bottom:0">${escaparHtml(AVISO_NO_RESPONDER)}</p>
  </div>
</div></body></html>`;

  return { to: giver.email, subject: `🎁 Tu amigo invisible: ${juego.gameName}`, text, html };
}

export type Proveedor = 'resend' | 'gmail' | 'simulado';

export function proveedorActivo(): Proveedor {
  if (env('DEV_BYPASS_EMAILS').toLowerCase() === 'true') return 'simulado';
  if (env('RESEND_API_KEY') && env('MAIL_FROM')) return 'resend';
  if (env('GMAIL_USER') && env('GMAIL_PASS')) return 'gmail';
  return 'simulado';
}

async function enviarResend(correos: Correo[]): Promise<void> {
  const from = env('MAIL_FROM');
  // La API por lotes admite hasta 100 correos por petición.
  for (let i = 0; i < correos.length; i += 100) {
    const lote = correos.slice(i, i + 100).map((c) => ({ from, to: [c.to], subject: c.subject, text: c.text, html: c.html, headers: CABECERAS_AUTOMATICAS }));
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(lote),
    });
    if (!res.ok) throw new Error(`resend_${res.status}`);
  }
}

async function enviarGmail(correos: Correo[]): Promise<void> {
  const { default: nodemailer } = await import('nodemailer'); // solo se carga si se usa Gmail
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: env('GMAIL_USER'), pass: env('GMAIL_PASS') } });
  const from = env('MAIL_FROM') || env('GMAIL_USER');
  const resultados = await Promise.allSettled(correos.map((c) => transporter.sendMail({ from, to: c.to, subject: c.subject, text: c.text, html: c.html, headers: CABECERAS_AUTOMATICAS })));
  if (resultados.some((r) => r.status === 'rejected')) throw new Error('gmail_error');
}

/** Envía todos los correos con el proveedor configurado. Devuelve el proveedor usado. */
export async function enviarCorreos(correos: Correo[]): Promise<Proveedor> {
  const proveedor = proveedorActivo();
  if (proveedor === 'resend') await enviarResend(correos);
  else if (proveedor === 'gmail') await enviarGmail(correos);
  return proveedor;
}
