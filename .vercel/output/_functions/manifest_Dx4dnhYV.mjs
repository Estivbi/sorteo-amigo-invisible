import 'piccolore';
import { p as decodeKey } from './chunks/astro/server_BokeNo78.mjs';
import 'clsx';
import 'cookie';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_BoGJ7bQn.mjs';
import 'es-module-lexer';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/user/sorteo-amigo-invisible/","cacheDir":"file:///home/user/sorteo-amigo-invisible/node_modules/.astro/","outDir":"file:///home/user/sorteo-amigo-invisible/dist/","srcDir":"file:///home/user/sorteo-amigo-invisible/src/","publicDir":"file:///home/user/sorteo-amigo-invisible/public/","buildClientDir":"file:///home/user/sorteo-amigo-invisible/dist/client/","buildServerDir":"file:///home/user/sorteo-amigo-invisible/dist/server/","adapterName":"@astrojs/vercel","routes":[{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"page","component":"_server-islands.astro","params":["name"],"segments":[[{"content":"_server-islands","dynamic":false,"spread":false}],[{"content":"name","dynamic":true,"spread":false}]],"pattern":"^\\/_server-islands\\/([^/]+?)$","prerender":false,"isIndex":false,"fallbackRoutes":[],"route":"/_server-islands/[name]","origin":"internal","_meta":{"trailingSlash":"never"}}},{"file":"404.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/404","isIndex":false,"type":"page","pattern":"^\\/404$","segments":[[{"content":"404","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/404.astro","pathname":"/404","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"crear/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/crear","isIndex":false,"type":"page","pattern":"^\\/crear$","segments":[[{"content":"crear","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/crear.astro","pathname":"/crear","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"ideas-regalo/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/ideas-regalo","isIndex":false,"type":"page","pattern":"^\\/ideas-regalo$","segments":[[{"content":"ideas-regalo","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/ideas-regalo.astro","pathname":"/ideas-regalo","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"privacidad/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/privacidad","isIndex":false,"type":"page","pattern":"^\\/privacidad$","segments":[[{"content":"privacidad","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/privacidad.astro","pathname":"/privacidad","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"reglas/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/reglas","isIndex":false,"type":"page","pattern":"^\\/reglas$","segments":[[{"content":"reglas","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/reglas.astro","pathname":"/reglas","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"robots.txt","links":[],"scripts":[],"styles":[],"routeData":{"route":"/robots.txt","isIndex":false,"type":"endpoint","pattern":"^\\/robots\\.txt\\/?$","segments":[[{"content":"robots.txt","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/robots.txt.ts","pathname":"/robots.txt","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"sitemap.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/sitemap.xml","isIndex":false,"type":"endpoint","pattern":"^\\/sitemap\\.xml\\/?$","segments":[[{"content":"sitemap.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/sitemap.xml.ts","pathname":"/sitemap.xml","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"origin":"internal","_meta":{"trailingSlash":"never"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/create-game","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/create-game$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"create-game","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/create-game.ts","pathname":"/api/create-game","prerender":false,"fallbackRoutes":[],"distURL":[],"origin":"project","_meta":{"trailingSlash":"never"}}}],"site":"https://sorteo-amigo-invisible.vercel.app","base":"/","trailingSlash":"never","compressHTML":true,"componentMetadata":[["/home/user/sorteo-amigo-invisible/src/pages/404.astro",{"propagation":"none","containsHead":true}],["/home/user/sorteo-amigo-invisible/src/pages/amigo-invisible/[slug].astro",{"propagation":"none","containsHead":true}],["/home/user/sorteo-amigo-invisible/src/pages/crear.astro",{"propagation":"none","containsHead":true}],["/home/user/sorteo-amigo-invisible/src/pages/ideas-regalo.astro",{"propagation":"none","containsHead":true}],["/home/user/sorteo-amigo-invisible/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/home/user/sorteo-amigo-invisible/src/pages/privacidad.astro",{"propagation":"none","containsHead":true}],["/home/user/sorteo-amigo-invisible/src/pages/reglas.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener(\"change\",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000noop-middleware":"_noop-middleware.mjs","\u0000virtual:astro:actions/noop-entrypoint":"noop-entrypoint.mjs","\u0000@astro-page:src/pages/404@_@astro":"pages/404.astro.mjs","\u0000@astro-page:src/pages/amigo-invisible/[slug]@_@astro":"pages/amigo-invisible/_slug_.astro.mjs","\u0000@astro-page:src/pages/api/create-game@_@ts":"pages/api/create-game.astro.mjs","\u0000@astro-page:src/pages/crear@_@astro":"pages/crear.astro.mjs","\u0000@astro-page:src/pages/ideas-regalo@_@astro":"pages/ideas-regalo.astro.mjs","\u0000@astro-page:src/pages/privacidad@_@astro":"pages/privacidad.astro.mjs","\u0000@astro-page:src/pages/reglas@_@astro":"pages/reglas.astro.mjs","\u0000@astro-page:src/pages/robots.txt@_@ts":"pages/robots.txt.astro.mjs","\u0000@astro-page:src/pages/sitemap.xml@_@ts":"pages/sitemap.xml.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000@astrojs-manifest":"manifest_Dx4dnhYV.mjs","/home/user/sorteo-amigo-invisible/node_modules/astro/dist/assets/services/sharp.js":"chunks/sharp_Cak5HdAR.mjs","/home/user/sorteo-amigo-invisible/src/pages/crear.astro?astro&type=script&index=0&lang.ts":"_astro/crear.astro_astro_type_script_index_0_lang.B5rGi1KU.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_slug_.BpbzmxSn.css","/apple-touch-icon.png","/favicon-32.png","/favicon.svg","/og.png","/site.webmanifest","/_astro/crear.astro_astro_type_script_index_0_lang.B5rGi1KU.js","/404.html","/crear/index.html","/ideas-regalo/index.html","/privacidad/index.html","/reglas/index.html","/robots.txt","/sitemap.xml","/index.html"],"buildFormat":"directory","checkOrigin":true,"allowedDomains":[],"serverIslandNameMap":[],"key":"CXkus89EA+FmHqHMCvW+cPkZO5D55xUVXICcjPdo5Zs="});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
