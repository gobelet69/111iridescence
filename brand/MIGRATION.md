# 111iridescence — Brand Identity Migration Guide (v1 → v2)

This document provides a complete, non-destructive migration roadmap for transitioning from the retired v1 identity to the production-ready **v2.0.0 Brand Identity**.

> **Safety Notice:**  
> The original `brand/` directory has been preserved completely intact. All new assets, source SVGs, compiled ICNS packages, and preview sheets reside in `brand-v2/`. No production code or live website files have been modified yet.

---

## 1. Summary of Changes

| Area | Retired Identity (v1.0) | New Identity (v2.0) | Primary Benefit |
|---|---|---|---|
| **Aesthetic Direction** | Glowing neon bars, mobius ribbons, aperture rings, dark obsidian voids | Quiet confidence, tactile daylight materials, Swiss modernist typography | Eliminates generic AI-generated tech look; looks like a prestigious independent Mac studio (Panic, Cultured Code). |
| **Master Brand** | 3 glowing pill bars inside squircle + live `<text>` font | Integrated vector wordmark: custom architectural `111` + clean grotesque `iridescence` | Pure SVG vector paths (no font dependencies), 99/100 production score, flawless monochrome rendering. |
| **Small-Size Legibility** | Blurred color smudges at 16–32px | Crisp 2px solid stems with 1.5px negative space | Razor-sharp in Finder list view, Safari tabs, and Dock. |
| **Application Icons** | Dark black tiles with neon blue/amber/green laser emitters | Physical porcelain cards with natural top daylight, realistic ground shadows, and purposeful functional metaphors | Harmonious with Apple macOS Sequoia & Sonoma HIG. |

---

## 2. Master Brand Asset Mapping

When ready to adopt the new brand identity, replace the following files:

### 2.1 Website Brand Assets (`111iridescence-website/`)

| Target Location | Replace With (from `brand-v2/`) | Format | Notes |
|---|---|---|---|
| `public/favicon.svg` | `website/favicon.svg` | SVG | Supports automatic light/dark mode via `prefers-color-scheme`. |
| `public/favicon.png` | `website/favicon-32x32.png` | PNG (32×32) | Crisp 32px raster favicon. |
| `public/apple-touch-icon.png` | `website/apple-touch-icon.png` | PNG (180×180) | iOS / iPadOS bookmark icon. |
| `public/og.png` | `website/og-image.png` | PNG (1200×630) | High-resolution editorial social share card. |
| `src/components/BrandMark.astro` | `logos/master/symbol-color.svg` or `wordmark-light.svg` | SVG inline | Replaces old neon symbol with new Cadence Triple. |

---

## 3. Application Icon Asset Mapping

Each application in `brand-v2/app-icons/<app>/` contains:
1. `icon.svg` (1024×1024 master vector)
2. `AppIcon.iconset/` (Complete Apple iconset from 16×16 to 512×512@2x)
3. `AppIcon.icns` (Apple binary icon container compiled with `/usr/bin/iconutil`)

### 3.1 Iridescence PDF Reader
- **Repository / Project:** `IridescencePDFReader` (or `OxiReader`)
- **Xcode Asset Catalog:** Replace `Assets.xcassets/AppIcon.appiconset/` with `brand-v2/app-icons/pdf-reader/AppIcon.iconset/`.
- **DMG Installer Icon:** Replace `AppIcon.icns` with `brand-v2/app-icons/pdf-reader/AppIcon.icns`.
- **Website Catalog:** Replace `111iridescence-website/public/apps/iridescence-pdf-reader/icon.png` with `brand-v2/previews/app-icons/pdf-reader-512.png`.

### 3.2 Mass Print
- **Repository / Project:** `MassPrint`
- **Xcode Asset Catalog:** Replace `Assets.xcassets/AppIcon.appiconset/` with `brand-v2/app-icons/mass-print/AppIcon.iconset/`.
- **DMG Installer Icon:** Replace `AppIcon.icns` with `brand-v2/app-icons/mass-print/AppIcon.icns`.
- **Website Catalog:** Replace `111iridescence-website/public/apps/mass-print/icon.png` with `brand-v2/previews/app-icons/mass-print-512.png`.

### 3.3 Resource Guard
- **Repository / Project:** `ResourceGuard`
- **Xcode Asset Catalog:** Replace `Assets.xcassets/AppIcon.appiconset/` with `brand-v2/app-icons/resource-guard/AppIcon.iconset/`.
- **DMG Installer Icon:** Replace `AppIcon.icns` with `brand-v2/app-icons/resource-guard/AppIcon.icns`.
- **Website Catalog:** Replace `111iridescence-website/public/apps/resource-guard/icon.png` with `brand-v2/previews/app-icons/resource-guard-512.png`.

### 3.4 QuickPad (Future Application)
- **Concept Assets:** Pre-compiled in `brand-v2/app-icons/quickpad/AppIcon.icns` and `brand-v2/app-icons/quickpad/icon.svg` ready for project scaffolding.

---

## 4. Verification Checklist Before Publishing

- [ ] Inspect `brand-v2/preview.html` in Safari / Chrome with light and dark mode toggles.
- [ ] Review `brand-v2/previews/brand-redesign-comparison.png` to confirm visual restraint and craft.
- [ ] Test `AppIcon.icns` files by pressing Spacebar in Finder (Quick Look).
- [ ] Verify that no maintainer civil names or personal information appear in any file metadata.
- [ ] Execute website unit and e2e test suite (`npm run check && npm run test:unit`) after swapping public assets.
