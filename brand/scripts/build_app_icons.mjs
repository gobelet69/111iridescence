import fs from 'node:fs';
import path from 'node:path';
import { renderSvgToPng, buildAppleIconsetAndIcns, closeBrowser } from './render_png.mjs';

// Apple HIG Standard Squircle Path for 1024x1024 Canvas:
// Icon body: 824 x 824 pt, centered at (512, 512).
// Inset = (1024 - 824)/2 = 100 pt on all sides.
// Using exact continuous superellipse corner curvature (rx = 185px).
const SQUIRCLE_BODY = `<rect x="100" y="100" width="824" height="824" rx="185" fill="url(#bgGrad)" filter="url(#squircleShadow)"/>
<rect x="101" y="101" width="822" height="822" rx="184" stroke="url(#topRim)" stroke-width="2" fill="none"/>`;

// Common SVG defs for lighting and materials:
function getCommonDefs(accentColor, accentGradStops) {
  return `
    <!-- Ambient ground shadow -->
    <filter id="squircleShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="28" stdDeviation="24" flood-color="#000000" flood-opacity="0.14"/>
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#000000" flood-opacity="0.08"/>
    </filter>

    <!-- Internal element soft shadow -->
    <filter id="elementShadow" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.10"/>
      <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#000000" flood-opacity="0.06"/>
    </filter>

    <!-- Clean porcelain surface gradient (Apple natural daylight) -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="60%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#EDF2F7"/>
    </linearGradient>

    <!-- Subtle specular top rim highlight -->
    <linearGradient id="topRim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.9"/>
      <stop offset="20%" stop-color="#FFFFFF" stop-opacity="0.4"/>
      <stop offset="80%" stop-color="#CBD5E1" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#94A3B8" stop-opacity="0.4"/>
    </linearGradient>

    <!-- Primary Accent Gradient -->
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      ${accentGradStops}
    </linearGradient>
  `;
}

