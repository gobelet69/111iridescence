import fs from 'node:fs';
import path from 'node:path';
import { loadFont, textToVectorPath } from './generate_typography.mjs';
import { renderSvgToPng, closeBrowser } from './render_png.mjs';

const fontsDir = path.join(path.dirname(import.meta.filename), 'fonts');
const interFont = loadFont(path.join(fontsDir, 'Inter.ttf'));
const jakartaFont = loadFont(path.join(fontsDir, 'PlusJakartaSans.ttf'));
const newsreaderFont = loadFont(path.join(fontsDir, 'Newsreader.ttf'));

// -------------------------------------------------------------
// DIRECTION A: Typographic Minimalism ("The Cadence Triple")
// -------------------------------------------------------------
// Construction:
// Strict Swiss modernist 111 monogram. Three vertical architectural stems
// with razor-sharp 45° beaks, exact 24px stem width, 18px rhythmic gaps.
// Optical height 140px on 256x256 canvas.
// Subtly stepped top beaks: each 1 has a 45° angle beak (dx=20, dy=20)
// and an optical aperture dot or clean base.
function buildConceptASymbol(color = '#111318', accent = null) {
  // Stem width: 24
  // Gap: 20
  // 3 stems: total width = 24*3 + 20*2 = 72 + 40 = 112
  // With beaks (dx=18): left extends by 18, so total width = 112 + 18 = 130
  // Leftmost point: x = (256 - 130) / 2 = 63
  // Stem 1: x_stem = 63 + 18 = 81 to 105
  // Stem 2: x_stem = 81 + 24 + 20 = 125 to 149
  // Stem 3: x_stem = 125 + 24 + 20 = 169 to 193
  // y: from 60 to 196 (height 136)
  
  // Single 1 path:
  // M x, 60 L x+24, 60 L x+24, 196 L x, 196 L x, 84 L x-18, 102 L x-18, 78 Z
  const stem1 = `M 81 60 L 105 60 L 105 196 L 81 196 L 81 84 L 63 102 L 63 78 Z`;
  const stem2 = `M 125 60 L 149 60 L 149 196 L 125 196 L 125 84 L 107 102 L 107 78 Z`;
  const stem3 = `M 169 60 L 193 60 L 193 196 L 169 196 L 169 84 L 151 102 L 151 78 Z`;

  // If accent is provided, stem 3 or an optical dot carries the restrained spectral iris accent
  const c1 = color;
  const c2 = color;
  const c3 = accent || color;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none" role="img" aria-labelledby="titleA">
  <title id="titleA">111iridescence — Direction A (Cadence Triple)</title>
  <path d="${stem1}" fill="${c1}"/>
  <path d="${stem2}" fill="${c2}"/>
  <path d="${stem3}" fill="${c3}"/>
</svg>`;
}

// -------------------------------------------------------------
// DIRECTION B: Geometric Identity ("The Prismatic Monolith")
// -------------------------------------------------------------
// Construction:
// An iconic 60° equilateral refractive prism wedge with three precision
// vertical negative-space channels forming the "111" cadence.
// Outside: Equilateral triangular prism silhouette with chamfered apex (r=12).
// Height: 156, Base: 180. Center at (128, 134).
// Apex: (128, 52). Left base: (38, 208). Right base: (218, 208).
// Three vertical channels (stems of light) cut through the volume.
function buildConceptBSymbol(color = '#111318', accent = null) {
  // A geometric composition: An equilateral optical prism intersected by three
  // stepped refractive bars that form a bold, unmistakable silhouette.
  // We construct a hexagon-prism with three interlocking refractive facets:
  // Facet 1 (left): 120° chevron
  // Facet 2 (center): vertical pillar with 60° chamfer
  // Facet 3 (right): 120° chevron
  // Or: an optical prism where light splits into three precision vertical channels.
  // Let's create an iconic geometric prism mark:
  // Outer shape: rounded equilateral triangle:
  // Apex at (128, 48), Bottom-Right (216, 200), Bottom-Left (40, 200).
  // Inside are three vertical negative-space slits (width 12, gaps 20),
  // dividing the prism into 3 bold structural pillars with angled roofs.
  
  // Left pillar:
  // Outer diagonal left: from (68, 200) to (108, 130) to (108, 200)
  // Let's draw three distinct precision geometric monolithic pillars that together form a 60° optical prism envelope:
  // Stem 1: x: 62 to 92 (w=30). Top angled at 60°: from (62, 162) up to (92, 110), base at (62, 204) to (92, 204).
  // Stem 2: x: 113 to 143 (w=30). Top apex at (128, 50). Angled roof from (113, 76) to (128, 50) to (143, 76), base at (113, 204) to (143, 204).
  // Stem 3: x: 164 to 194 (w=30). Top angled at 60°: from (164, 110) down to (194, 162), base at (164, 204) to (194, 204).
  
  // Rounded corners via path:
  const p1 = `M 64 165 L 94 113 L 94 202 C 94 205 92 206 89 206 L 69 206 C 66 206 64 205 64 202 Z`;
  const p2 = `M 113 77 L 126 53 C 127 51 129 51 130 53 L 143 77 L 143 202 C 143 205 141 206 138 206 L 118 206 C 115 206 113 205 113 202 Z`;
  const p3 = `M 162 113 L 192 165 L 192 202 C 192 205 190 206 187 206 L 167 206 C 164 206 162 205 162 202 Z`;

  const c1 = color;
  const c2 = accent || color;
  const c3 = color;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none" role="img" aria-labelledby="titleB">
  <title id="titleB">111iridescence — Direction B (Prismatic Monolith)</title>
  <path d="${p1}" fill="${c1}"/>
  <path d="${p2}" fill="${c2}"/>
  <path d="${p3}" fill="${c3}"/>
</svg>`;
}

