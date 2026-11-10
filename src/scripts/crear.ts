interface Participante { id: string; name: string; email: string; wishlist: string }
interface Excepcion { from: string; to: string }

const MIN = 3;
const MAX = 40;

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Record<string, unknown> = {}, ...hijos: (Node | string)[]) {
  const nodo = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') nodo.className = String(v);
    else if (k === 'text') nodo.textContent = String(v);
    else if (v === true) nodo.setAttribute(k, '');
    else if (v !== false && v != null) nodo.setAttribute(k, String(v));
  }
  hijos.forEach((h) => nodo.append(h));
  return nodo;
}

interface TurnstileApi {
  render(el: HTMLElement, opciones: Record<string, unknown>): string;
  execute(id: string): void;
  reset(id: string): void;
}
const turnstileGlobal = () => (window as unknown as { turnstile?: TurnstileApi }).turnstile;

let widgetId: string | null = null;
let esperando: { resolver(t: string): void; rechazar(e: Error): void } | null = null;

async function cargarTurnstile(): Promise<TurnstileApi> {
  if (!turnstileGlobal()) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('turnstile'));
      document.head.appendChild(s);
    });
  }
  const api = turnstileGlobal();
  if (!api) throw new Error('turnstile');
  return api;
}

/** Pide un token nuevo a Turnstile. Es invisible salvo que Cloudflare necesite que la persona confirme algo. */
async function obtenerTokenTurnstile(): Promise<string | null> {
  const siteKey = document.querySelector<HTMLMetaElement>('meta[name="turnstile-sitekey"]')?.content;
  if (!siteKey) return null;
  const api = await cargarTurnstile();
  const caja = document.getElementById('turnstile-box')!;
  if (widgetId === null) {
    widgetId = api.render(caja, {
      sitekey: siteKey,
      action: 'crear_sorteo',
      language: 'es',
      appearance: 'interaction-only',
      execution: 'execute',
      callback: (token: string) => esperando?.resolver(token),
      'error-callback': () => esperando?.rechazar(new Error('turnstile')),
      'timeout-callback': () => esperando?.rechazar(new Error('turnstile')),
    });
  } else {
    api.reset(widgetId); // cada token vale una sola vez
  }
  return new Promise<string>((resolver, rechazar) => {
    const limite = setTimeout(() => rechazar(new Error('turnstile')), 45000);
    esperando = { resolver: (t) => { clearTimeout(limite); resolver(t); }, rechazar: (e) => { clearTimeout(limite); rechazar(e); } };
    api.execute(widgetId!);
  });
}

