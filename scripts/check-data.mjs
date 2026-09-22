import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { auditSources } from './source-integrity.mjs';
const require=createRequire(import.meta.url);
require.extensions['.ts']=(module,filename)=>{
  const output=ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  module._compile(output,filename);
};
const { evidence }=require('../data/evidence.ts');
const { achievements,achievementGroups,levelCounts,nationalAchievements,cveAchievements,achievementCounts,journey }=require('../data/achievements.ts');
const { projects }=require('../data/projects.ts');
const errors=[];
const check=(condition,message)=>{if(!condition)errors.push(message);};
check(new Set(achievements.map(a=>a.id)).size===achievements.length,'Duplicate achievement IDs');
for(const a of achievements){
  for(const key of ['id','title','level','date','evidence','evidencePath','description']) check(!!a[key],`${a.id}: missing ${key}`);
  check(!!a.evidencePath && fs.existsSync(path.join('public',a.evidencePath)),`${a.id}: missing original certificate`);
}
const rawCount=auditSources(achievements,evidence,check);
check(achievementGroups.flatMap(g=>g.items).length===achievements.length,'Overview group total differs from source');
check(Object.values(levelCounts).reduce((sum,n)=>sum+n,0)===achievements.length,'Category counts differ from source');
check(new Set(evidence.map(e=>e.id)).size===evidence.length,'Duplicate evidence IDs');
for(const item of evidence){
  for(const key of ['preview','thumbnail','original'])check(fs.existsSync(path.join('public',item[key])),`${item.id}: missing ${key}`);
  if(!fs.existsSync(path.join('public',item.original)))continue;
  const data=fs.readFileSync(path.join('public',item.original));
  check(crypto.createHash('sha256').update(data).digest('hex')===item.sha256,`${item.id}: original SHA-256 mismatch`);
  check(item.width>0&&item.height>0,`${item.id}: invalid image dimensions`);
  if(item.verificationUrl){
    const url=new URL(item.verificationUrl);
    check(url.protocol==='https:',`${item.id}: insecure verification URL`);
    check(['www.cve.org','coursera.org'].includes(url.hostname),`${item.id}: unknown verification host`);
    check(item.verificationUrl.includes(item.identifier),`${item.id}: verification identifier mismatch`);
  }
}
check(nationalAchievements.length===4,'Expected four national platform documents');
check(cveAchievements.length===4,'Expected four CVE records');
check(achievementCounts.documented===achievements.length,'Documented count differs from source');
for(const step of journey)check(evidence.some(e=>e.id===step.evidenceId),`Timeline missing evidence ${step.evidenceId}`);
for(const p of projects){check(fs.existsSync(path.join('public',p.image)),`${p.id}: missing actual screenshot`);check(p.url.startsWith('https://www.'),`${p.id}: project URL mismatch`);}
if(errors.length){console.error(errors.join('\n'));process.exit(1);}
for(const group of achievementGroups) console.log(`${group.title}: ${group.items.length}\n${group.items.map(a=>`  ${a.id} | ${a.evidence.identifier || a.title} | ${a.date} | ${a.evidence.source}`).join('\n')}`);
console.log(`PASS: ${achievements.length} achievements; ${rawCount} audited raw sources; original hashes, previews, classifications and timeline references.`);
