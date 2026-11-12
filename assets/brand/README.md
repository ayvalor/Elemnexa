# Elemnexa identity

The mark is an AI-generated geometric E with a hexagonal negative-space detail and a teal–violet gradient. The source has real alpha transparency. Use the same colors on light and dark surfaces; do not apply theme filters or recolor it.

`elemnexa-logo-source.png` preserves the original high-resolution generation. GPT Image 2.6 was attempted through Higgsfield, but the connected account rejected it because a Basic plan or higher was required. The supplied image-generation tool produced the final artwork; its exact model version was not exposed. Created November 12, 2026.

`npm run generate:brand` trims transparent padding and exports the same artwork at the sizes needed by the application. It uses Sharp already supplied by Next.js and Playwright already used by the tests. Install Chromium with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an installed browser. The social card renders offline with the locally bundled Manrope font. Its displayed hostname follows `SITE_URL` when regenerating; metadata always follows the configured production origin.

- `public/elemnexa-mark.png`: transparent 512px mark used as the header wordmark’s initial E and by the install manifest. The header retains the complete accessible name “Elemnexa”; Next.js serves appropriately sized responsive variants.
- `public/icon-192.png`: transparent 192px install icon.
- `app/icon.png`: transparent 96px browser/search icon.
- `app/favicon.ico`: transparent 16/32/48px frames.
- `app/apple-icon.png`: opaque 180px Apple touch icon.
- `public/icon-maskable.png`: opaque 512px install icon; all artwork remains inside the central 80%-diameter safe circle.
- `public/elemnexa-social.png`: opaque 1200 × 630 Open Graph/Twitter preview, with a distinct filename to avoid reusing the old cached card.

Apple and maskable icons intentionally use a light solid surface required for predictable home-screen presentation. The source and website marks remain transparent. All assets are local; no generation service, external image host, or additional dependency is used at runtime. Assets are checked in; generation is a maintenance command, not part of the production build.
