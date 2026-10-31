---
name: 111iridescence — The Prismatic Atelier
description: Luminous Swiss precision & native macOS glass for focused independent software.
colors:
  ink: "#16101D"
  paper: "#FAF9FC"
  paper-strong: "#FFFFFF"
  text: "#221A2C"
  muted: "#6C6274"
  line: "#E2DDE7"
  line-subtle: "#EEEAF2"
  presence: "#34D399"
  coral: "#EE766A"
  violet: "#A855F7"
  blue: "#3880DC"
  focus: "#4F46E5"
typography:
  display:
    fontFamily: "0xProto NF, ui-monospace, monospace"
    fontWeight: 700
    letterSpacing: "-0.04em"
    lineHeight: 1.15
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'SF Pro Display', Inter, system-ui, sans-serif"
    fontWeight: 400
    lineHeight: 1.65
rounded:
  sm: "0.5rem"
  md: "0.875rem"
  lg: "1.5rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  xxl: "4rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper-strong}"
    rounded: "{rounded.pill}"
    padding: "0.65rem 1.25rem"
  button-primary-hover:
    backgroundColor: "#120D18"
    textColor: "{colors.paper-strong}"
  button-secondary:
    backgroundColor: "{colors.paper-strong}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    padding: "0.65rem 1.25rem"
---

# Design System — The Prismatic Atelier

## Overview

111iridescence uses "The Prismatic Atelier" design system: a high-craft architectural studio aesthetic celebrating native macOS software. The system couples luminous pearl canvas backgrounds with deep obsidian ink typography, frosted crystalline glass surfaces (`backdrop-filter: blur(20px)`), hairline specular borders, and restrained optical refraction.

Iridescence is expressed as spectral caustics, subtle rim highlights, and dedicated app accents, rather than arbitrary loud rainbow gradients.

## Colors

### Canvas & Ink
- **Canvas Pearl (`--paper`)**: `#FAF9FC` (`oklch(98.4% 0.004 290)`). Soft luminous ground that avoids eye fatigue.
- **Deep Obsidian (`--ink`)**: `#16101D` (`oklch(14% 0.026 290)`). Dense, architectural typographic ink.
- **Pure Specular (`--paper-strong`)**: `#FFFFFF`. Used for card highlights and primary button text.
- **Readable Text (`--text`)**: `#221A2C`. Body copy with high contrast against the canvas.
- **Muted Lavender Slate (`--muted`)**: `#6C6274`. Secondary descriptions with 5.3:1 contrast against paper.
- **Hairline Border (`--line`)**: `#E2DDE7`. Structural card and table boundaries.
- **Subtle Hairline (`--line-subtle`)**: `#EEEAF2`. Inner glass subdivisions.

### Strategic Accents
- **Focus Ring (`--focus`)**: `#4F46E5` (`oklch(50% 0.22 270)`). 5.15:1 contrast accessible focus outline.
- **PDF Reader Accent (`--violet`)**: `#A855F7` (`oklch(62% 0.22 305)` — Prismatic Iris).
- **Mass Print Accent (`--blue`)**: `#3880DC` (`oklch(56% 0.18 245)` — Cerulean Beam).
- **Resource Guard Accent (`--presence`)**: `#34D399` (`oklch(76% 0.16 155)` — Emerald Phosphor).
- **Live Signal / Warning (`--coral`)**: `#EE766A` (`oklch(68% 0.16 34)`).

## Typography

### Font Families
- **Display & Code (`--font-display`)**: `0xProto NF`, `ui-monospace`, `monospace`. Gives technical provenance, precision kerning, and architectural confidence to headings and metadata tags.
- **Body & Prose (`--font-body`)**: `-apple-system`, `BlinkMacSystemFont`, `"SF Pro Text"`, `"SF Pro Display"`, `Inter`, `system-ui`, `sans-serif`. Clean Apple native readability for sustained paragraphs.

