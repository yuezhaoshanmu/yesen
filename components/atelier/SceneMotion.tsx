'use client';
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Scene Controller: one primary gesture per scene, with a fully readable static fallback. */
export default function SceneMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const played = new Set<string>();
    media.add({ mobile: '(max-width: 700px)', desktop: '(min-width: 701px)', motion: '(prefers-reduced-motion: no-preference)' }, context => {
      if (!context.conditions?.motion) return;
      const mobile = !!context.conditions.mobile;
      const cleanups: (() => void)[] = [];
      const once = (name: string, trigger: string, build: (timeline: gsap.core.Timeline) => void, start='top 78%') => {
        if(played.has(name))return;
        const timeline=gsap.timeline({paused:true,defaults:{ease:'power2.out'}});build(timeline);
        ScrollTrigger.create({trigger,start,once:true,onEnter:()=>{played.add(name);timeline.play();}});
      };
      // CSS owns sticky geometry; ScrollTrigger owns the single archive/page-turn gesture.
      const stage = (id:string, panelSelector:string, tabSelector:string) => {
        const section=document.querySelector<HTMLElement>(id)!;
        const panels=Array.from(section.querySelectorAll<HTMLElement>(panelSelector));
        const tabs=Array.from(section.querySelectorAll<HTMLAnchorElement>(tabSelector));
        section.dataset.enhanced='true';
        let current=-1;
        const select=(index:number)=>{
          if(index===current)return;
          current=index;section.dataset.active=String(index);
          panels.forEach((panel,i)=>{panel.inert=i!==index;panel.setAttribute('aria-hidden',String(i!==index));});
          tabs.forEach((tab,i)=>{if(i===index)tab.setAttribute('aria-current','true');else tab.removeAttribute('aria-current');});
        };
        gsap.set(panels.slice(1),{autoAlpha:0,y:mobile?24:40,clipPath:'inset(0 0 100% 0)'});
        const timeline=gsap.timeline({scrollTrigger:{trigger:section,start:mobile?'top 64px':'top 72px',end:'bottom bottom',scrub:.35,invalidateOnRefresh:true,onUpdate:self=>select(Math.min(panels.length-1,Math.floor(self.progress*panels.length)))}});
        panels.forEach((panel,i)=>{
          if(i===0)return;
          const at=i/panels.length;
          timeline.to(panels[i-1],{y:mobile?-18:-35,clipPath:'inset(0 0 100% 0)',autoAlpha:0,duration:.065,ease:'power1.in'},at-.045)
            .to(panel,{autoAlpha:1,y:0,clipPath:'inset(0 0 0% 0)',duration:.095,ease:'power2.out'},at-.025);
        });
        timeline.to({}, {duration:1-timeline.duration()});select(0);
        const go=(index:number)=>{
          const st=timeline.scrollTrigger!;
          window.scrollTo({top:st.start+(st.end-st.start)*Math.min(.999,(index+.3)/panels.length),behavior:'instant'});
          timeline.progress(Math.min(.999,(index+.3)/panels.length));select(index);
        };
        tabs.forEach((tab,i)=>{const click=(e:MouseEvent)=>{e.preventDefault();go(i);history.replaceState(null,'',tab.hash);};tab.addEventListener('click',click);cleanups.push(()=>tab.removeEventListener('click',click));});
        const hash=()=>{const i=panels.findIndex(panel=>`#${panel.id}`===location.hash);if(i>=0)go(i);};
        window.addEventListener('hashchange',hash);cleanups.push(()=>window.removeEventListener('hashchange',hash));
        if(panels.some(panel=>`#${panel.id}`===location.hash))requestAnimationFrame(hash);
        cleanups.push(()=>{delete section.dataset.enhanced;delete section.dataset.active;panels.forEach(p=>{p.inert=false;p.removeAttribute('aria-hidden');});tabs.forEach(t=>t.removeAttribute('aria-current'));});
      };

      stage('#projects','[data-project-scene]','[data-project-tab]');
      once('paper','.google-object',t=>{t.fromTo('.paper-enter',{rotationX:2,rotationY:-2,y:14},{rotationX:0,rotationY:0,y:0,duration:.7}).call(()=>document.querySelector('.paper-enter')?.classList.add('is-settled'),[],.7);});
      gsap.fromTo('.google-object',{y:5},{y:-5,ease:'none',scrollTrigger:{trigger:'#certification',start:'top bottom',end:'bottom top',scrub:.4}});
      once('rank','.ranking-object',t=>{t.fromTo('.ranking-scan',{scaleX:0,opacity:1},{scaleX:1,opacity:1,duration:.3,ease:'none'}).to('.ranking-scan',{opacity:0,duration:.15});});
      const collector=gsap.timeline({scrollTrigger:{trigger:'.national-composition',start:'top 70%',end:'center 42%',scrub:.4}});
      collector.fromTo('.collector-front',{x:12,y:8},{x:-12,y:0,ease:'none'},0).fromTo('.collector-back',{x:-12,y:8},{x:12,y:0,ease:'none'},0);
      const month=document.querySelector('.chronology-month');
      gsap.utils.toArray<HTMLElement>('.national-record').forEach(record=>{
        const select=()=>{if(month&&month.textContent!==record.dataset.month){month.textContent=record.dataset.month!;gsap.fromTo(month,{y:8,clipPath:'inset(0 0 100% 0)'},{y:0,clipPath:'inset(0 0 0% 0)',duration:.35});}};
        ScrollTrigger.create({trigger:record,start:'top 58%',end:'bottom 58%',onEnter:select,onEnterBack:select,toggleClass:'is-current'});
      });
      once('gauge','.technical-gauge',t=>{t.fromTo('.gauge-value',{strokeDasharray:'0 100'},{strokeDasharray:'87 100',duration:.5});});
      gsap.utils.toArray<HTMLElement>('.security-dossier').forEach((d,i)=>once(`dossier-${i}`,`#${d.id}`,t=>{const arc=d.querySelector('.dossier-arc')!;t.fromTo(arc,{strokeDashoffset:100},{strokeDashoffset:0,duration:.5});}));
      once('award','.award-composition',t=>{t.from('.award-rule',{scaleX:0,transformOrigin:'left',duration:.2}).from('.award-composition h2',{clipPath:'inset(0 100% 0 0)',duration:.4},.15).from('.award-object',{y:22,duration:.5},.2);});
      once('academic','.academic-composition',t=>{t.fromTo('.academic-nodes i',{backgroundColor:'transparent',scale:.8},{backgroundColor:'#087f73',scale:1,duration:.15,stagger:.05});});
      const refresh=()=>ScrollTrigger.refresh();
      document.fonts.ready.then(refresh);window.addEventListener('load',refresh);
      cleanups.push(()=>window.removeEventListener('load',refresh));
      return ()=>cleanups.forEach(fn=>fn());
    });
    let down:{x:number;y:number;scroll:number;id:number}|null=null;
    const press=(e:PointerEvent)=>{if(e.isPrimary&&e.pointerType==='touch')down={x:e.clientX,y:e.clientY,scroll:scrollY,id:e.pointerId};};
    const release=(e:PointerEvent)=>{
      const start=down;down=null;
      if(!start||e.pointerId!==start.id||Math.hypot(e.clientX-start.x,e.clientY-start.y)>10||Math.abs(scrollY-start.scroll)>4||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      if(!(e.target as Element).closest('.museum-proof,.case-screen,.museum-cta'))return;
      const ripple=document.createElement('i');ripple.className='museum-ripple';ripple.style.left=`${e.clientX}px`;ripple.style.top=`${e.clientY}px`;document.body.append(ripple);
      const a=ripple.animate([{opacity:.2,transform:'translate(-50%,-50%) scale(.1)'},{opacity:0,transform:'translate(-50%,-50%) scale(1)'}],{duration:250,easing:'ease-out'});a.onfinish=()=>ripple.remove();
    };
    const cancel=()=>{down=null;};
    document.addEventListener('pointerdown',press,{passive:true});document.addEventListener('pointerup',release,{passive:true});document.addEventListener('pointercancel',cancel);
    return ()=>{media.revert();document.removeEventListener('pointerdown',press);document.removeEventListener('pointerup',release);document.removeEventListener('pointercancel',cancel);document.querySelectorAll('.museum-ripple').forEach(n=>n.remove());};
  },[]);
  return null;
}
