export type GlyphCell = {
  column: number;
  row: number;
};

export type ComposedGlyphCell = GlyphCell & {
  characterIndex: number;
};

export function composeGlyphLine(
  line: string,
  glyphMasks: ReadonlyMap<string, readonly GlyphCell[]>,
  layout: { startColumn: number; topRow: number; advanceColumns: number },
): ComposedGlyphCell[] {
  const pixels: ComposedGlyphCell[] = [];
  for (const [characterIndex, character] of [...line].entries()) {
    const mask = glyphMasks.get(character) ?? [];
    for (const pixel of mask) {
      pixels.push({
        column: layout.startColumn + characterIndex * layout.advanceColumns + pixel.column,
        row: layout.topRow + pixel.row,
        characterIndex,
      });
    }
  }
  return pixels;
}

export type Particle = {
  x: number;
  y: number;
  x0: number;
  y0: number;
  vx: number;
  vy: number;
  column: number;
  row: number;
  line: number;
  alpha: number;
};

export type AmbientPixel = {
  x: number;
  y: number;
  color: string;
  phase: number;
  tempo: number;
};

// Handcrafted Swiss Matrix Glyph Masks (13 rows tall: rows 0 to 12, baseline at row 12)
// Pure geometric pixel grid design: zero slab serifs, zero typewriter feet, proportional rhythm.
export const SWISS_GLYPHS: Record<string, readonly [number, number][]> = {
  '1': [
    // 4 cols wide. Sharp 45° angled beak, clean 2-dot vertical stem, flat baseline terminal
    [1, 1], [0, 2], [1, 2],
    [2, 0], [3, 0],
    [2, 1], [3, 1],
    [2, 2], [3, 2],
    [2, 3], [3, 3],
    [2, 4], [3, 4],
    [2, 5], [3, 5],
    [2, 6], [3, 6],
    [2, 7], [3, 7],
    [2, 8], [3, 8],
    [2, 9], [3, 9],
    [2, 10], [3, 10],
    [2, 11], [3, 11],
    [2, 12], [3, 12],
  ],
  'i': [
    // 2 cols wide. 2x2 tittle, 2-row optical gap, clean 2-dot stem to baseline (NO foot, NO top serif)
    [0, 0], [1, 0],
    [0, 1], [1, 1],
    [0, 4], [1, 4],
    [0, 5], [1, 5],
    [0, 6], [1, 6],
    [0, 7], [1, 7],
    [0, 8], [1, 8],
    [0, 9], [1, 9],
    [0, 10], [1, 10],
    [0, 11], [1, 11],
    [0, 12], [1, 12],
  ],
  'r': [
    // 6 cols wide. Clean 2-dot stem (rows 4..12) + graceful geometric shoulder arch (cols 2..5)
    [0, 4], [1, 4],
    [0, 5], [1, 5],
    [0, 6], [1, 6],
    [0, 7], [1, 7],
    [0, 8], [1, 8],
    [0, 9], [1, 9],
    [0, 10], [1, 10],
    [0, 11], [1, 11],
    [0, 12], [1, 12],
    [2, 5], [3, 4], [4, 4], [5, 4], [5, 5],
  ],
  'd': [
    // 6 cols wide. Tall 2-dot ascender (cols 4-5, rows 0..12) + circular grotesque bowl (cols 0..3)
    [4, 0], [5, 0],
    [4, 1], [5, 1],
    [4, 2], [5, 2],
    [4, 3], [5, 3],
    [4, 4], [5, 4],
    [4, 5], [5, 5],
    [4, 6], [5, 6],
    [4, 7], [5, 7],
    [4, 8], [5, 8],
    [4, 9], [5, 9],
    [4, 10], [5, 10],
    [4, 11], [5, 11],
    [4, 12], [5, 12],
    [0, 6], [1, 6],
    [0, 7], [1, 7],
    [0, 8], [1, 8],
    [0, 9], [1, 9],
    [0, 10], [1, 10],
    [1, 5], [2, 4], [3, 4],
    [1, 11], [2, 12], [3, 12],
  ],
  'e': [
    // 6 cols wide. Grotesque lowercase e with closed upper eye and open lower aperture
    [0, 6], [1, 6],
    [0, 7], [1, 7],
    [0, 8], [1, 8],
    [0, 9], [1, 9],
    [0, 10], [1, 10],
    [1, 5], [2, 4], [3, 4], [4, 4], [5, 5],
    [1, 7], [2, 7], [3, 7], [4, 7], [5, 7],
    [5, 6],
    [1, 11], [2, 12], [3, 12], [4, 12], [5, 11],
  ],
  's': [
    // 6 cols wide. Balanced geometric S-curve with fluid diagonal spine and horizontal hooks
    [1, 5], [2, 4], [3, 4], [4, 4], [5, 5],
    [0, 6], [1, 6],
    [1, 7], [2, 7], [3, 8], [4, 8],
    [4, 9], [5, 9], [5, 10],
    [4, 11], [3, 12], [2, 12], [1, 12], [0, 11],
  ],
  'c': [
    // 6 cols wide. Clean circular grotesque C with generous open aperture
    [1, 5], [2, 4], [3, 4], [4, 4], [5, 5],
    [0, 6], [1, 6],
    [0, 7], [1, 7],
    [0, 8], [1, 8],
    [0, 9], [1, 9],
    [0, 10], [1, 10],
    [1, 11], [2, 12], [3, 12], [4, 12], [5, 11],
  ],
  'n': [
    // 6 cols wide. Dual 2-dot vertical stems with graceful connecting shoulder arch
    [0, 4], [1, 4],
    [0, 5], [1, 5],
    [0, 6], [1, 6],
    [0, 7], [1, 7],
    [0, 8], [1, 8],
    [0, 9], [1, 9],
    [0, 10], [1, 10],
    [0, 11], [1, 11],
    [0, 12], [1, 12],
    [2, 5], [3, 4], [4, 4],
    [4, 5], [5, 5],
    [4, 6], [5, 6],
    [4, 7], [5, 7],
    [4, 8], [5, 8],
    [4, 9], [5, 9],
    [4, 10], [5, 10],
    [4, 11], [5, 11],
    [4, 12], [5, 12],
  ],
  '.': [
    // 2x2 square dot resting solidly on the baseline
    [0, 11], [1, 11],
    [0, 12], [1, 12],
  ],
};

