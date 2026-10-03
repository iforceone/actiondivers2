// Front door for the static site (actiondivers2).
//
// The Vite build prerenders most pages, and the React app handles the rest in
// the browser. Cloudflare's "single-page-application" mode answers every unknown
// URL with index.html and a 200, which search engines treat as a soft 404. This
// Worker serves the same assets with `not_found_handling: "none"` and decides what
// to do when no file exists:
//   - an app-only route (customer links, forms, staff portal) gets index.html with 200;
//   - anything else that looks like a page gets index.html with a real 404, so the
//     React "Page not found" screen still renders;
//   - anything that looks like a file (favicon, .map, ...) gets a plain 404.

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  ASSETS: AssetFetcher;
}

// Routes in App.tsx that have no prerendered HTML file and are handled client-side.
// Keep in sync with <Route> entries; scripts/check-readiness.mjs enforces this.
export const APP_ONLY_ROUTES: RegExp[] = [
  /^\/reservation\/[^/]+\/?$/,
  /^\/pay\/[^/]+\/?$/,
  /^\/payment\/return\/?$/,
  /^\/courses\/request\/?$/,
  /^\/transfers-charters\/request\/?$/,
  /^\/admin(\/preview)?\/?$/,
  /^\/plan-your-trip\/?$/,
  /^\/adventures\/?$/,
  /^\/tour\/(diving-courses|beach-bbq)\/?$/,
];

// Private pages must never be indexed, cached, or leak their token in a referrer.
// These mirror public/_headers, which only applies to files that exist on disk.
const PRIVATE_PREFIXES = ['/reservation/', '/pay/', '/payment/'];

export function isAppOnlyRoute(pathname: string): boolean {
  return APP_ONLY_ROUTES.some((pattern) => pattern.test(pathname));
}

function withPrivateHeaders(response: Response, pathname: string): Response {
  const isPrivate = PRIVATE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  if (!isPrivate && !isAdmin) return response;
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  if (isPrivate) {
    headers.set('Referrer-Policy', 'no-referrer');
    headers.set('Cache-Control', 'no-store');
  }
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || (request.method !== 'GET' && request.method !== 'HEAD')) return response;

    const url = new URL(request.url);
    const lastSegment = url.pathname.split('/').pop() ?? '';
    if (lastSegment.includes('.')) return response; // a missing file, not a page

    const indexUrl = new URL('/index.html', url);
    const index = await env.ASSETS.fetch(new Request(indexUrl.toString(), { method: request.method, headers: request.headers }));
    if (!index.ok) return response;

    if (isAppOnlyRoute(url.pathname)) return withPrivateHeaders(index, url.pathname);

    const headers = new Headers(index.headers);
    headers.set('X-Robots-Tag', 'noindex');
    headers.set('Cache-Control', 'no-store');
    return new Response(index.body, { status: 404, statusText: 'Not Found', headers });
  },
};
