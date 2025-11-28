import nodemailer from "nodemailer";

// Simple in-memory rate limiter (best-effort; serverless may not persist state)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window per IP
const ipMap = new Map();

function rateLimit(ip) {
  const now = Date.now();
  const entry = ipMap.get(ip) || { count: 0, first: now };
  if (now - entry.first > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.first = now;
  } else {
    entry.count += 1;
  }
  ipMap.set(ip, entry);
  return entry.count <= RATE_LIMIT_MAX;
}

function assignGivers(participants, exceptions) {
  const maxTries = 2000;
  function isValid(assignments) {
    for (const a of assignments) if (String(a.giver.id) === String(a.receiver.id)) return false;
    for (const ex of exceptions) {
      if (assignments.some(a => String(a.giver.id) === String(ex.from) && String(a.receiver.id) === String(ex.to))) {
        return false;
      }
    }
    return true;
  }
  for (let attempt = 0; attempt < maxTries; attempt++) {
    const receivers = [...participants];
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }
    const assignments = participants.map((giver, idx) => ({ giver, receiver: receivers[idx] }));
    if (isValid(assignments)) return assignments;
  }
  throw new Error("No se pudo asignar receptores válidos");
}

export async function POST({ request }) {
  // Basic protection: rate limit per IP and origin check
  const origin = request.headers.get("origin") || request.headers.get("referer") || "";
  const allowedOrigin = import.meta.env.ALLOWED_ORIGIN || "";
  if (allowedOrigin && origin && !origin.includes(allowedOrigin)) {
    return new Response(JSON.stringify({ error: "invalid_origin" }), { status: 401 });
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!rateLimit(ip)) {
    return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429 });
  }

  const payload = await request.json();
  const { gameName, budget, participants = [], exceptions = [], recaptchaToken } = payload || {};

  // Debug logging: indicate whether token was received (masked)
  try {
    console.log('create-game request from', origin, 'ip', ip, 'recaptchaToken?', !!recaptchaToken)
  } catch (e) {
    // ignore
  }

  // Verify reCAPTCHA if secret configured
  const recaptchaSecret = import.meta.env.RECAPTCHA_SECRET;
  if (recaptchaSecret) {
    if (!recaptchaToken) {
      return new Response(JSON.stringify({ error: 'missing_recaptcha' }), { status: 400 });
    }
    try {
      const params = new URLSearchParams();
      params.append('secret', recaptchaSecret);
      params.append('response', recaptchaToken);
      const verifyRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      const verifyJson = await verifyRes.json();
      if (!verifyJson.success || (typeof verifyJson.score === 'number' && verifyJson.score < 0.5)) {
        console.warn('reCAPTCHA failed', verifyJson);
        return new Response(JSON.stringify({ error: 'recaptcha_failed' }), { status: 401 });
      }
    } catch (err) {
      console.error('Error verifying reCAPTCHA:', err);
      return new Response(JSON.stringify({ error: 'recaptcha_error' }), { status: 500 });
    }
  } else {
    console.warn('RECAPTCHA_SECRET not configured — skipping verification (dev)');
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    return new Response(JSON.stringify({ error: "no_participants" }), { status: 400 });
  }

  // Validate minimal email structure
  for (const p of participants) {
    if (!p.email || !p.name) return new Response(JSON.stringify({ error: "invalid_participant" }), { status: 400 });
  }

  let assignments;
  try {
    assignments = assignGivers(participants, exceptions || []);
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }

  // If no GMAIL credentials, simulate success for dev
  // Development bypass: if DEV_BYPASS_EMAILS is set to 'true', skip real sending
  if (String(import.meta.env.DEV_BYPASS_EMAILS || '').toLowerCase() === 'true') {
    console.warn('DEV_BYPASS_EMAILS enabled — skipping real email sending (dev)')
    return new Response(JSON.stringify({ ok: true, sent: assignments.length, dev: true }), { status: 200 });
  }

  // If no GMAIL credentials, simulate success for dev
  if (!import.meta.env.GMAIL_USER || !import.meta.env.GMAIL_PASS) {
    console.warn('GMAIL_USER or GMAIL_PASS not configured — skipping real email sending (dev)')
    return new Response(JSON.stringify({ ok: true, sent: assignments.length, dev: true }), { status: 200 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: import.meta.env.GMAIL_USER,
      pass: import.meta.env.GMAIL_PASS,
    },
    pool: true,
    maxConnections: 5,
    maxMessages: 100,
  });

  try {
    await transporter.verify();
  } catch (err) {
    console.error('Nodemailer verify failed', err && err.message ? err.message : err)
    return new Response(JSON.stringify({ error: 'mail_transport_error', detail: err && err.message ? err.message : String(err) }), { status: 500 });
  }

    const sendPromises = assignments.map(({ giver, receiver }) => {
    const subject = "Tu asignación de Amigo Invisible";
    const body = `Hola ${giver.name},\n\n¡Has sido seleccionado para el juego "${gameName}"! 🎉\n\nTe ha tocado regalar a ${receiver.name}.\n\nPresupuesto: ${budget} euros.\n\n¡Feliz Amigo Invisible! 🎁`;
    // Force visible From header and SMTP envelope.from to prefer configured SMTP/GMAIL FROM values.
    const visibleFrom = import.meta.env.SMTP_FROM || import.meta.env.GMAIL_FROM || import.meta.env.GMAIL_USER;
    const envelopeFrom = import.meta.env.MAIL_ENVELOPE_FROM || import.meta.env.SMTP_FROM || import.meta.env.GMAIL_USER;
    return transporter.sendMail({
      from: visibleFrom,
      to: giver.email,
      subject,
      text: body,
      replyTo: import.meta.env.SMTP_REPLYTO || import.meta.env.GMAIL_REPLYTO,
      envelope: { from: envelopeFrom, to: giver.email },
    }).then(() => ({ ok: true, email: giver.email })).catch(error => ({ error: true, email: giver.email, message: error.message }));
  });

  let results;
  try {
    results = await Promise.all(sendPromises);
  } catch (err) {
    console.error('Error awaiting sendPromises', err)
    return new Response(JSON.stringify({ error: 'mail_send_error', detail: err && err.message ? err.message : String(err) }), { status: 500 });
  }
  const failures = results.filter(r => r.error);

  // Do not persist any participant data or assignments.

  if (failures.length > 0) {
    console.error('Mail send failures', failures)
    return new Response(JSON.stringify({ ok: false, sent: assignments.length - failures.length, failures }), { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, sent: assignments.length }), { status: 200 });
}
