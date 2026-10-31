/**
 * 111iridescence — Programmable LED Matrix Display Architecture (V2)
 *
 * Architectural separation:
 * 1. Authoritative Grid Geometry (immutable integer (column, row) -> (x, y) mapping)
 * 2. Cell State Definitions (strictly grid-locked state; zero continuous position/velocity vectors)
 * 3. Compact Nerdy Pixel Typography (retro-computing bitmap masters for Desktop, Tablet, Mobile)
 * 4. Art-Directed Iridescent Colour Identity (Deep Violet, Electric Blue, Cyan, Turquoise, Subtle Magenta)
 * 5. Living Matrix Ecosystem (random single-cell electronic pulses + multi-frame pixel-art stars)
 * 6. 5-Phase Choreographed Reveal & Authoritative Grid Renderer
 */

// ============================================================================
// 1. AUTHORITATIVE GRID GEOMETRY
// ============================================================================

export type GridGeometry = {
  readonly width: number;
  readonly height: number;
  readonly cellSize: number;
  readonly originX: number;
  readonly originY: number;
  readonly columns: number;
  readonly rows: number;
  readonly inactiveDotSize: number;
  readonly activeDotSize: number;
};

export type GridPoint = {
  readonly x: number;
  readonly y: number;
};

export type GlyphCell = {
  readonly column: number;
  readonly row: number;
};

export type ComposedGlyphCell = GlyphCell & {
  readonly characterIndex: number;
};

/**
 * Authoritative conversion from integer grid coordinates (column, row)
 * to screen pixel center (x, y).
 *
 * Technical invariant:
 *   x = originX + column * cellSize
 *   y = originY + row * cellSize
 */
export function getCellCenter(grid: GridGeometry, column: number, row: number): GridPoint {
  return {
    x: grid.originX + column * grid.cellSize,
    y: grid.originY + row * grid.cellSize,
  };
}

/**
 * Converts continuous viewport coordinates (clientX - bounds.left, clientY - bounds.top)
 * into floating-point grid coordinates for distance evaluation.
 */
export function screenToGridCoordinates(
  grid: GridGeometry,
  screenX: number,
  screenY: number,
): { readonly column: number; readonly row: number } {
  return {
    column: (screenX - grid.originX) / grid.cellSize,
    row: (screenY - grid.originY) / grid.cellSize,
  };
}

/**
 * Creates the single authoritative grid geometry for a given viewport box.
 */
export function createGridGeometry(width: number, height: number): GridGeometry {
  const safeWidth = Math.max(1, Math.round(width));
  const safeHeight = Math.max(1, Math.round(height));

  // Responsive integer cell pitch calibrated for compact technical typography & generous matrix breathing room
  let cellSize = 7;
  if (safeWidth < 370) {
    cellSize = 4;
  } else if (safeWidth < 600) {
    cellSize = 5;
  } else if (safeWidth < 1100) {
    cellSize = 6;
  } else {
    cellSize = 7;
  }

  const originX = cellSize / 2;
  const originY = cellSize / 2;
  const columns = Math.max(1, Math.ceil((safeWidth - originX) / cellSize));
  const rows = Math.max(1, Math.ceil((safeHeight - originY) / cellSize));

  // Fixed square dot dimensions for passive background matrix vs illuminated active cells
  const inactiveDotSize = Math.max(1.25, Number((cellSize * 0.25).toFixed(2)));
  const activeDotSize = Math.max(3, Number((cellSize * 0.64).toFixed(2)));

  return {
    width: safeWidth,
    height: safeHeight,
    cellSize,
    originX,
    originY,
    columns,
    rows,
    inactiveDotSize,
    activeDotSize,
  };
}

/**
 * Automated invariant verifier: confirms that a rendered center (x, y)
 * strictly matches the authoritative grid position for integer (column, row).
 */
export function verifyGridAlignment(
  grid: GridGeometry,
  column: number,
  row: number,
  renderedX: number,
  renderedY: number,
  tolerance = 1e-4,
): boolean {
  if (!Number.isInteger(column) || !Number.isInteger(row)) return false;
  const expected = getCellCenter(grid, column, row);
  return (
    Math.abs(renderedX - expected.x) <= tolerance &&
    Math.abs(renderedY - expected.y) <= tolerance
  );
}

// ============================================================================
// 2. CELL STATE DEFINITIONS (100% GRID-LOCKED)
// ============================================================================

export type GridCell = {
  readonly row: number;
  readonly column: number;
  readonly active: boolean;
  readonly brightness: number;
  readonly color: string;
};

export type TitleCell = {
  readonly column: number;
  readonly row: number;
  readonly characterIndex: number;
  readonly lineIndex: number;
  readonly lineColumnOffset: number;
  readonly lineTotalColumns: number;
  readonly character: string;
  readonly localCol: number;
  readonly localRow: number;
  readonly glyphWidth: number;
  readonly glyphRows: number;
  readonly isBevelEdge: boolean;
  readonly seed: number;
  readonly interferenceColOffset: number;
  readonly interferenceRowOffset: number;
};

export type AmbientCell = {
  readonly column: number;
  readonly row: number;
  readonly phase: number;
  readonly tempo: number;
  readonly colorIndex: number;
};

/**
 * Independent single-cell electronic signal flash in the background grid.
 */
export type ElectronicPulse = {
  readonly column: number;
  readonly row: number;
  readonly startTime: number;
  readonly duration: number;
  readonly peakOpacity: number;
  readonly colorIndex: number;
  readonly useMediumDot: boolean;
};

/**
 * Multi-cell pixel-art star constructed strictly from fixed integer grid offsets.
 */
export type StarCellOffset = {
  readonly dc: number;
  readonly dr: number;
  readonly tier: 0 | 1 | 2 | 3;
};

export type StarArchetype = {
  readonly name: 'cross-5' | 'sparkle-9' | 'star-13';
  readonly radius: number;
  readonly cells: readonly StarCellOffset[];
};

export type PixelStar = {
  readonly column: number;
  readonly row: number;
  readonly archetype: StarArchetype;
  readonly startTime: number;
  readonly duration: number;
  readonly peakOpacity: number;
  readonly coreColorIndex: number;
  readonly armColorIndex: number;
  readonly userSpawned?: boolean;
};

/**
 * Grid-locked cursor trail cell activated as the pointer moves across the matrix.
 */
type CursorTrailCell = {
  readonly column: number;
  readonly row: number;
  startTime: number;
  duration: number;
  peakOpacity: number;
  colorIndex: number;
  isCore: boolean;
};

// ============================================================================
// 3. COMPACT NERDY PIXEL TYPOGRAPHY (RETRO-COMPUTING BITMAP MASTERS)
// ============================================================================

export type PixelGlyph = readonly (readonly [number, number])[];

export type GlyphSystem = {
  readonly name: 'desktop' | 'tablet' | 'mobile';
  readonly totalRows: number;
  readonly xHeightStartRow: number;
  readonly glyphs: Readonly<Record<string, PixelGlyph>>;
  readonly widths: Readonly<Record<string, number>>;
  readonly kerning: (left: string, right: string | undefined) => number;
};

function parseAsciiGlyph(rows: readonly string[]): PixelGlyph {
  const cells: [number, number][] = [];
  for (let r = 0; r < rows.length; r += 1) {
    const line = rows[r];
    for (let c = 0; c < line.length; c += 1) {
      if (line[c] === '#') {
        cells.push([c, r]);
      }
    }
  }
  return cells;
}

/**
 * DESKTOP MASTER (11 rows tall: rows 0..10, lowercase x-height rows 3..10 = 8 rows)
 * Compact, nerdy retro-computing geometry inspired by 0xProto NF & classic IBM VGA terminals.
 * Lowercase glyphs have an exact 1:1 square height-to-width ratio (8 rows × 8 columns),
 * sharp 1-cell chamfered corners, short vertical strokes, and crisp horizontal terminal serifs on 1, i, r.
 */
