'use client';

import { useEffect, useRef } from 'react';

export default function MotionSystem(){
 useEffect(()=>{
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
   if(window.matchMedia('(max-width: 900px)').matches)return;
   if(reduce.matches)return;
   const nodes=Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('revealed');observer.unobserve(entry.target);}}),{threshold:.08,rootMargin:'0px 0px -25px 0px'});
   nodes.forEach(el=>{if(el.getBoundingClientRect().top>window.innerHeight){el.classList.add('will-reveal');observer.observe(el);}});
   const onReduced=()=>{if(reduce.matches){nodes.forEach(el=>el.classList.add('revealed'));observer.disconnect();}};
   reduce.addEventListener('change',onReduced);
   const hero=document.getElementById('home');
   let frame=0;
   const scroll=()=>{if(frame)return;frame=requestAnimationFrame(()=>{const progress=Math.min(window.scrollY/(hero?.offsetHeight||900),1);hero?.style.setProperty('--hero-scroll',String(progress));frame=0;});};
   window.addEventListener('scroll',scroll,{passive:true});
   const magnetic=document.querySelector<HTMLElement>('.magnetic');
   const pointer=(e:PointerEvent)=>{if(e.pointerType!=='mouse'||reduce.matches||!magnetic)return;const b=magnetic.getBoundingClientRect();magnetic.style.transform=`translate(${(e.clientX-b.left-b.width/2)*.045}px,${(e.clientY-b.top-b.height/2)*.09}px)`;};
   const leave=()=>{if(magnetic)magnetic.style.transform='';};
   magnetic?.addEventListener('pointermove',pointer);magnetic?.addEventListener('pointerleave',leave);
   return ()=>{observer.disconnect();cancelAnimationFrame(frame);window.removeEventListener('scroll',scroll);reduce.removeEventListener('change',onReduced);nodes.forEach(el=>el.classList.remove('will-reveal'));magnetic?.removeEventListener('pointermove',pointer);magnetic?.removeEventListener('pointerleave',leave);};
 },[]);
 return <MobileReadingMotion/>;
}
export function Counter({value,decimals=0,className=''}:{value:number;decimals?:number;className?:string}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
   const el=ref.current;if(!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches||window.matchMedia('(max-width: 900px)').matches)return;
   let frame=0;
   const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;observer.disconnect();const start=performance.now();
     const tick=(now:number)=>{const t=Math.min((now-start)/500,1);el.textContent=(value*(1-Math.pow(1-t,4))).toFixed(decimals);if(t<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
   },{threshold:.8});observer.observe(el);
   return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[value,decimals]);
 return <span className={className} aria-label={value.toFixed(decimals)} ref={ref}>{value.toFixed(decimals)}</span>;
}

function MobileReadingMotion() {
 useEffect(()=>{
  const mobile=matchMedia('(max-width: 900px)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let cleanup=()=>{};
  const setup=()=>{
   cleanup();
   if(!mobile.matches||reduced.matches)return;
   const animations=new Set<Animation>();
   const played=new WeakSet<Element>();
   const seenIds=new Set<string>();
   const targets='.overview-heading, #google-title, .google-proof, #edusrc .section-heading, .ranking-number, .authority-heading, #competitions .section-heading, .prize-title, #archive .section-heading, #projects .section-heading, .project-card, #guestbook .section-heading';
   const animate=(el:Element,keyframes:Keyframe[],duration:number,delay=0)=>{
    const a=el.animate(keyframes,{duration,delay,easing:'ease-out'});animations.add(a);a.onfinish=()=>animations.delete(a);
   };
   const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(!entry.isIntersecting)return;
    reveal.unobserve(entry.target);
    if(played.has(entry.target))return;
    played.add(entry.target);
    const el=entry.target as HTMLElement;
    if(el.matches('.overview-entry')){
     const id=el.dataset.achievement||'';el.classList.add('reading-passed');
     if(!seenIds.has(id)){const dot=el.querySelector('.overview-node');if(dot)animate(dot,[{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],200);seenIds.add(id);}
    }else{
     const emphasis=el.matches('.ranking-number,.prize-title,.authority-heading');
     const description=el.matches('.section-heading:not(.authority-heading)')?el.querySelector('p'):null;
     if(description)animate(description,[{opacity:0},{opacity:1}],350,100);
     animate(el,emphasis?[{opacity:.7,transform:'scale(.97)'},{opacity:1,transform:'scale(1)'}]:[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'translateY(0)'}],emphasis?300:420,el.matches('.google-proof')?100:0);
    }
   }),{threshold:.12,rootMargin:'0px 0px -30px 0px'});
   const focused=new Set<Element>();
   const focus=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('reading-focus',e.isIntersecting);focused.add(e.target);}),{rootMargin:'-30% 0px -35% 0px',threshold:0});
   document.querySelectorAll(targets).forEach(el=>reveal.observe(el));
   document.querySelectorAll('.google-certificate,.ranking-proof,.national-card,.cve-card,.competition-feature').forEach(el=>focus.observe(el));
   const observeEntries=()=>document.querySelectorAll<HTMLElement>('.overview-entry').forEach(el=>{if(seenIds.has(el.dataset.achievement||''))el.classList.add('reading-passed');else if(!played.has(el))reveal.observe(el);});
   observeEntries();
   const mutation=new MutationObserver(observeEntries);
   const overview=document.getElementById('overview');if(overview)mutation.observe(overview,{childList:true,subtree:true});
   cleanup=()=>{reveal.disconnect();focus.disconnect();mutation.disconnect();animations.forEach(a=>a.cancel());focused.forEach(el=>el.classList.remove('reading-focus'));};
  };
  setup();mobile.addEventListener('change',setup);reduced.addEventListener('change',setup);
  return()=>{cleanup();mobile.removeEventListener('change',setup);reduced.removeEventListener('change',setup);};
 },[]);
 return null;
}
