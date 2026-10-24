# Apps Showcase Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform 111iridescence into a launch-ready macOS application showcase while preserving the existing animated pixel hero unchanged.

**Architecture:** Keep Astro static pages and the existing Cloudflare worker deployment. A typed app catalog feeds homepage, catalog, product pages, SEO, and release controls; an allow-listed worker endpoint normalizes public GitHub releases and a tiny progressive client activates download controls at runtime.

**Tech Stack:** Astro 7, TypeScript 6, Cloudflare Worker, Vitest, Playwright, CSS, GitHub Releases API.

**Spec:** `docs/superpowers/specs/2026-10-24-apps-showcase-redesign-design.md`

## Global Constraints

- Do not modify `src/scripts/pixel-title.ts`, the 0xProto fonts, application repositories, DNS, or the existing deployment system.
- Preserve the hero canvas algorithm, title, tall proportions, pointer behavior, signal signature, reduced-motion behavior, no-JavaScript fallback, and offscreen suspension.
- Only authentic repository icons/screenshots may ship; avoid PDF Reader home captures containing local personal paths.
- Mass Print downloads only a public universal `.dmg`; PDF Reader accepts `.dmg`, then its documented macOS `.zip` fallback.
- Never render a broken or fabricated download link; unavailable releases say “Bientôt disponible”.
- Keep dependencies unchanged and use browser-native CSS/JavaScript.
- Preserve admin and portal runtime behavior even though editorial public routes disappear.
- All product content must remain available without JavaScript; JavaScript only enhances release availability and subtle presentation.

## Review Focus

- GitHub responds with a release containing only source archives or `.app.tar.gz`: the endpoint must report unavailable and the UI must keep the fallback.
- GitHub is private, rate-limited, malformed, or offline: product pages must remain usable, with no rejected promise or broken `href`.
- A 320 px viewport, long French copy, or wide screenshot: no document-level horizontal overflow and all actions remain reachable.
- Reduced motion or JavaScript disabled: pixel title and all product content remain readable, while nonessential reveals stop.
- Legacy nested routes and query strings: redirect to `/apps` without creating an open redirect or disturbing protected/admin/portal routing.

---

### Task 1: Typed app catalog and asset policy

**Files:**
- Create: `src/data/apps.ts`
- Create: `src/lib/releases.ts`
- Create: `tests/unit/apps.test.ts`
- Create: `tests/unit/releases.test.ts`

**Interfaces:**
- Produces: `AppDefinition`, `apps`, `getApp(slug)`, `ReleasePolicy`, `GitHubRelease`, `normalizeRelease(app, payload)` and `unavailableRelease(app)`.
- Consumes: verified repository facts and copy from the design spec.

- [ ] **Step 1: Write failing catalog tests**

Assert exactly two unique slugs in display order, exact repositories, compatibility and architecture labels, required section/screenshot data, Mass Print `available` editorial status, PDF Reader `coming-soon` status, and `getApp` failure for an unknown slug.

- [ ] **Step 2: Run the catalog test and verify RED**

Run: `npx vitest run tests/unit/apps.test.ts`
Expected: FAIL because `src/data/apps.ts` does not exist.

- [ ] **Step 3: Implement the typed catalog**

Define focused nested types for screenshot, feature group, release policy, and SEO data. Encode the exact verified claims and user-provided lead copy once.

- [ ] **Step 4: Run the catalog test and verify GREEN**

Run: `npx vitest run tests/unit/apps.test.ts`
Expected: PASS.

- [ ] **Step 5: Write failing release-normalization tests**

Cover valid Mass Print DMG, invalid `.app.tar.gz`, valid PDF Reader DMG, PDF Reader ZIP fallback, draft/prerelease, mismatched architecture/name, missing assets, malformed payload, and notes truncation.

- [ ] **Step 6: Run the release test and verify RED**

Run: `npx vitest run tests/unit/releases.test.ts`
Expected: FAIL because `src/lib/releases.ts` does not exist.

- [ ] **Step 7: Implement release normalization**

