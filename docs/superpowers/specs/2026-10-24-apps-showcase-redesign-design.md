# 111iridescence Apps Showcase Redesign

## Intent

111iridescence becomes the product home for independently made macOS applications. The redesign must feel like the existing site grew downward into a software studio rather than being replaced by an unrelated marketing template. The current pixel title, its pointer response, the quiet dot field, the iridescent palette, the tall hero proportions, and the line “le signal n’est jamais fixe.” are the visual identity and remain the memorable moment.

The primary audience is a Mac user who arrives without prior context and needs to understand, within one screen after the hero, that 111iridescence makes macOS apps, what the apps do, and where to download them.

## Goals

- Preserve the existing animated hero implementation and recognizable desktop/mobile composition.
- Replace the editorial homepage with two substantial product compositions for Iridescence PDF Reader and Mass Print.
- Add `/apps`, `/apps/iridescence-pdf-reader`, and `/apps/mass-print`.
- Use authentic icons and screenshots sourced from the application repositories.
- Make public GitHub releases discoverable at runtime with no hard-coded version or asset URL.
- Keep Iridescence PDF Reader launch-ready while its repository/release is private.
- Keep Mass Print downloadable from its current public DMG release.
- Centralize app content so future products can reuse the catalog and shared product primitives.
- Update navigation, SEO, sitemap, structured data, legacy routing, responsiveness, accessibility, and reduced motion.

## Non-goals

- Do not rewrite the pixel animation engine or turn the hero into a conventional CTA block.
- Do not modify either application repository, DNS, Cloudflare deployment shape, or the admin portal.
- Do not fabricate screenshots, releases, version numbers, or download files.
- Do not imitate Apple page-for-page or add heavy blur/motion.
- Do not retain blog, RSS, tags, or GitHub project discovery as promoted public surfaces.

## Preserved hero contract

The preserved system consists of:

- `src/components/PixelHero.astro`: semantic title fallback, full-bleed canvas, tall responsive stage, description and signal signature.
- `src/scripts/pixel-title.ts`: sampled 0xProto glyph pixels, seeded palette, ambient signal, pointer scrambling, device-pixel-ratio cap, `ResizeObserver`, `IntersectionObserver`, and `prefers-reduced-motion` handling.
- `public/fonts/0xProtoNerdFont-*.woff2`: the source glyphs for the sampled title and identity typography.
- `src/styles/global.css`: the existing ink, paper, blue, violet, coral, presence, type, and spacing tokens.

The animation engine and canvas algorithm stay unchanged. `SITE.heroDescription` changes to “Des applications macOS pensées pour la simplicité, la rapidité et le plaisir d’utilisation.” The hero receives only a restrained lower-edge transition into the apps section. Desktop and mobile title layout, signature, no-JavaScript fallback, reduced-motion phase, and offscreen frame suspension remain covered by the existing tests.

## Visual system

### Color

- Signal ink — `#21182b`: primary type and pixel title.
- Iris paper — `#f3eff4`: the recognizable page ground.
- Clear paper — `#faf8fa`: product reading surfaces.
- Spectral blue — `#6272b5`: links, PDF Reader accent, focus.
- Spectral violet — `#b778c8`: iridescent depth and transitions.
- Soft coral — `#ed8d77`: warm spectral counterpoint.
- Presence green — `#58d49a`: availability and identity dot.
- Mass Print blue — `#0a84ff`: product-specific accent taken from the app.

Iridescent washes are structural: they bridge the pixel field into product imagery and distinguish product chapters. They do not become decorative blobs behind every card.

### Typography

- 0xProto NF remains the identity face for the brand, navigation, headings, metadata, and concise product facts.
- The system UI stack remains the reading face so product copy feels native to macOS.
- Product headings are large but left-aligned and concise. Body lines stay below 70 characters where practical.

### Layout

Desktop homepage:

```text
┌─────────────────────────────────────────────────────────────────┐
│ brand                                     Mes apps   À propos    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                 animated 111iridescence.                         │
│                                                                 │
│ description                              signal signature        │
╰──────────────── spectral pixel fade ────────────────────────────╯
│ Mes apps · short studio positioning                              │
│                                                                  │
│ PDF icon + name + copy + actions   [large authentic app window]  │
│ compact feature rail                                             │
│                                                                  │
│ [large authentic app window]       Mass Print copy + actions     │
│                                    queue/order feature rail       │
│                                                                  │
│ quiet studio statement / future apps                             │
└─────────────────────────────────────────────────────────────────┘
```

Mobile homepage:

```text
brand
Mes apps   À propos
┌──────── animated hero ────────┐
│ two-line pixel title          │
│ description                  │
└───────────────────────────────┘
Mes apps
PDF icon + copy + actions
[screenshot, horizontally safe]
features
Mass Print icon + copy + actions
[screenshot]
features
footer
```

Product pages share a shell but not a rigid composition. PDF Reader uses a quiet lilac/blue reading atmosphere and image-led chapters. Mass Print uses a cooler blue queue motif with an order diagram made from semantic HTML/CSS, followed by the authentic source-rendered application capture.

### Principles

1. The pixel hero is the one bold interaction; product motion is limited to one coordinated reveal and pointer-independent depth.
2. Glass communicates grouping, not decoration. Blur is applied only to header and major action/release surfaces, with opaque fallbacks.
3. Authentic app UI remains unaltered inside restrained macOS-style frames; no invented window chrome is painted over screenshots.
4. Alternating product layouts express two products without turning them into repeated cards.
5. The pixel grid gradually becomes wider-spaced spectral flecks at the hero boundary, visually explaining the move from identity to products.

## Content architecture

`src/data/apps.ts` exports typed `AppDefinition` records. Each record owns identity, copy, platform, compatibility, publication state, repository, release policy, icon, screenshots, feature groups, and SEO fields. Shared lookup helpers throw for unknown slugs during builds. Pages and homepage consume this catalog rather than duplicating strings.

Shared components:

- `AppIcon.astro`: product icon with accessible decorative treatment.
- `AppScreenshot.astro`: lazy image, intrinsic ratio, optional caption, restrained window frame.
- `ReleaseDownload.astro`: semantic fallback plus data attributes for progressive runtime enhancement.
- `ProductFeatureList.astro`: reusable, uncarded feature grouping.
- `ProductShowcase.astro`: homepage composition with reversible layout.
- `ProductJsonLd.astro`: `SoftwareApplication` JSON-LD generated from catalog data.

The PDF Reader page contains overview, workspace, reading/annotations, command palette, OCR, screenshot gallery, and download. The Mass Print page contains overview, document ordering demonstration, key features, Finder integration, privacy, gallery, and download. `/apps` is a durable catalog for future products.

## Release discovery

The Cloudflare worker exposes only allow-listed routes:

- `/api/releases/iridescence-pdf-reader`
- `/api/releases/mass-print`

Each maps to a fixed GitHub owner/repository: `gobelet69/iridecence-pdf-reader` and `gobelet69/Mass-Print`. The PDF Reader repository keeps its intentionally misspelled GitHub identity when it becomes public. The worker requests GitHub’s latest public release, rejects drafts/prereleases, and selects assets with a per-app policy: PDF Reader prefers `.dmg` and may fall back to its documented macOS `.zip`; Mass Print accepts the universal `.dmg` only. Source archives, `.app.tar.gz`, checksums, and unmatched architectures are never selected. It returns normalized JSON: availability, version, display format, download URL, release URL, publication date, truncated notes, and compatibility from the local catalog. Responses are cached for five minutes. GitHub failure, private repository, missing release, missing allowed asset, or rate limiting return an unavailable payload; no broken link is rendered.

