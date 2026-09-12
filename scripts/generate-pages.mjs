/**
 * Generates the placeholder portfolio artwork in /public/portfolio plus /public/cv.pdf.
 *
 *   npm run generate:pages
 *
 * The artwork is only a stand-in: it exists so the book can be built, reviewed and
 * shipped before the real portfolio pages are exported. Drop the real WebP/AVIF files
 * into /public/portfolio, update PAGES in lib/portfolio.ts, and delete this script.
 *
 * Requires the dev dependency `sharp` (SVG -> WebP) and Node 22.6+ (TypeScript imports).
 */
import { mkdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { PAGE_HEIGHT, PAGE_WIDTH, PAGES } from '../lib/portfolio.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'portfolio');
const PUBLIC_DIR = join(ROOT, 'public');

/** Rasterise at 3x the base size (1260 x 1782) so fine line work stays sharp. */
const SCALE = 3;

const W = PAGE_WIDTH;
const H = PAGE_HEIGHT;
const M = 44; // page margin
const CW = W - M * 2; // content width

const C = {
  paper: '#f4f1ea',
  paperWarm: '#efe9dd',
  white: '#fbfaf8',
  ink: '#232120',
  muted: '#7d766a',
  faint: '#b5aea1',
  rule: '#d8d2c7',
  accent: '#c3b5a1',
  concrete: '#d3cfc6',
  deep: '#57544f',
  foliage: '#5f6a58',
  glass: '#7f888a',
};

const FONT = 'Arial, Helvetica, sans-serif';

/* ------------------------------- primitives ------------------------------- */

const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`;

const line = (x1, y1, x2, y2, stroke, width = 0.5, extra = '') =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${width}" ${extra}/>`;

const text = (
  x,
  y,
  content,
  { size = 7, fill = C.ink, weight = 400, spacing = 0, anchor = 'start', opacity = 1 } = {},
) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" ` +
  `letter-spacing="${spacing}" text-anchor="${anchor}" fill="${fill}" opacity="${opacity}">${content}</text>`;

/** Copy rendered as hairlines — reads as a text block at page scale. */
const copy = (x, y, w, count, { gap = 6, color = C.rule, width = 0.5, seed = 0 } = {}) => {
  let out = '';
  for (let i = 0; i < count; i += 1) {
    const factor = 0.6 + (((i + seed) * 37) % 40) / 100;
    out += line(x, y + i * gap, x + w * factor, y + i * gap, color, width);
  }
  return out;
};

const caps = (x, y, content, opts = {}) =>
  text(x, y, content, { size: 5.2, fill: C.muted, spacing: 1.5, ...opts });

const footer = (index, right = '') =>
  text(M, H - 20, String(index + 1).padStart(2, '0'), { size: 5, fill: C.faint, spacing: 1 }) +
  (right ? text(W - M, H - 20, right, { size: 5, fill: C.faint, spacing: 1, anchor: 'end' }) : '');

const frame = (inset = 13) =>
  rect(inset, inset, W - inset * 2, H - inset * 2, 'none', `stroke="${C.rule}" stroke-width="0.5"`);

const matchLabel = (label) => {
  const m = /^(\d\d)\s+(.*?)\s+—\s+(.*)$/.exec(label || '');
  return m ? { number: m[1], name: m[2], part: m[3] } : { number: '', name: label || '', part: '' };
};

/* ------------------------------ page layouts ------------------------------ */

const coverLayout = () => `
${rect(0, 0, W, H, C.paper)}
${frame()}
${rect(0, 0, W, 3, C.ink)}
${caps(M, M + 4, 'SAMARAPU NAVEEN')}
${caps(M, M + 14, 'ARCHITECTURE / DESIGN / IDEAS', { size: 4.2, spacing: 1.1, fill: C.faint })}
${text(M, 286, 'PORT', { size: 54, weight: 300, spacing: 2, fill: C.ink })}
${text(M, 330, 'FOLIO', { size: 54, weight: 300, spacing: 2, fill: C.ink })}
${line(M, 348, M + 120, 348, C.accent, 1.4)}
${caps(M, 366, 'SELECTED WORK  2022 — 2026', { size: 5, spacing: 1.4 })}
<!-- section study -->
<g opacity="0.5">
  ${line(M, 440, W - M, 440, C.rule, 0.5)}
  <path d="M${M} 470 L${M + 60} 470 L${M + 60} 420 L${M + 130} 420 L${M + 130} 470 L${M + 210} 470"
    fill="none" stroke="${C.muted}" stroke-width="0.6"/>
  <path d="M${M} 500 L${M + 92} 500 L${M + 92} 448 L${M + 168} 448 L${M + 168} 500 L${M + 250} 500"
    fill="none" stroke="${C.rule}" stroke-width="0.5"/>
  ${copy(M, 520, 140, 3, { gap: 6, color: C.rule, seed: 3 })}
  ${copy(W - M - 92, 520, 92, 3, { gap: 6, color: C.rule, seed: 8 })}
</g>
${caps(W - M, H - 20, 'VOL. 01', { anchor: 'end', size: 5 })}
`;

const contentsLayout = (projects, index) => {
  let rows = '';
  projects.forEach((project, i) => {
    const y = 120 + i * 46;
    const page = String(project.pageIndex + 1).padStart(2, '0');
    rows +=
      text(M, y, project.number, { size: 15, fill: C.accent, weight: 300 }) +
      text(M + 40, y - 3, project.name.toUpperCase(), { size: 8, spacing: 1.1 }) +
      text(M + 40, y + 8, project.part, { size: 5, fill: C.muted, spacing: 1 }) +
      line(M + 40, y + 16, W - M - 26, y + 16, C.rule, 0.4) +
      text(W - M, y - 3, page, { size: 8, fill: C.muted, anchor: 'end', spacing: 0.8 });
  });

  return `
${rect(0, 0, W, H, C.white)}
${caps(M, M + 4, 'CONTENTS')}
${line(M, M + 12, M + 84, M + 12, C.ink, 0.6)}
${rows}
${line(M, 430, W - M, 430, C.rule, 0.4)}
${copy(M, 448, 150, 4, { gap: 7 })}
${copy(M + 176, 448, 156, 4, { gap: 7 })}
${caps(M, 500, 'ALL DRAWINGS AND IMAGES BY THE AUTHOR UNLESS NOTED')}
${footer(index, 'CONTENTS')}
`;
};

const titleLayout = (label, index) => {
  const { number, name, part } = matchLabel(label);
  return `
${rect(0, 0, W, H, C.paperWarm)}
${text(M, 150, number, { size: 90, weight: 300, fill: C.accent, spacing: 1 })}
${line(M, 176, M + 150, 176, C.ink, 0.7)}
${text(M, 204, name.toUpperCase(), { size: 13, spacing: 1.4 })}
${caps(M, 218, part.toUpperCase(), { size: 5.4, fill: C.muted })}
${copy(M, 260, 150, 13, { gap: 7.5 })}
${copy(M + 176, 260, 156, 13, { gap: 7.5 })}
${line(M + 88, 236, M + 88, 390, C.rule, 0.4)}
${caps(M, 420, 'PROJECT')}
${caps(M + 176, 420, 'STATUS')}
${text(M, 434, 'Competition — 2024', { size: 6, fill: C.ink, spacing: 0.4 })}
${text(M + 176, 434, 'Completed', { size: 6, fill: C.ink, spacing: 0.4 })}
${line(M, 452, W - M, 452, C.rule, 0.4)}
${copy(M, 470, 330, 6, { gap: 7 })}
${footer(index, name.toUpperCase())}
`;
};

const renderLayout = (label, index) => {
  const { number, name } = matchLabel(label);
  return `
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#d6d8d5"/>
    <stop offset="60%" stop-color="#edebe5"/>
    <stop offset="100%" stop-color="#f3f0ea"/>
  </linearGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#cbc7be"/>
    <stop offset="100%" stop-color="#dfdbd2"/>
  </linearGradient>
  <linearGradient id="wall" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#c3beb4"/>
    <stop offset="100%" stop-color="#dedad2"/>
  </linearGradient>
  <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="rgba(60,55,48,0.20)"/>
    <stop offset="100%" stop-color="rgba(60,55,48,0)"/>
  </linearGradient>
  <pattern id="fins" width="9" height="10" patternUnits="userSpaceOnUse">
    <rect width="1" height="10" fill="rgba(66,62,56,0.20)"/>
  </pattern>
  <radialGradient id="vig" cx="50%" cy="42%" r="75%">
    <stop offset="58%" stop-color="rgba(0,0,0,0)"/>
    <stop offset="100%" stop-color="rgba(58,52,44,0.22)"/>
  </radialGradient>
</defs>
${rect(0, 0, W, H, 'url(#sky)')}
<path d="M0 236 L60 214 L128 232 L196 208 L268 230 L340 212 L420 234 L420 300 L0 300 Z" fill="#9aa39b" opacity="0.5"/>
<path d="M0 252 L72 236 L150 250 L232 234 L318 252 L420 238 L420 306 L0 306 Z" fill="#8b958c" opacity="0.55"/>
${rect(0, 268, W, H - 268, 'url(#ground)')}
${rect(96, 150, 210, 156, 'url(#wall)')}
${rect(96, 150, 32, 156, '#b4afa5')}
${rect(96, 150, 210, 3.5, '#f4f1ea')}
${rect(88, 186, 226, 6, '#e8e4dc')}${rect(88, 186, 226, 1.4, 'rgba(60,55,48,0.22)')}
${rect(88, 232, 226, 6, '#e8e4dc')}${rect(88, 232, 226, 1.4, 'rgba(60,55,48,0.22)')}
${rect(88, 276, 226, 6, '#e8e4dc')}${rect(88, 276, 226, 1.4, 'rgba(60,55,48,0.22)')}
${rect(120, 193, 176, 38, C.glass, 'opacity="0.45"')}
${rect(120, 193, 176, 38, 'url(#fins)')}
${rect(120, 239, 176, 36, C.glass, 'opacity="0.38"')}
${rect(120, 239, 176, 36, 'url(#fins)')}
${rect(258, 168, 96, 42, '#d0ccc3')}
${rect(258, 168, 96, 2.5, '#f4f1ea')}
${rect(258, 206, 96, 6, 'rgba(60,55,48,0.20)')}
${line(88, 150, 322, 150, '#6f6a62', 1)}
${rect(166, 258, 46, 48, '#5f5b55')}
${rect(166, 258, 46, 2, '#efece5')}
${line(44, 306, 380, 306, 'rgba(60,55,48,0.14)', 0.5)}
${rect(212, 289, 60, 5, '#c9c4ba')}
${rect(212, 296, 60, 5, '#d3cfc5')}
${rect(212, 303, 60, 4, '#dcd8ce')}
<path d="M0 330 C40 296 78 300 96 322 C120 300 156 302 168 330 Z" fill="${C.foliage}"/>
<path d="M258 334 C282 306 320 304 352 326 C378 306 404 310 420 332 L420 360 L258 360 Z" fill="#4f5949"/>
${rect(0, 336, W, H - 336, '#59614f')}
${rect(0, 336, W, 3.5, 'rgba(255,255,255,0.08)')}
${rect(0, 336, W, H - 336, 'url(#shade)')}
${rect(148, 290, 2.4, 15, '#3d3a36')}
${rect(155, 294, 2.2, 11, '#3d3a36')}
${line(362, 96, 362, 300, '#6b665e', 1.1)}
${rect(344, 104, 36, 3.5, '#6b665e')}
${rect(0, 0, W, H, 'url(#vig)')}
${text(M - 16, H - 20, `${number} — ${name.toUpperCase()}`, { size: 5, fill: 'rgba(255,255,255,0.72)', spacing: 1.2 })}
${text(W - M + 16, H - 20, String(index + 1).padStart(2, '0'), { size: 5, fill: 'rgba(255,255,255,0.72)', spacing: 1, anchor: 'end' })}
`;
};

const drawingLayout = (label, index) => {
  const { number, name } = matchLabel(label);
  let grid = '';
  for (let x = 0; x < W; x += 11) grid += line(x, 0, x, H, 'rgba(35,33,32,0.04)', 0.25);
  for (let y = 0; y < H; y += 11) grid += line(0, y, W, y, 'rgba(35,33,32,0.04)', 0.25);

  const box = (x, y, w, h, sw = 1) =>
    line(x, y, x + w, y, C.ink, sw) +
    line(x, y, x, y + h, C.ink, sw) +
    line(x + w, y, x + w, y + h, C.ink, sw) +
    line(x, y + h, x + w, y + h, C.ink, sw) +
    line(x + 3, y + 3, x + w - 3, y + 3, C.ink, 0.3) +
    line(x + 3, y + 3, x + 3, y + h - 3, C.ink, 0.3) +
    line(x + w - 3, y + 3, x + w - 3, y + h - 3, C.ink, 0.3) +
    line(x + 3, y + h - 3, x + w - 3, y + h - 3, C.ink, 0.3);

  return `
${rect(0, 0, W, H, C.white)}
${grid}
${caps(M, M + 4, 'GROUND FLOOR PLAN')}
${caps(M, M + 13, 'SCALE 1:200')}
${line(M, M + 20, M + 92, M + 20, C.ink, 0.5)}
${box(72, 84, 176, 132)}
${box(248, 84, 96, 74)}
${box(248, 178, 96, 54)}
${line(72, 150, 248, 150, C.ink, 0.4)}
${line(150, 84, 150, 216, C.ink, 0.4)}
${line(300, 84, 300, 232, C.ink, 0.4)}
${rect(96, 106, 56, 32, 'rgba(35,33,32,0.05)')}
${rect(96, 106, 56, 32, 'none', `stroke="${C.ink}" stroke-width="0.35"`)}
${text(101, 124, 'COURTYARD', { size: 4.2, fill: C.muted, spacing: 0.7 })}
<path d="M176 150 A18 18 0 0 1 194 168" fill="none" stroke="${C.ink}" stroke-width="0.35"/>
${line(176, 150, 176, 168, C.ink, 0.35)}
<path d="M248 196 A18 18 0 0 0 266 214" fill="none" stroke="${C.ink}" stroke-width="0.35"/>
${line(266, 196, 266, 214, C.ink, 0.35)}
${line(56, 84, 56, 216, C.muted, 0.3)}
${line(52, 84, 60, 84, C.muted, 0.3)}
${line(52, 216, 60, 216, C.muted, 0.3)}
${text(49, 153, '24.0', { size: 4.4, fill: C.muted, anchor: 'middle' })}
${line(72, 238, 344, 238, C.muted, 0.3)}
${line(72, 234, 72, 242, C.muted, 0.3)}
${line(344, 234, 344, 242, C.muted, 0.3)}
${text(208, 248, '42.0', { size: 4.4, fill: C.muted, anchor: 'middle' })}
<circle cx="360" cy="72" r="11" fill="none" stroke="${C.muted}" stroke-width="0.35"/>
<path d="M360 63 L363.5 79 L360 75.6 L356.5 79 Z" fill="${C.ink}"/>
${text(360, 90, 'N', { size: 4.6, fill: C.muted, anchor: 'middle' })}
${rect(268, 264, 76, 3.5, C.ink)}
${rect(268, 264, 19, 3.5, C.white)}
${rect(287, 264, 19, 3.5, C.white)}
${caps(M, 288, 'DRAWING SET — PLANS, SECTIONS, DETAILS')}
${line(M, 296, W - M, 296, C.rule, 0.4)}
${copy(M, 312, 210, 9, { gap: 6.5 })}
${copy(M + 240, 312, 92, 9, { gap: 6.5 })}
${caps(M, 400, 'MATERIALS')}
${copy(M, 414, 150, 5, { gap: 6.5 })}
${copy(M + 176, 414, 156, 5, { gap: 6.5 })}
${line(M, 452, W - M, 452, C.rule, 0.4)}
${caps(M, 468, 'SECTION A—A')}
<path d="M${M} 500 L${M + 40} 500 L${M + 40} 470 L${M + 120} 470 L${M + 120} 500 L${M + 200} 500 L${M + 200} 462 L${M + 300} 462 L${M + 300} 500 L${W - M} 500"
  fill="none" stroke="${C.muted}" stroke-width="0.5"/>
${line(M, 522, W - M, 522, C.rule, 0.4)}
${footer(index, `${number} — ${name.toUpperCase()}`)}
`;
};

const photoLayout = (label, index) => `
<defs>
  <linearGradient id="warm" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#d9d2c7"/>
    <stop offset="55%" stop-color="#e8e2d8"/>
    <stop offset="100%" stop-color="#f1ece3"/>
  </linearGradient>
  <linearGradient id="fin" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0%" stop-color="#b9b2a6"/>
    <stop offset="60%" stop-color="#ddd7cc"/>
    <stop offset="100%" stop-color="#eae4da"/>
  </linearGradient>
  <linearGradient id="shaft" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="rgba(255,255,255,0.55)"/>
    <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
  </linearGradient>
</defs>
${rect(0, 0, W, H, 'url(#warm)')}
${rect(0, 0, W, 210, '#e2ddd3')}
${rect(0, 122, W, 2, 'rgba(60,55,48,0.10)')}
<g>
  ${[46, 112, 178, 244, 310, 376].map((x) => rect(x - 16, 40, 32, 470, 'url(#fin)')).join('\n  ')}
  ${[46, 112, 178, 244, 310, 376].map((x) => rect(x + 16, 40, 1.5, 470, 'rgba(60,55,48,0.14)')).join('\n  ')}
</g>
<path d="M0 594 L340 120 L420 120 L420 594 Z" fill="url(#shaft)"/>
${rect(0, 336, W, 258, 'rgba(90,84,74,0.10)')}
${rect(0, 330, W, 6, 'rgba(90,84,74,0.16)')}
${rect(0, 500, W, 94, 'rgba(70,66,58,0.14)')}
<circle cx="300" cy="356" r="7" fill="rgba(255,255,255,0.35)"/>
${rect(0, 0, W, H, 'none', `stroke="rgba(35,33,32,0.10)" stroke-width="1"`)}
${rect(M, H - 54, 96, 0.6, 'rgba(255,255,255,0.5)')}
${text(M, H - 40, 'DETAIL — PRECAST FINS', { size: 5.4, fill: 'rgba(255,255,255,0.78)', spacing: 1.3 })}
${text(M, H - 30, matchLabel(label).name.toUpperCase(), { size: 5.4, fill: 'rgba(255,255,255,0.5)', spacing: 1.3 })}
${text(W - M, H - 30, String(index + 1).padStart(2, '0'), { size: 5.4, fill: 'rgba(255,255,255,0.6)', spacing: 1, anchor: 'end' })}
`;

const textLayout = (label, index) => `
${rect(0, 0, W, H, C.white)}
${caps(M, M + 4, 'PROCESS')}
${line(M, M + 12, M + 60, M + 12, C.ink, 0.6)}
${text(M, 96, 'NOTES ON', { size: 20, weight: 300, spacing: 1.6 })}
${text(M, 120, 'WORKING METHOD', { size: 20, weight: 300, spacing: 1.6 })}
${copy(M, 150, 150, 22, { gap: 7.2 })}
${copy(M + 176, 150, 156, 22, { gap: 7.2 })}
${line(M + 88, 140, M + 88, 330, C.rule, 0.4)}
${caps(M, 356, 'SEQUENCE')}
<g opacity="0.85">
  ${line(M, 380, W - M, 380, C.rule, 0.5)}
  ${[0, 1, 2, 3, 4]
    .map((i) => {
      const x = M + i * 66;
      return (
        rect(x, 366, 8, 8, C.ink) +
        text(x + 14, 374, String(i + 1).padStart(2, '0'), { size: 5.4, fill: C.muted, spacing: 0.8 }) +
        line(x + 8, 370, x + 60, 370, C.rule, 0.4)
      );
    })
    .join('\n  ')}
</g>
${copy(M, 400, 120, 4, { gap: 6.5 })}
${copy(M + 176, 400, 156, 4, { gap: 6.5 })}
${line(M, 440, W - M, 440, C.rule, 0.4)}
${caps(M, 456, 'PHOTOGRAPHS, DRAWINGS AND TEXT © SAMARAPU NAVEEN')}
${copy(M, 472, 330, 8, { gap: 7 })}
${footer(index, 'PROCESS')}
`;

const cvLayout = (index) => `
${rect(0, 0, W, H, C.paper)}
${caps(M, M + 4, 'SAMARAPU NAVEEN')}
${caps(W - M, M + 4, 'CURRICULUM VITAE', { anchor: 'end' })}
${line(M, M + 12, W - M, M + 12, C.ink, 0.6)}
${text(M, 104, 'ARCHITECT', { size: 26, weight: 300, spacing: 2 })}
${text(M, 130, 'DESIGNER', { size: 26, weight: 300, spacing: 2, fill: C.accent })}
${copy(M, 156, 196, 8, { gap: 7 })}
${rect(W - M - 96, 84, 96, 120, '#ded8cc')}
${rect(W - M - 96, 84, 96, 120, 'none', `stroke="${C.rule}" stroke-width="0.5"`)}
${line(M, 216, W - M, 216, C.rule, 0.4)}
${caps(M, 234, 'EDUCATION')}
${copy(M, 248, 196, 4, { gap: 6.5 })}
${caps(M + 176, 234, 'EXPERIENCE')}
${copy(M + 176, 248, 156, 4, { gap: 6.5 })}
${line(M, 292, W - M, 292, C.rule, 0.4)}
${caps(M, 310, 'SELECTED AWARDS')}
${copy(M, 324, 196, 4, { gap: 6.5 })}
${caps(M + 176, 310, 'TOOLS')}
${copy(M + 176, 324, 156, 4, { gap: 6.5 })}
${line(M, 368, W - M, 368, C.rule, 0.4)}
${caps(M, 386, 'PUBLICATIONS')}
${copy(M, 400, 330, 5, { gap: 6.5 })}
${line(M, 452, W - M, 452, C.rule, 0.4)}
<circle cx="${W / 2}" cy="492" r="17" fill="none" stroke="${C.ink}" stroke-width="0.6"/>
<path d="M${W / 2} 484 L${W / 2} 500 M${W / 2 - 6} 494 L${W / 2} 500 L${W / 2 + 6} 494"
  fill="none" stroke="${C.ink}" stroke-width="0.7"/>
${caps(W / 2, 526, 'DOWNLOAD CV', { anchor: 'middle', size: 5.4, fill: C.ink })}
${line(W / 2 - 40, 536, W / 2 + 40, 536, C.accent, 0.8)}
${footer(index, 'CV')}
`;

const contactLayout = (index) => `
${rect(0, 0, W, H, C.paperWarm)}
${caps(M, M + 4, 'CONTACT')}
${line(M, M + 12, M + 56, M + 12, C.ink, 0.6)}
${text(M, 150, 'LET’S BUILD', { size: 22, weight: 300, spacing: 1.8 })}
${text(M, 178, 'SOMETHING QUIET', { size: 22, weight: 300, spacing: 1.8, fill: C.accent })}
${line(M, 202, W - M, 202, C.rule, 0.4)}
${caps(M, 222, 'EMAIL')}
${text(M, 238, 'studio@example.com', { size: 8, spacing: 0.4 })}
${caps(M + 176, 222, 'TELEPHONE')}
${text(M + 176, 238, '+00 000 000 000', { size: 8, spacing: 0.4 })}
${line(M, 258, W - M, 258, C.rule, 0.4)}
${caps(M, 278, 'STUDIO')}
${copy(M, 292, 150, 4, { gap: 6.5 })}
${caps(M + 176, 278, 'AVAILABILITY')}
${copy(M + 176, 292, 156, 4, { gap: 6.5 })}
${line(M, 330, W - M, 330, C.rule, 0.4)}
${caps(M, 348, 'ELSEWHERE')}
${['LINKEDIN', 'BEHANCE', 'INSTAGRAM', 'GITHUB']
  .map((name, i) => text(M, 366 + i * 16, name, { size: 5.4, fill: C.ink, spacing: 1.5 }) + line(M, 372 + i * 16, M + 100, 372 + i * 16, C.rule, 0.35))
  .join('\n')}
${line(M, 446, W - M, 446, C.rule, 0.4)}
${copy(M, 462, 330, 7, { gap: 7 })}
${footer(index, 'CONTACT')}
`;

const colophonLayout = (index) => `
${rect(0, 0, W, H, C.white)}
${caps(M, M + 4, 'COLOPHON')}
${line(M, M + 12, M + 66, M + 12, C.ink, 0.6)}
${text(M, 104, 'THIS PORTFOLIO WAS', { size: 15, weight: 300, spacing: 1.2 })}
${text(M, 124, 'ASSEMBLED BY HAND', { size: 15, weight: 300, spacing: 1.2 })}
${copy(M, 152, 210, 12, { gap: 7.4 })}
${copy(M + 240, 152, 92, 12, { gap: 7.4 })}
${line(M, 262, W - M, 262, C.rule, 0.4)}
${[['TYPEFACE', 'Neue Haas / Inter'], ['FORMAT', '420 × 594 mm'], ['EDITION', 'Volume 01 — 2026'], ['SET IN', 'Two weights, three sizes']]
  .map(
    ([k, v], i) =>
      caps(M, 282 + i * 22, k) +
      text(M + 120, 282 + i * 22, v, { size: 6, fill: C.ink, spacing: 0.4 }) +
      line(M, 288 + i * 22, W - M, 288 + i * 22, C.rule, 0.35),
  )
  .join('\n')}
${line(M, 380, W - M, 380, C.rule, 0.4)}
${copy(M, 396, 330, 6, { gap: 7 })}
${rect(M, 452, 60, 60, '#eee9df')}
${rect(M, 452, 60, 60, 'none', `stroke="${C.rule}" stroke-width="0.5"`)}
<path d="M${M + 30} 462 L${M + 30} 502 M${M + 14} 486 L${M + 30} 502 L${M + 46} 486"
  fill="none" stroke="${C.accent}" stroke-width="0.8"/>
${caps(M + 78, 470, 'THANK YOU FOR READING')}
${copy(M + 78, 482, 120, 3, { gap: 6.5 })}
${footer(index, 'COLOPHON')}
`;

const backLayout = () => `
${rect(0, 0, W, H, C.paper)}
${frame()}
${rect(0, H - 3, W, 3, C.ink)}
${caps(M, M + 4, 'SAMARAPU NAVEEN')}
${line(W / 2 - 30, 286, W / 2 + 30, 286, C.accent, 1)}
${text(W / 2, 316, 'PORTFOLIO', { size: 15, weight: 300, spacing: 3, anchor: 'middle' })}
${caps(W / 2, 334, 'VOLUME 01 — 2026', { anchor: 'middle', size: 5 })}
${copy(M + 80, 400, 172, 4, { gap: 7 })}
${rect(M + 158, 452, 16, 16, 'none', `stroke="${C.rule}" stroke-width="0.5"`)}
${rect(M + 166, 452, 8, 16, 'none', `stroke="${C.rule}" stroke-width="0.5"`)}
${caps(M, H - 20, 'ARCHITECTURE / DESIGN / IDEAS')}
`;

const LAYOUTS = {
  cover: () => coverLayout(),
  back: () => backLayout(),
  contents: (page, index) =>
    contentsLayout(
      PAGES.filter((p) => p.layout === 'title').map((p) => ({ ...matchLabel(p.label), pageIndex: PAGES.indexOf(p) })),
      index,
    ),
  title: (page, index) => titleLayout(page.label, index),
  render: (page, index) => renderLayout(page.label, index),
  drawing: (page, index) => drawingLayout(page.label, index),
  photo: (page, index) => photoLayout(page.label, index),
  text: (page, index) => textLayout(page.label, index),
  cv: (_page, index) => cvLayout(index),
  contact: (_page, index) => contactLayout(index),
  colophon: (_page, index) => colophonLayout(index),
};

const svgFor = (page, index) => {
  const body = (LAYOUTS[page.layout] || LAYOUTS.text)(page, index);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * SCALE}" height="${H * SCALE}">${body}</svg>`;
};