export const DESKTOP_GLYPH_SYSTEM: GlyphSystem = {
  name: 'desktop',
  totalRows: 11,
  xHeightStartRow: 3,
  widths: {
    '1': 6,
    'i': 6,
    'r': 7,
    'd': 8,
    'e': 8,
    's': 8,
    'c': 8,
    'n': 8,
    '.': 2,
  },
  kerning(left, right) {
    if (!right) return 0;
    if (left === '1' && right === '1') return 2;
    if (left === '1' && right === 'i') return 3;
    if (left === 'e' && right === '.') return 2;
    return 2;
  },
  glyphs: {
    '1': parseAsciiGlyph([
      '..##..',
      '.###..',
      '####..',
      '..##..',
      '..##..',
      '..##..',
      '..##..',
      '..##..',
      '..##..',
      '######',
      '######',
    ]),
    'i': parseAsciiGlyph([
      '..##..',
      '..##..',
      '......',
      '####..',
      '####..',
      '..##..',
      '..##..',
      '..##..',
      '..##..',
      '######',
      '######',
    ]),
    'r': parseAsciiGlyph([
      '.......',
      '.......',
      '.......',
      '##.####',
      '#######',
      '.##..##',
      '.##....',
      '.##....',
      '.##....',
      '#####..',
      '#####..',
    ]),
    'd': parseAsciiGlyph([
      '.....###',
      '......##',
      '......##',
      '.####.##',
      '##....##',
      '##....##',
      '##....##',
      '##....##',
      '##....##',
      '##....##',
      '.####.##',
    ]),
    'e': parseAsciiGlyph([
      '........',
      '........',
      '........',
      '.######.',
      '##....##',
      '##....##',
      '########',
      '##......',
      '##......',
      '##....##',
      '.######.',
    ]),
    's': parseAsciiGlyph([
      '........',
      '........',
      '........',
      '.######.',
      '##....##',
      '##......',
      '.#####..',
      '..#####.',
      '......##',
      '##....##',
      '.######.',
    ]),
    'c': parseAsciiGlyph([
      '........',
      '........',
      '........',
      '.######.',
      '##....##',
      '##......',
      '##......',
      '##......',
      '##......',
      '##....##',
      '.######.',
    ]),
    'n': parseAsciiGlyph([
      '........',
      '........',
      '........',
      '##.####.',
      '########',
      '##....##',
      '##....##',
      '##....##',
      '##....##',
      '##....##',
      '##....##',
    ]),
    '.': parseAsciiGlyph([
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '##',
      '##',
    ]),
  },
};

/**
 * TABLET MASTER (10 rows tall: rows 0..9, lowercase x-height rows 3..9 = 7 rows)
 * Compact 7×7 square lowercase geometry for medium viewports (600px <= width < 960px).
 */
export const TABLET_GLYPH_SYSTEM: GlyphSystem = {
  name: 'tablet',
  totalRows: 10,
  xHeightStartRow: 3,
  widths: {
    '1': 5,
    'i': 5,
    'r': 6,
    'd': 7,
    'e': 7,
    's': 7,
    'c': 7,
    'n': 7,
    '.': 2,
  },
  kerning(left, right) {
    if (!right) return 0;
    if (left === '1' && right === '1') return 2;
    if (left === '1' && right === 'i') return 3;
    if (left === 'e' && right === '.') return 2;
    return 2;
  },
  glyphs: {
    '1': parseAsciiGlyph([
      '..##.',
      '.###.',
      '####.',
      '..##.',
      '..##.',
      '..##.',
      '..##.',
      '..##.',
      '#####',
      '#####',
    ]),
    'i': parseAsciiGlyph([
      '..##.',
      '.....',
      '####.',
      '####.',
      '..##.',
      '..##.',
      '..##.',
      '..##.',
      '#####',
      '#####',
    ]),
    'r': parseAsciiGlyph([
      '......',
      '......',
      '......',
      '##.###',
      '######',
      '.##.##',
      '.##...',
      '.##...',
      '####..',
      '####..',
    ]),
    'd': parseAsciiGlyph([
      '....###',
      '.....##',
      '.....##',
      '.###.##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '.###.##',
    ]),
    'e': parseAsciiGlyph([
      '.......',
      '.......',
      '.......',
      '.#####.',
      '##...##',
      '#######',
      '##.....',
      '##.....',
      '##...##',
      '.#####.',
    ]),
    's': parseAsciiGlyph([
      '.......',
      '.......',
      '.......',
      '.#####.',
      '##...##',
      '##.....',
      '.#####.',
      '.....##',
      '##...##',
      '.#####.',
    ]),
    'c': parseAsciiGlyph([
      '.......',
      '.......',
      '.......',
      '.#####.',
      '##...##',
      '##.....',
      '##.....',
      '##.....',
      '##...##',
      '.#####.',
    ]),
    'n': parseAsciiGlyph([
      '.......',
      '.......',
      '.......',
      '##.###.',
      '#######',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
      '##...##',
    ]),
    '.': parseAsciiGlyph([
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '##',
      '##',
    ]),
  },
};

/**
 * MOBILE MASTER (9 rows tall: rows 0..8, lowercase x-height rows 2..8 = 7 rows)
 * Compact two-line stacked layout for viewports < 600px.
 */
export const MOBILE_GLYPH_SYSTEM: GlyphSystem = {
  name: 'mobile',
  totalRows: 9,
  xHeightStartRow: 2,
  widths: {
    '1': 5,
    'i': 4,
    'r': 5,
    'd': 6,
    'e': 6,
    's': 6,
    'c': 6,
    'n': 6,
    '.': 2,
  },
  kerning(left, right) {
    if (!right) return 0;
    if (left === '1' && right === '1') return 2;
    if (left === 'e' && right === '.') return 1;
    return 1;
  },
  glyphs: {
    '1': parseAsciiGlyph([
      '..##.',
      '.###.',
      '####.',
      '..##.',
      '..##.',
      '..##.',
      '..##.',
      '#####',
      '#####',
    ]),
    'i': parseAsciiGlyph([
      '.##.',
      '....',
      '###.',
      '.##.',
      '.##.',
      '.##.',
      '.##.',
      '####',
      '####',
    ]),
    'r': parseAsciiGlyph([
      '.....',
      '.....',
      '#.###',
      '#####',
      '.#..#',
      '.#...',
      '.#...',
      '####.',
      '####.',
    ]),
    'd': parseAsciiGlyph([
      '....##',
      '....##',
      '.##.##',
      '##..##',
      '##..##',
      '##..##',
      '##..##',
      '##..##',
      '.##.##',
    ]),
    'e': parseAsciiGlyph([
      '......',
      '......',
      '.####.',
      '##..##',
      '######',
      '##....',
      '##....',
      '##..##',
      '.####.',
    ]),
    's': parseAsciiGlyph([
      '......',
      '......',
      '.####.',
      '##..##',
      '##....',
      '.####.',
      '....##',
      '##..##',
      '.####.',
    ]),
    'c': parseAsciiGlyph([
      '......',
      '......',
      '.####.',
      '##..##',
      '##....',
      '##....',
      '##....',
      '##..##',
      '.####.',
    ]),
    'n': parseAsciiGlyph([
      '......',
      '......',
      '##.##.',
      '######',
      '##..##',
      '##..##',
      '##..##',
      '##..##',
      '##..##',
    ]),
    '.': parseAsciiGlyph([
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '..',
      '##',
      '##',
    ]),
  },
};

/**
 * Canonical fixed-advance glyph line composer preserved for unit-test compatibility.
 */
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

const TITLE = '111iridescence.';

export const hashPixel = (column: number, row: number) => (
  Math.imul(column + 17, 73_856_093) ^ Math.imul(row + 31, 19_349_663)
) >>> 0;

/**
 * Selects the appropriate optical glyph system for the current grid resolution.
 */
export function selectGlyphSystem(grid: GridGeometry): GlyphSystem {
  if (grid.width < 600) return MOBILE_GLYPH_SYSTEM;
  if (grid.width < 960) return TABLET_GLYPH_SYSTEM;
  return DESKTOP_GLYPH_SYSTEM;
}

/**
 * Measures the total width in grid columns of a word using proportional optical kerning.
 */
export function measureWordColumns(
  word: string,
  system: GlyphSystem,
): { readonly totalColumns: number; readonly placements: readonly { char: string; startCol: number; width: number }[] } {
  const placements: { char: string; startCol: number; width: number }[] = [];
  let cursorCol = 0;
  for (let i = 0; i < word.length; i += 1) {
    const char = word[i];
    const width = system.widths[char] ?? 6;
    placements.push({ char, startCol: cursorCol, width });
    cursorCol += width + system.kerning(char, word[i + 1]);
  }
  return { totalColumns: cursorCol, placements };
}

/**
 * Constructs all grid-locked TitleCells for "111iridescence." within the authoritative grid,
 * plus an exclusion zone (`protectedZone`) around the word so background stars never overlap text.
 */