The static HTML fallback says “Bientôt disponible”. A small `release-download.ts` enhancement requests the same-origin endpoint and atomically updates all matching release controls. Mass Print therefore becomes an active DMG download on normal runtime; PDF Reader activates automatically as soon as GitHub exposes a valid public release. The pages remain understandable without JavaScript.

## Legacy content and routing

- Remove blog, tags, projects, and RSS pages from Astro’s generated public routes.
- Remove homepage references to PwdGen and GitHub project data.
- Keep admin/portal code and deployment configuration intact unless tests prove a dependency can safely be removed.
- The worker permanently redirects `/blog`, `/blog/*`, `/tags`, `/tags/*`, `/projets`, `/projets/*`, and `/rss.xml` to `/apps` (preserving query strings where harmless).
- Update the 404 to offer Accueil, Mes apps, and À propos.
- Remove RSS metadata and footer link. GitHub remains a secondary footer link.

## SEO and accessibility

- Site metadata names 111iridescence as a macOS software studio, not a blog.
- Every app page has a unique title, description, canonical URL, Open Graph image, and `SoftwareApplication` JSON-LD.
- The sitemap is produced from only the current public Astro routes.
- Images have intrinsic dimensions, purposeful alt text or empty alt for decorative icons, `loading="lazy"` below the fold, and `decoding="async"`.
- Navigation and downloads are keyboard accessible, focus remains at least 3:1, controls are large enough on mobile, landmarks and headings are ordered, and content works without JavaScript.
- `prefers-reduced-motion` disables reveal and transition movement while preserving content and the static pixel title.

## Performance and QA

- Keep the current zero-runtime-dependency Astro architecture.
- Reuse browser-native CSS, no animation or carousel dependency.
- Optimize copied PNGs/WebP through Astro where possible and avoid eager loading below the first product image.
- The release client runs only on pages containing release controls.
- Preserve canvas DPR cap and offscreen suspension.
- Run unit, Astro check, build, Playwright desktop/mobile, worker routing/API tests, link checks, and accessibility assertions.
- Capture before/after at 1440×900, 1280×800, 768×1024, and 390×844. Capture hero, homepage apps area, both product pages, navigation, footer, and mobile states. Compare hero geometry and pixel canvas evidence directly.

## Verified product sources and claims

- PDF Reader source of truth: private local checkout `/Users/theodeville/Documents/OxiReader`, remote `gobelet69/iridecence-pdf-reader`, README and `docs/screenshots/`. Publish `AppIcon.icns` converted losslessly and the screenshots `reader-workspace-light.png`, `tabs.png`, `annotations.png`, `palette-command.png`, `ocr-panel.png`, and `settings.png`. Avoid the home screenshots because they visibly contain local personal paths. The verified platform is macOS 14 or later, with the imminent first public build described as Apple Silicon. Verified claims are native Rust/AppKit/PDFKit, workspaces and iCloud status/download coordination, tabs, PDFKit annotations and atomic saving, thumbnails/outline/search navigation, Spotlight-style command palette, and Apple Vision OCR.
- Mass Print source of truth: public `gobelet69/Mass-Print` README and source at release `v0.1.3`. Publish the repository icon and an authentic UI capture rendered from the real frontend at that release with representative local document rows; label it as a product capture, not a fabricated release. The verified platform is macOS 12.3 or later and the published DMG is universal for Apple Silicon and Intel. Verified claims are Finder drag-and-drop, accessible/manual reordering, natural-name/date/size/page-count/type/original sorting with reverse direction, Finder Quick Action, printer/copies/grayscale/two-sided controls, sequential CUPS submission, cancellation of the current batch, supported local conversion, no account/analytics/upload/cloud dependency, and originals never modified.

## Builder calls explicitly delegated

- Exact editorial phrasing beyond the copy fixed in the brief may be tightened for clarity without changing product claims.
- Screenshot order may be adjusted after visual QA.
- Product section spacing may be tuned per breakpoint while keeping the preserved hero geometry.
- Existing admin code can remain present but unlinked if deleting it would risk deployment behavior.
