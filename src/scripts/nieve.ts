/** Nieve ligera en canvas dentro de cada .hero-navidad. Se pausa fuera de pantalla y respeta prefers-reduced-motion. */
interface Copo { x: number; y: number; r: number; v: number; fase: number; vx: number }

function iniciar(hero: HTMLElement) {
  const canvas = document.createElement('canvas');
  canvas.className = 'nieve';
  canvas.setAttribute('aria-hidden', 'true');
  hero.prepend(canvas);
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0, h = 0, copos: Copo[] = [], raf = 0, visible = true;
  const nuevo = (arriba = false): Copo => ({
    x: Math.random() * w, y: arriba ? -10 : Math.random() * h,
    r: 1 + Math.random() * 2.6, v: 0.35 + Math.random() * 0.9, fase: Math.random() * Math.PI * 2, vx: (Math.random() - 0.5) * 0.3,
  });
  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth; h = hero.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.round(w / 14));
    copos = Array.from({ length: n }, () => nuevo());
  }
  function pintar(t: number) {
    ctx!.clearRect(0, 0, w, h);
    ctx!.fillStyle = 'rgba(255,255,255,0.85)';
    for (const c of copos) {
      c.y += c.v; c.x += c.vx + Math.sin(t / 1200 + c.fase) * 0.35;
      if (c.y > h + 10) Object.assign(c, nuevo(true));
      if (c.x > w + 10) c.x = -10; else if (c.x < -10) c.x = w + 10;
      ctx!.globalAlpha = 0.4 + c.r / 6;
      ctx!.beginPath(); ctx!.arc(c.x, c.y, c.r, 0, Math.PI * 2); ctx!.fill();
    }
    raf = requestAnimationFrame(pintar);
  }
  const arrancar = () => { if (!raf && visible && !document.hidden) raf = requestAnimationFrame(pintar); };
  const parar = () => { cancelAnimationFrame(raf); raf = 0; };

  medir();
  new ResizeObserver(medir).observe(hero);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? arrancar() : parar(); }).observe(hero);
  document.addEventListener('visibilitychange', () => (document.hidden ? parar() : arrancar()));
  arrancar();
}

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.querySelectorAll<HTMLElement>('.hero-navidad').forEach(iniciar);
}
