/**
 * Menú móvil con animación de apertura y cierre.
 * <details> se cierra al instante, así que el cierre se retrasa lo que dura la animación de salida.
 */
const menu = document.getElementById('menu-movil') as HTMLDetailsElement | null;
if (menu) {
  const panel = menu.querySelector<HTMLElement>('.menu-panel')!;
  const sinMovimiento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const cerrar = () => {
    if (!menu.open || menu.classList.contains('cerrando')) return;
    if (sinMovimiento()) { menu.open = false; return; }
    menu.classList.add('cerrando');
    const fin = () => { menu.open = false; menu.classList.remove('cerrando'); };
    panel.addEventListener('animationend', fin, { once: true });
    setTimeout(() => menu.classList.contains('cerrando') && fin(), 300); // respaldo si no llega animationend
  };

  menu.querySelector('summary')!.addEventListener('click', (e) => {
    if (menu.open) { e.preventDefault(); cerrar(); }
  });
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) cerrar(); });
  document.addEventListener('click', (e) => { if (menu.open && !menu.contains(e.target as Node)) cerrar(); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.open) { cerrar(); menu.querySelector('summary')?.focus(); }
  });
}
