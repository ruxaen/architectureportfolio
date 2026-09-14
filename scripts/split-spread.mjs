/**
 * Splits a full spread mockup into single book pages.
 *
 *   node scripts/split-spread.mjs <spread.png> <firstPageNumber>
 *
 * Example:
 *   node scripts/split-spread.mjs ".tmp-brand/pages/spread1.png" 1
 *   -> public/portfolio/page-01.webp (left half), public/portfolio/page-02.webp (right half)
 *
 * The book region and the gutter are auto-detected from brightness (the pages
 * are bright against the dark scene; the gutter is the dark valley in the
 * middle of the spread). The page artwork is ONLY cropped — never resized,
 * re-rendered or altered in any other way.
 */
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [input, firstArg] = process.argv.slice(2);
if (!input || !firstArg) {
  console.error('usage: node scripts/split-spread.mjs <spread.png> <firstPageNumber>');
  process.exit(1);
}
const first = Number.parseInt(firstArg, 10);

const src = path.isAbsolute(input) ? input : path.join(root, input);
const outDir = path.join(root, 'public', 'portfolio');

const num = (n) => String(n).padStart(2, '0');

/* ----------------------- 1. detect the book region ----------------------- */

const img = sharp(src);
const { width, height } = await img.metadata();
const raw = await img.clone().raw().toBuffer();

const colBright = new Array(width).fill(0);
const rowBright = new Array(height).fill(0);
for (let y = 0; y < height; y += 2) {
  for (let x = 0; x < width; x += 2) {
    const i = (y * width + x) * 3;
    const b = (raw[i] + raw[i + 1] + raw[i + 2]) / 3;
    if (b > 90) {
      colBright[x] += 1;
      rowBright[y] += 1;
    }
  }
}
const pick = (arr, frac) => {
  const max = Math.max(...arr);
  const idx = [];
  for (let i = 0; i < arr.length; i += 1) if (arr[i] > max * frac) idx.push(i);
  return [idx[0], idx[idx.length - 1]];
};
const [x0, x1] = pick(colBright, 0.25);
const [y0, y1] = pick(rowBright, 0.25);

/* ------------------- 2. detect the gutter (dark valley) ------------------ */

const gx0 = Math.round(x0 + (x1 - x0) * 0.44);
const gx1 = Math.round(x0 + (x1 - x0) * 0.56);
const gy0 = Math.round(y0 + (y1 - y0) * 0.15);
const gy1 = Math.round(y0 + (y1 - y0) * 0.85);
let gutterX = Math.round((x0 + x1) / 2);
let best = Infinity;
for (let x = gx0; x <= gx1; x += 1) {
  let sum = 0;
  let n = 0;
  for (let y = gy0; y <= gy1; y += 3) {
    const i = (y * width + x) * 3;
    sum += (raw[i] + raw[i + 1] + raw[i + 2]) / 3;
    n += 1;
  }
  if (sum / n < best) {
    best = sum / n;
    gutterX = x;
  }
}

/* --------------------------- 3. split & write ---------------------------- */

const leftW = gutterX - x0;
const rightW = x1 - gutterX + 1;
console.log(
  `book: x ${x0}..${x1}  y ${y0}..${y1}  gutter @${gutterX}  ->  left ${leftW}x${y1 - y0 + 1}, right ${rightW}x${y1 - y0 + 1}`,
);

await sharp(src)
  .extract({ left: x0, top: y0, width: leftW, height: y1 - y0 + 1 })
  .webp({ quality: 92 })
  .toFile(path.join(outDir, `page-${num(first)}.webp`));

await sharp(src)
  .extract({ left: gutterX + 1, top: y0, width: rightW, height: y1 - y0 + 1 })
  .webp({ quality: 92 })
  .toFile(path.join(outDir, `page-${num(first + 1)}.webp`));

console.log(`page-${num(first)}.webp + page-${num(first + 1)}.webp ✓`);
