'use client';

import { useEffect, useRef } from 'react';

export default function MotionSystem(){
 useEffect(()=>{
   const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
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
 return null;
}
export function Counter({value,decimals=0,className=''}:{value:number;decimals?:number;className?:string}){
 const ref=useRef<HTMLSpanElement>(null);
 useEffect(()=>{
   const el=ref.current;if(!el||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   let frame=0;
   const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;observer.disconnect();const start=performance.now();
     const tick=(now:number)=>{const t=Math.min((now-start)/1100,1);el.textContent=(value*(1-Math.pow(1-t,4))).toFixed(decimals);if(t<1)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
   },{threshold:.8});observer.observe(el);
   return ()=>{observer.disconnect();cancelAnimationFrame(frame);};
 },[value,decimals]);
 return <span className={className} aria-label={value.toFixed(decimals)} ref={ref}>{value.toFixed(decimals)}</span>;
}
