import fs from 'node:fs';
import path from 'node:path';
import { loadFont, textToVectorPath } from './generate_typography.mjs';
import { renderSvgToPng, closeBrowser } from './render_png.mjs';

const fontsDir = path.join(path.dirname(import.meta.filename), 'fonts');
const interFont = loadFont(path.join(fontsDir, 'Inter.ttf'));
const jakartaFont = loadFont(path.join(fontsDir, 'PlusJakartaSans.ttf'));
const newsreaderFont = loadFont(path.join(fontsDir, 'Newsreader.ttf'));

// =====================================================================
// DIRECTION A: Typographic Minimalism ("The Cadence Triple")
// =====================================================================
// Standalone Monogram (256x256):
// Three architectural stems with 45° beaks.
// Stem width: 22, height: 120 (y from 68 to 188).
// Gap: 26. Beak: width 14, height 18.
// Stems at x = [74..96], [122..144], [170..192].
// Total width = 132. Perfectly centered: (74 - 14 + 192)/2 = 126 ≈ 128.
export function buildConceptAMonogram(color = '#111318', accent = null) {
  const stem1 = `M 74 68 L 96 68 L 96 188 L 74 188 L 74 90 L 60 104 L 60 82 Z`;
  const stem2 = `M 122 68 L 144 68 L 144 188 L 122 188 L 122 90 L 108 104 L 108 82 Z`;
  const stem3 = `M 170 68 L 192 68 L 192 188 L 170 188 L 170 90 L 156 104 L 156 82 Z`;

  return [
    { d: stem1, fill: color },
    { d: stem2, fill: color },
    { d: stem3, fill: accent || color }
  ];
}

// Direction A Master Wordmark:
// Custom architectural "111" directly integrated with "iridescence"!
// Scale: cap-height = 42px.
// "111": 3 stems of width 7.5px, gap 9px, beak 5px. Height 42px.
// Followed by 10px gap, then "iridescence" in Inter at 42px!
export function buildConceptAWordmark(textColor = '#111318', accentColor = null, fontSize = 42) {
  const yTop = 14;
  const yBase = 54;
  const stemW = 7.5;
  const beakW = 5;
  const beakH = 6.5;

  const num1 = `M 5 ${yTop} L ${5 + stemW} ${yTop} L ${5 + stemW} ${yBase} L 5 ${yBase} L 5 ${yTop + beakH + 2} L 0 ${yTop + beakH + 7} L 0 ${yTop + beakH} Z`;
  const num2 = `M 22 ${yTop} L ${22 + stemW} ${yTop} L ${22 + stemW} ${yBase} L 22 ${yBase} L 22 ${yTop + beakH + 2} L 17 ${yTop + beakH + 7} L 17 ${yTop + beakH} Z`;
  const num3 = `M 39 ${yTop} L ${39 + stemW} ${yTop} L ${39 + stemW} ${yBase} L 39 ${yBase} L 39 ${yTop + beakH + 2} L 34 ${yTop + beakH + 7} L 34 ${yTop + beakH} Z`;

  const textRes = textToVectorPath(interFont, 'iridescence', fontSize, { tracking: -0.4, startX: 60, startY: yBase });

  const totalW = Math.ceil(60 + textRes.width + 16);
  const totalH = 68;

  const cNum3 = accentColor || textColor;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" fill="none" role="img" aria-label="111iridescence">
  <title>111iridescence wordmark</title>
  <path d="${num1}" fill="${textColor}"/>
  <path d="${num2}" fill="${textColor}"/>
  <path d="${num3}" fill="${cNum3}"/>
  <path d="${textRes.fullPathData}" fill="${textColor}"/>
</svg>`;

  return { svg, totalW, totalH };
}

// =====================================================================
// DIRECTION B: Geometric Identity ("The Prismatic Monolith")
// =====================================================================
// Mark (256x256):
// Three stepped vertical monoliths with 45° angled tops that form a descending light wave.
// Center at (128, 128). Width = 118, Height = 138.
// Pillar 1: x from 69 to 95 (w=26), y from 59 to 179.
// Pillar 2: x from 115 to 141 (w=26), y from 73 to 193.
// Pillar 3: x from 161 to 187 (w=26), y from 87 to 207.
export function buildConceptBMonogram(color = '#111318', accent = null) {
  const p1 = `M 69 85 L 95 59 L 95 179 L 69 179 Z`;
  const p2 = `M 115 99 L 141 73 L 141 193 L 115 193 Z`;
  const p3 = `M 161 113 L 187 87 L 187 207 L 161 207 Z`;

  return [
    { d: p1, fill: color },
    { d: p2, fill: accent || color },
    { d: p3, fill: color }
  ];
}

export function buildConceptBWordmark(textColor = '#111318', accentColor = null, fontSize = 40) {
  const markScale = 32 / 256;
  const paths = buildConceptBMonogram(textColor, accentColor);
  const markInner = paths.map(p => `<path d="${p.d}" fill="${p.fill}"/>`).join('\n    ');

  const textRes = textToVectorPath(jakartaFont, '111iridescence', fontSize, { tracking: -0.3, startX: 56, startY: 42 });
  const totalW = Math.ceil(56 + textRes.width + 16);
  const totalH = 60;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" fill="none" role="img" aria-label="111iridescence">
  <title>111iridescence logo</title>
  <g transform="translate(12, 14) scale(${markScale})">
    ${markInner}
  </g>
  <path d="${textRes.fullPathData}" fill="${textColor}"/>
</svg>`;

  return { svg, totalW, totalH };
}

