# 111iridescence Internationalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship English as the default complete site and French as an equivalent `/fr/` site.

**Architecture:** Explicit locale flows from thin Astro routes into shared page components. A typed i18n module owns routes and shared UI, while one product catalog owns common facts and localized editorial content.

**Tech Stack:** Astro 7, TypeScript, Cloudflare Worker, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-25-site-internationalization-design.md`

## Global Constraints

- English is default and unprefixed; French is always prefixed `/fr/`.
- No automatic locale detection or redirect.
- Preserve the pixel hero implementation and visual identity.
- Keep release facts and product assets centralized.
- Preserve public anonymity in every language and metadata surface.
- Do not add a heavy i18n dependency.

## Review Focus

- A language switch on every page must target the equivalent page, not a homepage.
- Direct and refreshed French product URLs must statically resolve.
- Canonical and alternate URLs must never cross or self-reference the wrong locale.
- Runtime release controls must use the page language even though API data is shared.
- English and French long labels must remain inside 390 px and 768 px layouts.

---

### Task 1: Locale contract and localized catalog

**Files:** Create `src/i18n/index.ts`; modify `src/config/site.ts`, `src/data/apps.ts`, `src/data/pages/about.json`; create `src/data/pages/about.en.json`; test `tests/unit/i18n.test.ts`, `tests/unit/apps.test.ts`, `tests/unit/about.test.ts`.

**Interfaces:** Produces `Locale`, `getRoute(locale, page, slug?)`, `getAlternatePath(path)`, `ui(locale)`, `getApps(locale)`, and `getApp(slug, locale)`.

- [ ] Write locale completeness, exact route-pair, localized catalog, and anonymity tests; run them RED.
- [ ] Implement typed dictionaries, routes, English About copy, and localized product content.
- [ ] Run targeted unit tests GREEN and commit.

### Task 2: Shared localized rendering and static routes

**Files:** Modify shell and product components; create shared page components; replace English route implementations with wrappers; create French route wrappers.

**Interfaces:** Consumes Task 1 locale helpers and catalog; produces all canonical static pages.

- [ ] Write E2E tests for six primary routes, both product families, language switches, translated assistive copy, and no-JavaScript rendering; run RED.
- [ ] Implement explicit-locale layouts, navigation, footer, home, catalog, About, product, and 404 rendering.
- [ ] Run targeted E2E and component tests GREEN and commit.

### Task 3: International SEO, release localization, and redirects

**Files:** Modify `BaseLayout.astro`, `ProductJsonLd.astro`, `release-download.ts`, `worker.js`; add/update SEO, release, worker, and sitemap tests.

**Interfaces:** Consumes route pairs from Task 1 and static pages from Task 2; produces self-canonical metadata and migration behavior.

- [ ] Write canonical/hreflang/lang, localized release, sitemap, 308 migration, query-preservation, and no-loop tests; run RED.
- [ ] Implement metadata, structured-data URLs, client release localization, and Worker redirect/error behavior.
- [ ] Run targeted tests GREEN and commit.

### Task 4: Full verification and bilingual visual QA

**Files:** Create `scripts/capture-i18n-site.mjs`; update output QA report.

**Interfaces:** Consumes all public routes; produces deterministic captures and a manifest.

- [ ] Run check, unit, build, E2E, Worker, link/private-string verification, and `git diff --check`.
- [ ] Capture English and French home, catalog, About, and both products at 390, 768, 1280, and 1440 pixels.
- [ ] Inspect navigation, language switch, hero, long copy, buttons, footer, and overflow; fix findings with regression tests.
- [ ] Re-run the complete suite, commit QA tooling/fixes, and keep the local Worker running on port 8787.