export function buildTypographyCells(grid: GridGeometry): {
  readonly cells: readonly TitleCell[];
  readonly coordinateSet: ReadonlySet<string>;
  readonly protectedZone: ReadonlySet<string>;
} {
  const system = selectGlyphSystem(grid);
  const lines = system.name === 'mobile' ? ['111', 'iridescence.'] : [TITLE];
  const lineGapRows = system.name === 'mobile' ? 5 : 0;
  const totalBlockRows = lines.length * system.totalRows + (lines.length - 1) * lineGapRows;
  const startTopRow = Math.round((grid.rows - totalBlockRows) / 2);

  const rawCells: {
    column: number;
    row: number;
    characterIndex: number;
    lineIndex: number;
    lineColumnOffset: number;
    lineTotalColumns: number;
    character: string;
    localCol: number;
    localRow: number;
    glyphWidth: number;
    glyphRows: number;
  }[] = [];
  const coordinateSet = new Set<string>();
  const protectedZone = new Set<string>();

  let globalCharIndex = 0;
  lines.forEach((line, lineIndex) => {
    const { totalColumns, placements } = measureWordColumns(line, system);
    const lineStartCol = Math.floor((grid.columns - totalColumns) / 2);
    const lineTopRow = startTopRow + lineIndex * (system.totalRows + lineGapRows);

    for (const placement of placements) {
      const charIndex = globalCharIndex;
      globalCharIndex += 1;
      const mask = system.glyphs[placement.char] ?? [];
      for (const [localCol, localRow] of mask) {
        const column = lineStartCol + placement.startCol + localCol;
        const row = lineTopRow + localRow;
        if (column < 0 || column >= grid.columns || row < 0 || row >= grid.rows) continue;
        const key = `${column}:${row}`;
        coordinateSet.add(key);

        // Add a 4-cell exclusion margin around every glyph cell so stars never crowd or overlap letters
        for (let dr = -4; dr <= 4; dr += 1) {
          for (let dc = -4; dc <= 4; dc += 1) {
            protectedZone.add(`${column + dc}:${row + dr}`);
          }
        }

        rawCells.push({
          column,
          row,
          characterIndex: charIndex,
          lineIndex,
          lineColumnOffset: placement.startCol + localCol,
          lineTotalColumns: Math.max(1, totalColumns),
          character: placement.char,
          localCol,
          localRow,
          glyphWidth: placement.width,
          glyphRows: system.totalRows,
        });
      }
    }
  });

  const cells: TitleCell[] = rawCells.map((cell) => {
    const hasAbove = coordinateSet.has(`${cell.column}:${cell.row - 1}`);
    const hasLeft = coordinateSet.has(`${cell.column - 1}:${cell.row}`);
    const seed = hashPixel(cell.column, cell.row);
    // Deterministic integer grid offset for Phase 2 signal decoding (strictly integer cells)
    const dirCol = ((seed & 1) === 0 ? 1 : -1) * (1 + ((seed >>> 3) % 3));
    const dirRow = (((seed >>> 7) & 1) === 0 ? 1 : -1) * (2 + ((seed >>> 11) % 5));
    return {
      ...cell,
      isBevelEdge: !hasAbove || !hasLeft,
      seed,
      interferenceColOffset: dirCol,
      interferenceRowOffset: dirRow,
    };
  });

  return { cells, coordinateSet, protectedZone };
}

// ============================================================================
// 4. ART-DIRECTED IRIDESCENT COLOUR IDENTITY
// ============================================================================

export type RgbColor = { readonly r: number; readonly g: number; readonly b: number };

/**
 * Curated digital-identity palette:
 * Deep Violet, Electric Blue, Cyan, Controlled Turquoise, and Subtle Magenta.
 * Structured with hierarchy and contrast rather than an even rainbow gradient.
 */
export const IRIDESCENCE_PALETTE = {
  obsidianViolet: { r: 30, g: 18, b: 56 },     // Structural anchor
  deepViolet: { r: 78, g: 34, b: 176 },        // Core chromatic body
  ultraviolet: { r: 112, g: 46, b: 228 },      // High-contrast violet accent
  electricBlue: { r: 34, g: 102, b: 242 },     // Primary specular signal
  cyan: { r: 12, g: 192, b: 232 },             // Crisp high-frequency edge glint
  turquoise: { r: 18, g: 182, b: 164 },        // Controlled secondary accent
  subtleMagenta: { r: 178, g: 52, b: 162 },    // Restrained warm inflection
} as const;

export const SIGNAL_ACCENT_COLORS: readonly string[] = [
  'rgb(78, 34, 176)',   // Deep Violet
  'rgb(34, 102, 242)',  // Electric Blue
  'rgb(12, 192, 232)',  // Cyan
  'rgb(112, 46, 228)',  // Ultraviolet
  'rgb(18, 182, 164)',  // Controlled Turquoise
  'rgb(178, 52, 162)',  // Subtle Magenta
  'rgb(30, 18, 56)',    // Obsidian Violet
];

function mixRgb(a: RgbColor, b: RgbColor, t: number): RgbColor {
  const clamped = Math.max(0, Math.min(1, t));
  return {
    r: Math.round(a.r + (b.r - a.r) * clamped),
    g: Math.round(a.g + (b.g - a.g) * clamped),
    b: Math.round(a.b + (b.b - a.b) * clamped),
  };
}

function formatRgb(c: RgbColor): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

/**
 * Evaluates an intentional, hierarchical iridescent colour for a typography grid cell.
 * Avoids generic rainbow gradients by anchoring the letter bodies in Deep/Obsidian Violet
 * and concentrating Electric Blue, Cyan, Turquoise, and Subtle Magenta along travelling
 * interference crests, upper-left bevel edges, and focal glyphs ("111", "i" tittles, ".").
 */
export function computeIridescentCellColor(
  grid: GridGeometry,
  cell: TitleCell,
  time: number,
  _inkColor: RgbColor,
  cursorInfluence = 0,
  revealCrest = 0,
): string {
  const facet = ((cell.seed % 1000) / 1000);
  const slowPhase = time * 0.00055;

  // Non-linear spatial interference wave (travels in curved interference packets, not a flat rainbow)
  const waveA = Math.sin(cell.column * 0.14 - cell.row * 0.22 - slowPhase * 1.8);
  const waveB = Math.cos(cell.column * 0.07 + cell.row * 0.19 + slowPhase * 1.1);
  const interference = (waveA * 0.6 + waveB * 0.4 + 1) * 0.5; // [0..1]

  let baseColor: RgbColor;

  // 1. Hierarchical treatment for the "111" prefix triad
  if (cell.characterIndex === 0) {
    // First '1': Deep Obsidian-Violet grounded anchor with Electric Blue top bevel
    baseColor = cell.isBevelEdge
      ? mixRgb(IRIDESCENCE_PALETTE.deepViolet, IRIDESCENCE_PALETTE.electricBlue, 0.38 + interference * 0.25)
      : mixRgb(IRIDESCENCE_PALETTE.obsidianViolet, IRIDESCENCE_PALETTE.deepViolet, 0.42);
  } else if (cell.characterIndex === 1) {
    // Second '1': Deep Violet -> Electric Blue bridge
    baseColor = cell.isBevelEdge
      ? mixRgb(IRIDESCENCE_PALETTE.electricBlue, IRIDESCENCE_PALETTE.cyan, 0.32 + interference * 0.3)
      : mixRgb(IRIDESCENCE_PALETTE.deepViolet, IRIDESCENCE_PALETTE.electricBlue, 0.48 + interference * 0.22);
  } else if (cell.characterIndex === 2) {
    // Third '1': Luminous Electric Blue & Cyan accent
    baseColor = cell.isBevelEdge
      ? mixRgb(IRIDESCENCE_PALETTE.cyan, IRIDESCENCE_PALETTE.electricBlue, 0.35)
      : mixRgb(IRIDESCENCE_PALETTE.electricBlue, IRIDESCENCE_PALETTE.ultraviolet, 0.28 + (1 - interference) * 0.32);
  } else if (cell.character === '.') {
    // Terminal period '.': High-contrast Cyan / Subtle Magenta beacon
    baseColor = cell.localRow % 2 === 0
      ? mixRgb(IRIDESCENCE_PALETTE.cyan, IRIDESCENCE_PALETTE.electricBlue, 0.35)
      : mixRgb(IRIDESCENCE_PALETTE.subtleMagenta, IRIDESCENCE_PALETTE.ultraviolet, 0.4);
  } else if (cell.character === 'i' && cell.localRow <= 1) {
    // Tittle of 'i': Crisp Cyan / Electric Blue electronic indicator
    baseColor = mixRgb(IRIDESCENCE_PALETTE.cyan, IRIDESCENCE_PALETTE.electricBlue, 0.45 * interference);
  } else {
    // "iridescence" body:
    // Structural core is Deep Violet / Obsidian Violet (~65% visual weight)
    // Specular bevel edges and interference crests refract into Electric Blue, Cyan, Turquoise, and Subtle Magenta
    const structuralCore = mixRgb(
      IRIDESCENCE_PALETTE.obsidianViolet,
      IRIDESCENCE_PALETTE.deepViolet,
      0.38 + facet * 0.34,
    );

    if (cell.isBevelEdge) {
      // Bevel edges catch the directional iridescent light
      if (interference > 0.68) {
        const t = (interference - 0.68) / 0.32;
        baseColor = facet > 0.72
          ? mixRgb(IRIDESCENCE_PALETTE.electricBlue, IRIDESCENCE_PALETTE.turquoise, t * 0.75)
          : mixRgb(IRIDESCENCE_PALETTE.electricBlue, IRIDESCENCE_PALETTE.cyan, t * 0.85);
      } else if (interference < 0.26 && facet > 0.62) {
        // Restrained Subtle Magenta inflection on select bevel facets
        baseColor = mixRgb(IRIDESCENCE_PALETTE.ultraviolet, IRIDESCENCE_PALETTE.subtleMagenta, 0.55);
      } else {
        baseColor = mixRgb(IRIDESCENCE_PALETTE.deepViolet, IRIDESCENCE_PALETTE.electricBlue, 0.52 + interference * 0.35);
      }
    } else {
      // Interior stem cells stay grounded in Deep Violet with localized Electric Blue / Ultraviolet shimmer
      if (interference > 0.76 && facet > 0.55) {
        baseColor = mixRgb(structuralCore, IRIDESCENCE_PALETTE.electricBlue, 0.58);
      } else if (interference < 0.22 && facet > 0.78) {
        baseColor = mixRgb(structuralCore, IRIDESCENCE_PALETTE.subtleMagenta, 0.42);
      } else {
        baseColor = structuralCore;
      }
    }
  }

  // Cursor proximity or reveal wave crest excites cells toward high-luminance Cyan / Electric Blue / Turquoise
  const excitation = Math.min(1, cursorInfluence * 0.85 + revealCrest * 0.95);
  if (excitation > 0.01) {
    const excitedTarget = (cell.seed & 3) === 0
      ? IRIDESCENCE_PALETTE.turquoise
      : (cell.seed & 1) === 0
        ? IRIDESCENCE_PALETTE.cyan
        : IRIDESCENCE_PALETTE.electricBlue;
    baseColor = mixRgb(baseColor, excitedTarget, excitation);
  }

  // Keep `grid` referenced for API consistency
  void grid;
  return formatRgb(baseColor);
}

