const VENTANA_MS = 10 * 60 * 1e3;
const MAX = 5;
const contadores = /* @__PURE__ */ new Map();
function permitido(ip, max = MAX, ahora = Date.now()) {
  for (const [k, v] of contadores) if (ahora - v.desde > VENTANA_MS) contadores.delete(k);
  const actual = contadores.get(ip);
  if (!actual || ahora - actual.desde > VENTANA_MS) {
    contadores.set(ip, { n: 1, desde: ahora });
    return true;
  }
  actual.n += 1;
  return actual.n <= max;
}

export { permitido as p };
