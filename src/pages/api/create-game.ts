import type { APIContext, APIRoute } from 'astro';
import { asignar, ErrorSorteo, validarDatos } from '../../lib/sorteo';
import { construirCorreo, enviarCorreos, proveedorActivo } from '../../lib/email';
import { verificarTurnstile } from '../../lib/turnstile';
import { permitido } from '../../lib/limite';
import { crearCronometro } from '../../lib/tiempos';
import { almacenDisponible, generarToken, guardarRegistros, type RegistroAmigo } from '../../lib/almacen';
import { env, ipDe, json, origenPermitido } from '../../lib/http';
import { diaMadrid, reservarCupo, type Rechazo, type ResultadoCupo } from '../../lib/cupos';
import { avisar, configLimites, contadoresReales, secretoHuella } from '../../lib/servicios';

export const prerender = false;

type Sumar = (metrica: string, n?: number) => void;

/** Respuesta y aviso cuando el sorteo no cabe en alguno de los límites diarios. */
async function rechazar(rechazo: Rechazo, sumar: Sumar, config: ReturnType<typeof configLimites>, cabeceras: Record<string, string>): Promise<Response> {
  if (rechazo.tipo === 'global') {
    sumar('bloqueo_global');
    await avisar('tope_alcanzado', `🚫 Amigo Invisible: se alcanzó el tope diario de correos (${config.globalDia}). Se rechazan sorteos hasta mañana.`, 6 * 3600);
    return json({ error: 'limite_global', mensaje: 'Hoy hemos llegado al límite de correos que podemos enviar. Vuelve mañana.' }, 429, cabeceras);
  }
  if (rechazo.tipo === 'ip') {
    sumar('bloqueo_ip');
    await avisar('abuso_ip', `⚠️ Amigo Invisible: se bloqueó a una IP por crear demasiados sorteos en un día (límite ${config.porIpDia}).`);
    return json({ error: 'limite_ip', mensaje: 'Has creado demasiados sorteos hoy. Inténtalo mañana.' }, 429, cabeceras);
  }
  sumar('bloqueo_destinatario');
  await avisar('abuso_destinatario', `⚠️ Amigo Invisible: se bloqueó un sorteo por enviar demasiados correos a una misma dirección en un día (límite ${config.porDestinatario}).`);
  return json({ error: 'limite_destinatario', mensaje: `A ${rechazo.nombre ?? 'una de las personas'} ya le hemos enviado demasiados correos hoy. Quítale del sorteo o inténtalo mañana.` }, 429, cabeceras);
}

