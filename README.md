# Amigo Invisible

Sorteo de amigo invisible online, gratis y sin registro. Cada participante recibe por email a quién le toca regalar, con presupuesto, fecha del intercambio (con enlace a calendario) y un enlace privado para ver la lista de deseos de su amigo invisible y editar la suya. Los correos no se guardan nunca.

## Stack

Astro 5 (SSR en Vercel) · TypeScript · Tailwind v4 + daisyUI (tema `navidad` en `src/styles/global.css`) · iconos Lucide (`astro-icon`) · Resend (o Gmail como alternativa) · Upstash Redis (listas de deseos) · Cloudflare Turnstile.

## Desarrollo

```bash
npm ci
cp .env.example .env   # rellena lo que necesites; sin claves el envío se simula
npm run dev            # http://localhost:4321
npm test               # lógica del sorteo
npm run build          # comprobación de tipos + build
```

## Variables de entorno

Ver `.env.example`. Para producción: `SITE_URL`, `RESEND_API_KEY` + `MAIL_FROM` (dominio verificado en Resend), `PUBLIC_TURNSTILE_SITEKEY` / `TURNSTILE_SECRET`, `ALLOWED_ORIGIN` y, opcional, `PUBLIC_DONATE_URL`.

## Protección contra abuso y métricas

Pensado para el plan gratuito de Resend (100 correos al día, 3.000 al mes). Antes de enviar nada, cada sorteo reserva cupo en Upstash; si no cabe, se rechaza con un mensaje claro y se avisa por Telegram.

| Límite | Variable | Por defecto |
|---|---|---|
| Correos al día en toda la web | `LIMITE_CORREOS_DIA` | 80 |
| Correos al día a una misma dirección | `LIMITE_POR_DESTINATARIO` | 15 |
| Sorteos al día desde una misma IP | `LIMITE_SORTEOS_IP_DIA` | 15 |

- Los contadores usan una **huella HMAC** de la IP y del correo (no se guardan en claro) y caducan a las 26 horas. El día se cuenta con la hora de Madrid.
- Con envío real de correos, sin base de datos o sin `TURNSTILE_SECRET` no se crean sorteos.
- Si el envío falla, el cupo reservado se devuelve.
- **Estadísticas:** `/estadisticas` (con `ADMIN_TOKEN`) muestra el uso de los últimos 14 días. Se guardan contadores diarios, sin datos personales, 90 días.
- **Avisos por Telegram** (`TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID`): 80 % del tope, tope alcanzado, errores de envío, abuso por IP o por dirección y configuración que falta. Como mucho uno por tipo cada hora, salvo el del 80 % que es diario.
- Cada respuesta de `/api/create-game` lleva `Server-Timing` con lo que tarda cada paso.

## Correos sin respuesta

Los correos son automáticos y no admiten respuesta: no llevan `Reply-To`, llevan las cabeceras `Auto-Submitted: auto-generated` y `X-Auto-Response-Suppress: All` (evitan respuestas automáticas como «fuera de la oficina») y terminan con un aviso. Usa un remitente sin buzón, por ejemplo `MAIL_FROM="Amigo Invisible <no-reply@tudominio.com>"`, y no crees para él ningún alias ni catch-all. Con Gmail (solo para pruebas) las respuestas llegan a esa cuenta, porque no se puede evitar.

## Listas de deseos editables

Al crear el sorteo se guarda, con un token aleatorio de 128 bits por participante, solo: nombre, lista, token de a quién regala, nombre del sorteo, presupuesto y fecha. Nunca correos. Todo caduca solo (TTL): 7 días después del intercambio, o 45 días sin fecha. Sin Redis configurado en producción la función se desactiva y el correo sale sin enlace; en desarrollo se usa memoria.

Para activarlo: en Vercel, Marketplace → Upstash Redis (plan gratuito); añade `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o `KV_REST_API_URL`/`KV_REST_API_TOKEN`).

## Efectos navideños

Nieve en canvas (`src/scripts/nieve.ts`, se pausa fuera de pantalla) y trineo de Papá Noel en SVG (`src/components/Trineo.astro`). Ambos se desactivan con `prefers-reduced-motion`.

## Monetización

Todo es opcional y se activa por variables de entorno; sin ellas no aparece ningún enlace de afiliado ni de donación.

- `PUBLIC_AMAZON_TAG`: etiqueta de Amazon Afiliados. Activa los botones «Buscar» en `/ideas-regalo`, «Buscar este regalo» en la página privada y el aviso legal en el pie.
- `PUBLIC_VIAJES_URL`: enlace de afiliado a excursiones en Rovaniemi.
- `PUBLIC_DONATE_URL`: enlace de donación.

Los enlaces llevan `rel="sponsored nofollow noopener noreferrer"`. Solo se envía un término de búsqueda a la tienda cuando la persona pulsa el botón. Ideas para una versión premium en `TODO.md`.

## SEO

Páginas por intención de búsqueda en `src/data/landings.ts` (`/amigo-invisible/<slug>`), guía de regalos en `/ideas-regalo`, `sitemap.xml`, `robots.txt`, canonical, Open Graph y JSON-LD (WebSite, Organization, FAQPage, BreadcrumbList, WebApplication).

## Seguridad

Validación y saneado en servidor, máximo 40 participantes, Cloudflare Turnstile (obligatorio cuando se envían correos reales), campo trampa anti-bots, límite por IP y comprobación de origen. El servidor nunca devuelve quién regala a quién.

Licencia MIT.
