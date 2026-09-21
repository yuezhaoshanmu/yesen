const {chromium}=require('playwright');
const {AxeBuilder}=require('@axe-core/playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const results=[];
 for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.goto('http://localhost:3000',{waitUntil:'networkidle'});
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,mode:'page',violations:result.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  await page.getByRole('button',{name:'高清查看 CNVD 原创漏洞证书'}).click();
  const modal=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  results.push({width,mode:'modal',violations:modal.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))});
  await context.close();
 }
 fs.writeFileSync('qa/accessibility-results.json',JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});
