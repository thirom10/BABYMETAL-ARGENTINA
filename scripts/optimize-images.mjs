// Converts the original photos in /assets-src (git-ignored) into small,
// responsive WebP files in /public/images.
//
//   1. Place originals as assets-src/<slug>.jpg (see scripts/image-sources.json
//      for the Wikimedia Commons source file of each slug).
//   2. npm run images
//
// Output: public/images/<slug>-<width>.webp and, for radio artwork,
// public/images/<slug>-sq.webp (400x400, smart crop).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(root, 'assets-src');
const outDir = path.join(root, 'public', 'images');
const sources = JSON.parse(fs.readFileSync(path.join(root, 'scripts', 'image-sources.json'), 'utf8'));

fs.mkdirSync(outDir, { recursive: true });

let total = 0;
for (const { slug, widths, square } of sources) {
  const input = path.join(srcDir, `${slug}.jpg`);
  if (!fs.existsSync(input)) {
    console.warn(`! missing ${path.relative(root, input)} — skipped`);
    continue;
  }
  for (const w of widths) {
    const out = path.join(outDir, `${slug}-${w}.webp`);
    await sharp(input).rotate().resize({ width: w, withoutEnlargement: true }).webp({ quality: w > 1000 ? 70 : 74, effort: 5 }).toFile(out);
    total += fs.statSync(out).size;
  }
  if (square) {
    const out = path.join(outDir, `${slug}-sq.webp`);
    await sharp(input).rotate().resize(400, 400, { fit: 'cover', position: sharp.strategy.attention }).webp({ quality: 74 }).toFile(out);
    total += fs.statSync(out).size;
  }
  console.log(`✓ ${slug}`);
}
console.log(`Total output: ${(total / 1024).toFixed(0)} KB`);
