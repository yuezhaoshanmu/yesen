const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  fs.mkdirSync('public/projects', { recursive: true });
  const results = await Promise.allSettled(['yihujia.icu', 'ytgy.asia', 'lrs1.asia'].map(async (domain) => {
    const page = await browser.newPage({viewport:{width:1440,height:1000}, deviceScaleFactor:1});
    await page.goto('https://www.'+domain, {waitUntil:'networkidle', timeout:45000}).catch(()=>{});
    await page.screenshot({path:'research/'+domain+'.png'});
    const result = {domain, title:await page.title(), text:(await page.locator('body').innerText()).slice(0,6500), metadata:await page.locator('meta[name="description"],meta[property^="og:"],link[rel*="icon"]').evaluateAll(nodes=>nodes.map(n=>n.outerHTML))};
    await page.close(); return result;
  }));
  fs.writeFileSync('research/project-pages.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
  await browser.close();
})();