// =====================================================================
// APP 1: IRIDESCENCE PDF READER
// =====================================================================
// Metaphor: The Precision Document Folio.
// Tactile document sheet with folded corner, vertical Azure reading ruler,
// and clean typographic rhythm bars.
export function buildPdfReaderIcon() {
  const defs = getCommonDefs('#2563EB', `
    <stop offset="0%" stop-color="#3B82F6"/>
    <stop offset="100%" stop-color="#1D4ED8"/>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none" role="img" aria-label="Iridescence PDF Reader icon">
  <title>Iridescence PDF Reader</title>
  <defs>
    ${defs}
    <!-- Document Page Shadow -->
    <filter id="pageShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.10"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Base Squircle -->
  ${SQUIRCLE_BODY}

  <!-- Physical Document Sheet (White Card) -->
  <g filter="url(#pageShadow)">
    <!-- Document Page with folded corner: width 520, height 620, centered at (512, 512) -->
    <!-- Page bounds: x from 252 to 772, y from 202 to 822. Fold corner at top right: 100x100 -->
    <!-- Main page contour: (252, 232) rx=24 ... top right goes from (672, 202) to (772, 302) -->
    <path d="M 276 202 L 672 202 L 772 302 L 772 798 C 772 811 761 822 748 822 L 276 822 C 263 822 252 811 252 798 L 252 226 C 252 213 263 202 276 202 Z" fill="#FFFFFF"/>
    <!-- Page 1px border -->
    <path d="M 276 202 L 672 202 L 772 302 L 772 798 C 772 811 761 822 748 822 L 276 822 C 263 822 252 811 252 798 L 252 226 C 252 213 263 202 276 202 Z" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
    
    <!-- Folded Corner Flap -->
    <path d="M 672 202 L 672 286 C 672 295 679 302 688 302 L 772 302 Z" fill="#E2E8F0"/>
    <path d="M 672 202 L 672 286 C 672 295 679 302 688 302 L 772 302 Z" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
  </g>

  <!-- Distinctive Left Reading Guide / Folio Ribbon (Azure Blue) -->
  <!-- Vertical accent track: x from 292 to 324 (w=32), y from 260 to 764 (h=504), rx=10 -->
  <rect x="296" y="260" width="32" height="504" rx="10" fill="url(#accentGrad)"/>

  <!-- Document Hierarchy Bars (Structured Reading Metaphor) -->
  <!-- Header Bar -->
  <rect x="360" y="340" width="280" height="28" rx="8" fill="#1E293B"/>
  <!-- Subheading Bar -->
  <rect x="360" y="396" width="340" height="18" rx="6" fill="#64748B"/>
  <!-- Paragraph lines -->
  <rect x="360" y="444" width="340" height="12" rx="5" fill="#94A3B8"/>
  <rect x="360" y="474" width="310" height="12" rx="5" fill="#CBD5E1"/>
  <rect x="360" y="504" width="340" height="12" rx="5" fill="#CBD5E1"/>
  <rect x="360" y="534" width="260" height="12" rx="5" fill="#CBD5E1"/>

  <!-- Lower Section Block -->
  <rect x="360" y="600" width="220" height="20" rx="7" fill="#1E293B"/>
  <rect x="360" y="642" width="340" height="12" rx="5" fill="#94A3B8"/>
  <rect x="360" y="672" width="320" height="12" rx="5" fill="#CBD5E1"/>
  <rect x="360" y="702" width="280" height="12" rx="5" fill="#CBD5E1"/>
</svg>`;
}

// =====================================================================
// APP 2: MASS PRINT
// =====================================================================
// Metaphor: The Precision Batch Document Stack & Output Platen.
// Stepped cascading sheets of paper feeding through a warm Terracotta print guide.
export function buildMassPrintIcon() {
  const defs = getCommonDefs('#EA580C', `
    <stop offset="0%" stop-color="#F97316"/>
    <stop offset="100%" stop-color="#C2410C"/>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none" role="img" aria-label="Mass Print icon">
  <title>Mass Print</title>
  <defs>
    ${defs}
    <!-- Document Stack Shadows -->
    <filter id="stackShadow1" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
    <filter id="stackShadow2" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#000000" flood-opacity="0.10"/>
    </filter>
  </defs>

  <!-- Base Squircle -->
  ${SQUIRCLE_BODY}

  <!-- Sheet 3 (Backmost sheet in batch stack) -->
  <g filter="url(#stackShadow1)">
    <rect x="332" y="210" width="360" height="460" rx="18" fill="#E2E8F0"/>
    <rect x="332" y="210" width="360" height="460" rx="18" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
  </g>

  <!-- Sheet 2 (Middle sheet in batch stack, offset) -->
  <g filter="url(#stackShadow2)">
    <rect x="302" y="250" width="420" height="470" rx="18" fill="#F1F5F9"/>
    <rect x="302" y="250" width="420" height="470" rx="18" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
  </g>

  <!-- Sheet 1 (Front hero document feeding out) -->
  <g filter="url(#stackShadow1)">
    <rect x="272" y="290" width="480" height="480" rx="18" fill="#FFFFFF"/>
    <rect x="272" y="290" width="480" height="480" rx="18" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
    
    <!-- Document Content Preview Lines -->
    <rect x="328" y="350" width="220" height="24" rx="7" fill="#1E293B"/>
    <rect x="328" y="398" width="368" height="12" rx="5" fill="#94A3B8"/>
    <rect x="328" y="426" width="340" height="12" rx="5" fill="#CBD5E1"/>
    <rect x="328" y="454" width="368" height="12" rx="5" fill="#CBD5E1"/>
    <rect x="328" y="482" width="280" height="12" rx="5" fill="#CBD5E1"/>

    <!-- Document Thumbnail Box -->
    <rect x="328" y="524" width="160" height="100" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
    <rect x="512" y="534" width="184" height="12" rx="5" fill="#CBD5E1"/>
    <rect x="512" y="560" width="160" height="12" rx="5" fill="#CBD5E1"/>
    <rect x="512" y="586" width="184" height="12" rx="5" fill="#CBD5E1"/>
  </g>

  <!-- Precision Mechanical Print Platen / Alignment Bar (Warm Terracotta/Amber) -->
  <!-- Positioned across the bottom of the feed path (x from 212 to 812, width 600, height 76, y 696 to 772) -->
  <g filter="url(#elementShadow)">
    <rect x="222" y="700" width="580" height="76" rx="20" fill="url(#accentGrad)"/>
    <!-- Specular highlight on platen -->
    <rect x="223" y="701" width="578" height="36" rx="19" fill="#FFFFFF" opacity="0.2"/>
    
    <!-- Mechanical Feed Emitter Slot -->
    <rect x="262" y="730" width="500" height="14" rx="7" fill="#7C2D12"/>
    <!-- Center Registration Guide Pip -->
    <circle cx="512" cy="737" r="4" fill="#FFFFFF"/>
  </g>
</svg>`;
}

// =====================================================================
// APP 3: RESOURCE GUARD
// =====================================================================
// Metaphor: The Precision Telemetry Instrument & Pulse Dial.
// Architectural dial with calibrated ticks, dynamic emerald telemetry gauge,
// and clean system pulse sweep.
export function buildResourceGuardIcon() {
  const defs = getCommonDefs('#059669', `
    <stop offset="0%" stop-color="#10B981"/>
    <stop offset="100%" stop-color="#047857"/>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none" role="img" aria-label="Resource Guard icon">
  <title>Resource Guard</title>
  <defs>
    ${defs}
    <!-- Dial Shadow -->
    <filter id="dialShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="18" flood-color="#000000" flood-opacity="0.10"/>
    </filter>
  </defs>

  <!-- Base Squircle -->
  ${SQUIRCLE_BODY}

  <!-- Architectural Instrument Outer Bezel: Center (512, 512), radius 290 -->
  <g filter="url(#dialShadow)">
    <circle cx="512" cy="512" r="290" fill="#FFFFFF"/>
    <circle cx="512" cy="512" r="289" stroke="#E2E8F0" stroke-width="2" fill="none"/>
    <circle cx="512" cy="512" r="268" fill="#F8FAFC"/>
    <circle cx="512" cy="512" r="267" stroke="#E2E8F0" stroke-width="1.5" fill="none"/>
  </g>

  <!-- Dial Tick Marks (0° to 360° calibrated instrument) -->
  <g stroke="#94A3B8" stroke-width="3" stroke-linecap="round">
    <!-- 12 major cardinal & sub-cardinal ticks -->
    <line x1="512" y1="264" x2="512" y2="280"/>
    <line x1="512" y1="744" x2="512" y2="760"/>
    <line x1="264" y1="512" x2="280" y2="512"/>
    <line x1="744" y1="512" x2="760" y2="512"/>
    <line x1="337" y1="337" x2="349" y2="349"/>
    <line x1="687" y1="337" x2="675" y2="349"/>
    <line x1="337" y1="687" x2="349" y2="675"/>
    <line x1="687" y1="687" x2="675" y2="675"/>
  </g>

  <!-- Telemetry Active Arc (Emerald Green, sweeping from 225° to 45°, 270° arc) -->
  <!-- Center (512, 512), radius = 220, stroke-width = 28 -->
  <!-- Arc start: 135° (bottom left: 512 - 220*0.707, 512 + 220*0.707) = (356, 668) -->
  <!-- Sweeping up over top (512, 292) to 45° (bottom right: 668, 668) -->
  <path d="M 356 668 A 220 220 0 1 1 668 668" stroke="#E2E8F0" stroke-width="26" stroke-linecap="round" fill="none"/>
  <!-- Active Arc Segment (sweeping from 135° through 0° to 15°, representing ~68% system load) -->
  <path d="M 356 668 A 220 220 0 1 1 724 455" stroke="url(#accentGrad)" stroke-width="26" stroke-linecap="round" fill="none"/>

  <!-- Active Telemetry Pulse Sweep in Center -->
  <!-- Center Instrument Screen: Circle r=140 -->
  <circle cx="512" cy="512" r="144" fill="#111827"/>
  <circle cx="512" cy="512" r="143" stroke="#1F2937" stroke-width="2" fill="none"/>

  <!-- Live Pulse Waveform (Razor-sharp telemetry signal) -->
  <path d="
    M 388 512
    L 440 512
    L 456 462
    L 480 572
    L 508 432
    L 532 582
    L 556 482
    L 576 522
    L 592 512
    L 636 512
  " stroke="#34D399" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/>

  <!-- Indicator Status Pip -->
  <circle cx="512" cy="626" r="6" fill="#10B981"/>
</svg>`;
}

// =====================================================================
// APP 4: QUICKPAD
// =====================================================================
// Metaphor: The Fast Drafting Folio & Precision Caret.
// Tactile notebook/editor with stitched binding, drafting lines,
// and active Amethyst Violet cursor caret.
export function buildQuickPadIcon() {
  const defs = getCommonDefs('#7C3AED', `
    <stop offset="0%" stop-color="#8B5CF6"/>
    <stop offset="100%" stop-color="#6D28D9"/>
  `);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" fill="none" role="img" aria-label="QuickPad icon">
  <title>QuickPad</title>
  <defs>
    ${defs}
    <filter id="padShadow" x="-10%" y="-10%" width="120%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.10"/>
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.06"/>
    </filter>
  </defs>

  <!-- Base Squircle -->
  ${SQUIRCLE_BODY}

  <!-- Drafting Folio Pad (Ivory White Card): width 520, height 620 -->
  <g filter="url(#padShadow)">
    <rect x="252" y="202" width="520" height="620" rx="22" fill="#FFFFFF"/>
    <rect x="252" y="202" width="520" height="620" rx="22" stroke="rgba(0,0,0,0.06)" stroke-width="2" fill="none"/>
    
    <!-- Left Stitched Binding Strip (Slate) -->
    <path d="M 252 224 C 252 212 262 202 274 202 L 316 202 L 316 822 L 274 822 C 262 822 252 812 252 800 Z" fill="#F1F5F9"/>
    <line x1="316" y1="202" x2="316" y2="822" stroke="#E2E8F0" stroke-width="2"/>
    
    <!-- Binding Stitching Holes -->
    <circle cx="284" cy="270" r="5" fill="#CBD5E1"/>
    <circle cx="284" cy="390" r="5" fill="#CBD5E1"/>
    <circle cx="284" cy="510" r="5" fill="#CBD5E1"/>
    <circle cx="284" cy="630" r="5" fill="#CBD5E1"/>
    <circle cx="284" cy="750" r="5" fill="#CBD5E1"/>
  </g>

  <!-- Active Text Caret / Insertion Cursor (Amethyst Violet) -->
  <!-- Vertical flashing caret: x=362, y from 276 to 336 (h=60), w=8, rx=4 -->
  <g filter="url(#elementShadow)">
    <rect x="360" y="280" width="8" height="60" rx="4" fill="url(#accentGrad)"/>
    <!-- Top and bottom horizontal caret serifs -->
    <rect x="350" y="276" width="28" height="6" rx="3" fill="url(#accentGrad)"/>
    <rect x="350" y="336" width="28" height="6" rx="3" fill="url(#accentGrad)"/>
  </g>

  <!-- Markdown / Code Header Token -->
  <!-- Tag '# Title' indicated by minimal geometric pill -->
  <rect x="390" y="292" width="240" height="36" rx="8" fill="#1E293B"/>

  <!-- Drafting Content Lines -->
  <rect x="360" y="380" width="350" height="14" rx="5" fill="#64748B"/>
  <rect x="360" y="412" width="320" height="14" rx="5" fill="#94A3B8"/>
  <rect x="360" y="444" width="350" height="14" rx="5" fill="#CBD5E1"/>
  <rect x="360" y="476" width="260" height="14" rx="5" fill="#CBD5E1"/>

  <!-- Code Block Inset (Markdown code block preview) -->
  <rect x="360" y="528" width="350" height="130" rx="12" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>
  <rect x="384" y="556" width="160" height="12" rx="5" fill="#7C3AED" opacity="0.8"/>
  <rect x="384" y="584" width="280" height="12" rx="5" fill="#94A3B8"/>
  <rect x="384" y="612" width="220" height="12" rx="5" fill="#CBD5E1"/>

  <!-- Trailing Prose Lines -->
  <rect x="360" y="694" width="350" height="14" rx="5" fill="#94A3B8"/>
  <rect x="360" y="726" width="290" height="14" rx="5" fill="#CBD5E1"/>
</svg>`;
}

async function run() {
  console.log('Generating Application Icon Family...');
  const apps = [
    { id: 'pdf-reader', name: 'Iridescence PDF Reader', gen: buildPdfReaderIcon },
    { id: 'mass-print', name: 'Mass Print', gen: buildMassPrintIcon },
    { id: 'resource-guard', name: 'Resource Guard', gen: buildResourceGuardIcon },
    { id: 'quickpad', name: 'QuickPad', gen: buildQuickPadIcon }
  ];

  const appIconsBase = 'brand-v2/app-icons';
  const previewsDir = 'brand-v2/previews/app-icons';
  fs.mkdirSync(previewsDir, { recursive: true });

  for (const app of apps) {
    const appDir = path.join(appIconsBase, app.id);
    fs.mkdirSync(appDir, { recursive: true });

    const svgContent = app.gen();
    const svgPath = path.join(appDir, 'icon.svg');
    fs.writeFileSync(svgPath, svgContent);
    console.log(`Saved master SVG: ${svgPath}`);

    // Render preview PNGs at 1024, 512, 256, 128, 64, 32, 16
    for (const size of [1024, 512, 256, 128, 64, 32, 16]) {
      const pngPath = path.join(previewsDir, `${app.id}-${size}.png`);
      await renderSvgToPng(svgPath, pngPath, size, size);
    }

    // Build Apple .iconset and compile .icns!
    await buildAppleIconsetAndIcns(svgPath, appDir, 'AppIcon');
  }

  await closeBrowser();
  console.log('Successfully generated complete Application Icon Family with ICNS!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
