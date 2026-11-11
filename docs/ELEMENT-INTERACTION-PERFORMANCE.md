# Element-detail interaction performance

Measured on 2026-11-11 against the production application at baseline commit `1d6dfdd` and this change. The Vercel preview host was blocked by the development environment's network policy, so these measurements use local production servers, not a remote deployment.

## Findings and changes

Chrome tracing reproduced a 224 ms element-tile interaction with 4× CPU slowdown. The click handler's state update caused `Home` and `PeriodicTable` to render, including the 118 preview-card icons even when the periodic-table view was active. The tile component was already memoized. React profiling attributed roughly 9–19 ms of these sampled updates to the explorer alone. The profile-data lookup was not a material bottleneck.

The drawer effect then read the document width after mounting its DOM, wrote scroll-lock and inert state, and focused the close button. Trace stacks identified forced style/layout at both the width read and the subsequent focus operation.

`ElementDetailsProvider` now owns selection state and provides a stable open callback. The unchanged page is its child, so opening and closing details does not render the explorer or any previously opened learning workspace. The drawer is a sibling of the application shell, allowing the existing focus/inert handling to isolate the background as one subtree. The open callback measures the scrollbar before mounting the drawer, avoiding the extra post-mount geometry read. Detailed data and the drawer remain lazy-loaded. No CSS, scientific data, or dependencies changed.

## Browser measurements

Chromium **155.0.8059.79**, Linux, 1440 × 1000 viewport, light theme, animations enabled, 4× CPU slowdown. Each build had five fresh browser contexts with one cold open and six repeat opens per context. Identical element sequence: C, H, Og, Au, O, Fe, C. Standard production builds were used for the timing comparison; React profiling was measured separately. Raw per-click observations are in [the sample CSV](performance/element-click-samples.csv).

| Metric | Before | After |
| --- | ---: | ---: |
| Repeat-click Event Timing median, 30 samples | 160 ms | 128 ms |
| Repeat-click Event Timing p95 | 232 ms | 184 ms |
| Repeat-click processing median | 81.5 ms | 55.6 ms |
| Repeat-click JavaScript CPU median | 38.3 ms | 18.3 ms |
| Repeat-open modal next-frame median | 132.3 ms | 98.4 ms |
| Cold-open modal next-frame median, 5 samples | 391.6 ms | 325.5 ms |
| Cold-click Event Timing median / p95 | 96 / 112 ms | 80 / 128 ms |

Event Timing is quantized to 8 ms. The modal measurement uses a double `requestAnimationFrame` after insertion: it measures a paint opportunity, not actual pixel presentation. A cold click can paint before its lazy-loaded modal appears, so its Event Timing duration does not describe the entire loading delay. The cold p95 increased in this small sample even though median loading time improved. These are local lab observations, not field INP or a guarantee for all devices and networks.

React's profiling build confirmed no `Home` or `PeriodicTable` render on any of seven sampled opens after the change. The dedicated isolation assertion checks this without a machine-dependent timing budget. Before/after modal screenshots had zero changed pixels at desktop and mobile sizes in both light and dark themes. Existing animations, keyboard navigation, focus trapping, focus restoration, scroll lock, and all detail tabs remain covered by the browser suite. An additional test repeats opens and closes while checking explorer state and cleanup.

## Reproduce

Build normally and start a production server, then run the benchmark in a second terminal. Keep other CPU-heavy work idle during measurements:

```sh
npm run build
npm run start
```

```sh
PERF_BASE_URL=http://127.0.0.1:3000 PERF_OUTPUT=test-results/element-performance PERF_TRACE=1 npm run profile:elements
```

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium installation. `PERF_CPU_RATE` defaults to 4, `PERF_RUNS` to 5; `PERF_MOBILE=1` measures table-view clicks at 390 × 844. Output includes raw observations and optional cold/warm traces that Chrome DevTools can load. Values under the 16 ms Event Timing reporting threshold are represented as zero.

To check React render isolation, stop the server, rebuild with profiling enabled, restart, then run:

```sh
npm run build -- --profile --no-mangling
npm run start
```

```sh
PERF_REACT=1 PERF_ASSERT_ISOLATION=1 PERF_RUNS=1 npm run profile:elements
```

The diagnostic hook checks named render fibers and ignores reused bailout subtrees. Rebuild normally before deployment or timing comparisons; neither profiling instrumentation nor trace collection is enabled in application code.
