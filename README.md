# Elemnexa

**Explore elements. Understand chemistry.**


A colorful, accessible chemistry learning platform built with Next.js and React. Explore all 118 elements, balance neutral chemical equations, calculate molar masses, consult a qualitative solubility matrix, experiment with a schematic atom model, and print practice worksheets.

## Development

Use Node.js 24 LTS (Node >=22.13 is supported) and npm. No database or API keys are required. The production origin defaults to `https://elemnexa.vercel.app`; override it with the `SITE_URL` build variable if needed (see `.env.example`).

```sh
npm ci
npm run dev
```

Open the local address shown by Next.js. Inter, Manrope, and Geist Mono are bundled locally: builds and visitors do not need Google Fonts access. The first dependency installation requires npm registry access.

```sh
npm run check
# Equivalent to lint + scientific regression tests + production build
npm run start
```

`npm test` runs the real calculation, element-data, and worksheet regression cases with Node's built-in test runner. Test isolation is explicitly disabled so sandboxed runners do not hide the individual case outcomes.

## Browser regression checks

```sh
npx playwright install --with-deps chromium firefox webkit
PLAYWRIGHT_CROSS_BROWSER=1 npm run test:e2e
```

Playwright starts a development server by default. To test a production build, start `npm run start` first and use:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

Alternatively, `PLAYWRIGHT_TEST_PRODUCTION=1 npm run test:e2e` lets Playwright start, wait for, and stop the production server after you build. Port 3000 must be free.

CI builds once and shares that artifact across three parallel test shards. Each shard uses Microsoft's Playwright image at the installed package version, with browser binaries and Linux dependencies already included; it does not run APT or download browsers. Every existing test and browser project remains enabled. Playwright has a ten-minute limit per shard so it can write diagnostics before the job deadline, and each shard uploads its report. The final `validate` check requires both the quality job and every browser shard to succeed.

A managed environment with an existing Chromium installation can set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. The default Chromium suite covers desktop (1440px), tablet (768px), the reviewed 776×751 layout, mobile (390px), and small mobile (320px), including keyboard controls, saved themes, calculations, print layouts, view switching, brand assets, empty states, and page overflow. Axe checks WCAG 2.2 AA rules in both themes across the table, cards, element details, tools, and worksheets. `npm run test:a11y` runs just those accessibility checks. `PLAYWRIGHT_CROSS_BROWSER=1` adds desktop Firefox and mobile WebKit; CI runs all three engines against a production build. Browser emulation supplements real-device testing; it does not establish compatibility with every browser or device.

For repeatable element-click measurements and React render-isolation checks, see [the interaction performance report](docs/ELEMENT-INTERACTION-PERFORMANCE.md) and `npm run profile:elements`.

## Scientific scope and references

