/** Cierra el menú móvil al elegir un enlace, pulsar fuera o usar Escape. */
const menu = document.getElementById('menu-movil') as HTMLDetailsElement | null;
if (menu) {
  const cerrar = () => { menu.open = false; };
  menu.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) cerrar(); });
  document.addEventListener('click', (e) => { if (menu.open && !menu.contains(e.target as Node)) cerrar(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.open) { cerrar(); menu.querySelector('summary')?.focus(); } });
}