### Fluid Type Scale
- `--step--1`: `clamp(0.8125rem, 0.78rem + 0.12vw, 0.875rem)` (Small tags, pill badges, metadata).
- `--step-0`: `clamp(1rem, 0.96rem + 0.18vw, 1.125rem)` (Standard body prose, list items).
- `--step-1`: `clamp(1.25rem, 1.14rem + 0.45vw, 1.5rem)` (Section subheads, featured leads).
- `--step-2`: `clamp(1.75rem, 1.5rem + 1vw, 2.375rem)` (Major section titles).
- `--step-3`: `clamp(2.4rem, 1.95rem + 1.8vw, 3.5rem)` (Page heroes, studio display titles).

## Layout

### Container & Rhythm
- Maximum content width: `72rem` (`--container`).
- Prose line length: `70ch` (`--prose`).
- Container gutters: `1rem` on mobile (`< 48rem`), `2rem` on desktop (`>= 48rem`).
- Spatial scale: 4pt / 8pt grid intervals (`0.25rem`, `0.5rem`, `0.75rem`, `1rem`, `1.5rem`, `2rem`, `4.5rem`, `7rem`).

### Responsive Grid
- Desktop (`>= 58rem`): Asymmetric editorial bento grids and two-column hero displays.
- Tablet (`48rem - 58rem`): Balanced 2-column stacked features.
- Mobile (`< 48rem`): Cohesive single-column linear hierarchy with full-width action affordances.

## Elevation & Depth

- **Subtle Layering (`--shadow-sm`)**: `0 2px 6px rgba(22, 16, 29, 0.04), 0 1px 2px rgba(22, 16, 29, 0.02)`.
- **Soft Floating Glass (`--shadow-soft`)**: `0 14px 38px -10px rgba(22, 16, 29, 0.08), 0 4px 12px -2px rgba(22, 16, 29, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.95)`.
- **Mac Window Specular Elevation (`--shadow-window`)**: `0 32px 80px -16px rgba(22, 16, 29, 0.14), 0 8px 24px -4px rgba(22, 16, 29, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.95)`.
- **Glass Panel Surface**: Frosted crystal backdrop `rgba(255, 255, 255, 0.88)` with `backdrop-filter: blur(20px)` and 1px specular highlight.

## Shapes

- Small corners (`--radius-sm`): `0.5rem` (8px) for buttons, tags, code snippets.
- Standard cards (`--radius`): `0.875rem` (14px) for cards, preview boxes.
- Window frames (`--radius-large`): `1.5rem` (24px) for macOS application preview windows.
- Pills (`--radius-pill`): `9999px` for buttons, segmented tabs, and metadata chips.
- App icons: Squircle radius `22.37%` matching macOS Human Interface Guidelines.

## Components

### Buttons
- **Primary**: Deep obsidian background, optical white text, subtle top inset specular rim, pill radius.
- **Secondary**: Frosted glass background, ink text, subtle hairline border, pill radius.
- **Focus Indicator**: 3px solid `--focus` with 3px offset.

### macOS App Window Preview (`.app-window`)
- Frosted glass container with top gradient specular line, soft deep shadow, and native squircle window framing.

### Interactive Segmented Navigation (`.site-header`)
- Floating frosted glass capsule with centered studio links and language selector pill.

## Do's and Don'ts

### Do
- Use real screenshots and genuine software features.
- Honor macOS native design conventions and typography.
- Keep English primary and maintain 100% parity with French `/fr/`.
- Maintain strict contrast ratios (4.5:1+ for body text, 3:1+ for UI elements).
- Respect `prefers-reduced-motion` across all interactive and canvas elements.

### Don't
- Never use gaudy rainbow gradient backgrounds.
- Never invent product features, fake testimonials, or benchmark claims.
- Never disclose the author's personal name or private paths.
- Never break keyboard navigation or skip link functionality.
