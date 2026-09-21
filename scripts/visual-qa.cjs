const { chromium } = require('playwright');
const fs = require('fs');
const assert = require('assert/strict');

(async () => {
 const browser = await chromium.launch({ headless:true, channel:'msedge' });
 fs.mkdirSync('qa',{recursive:true});
 const issues=[];
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
 page.on('pageerror',e=>issues.push(e.message));
 await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
 await page.waitForFunction(()=>document.querySelector('.metric-number [aria-label="99.34"]')?.textContent==='99.34');
 await page.screenshot({path:'qa/desktop-hero.png'});
 // Move through the full narrative so intersection reveals and images are exercised.
 for(const section of ['academic','national','global','certification','edusrc','projects','competitions','social','archive','journey']) {
   await page.locator('#'+section).scrollIntoViewIfNeeded();
   await page.waitForFunction(id=>!document.querySelector('#'+id+' .will-reveal:not(.revealed)'), section,{timeout:5000}).catch(()=>{});
   if(section==='academic'||section==='social')await page.waitForFunction(id=>Array.from(document.querySelectorAll('#'+id+' [aria-label]')).filter(n=>n.tagName==='SPAN').every(n=>n.textContent===n.getAttribute('aria-label')),section);
   await page.locator('#'+section).screenshot({path:`qa/desktop-${section}.png`,animations:'disabled',style:'.nav-wrap,.scroll-progress,.skip-link{visibility:hidden!important}[data-reveal]{opacity:1!important;transform:none!important}'});
 }
 await page.screenshot({path:'qa/desktop-full.png',fullPage:true,animations:'disabled',style:'.nav-wrap,.scroll-progress,.skip-link{visibility:hidden!important}[data-reveal]{opacity:1!important;transform:none!important}'});
 const evidenceTrigger=page.getByRole('button',{name:'高清查看 CNVD 原创漏洞证书'});
 await evidenceTrigger.click();
 await page.locator('dialog').waitFor({state:'visible'});
 assert(await page.locator('dialog h2').innerText()==='金和 OA SQL 注入漏洞');
 await page.keyboard.press('Shift+Tab');
 assert(await page.locator('dialog').evaluate(el=>el.contains(document.activeElement)),'Dialog focus escaped');
 await page.getByRole('button',{name:'放大证明',exact:true}).click();
 assert(await page.locator('.zoom-controls').innerText().then(t=>t.includes('150%')));
 await page.getByRole('button',{name:'重置缩放'}).click();
 await page.screenshot({path:'qa/evidence-modal.png'});
 await page.keyboard.press('ArrowRight');
 assert((await page.locator('dialog h2').innerText()).includes('多媒体'));
 await page.keyboard.press('Escape');
 assert(await page.locator('dialog').count()===0);
 assert(await evidenceTrigger.evaluate(el=>el===document.activeElement),'Focus did not return to triggering evidence button');
 await page.getByRole('button',{name:'国际漏洞',exact:true}).click();
 assert(await page.locator('.archive-card').count()===4);
 await page.getByRole('searchbox').fill('87925');
 assert(await page.locator('.archive-card').count()===1);
 await page.getByRole('searchbox').fill('impossible-result-123');
 assert(await page.getByText('未找到匹配的成果').isVisible());
 await page.getByRole('button',{name:'清除筛选'}).click();
 assert(await page.locator('.archive-card').count()===17);
 const external=await page.locator('a[href^="https:"]').evaluateAll(nodes=>nodes.map(n=>({href:n.href,target:n.target,rel:n.rel})));
 assert(external.every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')));
 for(const d of ['www.yihujia.icu','www.ytgy.asia','www.lrs1.asia'])assert(external.some(a=>a.href.includes(d)));
 const results=[];
 for(const [name,width,height] of [['iphone',390,844],['android',360,800],['ipad',820,1180],['desktop-wide',1920,1080],['qhd',2560,1440]]){
   const devicePage=await browser.newPage({viewport:{width,height},deviceScaleFactor:1,isMobile:width<600,hasTouch:width<600});
   devicePage.on('pageerror',e=>issues.push(e.message));
   await devicePage.goto('http://localhost:3000',{waitUntil:'networkidle'});
   await devicePage.waitForFunction(()=>document.querySelector('.metric-number [aria-label="99.34"]')?.textContent==='99.34');
   await devicePage.screenshot({path:`qa/${name}-hero.png`});
   assert(await devicePage.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`${name} horizontal overflow`);
   const small=width<600;
   if(small){
     await devicePage.getByRole('button',{name:'打开导航'}).click();
     assert(await devicePage.locator('#navigation-links').isVisible());
     await devicePage.locator('#navigation-links').getByRole('link',{name:'安全成果',exact:true}).click();
     assert(await devicePage.getByRole('button',{name:'打开导航'}).getAttribute('aria-expanded')==='false');
     for(const section of ['academic','national','global','certification','edusrc','projects','competitions','social','archive','journey']){
       await devicePage.locator('#'+section).scrollIntoViewIfNeeded();
       if(section==='academic'||section==='social')await devicePage.waitForFunction(id=>Array.from(document.querySelectorAll('#'+id+' [aria-label]')).filter(n=>n.tagName==='SPAN').every(n=>n.textContent===n.getAttribute('aria-label')),section);
       await devicePage.locator('#'+section).screenshot({path:`qa/${name}-${section}.png`,animations:'disabled',style:'.nav-wrap,.scroll-progress,.skip-link{visibility:hidden!important}[data-reveal]{opacity:1!important;transform:none!important}'});
     }
     await devicePage.getByRole('button',{name:'高清查看 CNVD 原创漏洞证书'}).click();
     await devicePage.locator('dialog').waitFor({state:'visible'});
     await devicePage.waitForFunction(()=>document.querySelector('dialog img')?.complete);
     await devicePage.screenshot({path:`qa/${name}-evidence.png`});
     await devicePage.getByRole('button',{name:'关闭证明查看器'}).click();
   }
   results.push({viewport:name,width,height,horizontalOverflow:false});
   await devicePage.close();
 }
 const reduced=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await reduced.goto('http://localhost:3000',{waitUntil:'networkidle'});
 assert(await reduced.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)==='auto');
 assert(await reduced.locator('.will-reveal').count()===0);
 assert(issues.length===0,issues.join('\n'));
 fs.writeFileSync('qa/functional-results.json',JSON.stringify({passed:true,viewports:results,consoleErrors:issues,checks:['evidence open, close, keyboard navigation, zoom, focus restoration','archive categories, search, empty state, reset','all external links secure and three specified domains present','mobile nav interactions','horizontal overflow on five viewport sizes','reduced motion behavior']},null,2));
 console.log('PASS: desktop and mobile functional checks; screenshots captured.');
 await browser.close();
})().catch(error=>{console.error(error);process.exit(1);});
