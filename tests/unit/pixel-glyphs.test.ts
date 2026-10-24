import { describe, expect, it } from 'vitest';
import * as pixelTitle from '../../src/scripts/pixel-title';

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
});