`normalizeRelease(app: AppDefinition, payload: unknown): ReleaseAvailability` returns a discriminated union and never throws for remote payload data.

- [ ] **Step 8: Run Task 1 tests and commit**

Run: `npx vitest run tests/unit/apps.test.ts tests/unit/releases.test.ts`
Expected: PASS.

Commit: `feat: add typed macOS app catalog`

### Task 2: Runtime GitHub release discovery

**Files:**
- Modify: `src/worker.js`
- Create: `src/scripts/release-download.ts`
- Create: `tests/unit/release-client.test.ts`
- Modify: `tests/unit/worker-public.test.ts`
- Modify: `tests/worker/site-release-routing.spec.ts`

**Interfaces:**
- Consumes: `getApp`, `normalizeRelease`, and `unavailableRelease` from Task 1.
- Produces: same-origin `/api/releases/:slug` JSON and `mountReleaseDownloads(root?)` progressive enhancement.

- [ ] **Step 1: Write failing worker unit tests**

Assert allow-listed GitHub URLs, normalized Mass Print DMG JSON, unavailable PDF/private response, five-minute cache headers, `HEAD` behavior, 404 unknown slug, and unchanged admin/protected/portal asset routing.

- [ ] **Step 2: Run the worker unit test and verify RED**

Run: `npx vitest run tests/unit/worker-public.test.ts`
Expected: new API assertions FAIL against asset delegation.

- [ ] **Step 3: Implement the release endpoint**

Add an allow-listed route before public asset delegation, injectable outbound `fetch` for unit tests, safe JSON headers, compatibility metadata, and Cloudflare cache-control. Never proxy arbitrary owner/repository input.

- [ ] **Step 4: Run worker unit tests and verify GREEN**

Run: `npx vitest run tests/unit/worker-public.test.ts`
Expected: PASS.

- [ ] **Step 5: Write failing release client tests**

Using a real DOM container, assert unavailable fallback preservation, available link/version/format/note update, duplicate controls updated together, and fetch rejection leaves semantic content intact.

- [ ] **Step 6: Run the release client test and verify RED**

Run: `npx vitest run tests/unit/release-client.test.ts`
Expected: FAIL because the client module is absent.

- [ ] **Step 7: Implement `mountReleaseDownloads`**

Fetch each unique slug once, validate the normalized shape, update only declared data targets, and preserve fallback state on every failure path.

- [ ] **Step 8: Add worker integration coverage and commit**

Test API route status/JSON plus the legacy routing smoke test under Wrangler.

Run: `npx vitest run tests/unit/worker-public.test.ts tests/unit/release-client.test.ts && npx playwright test --config playwright.worker.config.ts`
Expected: PASS.

Commit: `feat: discover public app releases at runtime`

### Task 3: Product assets, primitives, and SEO shell

**Files:**
- Create: `public/apps/iridescence-pdf-reader/*`
- Create: `public/apps/mass-print/*`
- Create: `src/components/apps/AppIcon.astro`
- Create: `src/components/apps/AppScreenshot.astro`
- Create: `src/components/apps/ProductFeatureList.astro`
- Create: `src/components/apps/ReleaseDownload.astro`
- Create: `src/components/apps/ProductJsonLd.astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/styles/global.css`
- Create: `tests/unit/product-components.test.ts`
- Modify: `tests/e2e/shell.spec.ts`

**Interfaces:**
- Consumes: `AppDefinition` and release client from Tasks 1–2.
- Produces: reusable product presentation components, JSON-LD, responsive glass/screenshot tokens, and optional Open Graph metadata.

- [ ] **Step 1: Copy and optimize authentic assets**

Convert the local PDF Reader ICNS to PNG, copy the approved repository screenshots, copy the Mass Print repository icon and the source-rendered capture, preserve provenance in `public/apps/README.md`, and generate lightweight Open Graph images from authentic compositions.

- [ ] **Step 2: Write failing component/metadata tests**

