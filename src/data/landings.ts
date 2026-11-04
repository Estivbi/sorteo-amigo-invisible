export interface Landing {
  slug: string;
  nav: string;
  icon: string;
  title: string;
  description: string;
  /** Frase corta para las tarjetas de la portada. */
  resumen: string;
  h1: string;
  intro: string;
  tips: { titulo: string; texto: string }[];
  budget: string;
  faq: { q: string; a: string }[];
}

export const landings: Landing[] = [
  {
    slug: 'oficina',
    nav: 'Para la oficina',
    icon: 'lucide:briefcase',
    title: 'Amigo invisible para la oficina y el trabajo: sorteo online gratis',
    description:
      'Organiza el amigo invisible de la oficina en 2 minutos: sorteo online gratis, excepciones entre compañeros, presupuesto y aviso por email. Sin registro.',
    resumen: 'Presupuesto cerrado y excepciones entre compañeros.',
    h1: 'Amigo invisible de la oficina, sin líos',
    intro:
      'Reunir a todo el equipo, fijar un presupuesto y que nadie se toque a sí mismo es más difícil de lo que parece. Aquí lo haces en dos minutos y cada compañero recibe su asignación por email.',
    tips: [
      { titulo: 'Presupuesto cerrado', texto: 'Entre 10 y 15 € evita comparaciones incómodas entre compañeros. Indícalo en el sorteo y saldrá en el correo.' },
      { titulo: 'Excepciones útiles', texto: 'Evita que un jefe regale a su equipo directo o que se repitan los regalos del año pasado.' },
      { titulo: 'Regalos neutros', texto: 'Pide a cada persona 2 o 3 ideas en su lista de deseos para acertar sin invadir su vida privada.' },
      { titulo: 'Una fecha clara', texto: 'Fija el día del intercambio, por ejemplo el último día laborable antes de vacaciones.' },
    ],
    budget: '10 a 15 €',
    faq: [
      { q: '¿Cuánta gente puede participar?', a: 'Hasta 40 personas por sorteo, suficiente para la mayoría de equipos y departamentos.' },
      { q: '¿Tengo que pedir los correos corporativos?', a: 'Sí, necesitas el email de cada compañero. Solo se usa para enviarle su asignación y no se guarda.' },
      { q: '¿Y si alguien se da de baja?', a: 'Lo más fácil es repetir el sorteo con la lista actualizada. Es gratis y tarda un minuto.' },
    ],
  },
  {
    slug: 'familia',
    nav: 'Para la familia',
    icon: 'lucide:house',
    title: 'Amigo invisible en familia: sorteo online gratis con excepciones',
    description:
      'Sorteo de amigo invisible para la familia: evita que parejas o hermanos se toquen entre sí, añade lista de deseos y envía las asignaciones por email. Gratis.',
    resumen: 'Sin que se toquen las parejas y con lista de deseos.',
    h1: 'Amigo invisible en familia, sin que se toquen las parejas',
    intro:
      'En Navidad, regalar a todos sale caro. Con un amigo invisible cada uno compra un solo regalo, y mejor pensado. Configura quién no puede regalar a quién y deja que la suerte haga el resto.',
    tips: [
      { titulo: 'Parejas aparte', texto: 'Añade una excepción para cada pareja: se regalarán por su cuenta y el sorteo no los emparejará.' },
      { titulo: 'Niños y mayores', texto: 'Haz un sorteo aparte para los más pequeños, con un presupuesto más ajustado.' },
      { titulo: 'Lista de deseos', texto: 'Cada participante añade qué le haría ilusión. Así los abuelos y los primos aciertan.' },
      { titulo: 'Comida y sobremesa', texto: 'Decide si se abren los regalos en la comida o en la sobremesa. Un detalle que da mucho juego.' },
    ],
    budget: '15 a 25 €',
    faq: [
      { q: '¿Se pueden poner excepciones entre hermanos o parejas?', a: 'Sí. Indica quién no puede regalar a quién y el sorteo las respeta siempre.' },
      { q: '¿Los niños sin email pueden participar?', a: 'Pon el correo de uno de sus padres. Esa persona recibirá la asignación y la mantendrá en secreto.' },
      { q: '¿Se guardan los datos de mi familia?', a: 'Los correos nunca se guardan. Solo se conservan unos días nombres y listas de deseos para que cada uno pueda editar la suya.' },
    ],
  },
  {
    slug: 'amigos',
    nav: 'Para amigos',
    icon: 'lucide:party-popper',
    title: 'Amigo invisible entre amigos: crea el sorteo online en 2 minutos',
    description:
      'Haz el amigo invisible con tu grupo de amigos: sorteo online gratis, sin registro, con presupuesto, lista de deseos y fecha del intercambio por email.',
    resumen: 'Sin papelitos ni quedadas: cada uno lo recibe en el móvil.',
    h1: 'Amigo invisible con tu grupo de amigos',
    intro:
      'Quedar todos a la vez ya es un reto. Con el sorteo online nadie tiene que estar presente: cada amigo recibe su asignación en el móvil y el secreto queda a salvo hasta el día del intercambio.',
    tips: [
      { titulo: 'Sin papelitos', texto: 'Se acabaron el gorro, los papeles doblados y la gente que se toca a sí misma y repite.' },
      { titulo: 'Fecha y calendario', texto: 'Añade el día del intercambio y cada amigo podrá guardarlo en su calendario con un clic.' },
      { titulo: 'Regalos con gracia', texto: 'Si lo vuestro es lo gracioso, fija un tope bajo y premia el regalo más ingenioso.' },
      { titulo: 'Grupo de WhatsApp', texto: 'Comparte el enlace del sorteo en el grupo para que todos sepan cómo participar.' },
    ],
    budget: '5 a 20 €',
    faq: [
      { q: '¿Cuántos amigos necesito como mínimo?', a: 'Tres personas. Con dos no habría secreto, porque cada uno sabría quién le regala.' },
      { q: '¿Tengo que registrarme?', a: 'No. No hay cuentas ni contraseñas: escribes los participantes y listo.' },
      { q: '¿Funciona desde el móvil?', a: 'Sí, la web está pensada para usarla cómodamente desde el teléfono.' },
    ],
  },
  {
    slug: 'online',
    nav: 'Sorteo online',
    icon: 'lucide:mail-check',
    title: 'Sorteo de amigo invisible online gratis, sin registro',
    description:
      'Sorteo de amigo invisible online gratis y sin registro. Añade participantes, excepciones y presupuesto, y cada uno recibe su amigo invisible por email.',
    resumen: 'Gratis, sin registro y listo en dos minutos.',
    h1: 'Sorteo de amigo invisible online, gratis y sin registro',
    intro:
      'Escribe los participantes, añade las excepciones que quieras y pulsa un botón. Cada persona recibe en su correo a quién le toca regalar, con el presupuesto y, si quiere, su lista de deseos.',
    tips: [
      { titulo: 'Rápido', texto: 'Dos minutos desde que empiezas hasta que salen los correos.' },
      { titulo: 'Privado', texto: 'Ni tú ves el resultado: lo envía el sistema directamente a cada participante.' },
      { titulo: 'Justo', texto: 'Nadie se toca a sí mismo y se respetan todas las excepciones que indiques.' },
      { titulo: 'Gratis de verdad', texto: 'Sin cuotas, sin anuncios y sin tarjeta. Solo si te gusta puedes invitarnos a un café.' },
    ],
    budget: 'el que decidáis',
    faq: [
      { q: '¿Es realmente gratis?', a: 'Sí, el sorteo y los correos son gratuitos. Hay un botón de donación opcional.' },
      { q: '¿Quién ve las asignaciones?', a: 'Solo cada participante ve a quién le regala. El organizador no recibe el resultado.' },
      { q: '¿Cuándo llegan los correos?', a: 'En cuanto pulsas crear sorteo. Si no los ves, revisa la carpeta de spam.' },
    ],
  },
];

export const getLanding = (slug: string) => landings.find((l) => l.slug === slug);
