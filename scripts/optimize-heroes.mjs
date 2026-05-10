#!/usr/bin/env node
/**
 * Optimiza las imágenes del hero (PNG pesadas) a WebP + JPG con variantes
 * responsive. Se ejecuta una sola vez al recibir nuevas imágenes — no en
 * build (sería redundante).
 *
 * Uso:  npm run optimize:heroes
 */
import { readdir, stat, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, '..', 'public');

const HEROES = [
  { src: 'hero-bg.png', widths: [1920, 1280, 768], jpgQ: 78, webpQ: 75 },
  { src: 'hero-bag.png', widths: [1920, 1280, 768, 480], jpgQ: 82, webpQ: 78 },
  { src: 'hero-atmosphere.png', widths: [1920, 1280, 768], jpgQ: 75, webpQ: 72 },
];

async function fileSize(p) {
  return existsSync(p) ? (await stat(p)).size : 0;
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
}

async function processOne(cfg) {
  const srcPath = resolve(PUBLIC, cfg.src);
  if (!existsSync(srcPath)) {
    console.log(`[skip] ${cfg.src} no existe`);
    return;
  }
  const baseName = basename(cfg.src, extname(cfg.src));
  const orig = await fileSize(srcPath);
  console.log(`\n→ ${cfg.src}  (${fmt(orig)})`);

  for (const width of cfg.widths) {
    const suffix = width === Math.max(...cfg.widths) ? '' : `-${width}w`;
    const webpOut = resolve(PUBLIC, `${baseName}${suffix}.webp`);
    const jpgOut = resolve(PUBLIC, `${baseName}${suffix}.jpg`);

    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: cfg.webpQ })
      .toFile(webpOut);

    await sharp(srcPath)
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: cfg.jpgQ, progressive: true, mozjpeg: true })
      .toFile(jpgOut);

    console.log(
      `  ${width.toString().padEnd(4)}w  ${fmt(await fileSize(webpOut)).padEnd(10)} webp  |  ${fmt(await fileSize(jpgOut)).padEnd(10)} jpg`,
    );
  }

  // Borrar el PNG original (ya es redundante y pesa 6-7 MB)
  await unlink(srcPath);
  console.log(`  [delete] ${cfg.src} (PNG fuente)`);
}

async function main() {
  console.log('Optimizando imágenes del hero…');
  for (const cfg of HEROES) {
    await processOne(cfg);
  }
  console.log('\n✓ Listo. Quedaron en public/:');
  const files = (await readdir(PUBLIC)).filter((f) => /^hero-/.test(f)).sort();
  for (const f of files) {
    console.log(`  ${fmt(await fileSize(resolve(PUBLIC, f))).padStart(10)}  ${f}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