- The balancer uses exact rational arithmetic and conserves atoms. It supports neutral formulas, nested parentheses/square brackets, Unicode subscripts, hydrates, and optional state suffixes. Charged species and isotope notation are rejected explicitly. Equations with multiple independent solutions need further constraints and are rejected instead of returning arbitrary coefficients.
- Molar mass uses tabulated average atomic weights. Bracketed values identify a representative isotope mass number, not a standard atomic weight or precise isotopic mass. Calculations involving those elements are approximations.
- Atom views are schematic shell models, not literal electron trajectories or predictions of nuclear stability. Ion shell layouts are approximate; physical properties depend on isotope, temperature, pressure, and allotrope.
- Solubility is qualitative. Temperature, concentration, pH, redox reactions, and hydrolysis can change outcomes; the matrix labels key reactions and exceptions.
- Missing properties are explicitly marked rather than fabricated. Predicted superheavy-element configurations are labelled. Each element's drawer exposes reference links and data notes.
- Electronic configurations and shell populations use the per-element references in [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30). Standard-weight conventions follow [CIAAW](https://ciaaw.org/atomic-weights.htm). Follow the individual element sources for measurement conditions and provenance.
- Previously missing details use pinned, cross-checked reference compilations. See the [physical-property and ionic-chemistry source record](docs/element-reference-sources.md) and [discovery/name-origin source record](docs/element-history-sources.md). Measured values, theoretical estimates, unavailable evaluated data, and naming origins are distinguished in the drawer.

The lightweight explorer index is generated from the authoritative profiles: after changing element data, run `npm run generate:data` and commit `data/element-index.js`. The parity regression verifies every indexed value against the sourced data.

The worksheet bank is finite. Filters can produce fewer unique questions than requested; the UI reports the available count and never silently duplicates questions to fill a sheet. Answer-key state is visible in both the app and printed output.

The footer links to [@ayvalor on Instagram](https://www.instagram.com/ayvalor/) and opens Instagram messages for feedback. The app does not collect or send feedback itself; Instagram sign-in may be required.

## Maintenance and security

See [the repair and validation notes](docs/REPAIR-NOTES.md). Keep the lockfile committed, run the regression suite after changing scientific data, and check dependency advisories regularly. Generated outputs, dependencies, logs, and local environment files are ignored by Git.

## Design and interaction

- A shared teal, violet, and warm neutral palette with dedicated light/dark tokens in `app/globals.css`. Element-family colors are consistent across the legend, cards, and detail panels.
- Light theme by default with a persistent manual light/dark choice, reduced-motion support, focus outlines, keyboard tabs, modal focus containment/restoration, and screen-reader announcements.
- The table preserves scientific positions when filtering. Mobile starts with readable cards; the view switch makes both layouts available on every screen. Press `/` outside a text field to search. **Surprise me** opens one of the 118 element stories.
- Local fonts and optimized artwork, static prerendering, lazy-loaded tools and details, memoized tiles, and CSS transitions keep the app independent of remote services. No analytics, accounts, or tracking cookies are included.
- The generated teal–violet E forms the first letter of the header wordmark and is shared by the icons and social card. See [the brand source and regeneration notes](assets/brand/README.md); `npm run generate:brand` exports all sizes from the original transparent artwork.
- The install manifest supplies regular and maskable icons. Installation does **not** imply offline availability: there is no service worker or offline cache.

## Production deployment

1. Use Node.js 24 LTS and run `npm ci`.
2. Set `SITE_URL=https://elemnexa.vercel.app`, then run `npm run check`.
3. Run the browser suite against `npm run start`, as shown above. Serve the application over HTTPS using a Next.js-compatible platform or reverse proxy.
4. Confirm the canonical URL, social image, `/robots.txt`, `/sitemap.xml`, security headers, and icons on the deployed host. If `SITE_URL` is unset, metadata and the sitemap use the planned `https://elemnexa.vercel.app` origin.

Source links continue to use the existing [GitHub repository](https://github.com/ayvalor/Rasayan-Lab). The application and package are branded Elemnexa; changing the GitHub repository slug or production hostname is a separate hosting operation. If the repository is renamed, update its clone URL, remote, and source links after GitHub confirms the new address.

The scoped `minimatch` override patches GHSA-g3hv-75wg-m249 in the development-only TypeScript ESLint dependency tree. It retains the API used by the parser; lint and build checks cover the updated toolchain. Remove it once the upstream parser requires a patched release. Run `npm audit` regularly; a clean audit is a point-in-time dependency check, not a security guarantee.

See [the Elemnexa release notes](docs/ELEMNEXA-RELEASE.md) for the validation record and deployment limitations.

## Vercel subdomain migration

The planned production URL is **https://elemnexa.vercel.app**, using Vercel’s free subdomain. A custom domain purchase or Wix DNS setup is not required. `SITE_URL` controls SEO output; it does not rename a Vercel project, assign a domain, or change routing.

1. Keep the existing live deployment and its URL in place while reviewing this branch. Do not remove its domain or add a redirect before the new address is assigned and verified.
2. If deploying these changes to the existing live host before migration, set `SITE_URL` to that host’s current public origin at build time. This keeps canonical and sitemap URLs aligned with the site actually serving production.
3. When ready, manually configure the intended free subdomain in Vercel and verify its availability. Use the detected **Next.js** framework preset, Node.js **24.x**, and the normal `npm run build` command; no custom output directory is required.
4. Set `SITE_URL=https://elemnexa.vercel.app` for the intended production deployment and rebuild. Verify the canonical tag, Open Graph/Twitter URLs, `/sitemap.xml`, `/robots.txt`, and image URLs on the new host before switching traffic or changing old-domain routing.

No Vercel project settings, environment variables, domain assignments, deployment URLs, DNS records, or redirects are changed by this source configuration. Existing `SITE_URL` settings continue to take precedence over the default; update them manually at the appropriate migration stage.
