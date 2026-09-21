'use client';

import { useEffect, useRef } from 'react';

export default function SecurityCore(){
 const ref=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
   const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');if(!ctx)return;
   const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
   let frame=0,visible=true,w=650,h=650,rotation=.25,last=0,px=0,py=0,tx=0,ty=0;
   const resize=()=>{const b=canvas.getBoundingClientRect();w=b.width;h=b.height;const dpr=Math.min(window.devicePixelRatio,1.6);canvas.width=w*dpr;canvas.height=h*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw();};
   const project=(x:number,y:number,z:number)=>{const c=Math.cos(rotation+px),s=Math.sin(rotation+px);const xx=x*c+z*s,zz=z*c-x*s;const ct=Math.cos(-.27+py),st=Math.sin(-.27+py);return {x:xx,y:y*ct-zz*st,z:zz*ct+y*st};};
   const draw=()=>{
     ctx.clearRect(0,0,w,h);const r=Math.min(w,h)*.295;const cx=w*.51,cy=h*.49;
     const glow=ctx.createRadialGradient(cx+r*.25,cy-r*.2,0,cx,cy,r*1.42);glow.addColorStop(0,'rgba(54,158,130,.08)');glow.addColorStop(.62,'rgba(30,113,101,.04)');glow.addColorStop(1,'rgba(20,80,70,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
     for(let lat=1;lat<19;lat++){
       const theta=lat/19*Math.PI;
       for(let lon=0;lon<88;lon++){
         const phi=lon/88*Math.PI*2;const phi2=(lon+1)/88*Math.PI*2;
         const a=project(Math.sin(theta)*Math.cos(phi),Math.cos(theta),Math.sin(theta)*Math.sin(phi));
         const b=project(Math.sin(theta)*Math.cos(phi2),Math.cos(theta),Math.sin(theta)*Math.sin(phi2));
         const depth=(a.z+1)/2;
         ctx.strokeStyle=`rgba(131,225,195,${.035+depth*.37})`;ctx.lineWidth=.55+depth*.25;ctx.beginPath();ctx.moveTo(cx+a.x*r,cy+a.y*r);ctx.lineTo(cx+b.x*r,cy+b.y*r);ctx.stroke();
         if(lon%4===0){ctx.beginPath();ctx.fillStyle=`rgba(175,248,223,${.12+depth*.64})`;ctx.arc(cx+a.x*r,cy+a.y*r,.65+depth*.7,0,Math.PI*2);ctx.fill();}
       }
     }
     for(let lon=0;lon<24;lon++){
       const phi=lon/24*Math.PI*2;
       for(let lat=0;lat<45;lat++){
         const t=lat/45*Math.PI,t2=(lat+1)/45*Math.PI;
         const a=project(Math.sin(t)*Math.cos(phi),Math.cos(t),Math.sin(t)*Math.sin(phi));const b=project(Math.sin(t2)*Math.cos(phi),Math.cos(t2),Math.sin(t2)*Math.sin(phi));
         ctx.strokeStyle=`rgba(125,219,191,${.04+(a.z+1)/2*.21})`;ctx.lineWidth=.55;ctx.beginPath();ctx.moveTo(cx+a.x*r,cy+a.y*r);ctx.lineTo(cx+b.x*r,cy+b.y*r);ctx.stroke();
       }
     }
     // Slowly rotating elliptical orbits, using perspective projection rather than a WebGL runtime.
     for(let orbit=0;orbit<3;orbit++){
       const rr=r*(1.26+orbit*.13);const inclination=.28+orbit*.72;
       for(let i=0;i<160;i++){
         const angle=i/160*Math.PI*2,angle2=(i+1)/160*Math.PI*2;
         const make=(v:number)=>project(Math.cos(v),Math.sin(v)*Math.cos(inclination),Math.sin(v)*Math.sin(inclination));
         const a=make(angle),b=make(angle2);ctx.strokeStyle=`rgba(151,209,196,${.045+(a.z+1)*.06})`;ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(cx+a.x*rr,cy+a.y*rr);ctx.lineTo(cx+b.x*rr,cy+b.y*rr);ctx.stroke();
       }
       const angle=rotation*(orbit+1)*.55+orbit*2;const a=project(Math.cos(angle),Math.sin(angle)*Math.cos(inclination),Math.sin(angle)*Math.sin(inclination));
       ctx.beginPath();ctx.fillStyle='#c7ffea';ctx.shadowBlur=12;ctx.shadowColor='#91eed0';ctx.arc(cx+a.x*rr,cy+a.y*rr,2.5,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
     }
   };
   const loop=(time:number)=>{if(!visible||document.hidden)return;const delta=last?Math.min(time-last,35):16;last=time;rotation+=delta*.000038;px+=(tx-px)*.035;py+=(ty-py)*.035;draw();if(!reduced.matches)frame=requestAnimationFrame(loop);};
   const start=()=>{cancelAnimationFrame(frame);last=0;if(visible&&!document.hidden){if(reduced.matches)draw();else frame=requestAnimationFrame(loop);}};
   const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;start();});observer.observe(canvas);
   const ro=new ResizeObserver(resize);ro.observe(canvas);
   const move=(e:PointerEvent)=>{const b=canvas.getBoundingClientRect();tx=((e.clientX-b.left)/w-.5)*.12;ty=((e.clientY-b.top)/h-.5)*.1;};
   canvas.addEventListener('pointermove',move);document.addEventListener('visibilitychange',start);reduced.addEventListener('change',start);resize();start();
   return ()=>{cancelAnimationFrame(frame);observer.disconnect();ro.disconnect();canvas.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',start);reduced.removeEventListener('change',start);};
 },[]);
 return <div className="security-core" aria-hidden="true"><div className="core-atmosphere"/><div className="core-coordinate coordinate-top">RESEARCH × ENGINEERING</div><canvas ref={ref}/><div className="core-center"><span className="core-glyph">Y<span>S</span></span><span>SECURITY CORE</span></div><span className="orbital-label label-cnvd">CNVD <i/></span><span className="orbital-label label-cnnvd"><i/> CNNVD</span><span className="orbital-label label-cve"><i/> CVE</span><span className="orbital-label label-edusrc">EDUSRC <i/></span><div className="core-coordinate coordinate-bottom"><span className="status-dot"/> KNOWLEDGE INTO IMPACT</div></div>;
}
