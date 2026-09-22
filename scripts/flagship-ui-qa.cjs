require('tsx/cjs');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { achievements, achievementGroups } = require('../data/achievements.ts');
const base = process.env.QA_BASE_URL || 'http://localhost:3000';
const output = 'qa/flagship';
const sizes = [[1920,1080],[1440,900],[1366,768],[430,932],[390,844]];
fs.mkdirSync(output, { recursive: true });

async function recordOpening(browser, width, height) {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, recordVideo: { dir: `${output}/video`, size: { width, height } } });
  const page = await context.newPage(), frames = [], samples = [];
  const cdp = await context.newCDPSession(page);
  await page.addInitScript(() => {
    window.openingSamples = []; let first;
    function sample() {
      const ring = document.querySelector('.security-orbit');
      const animation = ring?.getAnimations()[0];
      if (animation) {
        window.openingStart ??= performance.timeOrigin + performance.now() - Number(animation.currentTime);
        const elapsed = performance.timeOrigin + performance.now() - window.openingStart;
        first ??= performance.now();
        const ye = document.querySelector('.name-ye');
        window.openingSamples.push({ elapsed, time: performance.now(), stroke: getComputedStyle(ring).strokeDashoffset, mask: getComputedStyle(ye).clipPath, pulse: getComputedStyle(document.querySelector('.core-pulse')).opacity });
        if (performance.now() - first > 2300) return;
      }
      requestAnimationFrame(sample);
    }
    requestAnimationFrame(sample);
  });
  cdp.on('Page.screencastFrame', event => {
    frames.push({ time: event.metadata.timestamp * 1000, data: event.data });
    cdp.send('Page.screencastFrameAck', { sessionId: event.sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'png', everyNthFrame: 1, maxWidth: width, maxHeight: height });
  await page.goto(base, { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await cdp.send('Page.stopScreencast');
  const state = await page.evaluate(() => ({ start: window.openingStart, samples: window.openingSamples }));
  for (const target of [0,300,600,900,1200,1500]) {
    const choices = frames.filter(f => f.time >= state.start - 20);
    assert(choices.length > 5, 'Missing realtime opening frames');
    const frame = choices.reduce((a, b) => Math.abs(b.time - state.start - target) < Math.abs(a.time - state.start - target) ? b : a);
    fs.writeFileSync(`${output}/opening-${width}-${target}.png`, Buffer.from(frame.data, 'base64'));
    const sample = state.samples.reduce((a,b) => Math.abs(b.elapsed-target)<Math.abs(a.elapsed-target)?b:a);
    samples.push({ targetMs: target, actualFrameMs: Math.round(frame.time-state.start), ...sample });
  }
  fs.writeFileSync(`${output}/opening-${width}-samples.json`,JSON.stringify({samples,all:state.samples},null,2));
  assert(state.samples.some(s=>s.elapsed<550 && parseFloat(s.stroke)>90), 'Orbit starts already complete');
  assert(state.samples.some(s=>s.elapsed>650 && s.elapsed<850 && parseFloat(s.stroke)>5 && parseFloat(s.stroke)<85), 'Missing visible orbit draw');
  assert(state.samples.some(s=>s.elapsed>1100 && parseFloat(s.stroke)===0), 'Orbit did not finish');
  assert(state.samples.some(s=>s.elapsed<750 && s.mask.includes('100%')), 'Name has no mask reveal');
  assert(state.samples.some(s=>s.elapsed>1000 && s.elapsed<1300 && Number(s.pulse)>.1), 'Missing energy pulse');
  const gaps=state.samples.slice(1).map((s,i)=>s.time-state.samples[i].time).sort((a,b)=>a-b);
  const video = page.video();
  await context.close();
  await video.saveAs(`${output}/opening-${width}.webm`);
  return { width, samples, recordedFrameCount: frames.length, rafMedianMs: gaps[Math.floor(gaps.length/2)], rafP95Ms: gaps[Math.floor(gaps.length*.95)] };
}

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const errors = [], report = { sizes: [], openings: [], errors };
  try {
    for (const [width, height] of sizes) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1, isMobile: width < 700, hasTouch: width < 700 });
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(base, { waitUntil: 'networkidle' }); await page.waitForTimeout(1600);
      assert.equal(await page.locator('[data-achievement]').count(), achievements.length);
      assert.equal(Number(await page.locator('#overview').getAttribute('data-achievement-total')), achievements.length);
      assert.equal(Number(await page.locator('.nav-count').textContent()), achievements.length);
      const displayed = await page.locator('[data-achievement]').evaluateAll(nodes => nodes.map(n => n.dataset.achievement).sort());
      assert.deepEqual(displayed, achievements.map(a=>a.id).sort());
      assert(await page.evaluate(()=>document.documentElement.scrollWidth===innerWidth), `${width}: page overflow`);
      await page.screenshot({ path: `${output}/${width}x${height}-hero.png` });
      for (const group of achievementGroups) {
        const section = page.locator(`[data-honor-level="${group.id}"]`);
        assert.equal(await section.locator('[data-achievement]').count(), group.items.length);
        const geometry = await section.locator('[data-achievement]').evaluateAll(nodes => nodes.map(n => {
          const r=n.getBoundingClientRect(); return { id:n.dataset.achievement, top:r.top, bottom:r.bottom, width:r.width, clipped:getComputedStyle(n).position==='absolute' || n.closest('[aria-hidden="true"]')!==null };
        }));
        geometry.forEach((r,i)=>{assert(!r.clipped && r.width>100); if(i)assert(r.top>=geometry[i-1].bottom-1, `${r.id}: overlap`);});
        if (['international','national','school'].includes(group.id)) await section.screenshot({ path: `${output}/${width}x${height}-${group.id}.png` });
      }
      if (width === 1440 || width === 390) {
        for (const a of achievements) {
          const row = page.locator(`[data-achievement="${a.id}"]`);
          assert.equal(await page.locator(`#detail-${a.id}`).count(),1);
          await row.getByRole('button').click();
          const modal = page.locator('.evidence-modal[open]'); await modal.waitFor();
          assert.equal(await modal.locator('#evidence-title').textContent(),a.title);
          assert.equal(await modal.getByRole('link',{name:'查看原始证明'}).getAttribute('href'),a.evidencePath);
          assert.equal((await page.request.get(new URL(a.evidencePath, base).href)).status(),200);
          assert.equal(await modal.locator('.viewer-date time').getAttribute('datetime'),a.date);
          await page.keyboard.press('Escape');
        }
        await page.locator('.all-evidence>summary').click();
        assert.equal(await page.locator('.archive-card').count(),achievements.length);
        await page.getByRole('searchbox',{name:'搜索成果名称、机构或编号'}).fill('CVE-2026');
        assert.equal(await page.locator('.archive-card').count(),achievements.filter(a=>a.evidence.category==='国际漏洞').length);
      }
      await page.evaluate(()=>scrollTo({top:0,behavior:'instant'})); await page.waitForTimeout(600);
      if (width >= 700) {
        assert.equal(await page.locator('.hero-network').getAttribute('data-core-points'),'112');
        assert(Number(await page.locator('.hero-network').getAttribute('data-core-dpr'))<=1.5);
        await page.mouse.move(width*.8,height*.3); await page.waitForTimeout(80);
        assert.notEqual(await page.locator('#home').evaluate(n=>n.style.getPropertyValue('--pointer-x')),'');
      } else assert.equal(await page.locator('.point-cloud-mount canvas').count(),0);
      for(const ratio of [.2,.6,1]) {
        await page.evaluate(r=>scrollTo({top:document.querySelector('#home').offsetHeight*r,behavior:'instant'}),ratio); await page.waitForTimeout(500);
        if(width===1440 || width===390) await page.screenshot({path:`${output}/${width}-exit-${ratio}.png`});
      }
      report.sizes.push({width,height,total:displayed.length,groups:Object.fromEntries(achievementGroups.map(g=>[g.id,g.items.length]))});
      await page.close();
    }
    for(const [width,height] of [[1440,900],[390,844]]) report.openings.push(await recordOpening(browser,width,height));
    const reduced = await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
    await reduced.goto(base,{waitUntil:'networkidle'});
    assert.equal(await reduced.locator('.point-cloud-mount canvas').count(),0);
    assert.equal(await reduced.locator('[data-achievement]').count(),achievements.length);
    assert.equal(await reduced.locator('.name-ye').evaluate(n=>getComputedStyle(n).clipPath),'none');
    await reduced.screenshot({path:`${output}/reduced-motion.png`});await reduced.close();
    assert.deepEqual(errors,[]);
    fs.writeFileSync(`${output}/report.json`,JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
