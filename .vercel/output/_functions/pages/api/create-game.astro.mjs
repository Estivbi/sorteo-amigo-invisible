import nodemailer from 'nodemailer';
export { renderers } from '../../renderers.mjs';

const MIN_PARTICIPANTES = 3;
const MAX_PARTICIPANTES = 40;
class ErrorSorteo extends Error {
  constructor(codigo, mensaje) {
    super(mensaje);
    this.codigo = codigo;
  }
}
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const limpiar = (v, max) => typeof v === "string" ? v.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, max) : "";
function validarDatos(raw) {
  const d = raw ?? {};
  const gameName = limpiar(d.gameName, 80);
  if (!gameName) throw new ErrorSorteo("nombre_requerido", "Ponle un nombre al sorteo.");
  let budget = null;
  if (d.budget !== null && d.budget !== void 0 && d.budget !== "") {
    const n = Number(d.budget);
    if (!Number.isFinite(n) || n < 0 || n > 1e4) throw new ErrorSorteo("presupuesto_invalido", "El presupuesto no es válido.");
    budget = n > 0 ? n : null;
  }
  let eventDate = null;
  if (typeof d.eventDate === "string" && d.eventDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.eventDate) || Number.isNaN(Date.parse(d.eventDate))) {
      throw new ErrorSorteo("fecha_invalida", "La fecha del intercambio no es válida.");
    }
    eventDate = d.eventDate;
  }
  if (!Array.isArray(d.participants)) throw new ErrorSorteo("sin_participantes", "Añade a los participantes.");
  if (d.participants.length < MIN_PARTICIPANTES) {
    throw new ErrorSorteo("pocos_participantes", `Hacen falta al menos ${MIN_PARTICIPANTES} participantes.`);
  }
  if (d.participants.length > MAX_PARTICIPANTES) {
    throw new ErrorSorteo("demasiados_participantes", `El máximo es de ${MAX_PARTICIPANTES} participantes.`);
  }
  const vistos = /* @__PURE__ */ new Set();
  const participants = d.participants.map((p, i) => {
    const o = p ?? {};
    const name = limpiar(o.name, 60);
    const email = limpiar(o.email, 120).toLowerCase();
    if (!name) throw new ErrorSorteo("nombre_participante", `Falta el nombre del participante ${i + 1}.`);
    if (!EMAIL_RE.test(email)) throw new ErrorSorteo("email_invalido", `El correo de ${name} no es válido.`);
    if (vistos.has(email)) throw new ErrorSorteo("email_repetido", `El correo de ${name} está repetido.`);
    vistos.add(email);
    return { id: String(o.id ?? i), name, email, wishlist: limpiar(o.wishlist, 200) || void 0 };
  });
  const ids = new Set(participants.map((p) => p.id));
  if (ids.size !== participants.length) throw new ErrorSorteo("datos_invalidos", "Los datos del sorteo no son válidos.");
  const rawEx = Array.isArray(d.exceptions) ? d.exceptions.slice(0, 200) : [];
  const exceptions = rawEx.map((e) => ({ from: String(e?.from ?? ""), to: String(e?.to ?? "") })).filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);
  return { gameName, budget, eventDate, participants, exceptions };
}
function asignar(participants, exceptions, aleatorio = Math.random) {
  const prohibido = new Set(exceptions.map((e) => `${e.from}>${e.to}`));
  const intentosMax = 5e3;
  for (let intento = 0; intento < intentosMax; intento++) {
    const receptores = [...participants];
    for (let i = receptores.length - 1; i > 0; i--) {
      const j = Math.floor(aleatorio() * (i + 1));
      [receptores[i], receptores[j]] = [receptores[j], receptores[i]];
    }
    const ok = participants.every((g, i) => g.id !== receptores[i].id && !prohibido.has(`${g.id}>${receptores[i].id}`));
    if (ok) return participants.map((giver, i) => ({ giver, receiver: receptores[i] }));
  }
  throw new ErrorSorteo("sin_solucion", "Con esas excepciones no es posible hacer el sorteo. Quita alguna e inténtalo de nuevo.");
}

