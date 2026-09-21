'use client';
import { useRef, type ReactNode } from 'react';
export default function Spotlight({children,className='',tilt=false}:{children:ReactNode;className?:string;tilt?:boolean}){
 const ref=useRef<HTMLDivElement>(null);
 return <div ref={ref} className={`spotlight ${className}`} onPointerMove={e=>{
   if(window.matchMedia('(max-width: 900px)').matches||e.pointerType!=='mouse'||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
   const el=ref.current;if(!el)return;const b=el.getBoundingClientRect();const x=e.clientX-b.left,y=e.clientY-b.top;
   el.style.setProperty('--mx',`${x}px`);el.style.setProperty('--my',`${y}px`);
   if(tilt)el.style.transform=`perspective(1000px) rotateX(${-(y/b.height-.5)*3}deg) rotateY(${(x/b.width-.5)*3}deg)`;
 }} onPointerLeave={()=>{if(ref.current)ref.current.style.transform='';}}>{children}</div>;
}