// ============================================================================
// 5. PIXEL-ART STARS & ELECTRONIC SIGNAL SYSTEM (100% GRID-LOCKED)
// ============================================================================

export const STAR_ARCHETYPES: readonly StarArchetype[] = [
  // 0: Compact 5-cell pixel cross (radius = 1)
  {
    name: 'cross-5',
    radius: 1,
    cells: [
      { dc: 0, dr: 0, tier: 0 },
      { dc: -1, dr: 0, tier: 1 },
      { dc: 1, dr: 0, tier: 1 },
      { dc: 0, dr: -1, tier: 1 },
      { dc: 0, dr: 1, tier: 1 },
    ],
  },
  // 1: 9-cell four-point diamond sparkle (radius = 2)
  {
    name: 'sparkle-9',
    radius: 2,
    cells: [
      { dc: 0, dr: 0, tier: 0 },
      { dc: -1, dr: 0, tier: 1 },
      { dc: 1, dr: 0, tier: 1 },
      { dc: 0, dr: -1, tier: 1 },
      { dc: 0, dr: 1, tier: 1 },
      { dc: -2, dr: 0, tier: 2 },
      { dc: 2, dr: 0, tier: 2 },
      { dc: 0, dr: -2, tier: 2 },
      { dc: 0, dr: 2, tier: 2 },
    ],
  },
  // 2: 13-cell eight-point pixel star (radius = 2 with diagonal glints)
  {
    name: 'star-13',
    radius: 2,
    cells: [
      { dc: 0, dr: 0, tier: 0 },
      { dc: -1, dr: 0, tier: 1 },
      { dc: 1, dr: 0, tier: 1 },
      { dc: 0, dr: -1, tier: 1 },
      { dc: 0, dr: 1, tier: 1 },
      { dc: -1, dr: -1, tier: 2 },
      { dc: 1, dr: -1, tier: 2 },
      { dc: -1, dr: 1, tier: 2 },
      { dc: 1, dr: 1, tier: 2 },
      { dc: -2, dr: 0, tier: 3 },
      { dc: 2, dr: 0, tier: 3 },
      { dc: 0, dr: -2, tier: 3 },
      { dc: 0, dr: 2, tier: 3 },
    ],
  },
];

/**
 * Evaluates the discrete 5-stage twinkling animation for a pixel-art star cell:
 * 1. Single central cell lights up (0.00 - 0.18)
 * 2. Neighbouring grid cells illuminate in a cross (0.18 - 0.36)
 * 3. Outer tips reach peak sparkle brightness (0.36 - 0.58)
 * 4. Outer cells fade inward (0.58 - 0.80)
 * 5. Centre fades away (0.80 - 1.00)
 */
export function evaluateStarTierOpacity(tier: 0 | 1 | 2 | 3, progress: number): number {
  if (progress <= 0 || progress >= 1) return 0;

  if (tier === 0) {
    // Center cell ignites first, holds through peak, and is last to fade out
    if (progress < 0.18) return progress / 0.18;
    if (progress < 0.76) return 1;
    return Math.max(0, 1 - (progress - 0.76) / 0.24);
  }

  if (tier === 1) {
    // Inner cardinal cross activates second and retracts before center
    if (progress < 0.14 || progress > 0.82) return 0;
    if (progress < 0.32) return ((progress - 0.14) / 0.18) * 0.85;
    if (progress < 0.62) return 0.85;
    return Math.max(0, (1 - (progress - 0.62) / 0.20) * 0.85);
  }

  if (tier === 2) {
    // Outer tips (sparkle-9) or diagonal glints (star-13)
    if (progress < 0.26 || progress > 0.70) return 0;
    if (progress < 0.44) return ((progress - 0.26) / 0.18) * 0.68;
    if (progress < 0.54) return 0.68;
    return Math.max(0, (1 - (progress - 0.54) / 0.16) * 0.68);
  }

  // Tier 3: Outer cardinal tips of the 8-point star
  if (progress < 0.32 || progress > 0.64) return 0;
  if (progress < 0.45) return ((progress - 0.32) / 0.13) * 0.56;
  if (progress < 0.52) return 0.56;
  return Math.max(0, (1 - (progress - 0.52) / 0.12) * 0.56);
}

/**
 * Checks whether a candidate star at (column, row) is strictly outside the protected text zone
 * and away from canvas borders and other active stars.
 */
export function isEligibleStarPosition(
  grid: GridGeometry,
  column: number,
  row: number,
  archetype: StarArchetype,
  protectedZone: ReadonlySet<string>,
  existingStars: readonly PixelStar[],
): boolean {
  const margin = archetype.radius + 2;
  if (
    column < margin ||
    column >= grid.columns - margin ||
    row < margin ||
    row >= grid.rows - margin
  ) {
    return false;
  }

  for (const offset of archetype.cells) {
    const c = column + offset.dc;
    const r = row + offset.dr;
    if (protectedZone.has(`${c}:${r}`)) return false;
  }

  for (const other of existingStars) {
    const dist = Math.hypot(column - other.column, row - other.row);
    if (dist < 12) return false;
  }

  return true;
}

// ============================================================================
// 6. 5-PHASE CHOREOGRAPHED REVEAL SEQUENCE & AUTHORITATIVE RENDERER
// ============================================================================

export type CellRevealState = {
  readonly glyphOpacity: number;
  readonly interferenceOpacity: number;
  readonly crest: number;
};

/**
 * Choreographs the 5-phase main reveal sequence:
 * - Phase 1 (0ms - 360ms): Ambient grid & initial horizon calibration signal (glyphs at 0%)
 * - Phase 2 (240ms - 1,180ms): Signal carrier scan & quantized interference cells around character columns
 * - Phase 3 (360ms - 1,720ms): Progressive character construction (row-by-row & stem-by-stem bit-lock)
 * - Phase 4 (1,580ms - 2,380ms): Final chromatic consolidation wave across completed word
 * - Phase 5 (> 2,380ms): Living idle state
 */
export function evaluateRevealWave(
  cell: TitleCell,
  elapsedSinceMount: number,
  reducedMotion: boolean,
): { readonly brightness: number; readonly crest: number; readonly interferenceOpacity: number } {
  if (reducedMotion || elapsedSinceMount >= 2420) {
    return { brightness: 1, crest: 0, interferenceOpacity: 0 };
  }

  // Normalized horizontal position of the character along its line [0..1]
  const lineNorm = cell.lineColumnOffset / Math.max(1, cell.lineTotalColumns);

  // Staggered character construction window:
  // Starts at t = 340ms for leftmost character, sweeping to t = 1,340ms for rightmost character
  const charStartMs = 340 + lineNorm * 1000 + cell.lineIndex * 160;
  const rowDelayMs = (cell.localRow / Math.max(1, cell.glyphRows)) * 180;
  const cellLockStartMs = charStartMs + rowDelayMs;
  const cellLockDurationMs = 310;

  // Phase 2: Temporary quantized interference cells active just before and during character bit-lock
  const interferenceWindowStart = charStartMs - 210;
  const interferenceWindowEnd = cellLockStartMs + 220;
  let interferenceOpacity = 0;
  if (elapsedSinceMount >= interferenceWindowStart && elapsedSinceMount <= interferenceWindowEnd) {
    const mid = (interferenceWindowStart + interferenceWindowEnd) * 0.5;
    const halfSpan = Math.max(1, (interferenceWindowEnd - interferenceWindowStart) * 0.5);
    const tent = Math.max(0, 1 - Math.abs(elapsedSinceMount - mid) / halfSpan);
    // Digital packet quantization pulse
    const bitPulse = ((Math.floor(elapsedSinceMount / 36) + (cell.seed & 3)) % 3) === 0 ? 1 : 0.58;
    interferenceOpacity = tent * bitPulse * 0.88;
  }

  // Phase 3: Progressive character construction (strictly 0 before cellLockStartMs!)
  let constructionBrightness = 0;
  if (elapsedSinceMount > cellLockStartMs) {
    const raw = Math.min(1, (elapsedSinceMount - cellLockStartMs) / cellLockDurationMs);
    constructionBrightness = raw * raw * (3 - 2 * raw);
  }

  // Phase 4: Final chromatic consolidation wave (1,560ms -> 2,380ms)
  let consolidationCrest = 0;
  if (elapsedSinceMount >= 1560 && elapsedSinceMount < 2380) {
    const waveProgress = (elapsedSinceMount - 1560) / 760;
    const dist = Math.abs(waveProgress - lineNorm);
    if (dist < 0.24) {
      consolidationCrest = (1 - dist / 0.24) * 0.92;
    }
  }

  // Lock crest during initial construction + Phase 4 consolidation crest
  const lockCrest = constructionBrightness > 0.05 && constructionBrightness < 0.98
    ? Math.sin(constructionBrightness * Math.PI) * 0.88
    : 0;

  return {
    brightness: constructionBrightness,
    crest: Math.max(lockCrest, consolidationCrest),
    interferenceOpacity,
  };
}

