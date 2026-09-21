'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
const EvidenceModal = dynamic(()=>import('./EvidenceModal'), {ssr:false});
const EvidenceContext = createContext<(id:string,trigger:HTMLElement)=>void>(()=>{});

export function Exhibition({children}:{children:ReactNode}) {
  const [active,setActive]=useState<string|null>(null);
  const returnFocus=useRef<HTMLElement|null>(null);
  const open=useCallback((id:string,trigger:HTMLElement)=>{returnFocus.current=trigger;setActive(id);},[]);
  return <EvidenceContext.Provider value={open}>{children}{active&&<EvidenceModal id={active} onChange={setActive} onClose={()=>setActive(null)} returnFocus={returnFocus.current}/>}</EvidenceContext.Provider>;
}
export function EvidenceButton({id,children,className='',label}:{id:string;children:ReactNode;className?:string;label?:string}) {
  const open=useContext(EvidenceContext);
  return <button type="button" className={className} onClick={event=>open(id,event.currentTarget)} aria-label={label}>{children}</button>;
}
