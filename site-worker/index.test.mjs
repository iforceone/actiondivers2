import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { isAppOnlyRoute } from './index.ts';

const INDEX = '<html>app</html>';
const FILES = new Set(['/index.html', '/about.html']);

const env = {
  ASSETS: {
    async fetch(request) {
      const { pathname } = new URL(request.url);
      const file = pathname === '/about' ? '/about.html' : pathname;
      if (FILES.has(file)) return new Response(file === '/index.html' ? INDEX : '<html>about</html>', { headers: { 'content-type': 'text/html' } });
      return new Response('Not found', { status: 404 });
    },
  },
};
const get = (path, init) => worker.fetch(new Request(`https://example.com${path}`, init), env);

test('serves existing pages untouched', async () => {
  const response = await get('/about');
  assert.equal(response.status, 200);
  assert.equal(await response.text(), '<html>about</html>');
});

test('unknown pages return the app with a real 404 and noindex', async () => {
  for (const path of ['/2-column/', '/contact-us', '/tour/nope', '/blog/old-post']) {
    const response = await get(path);
    assert.equal(response.status, 404, path);
    assert.equal(await response.text(), INDEX);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
  }
});

test('missing files stay plain 404s', async () => {
  const response = await get('/favicon.ico');
  assert.equal(response.status, 404);
  assert.notEqual(await response.text(), INDEX);
});

test('app-only routes load the app with 200', async () => {
  for (const path of ['/reservation/abc123', '/pay/xyz', '/payment/return', '/courses/request', '/transfers-charters/request', '/admin', '/admin/preview', '/plan-your-trip', '/adventures', '/tour/beach-bbq']) {
    const response = await get(path);
    assert.equal(response.status, 200, path);
    assert.equal(await response.text(), INDEX);
  }
});

test('customer link pages are private', async () => {
  for (const path of ['/reservation/abc123', '/pay/xyz', '/payment/return']) {
    const response = await get(path);
    assert.equal(response.headers.get('cache-control'), 'no-store', path);
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer', path);
    assert.match(response.headers.get('x-robots-tag'), /noindex/, path);
  }
});

test('non-GET requests pass through', async () => {
  const response = await get('/nothing', { method: 'POST' });
  assert.equal(response.status, 404);
  assert.notEqual(await response.text(), INDEX);
});

test('route matcher is strict', () => {
  assert.equal(isAppOnlyRoute('/reservation/'), false);
  assert.equal(isAppOnlyRoute('/reservation/a/b'), false);
  assert.equal(isAppOnlyRoute('/admin/other'), false);
});
