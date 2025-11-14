import nodemailer from "nodemailer";

export async function POST({ request }) {
  const { to, subject, body } = await request.json();

  // Si no hay credenciales en entorno (modo desarrollo), no fallamos: devolvemos ok y logueamos
  const GMAIL_USER = import.meta.env.GMAIL_USER;
  const GMAIL_PASS = import.meta.env.GMAIL_PASS;
  const GMAIL_FROM = import.meta.env.GMAIL_FROM;
  const GMAIL_REPLYTO = import.meta.env.GMAIL_REPLYTO;

  if (!GMAIL_USER || !GMAIL_PASS || !GMAIL_FROM) {
    console.warn("[dev] Falta configuración de correo (GMAIL_...). Simulando envío de correo:", { to, subject, body });
    // En desarrollo devolvemos éxito para no bloquear el flujo
    return new Response(JSON.stringify({ ok: true, dev: true }), { status: 200 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: GMAIL_FROM,
      to,
      subject,
      text: body,
      replyTo: GMAIL_REPLYTO,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error("Error enviando correo:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}