Assert intrinsic image dimensions, lazy loading rules, unavailable semantic button state, release data attributes, valid `SoftwareApplication` JSON-LD, no RSS alternate metadata, and Twitter/Open Graph fields.

- [ ] **Step 3: Run the tests and verify RED**

Run: `npx vitest run tests/unit/product-components.test.ts && npx playwright test tests/e2e/shell.spec.ts --project=desktop`
Expected: FAIL on missing product components and retained RSS metadata.

- [ ] **Step 4: Implement primitives and shared visual tokens**

Add restrained glass, app-window, iridescent transition, buttons, focus, and reveal styles. Import the release client only from `ReleaseDownload.astro`. Preserve existing identity tokens and font roles.

- [ ] **Step 5: Run Task 3 tests and commit**

Run: `npx vitest run tests/unit/product-components.test.ts && npx playwright test tests/e2e/shell.spec.ts --project=desktop`
Expected: PASS.

Commit: `feat: add reusable app presentation system`

### Task 4: Homepage, navigation, and public-route transition

**Files:**
- Create: `src/components/apps/ProductShowcase.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/components/PixelHero.astro`
- Modify: `src/components/SiteHeader.astro`
- Modify: `src/components/SiteFooter.astro`
- Modify: `src/config/site.ts`
- Modify: `src/pages/404.astro`
- Modify: `src/worker.js`
- Delete: `src/pages/blog/**`
- Delete: `src/pages/tags/**`
- Delete: `src/pages/projets/**`
- Delete: `src/pages/rss.xml.ts`
- Replace: obsolete editorial E2E/unit tests with homepage/navigation/legacy redirect coverage.

**Interfaces:**
- Consumes: app catalog and shared product components.
- Produces: recognizable homepage with `#apps`, simplified public navigation, current footer/404, and permanent legacy redirects.

- [ ] **Step 1: Rewrite homepage and shell tests first**

Assert the hero engine hook remains, exact new description/signature, two product compositions in catalog order, authentic screenshots/icons, working Discover links, `Mes apps`/`À propos` navigation, secondary GitHub/Portal footer, no blog/RSS/PwdGen text, no-JS content, and 320 px overflow safety.

- [ ] **Step 2: Add hero-preservation geometry tests**

At 1440×900, 1280×800, 768×1024, and 390×844 assert hero height within 2 px of the captured baseline ratios, canvas equals hero bounds, pixel title remains inside viewport, and the signature remains desktop-visible.

- [ ] **Step 3: Run homepage/pixel tests and verify RED**

Run: `npx playwright test tests/e2e/homepage.spec.ts tests/e2e/pixel-title.spec.ts tests/e2e/shell.spec.ts`
Expected: homepage/navigation assertions FAIL while existing animation assertions remain green.

- [ ] **Step 4: Implement the homepage and navigation changes**

Keep `pixel-title.ts` byte-for-byte unchanged. In `PixelHero.astro`, change only presentation copy/transition CSS needed by the spec. Build asymmetric product chapters and a quiet future-app statement.

- [ ] **Step 5: Write failing legacy redirect tests**

Assert `/blog`, nested blog/tag/project paths, and `/rss.xml` permanently redirect to `/apps` with safe query preservation; near-prefix paths remain delegated; protected/admin/portal behavior remains unchanged.

- [ ] **Step 6: Implement route removal and redirects**

Delete only public editorial page routes and unlink editorial surfaces. Keep shared/admin data code where removal could affect the existing admin system.

- [ ] **Step 7: Run Task 4 tests and commit**

Run: `npx playwright test tests/e2e/homepage.spec.ts tests/e2e/pixel-title.spec.ts tests/e2e/shell.spec.ts && npx vitest run tests/unit/worker-public.test.ts && npx playwright test --config playwright.worker.config.ts`
Expected: PASS.

Commit: `feat: make apps the public homepage focus`

### Task 5: Apps catalog and product pages

**Files:**
- Create: `src/pages/apps/index.astro`
- Create: `src/pages/apps/[slug].astro`
- Create: `src/components/apps/PdfReaderProduct.astro`
- Create: `src/components/apps/MassPrintProduct.astro`
- Create: `src/components/apps/DocumentOrderDemo.astro`
- Create: `tests/e2e/apps.spec.ts`
- Create: `tests/unit/product-pages.test.ts`