/* --------------------------------- cv.pdf --------------------------------- */

const escapePdf = (s) => s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

/** Minimal single page PDF (Helvetica, no embedding) with a correct xref table. */
const buildCvPdf = () => {
  const rows = [
    ['SAMARAPU NAVEEN', 18, 'F2', 60],
    ['ARCHITECTURE / DESIGN / IDEAS', 9, 'F1', 40],
    ['', 10, 'F1', 24],
    ['CURRICULUM VITAE', 14, 'F2', 30],
    ['', 10, 'F1', 20],
    ['EDUCATION', 10, 'F2', 20],
    ['— Bachelor of Architecture, 2018 — 2023', 10, 'F1', 16],
    ['', 10, 'F1', 14],
    ['EXPERIENCE', 10, 'F2', 20],
    ['— Architectural designer, studio practice, 2023 — present', 10, 'F1', 16],
    ['— Competition and concept design, 2021 — 2023', 10, 'F1', 16],
    ['', 10, 'F1', 14],
    ['SELECTED WORK', 10, 'F2', 20],
    ['— Business school design, 2024 (competition, shortlisted)', 10, 'F1', 16],
    ['— Riverside housing, 2024', 10, 'F1', 16],
    ['— Museum of light, 2023', 10, 'F1', 16],
    ['— Urban market hall, 2023', 10, 'F1', 16],
    ['', 10, 'F1', 14],
    ['CONTACT', 10, 'F2', 20],
    ['— studio@example.com', 10, 'F1', 16],
    ['', 10, 'F1', 30],
    ['Replace /public/cv.pdf with your real CV.', 9, 'F1', 14],
  ];

  let y = 790;
  let stream = 'BT\n';
  for (const [label, size, font, advance] of rows) {
    if (label) {
      stream += `/${font} ${size} Tf\n1 0 0 1 60 ${y} Tm\n(${escapePdf(label)}) Tj\n`;
    }
    y -= advance;
  }
  stream += 'ET\n';

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}endstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(Buffer.byteLength(pdf, 'latin1'));
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const startxref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  // Sanity check: every xref offset must point at "N 0 obj".
  const buffer = Buffer.from(pdf, 'latin1');
  offsets.forEach((offset, i) => {
    const head = buffer.subarray(offset, offset + 12).toString('latin1');
    if (!head.startsWith(`${i + 1} 0 obj`)) {
      throw new Error(`cv.pdf xref offset ${offset} does not point at object ${i + 1} ("${head}")`);
    }
  });

  return buffer;
};

/* ---------------------------------- main ---------------------------------- */

const main = async () => {
  await mkdir(OUT_DIR, { recursive: true });

  for (const [index, page] of PAGES.entries()) {
    if (!page.src) continue; // blank page — no artwork to generate
    const svg = svgFor(page, index);
    const file = join(PUBLIC_DIR, page.src.replace(/^\//, ''));
    await sharp(Buffer.from(svg))
      .webp({ quality: 84, effort: 5 })
      .toFile(file);
    const { size } = await stat(file);
    console.log(`  ${page.src.padEnd(34)} ${page.layout.padEnd(9)} ${(size / 1024).toFixed(0)} kB`);
  }

  await writeFile(join(PUBLIC_DIR, 'cv.pdf'), buildCvPdf());
  console.log('\n  /cv.pdf written (placeholder)');
  console.log(`  ${PAGES.length} pages written to /public/portfolio\n`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
