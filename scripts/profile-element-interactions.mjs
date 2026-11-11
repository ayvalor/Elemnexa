// Run against a production server. Results are lab measurements, not field INP.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = process.env.PERF_BASE_URL || 'http://127.0.0.1:3000';
const output = resolve(process.env.PERF_OUTPUT || 'test-results/element-performance');
const cpuRate = Number(process.env.PERF_CPU_RATE || 4);
const runs = Number(process.env.PERF_RUNS || 5);
const mobile = process.env.PERF_MOBILE === '1';
const reactProfile = process.env.PERF_REACT === '1';
const assertIsolation = process.env.PERF_ASSERT_ISOLATION === '1';
const traceEnabled = process.env.PERF_TRACE === '1';
if (!Number.isFinite(cpuRate) || cpuRate < 1 || !Number.isInteger(runs) || runs < 1 || runs > 20) {
  throw new Error('Use PERF_CPU_RATE >= 1 and an integer PERF_RUNS between 1 and 20.');
}
if (assertIsolation && !reactProfile) throw new Error('PERF_ASSERT_ISOLATION requires PERF_REACT=1 and a --profile --no-mangling build.');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
  args: ['--disable-gpu'],
});
const samples = [];
try {
  for (let run = 0; run < runs; run++) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
      isMobile: mobile, hasTouch: mobile, reducedMotion: 'no-preference', colorScheme: 'light',
    });
    const page = await context.newPage();
    await page.addInitScript(({ reactProfile }) => {
      window.__elementPerf = { events: [], longTasks: [], opens: [], commits: [] };
      new PerformanceObserver(list => {
        window.__elementPerf.events.push(...list.getEntries().filter(e => e.interactionId).map(e => ({
          name: e.name, interactionId: e.interactionId, duration: e.duration,
          inputDelay: e.processingStart - e.startTime,
          processing: e.processingEnd - e.processingStart,
          presentation: e.startTime + e.duration - e.processingEnd,
        })));
      }).observe({ type: 'event', buffered: true, durationThreshold: 16 });
      new PerformanceObserver(list => {
        window.__elementPerf.longTasks.push(...list.getEntries().map(e => ({ duration: e.duration })));
      }).observe({ type: 'longtask', buffered: true });
      document.addEventListener('pointerdown', event => {
        if (event.target.closest('.element-tile')) window.__elementClickStart = performance.now();
      }, true);
      const seen = new WeakSet();
      new MutationObserver(() => {
        const modal = document.querySelector('[role=dialog]');
        if (modal && !seen.has(modal)) {
          seen.add(modal);
          const inserted = performance.now() - window.__elementClickStart;
          requestAnimationFrame(() => requestAnimationFrame(() => {
            window.__elementPerf.opens.push({ inserted, nextFrame: performance.now() - window.__elementClickStart });
          }));
        }
      }).observe(document, { childList: true, subtree: true });
      // Optional diagnostic hook for `next build --profile --no-mangling`.
      // Bailout subtrees retain old flags: do not count them as new renders.
      if (reactProfile) window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
        supportsFiber: true,
        inject() { return 1; },
        onCommitFiberRoot(id, root) {
          const renders = [];
          function visit(fiber) {
            if (!fiber) return;
            const name = typeof fiber.type === 'function' ? fiber.type.displayName || fiber.type.name : fiber.type?.displayName;
            if (name && (fiber.flags & 1)) renders.push({ name, duration: fiber.actualDuration });
            if (!fiber.alternate || fiber.child !== fiber.alternate.child) visit(fiber.child);
            visit(fiber.sibling);
          }
          visit(root.current);
          window.__elementPerf.commits.push({ duration: root.current.actualDuration, renders });
        },
        onCommitFiberUnmount() {},
      };
    }, { reactProfile });
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpuRate });
    await cdp.send('Performance.enable');
    await page.goto(baseURL);
    // Confirm hydration using the responsive state and an actual search update.
    if (mobile) await page.waitForFunction(() => document.querySelector('[aria-label="Element cards view"]')?.getAttribute('aria-pressed') === 'true');
    const search = page.getByRole('searchbox');
    await search.fill('Carbon');
    await page.getByRole('status').filter({ hasText: '1 of 118 elements' }).waitFor();
    await search.clear();
    if (mobile) await page.getByRole('button', { name: 'Periodic table view' }).click();
    await page.evaluate(() => document.fonts.ready);
    const numbers = [6, 1, 118, 79, 8, 26, 6];
    for (const [index, number] of numbers.entries()) {
      const tile = page.locator(`.element-tile[data-element-number="${number}"]`);
      await tile.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      // Settle the existing hover/close animation before the next measured click.
      await page.waitForTimeout(350);
      await page.evaluate(() => { for (const key of Object.keys(window.__elementPerf)) window.__elementPerf[key] = []; });
      const before = await cdp.send('Performance.getMetrics');
      const trace = [];
      const capture = traceEnabled && run === 0 && [0, 3].includes(index);
      const collect = event => trace.push(...event.value);
      if (capture) {
        cdp.on('Tracing.dataCollected', collect);
        await cdp.send('Tracing.start', {
          categories: 'devtools.timeline,v8.execute,disabled-by-default-devtools.timeline.stack,blink.user_timing',
          transferMode: 'ReportEvents',
        });
      }
      await tile.click();
      await page.getByRole('dialog').waitFor();
      // Event Timing is delivered after painting; include the unchanged entrance animation.
      await page.waitForTimeout(450);
      const after = await cdp.send('Performance.getMetrics');
      const measurement = await page.evaluate(() => window.__elementPerf);
      const metrics = Object.fromEntries(after.metrics.filter(m => ['TaskDuration', 'ScriptDuration', 'LayoutDuration', 'RecalcStyleDuration', 'LayoutCount', 'RecalcStyleCount'].includes(m.name))
        .map(m => [m.name, m.value - before.metrics.find(previous => previous.name === m.name).value]));
      if (capture) {
        const done = new Promise(resolve => cdp.once('Tracing.tracingComplete', resolve));
        await cdp.send('Tracing.end');
        await done;
        cdp.off('Tracing.dataCollected', collect);
        await writeFile(resolve(output, `${index === 0 ? 'cold' : 'warm'}-trace.json`), JSON.stringify({ traceEvents: trace }));
      }
      samples.push({ run, number, cold: index === 0, ...measurement, metrics });
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'detached' });
    }
    await context.close();
  }
  const percentile = (values, fraction) => [...values].sort((a, b) => a - b)[Math.max(0, Math.ceil(values.length * fraction) - 1)];
  const summarize = rows => {
    const interaction = rows.map(s => Math.max(0, ...s.events.map(e => e.duration)));
    const nextFrame = rows.map(s => s.opens[0]?.nextFrame).filter(Number.isFinite);
    return {
      count: rows.length,
      interactionMedianMs: percentile(interaction, .5), interactionP95Ms: percentile(interaction, .95),
      processingMedianMs: percentile(rows.map(s => Math.max(0, ...s.events.map(e => e.processing))), .5),
      modalNextFrameMedianMs: percentile(nextFrame, .5),
      scriptMedianMs: percentile(rows.map(s => s.metrics.ScriptDuration * 1000), .5),
      layoutMedianMs: percentile(rows.map(s => s.metrics.LayoutDuration * 1000), .5),
    };
  };
  const result = {
    baseURL, browser: browser.version(), cpuRate, runs, mobile, reactProfile,
    note: 'Event Timing durations are quantized to 8ms; 0 means no event met the 16ms reporting threshold. Modal nextFrame is a double-rAF paint opportunity, not pixel presentation or field INP.',
    summary: { cold: summarize(samples.filter(s => s.cold)), warm: summarize(samples.filter(s => !s.cold)) }, samples,
  };
  await writeFile(resolve(output, 'measurements.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result.summary, null, 2));
  if (assertIsolation) {
    const commits = samples.flatMap(sample => sample.commits);
    if (!commits.some(commit => Number.isFinite(commit.duration))) throw new Error('React profiling is unavailable; build with --profile --no-mangling.');
    if (!commits.some(commit => commit.renders.some(render => ['Home', 'PeriodicTable', 'ElementDetailsProvider'].includes(render.name)))) throw new Error('Component names are unavailable; add --no-mangling to the profiling build.');
    const unrelated = commits.flatMap(commit => commit.renders).filter(render => ['Home', 'PeriodicTable'].includes(render.name));
    if (unrelated.length) throw new Error(`Opening details rendered the background ${unrelated.length} times.`);
    console.log('Render isolation passed: opening details did not render Home or PeriodicTable.');
  }
} finally {
  await browser.close();
}
