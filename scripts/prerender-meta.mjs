import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { createServer } from 'vite';

const SITE_URL = 'https://actiondivers2.davebze.workers.dev';
const SITE_NAME = 'Action Divers & Adventures';
const TITLE_SUFFIX = 'Action Divers Belize';
const DEFAULT_IMAGE = `${SITE_URL}/images/brand/action-divers-social-share.png`;
const DEFAULT_IMAGE_ALT = 'Action Divers & Adventures — Belize scuba diving, snorkeling, and adventure tours';

const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('"', '&quot;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;');

const absoluteUrl = (value) => value.startsWith('http') ? value : `${SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
const fullTitle = (title) => title.includes('Action Divers') ? title : `${title} | ${TITLE_SUFFIX}`;
const conciseDescription = (value, max = 158) => {
  if (value.length <= max) return value;
  const shortened = value.slice(0, max + 1).replace(/\s+\S*$/, '').replace(/[,.\s]+$/, '');
  return `${shortened}.`;
};

const setMeta = (html, attribute, key, content) => {
  const pattern = new RegExp(`<meta\\s+${attribute}="${key}"[^>]*>`, 'i');
  const tag = `<meta ${attribute}="${key}" content="${escapeHtml(content)}">`;
  return pattern.test(html) ? html.replace(pattern, tag) : html.replace('</head>', `    ${tag}\n</head>`);
};

const renderPageHead = (template, page) => {
  const title = fullTitle(page.title);
  const canonical = absoluteUrl(page.path);
  const image = absoluteUrl(page.image || DEFAULT_IMAGE);
  const imageAlt = page.imageAlt || DEFAULT_IMAGE_ALT;
  let html = template.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  html = setMeta(html, 'name', 'description', page.description);
  html = setMeta(html, 'name', 'robots', page.noindex ? 'noindex, nofollow' : 'index, follow');
  html = setMeta(html, 'property', 'og:title', title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:type', page.type || 'website');
  html = setMeta(html, 'property', 'og:url', canonical);
  html = setMeta(html, 'property', 'og:site_name', SITE_NAME);
  html = setMeta(html, 'property', 'og:locale', 'en_US');
  html = setMeta(html, 'property', 'og:image', image);
  html = setMeta(html, 'property', 'og:image:alt', imageAlt);
  html = setMeta(html, 'name', 'twitter:card', 'summary_large_image');
  html = setMeta(html, 'name', 'twitter:title', title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  html = setMeta(html, 'name', 'twitter:image', image);
  html = setMeta(html, 'name', 'twitter:image:alt', imageAlt);

  html = html.replace(/<link\s+rel="canonical"[^>]*>/i, `<link rel="canonical" href="${escapeHtml(canonical)}">`);
  html = html.replace(/\s*<meta\s+property="og:image:(?:width|height)"[^>]*>\s*/gi, '\n    ');
  if (image === DEFAULT_IMAGE) {
    html = setMeta(html, 'property', 'og:image:width', '1200');
    html = setMeta(html, 'property', 'og:image:height', '630');
  }

  html = html.replace(/\s*<script\s+type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>\s*/gi, '\n');
  if (page.structuredData) {
    const items = Array.isArray(page.structuredData) ? page.structuredData : [page.structuredData];
    const scripts = items.map((item) => {
      const json = JSON.stringify(item).replaceAll('<', '\\u003c');
      return `    <script type="application/ld+json" data-seo-jsonld="true">${json}</script>`;
    }).join('\n');
    html = html.replace('</head>', `${scripts}\n</head>`);
  }
  return html;
};

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
let INITIAL_TOURS;
let BLOG_POSTS;
try {
  ({ INITIAL_TOURS } = await vite.ssrLoadModule('/constants.tsx'));
  ({ BLOG_POSTS } = await vite.ssrLoadModule('/data/blogPosts.ts'));
} finally {
  await vite.close();
}

const businessStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'TouristBusiness',
  name: SITE_NAME,
  description: 'Belize tour operator offering scuba diving, snorkeling, fishing, island adventures, cave tubing, Maya ruins, and mainland tours from San Pedro.',
  url: SITE_URL,
  telephone: '011-501-671-2624',
  email: 'info@actiondiversbelize.com',
  address: { '@type': 'PostalAddress', streetAddress: 'San Pedro', addressLocality: 'Ambergris Caye', addressCountry: 'Belize' },
  geo: { '@type': 'GeoCoordinates', latitude: 18.4663, longitude: -87.9667 },
};

const routes = [
  {
    path: '/',
    title: 'Belize Scuba Diving & Adventure Tours',
    description: 'Explore scuba diving, snorkeling, fishing, island adventures, and mainland tours from San Pedro, Ambergris Caye with Action Divers & Adventures.',
    structuredData: businessStructuredData,
  },
  { path: '/about', title: 'About Action Divers Belize', description: 'Meet Action Divers & Adventures, a San Pedro, Ambergris Caye tour operator offering personal service and Belize reef and mainland adventures.', image: '/images/gallery/SCUBA-and-Snorkelers-1.png' },
  { path: '/gallery', title: 'Belize Adventure Photo Gallery', description: 'Browse Action Divers & Adventures photos from Belize snorkeling, scuba diving, island adventures, fishing trips, Maya ruins, and mainland tours.', image: '/images/gallery/Turtle.png' },
  { path: '/island-adventures', title: 'Island Tours from San Pedro, Belize', description: 'Explore Belize island tours from San Pedro, including scuba diving, Hol Chan snorkeling, Shark Ray Alley, Mexico Rocks, fishing, and beach barbecue adventures.', image: '/images/gallery/Group-of-Snorkelers-with-fish-768x432.png' },
  { path: '/mainland-adventures', title: 'Belize Mainland Tours & Maya Ruins', description: 'Explore mainland tours from San Pedro, including Altun Ha, Xunantunich, Lamanai, ATM Caves, cave tubing, zip-lining, and rainforest adventures.', image: '/images/gallery/web-maya-ruin.jpg' },
  { path: '/courses', title: 'Scuba Courses in Ambergris Caye, Belize', description: 'Compare Action Divers scuba courses, including Refresher, Resort Course, Scuba Discovery, Open Water options, Scuba Diver, and Advanced Open Water.', image: '/images/gallery/Roberto-with-Student-e1673390226440-768x542.jpg' },
  { path: '/transfers-charters', title: 'Belize Boat Transfers & Private Charters', description: 'Request an Action Divers boat transfer between Belize International Airport and San Pedro, with proposed pricing confirmed by staff.', image: '/images/gallery/Three-of-a-Kind-boat-1.png' },
  { path: '/reservations', title: 'Plan Your Belize Tours', description: 'Send Action Divers & Adventures a custom inquiry for Belize scuba diving, snorkeling, fishing, island tours, cave tubing, Maya ruins, and mainland tours.' },
  {
    path: '/blog',
    title: 'Belize Travel Guides',
    description: 'Read guides to snorkeling, scuba diving, island tours, mainland tours, and family-friendly Belize activities from San Pedro.',
    image: '/images/gallery/Group-of-Snorkelers-with-fish-768x432.png',
    structuredData: {
      '@context': 'https://schema.org', '@type': 'Blog', name: 'Belize Travel Guides', url: `${SITE_URL}/blog`,
      description: 'Belize travel guides, snorkeling tips, scuba diving advice, and adventure planning from Action Divers & Adventures.',
      blogPost: BLOG_POSTS.map((post) => ({ '@type': 'BlogPosting', headline: post.title, url: `${SITE_URL}/blog/${post.slug}`, datePublished: post.date, author: { '@type': 'Organization', name: post.author } })),
    },
  },
];

for (const tour of INITIAL_TOURS) {
  const routePath = `/tour/${tour.id}`;
  routes.push({
    path: routePath,
    title: `${tour.name} in Belize`,
    description: conciseDescription(`${tour.description} Plan ${tour.name.toLowerCase()} with Action Divers & Adventures from San Pedro, Ambergris Caye.`),
    image: tour.image,
    structuredData: [
      {
        '@context': 'https://schema.org', '@type': 'TouristTrip', name: `${tour.name} in Belize`, description: tour.longDescription,
        image: absoluteUrl(tour.image), url: `${SITE_URL}${routePath}`,
        offers: tour.options?.length ? tour.options.map((option) => ({ '@type': 'Offer', name: option.name, price: option.price, priceCurrency: 'USD', availability: tour.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut', url: `${SITE_URL}${routePath}` })) : { '@type': 'Offer', price: tour.price, priceCurrency: 'USD', availability: tour.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut', url: `${SITE_URL}${routePath}` },
        provider: { '@type': 'TouristBusiness', name: SITE_NAME, url: SITE_URL },
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
          { '@type': 'ListItem', position: 2, name: tour.category === 'island' ? 'Island Adventures' : 'Mainland Adventures', item: `${SITE_URL}/${tour.category === 'island' ? 'island-adventures' : 'mainland-adventures'}` },
          { '@type': 'ListItem', position: 3, name: tour.name, item: `${SITE_URL}${routePath}` },
        ],
      },
    ],
  });
}

for (const post of BLOG_POSTS) {
  const routePath = `/blog/${post.slug}`;
  routes.push({
    path: routePath,
    title: post.title,
    description: conciseDescription(post.excerpt),
    image: post.image,
    type: 'article',
    structuredData: [
      { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.excerpt, image: absoluteUrl(post.image), url: `${SITE_URL}${routePath}`, datePublished: post.date, dateModified: post.date, author: { '@type': 'Organization', name: post.author }, publisher: { '@type': 'Organization', name: SITE_NAME }, mainEntityOfPage: `${SITE_URL}${routePath}` },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Travel Guides', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: `${SITE_URL}${routePath}` },
      ] },
    ],
  });
}

const distDir = path.resolve('dist');
const template = await readFile(path.join(distDir, 'index.html'), 'utf8');
for (const route of routes) {
  // Cloudflare's default HTML handling serves `tour/example.html` at the
  // extensionless `/tour/example` URL, matching the app's canonical links.
  const output = route.path === '/' ? path.join(distDir, 'index.html') : path.join(distDir, `${route.path.slice(1)}.html`);
  await mkdir(path.dirname(output), { recursive: true });
  await writeFile(output, renderPageHead(template, route), 'utf8');
}

console.log(`Generated crawlable metadata for ${routes.length} public routes.`);
