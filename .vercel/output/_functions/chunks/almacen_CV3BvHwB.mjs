const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": "https://sorteo-amigo-invisible.vercel.app", "SSR": true};
const env = (k) => (Object.assign(__vite_import_meta_env__, { _: process.env._ })[k] ?? process.env[k] ?? "").toString();
const json = (cuerpo, status = 200) => new Response(JSON.stringify(cuerpo), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });
function origenPermitido(request) {
  const permitido = env("ALLOWED_ORIGIN");
  if (!permitido) return true;
  const origen = request.headers.get("origin") ?? request.headers.get("referer");
  if (!origen) return false;
  try {
    const host = new URL(origen).hostname;
    return host === permitido || host.endsWith(`.${permitido}`);
  } catch {
    return false;
  }
}
const ipDe = (request, clientAddress) => request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || clientAddress || "desconocida";

const DIA = 86400;
const TTL_MIN = 7 * DIA;
const TTL_SIN_FECHA = 45 * DIA;
const TTL_MAX = 90 * DIA;
function ttlSegundos(eventDate, ahora = Date.now()) {
  if (!eventDate) return TTL_SIN_FECHA;
  const fin = Date.parse(`${eventDate}T00:00:00Z`) + 7 * DIA * 1e3;
  const segundos = Math.ceil((fin - ahora) / 1e3);
  return Math.min(TTL_MAX, Math.max(TTL_MIN, segundos));
}

const TOKEN_RE = /^[A-Za-z0-9_-]{22}$/;
const tokenValido = (t) => typeof t === "string" && TOKEN_RE.test(t);
function generarToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
const urlRedis = () => env("UPSTASH_REDIS_REST_URL") || env("KV_REST_API_URL");
const tokenRedis = () => env("UPSTASH_REDIS_REST_TOKEN") || env("KV_REST_API_TOKEN");
const enDesarrollo = () => Boolean(false);
const almacenDisponible = () => Boolean(urlRedis() && tokenRedis()) || enDesarrollo();
const memoria = /* @__PURE__ */ new Map();
const clave = (t) => `amigo:${t}`;
async function redis(comandos) {
  const res = await fetch(`${urlRedis()}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${tokenRedis()}`, "Content-Type": "application/json" },
    body: JSON.stringify(comandos)
  });
  if (!res.ok) throw new Error(`redis_${res.status}`);
  return await res.json();
}
async function guardarRegistros(registros, eventDate) {
  const ttl = ttlSegundos(eventDate);
  const entradas = Object.entries(registros);
  if (!urlRedis()) {
    for (const [t, r] of entradas) memoria.set(clave(t), { v: JSON.stringify(r), exp: Date.now() + ttl * 1e3 });
    return;
  }
  await redis(entradas.map(([t, r]) => ["SET", clave(t), JSON.stringify(r), "EX", ttl]));
}
async function leerRegistro(token) {
  if (!tokenValido(token)) return null;
  let crudo = null;
  if (!urlRedis()) {
    const e = memoria.get(clave(token));
    crudo = e && e.exp > Date.now() ? e.v : null;
  } else {
    const [r] = await redis([["GET", clave(token)]]);
    crudo = typeof r?.result === "string" ? r.result : null;
  }
  if (!crudo) return null;
  try {
    return JSON.parse(crudo);
  } catch {
    return null;
  }
}
async function actualizarLista(token, lista) {
  const actual = await leerRegistro(token);
  if (!actual) return false;
  const nuevo = JSON.stringify({ ...actual, w: lista });
  if (!urlRedis()) {
    const e = memoria.get(clave(token));
    if (e) memoria.set(clave(token), { ...e, v: nuevo });
    return true;
  }
  await redis([["SET", clave(token), nuevo, "KEEPTTL"]]);
  return true;
}

export { almacenDisponible as a, guardarRegistros as b, actualizarLista as c, env as e, generarToken as g, ipDe as i, json as j, leerRegistro as l, origenPermitido as o, tokenValido as t };