const GLYPH_WIDTHS: Record<string, number> = {
  '1': 4,
  'i': 2,
  'r': 6,
  'd': 6,
  'e': 6,
  's': 6,
  'c': 6,
  'n': 6,
  '.': 2,
};

function getKerning(char: string, nextChar: string | undefined): number {
  if (!nextChar) return 0;
  // Tight cadence between the 111 numerals
  if (char === '1' && nextChar === '1') return 2;
  // Architectural pause separating the numeric mark and studio name
  if (char === '1' && nextChar === 'i') return 4;
  // Optical tuck under the r shoulder arch
  if (char === 'r' && nextChar === 'i') return 1;
  // Standard dot kerning
  if (char === 'e' && nextChar === '.') return 2;
  return 2;
}

const hashPixel = (column: number, row: number) => (
  Math.imul(column + 17, 73_856_093) ^ Math.imul(row + 31, 19_349_663)
) >>> 0;

// Refined atelier spectral palette: Amethyst Violet -> Iris -> Cobalt -> Cyan -> Emerald -> Solar Peach
// Mapped to 111iridescence design tokens (no garish neon, pure optical depth)
const PALETTE_STOPS = [
  { r: 168, g: 85, b: 247 }, // Violet (#A855F7)
  { r: 79, g: 70, b: 229 },  // Iris (#4F46E5)
  { r: 56, g: 128, b: 220 }, // Blue (#3880DC)
  { r: 6, g: 182, b: 212 },  // Cyan (#06B6D4)
  { r: 52, g: 211, b: 153 }, // Presence Emerald (#34D399)
  { r: 238, g: 118, b: 106 },// Coral / Peach (#EE766A)
  { r: 192, g: 38, b: 211 }, // Orchid (#C026D3)
];

