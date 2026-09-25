// Validate the prepared release with checkout disabled. This does not deploy.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { SITE_URL } from '../site.mjs';

const read = (file) => fs.readFileSync(file, 'utf8');
const config = read('worker-api/wrangler.toml');
const section = (name) => {
  const marker = `[${name}]`;
  const start = config.indexOf(marker);
  assert.ok(start >= 0, `Missing ${marker}`);
  return config.slice(start + marker.length).split(/^\[/m)[0];
};
const value = (block, key) => block.match(new RegExp(`^${key}\\s*=\\s*"([^"]*)"`, 'm'))?.[1];
const production = section('vars');
const preview = section('env.preview.vars');
assert.equal(SITE_URL, 'https://actiondiversbelize.com');
assert.equal(value(production, 'PAYMENT_SITE_ORIGIN'), SITE_URL);
assert.equal(value(production, 'PAYMENT_ENVIRONMENT'), 'production');
assert.equal(value(production, 'PAYMENTS_ENABLED'), 'false', 'Initial launch must keep checkout disabled.');
assert.deepEqual(value(production, 'ALLOWED_ORIGINS').split(',').sort(), [SITE_URL, 'https://www.actiondiversbelize.com'].sort());
assert.equal(value(production, 'FROM_EMAIL'), 'Action Divers & Adventures <info@actiondiversbelize.com>');
assert.equal(value(production, 'TO_EMAIL'), 'info@actiondiversbelize.com');
assert.equal(value(preview, 'PAYMENT_ENVIRONMENT'), 'sandbox');
assert.equal(value(preview, 'PAYMENT_SITE_ORIGIN'), 'https://codex-action-divers-work-actiondivers2.davebze.workers.dev');
assert.equal(value(preview, 'PAYMENTS_ENABLED'), 'true');
assert.equal(value(production, 'ASSISTANT_PROVIDER') ?? 'gemini', 'gemini', 'Production AI stays on Gemini during the preview trial.');
assert.equal(value(preview, 'ASSISTANT_PROVIDER'), 'workers-ai');
assert.equal(value(section('env.preview.ai'), 'binding'), 'AI');
assert.ok(!/^\[ai\]/m.test(config), 'Workers AI is bound only to preview during the trial.');
assert.equal(value(section('[d1_databases]'), 'database_id'), 'd3d3ec34-c463-4f36-af2c-5ab32a45acda');
assert.equal(value(section('[env.preview.d1_databases]'), 'database_id'), '086ef147-6256-4087-8b48-df79237c16f5');
assert.equal(value(section('[r2_buckets]'), 'bucket_name'), 'actiondivers-media');
assert.equal(value(section('[env.preview.r2_buckets]'), 'bucket_name'), 'actiondivers-media-preview');
assert.ok(!config.includes('preview_database_id') && !config.includes('preview_bucket_name'), 'Use the explicit preview environment, not mixed top-level bindings.');

const sitemap = read('dist/sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]));
assert.ok(urls.length > 0, 'Sitemap must contain public routes.');
for (const url of urls) {
  assert.equal(url.origin, SITE_URL, `Wrong sitemap origin: ${url}`);
  const file = url.pathname === '/' ? 'dist/index.html' : path.join('dist', `${url.pathname.slice(1)}.html`);
  const html = read(file);
  assert.ok(html.includes(`<link rel="canonical" href="${url.href}">`), `Wrong canonical: ${file}`);
  assert.ok(html.includes(`<meta property="og:url" content="${url.href}">`), `Wrong social URL: ${file}`);
  assert.ok(!html.includes('actiondivers2.davebze.workers.dev'), `Temporary site origin remains in ${file}`);
  assert.ok(!html.includes('noindex'), `Public release HTML must be indexable: ${file}`);
}
assert.ok(read('dist/robots.txt').includes(`Sitemap: ${SITE_URL}/sitemap.xml`));
assert.ok(!read('index.html').includes('actiondivers2.davebze.workers.dev'));

const headers = read('dist/_headers');
assert.match(headers, /https:\/\/:version\.:subdomain\.workers\.dev\/\*\s+X-Robots-Tag: noindex, nofollow/);
for (const route of ['reservation', 'pay', 'payment']) {
  assert.ok(headers.includes(`/${route}/*\n  X-Robots-Tag: noindex, nofollow\n  Referrer-Policy: no-referrer`));
}

const redirects = read('dist/_redirects').split(/\r?\n/).filter((line) => line.trim() && !line.startsWith('#'));
const sources = new Set();
for (const line of redirects) {
  const [source, destination, status, extra] = line.trim().split(/\s+/);
  assert.ok(source.startsWith('/') && destination.startsWith('/'), `Unexpected redirect: ${line}`);
  assert.equal(status, '301');
  assert.equal(extra, undefined);
  assert.notEqual(source, destination, `Redirect loops: ${source}`);
  assert.ok(!sources.has(source), `Duplicate redirect source: ${source}`);
  sources.add(source);
  assert.ok(urls.some((url) => url.pathname === destination), `Redirect destination is not a built page: ${destination}`);
}
for (const line of redirects) {
  assert.ok(!sources.has(line.trim().split(/\s+/)[1]), `Redirect chain: ${line}`);
}
console.log(`Launch configuration passed: ${urls.length} canonical pages, ${redirects.length} redirects, private/preview headers, production checkout disabled, preview sandbox preserved.`);