**Interfaces:**
- Consumes: typed catalog, shared components, release endpoint/client, and authentic assets.
- Produces: `/apps`, `/apps/iridescence-pdf-reader`, `/apps/mass-print` and shared future-app routing.

- [ ] **Step 1: Write failing route/content tests**

Assert `getStaticPaths()` matches catalog slugs, each product has one H1 and required sections, app-specific copy/features/screenshots, back link, compatibility, JSON-LD, and correct release fallback/data slug.

- [ ] **Step 2: Run tests and verify RED**

Run: `npx vitest run tests/unit/product-pages.test.ts && npx playwright test tests/e2e/apps.spec.ts`
Expected: FAIL because app routes/components are absent.

- [ ] **Step 3: Implement `/apps` and shared dynamic routing**

Use one dynamic route backed by catalog data and dispatch to a product-specific composition component so future apps can reuse routing without forcing identical layouts.

- [ ] **Step 4: Implement PDF Reader chapters**

Build icon/name/screenshot hero, overview, gallery, workspaces, reading/annotations, command palette, OCR, download, and back link using only verified claims.

- [ ] **Step 5: Implement Mass Print chapters**

Build icon/name/capture hero, feature groups, semantic order demonstration, Finder integration, privacy, gallery, live DMG download, and back link.

- [ ] **Step 6: Run Task 5 tests and commit**

Run: `npx vitest run tests/unit/product-pages.test.ts && npx playwright test tests/e2e/apps.spec.ts`
Expected: PASS on desktop and mobile projects.

Commit: `feat: add complete macOS app product pages`

### Task 6: Full QA, visual iteration, and handoff documentation

**Files:**
- Modify: `tests/e2e/release.spec.ts`
- Create: `tests/e2e/accessibility.spec.ts`
- Create: `scripts/capture-app-showcase.mjs`
- Create: `docs/apps-catalog.md`
- Update: Playwright screenshots under `tests/e2e/release.spec.ts-snapshots/`

**Interfaces:**
- Consumes: complete site from Tasks 1–5 and baseline captures in the task output directory.
- Produces: technical QA evidence, after captures, visual comparison evidence, and future-app instructions.

- [ ] **Step 1: Write failing cross-site QA tests**

Cover heading/landmark order, keyboard navigation, visible focus, image alt/loading/dimensions, reduced motion, no console errors, local-link integrity, structured data, release fallback/live mock, sitemap route set, and the four required viewport widths.

- [ ] **Step 2: Run targeted QA and verify RED**

Run: `npx playwright test tests/e2e/accessibility.spec.ts tests/e2e/release.spec.ts`
Expected: FAIL on missing final snapshots or any discovered issue.

- [ ] **Step 3: Implement the capture and comparison script**

Capture homepage hero, apps section, catalog, both product pages, header/footer, and mobile states at 1440×900, 1280×800, 768×1024, and 390×844. Store user-facing before/after/contact sheets under the task `outputs/qa` directory, not in the repository.

- [ ] **Step 4: Iterate visually**

For each viewport: compare hero proportions/title placement against baseline, inspect product rhythm, screenshot legibility, nav wrapping, footer, and overflow; make the smallest CSS correction and recapture until no material defect remains.

- [ ] **Step 5: Document future app addition**

Explain catalog fields, asset placement, composition component choice, release policy allow-list, tests, and publication checklist.

- [ ] **Step 6: Run full verification**

Run: `npm run check && npm run test:unit && npm run build && npm run test:e2e && npm run test:worker`
Expected: all commands exit 0 with zero failed tests.

Also run: generated HTML link scan, privacy string scan over public/dist assets, and `git diff --check`.
Expected: no broken local links, no local absolute paths/private identifiers, and no whitespace errors.

- [ ] **Step 7: Commit**

Commit: `test: complete responsive visual QA`
