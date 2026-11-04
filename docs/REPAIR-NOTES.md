# Repair and validation notes

This review addresses the application source at `f6807f16d825307b47577e69760c365cca917895`. It is a concrete regression-tested repair, not a guarantee that every possible input, device, or scientific datum has been independently verified.

## Correctness

| Original issue | Change |
| --- | --- |
| Formula parser ignored unknown characters, malformed groups, and unknown symbols; invalid input could produce plausible masses. | Strict bounded parsing with explicit error messages, nested groups, Unicode subscripts, and dot hydrates. |
| Equation balancing brute-forced small coefficients and rejected larger or six-compound equations. | Exact rational null-space solver with reduced integer coefficients, bounded input, atom conservation checks, and explicit rejection of ambiguous or impossible equations. |
| Calculated values could remain visible after editing their input. | Results clear on edits and recalculate on explicit submission. |
| Blanket solubility rules misclassified some salts/reactions. | Corrected sulfate/hydroxide exceptions and explicit redox/hydrolysis outcomes; the UI explains qualitative limits. |
| Shells were inferred from electron count alone; nuclear stability was guessed from a ratio. | Element-aware shell populations, ion adjustments, and explicit schematic/isotope limitations. Removed unsupported nuclear-stability claims. |
| Generic synthesized element descriptions implied known applications, hazards, or valence information. | Reference-backed configurations, explicit missing-data states, variable d/f valence descriptions, isotope-specific neutron counts, and source links. |
| Synthetic origin was treated as a physical phase. | Separate synthetic-origin flag/filter; unestablished bulk phases remain Unknown. |
| Worksheet settings could imply more questions than the bank supplied; random initial state and effect updates were fragile. | Deterministic initial sheet, unbiased shuffle on generation, unique questions, bank-size disclosure, pending-setting notice, and explicit student/answer-key print state. |

## Interaction, design, and performance

- Rebuilt responsive navigation and page spacing; main workspaces retain user state after tab switches and expensive workspaces load on demand.
- Fixed Tailwind class-driven dark mode; applied saved/system theme before paint and handled disabled or full browser storage.
- Replaced click-only element divs with native buttons. Added input labels, result announcements, keyboard tab navigation, empty states, and visible keyboard focus.
- Added modal semantics, focus containment/restoration, Escape dismissal, background inertness, body scroll locking, and working drawer exit transitions.
- Removed continuous background movement, per-pointer React state updates, and per-tile blur. Animations respect reduced-motion preferences; atom rendering pauses when hidden/offscreen and starts paused.
- Bundled Geist/Geist Mono through Fontsource, eliminating third-party font requests and the blocked build dependency.
- Corrected print rules so student details and the worksheet heading remain visible, dark mode prints legibly, questions avoid page splits, and inactive workspaces stay hidden.

## Security and dependency review

Updated Next.js to 16.4.5 and React/React DOM to 19.3.1, refreshed compatible transitive dependencies, and retained a lockfile. Added content-type sniffing, framing, referrer, and permissions headers, plus a focused CSP for objects, base URLs, form actions, and embedding. The CSP intentionally does not claim to eliminate all inline-script risks. The app has no authentication, database, secret-bearing API, or server-side user-data store.

The initial npm audit reported 25 findings, including 1 critical and 8 high. After updates, the production dependency audit (`npm audit --omit=dev`) reports zero known vulnerabilities. The full development audit still reports 16 moderate dependency-chain findings stemming from [minimatch GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249), affecting crafted glob input to development tools. These packages are not in the production runtime dependency set. Next's current lint plugins support ESLint 9; ESLint 10 produces invalid peer relationships, and npm's suggested forced downgrades would replace the supported toolchain. No incompatible override, disabled rule, or forced downgrade was used to conceal this limitation. Revisit when upstream plugins support fixed dependencies; do not feed untrusted arbitrary glob patterns to development tooling.

## Validation

Final local results: clean `npm ci`, zero lint errors/warnings, **20/20 unit cases**, **40/40 production-browser cases**, successful production build/startup, and **0 production dependency advisories**. All tests ran; none were skipped. Reference-backed physical-property coverage increased from 43 to 85 elements, while shell/configuration coverage is all 118.

Run the documented commands in README.md. Unit regressions independently check formula parsing, exact balances, atom conservation across the entire reaction bank, molar masses, electron shells, isotope data, and worksheet filtering/formatting. Browser regressions cover four viewport sizes, both themes, local-storage failures, keyboard/modal interactions, calculations, filters, worksheet generation and print styling, response headers, and font requests. The production build is also exercised locally.

The GitHub Actions workflow repeats lint, unit tests, a production dependency audit, production build, and Chromium browser tests. Its remote outcome must be checked after push; a local pass does not establish that the hosted workflow ran successfully. Testing here uses Chromium emulation, not physical iOS/Android hardware or every browser engine.
