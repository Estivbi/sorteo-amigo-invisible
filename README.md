# Amigo Invisible

Sorteo de amigo invisible online, gratis y sin registro. Cada participante recibe por email a quién le toca regalar, con presupuesto, fecha del intercambio (con enlace a calendario) y la lista de deseos de su amigo invisible. No se guarda ningún dato.

## Stack

Astro 5 (SSR en Vercel) · TypeScript · CSS con tokens propios · Resend (o Gmail como alternativa) · reCAPTCHA v3.

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

## SEO

Páginas por intención de búsqueda en `src/data/landings.ts` (`/amigo-invisible/<slug>`), guía de regalos en `/ideas-regalo`, `sitemap.xml`, `robots.txt`, canonical, Open Graph y JSON-LD (WebSite, Organization, FAQPage, BreadcrumbList, WebApplication).

## Seguridad

Validación y saneado en servidor, máximo 40 participantes, reCAPTCHA, campo trampa anti-bots, límite por IP y comprobación de origen. El servidor nunca devuelve quién regala a quién.

Licencia MIT.
