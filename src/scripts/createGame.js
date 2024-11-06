// src/scripts/createGame.js

export async function handleCreateGame(
	gameName,
	budget,
	participants,
	exceptions
  ) {
	// Realizar el sorteo
	const assignments = assignGivers(participants, exceptions);
  
	// Guardar el juego en localStorage
	const game = {
	  name: gameName,
	  budget: budget,
	  participants: participants,
	  exceptions: exceptions,
	  assignments: assignments,
	  createdAt: new Date().toISOString(),
	};
  
	const games = JSON.parse(localStorage.getItem('games') || '[]');
	games.push(game);
	localStorage.setItem('games', JSON.stringify(games));
  
	// Enviar correos electrónicos a los participantes
	await sendEmails(assignments, budget);
  }
  
  function assignGivers(participants, exceptions) {
	const assignments = [];
	const receivers = [...participants];
  
	// Mezclar la lista de receptores
	for (let i = receivers.length - 1; i > 0; i--) {
	  const j = Math.floor(Math.random() * (i + 1));
	  [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
	}
  
	for (const giver of participants) {
	  let receiverIndex = -1;
  
	  // Encontrar un receptor válido
	  for (let i = 0; i < receivers.length; i++) {
		const receiver = receivers[i];
		if (
		  giver.email !== receiver.email &&
		  !exceptions.some((e) => e.from === giver.name && e.to === receiver.name)
		) {
		  receiverIndex = i;
		  break;
		}
	  }
  
	  if (receiverIndex === -1) {
		throw new Error(
		  "No se pudo asignar un receptor válido para todos los participantes."
		);
	  }
  
	  const receiver = receivers.splice(receiverIndex, 1)[0];
	  assignments.push({ giver, receiver });
	}
  
	return assignments;
  }
  
  async function sendEmails(assignments, budget) {
	for (const assignment of assignments) {
	  const { giver, receiver } = assignment;
	  const subject = 'Tu asignación de Amigo Invisible';
	  const body = `
		Hola ${giver.name},
		
		Te ha tocado regalar a ${receiver.name}.
		
		Presupuesto: ${budget} euros.
		
		¡Feliz Amigo Invisible!
	  `;
  
	  try {
		const response = await fetch('http://localhost:3000/send-email', {
		  method: 'POST',
		  headers: {
			'Content-Type': 'application/json',
		  },
		  body: JSON.stringify({ to: giver.email, subject, body }),
		});
  
		if (!response.ok) {
		  throw new Error(`HTTP error! status: ${response.status}`);
		}
  
		const result = await response.text();
		console.log(`Correo enviado a ${giver.email}: ${result}`);
	  } catch (error) {
		console.error(`Error al enviar correo a ${giver.email}:`, error);
		throw error;
	  }
	}
  }