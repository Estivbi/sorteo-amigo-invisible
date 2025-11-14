// src/scripts/createGame.js

export async function handleCreateGame(
  gameName,
  budget,
  participants,
  exceptions,
) {
  // Realizar el sorteo
  const assignments = assignGivers(participants, exceptions)

  // Guardar el juego en localStorage
  const game = {
    name: gameName,
    budget: budget,
    participants: participants,
    exceptions: exceptions,
    assignments: assignments,
    createdAt: new Date().toISOString(),
  }

  const games = JSON.parse(localStorage.getItem("games") || "[]")
  games.push(game)
  localStorage.setItem("games", JSON.stringify(games))

  // Enviar correos electrónicos a los participantes
  await sendEmails(assignments, budget, gameName)
}

function assignGivers(participants, exceptions) {
  const maxTries = 2000;
  function isValid(assignments) {
    // Ningún participante puede regalarse a sí mismo
    for (const a of assignments) {
      if (a.giver.id === a.receiver.id) return false;
    }
    // Ninguna excepción puede cumplirse
    for (const ex of exceptions) {
      if (assignments.some(a => String(a.giver.id) === String(ex.from) && String(a.receiver.id) === String(ex.to))) {
        return false;
      }
    }
    return true;
  }
  for (let attempt = 0; attempt < maxTries; attempt++) {
    // Permutación aleatoria de receptores
    const receivers = [...participants];
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }
    const assignments = participants.map((giver, idx) => ({ giver, receiver: receivers[idx] }));
    if (isValid(assignments)) {
      return assignments;
    }
  }
  throw new Error("No se pudo asignar un receptor válido para todos los participantes después de varios intentos. Revisa las excepciones.");
}

// Envío en paralelo
async function sendEmails(assignments, budget, gameName) {
  const emailPromises = assignments.map(({ giver, receiver }) => {
    const subject = "Tu asignación de Amigo Invisible";
    const body = `
Hola ${giver.name},

¡Has sido seleccionado para el juego "${gameName}"! 🎉

Te ha tocado regalar a ${receiver.name}.

Presupuesto: ${budget} euros.

¡Feliz Amigo Invisible! 🎁
    `;

    return fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: giver.email, subject, body }),
    }).catch(error => {
      console.error(`Error al enviar correo a ${giver.email}:`, error);
      return { error: true, email: giver.email };
    });
  });

  const results = await Promise.all(emailPromises);
  const errors = results.filter(r => r.error);
  
  if (errors.length > 0) {
    throw new Error(`No se pudieron enviar ${errors.length} correos`);
  }
}
