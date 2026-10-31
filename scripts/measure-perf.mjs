import { chromium } from '@playwright/test';

const routes = [
  { name: 'Home (EN)', path: '/' },
  { name: 'Home (FR)', path: '/fr/' },
  { name: 'Apps Catalog (EN)', path: '/apps' },
  { name: 'Apps Catalog (FR)', path: '/fr/apps' },
  { name: 'PDF Reader (EN)', path: '/apps/iridescence-pdf-reader' },
  { name: 'PDF Reader (FR)', path: '/fr/apps/iridescence-pdf-reader' },
  { name: 'Mass Print (EN)', path: '/apps/mass-print' },
  { name: 'Mass Print (FR)', path: '/fr/apps/mass-print' },
  { name: 'Resource Guard (EN)', path: '/apps/resource-guard' },
  { name: 'Resource Guard (FR)', path: '/fr/apps/resource-guard' },
  { name: 'About (EN)', path: '/about' },
  { name: 'About (FR)', path: '/fr/a-propos' },
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const { name, path } of routes) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  // Inject web-vitals collectors before navigation
  await page.addInitScript(() => {
    window.__metrics = { cls: 0, lcp: 0, fcp: 0 };
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          window.__metrics.cls += entry.value;
        }
      }
    }).observe({ type: 'layout-shift', buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        window.__metrics.lcp = entry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.__metrics.fcp = entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });
  });

  const response = await page.goto(`http://localhost:4321${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600); // Allow LCP and subtle entrance shifts to settle

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    return {
      fcp: Math.round(window.__metrics.fcp || 0),
      lcp: Math.round(window.__metrics.lcp || 0),
      cls: Number((window.__metrics.cls || 0).toFixed(4)),
      ttfb: Math.round(nav ? nav.responseStart - nav.requestStart : 0),
      domDuration: Math.round(nav ? nav.domContentLoadedEventEnd - nav.startTime : 0),
      transferSize: nav ? Math.round(nav.transferSize / 1024) : 0,
    };
  });

  results.push({ name, path, status: response?.status(), ...metrics });
  await context.close();
}

await browser.close();

console.table(results);
