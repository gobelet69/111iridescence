# 111iridescence — Master Design System & Brand Identity Specification
**Version 2.0.0 • Independent Native macOS Software Studio**

---

## 1. Executive Summary & Brand Philosophy

**111iridescence** is an independent collection of lightweight, ultra-fast native macOS applications.

The visual identity is defined by four foundational pillars:
- **Quiet Confidence**: Refined restraint over loud visual noise. No artificial gradients, no holographic objects, no dark-room neon glows.
- **Minimalism & Precision**: Pure vector geometry, mathematically aligned negative space, and disciplined Swiss modernist typography.
- **Personality**: A distinctive custom typographic treatment of the triple "111", celebrating software craft and architectural rhythm.
- **Native macOS Craftsmanship**: Full harmony with Apple Human Interface Guidelines (HIG), tactile daylight lighting, physical paper and instrument metaphors, and standard continuous squircle geometry.

---

## 2. Master Brand Identity: The Cadence Triple

The brand name is **111iridescence** (written lowercase without spaces).

### 2.1 Concept & Construction
The identity is typography-led. The numeral prefix `111` is custom-drawn with architectural precision:
- **Canvas Unit Grid**: 256 × 256 pt coordinate space.
- **Stem Geometry**: Three identical vertical stems of width **22 pt** and height **120 pt** (y: 68 to 188).
- **Rhythmic Negative Space**: Exactly **28 pt** pitch between stems, ensuring the 45° beaks have **14 pt** of clean breathing room from the preceding stem.
- **45° Top Beaks**: Razor-sharp diagonal top beaks (width 14 pt, height 18 pt), providing a dynamic left-to-right rhythmic cadence.
- **Integrated Wordmark**: Seamlessly locked on the exact same baseline with `iridescence` set in a refined Swiss neo-grotesque with calibrated tracking (`-0.035em`).

```
  +-- 14 pt --+
  \           |
   \          |
    \         |  Height: 120 pt
     |        |
     |        |  Stem width: 22 pt
     |        |  Negative space: 28 pt pitch (14 pt clear of beak)
     +--------+
```

### 2.2 Master Asset Inventory
All master assets are genuine vector graphics without live `<text>` tags (outlines only), 0 blur filters, and 0 gradients:

| File Path | Description | Best For |
|---|---|---|
| `logos/master/wordmark-light.svg` | Primary brand wordmark (Obsidian + Iris accent) | Light websites, white documentation, headers |
| `logos/master/wordmark-dark.svg` | High-contrast dark wordmark (Snow + Soft Iris) | Dark website canvas, IDE themes, terminal |
| `logos/master/wordmark-mono-black.svg` | 100% pure black monochrome wordmark | Print, single-color packaging, stamping, laser |
| `logos/master/wordmark-mono-white.svg` | 100% pure white monochrome wordmark | Dark solid surfaces, DMG background art |
| `logos/master/symbol-color.svg` | Standalone Cadence mark with Iris accent | Standalone logo, avatars, headers |
| `logos/master/symbol-mono-black.svg` | Standalone Cadence mark in solid black | Favicons, monochrome watermarks |
| `logos/master/compact-light.svg` | Cadence mark on white squircle card | App store avatars, Dock icons, social profiles |
| `logos/master/compact-dark.svg` | Cadence mark on obsidian squircle card | Dark social cards, GitHub organization avatar |
| `logos/master/lockup-stacked-light.svg`| Centered vertical lockup | App About windows, splash banners, READMEs |

---

## 3. Color System & Design Tokens

The color palette is founded on a luminous, neutral canvas with restrained, purposeful accents. Saturated rainbow gradients and neon glows are strictly prohibited.

### 3.1 Studio Core Palette
| Token | Hex | OKLCH Equivalent | Usage |
|---|---|---|---|
| `studio-obsidian` | `#111318` | `oklch(18% 0.01 265)` | Primary ink, dark surfaces, high-contrast text |
| `studio-snow` | `#FFFFFF` | `oklch(100% 0 0)` | Pure white paper surfaces, light cards |
| `studio-pearl` | `#FAF9FC` | `oklch(98% 0.005 285)` | Main website & documentation canvas |
| `studio-border` | `rgba(0,0,0,0.08)`| — | Specular hairline boundary for light cards |
| `studio-iris` | `#4F46E5` | `oklch(53% 0.23 277)` | Master brand optical accent (Light mode) |
| `studio-iris-soft` | `#818CF8` | `oklch(68% 0.17 277)` | Master brand optical accent (Dark mode) |

