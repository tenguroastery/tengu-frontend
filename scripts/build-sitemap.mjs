#!/usr/bin/env node
/**
 * Genera public/sitemap.xml a partir de:
 *  - rutas estáticas conocidas
 *  - productos y posts del API (PRERENDER_API_BASE) o, si no responde, del
 *    seed local en backend/seed/*.json (monorepo dev).
 *
 * Se ejecuta antes de `vite build` (ver package.json).
 * Comparte env var con scripts/prerender.mjs para que ambos vean el mismo
 * set de slugs sin tener que setear dos variables distintas en Netlify.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');

const SITE_URL = process.env.SITE_URL ?? 'https://tenguroastery.cl';
// Misma env var que prerender.mjs (definida en netlify.toml).
const API_BASE = process.env.PRERENDER_API_BASE || '';

const PRODUCTS_SEED = resolve(ROOT, '..', 'backend', 'seed', 'products.json');
const POSTS_SEED = resolve(ROOT, '..', 'backend', 'seed', 'posts.json');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tienda', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/sobre-nosotros', priority: '0.7' },
  { path: '/metodos/v60', priority: '0.6' },
  { path: '/metodos/aeropress', priority: '0.6' },
  { path: '/metodos/espresso', priority: '0.6' },
  { path: '/horeca', priority: '0.7' },
  { path: '/suscripcion', priority: '0.8', changefreq: 'monthly' },
  { path: '/privacidad', priority: '0.3' },
  { path: '/terminos', priority: '0.3' },
];

async function fetchSlugsFromApi(path) {
  if (!API_BASE) return null;
  try {
    const res = await fetch(`${API_BASE}${path}`, { signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.warn(`[sitemap] ${path} → HTTP ${res.status}, cae al seed`);
      return null;
    }
    const data = await res.json();
    return data.map((row) => row.slug);
  } catch (err) {
    console.warn(`[sitemap] fetch ${path} falló (${err.message}), cae al seed`);
    return null;
  }
}

function readSeedSlugs(seedPath) {
  if (!existsSync(seedPath)) return [];
  return JSON.parse(readFileSync(seedPath, 'utf-8')).map((p) => p.slug);
}

async function loadProductSlugs() {
  return (await fetchSlugsFromApi('/products')) ?? readSeedSlugs(PRODUCTS_SEED);
}

async function loadBlogSlugs() {
  return (await fetchSlugsFromApi('/posts')) ?? readSeedSlugs(POSTS_SEED);
}

function urlEntry(path, { priority = '0.5', changefreq, lastmod } = {}) {
  const lines = [`  <url>`, `    <loc>${SITE_URL}${path}</loc>`];
  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');
  return lines.join('\n');
}

(async () => {
  const [productSlugs, blogSlugs] = await Promise.all([loadProductSlugs(), loadBlogSlugs()]);
  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...STATIC_ROUTES.map((r) => urlEntry(r.path, { ...r, lastmod: today })),
    ...productSlugs.map((s) => urlEntry(`/cafe/${s}`, { priority: '0.8', changefreq: 'monthly', lastmod: today })),
    ...blogSlugs.map((s) => urlEntry(`/blog/${s}`, { priority: '0.7', changefreq: 'monthly', lastmod: today })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const target = resolve(PUBLIC, 'sitemap.xml');
  writeFileSync(target, xml, 'utf-8');
  console.log(
    `[sitemap] ${entries.length} URLs (${STATIC_ROUTES.length} estáticas + ${productSlugs.length} productos + ${blogSlugs.length} posts)`,
  );
})();
