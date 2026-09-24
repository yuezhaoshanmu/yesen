'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
const links=[['home','首页'],['authority-evidence','权威证据'],['overview','荣誉总览'],['certification','Google 认证'],['edusrc','全国第24'],['national','国家成果'],['global','国际成果'],['competitions','竞赛'],['archive','其他荣誉'],['projects','全栈项目'],['guestbook','留言墙']];

export default function Navbar(){
 const [active,setActive]=useState('home');const [open,setOpen]=useState(false);const [scrolled,setScrolled]=useState(false);const progress=useRef<HTMLDivElement>(null);
 useEffect(()=>{
   let frame=0;
   const scroll=()=>{if(frame)return;frame=requestAnimationFrame(()=>{setScrolled(window.scrollY>30);const total=document.documentElement.scrollHeight-window.innerHeight;if(progress.current)progress.current.style.transform=`scaleX(${total>0?Math.max(0,Math.min(1,window.scrollY/total)):0})`;frame=0;});};
   const observer=new IntersectionObserver(entries=>{const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio);if(visible[0])setActive(visible[0].target.id);},{rootMargin:'-15% 0px -55% 0px',threshold:0});
   links.forEach(([id])=>{const el=document.getElementById(id);if(el)observer.observe(el);});
   window.addEventListener('scroll',scroll,{passive:true});scroll();
   return ()=>{window.removeEventListener('scroll',scroll);cancelAnimationFrame(frame);observer.disconnect();};
 },[]);
 return <><div className="scroll-progress" ref={progress}/><header className={`nav-wrap ${scrolled?'is-scrolled':''}`}><nav className="navbar" aria-label="主导航"><a href="#home" className="brand" onClick={()=>setOpen(false)} aria-label="YS. 叶森，返回首页">YS<span>.</span></a><span className="mobile-current-section">{links.find(([id])=>id===active)?.[1]}</span><div className={`nav-links ${open?'open':''}`} id="navigation-links">{links.map(([id,name])=><a key={id} href={'#'+id} className={active===id?'active':''} aria-current={active===id?'location':undefined} onClick={()=>setOpen(false)}>{name}</a>)}</div><a href="#overview" className="nav-archive">荣誉总览 <ArrowUpRight size={14}/></a><button className="menu-toggle icon-button" aria-label={open?'关闭导航':'打开导航'} aria-controls="navigation-links" aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={21}/>:<Menu size={21}/>}</button></nav></header></>;
}
