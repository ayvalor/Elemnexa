# Rasayan Lab

An interactive chemistry learning workspace built with Next.js and React. Explore all 118 elements, balance neutral chemical equations, calculate molar masses, consult a qualitative solubility matrix, experiment with a schematic atom model, and print practice worksheets.

## Development

Use Node.js 24 LTS (Node >=22.13 is supported) and npm. No database, API keys, or environment variables are required.

```sh
npm ci
npm run dev
```

Open the local address shown by Next.js. Inter, Manrope, and Geist Mono are bundled locally: builds and visitors do not need Google Fonts access. The first dependency installation requires npm registry access.

```sh
npm run lint
npm test
npm run build
npm run start
```

`npm test` runs the real calculation, element-data, and worksheet regression cases with Node's built-in test runner. Test isolation is explicitly disabled so sandboxed runners do not hide the individual case outcomes.

## Browser regression checks

```sh
npx playwright install chromium
npm run test:e2e
```

Playwright starts a development server by default. To test a production build, start `npm run start` first and use:

```sh
PLAYWRIGHT_BASE_URL=http://127.0.0.1:3000 npm run test:e2e
```

A managed environment with an existing Chromium installation can set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. Tests cover desktop (1440px), tablet (768px), the reviewed 776×751 layout, mobile (390px), and small mobile (320px), including keyboard controls, saved themes, calculations, print layouts, and page overflow. Browser emulation supplements real-device testing; it does not establish compatibility with every browser or device.

## Scientific scope and references

- The balancer uses exact rational arithmetic and conserves atoms. It supports neutral formulas, nested parentheses/square brackets, Unicode subscripts, hydrates, and optional state suffixes. Charged species and isotope notation are rejected explicitly. Equations with multiple independent solutions need further constraints and are rejected instead of returning arbitrary coefficients.
- Molar mass uses tabulated average atomic weights. Bracketed values identify a representative isotope mass number, not a standard atomic weight or precise isotopic mass. Calculations involving those elements are approximations.
- Atom views are schematic shell models, not literal electron trajectories or predictions of nuclear stability. Ion shell layouts are approximate; physical properties depend on isotope, temperature, pressure, and allotrope.
- Solubility is qualitative. Temperature, concentration, pH, redox reactions, and hydrolysis can change outcomes; the matrix labels key reactions and exceptions.
- Missing properties are explicitly marked rather than fabricated. Predicted superheavy-element configurations are labelled. Each element's drawer exposes reference links and data notes.
- Electronic configurations and shell populations use the per-element references in [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON/tree/a78c7a48fe7235cebd6153161a9e7fa70f0cfb30). Standard-weight conventions follow [CIAAW](https://ciaaw.org/atomic-weights.htm). Follow the individual element sources for measurement conditions and provenance.
- Previously missing details use pinned, cross-checked reference compilations. See the [physical-property and ionic-chemistry source record](docs/element-reference-sources.md) and [discovery/name-origin source record](docs/element-history-sources.md). Measured values, theoretical estimates, unavailable evaluated data, and naming origins are distinguished in the drawer.

The worksheet bank is finite. Filters can produce fewer unique questions than requested; the UI reports the available count and never silently duplicates questions to fill a sheet. Answer-key state is visible in both the app and printed output.

The footer links to [@ayvalor on Instagram](https://www.instagram.com/ayvalor/) and opens Instagram messages for feedback. The app does not collect or send feedback itself; Instagram sign-in may be required.

## Maintenance and security

See [the repair and validation notes](docs/REPAIR-NOTES.md). Keep the lockfile committed, run the regression suite after changing scientific data, and check dependency advisories regularly. Generated outputs, dependencies, logs, and local environment files are ignored by Git.
