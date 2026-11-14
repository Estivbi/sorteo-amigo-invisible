const ETIQUETAS: Record<string, string> = {
  sorteos: 'Sorteos',
  correos: 'Correos enviados',
  correos_simulados: 'Correos simulados',
  error_envio: 'Errores de envío',
  bloqueo_global: 'Bloqueos: tope diario',
  bloqueo_destinatario: 'Bloqueos: misma dirección',
  bloqueo_ip: 'Bloqueos: misma IP',
  captcha_fallido: 'Antibots fallidos',
  captcha_no_configurado: 'Antibots sin configurar',
  origen_no_permitido: 'Origen no permitido',
  limite_peticiones: 'Demasiadas peticiones',
  validacion_fallida: 'Datos no válidos',
  bot_trampa: 'Bots (campo trampa)',
  json_invalido: 'Petición no válida',
  servicio_no_disponible: 'Servicio no disponible',
};

interface Respuesta {
  hoy: { dia: string; correos: number; limite: number };
  dias: ({ dia: string } & Record<string, number | string>)[];
}

function celda(tag: 'th' | 'td', texto: string) {
  const c = document.createElement(tag);
  c.textContent = texto;
  return c;
}

export function iniciarPanel() {
  const form = document.getElementById('acceso') as HTMLFormElement | null;
  if (!form) return;
  const token = document.getElementById('token') as HTMLInputElement;
  const boton = document.getElementById('entrar') as HTMLButtonElement;
  const error = document.getElementById('error')!;
  const resultado = document.getElementById('resultado')!;

  function pintar(d: Respuesta) {
    document.getElementById('uso')!.textContent = String(d.hoy.correos);
    document.getElementById('limite')!.textContent = String(d.hoy.limite);
    const barra = document.getElementById('barra') as HTMLProgressElement;
    barra.value = Math.min(100, Math.round((d.hoy.correos / d.hoy.limite) * 100));
    const claves = [...new Set(d.dias.flatMap((x) => Object.keys(x).filter((k) => k !== 'dia')))];
    claves.sort((a, b) => (Object.keys(ETIQUETAS).indexOf(a) + 100) % 100 - (Object.keys(ETIQUETAS).indexOf(b) + 100) % 100);
    const tabla = document.getElementById('tabla')!;
    const cabecera = document.createElement('tr');
    cabecera.append(celda('th', 'Día'), ...claves.map((k) => celda('th', ETIQUETAS[k] ?? k)));
    const thead = document.createElement('thead');
    thead.append(cabecera);
    const tbody = document.createElement('tbody');
    for (const dia of d.dias) {
      const fila = document.createElement('tr');
      fila.append(celda('td', String(dia.dia)), ...claves.map((k) => celda('td', String(dia[k] ?? 0))));
      tbody.append(fila);
    }
    tabla.replaceChildren(thead, tbody);
    resultado.hidden = false;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    error.hidden = true;
    boton.disabled = true;
    try {
      const res = await fetch('/api/estadisticas', { method: 'POST', headers: { Authorization: `Bearer ${token.value}` } });
      const datos = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(datos.mensaje || (res.status === 404 ? 'El panel no está configurado.' : 'No se han podido cargar las estadísticas.'));
      pintar(datos as Respuesta);
    } catch (e) {
      resultado.hidden = true;
      error.textContent = e instanceof Error ? e.message : 'Error desconocido.';
      error.hidden = false;
    } finally {
      boton.disabled = false;
    }
  });
}
