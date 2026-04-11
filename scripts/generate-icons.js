// scripts/generate-icons.js
// Usage: npm run generate:icons
// Requires: `npm install --save-dev sharp` (script added to package.json already)

const fs = require('fs');
const path = require('path');
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.error('Sharp is not installed. Run `npm install --save-dev sharp` and try again.');
  process.exit(1);
}

const sizes = [72, 96, 128, 144, 192, 256, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

async function generate() {
  if (!fs.existsSync(iconsDir)) {
    console.error('Icons directory not found:', iconsDir);
    process.exit(1);
  }

  for (const size of sizes) {
    const svgPath = path.join(iconsDir, `icon-${size}.svg`);
    const outPath = path.join(iconsDir, `icon-${size}.png`);

    if (!fs.existsSync(svgPath)) {
      console.warn(`SVG not found for ${size} — skipping:`, svgPath);
      continue;
    }

    try {
      const svgBuffer = fs.readFileSync(svgPath);
      await sharp(svgBuffer)
        .resize(size, size, { fit: 'contain' })
        .png({ quality: 90 })
        .toFile(outPath);
      console.log(`Generated ${path.relative(process.cwd(), outPath)}`);
    } catch (err) {
      console.error(`Failed to generate PNG for ${svgPath}:`, err.message);
    }
  }

  console.log('Icon generation complete.');
}

generate().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
