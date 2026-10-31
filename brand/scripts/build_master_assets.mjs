import fs from 'node:fs';
import path from 'node:path';
import { loadFont, textToVectorPath } from './generate_typography.mjs';
import { renderSvgToPng, closeBrowser } from './render_png.mjs';
import {
  buildConceptAMonogram,
  buildConceptAWordmark,
  makeSymbolSvg,
  makeTileSvg
} from './build_concepts_refined.mjs';

const fontsDir = path.join(path.dirname(import.meta.filename), 'fonts');
const interFont = loadFont(path.join(fontsDir, 'Inter.ttf'));

// Stacked Lockup (Symbol on top, wordmark below, centered):
function buildStackedLockup(textColor = '#111318', accentColor = '#4F46E5', bgColor = null) {
  const totalW = 360;
  const totalH = 240;

  // Symbol scaled to 80x80, centered horizontally at x = (360 - 80)/2 = 140, y = 36
  const symbolScale = 80 / 256;
  const paths = buildConceptAMonogram(textColor, accentColor);
  const symbolInner = paths.map(p => `<path d="${p.d}" fill="${p.fill}"/>`).join('\n    ');

  // Wordmark "111iridescence" centered horizontally below symbol at y = 168
  // fontSize 34
  const numRes = textToVectorPath(interFont, '111', 32, { tracking: -0.4, startX: 0, startY: 172 });
  const textRes = textToVectorPath(interFont, 'iridescence', 32, { tracking: -0.4, startX: numRes.width + 6, startY: 172 });
  const wordmarkW = numRes.width + 6 + textRes.width;
  const startX = Math.round((totalW - wordmarkW) / 2);

  const bgRect = bgColor ? `<rect width="${totalW}" height="${totalH}" fill="${bgColor}"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" fill="none" role="img" aria-label="111iridescence logo">
  <title>111iridescence stacked logo</title>
  ${bgRect}
  <g transform="translate(140, 36) scale(${symbolScale})">
    ${symbolInner}
  </g>
  <g transform="translate(${startX}, 0)">
    <path d="${numRes.fullPathData}" fill="${textColor}"/>
    <path d="${textRes.fullPathData}" fill="${textColor}"/>
  </g>
</svg>`;
}

