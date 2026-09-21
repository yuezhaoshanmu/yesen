const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('assert/strict');

const chapters = ['home','overview','certification','edusrc','national','global','competitions','archive','projects','guestbook'];
const cleanScreenshot = { animations:'disabled', style:'.nav-wrap,.scroll-progress,.skip-link{visibility:hidden!important}[data-reveal]{opacity:1!important;transform:none!important}' };
(async () => {
  const browser = await chromium.launch({ headless:true, channel:'msedge' });
  fs.mkdirSync('qa',{recursive:true});
  const issues=[];
  const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
  page.on('pageerror',e=>issues.push(e.message));
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});
  await page.locator('.hero-portrait-image').waitFor({state:'visible'});
  assert.deepEqual(await page.locator('main>section').evaluateAll(nodes=>nodes.map(n=>n.id)),chapters);
  assert.deepEqual(await page.locator('.hero-metrics>a').evaluateAll(nodes=>nodes.map(n=>n.hash)),['#overview','#certification','#edusrc','#national','#global','#projects']);
  assert.deepEqual(await page.locator('.section-index').allTextContents(),['02','03','04','05','06','07','08','09','10','11']);
  assert.deepEqual(await page.locator('.national-card h3').allTextContents(),['CNNVD','CNVD']);
  assert.deepEqual(await page.locator('.authority-word').allTextContents(),['国家','国际']);
  assert((await page.locator('#google-title').innerText()).includes('网络安全专业职业认证'));
  assert.equal(await page.locator('#certification a').filter({hasText:'官方验证'}).getAttribute('href'),'https://coursera.org/verify/professional-cert/P6KEAPHJ0ZGQ');
  await page.screenshot({path:'qa/desktop-hero.png'});
  for(const section of chapters.slice(1)){
    await page.locator('#'+section).scrollIntoViewIfNeeded();
    if(section==='edusrc')await page.waitForTimeout(1200);
    if(section==='edusrc')await page.waitForFunction(()=>document.querySelector('.ranking-number [aria-label="24"]')?.textContent==='24');
    await page.locator('#'+section).screenshot({path:`qa/desktop-${section}.png`,...cleanScreenshot});
  }
  await page.locator('.google-courses summary').click();
  assert.equal(await page.locator('.google-courses li:visible').count(),9);
  await page.locator('.google-courses summary').click();
  const trigger=page.getByRole('button',{name:'打开 Google 网络安全专业认证高清证书'});
  await trigger.click();
  await page.locator('.evidence-modal').waitFor({state:'visible'});
  assert.equal(await page.locator('.evidence-modal h2').innerText(),'Google 网络安全专业职业认证');
  await page.waitForFunction(()=>document.querySelector('.evidence-modal img')?.naturalWidth>1000);
  await page.keyboard.press('Shift+Tab');
  assert(await page.locator('.evidence-modal').evaluate(el=>el.contains(document.activeElement)),'Dialog focus escaped');
  for(let i=0;i<4;i++)await page.getByRole('button',{name:'放大证明',exact:true}).click();
  assert((await page.locator('.zoom-controls').innerText()).includes('300%'));
  assert(await page.getByRole('button',{name:'放大证明',exact:true}).isDisabled());
  assert(await page.locator('.image-viewport').evaluate(el=>el.scrollWidth>el.clientWidth),'Zoom must allow panning');
  await page.getByRole('button',{name:'缩小证明',exact:true}).click();
  assert((await page.locator('.zoom-controls').innerText()).includes('250%'));
  await page.getByRole('button',{name:'重置缩放'}).click();
  assert((await page.locator('.zoom-controls').innerText()).includes('100%'));
  assert.equal(await page.getByRole('link',{name:'查看原始证明'}).getAttribute('href'),'/evidence/originals/google.pdf');
  await page.screenshot({path:'qa/google-evidence-modal.png'});
  await page.keyboard.press('ArrowRight');
  assert((await page.locator('.evidence-modal h2').innerText()).includes('第 24 名'));
  await page.keyboard.press('ArrowRight');
  assert((await page.locator('.evidence-modal h2').innerText()).includes('CNNVD'));
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.evidence-modal').count(),0);
  assert(await trigger.evaluate(el=>el===document.activeElement),'Focus did not return');
  await page.locator('.all-evidence summary').click();
  assert((await page.locator('.archive-card h3').first().innerText()).includes('Google'));
  await page.getByRole('button',{name:'国际漏洞',exact:true}).click();
  assert.equal(await page.locator('.archive-card').count(),4);
  await page.getByRole('searchbox').fill('87925');
  assert.equal(await page.locator('.archive-card').count(),1);
  await page.getByRole('searchbox').fill('impossible-result-123');
  assert(await page.getByText('未找到匹配的成果').isVisible());
  await page.getByRole('button',{name:'清除筛选'}).click();
  assert.equal(await page.locator('.archive-card').count(),17);
  await page.locator('.all-evidence summary').click();
  const external=await page.locator('a[href^="https:"]').evaluateAll(nodes=>nodes.map(n=>({href:n.href,target:n.target,rel:n.rel})));
  assert(external.every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')));
  for(const d of ['www.yihujia.icu','www.ytgy.asia','www.lrs1.asia'])assert(external.some(a=>a.href.includes(d)));
  const results=[];
  for(const [name,width,height] of [['small-phone',320,740],['android',360,800],['iphone',390,844],['ipad',820,1180],['desktop-wide',1920,1080],['qhd',2560,1440]]){
    const devicePage=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:width<600,hasTouch:width<600});
    devicePage.on('pageerror',e=>issues.push(e.message));
    await devicePage.goto(process.env.QA_BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});
    await devicePage.waitForFunction(()=>document.querySelector('.metric-number [aria-label="24"]')?.textContent==='24');
    await devicePage.screenshot({path:`qa/${name}-hero.png`});
    const overflow=await devicePage.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
    assert(overflow.scroll<=width,`${name} horizontal overflow: ${JSON.stringify(overflow)}`);
    if(width<600){
      await devicePage.getByRole('button',{name:'打开导航'}).click();
      await devicePage.locator('#navigation-links').getByRole('link',{name:'Google 认证',exact:true}).click();
      assert.equal(await devicePage.getByRole('button',{name:'打开导航'}).getAttribute('aria-expanded'),'false');
      for(const section of chapters.slice(1)){
        await devicePage.locator('#'+section).scrollIntoViewIfNeeded();
        if(section==='edusrc')await devicePage.waitForTimeout(1200);
        if(section==='edusrc')await devicePage.waitForFunction(()=>document.querySelector('.ranking-number [aria-label="24"]')?.textContent==='24');
        await devicePage.locator('#'+section).screenshot({path:`qa/${name}-${section}.png`,...cleanScreenshot});
      }
      await devicePage.getByRole('button',{name:'打开 Google 网络安全专业认证高清证书'}).click();
      await devicePage.locator('.evidence-modal').waitFor({state:'visible'});
      await devicePage.waitForFunction(()=>document.querySelector('.evidence-modal img')?.naturalWidth>1000);
      await devicePage.getByRole('button',{name:'放大证明',exact:true}).click();
      await devicePage.getByRole('button',{name:'重置缩放'}).click();
      await devicePage.screenshot({path:`qa/${name}-evidence.png`});
      await devicePage.getByRole('button',{name:'关闭证明查看器'}).click();
    }
    results.push({viewport:name,width,height,horizontalOverflow:false});
    await devicePage.close();
  }
  const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  await reduced.goto(process.env.QA_BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});
  assert.equal(await reduced.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
  assert.equal(await reduced.locator('.will-reveal').count(),0);
  assert.equal(issues.length,0,issues.join('\n'));
  fs.writeFileSync('qa/functional-results.json',JSON.stringify({passed:true,viewports:results,consoleErrors:issues,checks:['strict chapter and hero priority','CNNVD before CNVD','nine source courses and real Google verification link','Google certificate open, close, focus, keyboard, zoom to 300%, panning and original PDF','archive categories, search, empty state, reset','external project links','mobile menu','no overflow','reduced motion']},null,2));
  console.log('PASS: overview-first sequence, Google-led details, source evidence, desktop/mobile interactions and responsive layouts.');
  await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
