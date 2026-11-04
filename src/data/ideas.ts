export interface RangoIdeas {
  id: string;
  precio: string;
  titulo: string;
  ideas: string[];
}

export const rangos: RangoIdeas[] = [
  {
    id: '5-euros',
    precio: 'Hasta 5 €',
    titulo: 'Ideas de regalo para amigo invisible de 5 euros',
    ideas: ['Taza con un mensaje divertido', 'Calcetines navideños', 'Pack de chocolates artesanos', 'Libreta y bolígrafo bonitos', 'Vela aromática pequeña', 'Gorro de lana o guantes básicos', 'Juego de cartas'],
  },
  {
    id: '10-euros',
    precio: 'Hasta 10 €',
    titulo: 'Ideas de regalo para amigo invisible de 10 euros',
    ideas: ['Set de té o café de especialidad', 'Planta pequeña con maceta', 'Altavoz o cargador portátil básico', 'Juego de mesa de bolsillo', 'Cocina: set de especias o aceites', 'Mascarilla y cosmética de autocuidado', 'Taza térmica reutilizable'],
  },
  {
    id: '20-euros',
    precio: 'Hasta 20 €',
    titulo: 'Ideas de regalo para amigo invisible de 20 euros',
    ideas: ['Auriculares inalámbricos sencillos', 'Manta suave para el sofá', 'Cena o aperitivo en una cesta gourmet', 'Libro de tapa dura de su género favorito', 'Juego de mesa familiar', 'Neceser o bolsa de tela de calidad', 'Termo de acero inoxidable'],
  },
  {
    id: '30-euros',
    precio: 'Hasta 30 €',
    titulo: 'Ideas de regalo para amigo invisible de 30 euros',
    ideas: ['Lámpara de ambiente o luz LED', 'Pack de experiencias: cata o taller', 'Cartera o cinturón de cuero', 'Botella de vino o licor de calidad', 'Pulsera, reloj sencillo o accesorio', 'Suscripción a una plataforma durante unos meses', 'Cafetera de émbolo o molinillo manual'],
  },
];
