---
name: 111iridescence
description: A bilingual showcase for native macOS software, built around the pixel wordmark and authentic app previews.
colors:
  paper: "#F7F8FD"
  paper-strong: "#FDFDFF"
  ink: "#141B34"
  text: "#212841"
  muted: "#4F5976"
  line: "#D0D7EB"
  action: "#264396"
  focus: "#3541BB"
  field-blue: "oklch(92% 0.045 264)"
  field-violet: "oklch(93% 0.035 307)"
  field-cyan: "oklch(92% 0.037 215)"
  field-green: "oklch(93% 0.04 166)"
---

# 111iridescence web design

The pixel wordmark opens the home page on a pale blue field. The app index follows with a short introduction and five icon shortcuts. Each showcase pairs a native screenshot with the app name, a product link, and a direct download action. They use alternating text and image columns on wide screens and follow the document order on narrow screens.

The catalogue uses compact rows so visitors can compare descriptions and compatibility. Each product page places its name, compatibility, and current download beside a real app screenshot. App-specific chapters, galleries, and the Mass Print ordering demonstration follow the overview. A native disclosure presents release notes in the download section.

About uses a wide introduction, a reading layout for the studio's areas of work, and a dark section for the AI disclosure and creation process. The footer uses the same dark ink as this section.

## Typography and layout

- Use the system sans serif for headings, reading copy, and buttons. Use the self-hosted 0xProto NF for the brand, site navigation, and release metadata.
- Use the shared 77rem container with 1rem mobile gutters and 2rem desktop gutters. Product heroes and home showcases stack below 58rem. Catalogue rows stack below 46rem.
- The paper and ink tokens are shared across public routes. Cyan identifies Installer previews, blue identifies Mass Print, green identifies Resource Guard, and violet identifies PDF Reader and QuickPad.
- Use an 8px radius for controls, a 14px radius for screenshots, and a 24px radius for large preview fields. Apply elevation to app screenshots and icons where it helps distinguish them from the page.

## Interaction and assets

- Use links for navigation and downloads, buttons for retry and ordering actions, and native disclosure controls for release notes. Keep the current section and selected language visually identifiable.
- Preserve visible keyboard focus, the skip link, the no-script wordmark fallback, and the static canvas frame under reduced motion.
- Use the app icons and captures documented in [public/apps/README.md](public/apps/README.md). Product preview fields sit behind the captures. The canvas and About illustration are decorative and hidden from assistive technology.
- Serve English at the root and the corresponding French routes under `/fr/`.