// =====================================================================
// DIRECTION C: Editorial Sophistication ("The Atelier Cipher")
// =====================================================================
// Monogram (256x256):
// Three classical Roman / transitional serif numerals "111" extracted from Newsreader
// at 104pt with tight, hand-calibrated kerning so they fit the 256 canvas perfectly!
export function buildConceptCMonogram(color = '#111318', accent = null) {
  // Exactly 3 ones on 256x256 canvas, centered:
  // Using startX = 64, startY = 172, fontSize = 104
  const res = textToVectorPath(newsreaderFont, '111', 104, { tracking: -3, startX: 64, startY: 172 });
  return res.paths.map((p, idx) => ({
    d: p.pathData,
    fill: (idx === 2 && accent) ? accent : color
  }));
}

export function buildConceptCWordmark(textColor = '#111318', accentColor = null, fontSize = 42) {
  const textRes = textToVectorPath(newsreaderFont, '111iridescence', fontSize, { tracking: 0.2, startX: 16, startY: 44 });
  const totalW = Math.ceil(16 + textRes.width + 20);
  const totalH = 64;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" fill="none" role="img" aria-label="111iridescence">
  <title>111iridescence wordmark</title>
  <path d="${textRes.fullPathData}" fill="${textColor}"/>
</svg>`;

  return { svg, totalW, totalH };
}

export function makeSymbolSvg(paths, title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none" role="img" aria-label="${title}">
  <title>${title}</title>
  ${paths.map(p => `<path d="${p.d}" fill="${p.fill}"/>`).join('\n  ')}
</svg>`;
}

export function makeTileSvg(paths, bg = '#FFFFFF', stroke = null, title = 'icon') {
  const strokeAttr = stroke ? `stroke="${stroke}" stroke-width="1.5"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none" role="img" aria-label="${title}">
  <title>${title}</title>
  <rect width="256" height="256" rx="58" fill="${bg}"/>
  ${stroke ? `<rect x="1" y="1" width="254" height="254" rx="57" ${strokeAttr} fill="none"/>` : ''}
  <g>
    ${paths.map(p => `<path d="${p.d}" fill="${p.fill}"/>`).join('\n    ')}
  </g>
</svg>`;
}

