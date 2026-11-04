export interface RangoIdeas {
  id: string;
  precio: string;
  titulo: string;
  /** t: texto que se muestra; q: término de búsqueda para el enlace de afiliado. */
  ideas: { t: string; q: string }[];
}

export const rangos: RangoIdeas[] = [
  {
    id: '5-euros',
    precio: 'Hasta 5 €',
    titulo: 'Ideas de regalo para amigo invisible de 5 euros',
    ideas: [{ t: 'Taza con un mensaje divertido', q: 'taza mensaje divertido' }, { t: 'Calcetines navideños', q: 'calcetines navideños' }, { t: 'Pack de chocolates artesanos', q: 'chocolates artesanos' }, { t: 'Libreta y bolígrafo bonitos', q: 'libreta bolígrafo bonitos' }, { t: 'Vela aromática pequeña', q: 'vela aromática' }, { t: 'Gorro de lana o guantes básicos', q: 'gorro lana guantes' }, { t: 'Juego de cartas', q: 'juego de cartas' }],
  },
  {
    id: '10-euros',
    precio: 'Hasta 10 €',
    titulo: 'Ideas de regalo para amigo invisible de 10 euros',
    ideas: [{ t: 'Set de té o café de especialidad', q: 'set té café especialidad' }, { t: 'Planta pequeña con maceta', q: 'planta pequeña maceta' }, { t: 'Altavoz o cargador portátil básico', q: 'altavoz bluetooth pequeño' }, { t: 'Juego de mesa de bolsillo', q: 'juego de mesa de bolsillo' }, { t: 'Cocina: set de especias o aceites', q: 'set especias cocina' }, { t: 'Mascarilla y cosmética de autocuidado', q: 'set cosmética autocuidado' }, { t: 'Taza térmica reutilizable', q: 'taza térmica reutilizable' }],
  },
  {
    id: '20-euros',
    precio: 'Hasta 20 €',
    titulo: 'Ideas de regalo para amigo invisible de 20 euros',
    ideas: [{ t: 'Auriculares inalámbricos sencillos', q: 'auriculares inalámbricos' }, { t: 'Manta suave para el sofá', q: 'manta suave sofá' }, { t: 'Cena o aperitivo en una cesta gourmet', q: 'cesta gourmet' }, { t: 'Libro de tapa dura de su género favorito', q: 'libro tapa dura' }, { t: 'Juego de mesa familiar', q: 'juego de mesa familiar' }, { t: 'Neceser o bolsa de tela de calidad', q: 'neceser' }, { t: 'Termo de acero inoxidable', q: 'termo acero inoxidable' }],
  },
  {
    id: '30-euros',
    precio: 'Hasta 30 €',
    titulo: 'Ideas de regalo para amigo invisible de 30 euros',
    ideas: [{ t: 'Lámpara de ambiente o luz LED', q: 'lámpara ambiente led' }, { t: 'Pack de experiencias: cata o taller', q: 'caja experiencias regalo' }, { t: 'Cartera o cinturón de cuero', q: 'cartera cuero' }, { t: 'Botella de vino o licor de calidad', q: 'vino regalo' }, { t: 'Pulsera, reloj sencillo o accesorio', q: 'pulsera reloj sencillo' }, { t: 'Suscripción a una plataforma durante unos meses', q: 'tarjeta regalo suscripción' }, { t: 'Cafetera de émbolo o molinillo manual', q: 'cafetera émbolo molinillo manual' }],
  },
];