/**
 * The single authoritative drawing primitive for every pixel in the matrix.
 * Renders a square cell strictly centered at getCellCenter(grid, column, row).
 */
export function renderGridCell(
  ctx: CanvasRenderingContext2D,
  grid: GridGeometry,
  column: number,
  row: number,
  dotSize: number,
  color: string,
  opacity: number,
): void {
  if (column < 0 || column >= grid.columns || row < 0 || row >= grid.rows) return;
  const clampedOpacity = Math.max(0, Math.min(1, opacity));
  if (clampedOpacity <= 0.001) return;
  const { x, y } = getCellCenter(grid, column, row);
  ctx.globalAlpha = clampedOpacity;
  ctx.fillStyle = color;
  ctx.fillRect(x - dotSize / 2, y - dotSize / 2, dotSize, dotSize);
}

function parseCssColorToRgb(raw: string, fallback: RgbColor): RgbColor {
  const trimmed = raw.trim();
  const rgbMatch = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]),
      g: Number(rgbMatch[2]),
      b: Number(rgbMatch[3]),
    };
  }
  if (trimmed.startsWith('#') && trimmed.length === 7) {
    return {
      r: Number.parseInt(trimmed.slice(1, 3), 16),
      g: Number.parseInt(trimmed.slice(3, 5), 16),
      b: Number.parseInt(trimmed.slice(5, 7), 16),
    };
  }
  return fallback;
}

