/** Textos de robots.txt y llms.txt, separados de las rutas para poder probarlos. */

const RUTAS_PRIVADAS = ['/api/', '/amigo/'];

/** Rastreadores de buscadores de IA y de asistentes: se permiten expresamente. */
export const RASTREADORES_IA = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Google-Extended', 'Applebot-Extended',
];

export function generarRobots(urlSitemap: string): string {
  const privadas = RUTAS_PRIVADAS.map((r) => `Disallow: ${r}`).join('\n');
  return [
    'User-agent: *',
    'Allow: /',
    privadas,
    '',
    '# Buscadores y asistentes de IA: permitidos, salvo las rutas privadas',
    ...RASTREADORES_IA.map((n) => `User-agent: ${n}`),
    'Allow: /',
    privadas,
    '',
    `Sitemap: ${urlSitemap}`,
    '',
  ].join('\n');
}

export interface PaginaLlms { titulo: string; ruta: string; descripcion: string }

/** Resumen de la web para modelos de lenguaje, en el formato propuesto por llmstxt.org. */
export function generarLlmsTxt(base: string, paginas: PaginaLlms[]): string {
  const enlace = (p: PaginaLlms) => `- [${p.titulo}](${new URL(p.ruta, base)}): ${p.descripcion}`;
  return [
    '# Amigo Invisible',
    '',
    '> Web gratuita en español para organizar un sorteo de amigo invisible online. Sin registro: se añaden los participantes, el presupuesto y las excepciones, y cada persona recibe por correo a quién le toca regalar.',
    '',
    '## Cómo funciona',
    '',
    '- Se necesitan entre 3 y 40 participantes, con nombre y correo.',
    '- Se pueden indicar presupuesto, fecha del intercambio y excepciones (quién no puede regalar a quién, por ejemplo las parejas).',
    '- El sorteo nunca asigna a nadie a sí mismo. Quien lo organiza no ve el resultado.',
    '- Cada participante recibe un correo con su amigo invisible y un enlace privado para ver la lista de deseos de esa persona y editar la suya.',
    '- Los correos electrónicos no se guardan nunca. Los nombres y las listas de deseos se borran solos 7 días después del intercambio, o a los 45 días si no hay fecha.',
    '',
    '## Páginas principales',
    '',
    ...paginas.map(enlace),
    '',
    '## Política de privacidad',
    '',
    `- [Privacidad](${new URL('/privacidad', base)}): qué datos se usan, cuánto tiempo se conservan y con qué proveedores.`,
    '',
  ].join('\n');
}
