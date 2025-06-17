import nodemailer from "nodemailer";

export async function POST({ request }) {
  const { to, subject, body } = await request.json();

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: import.meta.env.GMAIL_USER,
      pass: import.meta.env.GMAIL_PASS
    }
  });

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
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}