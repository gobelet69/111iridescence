import { describe, expect, it } from 'vitest';
import * as pixelTitle from '../../src/scripts/pixel-title';
import {
  buildTypographyCells,
  computeIridescentCellColor,
  createGridGeometry,
  DESKTOP_GLYPH_SYSTEM,
  evaluateRevealWave,
  evaluateStarTierOpacity,
  getCellCenter,
  isEligibleStarPosition,
  MOBILE_GLYPH_SYSTEM,
  renderGridCell,
  screenToGridCoordinates,
  STAR_ARCHETYPES,
  TABLET_GLYPH_SYSTEM,
  verifyGridAlignment,
} from '../../src/scripts/pixel-title';

describe('pixel title glyph geometry', () => {
  it('reuses the exact normalized mask for every occurrence of a character', () => {
    const composeGlyphLine = Reflect.get(pixelTitle, 'composeGlyphLine');
    expect(composeGlyphLine).toBeTypeOf('function');
    if (typeof composeGlyphLine !== 'function') return;

    const iMask = [
      { column: 1, row: 0 },
      { column: 1, row: 2 },
      { column: 1, row: 3 },
      { column: 0, row: 4 },
      { column: 1, row: 4 },
      { column: 2, row: 4 },
    ];
    const masks = new Map([
      ['i', iMask],
      ['.', [{ column: 1, row: 4 }]],
    ]);

    const pixels = composeGlyphLine('ii.i', masks, {
      startColumn: 8,
      topRow: 12,
      advanceColumns: 4,
    });

    const normalizedMask = (characterIndex: number) => pixels
      .filter((pixel: { characterIndex: number }) => pixel.characterIndex === characterIndex)
      .map((pixel: { column: number; row: number }) => ({
        column: pixel.column - 8 - characterIndex * 4,
        row: pixel.row - 12,
      }));

    expect(normalizedMask(0)).toEqual(iMask);
    expect(normalizedMask(1)).toEqual(iMask);
    expect(normalizedMask(3)).toEqual(iMask);
  });

  it('enforces the authoritative grid coordinate invariant x = originX + column * cellSize, y = originY + row * cellSize', () => {
    for (const [width, height] of [
      [1440, 768],
      [1280, 724],
      [768, 768],
      [390, 672],
      [320, 672],
    ]) {
      const grid = createGridGeometry(width, height);
      expect(grid.cellSize).toBeGreaterThanOrEqual(4);
      expect(grid.originX).toBe(grid.cellSize / 2);
      expect(grid.originY).toBe(grid.cellSize / 2);

      for (let row = 0; row < grid.rows; row += 7) {
        for (let column = 0; column < grid.columns; column += 11) {
          const center = getCellCenter(grid, column, row);
          expect(center.x).toBe(grid.originX + column * grid.cellSize);
          expect(center.y).toBe(grid.originY + row * grid.cellSize);
          expect(verifyGridAlignment(grid, column, row, center.x, center.y)).toBe(true);

          // Off-grid displacement or fractional grid indices must be rejected
          expect(verifyGridAlignment(grid, column, row, center.x + 0.5, center.y)).toBe(false);
          expect(verifyGridAlignment(grid, column + 0.25, row, center.x, center.y)).toBe(false);

          const roundTrip = screenToGridCoordinates(grid, center.x, center.y);
          expect(roundTrip.column).toBeCloseTo(column, 6);
          expect(roundTrip.row).toBeCloseTo(row, 6);
        }
      }
    }
  });

  it('constructs "111iridescence." exclusively from integer grid cells across desktop, tablet, and mobile viewports', () => {
    for (const [width, height] of [
      [1440, 768],
      [1280, 724],
      [768, 768],
      [390, 672],
      [320, 672],
    ]) {
      const grid = createGridGeometry(width, height);
      const { cells } = buildTypographyCells(grid);
      expect(cells.length).toBeGreaterThan(200);

      for (const cell of cells) {
        expect(Number.isInteger(cell.column)).toBe(true);
        expect(Number.isInteger(cell.row)).toBe(true);
        expect(cell.column).toBeGreaterThanOrEqual(0);
        expect(cell.column).toBeLessThan(grid.columns);
        expect(cell.row).toBeGreaterThanOrEqual(0);
        expect(cell.row).toBeLessThan(grid.rows);

        const center = getCellCenter(grid, cell.column, cell.row);
        expect(verifyGridAlignment(grid, cell.column, cell.row, center.x, center.y)).toBe(true);
      }

      // Repeated characters ('1', 'i', 'e', 'c') must produce identical normalized relative bitmaps
      for (const targetChar of ['1', 'i', 'e', 'c']) {
        const charIndices = [...new Set(
          cells.filter((c) => c.character === targetChar).map((c) => c.characterIndex),
        )];
        expect(charIndices.length).toBeGreaterThanOrEqual(2);

        const normalizeOccurrence = (idx: number) => {
          const group = cells.filter((c) => c.characterIndex === idx);
          const minCol = Math.min(...group.map((c) => c.column));
          const minRow = Math.min(...group.map((c) => c.row));
          return group
            .map((c) => `${c.column - minCol}:${c.row - minRow}`)
            .sort();
        };

        const baseline = normalizeOccurrence(charIndices[0]);
        for (const idx of charIndices.slice(1)) {
          expect(normalizeOccurrence(idx)).toEqual(baseline);
        }
      }
    }
  });

  it('preserves open internal counters in rounded glyphs (d, e, s, c) across all three optical bitmap masters', () => {
    for (const system of [DESKTOP_GLYPH_SYSTEM, TABLET_GLYPH_SYSTEM, MOBILE_GLYPH_SYSTEM]) {
      for (const roundedChar of ['d', 'e', 's', 'c']) {
        const mask = system.glyphs[roundedChar];
        expect(mask).toBeDefined();
        const activeSet = new Set(mask.map(([c, r]) => `${c}:${r}`));
        const width = system.widths[roundedChar];

        // Count interior inactive cells bounded vertically between active cells in the same column
        let enclosedCounterCells = 0;
        for (let c = 1; c < width - 1; c += 1) {
          const activeRowsInCol = mask.filter(([col]) => col === c).map(([, row]) => row);
          if (activeRowsInCol.length >= 2) {
            const minR = Math.min(...activeRowsInCol);
            const maxR = Math.max(...activeRowsInCol);
            for (let r = minR + 1; r < maxR; r += 1) {
              if (!activeSet.has(`${c}:${r}`)) {
                enclosedCounterCells += 1;
              }
            }
          }
        }
        expect(enclosedCounterCells).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('renders every square pixel strictly centered on its authoritative grid coordinate via renderGridCell', () => {
    const grid = createGridGeometry(1440, 768);
    const { cells } = buildTypographyCells(grid);
    const drawnRects: { rx: number; ry: number; rw: number; rh: number; alpha: number; fill: string }[] = [];

    const mockState = {
      globalAlpha: 1,
      fillStyle: '#000',
      fillRect(rx: number, ry: number, rw: number, rh: number) {
        drawnRects.push({
          rx,
          ry,
          rw,
          rh,
          alpha: mockState.globalAlpha,
          fill: String(mockState.fillStyle),
        });
      },
    };
    const mockCtx = mockState as unknown as CanvasRenderingContext2D;

    for (const cell of cells) {
      const reveal = evaluateRevealWave(cell, 2500, false);
      const color = computeIridescentCellColor(
        grid,
        cell,
        2500,
        { r: 22, g: 16, b: 29 },
        0.25,
        reveal.crest,
      );
      renderGridCell(mockCtx, grid, cell.column, cell.row, grid.activeDotSize, color, reveal.brightness);
    }

    expect(drawnRects.length).toBe(cells.length);
    for (let i = 0; i < cells.length; i += 1) {
      const cell = cells[i];
      const rect = drawnRects[i];
      expect(rect.rw).toBe(grid.activeDotSize);
      expect(rect.rh).toBe(grid.activeDotSize);
      const centerX = rect.rx + rect.rw / 2;
      const centerY = rect.ry + rect.rh / 2;
      expect(verifyGridAlignment(grid, cell.column, cell.row, centerX, centerY)).toBe(true);
      expect(rect.alpha).toBeGreaterThan(0);
      expect(rect.alpha).toBeLessThanOrEqual(1);
      expect(rect.fill).toMatch(/^rgb\(\d+, \d+, \d+\)$/);
    }
  });

  it('maintains compact retro-computing glyph height-to-width proportions and animates stars & reveal strictly on grid cells', () => {
    expect(DESKTOP_GLYPH_SYSTEM.totalRows).toBeLessThanOrEqual(11);
    const desktopXHeight = DESKTOP_GLYPH_SYSTEM.totalRows - DESKTOP_GLYPH_SYSTEM.xHeightStartRow;
    expect(desktopXHeight).toBeLessThanOrEqual(8);
    expect(desktopXHeight / DESKTOP_GLYPH_SYSTEM.widths.e).toBeLessThanOrEqual(1.0);

    // Verify all pixel-art star archetypes use integer grid offsets and 5-stage twinkle progression
    for (const archetype of STAR_ARCHETYPES) {
      for (const offset of archetype.cells) {
        expect(Number.isInteger(offset.dc)).toBe(true);
        expect(Number.isInteger(offset.dr)).toBe(true);
      }
    }
    expect(evaluateStarTierOpacity(0, 0.1)).toBeGreaterThan(0);
    expect(evaluateStarTierOpacity(1, 0.1)).toBe(0);
    expect(evaluateStarTierOpacity(1, 0.45)).toBeGreaterThan(0);
    expect(evaluateStarTierOpacity(0, 0.9)).toBeGreaterThan(0);
    expect(evaluateStarTierOpacity(1, 0.9)).toBe(0);

    // Verify stars are rejected inside the protected text exclusion zone
    const grid = createGridGeometry(1440, 768);
    const { cells, protectedZone } = buildTypographyCells(grid);
    const firstGlyphCell = cells[0];
    expect(
      isEligibleStarPosition(
        grid,
        firstGlyphCell.column,
        firstGlyphCell.row,
        STAR_ARCHETYPES[1],
        protectedZone,
        [],
      ),
    ).toBe(false);
    expect(
      isEligibleStarPosition(grid, 12, 12, STAR_ARCHETYPES[1], protectedZone, []),
    ).toBe(true);

    // Verify 5-phase reveal starts with 0% glyph brightness at t=50ms, constructs progressively, and completes by t=2500ms
    const earlyStates = cells.map((c) => evaluateRevealWave(c, 50, false));
    expect(earlyStates.every((s) => s.brightness === 0)).toBe(true);

    const midStates = cells.map((c) => evaluateRevealWave(c, 750, false));
    expect(midStates.some((s) => s.brightness > 0.8)).toBe(true);
    expect(midStates.some((s) => s.brightness === 0)).toBe(true);
    expect(midStates.some((s) => s.interferenceOpacity > 0)).toBe(true);

    const finalStates = cells.map((c) => evaluateRevealWave(c, 2500, false));
    expect(finalStates.every((s) => s.brightness === 1 && s.interferenceOpacity === 0)).toBe(true);
  });
});
