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
  const { to, subject, body } = await request.json();

  if (!import.meta.env.GMAIL_USER || !import.meta.env.GMAIL_PASS) {
    console.warn("[dev] Simulando envío de correo");
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
    console.error("Error enviando correo:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}