### 3.2 Product Family Accent Palette
Every application receives an exclusive, restrained accent color drawn from the studio spectrum:

| Application | Accent Name | Light Hex | Dark Hex | Role |
|---|---|---|---|---|
| **Iridescence PDF Reader** | Azure Focus | `#2563EB` | `#38BDF8` | Reading guide track, selection focus |
| **Mass Print** | Terracotta Platen | `#EA580C` | `#FB923C` | Mechanical print platen, batch queues |
| **Resource Guard** | Emerald Telemetry | `#059669` | `#34D399` | Telemetry sweep gauge, system health |
| **QuickPad** | Amethyst Caret | `#7C3AED` | `#A78BFA` | Active drafting caret, syntax highlight |

---

## 4. Application Icon Architecture

All 111iridescence application icons follow Apple macOS Human Interface Guidelines (HIG) with tactile, daylight realism:

```
+-------------------------------------------------------------+
|  CANVAS: 1024 x 1024 pt (viewBox="0 0 1024 1024")           |
|                                                             |
|  1. Soft Ambient Ground Shadow (dy=28, stdDev=24, op=0.14)   |
|  2. Continuous Superellipse Squircle Body:                  |
|     - Size: 824 x 824 pt centered at (512, 512)             |
|     - Corner Radius: 185 pt (Apple HIG standard)            |
|     - Material: Luminous porcelain daylight gradient         |
|     - Border: 2 pt specular top highlight stroke            |
|  3. Physical Tactile Metaphor Card:                         |
|     - Paper sheets, folio notebook, or instrument bezel      |
|     - Soft internal card drop shadow (dy=16, stdDev=16)     |
|  4. Purposeful Functional Accent Element:                   |
|     - PDF Reader: Vertical Azure reading guide              |
|     - Mass Print: Terracotta precision platen bar           |
|     - Resource Guard: Emerald telemetry sweep gauge         |
|     - QuickPad: Amethyst text insertion caret               |
+-------------------------------------------------------------+
```

### 4.1 Resolution Ladder & Testing Standards
Every application icon is tested and verified at:
- **1024 × 1024 px**: Retina Display Mac App Store masthead.
- **512 × 512 px**: macOS Dock and Finder Get Info.
- **256 × 256 px**: Finder Icon view.
- **128 × 128 px**: Spotlight search results and Launchpad.
- **64 × 64 px**: Notification banners and Finder Column view.
- **32 × 32 px**: Finder List view and open dialogs.
- **16 × 16 px**: Menu bar, Finder tiny list, and status windows.

---

## 5. Spacing, Scaling & Clear-Space Rules

### 5.1 Clear Space
Maintain clear space around the master wordmark equal to the height of the `111` numeral ($1.0 \times H$ minimum). No graphics, text, or window boundaries may encroach within this perimeter.

```
       [   Clear Space >= H   ]
       +----------------------+
[>= H] |   111iridescence     | [>= H]
       +----------------------+
       [   Clear Space >= H   ]
```

### 5.2 Minimum Sizes
- **Master Wordmark**: Minimum display width is **96 px** (screen) or **20 mm** (print).
- **Standalone Cadence Symbol**: Minimum display size is **16 × 16 px** (screen) or **4 mm** (print).
- **App Icons**: Smallest system icon render is **16 × 16 px**.

---

## 6. Design Don'ts (Strict Prohibitions)

- ❌ **Do NOT use neon glow filters, laser beams, or ambient colored halos.**
- ❌ **Do NOT flood icons with pure black obsidian voids.** Use daylight porcelain surfaces.
- ❌ **Do NOT use live `<text>` tags in SVG production logos.** All letterforms must be outlined vector paths.
- ❌ **Do NOT use generic microchips, cybersecurity shields, or 3D floating ribbons.**
- ❌ **Do NOT stretch, skew, or alter the 45° beaks of the `111` letterforms.**
- ❌ **Do NOT add gradients with more than two harmonious color stops.**
- ❌ **Do NOT reveal the maintainer's civil first or last name in metadata, paths, or branding.**
