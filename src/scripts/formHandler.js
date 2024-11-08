// src/scripts/formHandler.js
import { handleCreateGame } from './createGame.js';

export function setupFormHandler() {
  document.addEventListener('DOMContentLoaded', () => {
    const formElement = document.getElementById('create-game-form');

    if (formElement) {
      formElement.addEventListener('submit', async (event) => {
        event.preventDefault();
        const form = event.target;
        const gameName = form.elements.namedItem('gameName').value;
        const budget = parseFloat(form.elements.namedItem('budget').value);
        const participants = form.elements.namedItem('participants').value.split(',').map(p => {
          const [name, email] = p.trim().split(' ');
          return { name, email };
        });
        const exceptions = form.elements.namedItem('exceptions').value.split(',').map(e => {
          const [from, to] = e.trim().split('->').map(name => name.trim());
          return { from, to };
        });
        await handleCreateGame(gameName, budget, participants, exceptions);
        alert('Juego creado exitosamente');
        window.location.href = '/'; // Redirigir a la página de inicio
      });
    } else {
      console.error('El formulario con ID "create-game-form" no se encontró en el DOM.');
    }
  });
}

setupFormHandler(); 