// Vector favicon supporting light and dark mode automatically:
function buildFaviconSvg() {
  const paths = buildConceptAMonogram('currentColor');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none">
  <style>
    path { fill: #111318; }
    @media (prefers-color-scheme: dark) {
      path { fill: #F8FAFC; }
    }
  </style>
  ${paths.map(p => `<path d="${p.d}"/>`).join('\n  ')}
</svg>`;
}

// OpenGraph Social Share Card (1200 x 630):
function buildOgImageSvg() {
  // Editorial background with subtle pearl canvas and specular frame
  const paths = buildConceptAMonogram('#111318', '#4F46E5');
  const symbolInner = paths.map(p => `<path d="${p.d}" fill="${p.fill}"/>`).join('\n    ');

  // Hero wordmark at fontSize 64
  const numRes = textToVectorPath(interFont, '111', 58, { tracking: -0.5, startX: 0, startY: 330 });
  const textRes = textToVectorPath(interFont, 'iridescence', 58, { tracking: -0.4, startX: numRes.width + 10, startY: 330 });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630" fill="none">
  <rect width="1200" height="630" fill="#FAF9FC"/>
  <!-- Specular inner margin card -->
  <rect x="40" y="40" width="1120" height="550" rx="32" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
  
  <!-- Studio Symbol Hero (Scaled 128x128 at (120, 160)) -->
  <g transform="translate(120, 160) scale(0.5)">
    <rect width="256" height="256" rx="58" fill="#F1F5F9"/>
    ${symbolInner}
  </g>

  <!-- Brand Typography -->
  <g transform="translate(280, 0)">
    <path d="${numRes.fullPathData}" fill="#111318"/>
    <path d="${textRes.fullPathData}" fill="#111318"/>
  </g>

  <!-- Studio Subtitle / Tagline -->
  <text x="280" y="380" font-family="-apple-system, BlinkMacSystemFont, 'Inter', 'SF Pro Display', sans-serif" font-size="22" font-weight="500" fill="#64748B" letter-spacing="-0.3">
    Independent, lightweight native macOS applications.
  </text>

  <!-- App Lineage Badges -->
  <g transform="translate(280, 430)">
    <!-- PDF Reader pill -->
    <rect x="0" y="0" width="190" height="42" rx="12" fill="#EFF6FF" stroke="#BFDBFE" stroke-width="1.5"/>
    <circle cx="22" cy="21" r="5" fill="#2563EB"/>
    <text x="36" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#1D4ED8">PDF Reader</text>

    <!-- Mass Print pill -->
    <rect x="206" y="0" width="170" height="42" rx="12" fill="#FFF7ED" stroke="#FED7AA" stroke-width="1.5"/>
    <circle cx="228" cy="21" r="5" fill="#EA580C"/>
    <text x="242" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#C2410C">Mass Print</text>

    <!-- Resource Guard pill -->
    <rect x="392" y="0" width="200" height="42" rx="12" fill="#ECFDF5" stroke="#A7F3D0" stroke-width="1.5"/>
    <circle cx="414" cy="21" r="5" fill="#059669"/>
    <text x="428" y="27" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="600" fill="#047857">Resource Guard</text>
  </g>
</svg>`;
}

async function run() {
  console.log('Building Master Brand Production Assets...');
  const masterDir = 'brand-v2/logos/master';
  const websiteDir = 'brand-v2/website';
  const previewsDir = 'brand-v2/previews/master';
  fs.mkdirSync(masterDir, { recursive: true });
  fs.mkdirSync(websiteDir, { recursive: true });
  fs.mkdirSync(previewsDir, { recursive: true });

  // 1. Master Symbols
  fs.writeFileSync(`${masterDir}/symbol-color.svg`, makeSymbolSvg(buildConceptAMonogram('#111318', '#4F46E5'), '111iridescence symbol'));
  fs.writeFileSync(`${masterDir}/symbol-dark.svg`, makeSymbolSvg(buildConceptAMonogram('#F8FAFC', '#818CF8'), '111iridescence symbol dark'));
  fs.writeFileSync(`${masterDir}/symbol-mono-black.svg`, makeSymbolSvg(buildConceptAMonogram('#000000'), '111iridescence symbol monochrome black'));
  fs.writeFileSync(`${masterDir}/symbol-mono-white.svg`, makeSymbolSvg(buildConceptAMonogram('#FFFFFF'), '111iridescence symbol monochrome white'));
  fs.writeFileSync(`${masterDir}/compact-light.svg`, makeTileSvg(buildConceptAMonogram('#111318', '#4F46E5'), '#FFFFFF', 'rgba(0,0,0,0.08)'));
  fs.writeFileSync(`${masterDir}/compact-dark.svg`, makeTileSvg(buildConceptAMonogram('#F8FAFC', '#818CF8'), '#111318', 'rgba(255,255,255,0.12)'));

  // 2. Master Wordmarks & Lockups
  const wm_light = buildConceptAWordmark('#111318', '#4F46E5');
  const wm_dark = buildConceptAWordmark('#F8FAFC', '#818CF8');
  const wm_mono_black = buildConceptAWordmark('#000000');
  const wm_mono_white = buildConceptAWordmark('#FFFFFF');

  fs.writeFileSync(`${masterDir}/wordmark-light.svg`, wm_light.svg);
  fs.writeFileSync(`${masterDir}/wordmark-dark.svg`, wm_dark.svg);
  fs.writeFileSync(`${masterDir}/wordmark-mono-black.svg`, wm_mono_black.svg);
  fs.writeFileSync(`${masterDir}/wordmark-mono-white.svg`, wm_mono_white.svg);
  fs.writeFileSync(`${masterDir}/lockup-horizontal-light.svg`, wm_light.svg);
  fs.writeFileSync(`${masterDir}/lockup-horizontal-dark.svg`, wm_dark.svg);
  fs.writeFileSync(`${masterDir}/lockup-stacked-light.svg`, buildStackedLockup('#111318', '#4F46E5'));
  fs.writeFileSync(`${masterDir}/lockup-stacked-dark.svg`, buildStackedLockup('#F8FAFC', '#818CF8', '#111318'));

  // 3. Website Assets
  fs.writeFileSync(`${websiteDir}/favicon.svg`, buildFaviconSvg());
  fs.writeFileSync(`${websiteDir}/og-image.svg`, buildOgImageSvg());

  // Render PNG Exports across full resolution ladder:
  console.log('Rendering Master PNG exports...');
  // Symbol at 16, 24, 32, 64, 128, 256, 512, 1024
  for (const sz of [1024, 512, 256, 128, 64, 32, 24, 16]) {
    await renderSvgToPng(`${masterDir}/symbol-color.svg`, `${masterDir}/symbol-color-${sz}.png`, sz, sz);
    await renderSvgToPng(`${masterDir}/symbol-mono-black.svg`, `${masterDir}/symbol-mono-black-${sz}.png`, sz, sz);
    await renderSvgToPng(`${masterDir}/compact-light.svg`, `${masterDir}/compact-light-${sz}.png`, sz, sz);
    await renderSvgToPng(`${masterDir}/compact-dark.svg`, `${masterDir}/compact-dark-${sz}.png`, sz, sz, { background: '#0D1117' });
  }

  // Wordmarks at high resolution:
  await renderSvgToPng(`${masterDir}/wordmark-light.svg`, `${masterDir}/wordmark-light-1200x300.png`, 1200, 300);
  await renderSvgToPng(`${masterDir}/wordmark-dark.svg`, `${masterDir}/wordmark-dark-1200x300.png`, 1200, 300, { background: '#111318' });
  await renderSvgToPng(`${masterDir}/lockup-stacked-light.svg`, `${masterDir}/lockup-stacked-light-800x600.png`, 800, 600);

  // Website assets:
  await renderSvgToPng(`${websiteDir}/favicon.svg`, `${websiteDir}/favicon-32x32.png`, 32, 32);
  await renderSvgToPng(`${websiteDir}/favicon.svg`, `${websiteDir}/favicon-16x16.png`, 16, 16);
  await renderSvgToPng(`${masterDir}/compact-light.svg`, `${websiteDir}/apple-touch-icon.png`, 180, 180);
  await renderSvgToPng(`${websiteDir}/og-image.svg`, `${websiteDir}/og-image.png`, 1200, 630);

  await closeBrowser();
  console.log('Master Brand Assets generated successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
