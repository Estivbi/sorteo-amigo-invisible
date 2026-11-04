/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
  readonly RECAPTCHA_SITEKEY?: string;
  readonly RECAPTCHA_SECRET?: string;
  readonly RESEND_API_KEY?: string;
  readonly MAIL_FROM?: string;
  readonly MAIL_REPLYTO?: string;
  readonly GMAIL_USER?: string;
  readonly GMAIL_PASS?: string;
  readonly ALLOWED_ORIGIN?: string;
  readonly DEV_BYPASS_EMAILS?: string;
  readonly PUBLIC_DONATE_URL?: string;
  readonly SITE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
