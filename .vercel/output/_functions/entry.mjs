import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter__qkPRwzZ.mjs';
import { manifest } from './manifest_hC49g5YB.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/404.astro.mjs');
const _page2 = () => import('./pages/amigo/_token_.astro.mjs');
const _page3 = () => import('./pages/amigo-invisible/_slug_.astro.mjs');
const _page4 = () => import('./pages/api/create-game.astro.mjs');
const _page5 = () => import('./pages/api/lista.astro.mjs');
const _page6 = () => import('./pages/crear.astro.mjs');
const _page7 = () => import('./pages/ideas-regalo.astro.mjs');
const _page8 = () => import('./pages/privacidad.astro.mjs');
const _page9 = () => import('./pages/reglas.astro.mjs');
const _page10 = () => import('./pages/robots.txt.astro.mjs');
const _page11 = () => import('./pages/sitemap.xml.astro.mjs');
const _page12 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/404.astro", _page1],
    ["src/pages/amigo/[token].astro", _page2],
    ["src/pages/amigo-invisible/[slug].astro", _page3],
    ["src/pages/api/create-game.ts", _page4],
    ["src/pages/api/lista.ts", _page5],
    ["src/pages/crear.astro", _page6],
    ["src/pages/ideas-regalo.astro", _page7],
    ["src/pages/privacidad.astro", _page8],
    ["src/pages/reglas.astro", _page9],
    ["src/pages/robots.txt.ts", _page10],
    ["src/pages/sitemap.xml.ts", _page11],
    ["src/pages/index.astro", _page12]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "61864c29-3dea-490c-98f7-9ee5c4c9bdad",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
