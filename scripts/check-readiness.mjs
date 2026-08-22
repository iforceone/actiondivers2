import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const failures = [];

const app = read('App.tsx');
const routePatterns = [...app.matchAll(/<Route\s+path="([^"]+)"/g)].map((match) => match[1]);
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
for (const match of sitemap.matchAll(/<loc>https:\/\/actiondivers2\.davebze\.workers\.dev([^<]*)<\/loc>/g)) {
  const target = match[1] || '/';
  if (!matchesRoute(target)) failures.push(`public/sitemap.xml: URL has no route: ${target}`);
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
