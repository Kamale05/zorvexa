import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// SVG Definitions for Zorvexa Premium Dark Blue Gradient with Diamond/Luxury Z
const svgSquare = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Deep Navy to Midnight Blue Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#070D1E"/>
      <stop offset="45%" stop-color="#0E1E3F"/>
      <stop offset="85%" stop-color="#162D63"/>
      <stop offset="100%" stop-color="#1D4ED8"/>
    </linearGradient>

    <!-- Center Radial Glow -->
    <radialGradient id="centerGlow" cx="50%" cy="50%" r="55%">
      <stop offset="0%" stop-color="#38BDF8" stop-opacity="0.25"/>
      <stop offset="60%" stop-color="#1E40AF" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="#070D1E" stop-opacity="0"/>
    </radialGradient>

    <!-- Metallic/Luminous Silver-Cyan Gradient for Z -->
    <linearGradient id="zGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="30%" stop-color="#E0F2FE"/>
      <stop offset="70%" stop-color="#BAE6FD"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>

    <!-- Subtle Bevel Shadow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#0284C7" flood-opacity="0.45"/>
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Dark Blue Gradient Rounded Background -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)"/>
  <rect width="512" height="512" rx="112" fill="url(#centerGlow)"/>
  
  <!-- Subtle Border Stroke -->
  <rect x="2" y="2" width="508" height="508" rx="110" fill="none" stroke="#38BDF8" stroke-opacity="0.3" stroke-width="4"/>

  <!-- High-Precision Modern Geometric 'Z' Monogram with Diamond Cuts -->
  <g filter="url(#glow)">
    <!-- Top Horizontal Bar -->
    <path d="M 120 148 C 120 134.7 130.7 124 144 124 L 368 124 C 381.3 124 392 134.7 392 148 C 392 155.8 388.2 163.2 381.8 167.6 L 208 288 L 368 288 C 381.3 288 392 298.7 392 312 C 392 325.3 381.3 336 368 336 L 144 336 C 130.7 336 120 325.3 120 312 C 120 304.2 123.8 296.8 130.2 292.4 L 304 172 L 144 172 C 130.7 172 120 161.3 120 148 Z" fill="none"/>
    
    <!-- Bold Sharp Z Glyph Path -->
    <path d="M 128 132 C 128 124 134.5 120 144 120 L 364 120 C 378 120 388 132 384 146 L 236 344 L 368 344 C 379 344 388 353 388 364 C 388 375 379 384 368 384 L 144 384 C 130 384 120 372 124 358 L 272 160 L 144 160 C 133 160 128 152 128 142 Z" 
          fill="url(#zGrad)" 
          stroke="#FFFFFF" 
          stroke-width="3" 
          stroke-linejoin="round"/>
          
    <!-- Dynamic Speed/Accent Notch Line -->
    <path d="M 220 252 L 292 252" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
  </g>
</svg>`;

const svgCircle = svgSquare.replace(/rx="112"/g, 'rx="256"').replace(/rx="110"/g, 'rx="254"');

// Foreground for Android adaptive icon (transparent background)
const svgForeground = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="zGradFg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="40%" stop-color="#E0F2FE"/>
      <stop offset="80%" stop-color="#BAE6FD"/>
      <stop offset="100%" stop-color="#38BDF8"/>
    </linearGradient>
    <filter id="fgGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#0284C7" flood-opacity="0.5"/>
    </filter>
  </defs>
  <g transform="translate(64, 64) scale(0.75)" filter="url(#fgGlow)">
    <path d="M 128 132 C 128 124 134.5 120 144 120 L 364 120 C 378 120 388 132 384 146 L 236 344 L 368 344 C 379 344 388 353 388 364 C 388 375 379 384 368 384 L 144 384 C 130 384 120 372 124 358 L 272 160 L 144 160 C 133 160 128 152 128 142 Z" 
          fill="url(#zGradFg)" 
          stroke="#FFFFFF" 
          stroke-width="3" 
          stroke-linejoin="round"/>
    <path d="M 220 252 L 292 252" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
  </g>
</svg>`;

async function run() {
  console.log('Generating Zorvexa App Icons...');

  // 1. Write Web SVGs
  fs.writeFileSync('public/favicon.svg', svgSquare);
  fs.writeFileSync('public/icons/icon-192.svg', svgSquare);
  fs.writeFileSync('public/icons/icon-512.svg', svgSquare);
  fs.writeFileSync('public/icons/icon-maskable-512.svg', svgSquare);

  // 2. Android Mipmap Sizes
  const densities = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const { dir, size } of densities) {
    const targetDir = path.join('android/app/src/main/res', dir);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Square launcher
    await sharp(Buffer.from(svgSquare))
      .resize(size, size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher.png'));

    // Round launcher
    await sharp(Buffer.from(svgCircle))
      .resize(size, size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_round.png'));

    // Adaptive Foreground
    await sharp(Buffer.from(svgForeground))
      .resize(size, size)
      .png()
      .toFile(path.join(targetDir, 'ic_launcher_foreground.png'));

    console.log(`✓ Generated ${dir} icons (${size}x${size})`);
  }

  // Update ic_launcher_background.xml
  const bgXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#070D1E</color>
</resources>
`;
  fs.writeFileSync('android/app/src/main/res/values/ic_launcher_background.xml', bgXml);

  console.log('All Zorvexa icons and Android settings successfully generated!');
}

run().catch((err) => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
