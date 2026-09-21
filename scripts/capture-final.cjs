const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
 await page.screenshot({path:'qa/mobile-final.png'});
 const style='.nav-wrap,.scroll-progress,.skip-link{visibility:hidden!important}';
 for(const section of ['academic','social','archive','ending']){
   await page.locator('#'+section).screenshot({path:`qa/mobile-final-${section}.png`,style,animations:'disabled'});
 }
 await page.getByRole('button',{name:'高清查看 CNVD 原创漏洞证书'}).click();
 await page.locator('dialog').waitFor({state:'visible'});
 await page.waitForFunction(()=>document.querySelector('dialog img')?.complete);
 await page.screenshot({path:'qa/mobile-final-evidence.png'});
 await page.getByRole('button',{name:'放大证明',exact:true}).click();
 if(!(await page.locator('.zoom-controls').innerText()).includes('150%'))throw new Error('Mobile zoom failed');
 await page.getByRole('button',{name:'关闭证明查看器'}).click();
 const results=JSON.parse(fs.readFileSync('qa/functional-results.json','utf8'));
 results.checks.push('mobile full-screen evidence rendering and 150% zoom');
 fs.writeFileSync('qa/functional-results.json',JSON.stringify(results,null,2));
 await browser.close();console.log('Final mobile visual capture and zoom passed.');
})();
