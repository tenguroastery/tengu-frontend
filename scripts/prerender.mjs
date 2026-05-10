#!/usr/bin/env node
/**
 * Prerender SSG postbuild.
 *
 * Después de `vite build`, esta tarea:
 * 1. Levanta `vite preview` en localhost:4173
 * 2. Para cada ruta conocida (estática + productos + posts), navega con
 *    Chromium headless, espera hidratación, y captura el HTML final con
 *    los meta tags ya inyectados por React Router + useSeo.
 * 3. Escribe ese HTML a dist/<ruta>/index.html (el original dist/index.html
 *    se usa como fallback SPA para rutas no prerendered).
 * 4. Apaga el preview.
 *
 * Resultado: bots no-JS (WhatsApp, Slack, IG, Twitter) y crawlers ven el
 * title/description/OG correcto al pegar cualquier link de la tienda.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DIST = resolve(ROOT, 'dist');

const CHROME_PATHS = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const STATIC_ROUTES = [
  '/',
  '/tienda',
  '/blog',
  '/sobre-nosotros',
  '/metodos/v60',
  '/metodos/aeropress',
  '/metodos/espresso',
  '/horeca',
  '/privacidad',
  '/terminos',
];

const SEED_PATH = resolve(ROOT, '..', 'backend', 'seed', 'products.json');
const BLOG_DATA = resolve(ROOT, 'src', 'data', 'blog.ts');

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;
const HYDRATION_WAIT_MS = 1500;

function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

function loadProductSlugs() {
  if (!existsSync(SEED_PATH)) return [];
  return JSON.parse(readFileSync(SEED_PATH, 'utf-8')).map((p) => p.slug);
}

function loadBlogSlugs() {
  if (!existsSync(BLOG_DATA)) return [];
  const src = readFileSync(BLOG_DATA, 'utf-8');
  const slugs = [];
  for (const m of src.matchAll(/slug:\s*['"]([a-z0-9-]+)['"]/g)) slugs.push(m[1]);
  return slugs;
}

async function isPreviewUp() {
  try {
    const res = await fetch(`http://127.0.0.1:${PREVIEW_PORT}/`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

async function spawnPreview() {
  const viteBin = resolve(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const proc = spawn(process.execPath, [viteBin, 'preview', '--port', String(PREVIEW_PORT), '--strictPort', '--host', '127.0.0.1'], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  proc.stdout.on('data', (c) => process.stdout.write(`  [preview] ${c}`));
  proc.stderr.on('data', (c) => process.stderr.write(`  [preview!] ${c}`));

  // Poll HTTP hasta que responda
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${PREVIEW_PORT}/`, {
        signal: AbortSignal.timeout(1500),
      });
      if (res.ok) return proc;
    } catch { /* aún no listo */ }
    await new Promise((r) => setTimeout(r, 500));
  }

  proc.kill('SIGINT');
  throw new Error('preview server no respondió en 30s');
}

async function prerenderRoute(browser, route) {
  const page = await browser.newPage();
  try {
    await page.goto(`${PREVIEW_URL}${route}`, { waitUntil: 'networkidle0', timeout: 30_000 });
    await new Promise((r) => setTimeout(r, HYDRATION_WAIT_MS));
    const html = await page.content();
    return html;
  } finally {
    await page.close();
  }
}

function writeRouteHtml(route, html) {
  const targetDir = route === '/' ? DIST : resolve(DIST, route.replace(/^\//, ''));
  mkdirSync(targetDir, { recursive: true });
  const target = resolve(targetDir, 'index.html');
  writeFileSync(target, html, 'utf-8');
}

async function main() {
  const chrome = findChrome();
  if (!chrome) {
    console.error('No se encontró Chrome/Edge. Define CHROME_PATH o instala Chrome.');
    process.exit(1);
  }
  if (!existsSync(DIST)) {
    console.error('dist/ no existe. Corre `vite build` primero.');
    process.exit(1);
  }

  const productSlugs = loadProductSlugs();
  const blogSlugs = loadBlogSlugs();
  const routes = [
    ...STATIC_ROUTES,
    ...productSlugs.map((s) => `/cafe/${s}`),
    ...blogSlugs.map((s) => `/blog/${s}`),
  ];

  console.log(`[prerender] ${routes.length} rutas: ${STATIC_ROUTES.length} estáticas + ${productSlugs.length} productos + ${blogSlugs.length} posts`);
  console.log(`[prerender] Chrome: ${chrome}`);

  let preview = null;
  if (await isPreviewUp()) {
    console.log('[prerender] vite preview ya está corriendo en :4173, reuso.');
  } else {
    console.log('[prerender] Levantando vite preview…');
    preview = await spawnPreview();
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: chrome,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    for (const route of routes) {
      try {
        const html = await prerenderRoute(browser, route);
        writeRouteHtml(route, html);
        console.log(`  ✓ ${route}`);
      } catch (err) {
        console.warn(`  ✗ ${route}  (${err.message})`);
      }
    }
  } finally {
    if (browser) await browser.close();
    if (preview) preview.kill('SIGINT');
  }

  console.log('[prerender] ✓ Listo.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
