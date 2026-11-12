# Reliability, performance, and security review

Reviewed 13 November 2026 (IST), starting from `bb34249` on `main`. Scope: the Next.js application, chemistry and worksheet calculations, element drawer, canvas lifecycle, dependency lockfile, security headers, external links, and existing CI configuration.

No exploitable security vulnerability was confirmed in the reviewed paths. The application has no application API routes, accounts, database, uploads, or privileged mutations. The security changes below add browser restrictions; they do not represent a claim that the application is vulnerability-free.

## Findings and changes

| ID | Severity / confidence | Affected path | Impact and reproduction | Remediation | Verification |
| --- | --- | --- | --- | --- | --- |
| R1 | Low / confirmed | `components/ChemistryWorkspace.js` | Select an Ag⁺/Cl⁻ solubility cell and close its details. Focus moved to `BODY`, losing the keyboard user's position. | Restore focus to the selected cell. Its ref follows remounts when switching tools. | Browser regression selects a cell, switches tools and returns, closes details, and checks focus. |
| R2 | Low / confirmed | `lib/chemistry.mjs`, `components/ChemistryWorkspace.js` | Og and Tc use representative isotope mass numbers, but calculator output described them as atomic masses and presented the total without an approximation label. | Carry mass provenance into results, mark approximate totals, show bracketed mass numbers, and explain the limitation. Calculated numerical values are unchanged. | Unit cases for H₂O, TcO₂, and Og; browser checks that the approximation appears for Og and clears for H₂O. |
| R3 | Low / confirmed | `components/chemistry-workspace.css` | At 320px, valid `Og1000000` widened the page to 332px because the large result could not wrap. | Allow long result values to wrap within the calculator. | Browser regression checks the full supported large result and page width at every viewport. |
| P1 | Improvement / confirmed | `components/ChemistryWorkspace.js` | Opening the equation balancer loaded the atom renderer even when the atom tool was never used. | Load the atom renderer on first use, with a loading status. Preserve its mounted state after visiting it. | Browser request inspection confirmed no atom-module request before selecting the atom tool, followed by its request and working canvas after selection. The workspace's emitted JS chunk fell from 40,262 to about 27,800 uncompressed bytes, approximately 31%; the atom module is deferred. |
| S1 | Hardening / confirmed | `next.config.mjs` | Inline HTML event attributes and external script-initiated connections were not restricted by the existing partial CSP. No input-to-script exploit was found. | Block inline HTML event handlers. Restrict production connections to the app origin; keep development HMR connections compatible. | Browser tests exercise blocked inline handlers, blocked external fetch with CSP violation events, successful same-origin fetch, search, and theme controls. |

## Validation

Completed locally: lint passed; 31 unit/regression tests passed with none skipped; production build passed; all 145 Chromium browser tests passed across the five viewport projects; dependency audit reported zero known vulnerabilities. The production browser run includes the new focus, approximation, large-result, and CSP enforcement assertions.

Run the source and production checks from the repository root:

```sh
npm run check
npm audit --audit-level=moderate
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium \
  PLAYWRIGHT_TEST_PRODUCTION=1 npm run test:e2e
```

The calculation review also checked 2,000 generated hydrocarbon balances for atom conservation. Existing limits remain: 256 formula characters, 16 nesting levels, at most 1,000,000 atoms per element, 1,024 equation characters, and 12 compounds. No confirmed parser, balancing, or worksheet bug was found in those checks.

The source review found no credential-pattern matches in tracked text, no user-controlled raw-HTML sink, and no non-HTTPS or credential-bearing URLs in the compiled element references. The only raw-HTML script is a constant theme bootstrap. External links retain their opener protections. Dependency audit reported zero known vulnerabilities for the existing lockfile; dependencies were not changed.

## Limits and operating implications

Local browser checks use Chromium at five viewport sizes. Firefox/WebKit and the deployed Vercel instance were not validated in this environment; the repository's CI includes all three engines. No live attack testing or deployment/account administration was performed.

The bundle-size result measures one emitted JS chunk and deferred loading, not total transferred page bytes, field INP, or a guaranteed FPS increase. Existing offscreen/hidden-document animation suspension was inspected and retained.

The CSP is deliberately partial: it does not add a general `script-src` policy or claim to prevent every XSS technique. A future external API, telemetry service, or browser connection requires an explicit production `connect-src` decision. Continue running dependency audits and regression checks when updating dependencies or sourced scientific data.
