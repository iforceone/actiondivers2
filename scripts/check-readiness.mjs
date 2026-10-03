import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const app = read('App.tsx');
// The not-found route must not make every misspelled internal URL pass.
const routePatterns = [...app.matchAll(/<Route\s+path="([^"]+)"/g)]
  .map((match) => match[1]).filter((pattern) => pattern !== '*');
const matchesRoute = (candidate) => routePatterns.some((pattern) => {
  if (pattern === candidate) return true;
  const expression = new RegExp(`^${pattern.replace(/:[^/]+/g, '[^/]+').replace(/\*/g, '.*')}$`);
  return expression.test(candidate);
});

const sourceFiles = [];
const collect = (directory) => {
  for (const entry of fs.readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = path.join(directory, entry.name);
    if (entry.isDirectory()) collect(relative);
    else if (/\.(tsx?|html)$/.test(entry.name)) sourceFiles.push(relative);
  }
};
for (const directory of ['components', 'pages']) collect(directory);
sourceFiles.push('App.tsx', 'index.html');

for (const file of sourceFiles) {
  const source = read(file);
  for (const match of source.matchAll(/(?:to|href)="(\/[^"]*)"/g)) {
    const target = match[1].split(/[?#]/)[0];
    if (!matchesRoute(target) && !target.startsWith('/images/')) failures.push(`${file}: internal link has no route: ${target}`);
  }
  for (const match of source.matchAll(/(?:src|image)=[{"']+(\/images\/[^}"']+)/g)) {
    const asset = decodeURIComponent(match[1]);
    if (!fs.existsSync(path.join(root, 'public', asset))) failures.push(`${file}: missing image: ${asset}`);
  }
}

const sitemap = read('public/sitemap.xml');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)];
if (!sitemapUrls.length) failures.push('public/sitemap.xml: no URLs found.');
for (const match of sitemapUrls) {
  try {
    const target = new URL(match[1].trim()).pathname;
    if (!matchesRoute(target)) failures.push(`public/sitemap.xml: URL has no route: ${target}`);
  } catch {
    failures.push(`public/sitemap.xml: invalid URL: ${match[1]}`);
  }
}

// Every route must either have a prerendered HTML file or be listed in the site
// Worker's app-only routes. Otherwise the Worker would serve a 404 for it.
const { APP_ONLY_ROUTES } = await import('../site-worker/index.ts');
const redirectSources = new Set(read('public/_redirects').split(/\r?\n/).filter((line) => line.startsWith('/')).map((line) => line.split(/\s+/)[0]));
const distDir = path.join(root, 'dist');
for (const pattern of routePatterns) {
  if (pattern === '/' || pattern.includes('*')) continue;
  if (pattern.startsWith('/tour/:') || pattern.startsWith('/blog/:')) continue; // prerendered per item; unknown ids 404 by design
  const sample = pattern.replace(/:[^/]+/g, 'sample');
  const prerendered = fs.existsSync(path.join(distDir, `${sample.slice(1)}.html`));
  if (fs.existsSync(distDir) && !prerendered && !redirectSources.has(sample) && !APP_ONLY_ROUTES.some((expression) => expression.test(sample))) {
    failures.push(`site-worker: route ${pattern} has no prerendered file and is not in APP_ONLY_ROUTES (it would return 404).`);
  }
}

const dist = path.join(root, 'dist');
if (!fs.existsSync(dist)) {
  failures.push('dist is missing; run the production build before this check.');
} else {
  const bundleFiles = [];
  const collectBundle = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) collectBundle(absolute);
      else if (/\.(?:js|css|html|json|xml|txt)$/.test(entry.name)) bundleFiles.push(absolute);
    }
  };
  collectBundle(dist);
  const bundle = bundleFiles.map((file) => fs.readFileSync(file, 'utf8')).join('\n');
  const forbidden = [
    ['configuration placeholder', /REPLACE_WITH_[A-Z0-9_]+/],
    ['Google API key pattern', /AIza[0-9A-Za-z_-]{30,}/],
    ['Resend API key pattern', /\bre_[0-9A-Za-z_-]{20,}/],
    ['private-key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
  ];
  for (const [label, pattern] of forbidden) if (pattern.test(bundle)) failures.push(`dist contains ${label}.`);
}

if (failures.length) {
  console.error(`Readiness check failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Readiness check passed: ${routePatterns.length} route patterns, ${sourceFiles.length} source files, sitemap, image assets, and bundle patterns.`);
