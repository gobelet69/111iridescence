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
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toContainText('Blog');
  await expect(page.getByRole('navigation', { name: 'Navigation principale' })).toContainText('À propos');
  await expect(page.getByRole('contentinfo').getByRole('link', { name: 'Portail' })).toHaveAttribute('href', '/portail');
  await expect(page.locator('body')).not.toContainText(/Théo|Deville/i);
});

test('uses the identity typeface for headings, navigation, and factual metadata', async ({ page }) => {
  await page.goto('/');

  const displayElements = [
    page.getByRole('heading', { level: 3, name: 'Vault' }),
    page.getByRole('navigation', { name: 'Navigation principale' }).getByRole('link', { name: 'Blog' }),
    page.getByText('Interface personnelle de fichiers et de notes, avec métadonnées D1 et stockage R2.', { exact: true }),
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
