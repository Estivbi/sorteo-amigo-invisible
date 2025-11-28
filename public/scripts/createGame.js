// Client-side API: request server to create game and send emails. Does NOT store emails locally.
export async function handleCreateGame(
  gameName,
  budget,
  participants,
  exceptions,
) {
  // Leer sitekey desde meta
  const meta = document.querySelector('meta[name="recaptcha-sitekey"]')
  const siteKey = meta ? meta.getAttribute('content') : ''

  let recaptchaToken = null
  if (siteKey) {
    // Cargar grecaptcha si no está ya
    if (typeof grecaptcha === 'undefined') {
      await new Promise((resolve, reject) => {
        const s = document.createElement('script')
        s.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
        s.async = true
        s.defer = true
        s.onload = resolve
        s.onerror = reject
        document.head.appendChild(s)
      })
    }
    try {
      // grecaptcha.ready usa callback, no siempre devuelve Promise
      await new Promise((resolve) => {
        try {
          if (grecaptcha && typeof grecaptcha.ready === 'function') {
            grecaptcha.ready(resolve)
          } else {
            // Si no hay ready, esperar un pequeño retardo para inicialización
            setTimeout(resolve, 300)
          }
        } catch (e) {
          setTimeout(resolve, 300)
        }
      })

      if (grecaptcha && typeof grecaptcha.execute === 'function') {
        recaptchaToken = await grecaptcha.execute(siteKey, { action: 'create_game' })
      } else {
        console.warn('grecaptcha.execute is not available', typeof grecaptcha, grecaptcha)
      }
    } catch (err) {
      console.warn('reCAPTCHA token failed', err)
    }
  }

  // Log básico (no incluir emails completos)
  try {
    console.log('handleCreateGame: siteKey?', !!siteKey, 'recaptchaToken?', !!recaptchaToken)
    console.log('handleCreateGame: sending payload participants=', participants ? participants.length : 0)
  } catch (e) {}

  const res = await fetch('/api/create-game', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameName, budget, participants, exceptions, recaptchaToken }),
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data && data.error ? data.error : 'error_creating_game'
    const err = new Error(msg)
    // attach server response for richer client-side debugging
    try { err.serverData = data } catch(e) {}
    throw err
  }
  return data
}