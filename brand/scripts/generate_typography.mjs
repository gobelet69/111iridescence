import opentype from 'opentype.js';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Load a font using opentype.js
 */
export function loadFont(fontPath) {
  const buf = fs.readFileSync(fontPath);
  return opentype.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
}

/**
 * Convert string to pure SVG path data with manual tracking and kerning
 */
export function textToVectorPath(font, text, fontSize, options = {}) {
  const tracking = options.tracking || 0; // extra px between letters
  let currentX = options.startX || 0;
  const startY = options.startY || 100;
  
  const glyphPaths = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const glyph = font.charToGlyph(char);
    
    // Check kerning with previous char
    if (i > 0 && options.useKerning !== false) {
      const prevGlyph = font.charToGlyph(text[i - 1]);
      const kerning = font.getKerningValue(prevGlyph, glyph);
      currentX += (kerning * fontSize) / font.unitsPerEm;
    }

    // Specific custom letter spacing rules
    if (options.letterSpacingMap && options.letterSpacingMap[char]) {
      currentX += options.letterSpacingMap[char];
    }

    const p = glyph.getPath(currentX, startY, fontSize);
    const pathData = p.toPathData(2);
    if (pathData && pathData.trim().length > 0) {
      glyphPaths.push({
        char,
        x: currentX,
        pathData
      });

      const bbox = p.getBoundingBox();
      if (bbox.x1 < minX) minX = bbox.x1;
      if (bbox.y1 < minY) minY = bbox.y1;
      if (bbox.x2 > maxX) maxX = bbox.x2;
      if (bbox.y2 > maxY) maxY = bbox.y2;
    }

    currentX += (glyph.advanceWidth * fontSize) / font.unitsPerEm + tracking;
  }

  return {
    paths: glyphPaths,
    fullPathData: glyphPaths.map(g => g.pathData).join(' '),
    width: currentX - (options.startX || 0),
    bbox: {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    }
  };
}

// Quick verification if run directly
if (process.argv[1] === import.meta.filename) {
  const inter = loadFont(path.join(path.dirname(import.meta.filename), 'fonts/Inter.ttf'));
  const res = textToVectorPath(inter, '111iridescence', 48, { tracking: -1 });
  console.log(`Generated vector wordmark! Total length: ${res.fullPathData.length} chars, width: ${res.width.toFixed(1)}px`);
  console.log('Bounding Box:', res.bbox);
}
