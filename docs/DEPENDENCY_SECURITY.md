# Dependency security review — 18 November 2026

The release updates Astro to 7.4.12, MDX to 7.0.8, sitemap to 3.7.5, Astro Check to 0.9.12, Vitest to 4.1.12 and Wrangler to 4.164.0. Compatible transitive fixes are locked in package-lock.json. CI and the package engine requirement use Node.js 22.23.4 or later, as required by the patched Astro version.

The original dependency audit reported one critical and 23 high-severity package entries. After the updates and compatible fixes, no critical findings remain. Fifteen high-severity package entries trace to one outstanding advisory: picomatch glob-pattern denial of service. The upstream advisory lists no patched version. Do not describe this dependency tree as vulnerability-free. [picomatch advisory](https://github.com/advisories/GHSA-fc5q-39xc-vjpf)

The original Astro AVIF-image optimisation issue is fixed in Astro 7.2.8 and later; the chosen version also includes subsequent same-major fixes. [Astro advisory](https://github.com/advisories/GHSA-26w7-cxv4-gfx2)

The outstanding glob issue concerns build/development dependencies receiving attacker-controlled glob patterns. Build inputs are the checked-in source and configuration. The deployed service is a custom Cloudflare Worker serving prebuilt assets, not an Astro development server. Confirm the Worker bundle excludes picomatch and build tools in every release review; this document alone is not evidence that a future import is safe.

Publishing now runs Astro checks and unit tests before the static build. The npm audit step blocks critical findings instead of ignoring its exit status. Outstanding high-severity findings remain visible in the audit output and require review; do not use a forced downgrade across framework majors to hide them. Revisit this assessment when a patched glob package is available, build inputs change, or the deployed Worker imports additional dependencies.
