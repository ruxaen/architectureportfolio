import sharp from 'sharp';
const src = process.argv[2];
const dest = process.argv[3] || 'public/bg-studio.webp';
await sharp(src).resize(1920, null, { withoutEnlargement: true }).webp({ quality: 80 }).toFile(dest);
console.log(`Converted ${src} → ${dest}`);
