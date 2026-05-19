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

// Fallback para entornos CI sin Chrome del sistema (Netlify, Vercel, Lambda).
// @sparticuz/chromium provee un binario portable; cargado lazy para no pagarlo en dev.
let sparticuzChromium = null;
async function getSparticuzChrome() {
  if (sparticuzChromium === null) {
    try {
      const mod = await import('@sparticuz/chromium');
      sparticuzChromium = mod.default ?? mod;
    } catch {
      sparticuzChromium = false;
    }
  }
  return sparticuzChromium || null;
}

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
const POSTS_SEED_PATH = resolve(ROOT, '..', 'backend', 'seed', 'posts.json');

// Si está seteado, el prerender fetchea slugs desde el backend en vez del seed.
// Útil para que productos/posts creados desde /admin queden prerendered.
// Default en Netlify: https://tengu-backend.azurewebsites.net/api (via env var).
const PRERENDER_API_BASE = process.env.PRERENDER_API_BASE || '';

const PREVIEW_PORT = 4173;
const PREVIEW_URL = `http://127.0.0.1:${PREVIEW_PORT}`;
const HYDRATION_WAIT_MS = 1500;

async function findChrome() {
  if (process.env.CHROME_PATH && existsSync(process.env.CHROME_PATH)) {
    return { executablePath: process.env.CHROME_PATH, args: null };
  }
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return { executablePath: p, args: null };
  }
  // Fallback CI: @sparticuz/chromium
  const sparticuz = await getSparticuzChrome();
  if (sparticuz) {
    const executablePath = await sparticuz.executablePath();
    return { executablePath, args: sparticuz.args };
  }
  return null;
}

async function fetchSlugsFromApi(path) {
  if (!PRERENDER_API_BASE) return null;
  try {
    const res = await fetch(`${PRERENDER_API_BASE}${path}`, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`  [prerender] ${path} → ${res.status}, cae al seed local`);
      return null;
    }
    const data = await res.json();
    return data.map((row) => row.slug);
  } catch (err) {
    console.warn(`  [prerender] fetch ${path} falló (${err.message}), cae al seed local`);
    return null;
  }
}

async function loadProductSlugs() {
  const fromApi = await fetchSlugsFromApi('/products');
  if (fromApi) return fromApi;
  if (!existsSync(SEED_PATH)) return [];
  return JSON.parse(readFileSync(SEED_PATH, 'utf-8')).map((p) => p.slug);
}

async function loadBlogSlugs() {
  const fromApi = await fetchSlugsFromApi('/posts');
  if (fromApi) return fromApi;
  if (!existsSync(POSTS_SEED_PATH)) return [];
  return JSON.parse(readFileSync(POSTS_SEED_PATH, 'utf-8')).map((p) => p.slug);
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
  const chrome = await findChrome();
  if (!chrome) {
    console.error('No se encontró Chrome/Edge. Define CHROME_PATH o instala Chrome.');
    process.exit(1);
  }
  if (!existsSync(DIST)) {
    console.error('dist/ no existe. Corre `vite build` primero.');
    process.exit(1);
  }

  const productSlugs = await loadProductSlugs();
  const blogSlugs = await loadBlogSlugs();
  const routes = [
    ...STATIC_ROUTES,
    ...productSlugs.map((s) => `/cafe/${s}`),
    ...blogSlugs.map((s) => `/blog/${s}`),
  ];

  console.log(`[prerender] ${routes.length} rutas: ${STATIC_ROUTES.length} estáticas + ${productSlugs.length} productos + ${blogSlugs.length} posts`);
  console.log(`[prerender] Chrome: ${chrome.executablePath}`);

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
      executablePath: chrome.executablePath,
      headless: true,
      args: chrome.args ?? ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
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