// -------------------------------------------------------------
// DIRECTION C: Editorial Sophistication ("The Atelier Cipher")
// -------------------------------------------------------------
// Construction:
// Characterful artisanal monogram. Inspired by classical bookmaking,
// fine typography, and Roman numerals (III / 111).
// Three vertical serif columns bound by a refined horizontal architectural lintel / serif
// at top and bottom, with delicate bracketed serifs and high-craft proportions.
function buildConceptCSymbol(color = '#111318', accent = null) {
  // Three classical columns with bracketed serifs:
  // Canvas 256x256. Center (128, 128).
  // Top horizontal serif bar: x from 56 to 200, y from 64 to 76 (thickness 12, r=2).
  // Bottom horizontal serif bar: x from 56 to 200, y from 180 to 192 (thickness 12, r=2).
  // Three vertical fluted columns connecting them:
  // Column 1: x = 76 to 96 (w=20)
  // Column 2: x = 118 to 138 (w=20)
  // Column 3: x = 160 to 180 (w=20)
  // Bracketed flutes / serifs where columns meet the top and bottom bars.
  // Optical center diamond or subtle dot in the middle column.
  
  // Let's create an exquisite architectural cipher path:
  // Using fill-rule="evenodd" for the two negative space vertical windows between the three columns!
  // Outer rectangle: (58, 64) to (198, 192). Width = 140, Height = 128.
  // Window 1: x from 96 to 118, y from 76 to 180 (Width = 22, Height = 104, rx=4)
  // Window 2: x from 138 to 160, y from 76 to 180 (Width = 22, Height = 104, rx=4)
  // Left/Right cutaways to give the columns distinct identity:
  // Left inset: from x=58 to x=76, y from 82 to 174 (cutaway)
  // Right inset: from x=180 to x=198, y from 82 to 174 (cutaway)
  
  // This produces an unmistakable, gorgeous Roman III / 111 architectural glyph:
  // Top bar: 140 wide, 14 high (with 2px serifs)
  // Bottom bar: 140 wide, 14 high
  // Three vertical pillars, 20 wide each, with 22px negative space windows.
  const pathD = `
    M 62 64 L 194 64 C 196 64 198 66 198 68 L 198 78 C 198 80 196 82 194 82 L 180 82 L 180 174 L 194 174 C 196 174 198 176 198 178 L 198 188 C 198 190 196 192 194 192 L 62 192 C 60 192 58 190 58 188 L 58 178 C 58 176 60 174 62 174 L 76 174 L 76 82 L 62 82 C 60 82 58 80 58 78 L 58 68 C 58 66 60 64 62 64 Z
    M 96 82 L 118 82 L 118 174 L 96 174 Z
    M 138 82 L 160 82 L 160 174 L 138 174 Z
  `.replace(/\s+/g, ' ').trim();

  const c = accent || color;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none" role="img" aria-labelledby="titleC">
  <title id="titleC">111iridescence — Direction C (The Atelier Cipher)</title>
  <path fill-rule="evenodd" d="${pathD}" fill="${c}"/>
</svg>`;
}

// -------------------------------------------------------------
// WORDMARKS & LOCKUPS GENERATOR
// -------------------------------------------------------------
function generateWordmarkSvg(font, textColor = '#111318', fontSize = 42, tracking = -0.5) {
  // Generate vector path for "111iridescence"
  // For maximum legibility and personality, we slightly separate "111" and "iridescence" by 4px extra gap
  const numRes = textToVectorPath(font, '111', fontSize, { tracking: tracking - 0.5, startX: 0, startY: 76 });
  const textRes = textToVectorPath(font, 'iridescence', fontSize, { tracking, startX: numRes.width + 6, startY: 76 });
  
  const totalWidth = numRes.width + 6 + textRes.width;
  const viewBoxW = Math.ceil(totalWidth + 4);
  const viewBoxH = 112;

  const fullPath = `${numRes.fullPathData} ${textRes.fullPathData}`;

  return {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxW} ${viewBoxH}" width="${viewBoxW}" height="${viewBoxH}" fill="none" role="img" aria-label="111iridescence">
  <title>111iridescence wordmark</title>
  <path d="${fullPath}" fill="${textColor}"/>
</svg>`,
    width: viewBoxW,
    height: viewBoxH,
    numPath: numRes.fullPathData,
    textPath: textRes.fullPathData,
    numWidth: numRes.width,
    totalWidth
  };
}

