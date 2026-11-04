# Amigo Invisible

Sorteo de amigo invisible online, gratis y sin registro. Cada participante recibe por email a quién le toca regalar, con presupuesto, fecha del intercambio (con enlace a calendario) y un enlace privado para ver la lista de deseos de su amigo invisible y editar la suya. Los correos no se guardan nunca.

## Stack

Astro 5 (SSR en Vercel) · TypeScript · Tailwind v4 + daisyUI (tema `navidad` en `src/styles/global.css`) · iconos Lucide (`astro-icon`) · Resend (o Gmail como alternativa) · Upstash Redis (listas de deseos) · reCAPTCHA v3.

## Desarrollo

```bash
npm ci
cp .env.example .env   # rellena lo que necesites; sin claves el envío se simula
npm run dev            # http://localhost:4321
npm test               # lógica del sorteo
npm run build          # comprobación de tipos + build
```

## Variables de entorno

Ver `.env.example`. Para producción: `SITE_URL`, `RESEND_API_KEY` + `MAIL_FROM` (dominio verificado en Resend), `RECAPTCHA_SITEKEY` / `RECAPTCHA_SECRET`, `ALLOWED_ORIGIN` y, opcional, `PUBLIC_DONATE_URL`.

## Listas de deseos editables

Al crear el sorteo se guarda, con un token aleatorio de 128 bits por participante, solo: nombre, lista, token de a quién regala, nombre del sorteo, presupuesto y fecha. Nunca correos. Todo caduca solo (TTL): 7 días después del intercambio, o 45 días sin fecha. Sin Redis configurado en producción la función se desactiva y el correo sale sin enlace; en desarrollo se usa memoria.

Para activarlo: en Vercel, Marketplace → Upstash Redis (plan gratuito); añade `UPSTASH_REDIS_REST_URL` y `UPSTASH_REDIS_REST_TOKEN` (o `KV_REST_API_URL`/`KV_REST_API_TOKEN`).

## Efectos navideños

Nieve en canvas (`src/scripts/nieve.ts`, se pausa fuera de pantalla) y trineo de Papá Noel en SVG (`src/components/Trineo.astro`). Ambos se desactivan con `prefers-reduced-motion`.

## SEO

Páginas por intención de búsqueda en `src/data/landings.ts` (`/amigo-invisible/<slug>`), guía de regalos en `/ideas-regalo`, `sitemap.xml`, `robots.txt`, canonical, Open Graph y JSON-LD (WebSite, Organization, FAQPage, BreadcrumbList, WebApplication).

## Seguridad

Validación y saneado en servidor, máximo 40 participantes, reCAPTCHA, campo trampa anti-bots, límite por IP y comprobación de origen. El servidor nunca devuelve quién regala a quién.

Licencia MIT.
