#!/usr/bin/env node
/**
 * Genera public/sitemap.xml a partir de:
 *  - rutas estáticas conocidas
 *  - productos del API o, si no responde, del seed local
 *
 * Se ejecuta antes de `vite build` (ver package.json).
 */
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PUBLIC = resolve(ROOT, 'public');

const SITE_URL = process.env.SITE_URL ?? 'https://tenguroastery.cl';
const API_BASE = process.env.SITEMAP_API_BASE ?? 'http://localhost:8000';
// Fallback seed: backend/seed/products.json en monorepo dev.
const SEED_FALLBACK = resolve(ROOT, '..', 'backend', 'seed', 'products.json');

const STATIC_ROUTES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/tienda', priority: '0.9', changefreq: 'weekly' },
  { path: '/blog', priority: '0.8', changefreq: 'weekly' },
  { path: '/sobre-nosotros', priority: '0.7' },
  { path: '/metodos/v60', priority: '0.6' },
  { path: '/metodos/aeropress', priority: '0.6' },
  { path: '/metodos/espresso', priority: '0.6' },
  { path: '/horeca', priority: '0.7' },
  { path: '/privacidad', priority: '0.3' },
  { path: '/terminos', priority: '0.3' },
];

const BLOG_SLUGS = ['como-elegir-cafe-de-especialidad-chile'];

async function fetchProducts() {
  try {
    const res = await fetch(`${API_BASE}/api/products`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`[sitemap] API no disponible (${err.message}). Usando seed fallback.`);
    if (existsSync(SEED_FALLBACK)) {
      return JSON.parse(readFileSync(SEED_FALLBACK, 'utf-8'));
    }
    console.warn('[sitemap] No se encontró fallback. Sitemap solo tendrá rutas estáticas.');
    return [];
  }
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
  const products = await fetchProducts();
  const today = new Date().toISOString().slice(0, 10);

  const entries = [
    ...STATIC_ROUTES.map((r) => urlEntry(r.path, { ...r, lastmod: today })),
    ...products.map((p) => urlEntry(`/cafe/${p.slug}`, { priority: '0.8', changefreq: 'monthly', lastmod: today })),
    ...BLOG_SLUGS.map((slug) => urlEntry(`/blog/${slug}`, { priority: '0.7', changefreq: 'monthly', lastmod: today })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

  const target = resolve(PUBLIC, 'sitemap.xml');
  writeFileSync(target, xml, 'utf-8');
  console.log(`[sitemap] ${entries.length} URLs escritas en ${target}`);
})();
