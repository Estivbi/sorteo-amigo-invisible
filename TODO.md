# Pendiente

- Configurar en Vercel: dominio propio, Resend (dominio verificado), reCAPTCHA y `PUBLIC_DONATE_URL`.
- Alta en Google Search Console y envío del sitemap.
- Crear la base Upstash Redis en Vercel y añadir sus variables (sin ella no hay enlaces de edición).
- Verificar la URL de la Aldea de Papá Noel (https://santaclausvillage.info/) y, si quieres, añadir tu experiencia en Laponia.
- Contador público de sorteos (ahora que hay Redis es sencillo).
- Limitador de peticiones distribuido en Upstash en lugar del actual en memoria.
- Enlaces de afiliado en `/ideas-regalo`.

## Ideas futuras: versión premium

No está en marcha, pero encaja con lo que ya hay (Upstash Redis para guardar datos y cobros con Stripe).

**Para empresas (el nicho que sí paga)**
- Sorteos de más de 40 personas y varios grupos a la vez (equipos, oficinas, delegaciones).
- Logo y colores de la empresa en la web del sorteo y en los correos.
- Panel para RR. HH.: quién ha confirmado, quién ha escrito su lista, reenvío de correos.
- Factura y pago anual por sorteo o por empresa.

**Extras para particulares (pago único pequeño)**
- Recordatorios automáticos antes de la fecha del intercambio.
- Correos con diseño personalizado y mensaje propio del organizador.
- Pistas anónimas: el amigo invisible puede mandar pistas sin revelarse.
- Sorteos recurrentes cada año, con las excepciones guardadas.

**Antes de construirlo**
- Medir tráfico y sorteos creados tras esta campaña de Navidad.
- Preguntar a 5 o 10 usuarios reales qué pagarían.
- Decidir precio y comprobar la parte legal (facturación, IVA, privacidad de los datos que se guarden).

## Monetización (en marcha)

- Afiliación de Amazon en `/ideas-regalo` y botón «Buscar este regalo» en la página privada del participante. Se activa con `PUBLIC_AMAZON_TAG`.
- Enlace de afiliado de viajes a Rovaniemi en la sección de Laponia. Se activa con `PUBLIC_VIAJES_URL`.
- Donación con `PUBLIC_DONATE_URL`.
- Otros programas a valorar: Awin (agrupa tiendas como Etsy), Civitatis y GetYourGuide para las excursiones, Booking para alojamiento.
