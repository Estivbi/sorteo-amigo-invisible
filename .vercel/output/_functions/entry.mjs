import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_CWEaBIfb.mjs';
import { manifest } from './manifest_Dx4dnhYV.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/amigo-invisible/_slug_.astro.mjs');
const _page3 = () => import('./pages/api/create-game.astro.mjs');
const _page4 = () => import('./pages/crear.astro.mjs');
const _page5 = () => import('./pages/ideas-regalo.astro.mjs');
const _page6 = () => import('./pages/privacidad.astro.mjs');
const _page7 = () => import('./pages/reglas.astro.mjs');
const _page8 = () => import('./pages/robots.txt.astro.mjs');
const _page9 = () => import('./pages/sitemap.xml.astro.mjs');
const _page10 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/amigo-invisible/[slug].astro", _page2],
    ["src/pages/api/create-game.ts", _page3],
    ["src/pages/crear.astro", _page4],
    ["src/pages/ideas-regalo.astro", _page5],
    ["src/pages/privacidad.astro", _page6],
    ["src/pages/reglas.astro", _page7],
    ["src/pages/robots.txt.ts", _page8],
    ["src/pages/sitemap.xml.ts", _page9],
    ["src/pages/index.astro", _page10]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "64f95ea7-b47f-492a-8d55-a9f76ce6c2ed",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