// Build complete lockup (Symbol + Wordmark)
function buildLockupSvg(symbolSvgContent, wordmarkObj, bgColor = null, textColor = '#111318') {
  // Height 96px
  // Symbol scaled to 64x64 at (24, 16)
  // Wordmark at (104, 24)
  const totalW = Math.ceil(104 + wordmarkObj.totalWidth + 32);
  const totalH = 96;

  // Extract paths from symbolSvgContent:
  // Match all <path ... /> inside symbol
  const pathMatches = symbolSvgContent.match(/<path[^>]+>/g) || [];
  const symbolInner = pathMatches.join('\n    ');

  const bgRect = bgColor ? `<rect width="${totalW}" height="${totalH}" fill="${bgColor}"/>` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalW} ${totalH}" width="${totalW}" height="${totalH}" fill="none" role="img" aria-label="111iridescence">
  <title>111iridescence logo</title>
  ${bgRect}
  <g transform="translate(20, 16) scale(0.25)">
    ${symbolInner}
  </g>
  <g transform="translate(96, 6)">
    <path d="${wordmarkObj.numPath}" fill="${textColor}"/>
    <path d="${wordmarkObj.textPath}" fill="${textColor}"/>
  </g>
</svg>`;
}

// Build compact square tile (for app icon / dock / avatar)
function buildCompactTile(symbolSvgContent, bgFill, strokeColor = null) {
  const pathMatches = symbolSvgContent.match(/<path[^>]+>/g) || [];
  const symbolInner = pathMatches.join('\n    ');
  const strokeAttr = strokeColor ? `stroke="${strokeColor}" stroke-width="1.5"` : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256" fill="none" role="img" aria-label="111iridescence compact">
  <title>111iridescence mark</title>
  <rect width="256" height="256" rx="58" fill="${bgFill}"/>
  ${strokeColor ? `<rect x="1" y="1" width="254" height="254" rx="57" ${strokeAttr} fill="none"/>` : ''}
  <g transform="translate(0, 0)">
    ${symbolInner}
  </g>
</svg>`;
}

