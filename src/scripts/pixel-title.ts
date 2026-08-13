type TitlePixel = {
  x: number;
  y: number;
  column: number;
  row: number;
  color: string;
};

type AmbientPixel = {
  x: number;
  y: number;
  color: string;
  phase: number;
  tempo: number;
};

const TITLE = '111iridescence.';

const hashPixel = (column: number, row: number) => (
  Math.imul(column + 17, 73_856_093) ^ Math.imul(row + 31, 19_349_663)
) >>> 0;

export async function mountPixelTitle(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>('[data-pixel-canvas]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return () => {};

  const titleCanvas = canvas;
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const palette = getComputedStyle(root);
  const colors = [
    palette.getPropertyValue('--ink').trim(),
    palette.getPropertyValue('--ink').trim(),
    palette.getPropertyValue('--ink').trim(),
    palette.getPropertyValue('--blue').trim(),
    palette.getPropertyValue('--violet').trim(),
    palette.getPropertyValue('--coral').trim(),
  ];
  const matrixColor = palette.getPropertyValue('--ink').trim();
  const matrixAccent = palette.getPropertyValue('--blue').trim();
  const matrixLayer = document.createElement('canvas');
  const matrixContext = matrixLayer.getContext('2d');
  if (!matrixContext) return () => {};

  let width = 1;
  let height = 1;
  let gap = 7;
  let matrixPixelSize = 2;
  let titlePixelSize = 4;
  let titlePixels: TitlePixel[] = [];
  let ambientPixels: AmbientPixel[] = [];
  let titleCoordinates = new Set<string>();
  let pointerX = -10_000;
  let pointerY = -10_000;
  let pointerTargetX = -10_000;
  let pointerTargetY = -10_000;
  let interactionMix = 0;
  let pointerActive = false;
  let resizeFrame = 0;
  let animationFrame = 0;
  let previousFrameTime = 0;
  let heroVisible = true;

  const coordinateKey = (column: number, row: number) => `${column}:${row}`;

  const paintMatrix = () => {
    matrixLayer.width = width;
    matrixLayer.height = height;
    matrixContext.clearRect(0, 0, width, height);
    matrixPixelSize = Math.max(1.25, gap * 0.24);
    const nextAmbientPixels: AmbientPixel[] = [];

    for (let row = 0, y = gap / 2; y < height; row += 1, y += gap) {
      for (let column = 0, x = gap / 2; x < width; column += 1, x += gap) {
        const seed = hashPixel(column, row);
        const accent = seed % 29 === 0;
        matrixContext.globalAlpha = accent ? 0.16 : 0.105;
        matrixContext.fillStyle = accent ? matrixAccent : matrixColor;
        matrixContext.fillRect(
          Math.round(x - matrixPixelSize / 2),
          Math.round(y - matrixPixelSize / 2),
          matrixPixelSize,
          matrixPixelSize,
        );

        if (seed % 389 === 0) {
          nextAmbientPixels.push({
            x,
            y,
            color: colors[(seed >>> 8) % colors.length],
            phase: ((seed >>> 5) % 1024) / 1024 * Math.PI * 2,
            tempo: 0.00042 + ((seed >>> 18) % 11) * 0.000035,
          });
        }
      }
    }
    matrixContext.globalAlpha = 1;
    ambientPixels = nextAmbientPixels;
  };

  const drawTitlePixel = (pixel: TitlePixel, x = pixel.x, y = pixel.y, opacity = 1) => {
    context.globalAlpha = Math.max(0, Math.min(1, opacity));
    context.fillStyle = pixel.color;
    context.fillRect(
      Math.round(x - titlePixelSize / 2),
      Math.round(y - titlePixelSize / 2),
      titlePixelSize,
      titlePixelSize,
    );
    context.globalAlpha = 1;
  };

  const drawAmbientSignal = (time: number) => {
    for (const pixel of ambientPixels) {
      const wave = (Math.sin(time * pixel.tempo + pixel.phase) + 1) / 2;
      const breath = wave ** 4;
      if (breath < 0.018) continue;
      const size = matrixPixelSize * (1.1 + breath * 0.9);
      context.globalAlpha = 0.04 + breath * 0.52;
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
    context.drawImage(matrixLayer, 0, 0, width, height);
    drawAmbientSignal(time);

    if (interactionMix < 0.002 || motionPreference.matches) {
      for (const pixel of titlePixels) drawTitlePixel(pixel);
      return;
    }

    const radius = Math.max(120, Math.min(190, width * 0.145));
    const illuminatedTargets = new Set<string>();

    for (const pixel of titlePixels) {
      const offsetX = pixel.x - pointerX;
      const offsetY = pixel.y - pointerY;
      const distance = Math.hypot(offsetX, offsetY);
      if (distance >= radius) {
        drawTitlePixel(pixel);
        continue;
      }

      const influence = 1 - distance / radius;
      const scrambleStrength = interactionMix * influence;
      const seed = hashPixel(pixel.column, pixel.row);
      const angle = ((seed % 2048) / 2048) * Math.PI * 2;
      const distanceInCells = 2 + Math.floor(((seed >>> 11) % 14) * (0.35 + influence));
      let targetColumn = pixel.column + Math.round(Math.cos(angle) * distanceInCells * interactionMix);
      let targetRow = pixel.row + Math.round(Math.sin(angle) * distanceInCells * interactionMix);

      drawTitlePixel(pixel, pixel.x, pixel.y, 1 - scrambleStrength);

      for (let attempt = 0; attempt < 8; attempt += 1) {
        const targetKey = coordinateKey(targetColumn, targetRow);
        const targetX = targetColumn * gap + gap / 2;
        const targetY = targetRow * gap + gap / 2;
        const available = targetX >= gap / 2
          && targetX < width - gap / 2
          && targetY >= gap / 2
          && targetY < height - gap / 2
          && !titleCoordinates.has(targetKey)
          && !illuminatedTargets.has(targetKey);
        if (available) {
          illuminatedTargets.add(targetKey);
          const flutterWave = (Math.sin(time * (0.0011 + (seed % 7) * 0.00007) + angle) + 1) / 2;
          const flutter = seed % 5 === 0 ? 0.62 + flutterWave * 0.38 : 1;
          drawTitlePixel(pixel, targetX, targetY, scrambleStrength * flutter);
          break;
        }
        targetColumn += ((seed >>> (attempt % 16)) & 1) === 0 ? 1 : -1;
        targetRow += ((seed >>> ((attempt + 5) % 16)) & 1) === 0 ? -1 : 1;
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
    width = Math.max(1, Math.round(bounds.width));
    height = Math.max(1, Math.round(bounds.height));
    const ratio = Math.min(devicePixelRatio || 1, 2);
    titleCanvas.width = Math.round(width * ratio);
    titleCanvas.height = Math.round(height * ratio);
    gap = width < 560 ? 6 : width < 960 ? 7 : 8;
    titlePixelSize = Math.max(3, gap * 0.62);
    paintMatrix();

    const sample = document.createElement('canvas');
    sample.width = width;
    sample.height = height;
    const sampleContext = sample.getContext('2d', { willReadFrequently: true });
    if (!sampleContext) return;

    const lines = width < 560 ? ['111', 'iridescence.'] : [TITLE];
    let fontSize = height * (lines.length > 1 ? 0.18 : 0.24);
    sampleContext.font = `700 ${fontSize}px "0xProto NF", monospace`;
    const measuredWidth = Math.max(...lines.map((line) => sampleContext.measureText(line).width));
    if (measuredWidth > width * 0.9) fontSize *= (width * 0.9) / measuredWidth;

    sampleContext.font = `700 ${fontSize}px "0xProto NF", monospace`;
    sampleContext.fillStyle = '#000';
    sampleContext.textAlign = 'center';
    sampleContext.textBaseline = 'middle';
    const lineHeight = fontSize * (lines.length > 1 ? 1.14 : 0.88);
    const firstLineY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      sampleContext.fillText(line, width / 2, firstLineY + index * lineHeight);
    });

    const sampledPixels = sampleContext.getImageData(0, 0, width, height).data;
    const nextTitlePixels: TitlePixel[] = [];
    const nextCoordinates = new Set<string>();

    for (let row = 0, y = gap / 2; y < height; row += 1, y += gap) {
      for (let column = 0, x = gap / 2; x < width; column += 1, x += gap) {
        const alpha = sampledPixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3];
        if (alpha < 96) continue;
        const colorIndex = hashPixel(column, row) % colors.length;
        nextTitlePixels.push({ x, y, column, row, color: colors[colorIndex] });
        nextCoordinates.add(coordinateKey(column, row));
      }
    }

    titlePixels = nextTitlePixels;
    titleCoordinates = nextCoordinates;
    render(motionPreference.matches ? 0 : performance.now());
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
    startAnimation();
  };

  const deactivatePointer = () => {
    if (!pointerActive) return;
    pointerActive = false;
    startAnimation();
  };

  const updateMotion = () => {
    pointerActive = false;
    interactionMix = 0;
    cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    previousFrameTime = 0;
    render(0);
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
  root.addEventListener('pointerdown', updatePointer, { passive: true });
  root.addEventListener('pointerleave', deactivatePointer);
  root.addEventListener('pointerup', deactivatePointer);
  motionPreference.addEventListener('change', updateMotion);

  return () => {
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(resizeFrame);
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    root.removeEventListener('pointermove', updatePointer);
    root.removeEventListener('pointerdown', updatePointer);
    root.removeEventListener('pointerleave', deactivatePointer);
    root.removeEventListener('pointerup', deactivatePointer);
    motionPreference.removeEventListener('change', updateMotion);
  };
}