function getIridescentColor(
  phase: number,
  inkR: number,
  inkG: number,
  inkB: number,
  depthFactor = 0.45,
  flare = 0,
  alpha = 1,
): string {
  const norm = ((phase % 1) + 1) % 1;
  const scaled = norm * PALETTE_STOPS.length;
  const i0 = Math.floor(scaled);
  const i1 = (i0 + 1) % PALETTE_STOPS.length;
  const frac = scaled - i0;

  let r = PALETTE_STOPS[i0].r + (PALETTE_STOPS[i1].r - PALETTE_STOPS[i0].r) * frac;
  let g = PALETTE_STOPS[i0].g + (PALETTE_STOPS[i1].g - PALETTE_STOPS[i0].g) * frac;
  let b = PALETTE_STOPS[i0].b + (PALETTE_STOPS[i1].b - PALETTE_STOPS[i0].b) * frac;

  if (flare > 0) {
    const f = Math.min(1, flare);
    r = r * (1 - f) + 255 * f;
    g = g * (1 - f) + 255 * f;
    b = b * (1 - f) + 255 * f;
  } else {
    // Optical grounding blend with deep obsidian ink
    r = r * (1 - depthFactor) + inkR * depthFactor;
    g = g * (1 - depthFactor) + inkG * depthFactor;
    b = b * (1 - depthFactor) + inkB * depthFactor;
  }

  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.max(0, Math.min(1, alpha))})`;
}

export async function mountPixelTitle(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pixel-canvas]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return () => {};

  const titleCanvas = canvas;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');

  // Matrix background layer cached offscreen
  const matrixLayer = document.createElement('canvas');
  const matrixContext = matrixLayer.getContext('2d');
  if (!matrixContext) return () => {};

  let width = 1;
  let height = 1;
  let gap = 10;
  let matrixPixelSize = 2;
  let dotSize = 6.2;
  let particles: Particle[] = [];
  let ambientPixels: AmbientPixel[] = [];

  // Interaction & physics state
  let pointerX = -10_000;
  let pointerY = -10_000;
  let pointerPrevX = -10_000;
  let pointerPrevY = -10_000;
  let pointerVelX = 0;
  let pointerVelY = 0;
  let pointerActive = false;
  let interactionMix = 0;
  let lastInteractionTime = 0;

  // Click ripple impulse state
  let rippleX = -10_000;
  let rippleY = -10_000;
  let rippleTime = 0;

  let resizeFrame = 0;
  let animationFrame = 0;
  let previousFrameTime = 0;
  let heroVisible = true;

  // CSS variables extraction
  const palette = getComputedStyle(root);
  const inkHex = palette.getPropertyValue('--ink').trim() || '#16101D';
  const blueHex = palette.getPropertyValue('--blue').trim() || '#3880DC';

  let inkR = 22, inkG = 16, inkB = 29;
  if (inkHex.startsWith('#') && inkHex.length === 7) {
    inkR = parseInt(inkHex.slice(1, 3), 16);
    inkG = parseInt(inkHex.slice(3, 5), 16);
    inkB = parseInt(inkHex.slice(5, 7), 16);
  }

  const paintMatrix = () => {
    matrixLayer.width = width;
    matrixLayer.height = height;
    matrixContext.clearRect(0, 0, width, height);
    matrixPixelSize = Math.max(1.25, gap * 0.22);

    const nextAmbientPixels: AmbientPixel[] = [];

    // Dense instrument matrix covering all 4 corners
    for (let y = gap / 2; y < height; y += gap) {
      for (let x = gap / 2; x < width; x += gap) {
        const column = Math.floor(x / gap);
        const row = Math.floor(y / gap);
        const seed = hashPixel(column, row);
        const accent = seed % 31 === 0;

        matrixContext.globalAlpha = accent ? 0.16 : 0.085;
        matrixContext.fillStyle = accent ? blueHex : inkHex;
        matrixContext.fillRect(
          Math.round(x - matrixPixelSize / 2),
          Math.round(y - matrixPixelSize / 2),
          matrixPixelSize,
          matrixPixelSize,
        );

        if (seed % 349 === 0) {
          nextAmbientPixels.push({
            x,
            y,
            color: accent ? blueHex : inkHex,
            phase: ((seed >>> 5) % 1024) / 1024 * Math.PI * 2,
            tempo: 0.00045 + ((seed >>> 18) % 11) * 0.000035,
          });
        }
      }
    }
    matrixContext.globalAlpha = 1;
    ambientPixels = nextAmbientPixels;
  };

  const drawAmbientSignal = (time: number) => {
    for (const pixel of ambientPixels) {
      const wave = (Math.sin(time * pixel.tempo + pixel.phase) + 1) / 2;
      const breath = wave ** 4;
      if (breath < 0.02) continue;
      const size = matrixPixelSize * (1.1 + breath * 0.9);
      context.globalAlpha = 0.05 + breath * 0.55;
      context.fillStyle = pixel.color;
      context.fillRect(
        Math.round(pixel.x - size / 2),
        Math.round(pixel.y - size / 2),
        size,
        size,
      );
    }
    context.globalAlpha = 1;
  };

  const render = (time = performance.now()) => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);

    // 1. Draw precision instrument matrix layer
    context.drawImage(matrixLayer, 0, 0, width, height);

    // Reduced motion: deterministic master lockup
    if (motionPreference.matches) {
      for (const p of particles) {
        const staticPhase = (p.x0 / width) * 1.1 + (p.row / 13) * 0.15 + 0.1;
        context.fillStyle = getIridescentColor(staticPhase, inkR, inkG, inkB, 0.45, 0, p.alpha);
        context.beginPath();
        context.roundRect(
          Math.round(p.x0 - dotSize / 2),
          Math.round(p.y0 - dotSize / 2),
          dotSize,
          dotSize,
          1.2,
        );
        context.fill();
      }
      return;
    }

    // 2. Draw subtle living ambient signal
    drawAmbientSignal(time);

    // Interactive & living animation parameters
    const radius = Math.max(120, Math.min(200, width * 0.15));
    const isInteracting = interactionMix > 0.001 || pointerActive;
    const idleTidePhase = time * 0.00022;
    const rippleElapsed = time - rippleTime;
    const rippleRadius = rippleElapsed > 0 && rippleElapsed < 1200 ? rippleElapsed * 0.75 : -1;

    // Dynamic grid excitation near pointer
    if (isInteracting && pointerActive) {
      const gridRadius = radius * 0.85;
      const startCol = Math.max(0, Math.floor((pointerX - gridRadius) / gap));
      const endCol = Math.min(Math.floor(width / gap), Math.ceil((pointerX + gridRadius) / gap));
      const startRow = Math.max(0, Math.floor((pointerY - gridRadius) / gap));
      const endRow = Math.min(Math.floor(height / gap), Math.ceil((pointerY + gridRadius) / gap));

      for (let r = startRow; r <= endRow; r += 1) {
        for (let c = startCol; c <= endCol; c += 1) {
          const gx = c * gap + gap / 2;
          const gy = r * gap + gap / 2;
          const gdist = Math.hypot(gx - pointerX, gy - pointerY);
          if (gdist < gridRadius) {
            const glow = (1 - gdist / gridRadius) ** 2 * interactionMix;
            context.fillStyle = `rgba(56, 128, 220, ${glow * 0.24})`;
            const sz = matrixPixelSize * (1 + glow * 1.4);
            context.fillRect(
              Math.round(gx - sz / 2),
              Math.round(gy - sz / 2),
              sz,
              sz,
            );
          }
        }
      }
    }

    for (let i = 0; i < particles.length; i += 1) {
      const p = particles[i];

      // Physical spring restoring force: Hooke's law on pixel grid
      const dx0 = p.x0 - p.x;
      const dy0 = p.y0 - p.y;
      const springK = 0.12;
      const damping = 0.82;

      p.vx = (p.vx + dx0 * springK) * damping;
      p.vy = (p.vy + dy0 * springK) * damping;

      let specFlare = 0;
      let chromaticShift = 0;

      // Pointer optical refraction & fluid magnetic impulse
      if (isInteracting) {
        const pdx = p.x - pointerX;
        const pdy = p.y - pointerY;
        const dist = Math.hypot(pdx, pdy);

        if (dist < radius && radius > 0) {
          const proximity = 1 - dist / radius;
          const force = (proximity ** 1.8) * 8 * interactionMix; // controlled displacement max ~8px

          // Radial repulsion
          const angle = Math.atan2(pdy, pdx);

          // Tangential hydrodynamic swirl from pointer velocity
          const swirlFactor = proximity * 0.22;
          p.vx += (Math.cos(angle) * force * 0.20) + (pointerVelX * swirlFactor);
          p.vy += (Math.sin(angle) * force * 0.20) + (pointerVelY * swirlFactor);

          // Specular caustic flare & spectral refraction
          specFlare = proximity * interactionMix;
          chromaticShift = proximity * 0.35;

          // Stationary hover organic harmonic breathing
          const seed = hashPixel(p.column, p.row);
          const eddy = Math.sin(time * 0.0035 + seed) * proximity * 1.4 * interactionMix;
          p.vx += Math.cos(angle + 1.57) * eddy * 0.08;
          p.vy += Math.sin(angle + 1.57) * eddy * 0.08;
        }
      }

      // Click ripple wave deflection
      if (rippleRadius > 0) {
        const rdx = p.x - rippleX;
        const rdy = p.y - rippleY;
        const rDist = Math.hypot(rdx, rdy);
        const waveDist = Math.abs(rDist - rippleRadius);
        if (waveDist < 50) {
          const waveImpulse = (1 - waveDist / 50) * Math.max(0, 1 - rippleElapsed / 1200);
          const rAngle = Math.atan2(rdy, rdx);
          p.vx += Math.cos(rAngle) * waveImpulse * 2.5;
          p.vy += Math.sin(rAngle) * waveImpulse * 2.5;
          chromaticShift += waveImpulse * 0.40;
          specFlare = Math.max(specFlare, waveImpulse * 0.55);
        }
      }

      // Euler integration
      p.x += p.vx;
      p.y += p.vy;

      // Chromatic phase across coordinates + living tide
      const phase = (p.x0 / width) * 1.1 + idleTidePhase + chromaticShift;
      const kineticEnergy = Math.hypot(p.vx, p.vy);
      const renderSize = dotSize * (1 + specFlare * 0.22 + Math.min(0.15, kineticEnergy * 0.02));

      const color = getIridescentColor(phase, inkR, inkG, inkB, 0.45, specFlare * 0.35, p.alpha);

      context.fillStyle = color;
      context.beginPath();
      context.roundRect(
        Math.round(p.x - renderSize / 2),
        Math.round(p.y - renderSize / 2),
        renderSize,
        renderSize,
        1.2,
      );
      context.fill();

      // Pure specular highlight core for high-energy caustics near pointer
      if (specFlare > 0.45) {
        context.fillStyle = `rgba(255, 255, 255, ${(specFlare - 0.4) * 1.3})`;
        context.beginPath();
        context.arc(Math.round(p.x), Math.round(p.y), renderSize * 0.30, 0, Math.PI * 2);
        context.fill();
      }
    }
  };

  const startAnimation = () => {
    if (animationFrame || !heroVisible || motionPreference.matches) return;
    animationFrame = requestAnimationFrame(animate);
  };

  function animate(time: number) {
    animationFrame = 0;
    const elapsed = previousFrameTime ? Math.min(48, time - previousFrameTime) : 16;
    previousFrameTime = time;

    // Decay pointer velocity smoothly
    pointerVelX *= 0.85;
    pointerVelY *= 0.85;

    // Smooth interaction mixing with ease
    const targetMix = pointerActive ? 1 : 0;
    const mixEase = 1 - Math.exp(-elapsed / 120);
    interactionMix += (targetMix - interactionMix) * mixEase;

    // Calculate total kinetic energy
    let totalKineticEnergy = 0;
    for (let i = 0; i < particles.length; i += 1) {
      totalKineticEnergy += Math.abs(particles[i].vx) + Math.abs(particles[i].vy);
      if (totalKineticEnergy > 0.5) break;
    }

    render(time);

    // Keep loop active while interacting, settling, ripple or idle living wave
    if (
      pointerActive ||
      interactionMix > 0.002 ||
      totalKineticEnergy > 0.05 ||
      (time - lastInteractionTime < 1800) ||
      (time - rippleTime < 1200)
    ) {
      startAnimation();
    } else {
      // Idle living wave: keep slow ambient animation ticking at 30-60 FPS
      startAnimation();
    }
  }

  const buildMatrix = () => {
    const bounds = root.getBoundingClientRect();
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    const ratio = Math.min(devicePixelRatio || 1, 2);

    titleCanvas.width = Math.round(width * ratio);
    titleCanvas.height = Math.round(height * ratio);

    const isMobile = width < 600;
    gap = isMobile ? Math.max(4.5, Math.round(width * 0.0125)) : Math.min(11, Math.max(7, Math.round(width * 0.0072)));
    dotSize = Math.max(3.2, gap * 0.62);

    paintMatrix();

    const nextParticles: Particle[] = [];

    if (isMobile) {
      // Mobile: 2 balanced stacked lines
      // Line 1: "111"
      const l1Words = '111';
      let l1Cols = 0;
      const l1Items: { ch: string; col: number; w: number }[] = [];
      for (let i = 0; i < l1Words.length; i += 1) {
        const ch = l1Words[i];
        const w = GLYPH_WIDTHS[ch] ?? 6;
        l1Items.push({ ch, col: l1Cols, w });
        l1Cols += w + (i < l1Words.length - 1 ? 2 : 0);
      }
      const l1StartX = Math.round((width - l1Cols * gap) / 2);

      // Line 2: "iridescence."
      const l2Words = 'iridescence.';
      let l2Cols = 0;
      const l2Items: { ch: string; col: number; w: number }[] = [];
      for (let i = 0; i < l2Words.length; i += 1) {
        const ch = l2Words[i];
        const w = GLYPH_WIDTHS[ch] ?? 6;
        l2Items.push({ ch, col: l2Cols, w });
        l2Cols += w + getKerning(ch, l2Words[i + 1]);
      }
      const l2StartX = Math.round((width - l2Cols * gap) / 2);

      const centerY = Math.round(height * 0.48);
      const lineSpacing = 16 * gap;
      const l1StartY = Math.round(centerY - lineSpacing * 0.55);
      const l2StartY = Math.round(centerY + lineSpacing * 0.45);

      // Line 1 particles
      for (const item of l1Items) {
        const mask = SWISS_GLYPHS[item.ch] ?? [];
        for (const [col, row] of mask) {
          const x = l1StartX + (item.col + col) * gap;
          const y = l1StartY + row * gap;
          nextParticles.push({
            x0: x,
            y0: y,
            x,
            y,
            vx: 0,
            vy: 0,
            column: item.col + col,
            row,
            line: 0,
            alpha: 1,
          });
        }
      }

      // Line 2 particles
      for (const item of l2Items) {
        const mask = SWISS_GLYPHS[item.ch] ?? [];
        for (const [col, row] of mask) {
          const x = l2StartX + (item.col + col) * gap;
          const y = l2StartY + row * gap;
          nextParticles.push({
            x0: x,
            y0: y,
            x,
            y,
            vx: 0,
            vy: 0,
            column: item.col + col,
            row: row + 16,
            line: 1,
            alpha: 1,
          });
        }
      }
    } else {
      // Desktop & Tablet: Single unified lockup ("111iridescence.")
      const word = '111iridescence.';
      let totalCols = 0;
      const items: { ch: string; col: number; w: number }[] = [];

      for (let i = 0; i < word.length; i += 1) {
        const ch = word[i];
        const w = GLYPH_WIDTHS[ch] ?? 6;
        items.push({ ch, col: totalCols, w });
        totalCols += w + getKerning(ch, word[i + 1]);
      }

      const startX = Math.round((width - totalCols * gap) / 2);
      const startY = Math.round((height - 13 * gap) / 2);

      for (const item of items) {
        const mask = SWISS_GLYPHS[item.ch] ?? [];
        for (const [col, row] of mask) {
          const x = startX + (item.col + col) * gap;
          const y = startY + row * gap;
          nextParticles.push({
            x0: x,
            y0: y,
            x,
            y,
            vx: 0,
            vy: 0,
            column: item.col + col,
            row,
            line: 0,
            alpha: 1,
          });
        }
      }
    }

    particles = nextParticles;
    titleCanvas.setAttribute('data-render-state', 'ready');
    root.setAttribute('data-pixel-ready', '');
    render(motionPreference.matches ? 0 : performance.now());
  };

  const scheduleBuildMatrix = () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(buildMatrix);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (motionPreference.matches) return;
    const rect = titleCanvas.getBoundingClientRect();
    const nextX = event.clientX - rect.left;
    const nextY = event.clientY - rect.top;

    if (pointerPrevX > -5000) {
      pointerVelX = (nextX - pointerPrevX) * 0.45;
      pointerVelY = (nextY - pointerPrevY) * 0.45;
    }
    pointerPrevX = nextX;
    pointerPrevY = nextY;
    pointerX = nextX;
    pointerY = nextY;
    pointerActive = true;
    lastInteractionTime = performance.now();
    startAnimation();
  };

  const handlePointerLeave = () => {
    pointerActive = false;
    pointerPrevX = -10_000;
    pointerPrevY = -10_000;
    pointerVelX = 0;
    pointerVelY = 0;
    lastInteractionTime = performance.now();
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (motionPreference.matches) return;
    const rect = titleCanvas.getBoundingClientRect();
    rippleX = event.clientX - rect.left;
    rippleY = event.clientY - rect.top;
    rippleTime = performance.now();
    startAnimation();
  };

  root.addEventListener('pointermove', handlePointerMove, { passive: true });
  root.addEventListener('pointerleave', handlePointerLeave, { passive: true });
  root.addEventListener('pointerdown', handlePointerDown, { passive: true });

  const resizeObserver = new ResizeObserver(scheduleBuildMatrix);
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (heroVisible) {
      previousFrameTime = performance.now();
      startAnimation();
    } else {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  });
  intersectionObserver.observe(root);

  buildMatrix();
  startAnimation();

  return () => {
    cancelAnimationFrame(resizeFrame);
    cancelAnimationFrame(animationFrame);
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    root.removeEventListener('pointermove', handlePointerMove);
    root.removeEventListener('pointerleave', handlePointerLeave);
    root.removeEventListener('pointerdown', handlePointerDown);
  };
}