// -------------------------------------------------------------
// GENERATE ALL CONCEPTS
// -------------------------------------------------------------
async function run() {
  console.log('Generating Direction A: Typographic Minimalism (Inter)...');
  const dirA = 'brand-v2/logos/concept-a';
  fs.mkdirSync(dirA, { recursive: true });

  const wordmarkA_light = generateWordmarkSvg(interFont, '#111318', 42, -0.6);
  const wordmarkA_dark = generateWordmarkSvg(interFont, '#F8FAFC', 42, -0.6);

  const symA_black = buildConceptASymbol('#111318');
  const symA_white = buildConceptASymbol('#F8FAFC');
  const symA_color = buildConceptASymbol('#111318', '#4F46E5'); // Deep Iris accent on 3rd stem

  fs.writeFileSync(`${dirA}/symbol-black.svg`, symA_black);
  fs.writeFileSync(`${dirA}/symbol-white.svg`, symA_white);
  fs.writeFileSync(`${dirA}/symbol-color.svg`, symA_color);
  fs.writeFileSync(`${dirA}/wordmark-light.svg`, wordmarkA_light.svg);
  fs.writeFileSync(`${dirA}/wordmark-dark.svg`, wordmarkA_dark.svg);
  fs.writeFileSync(`${dirA}/lockup-light.svg`, buildLockupSvg(symA_color, wordmarkA_light, null, '#111318'));
  fs.writeFileSync(`${dirA}/lockup-dark.svg`, buildLockupSvg(symA_white, wordmarkA_dark, null, '#F8FAFC'));
  fs.writeFileSync(`${dirA}/compact-light.svg`, buildCompactTile(symA_color, '#FFFFFF', '#E2E8F0'));
  fs.writeFileSync(`${dirA}/compact-dark.svg`, buildCompactTile(symA_white, '#111318', 'rgba(255,255,255,0.1)'));

  console.log('Generating Direction B: Geometric Identity (Plus Jakarta Sans)...');
  const dirB = 'brand-v2/logos/concept-b';
  fs.mkdirSync(dirB, { recursive: true });

  const wordmarkB_light = generateWordmarkSvg(jakartaFont, '#111318', 40, -0.4);
  const wordmarkB_dark = generateWordmarkSvg(jakartaFont, '#F8FAFC', 40, -0.4);

  const symB_black = buildConceptBSymbol('#111318');
  const symB_white = buildConceptBSymbol('#F8FAFC');
  const symB_color = buildConceptBSymbol('#111318', '#2563EB'); // Refractive Azure accent on center pillar

  fs.writeFileSync(`${dirB}/symbol-black.svg`, symB_black);
  fs.writeFileSync(`${dirB}/symbol-white.svg`, symB_white);
  fs.writeFileSync(`${dirB}/symbol-color.svg`, symB_color);
  fs.writeFileSync(`${dirB}/wordmark-light.svg`, wordmarkB_light.svg);
  fs.writeFileSync(`${dirB}/wordmark-dark.svg`, wordmarkB_dark.svg);
  fs.writeFileSync(`${dirB}/lockup-light.svg`, buildLockupSvg(symB_color, wordmarkB_light, null, '#111318'));
  fs.writeFileSync(`${dirB}/lockup-dark.svg`, buildLockupSvg(symB_white, wordmarkB_dark, null, '#F8FAFC'));
  fs.writeFileSync(`${dirB}/compact-light.svg`, buildCompactTile(symB_color, '#FFFFFF', '#E2E8F0'));
  fs.writeFileSync(`${dirB}/compact-dark.svg`, buildCompactTile(symB_white, '#111318', 'rgba(255,255,255,0.1)'));

  console.log('Generating Direction C: Editorial Sophistication (Newsreader)...');
  const dirC = 'brand-v2/logos/concept-c';
  fs.mkdirSync(dirC, { recursive: true });

  const wordmarkC_light = generateWordmarkSvg(newsreaderFont, '#111318', 44, 0.4);
  const wordmarkC_dark = generateWordmarkSvg(newsreaderFont, '#F8FAFC', 44, 0.4);

  const symC_black = buildConceptCSymbol('#111318');
  const symC_white = buildConceptCSymbol('#F8FAFC');
  const symC_color = buildConceptCSymbol('#111318', '#6366F1');

  fs.writeFileSync(`${dirC}/symbol-black.svg`, symC_black);
  fs.writeFileSync(`${dirC}/symbol-white.svg`, symC_white);
  fs.writeFileSync(`${dirC}/symbol-color.svg`, symC_color);
  fs.writeFileSync(`${dirC}/wordmark-light.svg`, wordmarkC_light.svg);
  fs.writeFileSync(`${dirC}/wordmark-dark.svg`, wordmarkC_dark.svg);
  fs.writeFileSync(`${dirC}/lockup-light.svg`, buildLockupSvg(symC_color, wordmarkC_light, null, '#111318'));
  fs.writeFileSync(`${dirC}/lockup-dark.svg`, buildLockupSvg(symC_white, wordmarkC_dark, null, '#F8FAFC'));
  fs.writeFileSync(`${dirC}/compact-light.svg`, buildCompactTile(symC_color, '#F8FAFC', '#E2E8F0'));
  fs.writeFileSync(`${dirC}/compact-dark.svg`, buildCompactTile(symC_white, '#161B22', 'rgba(255,255,255,0.12)'));

  console.log('Rendering preview PNGs for visual inspection...');
  const rendersDir = 'brand-v2/previews/concepts';
  fs.mkdirSync(rendersDir, { recursive: true });

  const concepts = [
    { id: 'concept-a', dir: dirA },
    { id: 'concept-b', dir: dirB },
    { id: 'concept-c', dir: dirC }
  ];

  for (const c of concepts) {
    // 512px renders
    await renderSvgToPng(`${c.dir}/symbol-black.svg`, `${rendersDir}/${c.id}-symbol-black-512.png`, 512, 512);
    await renderSvgToPng(`${c.dir}/symbol-color.svg`, `${rendersDir}/${c.id}-symbol-color-512.png`, 512, 512);
    await renderSvgToPng(`${c.dir}/symbol-white.svg`, `${rendersDir}/${c.id}-symbol-white-512.png`, 512, 512, { background: '#111318' });
    await renderSvgToPng(`${c.dir}/compact-light.svg`, `${rendersDir}/${c.id}-compact-light-512.png`, 512, 512);
    await renderSvgToPng(`${c.dir}/compact-dark.svg`, `${rendersDir}/${c.id}-compact-dark-512.png`, 512, 512, { background: '#0D1117' });
    await renderSvgToPng(`${c.dir}/lockup-light.svg`, `${rendersDir}/${c.id}-lockup-light.png`, 800, 160);
    await renderSvgToPng(`${c.dir}/lockup-dark.svg`, `${rendersDir}/${c.id}-lockup-dark.png`, 800, 160, { background: '#111318' });
    
    // Scale tests at 128, 64, 32, 16 px
    for (const sz of [128, 64, 32, 16]) {
      await renderSvgToPng(`${c.dir}/symbol-black.svg`, `${rendersDir}/${c.id}-symbol-${sz}.png`, sz, sz);
      await renderSvgToPng(`${c.dir}/compact-light.svg`, `${rendersDir}/${c.id}-compact-${sz}.png`, sz, sz);
    }
  }

  await closeBrowser();
  console.log('Successfully generated and rendered all 3 concepts!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
