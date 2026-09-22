const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.QA_BASE_URL || 'http://localhost:3012';
const chapters = ['home', 'overview', 'certification', 'edusrc', 'national', 'global', 'competitions', 'archive', 'projects', 'guestbook'];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  fs.mkdirSync('qa/particles', { recursive: true });
  const errors = [], results = [];
  try {
    for (const width of [1440, 390, 320, 820]) {
      const page = await browser.newPage({ viewport: { width, height: 960 }, isMobile: width < 600, hasTouch: width < 600, deviceScaleFactor: 2 });
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 8 });
        Object.defineProperty(navigator, 'deviceMemory', { get: () => 8 });
        window.particleFrames = 0; window.feedbackEvents = [];
        const clear = CanvasRenderingContext2D.prototype.clearRect;
        CanvasRenderingContext2D.prototype.clearRect = function (...args) { if (this.canvas.classList.contains('global-particle-field')) window.particleFrames++; return clear.apply(this, args); };
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (...args) { if (this.className?.startsWith?.('data-')) window.feedbackEvents.push(this.className); return animate.apply(this, args); };
      });
      await page.goto(base, { waitUntil: 'networkidle' });
      await page.waitForTimeout(1100);
      assert.equal(await page.locator('canvas').count(), 1);
      assert.equal(await page.locator('canvas').evaluate(el => getComputedStyle(el).pointerEvents), 'none');
      assert(await page.locator('canvas').evaluate(el => el.width <= innerWidth * 1.5));
      assert.deepEqual(await page.locator('main > section').evaluateAll(els => els.map(el => el.id)), chapters);
      if (width < 600) {
        assert(Number(await page.locator('canvas').getAttribute('data-particle-count')) <= 50);
        await page.touchscreen.tap(width - 8, 160);
        assert((await page.evaluate(() => window.feedbackEvents)).includes('data-touch-ripple'));
        await page.locator('.hero-portrait-image').tap();
        assert((await page.evaluate(() => window.feedbackEvents.filter(x => x === 'data-pulse-dot').length)) >= 6);
      } else {
        await page.mouse.move(width - 180, 220);
      }
      for (const id of chapters) {
        await page.locator('#' + id).evaluate(el => window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 100, behavior: 'instant' }));
        await page.waitForTimeout(id === 'edusrc' ? 2300 : 800);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}/${id}: horizontal overflow`);
        await page.screenshot({ path: `qa/particles/${width}-${id}.png` });
      }
      assert.equal(await page.locator('.particle-aggregation').getAttribute('data-aggregation-complete'), 'true');
      await page.locator('#edusrc').scrollIntoViewIfNeeded();
      assert.equal(await page.locator('.particle-aggregation').getAttribute('data-aggregation-complete'), 'true', 'Ranking animation replayed');
      await page.getByRole('button', { name: '打开 Google 网络安全专业认证高清证书' }).click();
      await page.locator('.evidence-modal[open]').waitFor();
      await page.waitForTimeout(100);
      assert.equal(await page.locator('canvas').getAttribute('data-paused'), 'true');
      const stopped = await page.evaluate(() => window.particleFrames);
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.particleFrames), stopped, 'Canvas still drawing behind evidence');
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      assert.equal(await page.locator('canvas').getAttribute('data-paused'), 'false');
      await page.getByRole('button', { name: 'HOW IT WORKS' }).click();
      await page.locator('.gb-architecture[open]').waitFor();
      assert.equal(await page.locator('.architecture-data-flow li').count(), 6);
      await page.screenshot({ path: `qa/particles/${width}-architecture.png` });
      await page.keyboard.press('Escape');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(200);
      const reducedFrames = await page.evaluate(() => window.particleFrames);
      await page.waitForTimeout(250);
      assert.equal(await page.evaluate(() => window.particleFrames), reducedFrames, 'Reduced motion kept a render loop');
      await page.locator('#global').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      assert.equal(await page.locator('canvas').getAttribute('data-motion'), 'reduced');
      results.push({ width, count: await page.locator('canvas').getAttribute('data-particle-count'), consoleErrors: 0 });
      await page.close();
    }
    const low = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3 });
    await low.addInitScript(() => Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 }));
    await low.goto(base, { waitUntil: 'networkidle' });
    assert.equal(await low.locator('canvas').getAttribute('data-quality'), 'low');
    assert.equal(await low.locator('canvas').evaluate(el => el.width), 390);
    await low.close();
    assert.deepEqual(errors, []);
    fs.writeFileSync('qa/particles/results.json', JSON.stringify({ passed: true, results, errors }, null, 2));
    console.log('PASS: one canvas, section effects, no ranking replay, touch feedback, dialog suspension, responsive layout, live reduced-motion and weak-device limits.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
