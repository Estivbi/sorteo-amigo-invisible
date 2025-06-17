// src/scripts/formHandler.js
import { handleCreateGame } from "./createGame.js"

export function setupFormHandler() {
  document.addEventListener("DOMContentLoaded", () => {
    const formElement = document.getElementById("create-game-form")
    const participantsList = document.getElementById("participants-list")
    const addParticipantBtn = document.getElementById("add-participant")
    const exceptionsList = document.getElementById("exceptions-list")
    const addExceptionBtn = document.getElementById("add-exception")

    let participantId = 0
    let participants = []

    function renderParticipants() {
      participantsList.innerHTML = ""
      participants.forEach((p, idx) => {
        const div = document.createElement("div")
        div.className = "flex gap-2 mb-2 items-center"
        div.innerHTML = `
          <input type="text" placeholder="Nombre" value="${p.name || ""}" class="p-1 border rounded" data-idx="${idx}" data-type="name" required style="width: 40%" />
          <input type="email" placeholder="Correo" value="${p.email || ""}" class="p-1 border rounded" data-idx="${idx}" data-type="email" required style="width: 50%" />
          <button type="button" class="remove-participant bg-red-500 text-white px-2 rounded" data-idx="${idx}">X</button>
        `
        participantsList.appendChild(div)
      })
    }

    function updateParticipant(idx, type, value) {
      participants[idx][type] = value
    }

    addParticipantBtn.addEventListener("click", () => {
      participants.push({ id: participantId++, name: "", email: "" })
      renderParticipants()
      renderExceptions()
    })

    participantsList.addEventListener("input", (e) => {
      const target = e.target
      const idx = target.getAttribute("data-idx")
      const type = target.getAttribute("data-type")
      if (idx !== null && type) {
        updateParticipant(Number(idx), type, target.value)
        renderExceptions()
      }
    })

    participantsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-participant")) {
        const idx = e.target.getAttribute("data-idx")
        participants.splice(Number(idx), 1)
        renderParticipants()
        renderExceptions()
      }
    })

    // Excepciones dinámicas
    let exceptions = []
    function renderExceptions() {
      exceptionsList.innerHTML = ""
      exceptions.forEach((ex, idx) => {
        const div = document.createElement("div")
        div.className = "flex gap-2 mb-2 items-center"
        div.innerHTML = `
          <select data-idx="${idx}" data-type="from" class="p-1 border rounded" required>
            <option value="">Quien NO regala</option>
            ${participants.map(p => `<option value="${p.id}" ${ex.from == p.id ? "selected" : ""}>${p.name || "Participante"}</option>`).join("")}
          </select>
          <span>no puede regalar a</span>
          <select data-idx="${idx}" data-type="to" class="p-1 border rounded" required>
            <option value="">A quién NO regala</option>
            ${participants.map(p => `<option value="${p.id}" ${ex.to == p.id ? "selected" : ""}>${p.name || "Participante"}</option>`).join("")}
          </select>
          <button type="button" class="remove-exception bg-red-500 text-white px-2 rounded" data-idx="${idx}">X</button>
        `
        exceptionsList.appendChild(div)
      })
    }

    addExceptionBtn.addEventListener("click", () => {
      exceptions.push({ from: "", to: "" })
      renderExceptions()
    })

    exceptionsList.addEventListener("change", (e) => {
      const target = e.target
      const idx = target.getAttribute("data-idx")
      const type = target.getAttribute("data-type")
      if (idx !== null && type) {
        exceptions[idx][type] = target.value
      }
    })

    exceptionsList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-exception")) {
        const idx = e.target.getAttribute("data-idx")
        exceptions.splice(Number(idx), 1)
        renderExceptions()
      }
    })

    // Inicializar con dos participantes por defecto
    participants = [
      { id: participantId++, name: "", email: "" },
      { id: participantId++, name: "", email: "" },
    ]
    renderParticipants()
    renderExceptions()

    if (formElement) {
      formElement.addEventListener("submit", async (event) => {
        event.preventDefault()
        const gameName = formElement.elements.namedItem("gameName").value
        const budget = parseFloat(formElement.elements.namedItem("budget").value)
        // Filtrar participantes válidos
        const validParticipants = participants.filter(p => p.name && p.email)
        // Filtrar excepciones válidas
        const validExceptions = exceptions.filter(ex => ex.from !== "" && ex.to !== "" && ex.from !== ex.to)
        try {
          await handleCreateGame(gameName, budget, validParticipants, validExceptions)
          // Mostrar modal de éxito
          const modal = document.getElementById("success-modal")
          if (modal) modal.classList.remove("hidden")
        } catch (err) {
          alert("Hubo un error al crear el juego o enviar los correos. Intenta de nuevo.")
        }
      })
      // Cerrar el modal
      const closeModalBtn = document.getElementById("close-modal")
      if (closeModalBtn) {
        closeModalBtn.addEventListener("click", () => {
          const modal = document.getElementById("success-modal")
          if (modal) modal.classList.add("hidden")
          window.location.href = "/"
        })
      }
    } else {
      console.error(
        'El formulario con ID "create-game-form" no se encontró en el DOM.',
      )
    }
  })
}

setupFormHandler()
