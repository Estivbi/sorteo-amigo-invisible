/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly PUBLIC_TURNSTILE_SITEKEY?: string;
  readonly TURNSTILE_SECRET?: string;
  readonly RESEND_API_KEY?: string;
  readonly MAIL_FROM?: string;
  readonly GMAIL_USER?: string;
  readonly GMAIL_PASS?: string;
  readonly ALLOWED_ORIGIN?: string;
  readonly DEV_BYPASS_EMAILS?: string;
  readonly PUBLIC_DONATE_URL?: string;
  readonly SITE_URL?: string;
  readonly ADMIN_TOKEN?: string;
  readonly TELEGRAM_BOT_TOKEN?: string;
  readonly TELEGRAM_CHAT_ID?: string;
  readonly LIMITE_CORREOS_DIA?: string;
  readonly LIMITE_POR_DESTINATARIO?: string;
  readonly LIMITE_SORTEOS_IP_DIA?: string;
  readonly PUBLIC_AMAZON_TAG?: string;
  readonly PUBLIC_VIAJES_URL?: string;
  readonly UPSTASH_REDIS_REST_URL?: string;
  readonly UPSTASH_REDIS_REST_TOKEN?: string;
  readonly KV_REST_API_URL?: string;
  readonly KV_REST_API_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
