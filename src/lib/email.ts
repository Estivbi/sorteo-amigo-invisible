import nodemailer from 'nodemailer';
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

export interface Correo {
  to: string;
  subject: string;
  text: string;
  html: string;
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
  ].join('\n');

  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#fff8ef;font-family:Arial,Helvetica,sans-serif;color:#2b1a14">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#b3262e;color:#fff;border-radius:16px 16px 0 0;padding:24px;text-align:center">
    <div style="font-size:42px">🎁</div>
    <h1 style="margin:8px 0 0;font-size:24px">Amigo invisible</h1>
    <p style="margin:6px 0 0;color:#ffe9d2">${escaparHtml(juego.gameName)}</p>
  </div>
  <div style="background:#fff;border:1px solid #ecd9c5;border-top:0;border-radius:0 0 16px 16px;padding:24px">
    <p>Hola <strong>${escaparHtml(giver.name)}</strong>,</p>
    <p>Te ha tocado regalar a:</p>
    <p style="font-size:28px;font-weight:bold;color:#b3262e;margin:8px 0 16px;text-align:center">${escaparHtml(receiver.name)}</p>
    ${lineasHtml.length ? `<ul style="padding-left:20px">${lineasHtml.join('')}</ul>` : ''}
    ${cal ? `<p style="text-align:center;margin:20px 0"><a href="${escaparHtml(cal)}" style="background:#1f5d46;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">📅 Añadir al calendario</a></p>` : ''}
    ${enlace ? `<p style="text-align:center;margin:20px 0"><a href="${escaparHtml(enlace)}" style="background:#b3262e;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">📝 Ver su lista y editar la mía</a></p><p style="color:#5f4a41;font-size:13px;text-align:center">Es tu enlace privado: no lo compartas. Caduca solo unos días después del intercambio.</p>` : ''}
    <p style="color:#5f4a41;font-size:14px">Recuerda: es un secreto hasta el día del intercambio. ¡Feliz Navidad!</p>
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
  const replyTo = env('MAIL_REPLYTO') || undefined;
  const from = env('MAIL_FROM');
  // La API por lotes admite hasta 100 correos por petición.
  for (let i = 0; i < correos.length; i += 100) {
    const lote = correos.slice(i, i + 100).map((c) => ({ from, to: [c.to], subject: c.subject, text: c.text, html: c.html, reply_to: replyTo }));
    const res = await fetch('https://api.resend.com/emails/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(lote),
    });
    if (!res.ok) throw new Error(`resend_${res.status}`);
  }
}

async function enviarGmail(correos: Correo[]): Promise<void> {
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user: env('GMAIL_USER'), pass: env('GMAIL_PASS') } });
  const from = env('MAIL_FROM') || env('GMAIL_USER');
  const replyTo = env('MAIL_REPLYTO') || undefined;
  const resultados = await Promise.allSettled(correos.map((c) => transporter.sendMail({ from, replyTo, to: c.to, subject: c.subject, text: c.text, html: c.html })));
  if (resultados.some((r) => r.status === 'rejected')) throw new Error('gmail_error');
}

/** Envía todos los correos con el proveedor configurado. Devuelve el proveedor usado. */
export async function enviarCorreos(correos: Correo[]): Promise<Proveedor> {
  const proveedor = proveedorActivo();
  if (proveedor === 'resend') await enviarResend(correos);
  else if (proveedor === 'gmail') await enviarGmail(correos);
  return proveedor;
}
