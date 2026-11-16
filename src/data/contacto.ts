/** Dirección de contacto partida en dos para no dejar el correo completo en el HTML que leen los rastreadores de direcciones. */
export const CONTACTO = { usuario: 'carolinarodriguezdev', dominio: 'gmail.com' } as const;

export const correoContacto = (): string => `${CONTACTO.usuario}@${CONTACTO.dominio}`;

/** Versión legible sin JavaScript: no es un enlace ni contiene el arroba. */
export const correoLegible = (): string => `${CONTACTO.usuario} [arroba] ${CONTACTO.dominio}`;
