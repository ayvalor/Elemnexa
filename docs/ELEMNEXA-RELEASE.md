# Elemnexa release notes

The project is now **Elemnexa — Explore elements. Understand chemistry.** The existing 118-element reference dataset, exact equation balancer, molar-mass calculator, qualitative solubility matrix, schematic atom explorer, and printable worksheet generator remain available.

## Changes

- Generated teal–violet E identity with a hexagonal detail, favicon, Apple icon, regular/maskable install icons, social preview, page metadata, error and missing-page screens, package name, and documentation. Source artwork and export instructions are in `assets/brand/README.md`.
- Shared light/dark design tokens, colorful element families, interactive discovery cards, clearer workspace navigation, responsive table/card switching, keyboard search, and random discovery.
- CSS entry/hover transitions with reduced-motion support replace Framer Motion and its two dependencies. Focus trapping, background inertness, Escape, focus restoration, and scroll restoration remain in the drawer.
- Compact generated element index on the initial page. Detailed, sourced profiles and tools load on demand. Index parity is checked against the original data. Offscreen cards use progressive CSS rendering containment; browsers without support retain the full layout.
- Contrast fixes across element cards, detail panels, subatomic counts, hazards, mnemonics, balanced results, and solubility badges. Accessible tile names now retain their visible content.
- Scoped development-tool dependency override for GHSA-g3hv-75wg-m249. Security headers, neutral-formula validation, React escaping, and safe external-link attributes are preserved.
- Axe accessibility tests, rebrand/discovery/view-switch regressions, origin configuration validation, and CI for a production build in Chromium, Firefox, and WebKit.

## Validation

Validation was performed in the managed Linux workspace on 11 November 2026 with Node.js 24 and Chromium. See the PR description for the final regression totals.

- ESLint with zero warnings, scientific/data/configuration tests, and Next.js production build pass.
- `npm audit` reports zero vulnerabilities, including development dependencies.
- Axe checks cover WCAG A/AA rules through WCAG 2.2 across both themes and the table, cards, four detail tabs, expanded mnemonic, all four chemistry tools, selected solubility results, and worksheet answer keys.
- Mobile Lighthouse 13.6.0, local production server, default simulated mobile throttling: **90 performance, 100 accessibility, 100 best practices, 100 SEO**. FCP/LCP approximately **1.1 s**, total blocking time **430 ms**, CLS **0.003**. These are lab measurements, not field guarantees; deployed hosting, devices, and network conditions affect results. Local audits under concurrent test load scored lower, so the reported performance run used the idle app.
- Manual visual review covers desktop and mobile in both themes. Regression coverage includes 1440, 776, 768, 390, and 320 pixel widths, keyboard interaction, theme persistence/blocked storage, filtering, scientific calculations, source notes, canvas rendering, printing, and document overflow.

Automated checks do not establish full accessibility conformance or replace assistive-technology and real-device review. Firefox/WebKit downloads were denied by the managed environment's domain policy; those local runs could not be performed. CI is configured to install and run all three engines; consult its result before release.

## Deployment

The planned production origin is **https://elemnexa.vercel.app**, using Vercel’s free subdomain. It is the source default for canonical URLs, social-image URLs, robots, and the sitemap. `SITE_URL` remains a build-time override. The README describes a manual, staged migration: keep `SITE_URL` aligned with the existing live origin until the new address is assigned and verified, then set it to the new origin and rebuild. No Vercel settings, deployment URLs, domain assignments, DNS records, or redirects are changed automatically. No custom domain purchase is planned.

The GitHub repository address remains `ayvalor/Rasayan-Lab` so source links remain valid. The code and user-facing brand use Elemnexa. Rename the GitHub repository in its settings and update the remote/source links when the new address is confirmed.

The web manifest provides installation identity only; offline access is not implemented. The CSP restricts objects, base URLs, framing, and form destinations; it is not a nonce-based strict script policy. No user data is sent to a server by the app. Feedback explicitly opens Instagram.
