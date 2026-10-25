/**
 * Run this once to generate PWA PNG icons from the SVG:
 *   node generate-icons.js
 *
 * Requires: npm install -g sharp-cli
 * Or use an online converter / Figma to export icons at each size.
 *
 * Sizes needed by manifest: 72, 96, 128, 144, 152, 192, 384, 512
 */
const { execSync } = require('child_process');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

sizes.forEach(s => {
  const cmd = `npx sharp -i public/icons/favicon.svg -o public/icons/icon-${s}x${s}.png resize ${s} ${s}`;
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`✅ Generated ${s}x${s}`);
  } catch {
    console.warn(`⚠️  Could not generate ${s}x${s} — run manually or use an image editor.`);
  }
});
