import nodemailer from "nodemailer";

// se reutiliza
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: import.meta.env.GMAIL_USER,
    pass: import.meta.env.GMAIL_PASS,
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
})

export async function POST({ request }) {
  // Esperamos recibir: { to, subject, body, recaptchaToken }
  const payload = await request.json();
  const { to, subject, body, recaptchaToken } = payload || {};

  // Verificar reCAPTCHA si está configurado
  const recaptchaSecret = import.meta.env.RECAPTCHA_SECRET;
  if (recaptchaSecret) {
    if (!recaptchaToken) {
      console.warn("send-email: missing recaptcha token");
      return new Response(JSON.stringify({ error: "missing_recaptcha" }), { status: 400 });
    }

    try {
      const params = new URLSearchParams();
      params.append('secret', recaptchaSecret);
      params.append('response', recaptchaToken);
      // opcional: remoteip
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const verifyJson = await verifyRes.json();
      // Para reCAPTCHA v3 se recomienda comprobar score (ej. >=0.5)
      if (!verifyJson.success || (typeof verifyJson.score === 'number' && verifyJson.score < 0.5)) {
        console.warn('reCAPTCHA verification failed', verifyJson);
        return new Response(JSON.stringify({ error: 'recaptcha_failed' }), { status: 401 });
      }
    } catch (err) {
      console.error('Error verificando recaptcha:', err);
      return new Response(JSON.stringify({ error: 'recaptcha_error' }), { status: 500 });
    }
  } else {
    // Si no está configurado, en entorno local avisamos y continuamos
    console.warn('RECAPTCHA_SECRET no configurado — se omite verificación (solo dev)');
  }

  if (!import.meta.env.GMAIL_USER || !import.meta.env.GMAIL_PASS) {
    console.warn('[dev] Simulando envío de correo');
    return new Response(JSON.stringify({ ok: true, dev: true }), { status: 200 });
  }

  try {
    await transporter.sendMail({
      from: import.meta.env.GMAIL_FROM,
      to,
      subject,
      text: body,
      replyTo: import.meta.env.GMAIL_REPLYTO,
    });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error('Error enviando correo:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}