const __vite_import_meta_env__$1 = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://sorteo-amigo-invisible.vercel.app", "SSR": true};
const env$1 = (k) => (Object.assign(__vite_import_meta_env__$1, { _: process.env._ })[k] ?? process.env[k] ?? "").toString();
const escaparHtml = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const eur = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
const fechaLarga = (iso) => new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(`${iso}T00:00:00Z`));
function enlaceCalendario(juego) {
  if (!juego.eventDate) return null;
  const inicio = juego.eventDate.replace(/-/g, "");
  const fin = /* @__PURE__ */ new Date(`${juego.eventDate}T00:00:00Z`);
  fin.setUTCDate(fin.getUTCDate() + 1);
  const finTxt = fin.toISOString().slice(0, 10).replace(/-/g, "");
  const q = new URLSearchParams({ action: "TEMPLATE", text: `🎁 ${juego.gameName}`, dates: `${inicio}/${finTxt}` });
  return `https://calendar.google.com/calendar/render?${q}`;
}
function construirCorreo({ giver, receiver }, juego) {
  const lineas = [];
  const lineasHtml = [];
  const add = (txt, html2 = escaparHtml(txt)) => (lineas.push(txt), lineasHtml.push(`<li style="margin:6px 0">${html2}</li>`));
  if (juego.budget) add(`Presupuesto: ${eur(juego.budget)}`);
  if (juego.eventDate) add(`Fecha del intercambio: ${fechaLarga(juego.eventDate)}`);
  if (receiver.wishlist) add(`Ideas que ha pedido ${receiver.name}: ${receiver.wishlist}`);
  const cal = enlaceCalendario(juego);
  const text = [
    `Hola ${giver.name},`,
    "",
    `Has sido seleccionado/a para el amigo invisible "${juego.gameName}".`,
    "",
    `Te ha tocado regalar a: ${receiver.name}`,
    "",
    ...lineas.map((l) => `- ${l}`),
    ...cal ? ["", `Añadir al calendario: ${cal}`] : [],
    "",
    "Recuerda: es un secreto. ¡Feliz Navidad!"
  ].join("\n");
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
    ${lineasHtml.length ? `<ul style="padding-left:20px">${lineasHtml.join("")}</ul>` : ""}
    ${cal ? `<p style="text-align:center;margin:20px 0"><a href="${escaparHtml(cal)}" style="background:#1f5d46;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:bold">📅 Añadir al calendario</a></p>` : ""}
    <p style="color:#5f4a41;font-size:14px">Recuerda: es un secreto hasta el día del intercambio. ¡Feliz Navidad!</p>
  </div>
</div></body></html>`;
  return { to: giver.email, subject: `🎁 Tu amigo invisible: ${juego.gameName}`, text, html };
}
function proveedorActivo() {
  if (env$1("DEV_BYPASS_EMAILS").toLowerCase() === "true") return "simulado";
  if (env$1("RESEND_API_KEY") && env$1("MAIL_FROM")) return "resend";
  if (env$1("GMAIL_USER") && env$1("GMAIL_PASS")) return "gmail";
  return "simulado";
}
async function enviarResend(correos) {
  const replyTo = env$1("MAIL_REPLYTO") || void 0;
  const from = env$1("MAIL_FROM");
  for (let i = 0; i < correos.length; i += 100) {
    const lote = correos.slice(i, i + 100).map((c) => ({ from, to: [c.to], subject: c.subject, text: c.text, html: c.html, reply_to: replyTo }));
    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: { Authorization: `Bearer ${env$1("RESEND_API_KEY")}`, "Content-Type": "application/json" },
      body: JSON.stringify(lote)
    });
    if (!res.ok) throw new Error(`resend_${res.status}`);
  }
}
async function enviarGmail(correos) {
  const transporter = nodemailer.createTransport({ service: "gmail", auth: { user: env$1("GMAIL_USER"), pass: env$1("GMAIL_PASS") } });
  const from = env$1("MAIL_FROM") || env$1("GMAIL_USER");
  const replyTo = env$1("MAIL_REPLYTO") || void 0;
  const resultados = await Promise.allSettled(correos.map((c) => transporter.sendMail({ from, replyTo, to: c.to, subject: c.subject, text: c.text, html: c.html })));
  if (resultados.some((r) => r.status === "rejected")) throw new Error("gmail_error");
}
async function enviarCorreos(correos) {
  const proveedor = proveedorActivo();
  if (proveedor === "resend") await enviarResend(correos);
  else if (proveedor === "gmail") await enviarGmail(correos);
  return proveedor;
}

const VENTANA_MS = 10 * 60 * 1e3;
const MAX = 5;
const contadores = /* @__PURE__ */ new Map();
function permitido(ip, ahora = Date.now()) {
  for (const [k, v] of contadores) if (ahora - v.desde > VENTANA_MS) contadores.delete(k);
  const actual = contadores.get(ip);
  if (!actual || ahora - actual.desde > VENTANA_MS) {
    contadores.set(ip, { n: 1, desde: ahora });
    return true;
  }
  actual.n += 1;
  return actual.n <= MAX;
}

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://sorteo-amigo-invisible.vercel.app", "SSR": true};
const prerender = false;
const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
const env = (k) => (Object.assign(__vite_import_meta_env__, { _: process.env._ })[k] ?? process.env[k] ?? "").toString();
async function verificarRecaptcha(token) {
  const secreto = env("RECAPTCHA_SECRET");
  if (!secreto) return true;
  if (typeof token !== "string" || !token) return false;
  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secreto, response: token })
    });
    const r = await res.json();
    return Boolean(r.success) && (typeof r.score !== "number" || r.score >= 0.5);
  } catch {
    return false;
  }
}
function origenPermitido(request) {
  const permitidoEnv = env("ALLOWED_ORIGIN");
  if (!permitidoEnv) return true;
  const origen = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origen) return false;
  try {
    const host = new URL(origen).hostname;
    return host === permitidoEnv || host.endsWith(`.${permitidoEnv}`);
  } catch {
    return false;
  }
}
const POST = async ({ request, clientAddress }) => {
  if (!origenPermitido(request)) return json({ error: "origen_no_permitido", mensaje: "Origen no permitido." }, 403);
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || clientAddress || "desconocida";
  if (!permitido(ip)) return json({ error: "demasiadas_peticiones", mensaje: "Has hecho demasiados sorteos seguidos. Espera unos minutos." }, 429);
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "json_invalido", mensaje: "Petición no válida." }, 400);
  }
  if (cuerpo.website) return json({ ok: true, sent: 0 });
  if (!await verificarRecaptcha(cuerpo.recaptchaToken)) {
    return json({ error: "recaptcha", mensaje: "No hemos podido verificar que eres una persona. Recarga la página e inténtalo de nuevo." }, 403);
  }
  try {
    const juego = validarDatos(cuerpo);
    const asignaciones = asignar(juego.participants, juego.exceptions);
    const correos = asignaciones.map((a) => construirCorreo(a, juego));
    const proveedor = await enviarCorreos(correos);
    return json({ ok: true, sent: correos.length, simulado: proveedor === "simulado" });
  } catch (err) {
    if (err instanceof ErrorSorteo) return json({ error: err.codigo, mensaje: err.message }, err.codigo === "sin_solucion" ? 422 : 400);
    console.error("create-game: fallo al enviar", err instanceof Error ? err.message : "desconocido");
    return json({ error: "envio_fallido", mensaje: "No hemos podido enviar los correos. Inténtalo de nuevo en unos minutos." }, 502);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