export async function mountPixelTitle(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pixel-canvas]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return () => {};

  const titleCanvas = canvas;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = getComputedStyle(root);

  const matrixColor = palette.getPropertyValue('--ink').trim() || 'rgb(22, 16, 29)';
  const matrixAccent = 'rgb(34, 102, 242)';
  const inkRgb = parseCssColorToRgb(matrixColor, { r: 22, g: 16, b: 29 });

  const matrixLayer = document.createElement('canvas');
  const matrixContext = matrixLayer.getContext('2d');
  if (!matrixContext) return () => {};

  let grid = createGridGeometry(1, 1);
  let titleCells: readonly TitleCell[] = [];
  let ambientCells: AmbientCell[] = [];
  let activePulses: ElectronicPulse[] = [];
  let activeStars: PixelStar[] = [];
  let staticReducedMotionStars: PixelStar[] = [];
  let cursorTrail = new Map<string, CursorTrailCell>();
  let titleCoordinates = new Set<string>();
  let protectedZone = new Set<string>();

  let pointerX = -10_000;
  let pointerY = -10_000;
  let pointerTargetX = -10_000;
  let pointerTargetY = -10_000;
  let interactionMix = 0;
  let pointerActive = false;
  let lastTrailCol: number | null = null;
  let lastTrailRow: number | null = null;
  let trailStepCounter = 0;

  let rippleGridColumn = -10_000;
  let rippleGridRow = -10_000;
  let rippleStartTime = -10_000;

  let mountStartTime = 0;
  let nextPulseSpawnTime = 0;
  let nextStarSpawnTime = 0;
  let starBandToggle = 0;
  let spawnCounter = 1;
  let resizeFrame = 0;
  let animationFrame = 0;
  let previousFrameTime = 0;
  let heroVisible = true;

  const coordinateKey = (column: number, row: number) => `${column}:${row}`;

  const nextPseudoRandom = () => {
    spawnCounter = (Math.imul(spawnCounter, 1_664_525) + 1_013_904_223) >>> 0;
    return spawnCounter / 4_294_967_296;
  };

  const paintStaticMatrixLayer = () => {
    matrixLayer.width = grid.width;
    matrixLayer.height = grid.height;
    matrixContext.clearRect(0, 0, grid.width, grid.height);
    const nextAmbientCells: AmbientCell[] = [];

    for (let row = 0; row < grid.rows; row += 1) {
      for (let column = 0; column < grid.columns; column += 1) {
        const seed = hashPixel(column, row);
        const accent = seed % 29 === 0;
        renderGridCell(
          matrixContext,
          grid,
          column,
          row,
          grid.inactiveDotSize,
          accent ? matrixAccent : matrixColor,
          accent ? 0.155 : 0.098,
        );

        if (seed % 233 === 0) {
          nextAmbientCells.push({
            column,
            row,
            colorIndex: (seed >>> 8) % SIGNAL_ACCENT_COLORS.length,
            phase: (((seed >>> 5) % 1024) / 1024) * Math.PI * 2,
            tempo: 0.00028 + ((seed >>> 18) % 11) * 0.000024,
          });
        }
      }
    }
    matrixContext.globalAlpha = 1;
    ambientCells = nextAmbientCells;
  };

  /**
   * Spawns a single-cell electronic signal flash at a random eligible background coordinate.
   */
  const spawnElectronicPulse = (now: number, initialOffsetMs = 0) => {
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const col = Math.floor(nextPseudoRandom() * grid.columns);
      const row = Math.floor(nextPseudoRandom() * grid.rows);
      const key = coordinateKey(col, row);
      if (protectedZone.has(key)) continue;

      const duration = 1650 + nextPseudoRandom() * 2400;
      const peakOpacity = 0.46 + nextPseudoRandom() * 0.42;
      const colorIndex = Math.floor(nextPseudoRandom() * SIGNAL_ACCENT_COLORS.length);
      const useMediumDot = nextPseudoRandom() > 0.25;

      activePulses.push({
        column: col,
        row,
        startTime: now - initialOffsetMs,
        duration,
        peakOpacity,
        colorIndex,
        useMediumDot,
      });
      return;
    }
  };

  /**
   * Spawns a multi-cell pixel-art star at an eligible empty grid coordinate outside the text zone,
   * alternating upper and lower field bands so stars distribute organically across the canvas.
   */
  const spawnPixelStar = (now: number, initialOffsetMs = 0) => {
    const r = nextPseudoRandom();
    const archetype = r < 0.34
      ? STAR_ARCHETYPES[0]
      : r < 0.72
        ? STAR_ARCHETYPES[1]
        : STAR_ARCHETYPES[2];

    const preferUpperBand = (starBandToggle % 2) === 0;
    starBandToggle += 1;

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const col = Math.floor(nextPseudoRandom() * grid.columns);
      const rawRow = nextPseudoRandom();
      const row = attempt < 24
        ? (preferUpperBand
          ? Math.floor(rawRow * (grid.rows * 0.38))
          : Math.floor(grid.rows * 0.62 + rawRow * (grid.rows * 0.36)))
        : Math.floor(rawRow * grid.rows);

      if (!isEligibleStarPosition(grid, col, row, archetype, protectedZone, activeStars)) {
        continue;
      }

      const duration = 2600 + nextPseudoRandom() * 2200;
      const peakOpacity = 0.78 + nextPseudoRandom() * 0.22;
      const coreColorIndex = Math.floor(nextPseudoRandom() * 5); // Violet, Electric Blue, Cyan, Ultraviolet, Turquoise
      const armColorIndex = (coreColorIndex + 1) % 5;

      activeStars.push({
        column: col,
        row,
        archetype,
        startTime: now - initialOffsetMs,
        duration,
        peakOpacity,
        coreColorIndex,
        armColorIndex,
      });
      return;
    }
  };

  /**
   * Spawns a pixel-art star at a user-clicked empty grid coordinate (col, row).
   * Ensures the star only spawns in empty space outside the "111iridescence." letterforms.
   */
  const spawnPixelStarAt = (
    col: number,
    row: number,
    now: number,
  ): boolean => {
    if (col < 1 || col >= grid.columns - 1 || row < 1 || row >= grid.rows - 1) return false;
    if (titleCoordinates.has(coordinateKey(col, row))) return false;

    // Prefer sparkle-9 or star-13 on click for a rewarding visual response, fallback to cross-5 near edges/letters
    const preferredOrder = [
      STAR_ARCHETYPES[Math.floor(nextPseudoRandom() * 2) + 1],
      STAR_ARCHETYPES[1],
      STAR_ARCHETYPES[2],
      STAR_ARCHETYPES[0],
    ];

    let chosenArchetype: StarArchetype | null = null;
    for (const candidate of preferredOrder) {
      let fits =
        col - candidate.radius >= 0 &&
        col + candidate.radius < grid.columns &&
        row - candidate.radius >= 0 &&
        row + candidate.radius < grid.rows;
      if (fits) {
        for (const cell of candidate.cells) {
          if (titleCoordinates.has(coordinateKey(col + cell.dc, row + cell.dr))) {
            fits = false;
            break;
          }
        }
      }
      if (fits) {
        chosenArchetype = candidate;
        break;
      }
    }

    if (!chosenArchetype) return false;

    const coreColorIndex = 1 + Math.floor(nextPseudoRandom() * 3); // Electric Blue, Cyan, or Turquoise
    const armColorIndex = (coreColorIndex + 1 + Math.floor(nextPseudoRandom() * 3)) % SIGNAL_ACCENT_COLORS.length;

    activeStars.push({
      column: col,
      row,
      archetype: chosenArchetype,
      startTime: now,
      duration: 2800 + nextPseudoRandom() * 1600,
      peakOpacity: 0.94,
      coreColorIndex,
      armColorIndex,
      userSpawned: true,
    });
    return true;
  };

  /**
   * Activates a single integer grid cell as part of the cursor trail.
   */
  const activateTrailCell = (
    col: number,
    row: number,
    now: number,
    isCore: boolean,
    colorIndex: number,
  ) => {
    if (col < 0 || col >= grid.columns || row < 0 || row >= grid.rows) return;
    const key = coordinateKey(col, row);
    if (titleCoordinates.has(key)) return;

    const seed = hashPixel(col, row);
    const duration = isCore
      ? 620 + (seed % 260)
      : 420 + (seed % 200);
    const peakOpacity = isCore ? 0.86 : 0.44;

    const existing = cursorTrail.get(key);
    if (existing) {
      existing.startTime = now;
      existing.duration = Math.max(existing.duration, duration);
      existing.peakOpacity = Math.max(existing.peakOpacity, peakOpacity);
      existing.colorIndex = colorIndex;
      existing.isCore = existing.isCore || isCore;
    } else {
      if (cursorTrail.size > 220) {
        const oldestKey = cursorTrail.keys().next().value;
        if (oldestKey !== undefined) cursorTrail.delete(oldestKey);
      }
      cursorTrail.set(key, {
        column: col,
        row,
        startTime: now,
        duration,
        peakOpacity,
        colorIndex,
        isCore,
      });
    }
  };

  /**
   * Traces integer grid cells along the cursor movement path to form a grid-locked luminous trail.
   */
  const recordCursorTrail = (targetX: number, targetY: number, now: number) => {
    const gridPos = screenToGridCoordinates(grid, targetX, targetY);
    const currCol = Math.round(gridPos.column);
    const currRow = Math.round(gridPos.row);

    const prevCol = lastTrailCol ?? currCol;
    const prevRow = lastTrailRow ?? currRow;
    const dist = Math.hypot(currCol - prevCol, currRow - prevRow);

    // Interpolate discrete grid steps so fast cursor movements leave a continuous pixel trail
    const steps = dist > 0 && dist <= 32 ? Math.max(1, Math.ceil(dist)) : 1;
    const startCol = dist <= 32 ? prevCol : currCol;
    const startRow = dist <= 32 ? prevRow : currRow;

    for (let i = 1; i <= steps; i += 1) {
      const t = i / steps;
      const c = Math.round(startCol + (currCol - startCol) * t);
      const r = Math.round(startRow + (currRow - startRow) * t);
      trailStepCounter += 1;

      // Cycle smoothly through Cyan, Electric Blue, Turquoise, Deep Violet
      const headColors = [2, 1, 4, 0, 3];
      const colorIndex = headColors[trailStepCounter % headColors.length];
      activateTrailCell(c, r, now, true, colorIndex);

      // Subtle pixelated wake on orthogonal neighbor cell
      const seed = hashPixel(c + trailStepCounter, r);
      const dirs: readonly (readonly [number, number])[] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      const [dc, dr] = dirs[seed % 4];
      activateTrailCell(
        c + dc,
        r + dr,
        now,
        false,
        (colorIndex + 1) % SIGNAL_ACCENT_COLORS.length,
      );
    }

    lastTrailCol = currCol;
    lastTrailRow = currRow;
  };

  /**
   * Seeds initial background electronic pulses and pixel stars on matrix build.
   */
  const seedInitialEcosystem = (now: number) => {
    activePulses = [];
    activeStars = [];
    staticReducedMotionStars = [];
    cursorTrail.clear();
    lastTrailCol = null;
    lastTrailRow = null;
    starBandToggle = 0;
    spawnCounter = (grid.columns * 7919 + grid.rows * 65537 + 42) >>> 0;

    const targetInitialPulses = grid.width < 600 ? 12 : 20;
    for (let i = 0; i < targetInitialPulses; i += 1) {
      spawnElectronicPulse(now, nextPseudoRandom() * 1900);
    }

    const targetInitialStars = grid.width < 600 ? 2 : 4;
    for (let i = 0; i < targetInitialStars; i += 1) {
      spawnPixelStar(now, (i / targetInitialStars) * 1800);
    }

    // Deterministic static stars for reduced-motion / snapshot baseline
    const savedCounter = spawnCounter;
    spawnCounter = 1337;
    const candidates: PixelStar[] = [];
    for (let i = 0; i < 4; i += 1) {
      const archetype = STAR_ARCHETYPES[i % STAR_ARCHETYPES.length];
      for (let attempt = 0; attempt < 40; attempt += 1) {
        const col = Math.floor(nextPseudoRandom() * grid.columns);
        const row = Math.floor(nextPseudoRandom() * grid.rows);
        if (isEligibleStarPosition(grid, col, row, archetype, protectedZone, candidates)) {
          candidates.push({
            column: col,
            row,
            archetype,
            startTime: 0,
            duration: 1000,
            peakOpacity: 0.85,
            coreColorIndex: (i + 1) % 5,
            armColorIndex: (i + 2) % 5,
          });
          break;
        }
      }
    }
    staticReducedMotionStars = candidates;
    spawnCounter = savedCounter;

    nextPulseSpawnTime = now + 180;
    nextStarSpawnTime = now + 620;
  };

  /**
   * Renders background single-pixel electronic signals, multi-cell pixel-art stars,
   * and the grid-locked cursor trail.
   */
  const drawBackgroundEcosystem = (time: number, reducedMotion: boolean) => {
    const pulseDotSize = Number((grid.activeDotSize * 0.78).toFixed(2));
    const smallPulseDotSize = Number((grid.activeDotSize * 0.58).toFixed(2));
    const starCenterDotSize = grid.activeDotSize;
    const starArmDotSize = Number((grid.activeDotSize * 0.84).toFixed(2));
    const starTipDotSize = Number((grid.activeDotSize * 0.68).toFixed(2));

    // 1. Harmonic background signals
    for (const cell of ambientCells) {
      if (titleCoordinates.has(coordinateKey(cell.column, cell.row))) continue;
      const wave = (Math.sin(time * cell.tempo + cell.phase) + 1) / 2;
      const breath = wave ** 5;
      if (breath < 0.025) continue;
      renderGridCell(
        context,
        grid,
        cell.column,
        cell.row,
        smallPulseDotSize,
        SIGNAL_ACCENT_COLORS[cell.colorIndex],
        0.10 + breath * 0.62,
      );
    }

    if (reducedMotion) {
      // Render calm static stars in reduced motion
      for (const star of staticReducedMotionStars) {
        for (const offset of star.archetype.cells) {
          const tierAlpha = evaluateStarTierOpacity(offset.tier, 0.46) * star.peakOpacity;
          const dotSize = offset.tier === 0
            ? starCenterDotSize
            : offset.tier === 1
              ? starArmDotSize
              : starTipDotSize;
          const color = offset.tier === 0
            ? SIGNAL_ACCENT_COLORS[star.coreColorIndex]
            : SIGNAL_ACCENT_COLORS[star.armColorIndex];
          renderGridCell(
            context,
            grid,
            star.column + offset.dc,
            star.row + offset.dr,
            dotSize,
            color,
            tierAlpha,
          );
        }
      }
      context.globalAlpha = 1;
      return;
    }

    // 2. Event-driven random individual pixel illuminations
    if (time >= nextPulseSpawnTime) {
      const maxPulses = grid.width < 600 ? 14 : 22;
      if (activePulses.length < maxPulses) {
        spawnElectronicPulse(time, 0);
      }
      nextPulseSpawnTime = time + 165 + nextPseudoRandom() * 285;
    }

    const survivingPulses: ElectronicPulse[] = [];
    for (const pulse of activePulses) {
      const elapsed = time - pulse.startTime;
      if (elapsed >= pulse.duration) continue;
      survivingPulses.push(pulse);
      if (elapsed < 0) continue;

      const progress = elapsed / pulse.duration;
      // Gentle electronic fade-in (first 34%), slow smooth decay (remaining 66%)
      const envelope = progress < 0.34
        ? progress / 0.34
        : Math.pow(1 - (progress - 0.34) / 0.66, 1.35);

      renderGridCell(
        context,
        grid,
        pulse.column,
        pulse.row,
        pulse.useMediumDot ? pulseDotSize : smallPulseDotSize,
        SIGNAL_ACCENT_COLORS[pulse.colorIndex],
        envelope * pulse.peakOpacity,
      );
    }
    activePulses = survivingPulses;

    // 3. Multi-cell animated pixel-art stars
    if (time >= nextStarSpawnTime) {
      const maxStars = grid.width < 600 ? 3 : 5;
      if (activeStars.length < maxStars) {
        spawnPixelStar(time, 0);
      }
      nextStarSpawnTime = time + 580 + nextPseudoRandom() * 920;
    }

    const survivingStars: PixelStar[] = [];
    for (const star of activeStars) {
      const elapsed = time - star.startTime;
      if (elapsed >= star.duration) continue;
      survivingStars.push(star);
      if (elapsed < 0) continue;

      const progress = elapsed / star.duration;
      for (const offset of star.archetype.cells) {
        const tierOpacity = evaluateStarTierOpacity(offset.tier, progress);
        if (tierOpacity <= 0.01) continue;
        const dotSize = offset.tier === 0
          ? starCenterDotSize
          : offset.tier === 1
            ? starArmDotSize
            : starTipDotSize;
        const color = offset.tier === 0
          ? SIGNAL_ACCENT_COLORS[star.coreColorIndex]
          : SIGNAL_ACCENT_COLORS[star.armColorIndex];
        renderGridCell(
          context,
          grid,
          star.column + offset.dc,
          star.row + offset.dr,
          dotSize,
          color,
          tierOpacity * star.peakOpacity,
        );
      }
    }
    activeStars = survivingStars;

    // 4. Grid-locked iridescent cursor trail
    for (const [key, trailCell] of cursorTrail.entries()) {
      const elapsed = time - trailCell.startTime;
      if (elapsed >= trailCell.duration) {
        cursorTrail.delete(key);
        continue;
      }
      if (elapsed < 0) continue;

      const progress = elapsed / trailCell.duration;
      const fade = Math.pow(1 - progress, 1.55);
      const alpha = trailCell.peakOpacity * fade;
      if (alpha <= 0.015) continue;

      // Shift color along the trail from bright Cyan/Electric Blue head -> Deep Violet/Magenta tail
      const shiftedColorIndex = progress < 0.34
        ? trailCell.colorIndex
        : progress < 0.70
          ? (trailCell.colorIndex + 3) % SIGNAL_ACCENT_COLORS.length
          : 5; // Subtle Magenta tail
      const dotSize = trailCell.isCore
        ? (progress < 0.38 ? starCenterDotSize : starArmDotSize)
        : starTipDotSize;

      renderGridCell(
        context,
        grid,
        trailCell.column,
        trailCell.row,
        dotSize,
        SIGNAL_ACCENT_COLORS[shiftedColorIndex],
        alpha,
      );
    }

    context.globalAlpha = 1;
  };

  /**
   * Renders Phase 1 & Phase 2 initial signal horizon rails and carrier scan wavefront.
   * Ensures high-contrast grid-locked electronic activity from t = 0ms before letters construct.
   */
  const drawRevealSignalChoreography = (elapsedSinceMount: number) => {
    if (elapsedSinceMount >= 1750) return;

    const centerRow = Math.floor(grid.rows / 2);
    const centerCol = Math.floor(grid.columns / 2);
    const spanRows = Math.max(10, Math.min(18, Math.floor(grid.rows * 0.14)));
    const topRailRow = Math.max(2, centerRow - spanRows);
    const bottomRailRow = Math.min(grid.rows - 3, centerRow + spanRows);

    // Phase 1 (0ms - 680ms): Horizon calibration ticks & converging signal nodes
    if (elapsedSinceMount < 680) {
      const p1 = elapsedSinceMount / 680;
      const railFade = p1 < 0.35 ? 0.88 + p1 * 0.32 : Math.max(0, 1 - (p1 - 0.35) / 0.65);
      const halfSpanCols = Math.floor(grid.columns * (0.40 - p1 * 0.14));

      for (let dc = -halfSpanCols; dc <= halfSpanCols; dc += 4) {
        const col = centerCol + dc;
        if (col < 1 || col >= grid.columns - 1) continue;
        const pulse = ((Math.abs(dc) + Math.floor(elapsedSinceMount / 30)) % 8 === 0) ? 0.94 : 0.45;
        const color = (dc & 4) === 0 ? 'rgb(12, 192, 232)' : 'rgb(34, 102, 242)';
        renderGridCell(context, grid, col, topRailRow, grid.activeDotSize * 0.85, color, railFade * pulse);
        renderGridCell(context, grid, col, bottomRailRow, grid.activeDotSize * 0.85, color, railFade * pulse);
      }
    }

    // Phase 2 & 3 (160ms - 1,620ms): Carrier scan head sweeping left-to-right across the word band
    if (elapsedSinceMount >= 160 && elapsedSinceMount < 1620) {
      const scanNorm = (elapsedSinceMount - 160) / 1380;
      const scanCol = Math.round((0.12 + scanNorm * 0.78) * grid.columns);
      const scanFade = Math.sin(Math.min(1, scanNorm) * Math.PI);

      for (let r = topRailRow - 2; r <= bottomRailRow + 2; r += 1) {
        if (r < 0 || r >= grid.rows) continue;
        for (let dc = -1; dc <= 1; dc += 1) {
          const c = scanCol + dc;
          if (c < 0 || c >= grid.columns || titleCoordinates.has(coordinateKey(c, r))) continue;
          const isHead = dc === 0;
          const color = isHead ? 'rgb(12, 192, 232)' : 'rgb(112, 46, 228)';
          const alpha = (isHead ? 0.64 : 0.30) * scanFade;
          renderGridCell(context, grid, c, r, grid.activeDotSize * 0.62, color, alpha);
        }
      }
    }
  };

  const render = (time = performance.now()) => {
    const ratio = Math.min(devicePixelRatio || 1, 2);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, grid.width, grid.height);
    context.drawImage(matrixLayer, 0, 0, grid.width, grid.height);

    const reducedMotion = motionPreference.matches;
    const effectiveTime = reducedMotion ? 0 : time;
    const elapsedSinceMount = reducedMotion ? 10_000 : Math.max(0, effectiveTime - mountStartTime);

    drawBackgroundEcosystem(effectiveTime, reducedMotion);

    if (!reducedMotion) {
      drawRevealSignalChoreography(elapsedSinceMount);
    }

    // Concentric click/tap grid wave (purely cell-state activation)
    const rippleElapsed = !reducedMotion && rippleStartTime > 0 ? effectiveTime - rippleStartTime : -1;
    const rippleActive = rippleElapsed >= 0 && rippleElapsed < 1100;
    const rippleRadiusCells = rippleActive ? (rippleElapsed / 1100) * (grid.columns * 0.45) : -1;

    if (interactionMix < 0.002 || reducedMotion) {
      for (const cell of titleCells) {
        const reveal = evaluateRevealWave(cell, elapsedSinceMount, reducedMotion);

        // Render temporary quantized signal interference cell during Phase 2 decoding
        if (reveal.interferenceOpacity > 0.02) {
          const intCol = cell.column + cell.interferenceColOffset;
          const intRow = cell.row + cell.interferenceRowOffset;
          if (
            intCol >= 0 &&
            intCol < grid.columns &&
            intRow >= 0 &&
            intRow < grid.rows &&
            !titleCoordinates.has(coordinateKey(intCol, intRow))
          ) {
            const intColor = (cell.seed & 1) === 0 ? 'rgb(12, 192, 232)' : 'rgb(34, 102, 242)';
            renderGridCell(
              context,
              grid,
              intCol,
              intRow,
              grid.activeDotSize * 0.85,
              intColor,
              reveal.interferenceOpacity,
            );
          }
        }

        if (reveal.brightness <= 0.005) continue;

        let rippleBoost = 0;
        if (rippleActive) {
          const distCells = Math.hypot(cell.column - rippleGridColumn, cell.row - rippleGridRow);
          const band = Math.abs(distCells - rippleRadiusCells);
          if (band < 4.5) {
            rippleBoost = (1 - band / 4.5) * (1 - rippleElapsed / 1100);
          }
        }

        const idleWave = reducedMotion
          ? 1
          : 0.95 + 0.05 * Math.sin(effectiveTime * 0.0015 + cell.column * 0.12 - cell.row * 0.09);
        const color = computeIridescentCellColor(
          grid,
          cell,
          effectiveTime,
          inkRgb,
          rippleBoost * 0.75,
          reveal.crest,
        );
        renderGridCell(
          context,
          grid,
          cell.column,
          cell.row,
          grid.activeDotSize,
          color,
          reveal.brightness * idleWave,
        );
      }
      context.globalAlpha = 1;
      return;
    }

    const cursorGrid = screenToGridCoordinates(grid, pointerX, pointerY);
    const radiusInPixels = Math.max(115, Math.min(180, grid.width * 0.135));
    const radiusInCells = radiusInPixels / grid.cellSize;
    const illuminatedTargets = new Set<string>();

    for (const cell of titleCells) {
      const reveal = evaluateRevealWave(cell, elapsedSinceMount, false);

      if (reveal.interferenceOpacity > 0.02) {
        const intCol = cell.column + cell.interferenceColOffset;
        const intRow = cell.row + cell.interferenceRowOffset;
        if (
          intCol >= 0 &&
          intCol < grid.columns &&
          intRow >= 0 &&
          intRow < grid.rows &&
          !titleCoordinates.has(coordinateKey(intCol, intRow))
        ) {
          const intColor = (cell.seed & 1) === 0 ? 'rgb(12, 192, 232)' : 'rgb(34, 102, 242)';
          renderGridCell(
            context,
            grid,
            intCol,
            intRow,
            grid.activeDotSize * 0.85,
            intColor,
            reveal.interferenceOpacity,
          );
        }
      }

      // If pointer interacts during initial reveal, ensure cells within cursor radius can respond immediately
      const effectiveBrightness = Math.max(reveal.brightness, interactionMix * 0.92);
      if (effectiveBrightness <= 0.005) continue;

      const distanceCells = Math.hypot(
        cell.column - cursorGrid.column,
        cell.row - cursorGrid.row,
      );

      if (distanceCells >= radiusInCells) {
        if (reveal.brightness <= 0.005) continue;
        const color = computeIridescentCellColor(grid, cell, effectiveTime, inkRgb, 0, reveal.crest);
        renderGridCell(context, grid, cell.column, cell.row, grid.activeDotSize, color, reveal.brightness);
        continue;
      }

      const influence = Math.max(0, 1 - distanceCells / radiusInCells);
      const scrambleStrength = interactionMix * influence;
      const color = computeIridescentCellColor(
        grid,
        cell,
        effectiveTime,
        inkRgb,
        influence * interactionMix,
        reveal.crest,
      );

      const primaryOpacity = effectiveBrightness * Math.max(0.24, 1 - scrambleStrength * 0.8);
      renderGridCell(
        context,
        grid,
        cell.column,
        cell.row,
        grid.activeDotSize,
        color,
        primaryOpacity,
      );

      const seed = cell.seed;
      const angle = ((seed % 2048) / 2048) * Math.PI * 2;
      const distanceInCells = 2 + Math.floor(((seed >>> 11) % 9) * (0.35 + influence));
      let targetColumn = cell.column + Math.round(Math.cos(angle) * distanceInCells * interactionMix);
      let targetRow = cell.row + Math.round(Math.sin(angle) * distanceInCells * interactionMix);

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const targetKey = coordinateKey(targetColumn, targetRow);
        const available =
          targetColumn >= 0 &&
          targetColumn < grid.columns &&
          targetRow >= 0 &&
          targetRow < grid.rows &&
          !titleCoordinates.has(targetKey) &&
          !illuminatedTargets.has(targetKey);

        if (available) {
          illuminatedTargets.add(targetKey);
          const flutterWave = (Math.sin(effectiveTime * (0.0012 + (seed % 7) * 0.00008) + angle) + 1) / 2;
          const flutter = seed % 5 === 0 ? 0.65 + flutterWave * 0.35 : 1;
          renderGridCell(
            context,
            grid,
            targetColumn,
            targetRow,
            grid.activeDotSize,
            color,
            Math.min(1, scrambleStrength * 1.08 * flutter),
          );
          break;
        }
        targetColumn += ((seed >>> (attempt % 16)) & 1) === 0 ? 1 : -1;
        targetRow += ((seed >>> ((attempt + 5) % 16)) & 1) === 0 ? -1 : 1;
      }
    }
    context.globalAlpha = 1;
  };

  const startAnimation = () => {
    if (animationFrame || !heroVisible || document.hidden || motionPreference.matches) return;
    animationFrame = requestAnimationFrame(animate);
  };

  function animate(time: number) {
    animationFrame = 0;
    const elapsed = previousFrameTime ? Math.min(48, time - previousFrameTime) : 16;
    previousFrameTime = time;
    const ease = 1 - Math.exp(-elapsed / 105);
    pointerX += (pointerTargetX - pointerX) * ease;
    pointerY += (pointerTargetY - pointerY) * ease;
    interactionMix += ((pointerActive ? 1 : 0) - interactionMix) * ease;
    if (!pointerActive && interactionMix < 0.002) interactionMix = 0;
    render(time);
    startAnimation();
  }

  const buildMatrix = () => {
    const bounds = root.getBoundingClientRect();
    const width = Math.max(1, Math.round(bounds.width));
    const height = Math.max(1, Math.round(bounds.height));
    const ratio = Math.min(devicePixelRatio || 1, 2);

    grid = createGridGeometry(width, height);
    titleCanvas.width = Math.round(grid.width * ratio);
    titleCanvas.height = Math.round(grid.height * ratio);

    // Expose authoritative grid geometry attributes for automated invariant verification
    titleCanvas.dataset.gridOriginX = String(grid.originX);
    titleCanvas.dataset.gridOriginY = String(grid.originY);
    titleCanvas.dataset.gridCellSize = String(grid.cellSize);
    titleCanvas.dataset.gridColumns = String(grid.columns);
    titleCanvas.dataset.gridRows = String(grid.rows);
    titleCanvas.dataset.gridInactiveDotSize = String(grid.inactiveDotSize);
    titleCanvas.dataset.gridActiveDotSize = String(grid.activeDotSize);

    paintStaticMatrixLayer();

    const typography = buildTypographyCells(grid);
    titleCells = typography.cells;
    titleCoordinates = new Set(typography.coordinateSet);
    protectedZone = new Set(typography.protectedZone);

    const now = performance.now();
    if (!mountStartTime) {
      mountStartTime = now;
    }
    seedInitialEcosystem(motionPreference.matches ? 0 : now);

    render(motionPreference.matches ? 0 : now);
    titleCanvas.dataset.renderState = 'ready';
    root.dataset.pixelReady = '';
  };

  const updatePointer = (event: PointerEvent) => {
    if (motionPreference.matches) return;
    const bounds = root.getBoundingClientRect();
    pointerTargetX = event.clientX - bounds.left;
    pointerTargetY = event.clientY - bounds.top;
    if (!pointerActive && interactionMix === 0) {
      pointerX = pointerTargetX;
      pointerY = pointerTargetY;
    }
    pointerActive = true;
    recordCursorTrail(pointerTargetX, pointerTargetY, performance.now());
    startAnimation();
  };

  const handlePointerDown = (event: PointerEvent) => {
    updatePointer(event);
    if (motionPreference.matches) return;
    const bounds = root.getBoundingClientRect();
    const clickX = event.clientX - bounds.left;
    const clickY = event.clientY - bounds.top;
    const gridPos = screenToGridCoordinates(grid, clickX, clickY);
    const now = performance.now();
    rippleGridColumn = gridPos.column;
    rippleGridRow = gridPos.row;
    rippleStartTime = now;

    // Spawn a pixel-art star when clicking in an empty area outside the text
    const clickCol = Math.round(gridPos.column);
    const clickRow = Math.round(gridPos.row);
    if (spawnPixelStarAt(clickCol, clickRow, now)) {
      const currentCount = Number(titleCanvas.dataset.userSpawnedStars || '0');
      titleCanvas.dataset.userSpawnedStars = String(currentCount + 1);
      titleCanvas.dataset.lastUserStarCoord = `${clickCol},${clickRow}`;
    }

    startAnimation();
  };

  const deactivatePointer = () => {
    if (!pointerActive) return;
    pointerActive = false;
    lastTrailCol = null;
    lastTrailRow = null;
    startAnimation();
  };

  const updateMotion = () => {
    pointerActive = false;
    interactionMix = 0;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrameTime = 0;
    seedInitialEcosystem(0);
    render(0);
    startAnimation();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousFrameTime = 0;
      return;
    }
    startAnimation();
  };

  await document.fonts.ready;
  buildMatrix();
  startAnimation();

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(buildMatrix);
  });
  resizeObserver.observe(root);

  const visibilityObserver = new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    if (!heroVisible) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
      previousFrameTime = 0;
      return;
    }
    startAnimation();
  });
  visibilityObserver.observe(root);

  root.addEventListener('pointermove', updatePointer, { passive: true });
  root.addEventListener('pointerdown', handlePointerDown, { passive: true });
  root.addEventListener('pointerleave', deactivatePointer);
  root.addEventListener('pointerup', deactivatePointer);
  motionPreference.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  return () => {
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(resizeFrame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    root.removeEventListener('pointermove', updatePointer);
    root.removeEventListener('pointerdown', handlePointerDown);
    root.removeEventListener('pointerleave', deactivatePointer);
    root.removeEventListener('pointerup', deactivatePointer);
    motionPreference.removeEventListener('change', updateMotion);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