async function manejar({ request, clientAddress, url, site }: APIContext, sumar: Sumar): Promise<Response> {
  const t = crearCronometro();
  const tiempos = () => ({ 'Server-Timing': t.cabecera() });
  const ip = ipDe(request, clientAddress);

  if (!origenPermitido(request)) {
    sumar('origen_no_permitido');
    return json({ error: 'origen_no_permitido', mensaje: 'Origen no permitido.' }, 403);
  }
  if (!permitido(ip)) {
    sumar('limite_peticiones');
    return json({ error: 'demasiadas_peticiones', mensaje: 'Has hecho demasiados sorteos seguidos. Espera unos minutos.' }, 429);
  }

  let cuerpo: Record<string, unknown>;
  try {
    cuerpo = await request.json();
  } catch {
    sumar('json_invalido');
    return json({ error: 'json_invalido', mensaje: 'Petición no válida.' }, 400);
  }

  // Trampa para bots: un humano nunca rellena este campo oculto.
  if (cuerpo.website) {
    sumar('bot_trampa');
    return json({ ok: true, sent: 0 });
  }

  // Con envío real de correos, el antibots es obligatorio; en desarrollo o modo simulado puede faltar.
  const real = proveedorActivo() !== 'simulado';
  const captcha = await verificarTurnstile({ token: cuerpo.captchaToken, secret: env('TURNSTILE_SECRET'), ip, exigido: real });
  t.marca('captcha');
  if (!captcha.ok) {
    if (captcha.motivo === 'no_configurado') {
      sumar('captcha_no_configurado');
      console.error('create-game: falta TURNSTILE_SECRET con el envío de correos activo');
      await avisar('captcha_no_configurado', '❌ Amigo Invisible: falta TURNSTILE_SECRET y hay envío real de correos. Los sorteos están bloqueados.');
      return json({ error: 'captcha_no_configurado', mensaje: 'La protección antibots no está configurada. Inténtalo más tarde.' }, 503, tiempos());
    }
    sumar('captcha_fallido');
    return json({ error: 'captcha', mensaje: 'No hemos podido verificar que eres una persona. Recarga la página e inténtalo de nuevo.' }, 403, tiempos());
  }

  let reserva: ResultadoCupo | null = null;
  try {
    const juego = validarDatos(cuerpo);
    const asignaciones = asignar(juego.participants, juego.exceptions);
    t.marca('sorteo');

    // Sin donde contar no se envían correos reales: es lo que impide el abuso si falla la base de datos.
    if (real && !almacenDisponible()) {
      sumar('servicio_no_disponible');
      await avisar('sin_almacen', '❌ Amigo Invisible: no hay base de datos configurada y hay envío real de correos. Los sorteos están bloqueados.');
      return json({ error: 'servicio_no_disponible', mensaje: 'El servicio no está disponible ahora mismo. Inténtalo más tarde.' }, 503, tiempos());
    }

    // Reserva del cupo diario (global, por IP y por destinatario) antes de enviar nada.
    const config = configLimites();
    if (almacenDisponible()) {
      reserva = await reservarCupo({
        contadores: contadoresReales(), config, secreto: secretoHuella(), dia: diaMadrid(), ip,
        destinatarios: juego.participants.map((p) => ({ nombre: p.name, email: p.email })),
      });
      t.marca('cupo');
      if (!reserva.ok) return await rechazar(reserva.rechazo, sumar, config, tiempos());
    }

    // Enlaces privados: cada participante puede ver la lista de su amigo y editar la suya. Solo se guardan nombres y listas.
    const conEnlaces = almacenDisponible();
    const base = import.meta.env.DEV ? url.origin : (site ?? url).origin;
    const tokens = new Map(juego.participants.map((p) => [p.id, generarToken()]));
    if (conEnlaces) {
      const registros: Record<string, RegistroAmigo> = {};
      for (const { giver, receiver } of asignaciones) {
        registros[tokens.get(giver.id)!] = {
          n: giver.name, w: giver.wishlist ?? '', r: tokens.get(receiver.id)!, g: juego.gameName, d: juego.eventDate, b: juego.budget,
        };
      }
      await guardarRegistros(registros, juego.eventDate);
    }
    t.marca('almacen');

    const correos = asignaciones.map((a) => construirCorreo(a, juego, conEnlaces ? `${base}/amigo/${tokens.get(a.giver.id)}` : undefined));
    t.marca('preparar');
    const proveedor = await enviarCorreos(correos);
    t.marca('correo');
    if (proveedor === 'simulado' && import.meta.env.DEV) for (const a of asignaciones) console.info(`[dev] enlace de ${a.giver.name}: ${base}/amigo/${tokens.get(a.giver.id)}`);

    sumar('sorteos');
    sumar(proveedor === 'simulado' ? 'correos_simulados' : 'correos', correos.length);
    // Aviso al llegar al 80 % del tope diario, una sola vez al día.
    if (proveedor !== 'simulado' && reserva?.ok && reserva.usoGlobal >= Math.ceil(config.globalDia * 0.8)) {
      await avisar(`tope_80:${diaMadrid()}`, `📈 Amigo Invisible: llevas ${reserva.usoGlobal} de ${config.globalDia} correos hoy (80 % del tope diario).`, 24 * 3600);
    }
    // Nunca se devuelve quién regala a quién.
    return json({ ok: true, sent: correos.length, simulado: proveedor === 'simulado' }, 200, tiempos());
  } catch (err) {
    if (err instanceof ErrorSorteo) {
      sumar('validacion_fallida');
      return json({ error: err.codigo, mensaje: err.message }, err.codigo === 'sin_solucion' ? 422 : 400);
    }
    const motivo = err instanceof Error ? err.message : 'desconocido';
    console.error('create-game: fallo', motivo);
    sumar('error_envio');
    if (reserva?.ok) await reserva.liberar().catch(() => {}); // el correo no salió: se devuelve el cupo
    await avisar('error_envio', `❌ Amigo Invisible: fallo al crear un sorteo o enviar los correos (${motivo.slice(0, 80)}).`);
    return json({ error: 'envio_fallido', mensaje: 'No hemos podido enviar los correos. Inténtalo de nuevo en unos minutos.' }, 502);
  }
}

export const POST: APIRoute = async (contexto) => {
  const metricas: Record<string, number> = {};
  const respuesta = await manejar(contexto, (nombre, n = 1) => { metricas[nombre] = (metricas[nombre] ?? 0) + n; });
  // Estadísticas del día: una sola petición a la base de datos; si falla, no afecta a la respuesta.
  if (Object.keys(metricas).length) {
    try { await contadoresReales().metricas(diaMadrid(), metricas); } catch { /* sin estadísticas, pero el sorteo ya está hecho */ }
  }
  return respuesta;
};