async function run() {
  const rendersDir = 'brand-v2/previews/concepts';
  fs.mkdirSync(rendersDir, { recursive: true });

  // 1. Concept A
  const dirA = 'brand-v2/logos/concept-a';
  fs.mkdirSync(dirA, { recursive: true });
  fs.writeFileSync(`${dirA}/symbol-black.svg`, makeSymbolSvg(buildConceptAMonogram('#111318'), '111iridescence Cadence mark'));
  fs.writeFileSync(`${dirA}/symbol-white.svg`, makeSymbolSvg(buildConceptAMonogram('#F8FAFC'), '111iridescence Cadence mark'));
  fs.writeFileSync(`${dirA}/symbol-color.svg`, makeSymbolSvg(buildConceptAMonogram('#111318', '#4F46E5'), '111iridescence Cadence mark'));
  fs.writeFileSync(`${dirA}/compact-light.svg`, makeTileSvg(buildConceptAMonogram('#111318', '#4F46E5'), '#FFFFFF', 'rgba(0,0,0,0.08)'));
  fs.writeFileSync(`${dirA}/compact-dark.svg`, makeTileSvg(buildConceptAMonogram('#F8FAFC', '#818CF8'), '#111318', 'rgba(255,255,255,0.12)'));
  
  const wmA_light = buildConceptAWordmark('#111318', '#4F46E5');
  const wmA_dark = buildConceptAWordmark('#F8FAFC', '#818CF8');
  fs.writeFileSync(`${dirA}/wordmark-light.svg`, wmA_light.svg);
  fs.writeFileSync(`${dirA}/wordmark-dark.svg`, wmA_dark.svg);
  fs.writeFileSync(`${dirA}/lockup-light.svg`, wmA_light.svg);
  fs.writeFileSync(`${dirA}/lockup-dark.svg`, wmA_dark.svg);

  // 2. Concept B
  const dirB = 'brand-v2/logos/concept-b';
  fs.mkdirSync(dirB, { recursive: true });
  fs.writeFileSync(`${dirB}/symbol-black.svg`, makeSymbolSvg(buildConceptBMonogram('#111318'), '111iridescence Prismatic mark'));
  fs.writeFileSync(`${dirB}/symbol-white.svg`, makeSymbolSvg(buildConceptBMonogram('#F8FAFC'), '111iridescence Prismatic mark'));
  fs.writeFileSync(`${dirB}/symbol-color.svg`, makeSymbolSvg(buildConceptBMonogram('#111318', '#0284C7'), '111iridescence Prismatic mark'));
  fs.writeFileSync(`${dirB}/compact-light.svg`, makeTileSvg(buildConceptBMonogram('#111318', '#0284C7'), '#FFFFFF', 'rgba(0,0,0,0.08)'));
  fs.writeFileSync(`${dirB}/compact-dark.svg`, makeTileSvg(buildConceptBMonogram('#F8FAFC', '#38BDF8'), '#111318', 'rgba(255,255,255,0.12)'));
  
  const wmB_light = buildConceptBWordmark('#111318', '#0284C7');
  const wmB_dark = buildConceptBWordmark('#F8FAFC', '#38BDF8');
  fs.writeFileSync(`${dirB}/wordmark-light.svg`, wmB_light.svg);
  fs.writeFileSync(`${dirB}/wordmark-dark.svg`, wmB_dark.svg);
  fs.writeFileSync(`${dirB}/lockup-light.svg`, wmB_light.svg);
  fs.writeFileSync(`${dirB}/lockup-dark.svg`, wmB_dark.svg);

  // 3. Concept C
  const dirC = 'brand-v2/logos/concept-c';
  fs.mkdirSync(dirC, { recursive: true });
  fs.writeFileSync(`${dirC}/symbol-black.svg`, makeSymbolSvg(buildConceptCMonogram('#111318'), '111iridescence Atelier mark'));
  fs.writeFileSync(`${dirC}/symbol-white.svg`, makeSymbolSvg(buildConceptCMonogram('#F8FAFC'), '111iridescence Atelier mark'));
  fs.writeFileSync(`${dirC}/symbol-color.svg`, makeSymbolSvg(buildConceptCMonogram('#111318', '#7C3AED'), '111iridescence Atelier mark'));
  fs.writeFileSync(`${dirC}/compact-light.svg`, makeTileSvg(buildConceptCMonogram('#111318', '#7C3AED'), '#FAF9FC', 'rgba(0,0,0,0.08)'));
  fs.writeFileSync(`${dirC}/compact-dark.svg`, makeTileSvg(buildConceptCMonogram('#F8FAFC', '#A78BFA'), '#161B22', 'rgba(255,255,255,0.12)'));

  const wmC_light = buildConceptCWordmark('#111318', '#7C3AED');
  const wmC_dark = buildConceptCWordmark('#F8FAFC', '#A78BFA');
  fs.writeFileSync(`${dirC}/wordmark-light.svg`, wmC_light.svg);
  fs.writeFileSync(`${dirC}/wordmark-dark.svg`, wmC_dark.svg);
  fs.writeFileSync(`${dirC}/lockup-light.svg`, wmC_light.svg);
  fs.writeFileSync(`${dirC}/lockup-dark.svg`, wmC_dark.svg);

  // Render PNGs
  for (const c of ['concept-a', 'concept-b', 'concept-c']) {
    const d = `brand-v2/logos/${c}`;
    await renderSvgToPng(`${d}/symbol-black.svg`, `${rendersDir}/${c}-symbol-black-512.png`, 512, 512);
    await renderSvgToPng(`${d}/symbol-color.svg`, `${rendersDir}/${c}-symbol-color-512.png`, 512, 512);
    await renderSvgToPng(`${d}/symbol-white.svg`, `${rendersDir}/${c}-symbol-white-512.png`, 512, 512, { background: '#111318' });
    await renderSvgToPng(`${d}/compact-light.svg`, `${rendersDir}/${c}-compact-light-512.png`, 512, 512);
    await renderSvgToPng(`${d}/compact-dark.svg`, `${rendersDir}/${c}-compact-dark-512.png`, 512, 512, { background: '#0D1117' });
    await renderSvgToPng(`${d}/lockup-light.svg`, `${rendersDir}/${c}-lockup-light.png`, 800, 160);
    await renderSvgToPng(`${d}/lockup-dark.svg`, `${rendersDir}/${c}-lockup-dark.png`, 800, 160, { background: '#111318' });

    for (const sz of [128, 64, 32, 16]) {
      await renderSvgToPng(`${d}/symbol-black.svg`, `${rendersDir}/${c}-symbol-${sz}.png`, sz, sz);
      await renderSvgToPng(`${d}/compact-light.svg`, `${rendersDir}/${c}-compact-${sz}.png`, sz, sz);
    }
  }

  await closeBrowser();
  console.log('Successfully generated and rendered all 3 refined concepts!');
}

if (process.argv[1] === import.meta.filename) {
  run().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
