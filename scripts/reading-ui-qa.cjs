const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 for(const width of [390,360,412,1440]){
  const page=await browser.newPage({viewport:{width,height:844},hasTouch:width<900,isMobile:width<900});
  await page.addInitScript(()=>{window.readingAnimations=[];const animate=Element.prototype.animate;Element.prototype.animate=function(...args){window.readingAnimations.push({class:this.className,duration:args[1]?.duration});return animate.apply(this,args);};});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.env.QA_BASE_URL || 'http://localhost:3011',{waitUntil:'networkidle'});
  assert(!/\u5f85\u8865\u5145|\u5b89\u9611|\u0054ODO|\u0054BD/.test(await page.locator('body').innerText()));
  assert((await page.locator('body').innerText()).includes('安帼'));
  await page.locator('#certification').scrollIntoViewIfNeeded();
  await page.waitForTimeout(650);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${width} overflow`);
  await page.screenshot({path:`qa/reading-google-${width}.png`});
  await page.getByRole('button',{name:'查看完整证书',exact:true}).click();
  await page.locator('.evidence-modal[open]').waitFor();
  await page.getByRole('button',{name:'放大证明',exact:true}).click();
  assert.equal(await page.locator('.zoom-controls>span').innerText(),'150%');
  const image=page.locator('.touch-certificate');const box=await image.boundingBox();
  await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2+60,box.y+box.height/2+40);await page.mouse.up();
  assert((await image.locator('img').getAttribute('style')).includes('scale(1.5)'));
  if(width<900){
   const small=await page.locator('.evidence-modal button').evaluateAll(ns=>ns.filter(n=>n.getClientRects().length).filter(n=>n.getBoundingClientRect().height<44).map(n=>n.textContent));assert.deepEqual(small,[]);
   const modal=await page.locator('.evidence-modal').boundingBox();assert.equal(modal.width,width);
  }
  if(width<900){
   await page.getByRole('button',{name:'重置缩放'}).click();
   const client=await page.context().newCDPSession(page);
   const x=box.x+box.width/2,y=box.y+box.height/2;
   await client.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x-30,y,id:1},{x:x+30,y,id:2}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-65,y,id:1},{x:x+65,y,id:2}]});
   await client.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert(parseInt(await page.locator('.zoom-controls>span').innerText())>200,'Pinch failed');
  }
  await page.waitForTimeout(300);
  await page.screenshot({path:`qa/reading-viewer-${width}.png`});
  await page.getByRole('button',{name:'关闭证明查看器'}).click();
  if(width<900){
   await page.locator('#national').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
   const count=await page.evaluate(()=>window.readingAnimations.filter(a=>a.class.includes('authority-heading')).length);
   await page.locator('#projects').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
   await page.locator('#national').scrollIntoViewIfNeeded();await page.waitForTimeout(600);
   assert.equal(await page.evaluate(()=>window.readingAnimations.filter(a=>a.class.includes('authority-heading')).length),count,'Repeated reveal');
   assert(await page.evaluate(()=>window.readingAnimations.every(a=>a.duration<=600)));
   const short=await page.locator('button,a,summary,input,textarea').evaluateAll(ns=>ns.filter(n=>n.getClientRects().length&&n.getBoundingClientRect().height<43).map(n=>n.className));assert.deepEqual(short,[],'Small touch targets');
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('#national').scrollIntoViewIfNeeded();
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
  assert.deepEqual(errors,[]);console.log('PASS reading',width);await page.close();
 }
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
