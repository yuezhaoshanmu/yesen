const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://localhost:3012';

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const results = [];
  try {
    for (const [width, cpu] of [[1440, 1], [390, 4]]) {
      const page = await browser.newPage({ viewport: { width, height: 960 } });
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        window.frameCount = 0; window.injectSlowCanvas = false;
        const clear = CanvasRenderingContext2D.prototype.clearRect;
        CanvasRenderingContext2D.prototype.clearRect = function (...args) {
          if (this.canvas.classList.contains('global-particle-field')) {
            window.frameCount++;
            if (window.injectSlowCanvas) { const end = performance.now() + 9; while (performance.now() < end) { /* simulate sustained canvas work */ } }
          }
          return clear.apply(this, args);
        };
      });
      const cdp = await page.context().newCDPSession(page);
      await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
      await cdp.send('Performance.enable');
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1200);
      for (const section of ['home', 'global']) {
        await page.locator('#' + section).scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        const from = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
        const frames = await page.evaluate(() => window.frameCount);
        const start = Date.now();
        await page.waitForTimeout(2500);
        const elapsed = (Date.now() - start) / 1000;
        const to = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
        const fps = (await page.evaluate(() => window.frameCount) - frames) / elapsed;
        assert(fps > 10 && fps < 33, `${width}/${section}: unreasonable render rate ${fps}`);
        results.push({ width, cpuSlowdown: cpu, section, renderedFps: +fps.toFixed(1), mainThreadTaskMsPerSecond: +((to.TaskDuration - from.TaskDuration) * 1000 / elapsed).toFixed(1), quality: await page.locator('canvas').getAttribute('data-quality') });
      }
      if (width === 1440) {
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
        const hiddenFrames = await page.evaluate(() => window.frameCount);
        await page.waitForTimeout(250);
        assert.equal(await page.evaluate(() => window.frameCount), hiddenFrames);
        await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); window.injectSlowCanvas = true; });
        await page.waitForFunction(() => document.querySelector('canvas').dataset.quality === 'low', null, { timeout: 12000 });
        assert.equal(await page.locator('canvas').getAttribute('data-particle-count'), '24');
      }
      await page.close();
    }
    fs.mkdirSync('qa/particles', { recursive: true });
    fs.writeFileSync('qa/particles/performance.json', JSON.stringify({ results, backgroundPause: true, runtimeDegradation: true }, null, 2));
    console.log(JSON.stringify(results, null, 2));
    console.log('PASS: bounded frame rates, 4x CPU sample, hidden-document pause and automatic degradation under sustained injected load.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
