#!/usr/bin/env node
/**
 * Optimiza las imágenes de productos (seed/images del backend) para web.
 * Reduce a 1200px max ancho, JPEG quality 82, mozjpeg.
 * Las originales (1.8-2 MB) bajan a ~150-300 KB sin pérdida visible.
 *
 * Uso:
 *   node scripts/optimize-products.mjs           # in-place, reemplaza originales
 *   node scripts/optimize-products.mjs --dry     # solo reporta
 */
import { readdir, stat, writeFile, rename } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SEED_DIR = resolve(__dirname, '..', '..', 'backend', 'seed', 'images');
const MAX_WIDTH = 1200;
const QUALITY = 82;
const DRY = process.argv.includes('--dry');

const fmt = (b) => (b / 1024).toFixed(0) + ' KB';

async function optimizeOne(file) {
  const path = resolve(SEED_DIR, file);
  const before = (await stat(path)).size;

  const buf = await sharp(path)
    .rotate()  // auto-orienta usando EXIF
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true })
    .toBuffer();

  if (DRY) {
    console.log(`  ${file}: ${fmt(before)} → ${fmt(buf.length)} (dry-run)`);
    return { before, after: buf.length };
  }

  // No reescribimos el archivo abierto (sharp lo tiene como source). Write a tmp, rename.
  const tmp = path + '.tmp';
  await writeFile(tmp, buf);
  await rename(tmp, path);
  const after = (await stat(path)).size;
  console.log(`  ✓ ${file}: ${fmt(before)} → ${fmt(after)}  (-${Math.round((1 - after / before) * 100)}%)`);
  return { before, after };
}

async function main() {
  const files = (await readdir(SEED_DIR)).filter((f) => /\.(jpe?g|png)$/i.test(f));
  console.log(`[optimize-products] ${files.length} archivos en ${SEED_DIR}`);
  if (DRY) console.log('[optimize-products] DRY RUN — no se escribe nada');

  let totalBefore = 0;
  let totalAfter = 0;
  for (const f of files) {
    const { before, after } = await optimizeOne(f);
    totalBefore += before;
    totalAfter += after;
  }
  console.log(`\n[optimize-products] Total: ${fmt(totalBefore)} → ${fmt(totalAfter)}  (-${Math.round((1 - totalAfter / totalBefore) * 100)}%)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
