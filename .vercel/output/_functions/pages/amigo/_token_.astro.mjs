import { e as createAstro, f as createComponent, k as renderComponent, l as renderScript, r as renderTemplate, m as maybeRenderHead, n as Fragment } from '../../chunks/astro/server_XfcpYWgO.mjs';
import 'piccolore';
import { $ as $$Layout, a as $$Icon } from '../../chunks/Layout_C6quVO2Q.mjs';
import { l as leerRegistro } from '../../chunks/almacen_CV3BvHwB.mjs';
export { renderers } from '../../renderers.mjs';

const $$Astro = createAstro("https://sorteo-amigo-invisible.vercel.app");
const prerender = false;
const $$token = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$token;
  Astro2.response.headers.set("Cache-Control", "private, no-store");
  let yo = null;
  let amigo = null;
  try {
    yo = await leerRegistro(Astro2.params.token ?? "");
    amigo = yo ? await leerRegistro(yo.r) : null;
  } catch {
    yo = null;
  }
  if (!yo) Astro2.response.status = 404;
  const eur = (n) => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(n);
  const fecha = (d) => new Intl.DateTimeFormat("es-ES", { dateStyle: "full", timeZone: "UTC" }).format(/* @__PURE__ */ new Date(`${d}T00:00:00Z`));
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Tu amigo invisible | Amigo Invisible", "description": "Tu p\xE1gina privada del amigo invisible.", "noindex": true, "privado": true }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<section class="section"> <div class="container narrow"> ${!yo ? renderTemplate`<div class="center"> ${renderComponent($$result2, "Icon", $$Icon, { "name": "lucide:snowflake", "class": "big-icon", "aria-hidden": "true" })} <h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">Este enlace ya no está activo</h1> <p class="lead">Los datos del sorteo se borran solos unos días después del intercambio. Si todavía lo necesitas, pide a quien lo organizó que repita el sorteo.</p> <p><a class="btn btn-primary btn-lg" href="/crear">Crear un sorteo nuevo</a></p> </div>` : renderTemplate`${renderComponent($$result2, "Fragment", Fragment, {}, { "default": async ($$result3) => renderTemplate` <div class="center"> <span class="eyebrow">${yo.g}</span> <h1 style="font-size:clamp(1.8rem,4vw,2.6rem)">Hola, ${yo.n}</h1> </div> <div class="card" style="margin:1.5rem 0"> <p class="label" style="margin-bottom:.2rem">Te toca regalar a</p> <p style="font-family:var(--font-display);font-size:2rem;font-weight:800;color:var(--red);margin:0 0 .6rem">${amigo?.n ?? "\u2026"}</p> <p style="margin:0"><strong>Sus ideas:</strong> ${amigo?.w ? amigo.w : "todav\xEDa no ha a\xF1adido ideas. Vuelve a mirar m\xE1s adelante."}</p> ${yo.b && renderTemplate`<p style="margin:.6rem 0 0"><strong>Presupuesto:</strong> ${eur(yo.b)}</p>`} ${yo.d && renderTemplate`<p style="margin:.3rem 0 0"><strong>Intercambio:</strong> ${fecha(yo.d)}</p>`} </div> <div class="card"> <h2 style="font-size:1.4rem">Tu lista de deseos</h2> <p class="hint">Escribe ideas para que tu amigo invisible acierte. Puedes cambiarla cuando quieras y la verá siempre actualizada.</p> <form id="lista-form" novalidate> <div class="field"> <label for="wishlist">Mis ideas de regalo</label> <textarea id="wishlist" name="wishlist" rows="3" maxlength="200" placeholder="Ej: libros de misterio, café, calcetines">${yo.w}</textarea> <small class="hint" style="margin:0"><span id="contador">${yo.w.length}</span>/200</small> </div> <button type="submit" class="btn btn-primary" id="guardar"> ${renderComponent($$result3, "Icon", $$Icon, { "name": "lucide:save", "aria-hidden": "true" })} Guardar mi lista
</button> <p id="estado" role="status" class="hint" style="margin:.8rem 0 0"></p> </form> </div> <p class="hint center" style="margin-top:1.2rem">Es tu enlace privado: no lo compartas. Se borra solo unos días después del intercambio.</p> ` })}`} </div> </section> ` })} ${renderScript($$result, "/home/user/sorteo-amigo-invisible/src/pages/amigo/[token].astro?astro&type=script&index=0&lang.ts")}`;
}, "/home/user/sorteo-amigo-invisible/src/pages/amigo/[token].astro", void 0);

const $$file = "/home/user/sorteo-amigo-invisible/src/pages/amigo/[token].astro";
const $$url = "/amigo/[token]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$token,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
