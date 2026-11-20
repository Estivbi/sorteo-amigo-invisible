# Tareas y Estado del Proyecto

## Completado en el código (listo para desplegar)

- [x] **Crecimiento en el producto (A):**
  - Pie con enlace de vuelta en cada correo enviado («¿Organizas otro amigo invisible? Crea el tuyo gratis en...») tanto en versión texto como en HTML responsive.
  - Botón de compartir por WhatsApp optimizado en la pantalla de éxito con mensaje preparado para el grupo.
- [x] **Indexación Bing / IndexNow (D):**
  - Clave de verificación IndexNow (`e892c906a2cf4e819b91e92d7701dc28.txt`) añadida a `public/`.
  - Script automatizado `scripts/indexnow.ts` y comando `npm run indexnow` para notificar a Bing las 15 URLs canónicas.
  - Test unitario de IndexNow verificado.
- [x] **Marketing y Contenidos (B):**
  - Guiones de vídeo vertical (TikTok/Reels/Shorts) e ideas de publicación en comunidades (Reddit, X, LinkedIn, WhatsApp) redactados y listos en la carpeta de artefactos.
- [x] **Tests unitarios:** 111 pruebas pasando al 100% (resuelto el desacople de `sharp` en los tests de contenido).

---

## Tuyo ahora (requiere acción fuera del código)

- [x] **Ramas antiguas borradas en GitHub:**
  - `feature/enlaces-en-lista-de-deseos` y `fix/quitar-borrado-manual` eliminadas del repositorio remoto.
2. **Google Search Console & Bing Webmaster Tools:**
   - En Search Console: pedir indexación de `/guias` y `/contacto`, comprobar estado del sitemap.
   - En Bing Webmaster Tools: dar de alta el sitio (importar con 1 clic desde Search Console) y ejecutar `npm run indexnow`.
3. **Variables de entorno en Vercel:**
   - `PUBLIC_DONATE_URL`: enlace de Ko-fi, Buy Me a Coffee o PayPal.me.
4. **Revisión de guías:**
   - Leer `/guias` en la web y decidir si quieres añadir o retocar texto.

---

## Decisiones operativas

- **Límite de correos de Resend:**
  - El plan gratuito tiene 100 correos/día y 3.000/mes (el sistema tiene tope en 80/día con aviso por Telegram al 80%).
  - Decidir si se asume el tope en días de pico o si se activa el plan de pago de Resend (~20 $/mes) si el volumen aumenta.

---

## Próximos pasos de producto

- **Nuevas guías y landings (C):**
  - Reyes Magos (`/amigo-invisible/reyes`).
  - Amigo invisible por WhatsApp.
  - Parejas y grupos grandes.
- **Después de Reyes (8 de enero):**
  - Cambiar el tema navideño por uno neutro (hero, nieve, trineo, sección de Laponia, paleta, textos con «Navidad», imagen `og.png` y correos).

