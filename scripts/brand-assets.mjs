/**
 * Builds brand assets from the reference mockups in .tmp-brand/:
 *
 *   public/bg-studio.webp       — the clean hi-res scene (no baked-in chrome)
 *   public/portfolio/cover.webp — the ARCHITECTURE cover artwork, cropped from
 *                                 the closed-book mockup
 *
 * Idempotent; requires sharp. Usage: node scripts/brand-assets.mjs
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const inDir = (...p) => path.join(root, '.tmp-brand', ...p);
const out = (p) => path.join(root, 'public', p);

/* ---------------------------------------------------------------- */
/* 1. Background — the clean hi-res scene, used directly            */
/* ---------------------------------------------------------------- */

await sharp(inDir('scene-clean.png'))
  .resize(1536, 1024, { fit: 'cover' })
  .webp({ quality: 85 })
  .toFile(out('bg-studio.webp'));
console.log('bg-studio.webp ✓');

/* ---------------------------------------------------------------- */
/* 2. Cover — crop from the closed-book mockup                      */
/* ---------------------------------------------------------------- */

// The book cover face (excluding spine + page block) in mockup pixel coords.
// Mockup is 1536x1024; cover face occupies roughly x 485..1085, y 105..885.
const cover = {
  left: 485,
  top: 108,
  width: 598,
  height: 775,
};
await sharp(inDir('closed.png'))
  .extract({ left: cover.left, top: cover.top, width: cover.width, height: cover.height })
  .webp({ quality: 88 })
  .toFile(out('portfolio/cover.webp'));
console.log('cover.webp ✓');
console.log('done');