export function iniciarFormulario() {
  const form = document.getElementById('create-game-form') as HTMLFormElement | null;
  if (!form) return;
  const listaP = document.getElementById('participants-list')!;
  const listaE = document.getElementById('exceptions-list')!;
  const errorBox = document.getElementById('form-error')!;
  const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
  const spinner = submitBtn.querySelector<HTMLElement>('.loading')!;
  const submitLabel = document.getElementById('submit-label')!;

  let contador = 0;
  const participantes: Participante[] = [];
  const excepciones: Excepcion[] = [];
  const nuevo = (): Participante => ({ id: String(contador++), name: '', email: '', wishlist: '' });

  const mostrarError = (msg: string) => {
    errorBox.textContent = msg;
    errorBox.hidden = false;
    errorBox.focus();
    errorBox.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  function campo(id: string, etiqueta: string, tipo: string, valor: string, extra: Record<string, unknown>, alCambiar: (v: string) => void) {
    const input = el('input', { id, type: tipo, value: valor, class: 'input w-full', ...extra });
    input.addEventListener('input', () => { alCambiar(input.value); input.removeAttribute('aria-invalid'); });
    return el('div', { class: 'mb-0 flex flex-col gap-1' }, el('label', { for: id, class: 'font-bold', text: etiqueta }), input);
  }

  function pintarParticipantes() {
    listaP.replaceChildren(
      ...participantes.map((p, i) => {
        const cabecera = el('div', { class: 'mb-3 flex items-center justify-between font-bold text-secondary' }, el('span', { text: `Participante ${i + 1}` }));
        if (participantes.length > MIN) {
          const quitar = el('button', { type: 'button', class: 'btn btn-ghost btn-sm min-h-11 sm:min-h-0', 'aria-label': `Quitar al participante ${i + 1}`, text: 'Quitar' });
          quitar.addEventListener('click', () => {
            participantes.splice(i, 1);
            for (let k = excepciones.length - 1; k >= 0; k--) if (excepciones[k].from === p.id || excepciones[k].to === p.id) excepciones.splice(k, 1);
            pintarParticipantes();
            pintarExcepciones();
          });
          cabecera.append(quitar);
        }
        return el(
          'div', { class: 'mb-3 rounded-box border border-base-300 bg-crema p-4' },
          cabecera,
          el('div', { class: 'mb-3 grid gap-3 sm:grid-cols-2' },
            campo(`p-name-${p.id}`, 'Nombre', 'text', p.name, { maxlength: 60, required: true, autocomplete: 'off', 'data-id': p.id, 'data-k': 'name' }, (v) => { p.name = v; actualizarNombresExcepciones(); }),
            campo(`p-email-${p.id}`, 'Correo', 'email', p.email, { maxlength: 120, required: true, autocomplete: 'off', inputmode: 'email', 'data-id': p.id, 'data-k': 'email' }, (v) => { p.email = v; }),
          ),
          campo(`p-wish-${p.id}`, 'Ideas de regalo (opcional)', 'text', p.wishlist, { maxlength: 200, placeholder: 'Ej: libros de misterio, café, calcetines', autocomplete: 'off' }, (v) => { p.wishlist = v; }),
        );
      }),
    );
    (document.getElementById('add-participant') as HTMLButtonElement).disabled = participantes.length >= MAX;
  }

  const opciones = (seleccion: string, vacio: string) => [
    el('option', { value: '', text: vacio }),
    ...participantes.map((p, i) => el('option', { value: p.id, selected: p.id === seleccion, text: p.name || `Participante ${i + 1}` })),
  ];

  function actualizarNombresExcepciones() {
    listaE.querySelectorAll('select').forEach((sel) => {
      const idx = Number(sel.dataset.idx);
      const cual = sel.dataset.k as keyof Excepcion;
      sel.replaceChildren(...opciones(excepciones[idx][cual], cual === 'from' ? 'Quién…' : 'A quién…'));
    });
  }

  function pintarExcepciones() {
    listaE.replaceChildren(
      ...excepciones.map((ex, idx) => {
        const mk = (k: keyof Excepcion, vacio: string, etiqueta: string) => {
          const sel = el('select', { class: 'select w-full sm:flex-1', 'aria-label': etiqueta, 'data-idx': idx, 'data-k': k }, ...opciones(ex[k], vacio));
          sel.addEventListener('change', () => { ex[k] = sel.value; });
          return sel;
        };
        const quitar = el('button', { type: 'button', class: 'btn btn-ghost btn-sm min-h-11 sm:min-h-0', 'aria-label': 'Quitar excepción', text: 'Quitar' });
        quitar.addEventListener('click', () => { excepciones.splice(idx, 1); pintarExcepciones(); });
        return el('div', { class: 'mb-3 flex flex-col gap-2 sm:flex-row sm:items-center' }, mk('from', 'Quién…', 'Quién no regala'), el('span', { class: 'text-tinta-suave', text: 'no regala a' }), mk('to', 'A quién…', 'A quién no regala'), quitar);
      }),
    );
  }

  document.getElementById('add-participant')!.addEventListener('click', () => {
    if (participantes.length >= MAX) return;
    participantes.push(nuevo());
    pintarParticipantes();
    pintarExcepciones();
    document.getElementById(`p-name-${participantes[participantes.length - 1].id}`)?.focus();
  });
  document.getElementById('add-exception')!.addEventListener('click', () => { excepciones.push({ from: '', to: '' }); pintarExcepciones(); });

  for (let i = 0; i < MIN; i++) participantes.push(nuevo());
  pintarParticipantes();

  function validar(): string | null {
    const nombre = (form!.elements.namedItem('gameName') as HTMLInputElement);
    if (!nombre.value.trim()) { nombre.setAttribute('aria-invalid', 'true'); nombre.focus(); return 'Ponle un nombre al sorteo.'; }
    const emails = new Set<string>();
    for (const p of participantes) {
      const n = document.getElementById(`p-name-${p.id}`) as HTMLInputElement;
      const e = document.getElementById(`p-email-${p.id}`) as HTMLInputElement;
      if (!p.name.trim()) { n.setAttribute('aria-invalid', 'true'); n.focus(); return 'Falta algún nombre.'; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(p.email.trim())) { e.setAttribute('aria-invalid', 'true'); e.focus(); return `El correo de ${p.name} no es válido.`; }
      const k = p.email.trim().toLowerCase();
      if (emails.has(k)) { e.setAttribute('aria-invalid', 'true'); e.focus(); return `El correo de ${p.name} está repetido.`; }
      emails.add(k);
    }
    return null;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    errorBox.hidden = true;
    const problema = validar();
    if (problema) return mostrarError(problema);

    submitBtn.disabled = true;
    spinner.hidden = false;
    submitLabel.textContent = 'Enviando correos…';
    try {
      let captchaToken: string | null = null;
      try { captchaToken = await obtenerTokenTurnstile(); } catch { /* el servidor decide si lo exige */ }
      const presupuesto = (form.elements.namedItem('budget') as HTMLInputElement).value;
      const res = await fetch('/api/create-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: (form.elements.namedItem('gameName') as HTMLInputElement).value,
          budget: presupuesto === '' ? null : Number(presupuesto),
          eventDate: (form.elements.namedItem('eventDate') as HTMLInputElement).value || null,
          website: (form.elements.namedItem('website') as HTMLInputElement).value,
          participants: participantes,
          exceptions: excepciones.filter((e) => e.from && e.to && e.from !== e.to),
          captchaToken,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { mensaje?: string; simulado?: boolean };
      if (!res.ok) throw new Error(data.mensaje || 'No hemos podido crear el sorteo. Inténtalo de nuevo.');

      const nombre = (form.elements.namedItem('gameName') as HTMLInputElement).value.trim();
      const ok = document.getElementById('success')!;
      if (data.simulado) document.getElementById('success-msg')!.textContent = 'Modo de pruebas: el sorteo se ha calculado pero no se ha enviado ningún correo.';
      const texto = `🎁 Ya está hecho el sorteo "${nombre}". Mirad vuestro correo (y el spam) para ver a quién os ha tocado. Hazlo tú también gratis: ${location.origin}`;
      (document.getElementById('share-wa') as HTMLAnchorElement).href = `https://wa.me/?text=${encodeURIComponent(texto)}`;
      form.hidden = true;
      ok.hidden = false;
      ok.focus();
      ok.scrollIntoView({ block: 'start', behavior: 'smooth' });
    } catch (e) {
      mostrarError(e instanceof Error ? e.message : 'Ha ocurrido un error. Inténtalo de nuevo.');
    } finally {
      submitBtn.disabled = false;
      spinner.hidden = true;
      submitLabel.textContent = 'Sortear y enviar correos';
    }
  });
}
