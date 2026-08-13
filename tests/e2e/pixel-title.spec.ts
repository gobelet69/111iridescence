import { expect, test } from '@playwright/test';

test('pixel title remains readable without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('111iridescence.');
  await expect(page.getByText('Développement web, outils personnels et sécurité informatique.', { exact: true })).toBeVisible();

  await context.close();
});

test('hero keeps only the quiet signal cue around the pixel title', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-pixel-hero]');
  await expect(hero).not.toContainText('surface publique · en ligne');
  await expect(hero.getByText('le signal n’est jamais fixe.', { exact: true })).toHaveText('le signal n’est jamais fixe.');
  await expect(hero).not.toContainText('survolez pour brouiller');
});

test('pointer movement visibly distorts the pixel title', async ({ page }) => {
  await page.goto('/');

  const stage = page.locator('[data-pixel-hero]');
  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');

  const initialFrame = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const bounds = await stage.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);

  await expect.poll(async () => canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL()))
    .not.toBe(initialFrame);
});

test('pixel matrix covers the complete hero surface', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-pixel-hero]');
  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');

  const [heroBounds, canvasBounds, coverage] = await Promise.all([
    hero.boundingBox(),
    canvas.boundingBox(),
    canvas.evaluate((element) => {
      const target = element as HTMLCanvasElement;
      const context = target.getContext('2d');
      if (!context) return [];
      const { data, width, height } = context.getImageData(0, 0, target.width, target.height);
      const regions = [
        [0, 0],
        [Math.floor(width * 0.8), 0],
        [0, Math.floor(height * 0.8)],
        [Math.floor(width * 0.8), Math.floor(height * 0.8)],
      ];
      return regions.map(([startX, startY]) => {
        let visible = 0;
        for (let y = startY; y < Math.min(height, startY + height * 0.2); y += 1) {
          for (let x = startX; x < Math.min(width, startX + width * 0.2); x += 1) {
            if (data[(y * width + x) * 4 + 3] > 0) visible += 1;
          }
        }
        return visible;
      });
    }),
  ]);

  expect(heroBounds).not.toBeNull();
  expect(canvasBounds).not.toBeNull();
  if (!heroBounds || !canvasBounds) return;
  expect(Math.abs(canvasBounds.width - heroBounds.width)).toBeLessThanOrEqual(1);
  expect(Math.abs(canvasBounds.height - heroBounds.height)).toBeLessThanOrEqual(1);
  expect(coverage).toHaveLength(4);
  for (const visiblePixels of coverage) expect(visiblePixels).toBeGreaterThan(100);
});

test('stationary pointer keeps the scrambled signal organically alive', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-pixel-hero]');
  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  const baseline = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const bounds = await hero.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.waitForTimeout(350);
  const scrambled = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  expect(scrambled).not.toBe(baseline);

  await page.waitForTimeout(450);
  await expect(canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).resolves.not.toBe(scrambled);
});

test('scrambled title keeps moving smoothly after the pointer stops', async ({ page }) => {
  await page.goto('/');

  const hero = page.locator('[data-pixel-hero]');
  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  const bounds = await hero.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  const brightPixels = () => canvas.evaluate((element) => {
    const target = element as HTMLCanvasElement;
    const context = target.getContext('2d');
    if (!context) return [];
    const { data } = context.getImageData(0, 0, target.width, target.height);
    const lit: number[] = [];
    for (let index = 3; index < data.length; index += 4) {
      if (data[index] >= 180) lit.push((index - 3) / 4);
    }
    return lit;
  });

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.waitForTimeout(24);
  const early = new Set(await brightPixels());
  await page.waitForTimeout(140);
  const settled = new Set(await brightPixels());
  const changed = [...early].filter((pixel) => !settled.has(pixel)).length
    + [...settled].filter((pixel) => !early.has(pixel)).length;

  expect(changed).toBeGreaterThan(200);
});

test('reduced motion keeps the rendered pixel title static', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const stage = page.locator('[data-pixel-hero]');
  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');

  const initialFrame = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const bounds = await stage.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;

  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.waitForTimeout(150);

  await expect(canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).resolves.toBe(initialFrame);
});

test('reduced motion keeps the same signal phase after a responsive rebuild', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');

  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  const initialFrame = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());

  await page.setViewportSize({ width: 1439, height: 1000 });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(150);

  await expect(canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL())).resolves.toBe(initialFrame);
});

test('mobile pixel title keeps an expressive vertical scale', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');

  const renderedHeight = await canvas.evaluate((element) => {
    const canvasElement = element as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');
    if (!context) return 0;
    const { data, width, height } = context.getImageData(0, 0, canvasElement.width, canvasElement.height);
    let first = height;
    let last = 0;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (data[(y * width + x) * 4 + 3] < 180) continue;
        first = Math.min(first, y);
        last = Math.max(last, y);
      }
    }
    return (last - first) / Math.min(window.devicePixelRatio || 1, 2);
  });

  expect(renderedHeight).toBeGreaterThan(80);
});

test('idle matrix keeps a subtle living signal without pointer input', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('[data-pixel-canvas]');
  await expect(canvas).toHaveAttribute('data-render-state', 'ready');
  await page.waitForTimeout(200);

  const firstFrame = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  await page.waitForTimeout(350);
  const secondFrame = await canvas.evaluate((element) => (element as HTMLCanvasElement).toDataURL());

  expect(secondFrame).not.toBe(firstFrame);
});

test('pointer scrambling remains event-driven when the hero leaves the viewport', async ({ page }) => {
  await page.addInitScript(() => {
    const schedule = window.requestAnimationFrame.bind(window);
    (window as typeof window & { pixelFrameCount: number }).pixelFrameCount = 0;
    window.requestAnimationFrame = (callback) => schedule((time) => {
      (window as typeof window & { pixelFrameCount: number }).pixelFrameCount += 1;
      callback(time);
    });
  });
  await page.goto('/');

  const hero = page.locator('[data-pixel-hero]');
  const bounds = await hero.boundingBox();
  expect(bounds).not.toBeNull();
  if (!bounds) return;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await expect(hero).not.toBeInViewport();
  await page.waitForTimeout(100);

  const frameCount = () => page.evaluate(() => (window as typeof window & { pixelFrameCount: number }).pixelFrameCount);
  const before = await frameCount();
  await page.waitForTimeout(250);
  const after = await frameCount();

  expect(after - before).toBeLessThanOrEqual(1);
});

test('responsive pixel rebuilds do not trigger observer loop errors', async ({ page }) => {
  await page.addInitScript(() => {
    (window as typeof window & { observerErrors: string[] }).observerErrors = [];
    window.addEventListener('error', (event) => {
      if (event.message.includes('ResizeObserver loop')) {
        (window as typeof window & { observerErrors: string[] }).observerErrors.push(event.message);
      }
    });
  });

  await page.goto('/');
  await expect(page.locator('[data-pixel-canvas]')).toHaveAttribute('data-render-state', 'ready');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.waitForTimeout(150);

  expect(await page.evaluate(() => (window as typeof window & { observerErrors: string[] }).observerErrors)).toEqual([]);
});
