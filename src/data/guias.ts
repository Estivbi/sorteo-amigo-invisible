export interface SeccionGuia {
  titulo: string;
  parrafos?: string[];
  lista?: string[];
  /** Si es true, la lista se muestra numerada. */
  ordenada?: boolean;
}

export interface Guia {
  slug: string;
  /** Texto corto para enlaces y migas de pan. */
  nav: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Línea para tarjetas y para llms.txt. */
  resumen: string;
  /** Fecha de publicación en formato AAAA-MM-DD. */
  publicada: string;
  secciones: SeccionGuia[];
  faq: { q: string; a: string }[];
}

export const guias: Guia[] = [
  {
    slug: 'como-organizar-amigo-invisible',
    nav: 'Cómo organizar un amigo invisible',
    title: 'Cómo organizar un amigo invisible paso a paso',
    description:
      'Guía práctica para organizar un amigo invisible sin líos: cuántas personas, presupuesto, fecha, excepciones, sorteo online y qué hacer si alguien se baja.',
    h1: 'Cómo organizar un amigo invisible paso a paso',
    intro:
      'Organizar un amigo invisible es sencillo si decides cuatro cosas antes de sortear: quién juega, cuánto se gasta, cuándo se entrega y quién no puede regalar a quién. Esta guía te lleva por el orden que mejor funciona.',
    resumen: 'los pasos para organizar el juego sin líos, de la lista de participantes al día del intercambio.',
    publicada: '2026-11-16',
    secciones: [
      {
        titulo: '1. Cierra la lista de participantes',
        parrafos: [
          'Antes de sortear, confirma quién participa. Añadir o quitar a alguien después obliga a repetir el sorteo, así que conviene preguntar con tiempo y fijar una fecha límite para apuntarse.',
          'El mínimo para que el juego funcione son 3 personas, y cuantas más haya, más sorpresa. Para cada una necesitas su nombre y un correo donde pueda recibir su asignación.',
        ],
      },
      {
        titulo: '2. Fija un presupuesto',
        parrafos: [
          'Un tope claro evita regalos muy desiguales. Elige un rango que sea cómodo para todos: en la oficina suele ir de 10 a 15 €, y en familia o entre amigos de 15 a 25 €.',
          'Si el grupo tiene realidades económicas muy distintas, es mejor bajar el tope que arriesgarse a que alguien se sienta incómodo.',
        ],
      },
      {
        titulo: '3. Decide la fecha y cómo se entrega',
        parrafos: [
          'Acuerda un día concreto para el intercambio: la cena de Navidad, el último día antes de las vacaciones o una videollamada. Con una fecha fija, nadie se queda sin comprar a última hora.',
          'Indica también si los regalos se abren todos a la vez o uno por uno. Lo segundo da mucho juego, porque cada persona puede intentar adivinar quién se lo ha hecho.',
        ],
      },
      {
        titulo: '4. Piensa en las excepciones',
        parrafos: [
          'Las excepciones son las parejas que ya se regalan entre sí, los hermanos o quien ya se tocó el año pasado. Márcalas antes de sortear para que el resultado las respete desde el principio.',
          'No pongas más de las necesarias: cuantas más excepciones, menos combinaciones posibles. Lo cuentas con detalle en la guía sobre excepciones.',
        ],
      },
      {
        titulo: '5. Haz el sorteo',
        parrafos: [
          'Con papelitos siempre hay alguien que se toca a sí mismo o que ve el papel de otro. Un sorteo online lo resuelve: asigna a cada persona un amigo invisible distinto de sí misma y envía el resultado por correo, de modo que ni quien organiza sabe quién regala a quién.',
        ],
        lista: [
          'Añade a cada participante con su nombre y su correo.',
          'Indica presupuesto, fecha y excepciones.',
          'Pulsa crear: cada persona recibe su correo con su amigo invisible.',
        ],
        ordenada: true,
      },
      {
        titulo: '6. Anima a rellenar la lista de deseos',
        parrafos: [
          'La mejor forma de acertar es que cada persona anote dos o tres ideas. Aquí cada participante puede editar su lista desde el enlace privado de su correo, y la persona que le regala la ve sin saber quién es.',
        ],
      },
      {
        titulo: '7. Qué hacer si alguien se baja',
        parrafos: [
          'Lo más limpio es repetir el sorteo con la lista actualizada. Es gratis y tarda un minuto. Avisa al grupo de que el correo anterior ya no vale, para que nadie compre un regalo para la persona equivocada.',
        ],
      },
    ],
    faq: [
      { q: '¿Cuántas personas hacen falta para un amigo invisible?', a: 'Como mínimo 3: con 2 personas solo habría un intercambio directo y no hay sorpresa, por eso la web exige 3 o más. Lo habitual es entre 6 y 20 personas.' },
      { q: '¿Quién debe organizar el sorteo?', a: 'Cualquier persona del grupo. Con un sorteo online, quien organiza no ve quién regala a quién, así que puede participar como los demás.' },
      { q: '¿Se puede repetir el sorteo?', a: 'Sí. Si cambia la lista de participantes o alguien se toca con quien no debe, se repite el sorteo y se avisa al grupo de que el correo anterior ya no vale.' },
    ],
  },
  {
    slug: 'amigo-invisible-a-distancia',
    nav: 'Amigo invisible a distancia',
    title: 'Amigo invisible a distancia: cómo hacerlo online',
    description:
      'Cómo organizar un amigo invisible cuando los participantes viven en ciudades distintas: sorteo por correo, envíos a tiempo, privacidad de la dirección y regalos online.',
    h1: 'Amigo invisible a distancia: cómo hacerlo online',
    intro:
      'Si tus amigos o tu familia viven en ciudades distintas, el amigo invisible sigue funcionando: el sorteo se hace por correo y los regalos viajan por mensajería. Lo único que cambia es que hay que planificar los envíos con más margen.',
    resumen: 'cómo organizarlo cuando los participantes viven lejos: plazos de envío, dirección y regalos online.',
    publicada: '2026-11-16',
    secciones: [
      {
        titulo: 'El sorteo se hace por correo, sin reunirse',
        parrafos: [
          'Lo que se hacía con un gorro y papelitos se resuelve en dos minutos online: cada participante recibe un correo privado con la persona a quien regala. No hace falta coincidir en un mismo sitio para sortear.',
        ],
      },
      {
        titulo: 'Fija una fecha de envío, no solo de entrega',
        parrafos: [
          'En Navidad la mensajería va más lenta. Pon una fecha límite para enviar el paquete, por ejemplo 10 días antes del intercambio, y otra para abrirlo. Así nadie llega tarde por culpa del transporte.',
        ],
      },
      {
        titulo: 'Cuenta el envío dentro del presupuesto',
        parrafos: [
          'Decide si los gastos de envío entran en el tope. Lo más justo es que sí: si el regalo cuesta 20 € y el envío 5 €, el presupuesto es de 25 €. Dilo desde el principio para evitar sorpresas.',
        ],
      },
      {
        titulo: 'Protege la dirección de cada persona',
        parrafos: [
          'No hace falta compartir las direcciones con todo el grupo. Cuando cada participante sabe a quién regala, puede pedirle la dirección directamente, sin que el resto lo sepa. Así se mantiene el secreto y se cuida la privacidad.',
        ],
      },
      {
        titulo: 'Aprovecha la lista de deseos y las tiendas online',
        parrafos: [
          'A distancia no puedes mirar de reojo qué le gusta a cada persona. Por eso la lista de deseos ayuda tanto: cada participante anota dos o tres ideas y quien le regala las consulta desde su enlace privado.',
          'Si compras online, elige tiendas que permitan devolver el artículo, por si no llega bien o no es la talla.',
        ],
      },
      {
        titulo: 'Abre los regalos juntos por videollamada',
        parrafos: [
          'Un buen cierre es una videollamada el día del intercambio, con cada persona abriendo su paquete delante de todos y adivinando quién se lo ha enviado.',
        ],
      },
    ],
    faq: [
      { q: '¿Puedo hacer el amigo invisible con gente de otros países?', a: 'Sí, el sorteo por correo funciona en cualquier sitio. Lo que cambia son los plazos y el coste de envío, que conviene acordar desde el principio.' },
      { q: '¿Cómo consigo la dirección de la persona a quien regalo?', a: 'Se la pides directamente cuando ya sabes quién es. No hace falta que el grupo conozca todas las direcciones.' },
      { q: '¿Con cuánta antelación debo enviar el regalo?', a: 'En Navidad, unos 10 días antes del intercambio es un margen razonable, porque la mensajería suele ir más cargada.' },
    ],
  },
  {
    slug: 'excepciones-amigo-invisible',
    nav: 'Excepciones del amigo invisible',
    title: 'Excepciones en el amigo invisible: parejas y límites',
    description:
      'Cómo funcionan las excepciones en un amigo invisible: evitar que se toquen las parejas, cuántas puedes poner y por qué a veces el sorteo no tiene solución.',
    h1: 'Excepciones en el amigo invisible: parejas y límites',
    intro:
      'Una excepción dice que una persona no puede regalar a otra concreta. Sirve para las parejas, los hermanos o quien ya se tocó el año pasado. Pero cada excepción reduce las combinaciones posibles, y con demasiadas el sorteo puede no tener solución.',
    resumen: 'cómo evitar que se toquen las parejas y por qué demasiadas excepciones pueden bloquear el sorteo.',
    publicada: '2026-11-16',
    secciones: [
      {
        titulo: 'Qué es una excepción',
        parrafos: [
          'En el sorteo, cada persona regala a otra y recibe de una distinta. Una excepción es una prohibición: «Ana no puede regalar a Luis». El sorteo la respeta siempre, y el resto de asignaciones se reparten entre las demás combinaciones.',
        ],
      },
      {
        titulo: 'Cuándo usarlas',
        lista: [
          'Parejas que ya se hacen un regalo por su cuenta.',
          'Hermanos o familiares muy cercanos.',
          'Quien ya se tocó el año anterior, para no repetir.',
          'Un jefe y su equipo directo, en la oficina.',
        ],
      },
      {
        titulo: 'Si la pareja se excluye en los dos sentidos',
        parrafos: [
          'Para evitar que se toquen, hay que marcar la excepción en los dos sentidos: que ella no regale a él y que él no regale a ella. Con una sola dirección, podrían tocarse al revés.',
        ],
      },
      {
        titulo: 'Un ejemplo con solución: cuatro personas, dos parejas',
        parrafos: [
          'Imagina a Ana y Luis (pareja) y a Marta y Pablo (pareja). Una asignación válida es: Ana regala a Marta, Marta a Luis, Luis a Pablo y Pablo a Ana. Nadie se toca a sí mismo ni a su pareja, así que el sorteo tiene solución.',
        ],
      },
      {
        titulo: 'Un ejemplo sin solución: tres personas y una pareja',
        parrafos: [
          'Si juegan tres personas (Ana, Luis y Marta) y Ana y Luis se excluyen en los dos sentidos, no hay forma de repartir. Solo existen dos asignaciones posibles en círculo, y las dos obligan a que Ana regale a Luis o Luis a Ana.',
          'En ese caso la web te avisa de que no hay solución. La salida es quitar la excepción o añadir más participantes.',
        ],
      },
      {
        titulo: 'Cómo evitar quedarte sin solución',
        lista: [
          'Pon solo las excepciones imprescindibles.',
          'Sortea con grupos más grandes: cuantas más personas, más combinaciones.',
          'Si hay muchas parejas, plantéate hacer dos sorteos distintos.',
          'Si aun así falla, quita una excepción y vuelve a intentarlo.',
        ],
      },
    ],
    faq: [
      { q: '¿Cuántas excepciones puedo poner?', a: 'No hay un número fijo. Depende del tamaño del grupo: cuantas más personas, más excepciones caben. Con grupos de 3 o 4, lo mejor es poner muy pocas.' },
      { q: '¿Por qué me dice que no hay solución?', a: 'Porque con las excepciones elegidas no existe ningún reparto en que cada persona regale a otra distinta. Quita alguna excepción o añade participantes.' },
      { q: '¿Las excepciones se ven en el correo de los participantes?', a: 'No. Cada persona solo recibe a quién regala, nunca quién no puede regalar a quién.' },
    ],
  },
  {
    slug: 'es-seguro-amigo-invisible-online',
    nav: '¿Es seguro un sorteo online?',
    title: '¿Es seguro un sorteo de amigo invisible online?',
    description:
      'Qué datos pide un sorteo de amigo invisible online, qué riesgos hay con tus correos y cómo reconocer una web fiable. Con lo que hacemos aquí con tus datos.',
    h1: '¿Es seguro un sorteo de amigo invisible online?',
    intro:
      'Para sortear, una web necesita los nombres y los correos de tus amigos o familiares. Eso son datos personales de terceros, así que conviene saber qué hace la web con ellos antes de usarla.',
    resumen: 'qué datos se piden en un sorteo online, qué riesgos hay y cómo reconocer una web fiable.',
    publicada: '2026-11-16',
    secciones: [
      {
        titulo: 'Qué datos necesita un sorteo online',
        parrafos: [
          'Lo mínimo es el nombre y el correo de cada participante. Opcionalmente, el presupuesto, la fecha y una lista de deseos. No hace falta ni dirección, ni teléfono, ni que nadie se registre.',
        ],
      },
      {
        titulo: 'Qué riesgos hay',
        lista: [
          'Webs que guardan los correos para enviar publicidad o venderlos.',
          'Sorteos que piden registro con contraseña sin necesidad.',
          'Correos falsos que imitan a un amigo invisible para que pulses un enlace malicioso.',
          'Enlaces compartibles que cualquiera puede abrir y ver quién regala a quién.',
        ],
      },
      {
        titulo: 'Cómo reconocer una web fiable',
        lista: [
          'Explica con claridad qué datos usa y cuánto tiempo los guarda.',
          'No pide registro ni contraseña para sortear.',
          'No guarda los correos de los participantes.',
          'Borra los datos solos pasado un tiempo.',
          'Los enlaces con tus datos son privados y no se pueden adivinar.',
        ],
      },
      {
        titulo: 'Qué hacemos aquí con tus datos',
        parrafos: [
          'Los correos electrónicos no se guardan nunca: se usan para enviar los mensajes y se descartan. Los nombres y las listas de deseos se guardan de forma temporal, asociados a un enlace privado y aleatorio que solo recibe cada participante, y se borran solos 7 días después del intercambio (o a los 45 días si no indicas fecha).',
          'No usamos tus datos para publicidad ni los cedemos a terceros. Para evitar abusos, comprobamos que quien crea el sorteo es una persona y limitamos cuántos correos se pueden enviar al día. Puedes leer todos los detalles en la política de privacidad.',
        ],
      },
      {
        titulo: 'Cómo reconocer un correo de amigo invisible legítimo',
        parrafos: [
          'Los correos de este sitio salen de la dirección no-reply de esta web y solo contienen el nombre de tu amigo invisible, los datos del sorteo y un enlace a nuestra propia página. Nunca te pedimos contraseñas ni datos bancarios. Si recibes un correo que sí lo hace, no pulses el enlace.',
        ],
      },
    ],
    faq: [
      { q: '¿Guardáis mi correo electrónico?', a: 'No. Los correos se usan una sola vez para enviar el mensaje y se descartan. Lo único que se guarda, de forma temporal, son nombres y listas de deseos.' },
      { q: '¿Quién puede ver quién regala a quién?', a: 'Solo cada participante ve a quién regala, desde su correo. Quien organiza el sorteo no lo ve.' },
      { q: '¿Cuándo se borran los datos?', a: 'Automáticamente 7 días después de la fecha del intercambio, o a los 45 días si no se indicó fecha.' },
    ],
  },
];

export const getGuia = (slug: string) => guias.find((g) => g.slug === slug);
