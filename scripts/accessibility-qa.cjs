const {chromium}=require('playwright');
const {AxeBuilder}=require('@axe-core/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3000',{waitUntil:'networkidle'});
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,mode:'page',violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  await page.getByRole('button',{name:'打开 Google 网络安全专业认证高清证书'}).click();
  await page.locator('.evidence-modal[open]').waitFor({state:'visible'});
  await page.waitForFunction(()=>document.querySelector('.evidence-modal img')?.complete);
  const modal=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,mode:'modal',violations:modal.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  await page.getByRole('button',{name:'关闭证明查看器'}).click();
  await page.locator('.all-evidence summary').click();
  await page.locator('.google-courses summary').click();
  const expanded=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,mode:'expanded archive and curriculum',violations:expanded.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  await context.close();
 }
 fs.writeFileSync('qa/accessibility-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));await browser.close();
 if(results.some(result=>result.violations.length))process.exitCode=1;
})().catch(e=>{console.error(e);process.exit(1);});
