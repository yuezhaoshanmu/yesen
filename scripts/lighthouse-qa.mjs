import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import fs from 'node:fs';
import path from 'node:path';

const profileDir=path.resolve('qa/lighthouse-profile');
fs.mkdirSync(profileDir,{recursive:true});
const chrome=await chromeLauncher.launch({chromePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',userDataDir:profileDir,chromeFlags:['--headless','--disable-gpu','--no-first-run']});
try{
 for(const mobile of [false,true]){
  const flags={port:chrome.port,output:'json',logLevel:'error',onlyCategories:['performance','accessibility','best-practices','seo']};
  const config=mobile?undefined:{extends:'lighthouse:default',settings:{formFactor:'desktop',screenEmulation:{mobile:false,width:1440,height:1000,deviceScaleFactor:1,disabled:false},throttling:{rttMs:40,throughputKbps:10240,cpuSlowdownMultiplier:1}}};
  const result=await lighthouse('http://localhost:3000',flags,config);
  const report=result.lhr;
  const name=mobile?'mobile':'desktop';
  fs.writeFileSync(`qa/lighthouse-${name}.json`,JSON.stringify(report,null,2));
  console.log(JSON.stringify({name,scores:Object.fromEntries(Object.entries(report.categories).map(([k,v])=>[k,Math.round(v.score*100)])),metrics:Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift'].map(k=>[k,report.audits[k]?.displayValue])),failures:Object.values(report.audits).filter(a=>a.score!==null&&a.score<.9&&a.details?.items?.length).map(a=>({id:a.id,title:a.title,score:a.score,description:a.displayValue}))},null,2));
 }
}finally{await chrome.kill();}
