// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';

// URL pública: se usa para canonical, sitemap y Open Graph.
const site = process.env.SITE_URL || 'https://sorteo-amigo-invisible.vercel.app';

// https://astro.build/config
export default defineConfig({
  site,
  integrations: [icon()],
  output: 'server',
  adapter: vercel(),
  trailingSlash: 'never',
  vite: { plugins: [tailwindcss()] },
});
