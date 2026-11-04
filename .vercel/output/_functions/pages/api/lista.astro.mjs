import { o as origenPermitido, j as json, i as ipDe, t as tokenValido, c as actualizarLista } from '../../chunks/almacen_CV3BvHwB.mjs';
import { p as permitido } from '../../chunks/limite_DLU5utPO.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request, clientAddress }) => {
  if (!origenPermitido(request)) return json({ error: "origen", mensaje: "Origen no permitido." }, 403);
  if (!permitido(`lista:${ipDe(request, clientAddress)}`, 30)) return json({ error: "limite", mensaje: "Demasiados cambios seguidos. Espera unos minutos." }, 429);
  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "json", mensaje: "Petición no válida." }, 400);
  }
  if (!tokenValido(cuerpo.token) || typeof cuerpo.wishlist !== "string") return json({ error: "datos", mensaje: "Datos no válidos." }, 400);
  const lista = cuerpo.wishlist.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);
  try {
    const ok = await actualizarLista(cuerpo.token, lista);
    if (!ok) return json({ error: "caducado", mensaje: "Este enlace ha caducado." }, 404);
    return json({ ok: true, wishlist: lista });
  } catch {
    return json({ error: "almacen", mensaje: "No hemos podido guardar los cambios. Inténtalo de nuevo." }, 502);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
