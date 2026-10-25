import { expect, test } from '@playwright/test';

function relativeLuminance(color: string) {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);

  if (!channels || channels.length !== 3) {
    throw new Error(`Unsupported rendered color: ${color}`);
  }

  const [red, green, blue] = channels.map((channel) => {
    const normalized = channel / 255;
    return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrastRatio(foreground: string, background: string) {
  const foregroundLuminance = relativeLuminance(foreground);
  const backgroundLuminance = relativeLuminance(background);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

test('renders the anonymous public identity and discreet portal link', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: '111iridescence.' })).toHaveAttribute('href', '/');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toContainText('Apps');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toContainText('About');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Portal' })).toHaveAttribute('href', 'https://portail.111iridescence.org/');
  await expect(page.locator('body')).not.toContainText(/Théo|Deville/i);
});

test('uses the identity typeface for headings, navigation, and factual metadata', async ({ page }) => {
  await page.goto('/');

  const displayElements = [
    page.getByRole('heading', { level: 3, name: 'Iridescence PDF Reader', exact: true }),
    page.getByRole('navigation', { name: 'Main navigation' }).getByRole('link', { name: 'Apps' }),
    page.getByText('macOS application · 01', { exact: true }),
    page.getByRole('contentinfo').getByRole('link', { name: 'GitHub' }),
  ];

  const bodyFont = await page.locator('body').evaluate((element) => getComputedStyle(element).fontFamily);
  expect(bodyFont).not.toContain('0xProto NF');

  for (const element of displayElements) {
    await expect(element).toBeVisible();
    const fontFamily = await element.evaluate((node) => getComputedStyle(node).fontFamily);
    expect(fontFamily).toContain('0xProto NF');
  }
});

test('shows a focus indicator with at least 3:1 contrast', async ({ page }) => {
  await page.goto('/');

  const brandLink = page.getByRole('link', { name: '111iridescence.' });
  await brandLink.focus();
  await expect(brandLink).toBeFocused();

  const colors = await brandLink.evaluate((element) => ({
    outline: getComputedStyle(element).outlineColor,
    background: getComputedStyle(document.documentElement).backgroundColor,
    focusVisible: element.matches(':focus-visible'),
  }));

  expect(colors.focusVisible).toBe(true);
  expect(contrastRatio(colors.outline, colors.background)).toBeGreaterThanOrEqual(3);
});

test('uses product-ready social metadata without advertising an RSS feed', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveCount(0);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', '111iridescence');
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', /.+/);
});

test('about metadata presents the anonymous creator without exposing civil identity', async ({ page }) => {
  await page.goto('/about');

  await expect(page).toHaveTitle('About — 111iridescence');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://111iridescence.org/about');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'About 111iridescence: macOS app development, cybersecurity, systems, and building with artificial intelligence.',
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'About — 111iridescence');
  await expect(page.locator('html')).not.toContainText(/Théo|Theo|Deville/i);
});

test('publishes self-canonical bilingual metadata with English as x-default', async ({ page }) => {
  for (const route of [
    {
      path: '/about',
      lang: 'en',
      canonical: 'https://111iridescence.org/about',
      en: 'https://111iridescence.org/about',
      fr: 'https://111iridescence.org/fr/a-propos',
    },
    {
      path: '/fr/a-propos',
      lang: 'fr',
      canonical: 'https://111iridescence.org/fr/a-propos',
      en: 'https://111iridescence.org/about',
      fr: 'https://111iridescence.org/fr/a-propos',
    },
  ]) {
    await page.goto(route.path);
    await expect(page.locator('html')).toHaveAttribute('lang', route.lang);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', route.canonical);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute('href', route.en);
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute('href', route.fr);
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute('href', route.en);
  }
});

test('localizes SoftwareApplication URLs for both product trees', async ({ page }) => {
  for (const [path, expectedUrl] of [
    ['/apps/mass-print', 'https://111iridescence.org/apps/mass-print'],
    ['/fr/apps/mass-print', 'https://111iridescence.org/fr/apps/mass-print'],
  ]) {
    await page.goto(path);
    const source = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(source ?? '{}');
    expect(data['@type']).toBe('SoftwareApplication');
    expect(data.url).toBe(expectedUrl);
    expect(data.author).toEqual({
      '@type': 'Organization',
      name: '111iridescence',
      url: 'https://111iridescence.org',
    });
  }
});
