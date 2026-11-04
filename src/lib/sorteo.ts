export const MIN_PARTICIPANTES = 3;
export const MAX_PARTICIPANTES = 40;

export interface Participante {
  id: string;
  name: string;
  email: string;
  wishlist?: string;
}

export interface Excepcion {
  from: string;
  to: string;
}

export interface DatosSorteo {
  gameName: string;
  budget: number | null;
  eventDate: string | null;
  participants: Participante[];
  exceptions: Excepcion[];
}

export interface Asignacion {
  giver: Participante;
  receiver: Participante;
}

export class ErrorSorteo extends Error {
  codigo: string;
  constructor(codigo: string, mensaje: string) {
    super(mensaje);
    this.codigo = codigo;
  }
}

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const limpiar = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';

/** Valida y normaliza la carga recibida del cliente. Lanza ErrorSorteo si algo no es válido. */
export function validarDatos(raw: unknown): DatosSorteo {
  const d = (raw ?? {}) as Record<string, unknown>;
  const gameName = limpiar(d.gameName, 80);
  if (!gameName) throw new ErrorSorteo('nombre_requerido', 'Ponle un nombre al sorteo.');

  let budget: number | null = null;
  if (d.budget !== null && d.budget !== undefined && d.budget !== '') {
    const n = Number(d.budget);
    if (!Number.isFinite(n) || n < 0 || n > 10000) throw new ErrorSorteo('presupuesto_invalido', 'El presupuesto no es válido.');
    budget = n > 0 ? n : null;
  }

  let eventDate: string | null = null;
  if (typeof d.eventDate === 'string' && d.eventDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.eventDate) || Number.isNaN(Date.parse(d.eventDate))) {
      throw new ErrorSorteo('fecha_invalida', 'La fecha del intercambio no es válida.');
    }
    eventDate = d.eventDate;
  }

  if (!Array.isArray(d.participants)) throw new ErrorSorteo('sin_participantes', 'Añade a los participantes.');
  if (d.participants.length < MIN_PARTICIPANTES) {
    throw new ErrorSorteo('pocos_participantes', `Hacen falta al menos ${MIN_PARTICIPANTES} participantes.`);
  }
  if (d.participants.length > MAX_PARTICIPANTES) {
    throw new ErrorSorteo('demasiados_participantes', `El máximo es de ${MAX_PARTICIPANTES} participantes.`);
  }

  const vistos = new Set<string>();
  const participants: Participante[] = d.participants.map((p, i) => {
    const o = (p ?? {}) as Record<string, unknown>;
    const name = limpiar(o.name, 60);
    const email = limpiar(o.email, 120).toLowerCase();
    if (!name) throw new ErrorSorteo('nombre_participante', `Falta el nombre del participante ${i + 1}.`);
    if (!EMAIL_RE.test(email)) throw new ErrorSorteo('email_invalido', `El correo de ${name} no es válido.`);
    if (vistos.has(email)) throw new ErrorSorteo('email_repetido', `El correo de ${name} está repetido.`);
    vistos.add(email);
    return { id: String(o.id ?? i), name, email, wishlist: limpiar(o.wishlist, 200) || undefined };
  });

  const ids = new Set(participants.map((p) => p.id));
  if (ids.size !== participants.length) throw new ErrorSorteo('datos_invalidos', 'Los datos del sorteo no son válidos.');

  const rawEx = Array.isArray(d.exceptions) ? d.exceptions.slice(0, 200) : [];
  const exceptions: Excepcion[] = rawEx
    .map((e) => ({ from: String((e as Excepcion)?.from ?? ''), to: String((e as Excepcion)?.to ?? '') }))
    .filter((e) => ids.has(e.from) && ids.has(e.to) && e.from !== e.to);

  return { gameName, budget, eventDate, participants, exceptions };
}

/**
 * Reparte un amigo invisible a cada participante.
 * Baraja con Fisher-Yates y reintenta hasta cumplir las reglas; si no hay solución lo notifica.
 */
export function asignar(participants: Participante[], exceptions: Excepcion[], aleatorio: () => number = Math.random): Asignacion[] {
  const prohibido = new Set(exceptions.map((e) => `${e.from}>${e.to}`));
  const intentosMax = 5000;

  for (let intento = 0; intento < intentosMax; intento++) {
    const receptores = [...participants];
    for (let i = receptores.length - 1; i > 0; i--) {
      const j = Math.floor(aleatorio() * (i + 1));
      [receptores[i], receptores[j]] = [receptores[j], receptores[i]];
    }
    const ok = participants.every((g, i) => g.id !== receptores[i].id && !prohibido.has(`${g.id}>${receptores[i].id}`));
    if (ok) return participants.map((giver, i) => ({ giver, receiver: receptores[i] }));
  }
  throw new ErrorSorteo('sin_solucion', 'Con esas excepciones no es posible hacer el sorteo. Quita alguna e inténtalo de nuevo.');
}
