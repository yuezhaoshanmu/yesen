const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const url = process.env.QA_BASE_URL || 'http://localhost:3000';
const errors = [];

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  try {
    fs.mkdirSync('qa', { recursive: true });
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(url, { waitUntil: 'networkidle' });
      const overview = page.locator('#overview');
      const filters = page.getByRole('group', { name: '筛选荣誉层级与类别' });
      const years = page.getByRole('group', { name: '筛选成果年份' });
      assert.equal(await overview.locator('[data-achievement]').count(), 16);
      assert.deepEqual(await page.locator('main>section').evaluateAll(nodes => nodes.map(n => n.id)), ['home', 'overview', 'certification', 'edusrc', 'national', 'global', 'competitions', 'archive', 'projects', 'guestbook']);
      await page.locator('.hero-actions a').first().click();
      assert.equal(new URL(page.url()).hash, '#overview');
      await page.screenshot({ path: `qa/overview-${width}-top.png` });
      await overview.screenshot({ path: `qa/overview-${width}-full.png` });
      for (const [name, count] of [['国际', 5], ['国家', 4], ['省级', 2], ['校级', 3], ['技术成果', 9], ['竞赛', 3], ['社会实践', 1], ['全部', 16]]) {
        const button = filters.getByRole('button', { name, exact: true });
        await button.click();
        assert.equal(await button.getAttribute('aria-pressed'), 'true');
        assert.equal(await overview.locator('[data-achievement]').count(), count, `${width}: ${name}`);
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}: overflow for ${name}`);
      }
      await years.getByRole('button', { name: '2025', exact: true }).click();
      assert.deepEqual(await overview.locator('[data-achievement]').evaluateAll(nodes => nodes.map(n => n.dataset.achievement)), ['social', 'training']);
      assert.equal(await overview.locator('[data-achievement="social"] time').innerText(), '2025年');
      await filters.getByRole('button', { name: '国际', exact: true }).click();
      assert.equal(await overview.locator('[data-achievement]').count(), 0);
      assert(await overview.getByText('该年份暂无此类成果').isVisible());
      await overview.getByRole('button', { name: '查看全部成果', exact: true }).click();
      assert.equal(await overview.locator('[data-achievement]').count(), 16);

      // Every card opens the matching certificate and links to its dated detail.
      const entries = await overview.locator('[data-achievement]').evaluateAll(nodes => nodes.map(n => ({ id: n.dataset.achievement, title: n.querySelector('h4').textContent })));
      for (const entry of entries) {
        const row = overview.locator(`[data-achievement="${entry.id}"]`);
        const href = await row.getByRole('link').getAttribute('href');
        assert.equal(href, `#detail-${entry.id}`);
        assert.equal(await page.locator(href).count(), 1);
        await row.getByRole('link').click();
        assert.equal(new URL(page.url()).hash, href);
        const detail = page.locator(href);
        // CVE anchors sit on the record heading; other anchors contain their dates.
        const datedDetail = entry.id.startsWith('cve-') ? detail.locator('xpath=ancestor::div[contains(@class,"cve-card")]') : detail;
        assert(await datedDetail.locator('.achievement-date time').count() > 0, `Missing detail date: ${entry.id}`);
        await row.getByRole('button').click();
        const modal = page.locator('.evidence-modal[open]');
        await modal.waitFor();
        const displayedDate = await modal.locator('.viewer-date time').innerText();
        assert(displayedDate.includes('年'), `Missing modal date: ${entry.id}`);
        if (entry.id === 'social') {
          assert.equal(displayedDate, '2025年');
          assert((await modal.innerText()).includes('2025年12月23日'));
        }
        if (entry.id === 'google') assert.equal(displayedDate, '2026年4月8日');
        if (entry.id.startsWith('challenge-')) assert.equal(displayedDate, '2026年4月');
        if (entry.id === 'cnnvd-18260050') {
          assert((await modal.innerText()).includes('证明出具时间'));
          assert((await modal.innerText()).includes('2026年8月25日'));
        }
        await page.keyboard.press('Escape');
      }
      assert(await page.locator('.achievement-date time').evaluateAll(nodes => nodes.filter(n => n.getClientRects().length).every(n => parseFloat(getComputedStyle(n).fontSize) >= 16)), 'Unreadable date');
      await page.close();
    }
    assert.deepEqual(errors, []);
    console.log('PASS: all filters, combined year filters, empty/reset, 16 evidence/detail links and date badges at 1440/390/320px.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
