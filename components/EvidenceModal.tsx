'use client';

import { achievementById } from '@/data/achievements';
import { dateText } from '@/data/achievement-dates';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut, RotateCcw, FileText } from 'lucide-react';
import { evidence, evidenceById } from '@/data/evidence';

export default function EvidenceModal({id,onClose,onChange,returnFocus}:{id:string;onClose:()=>void;onChange:(id:string)=>void;returnFocus:HTMLElement|null}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [zoom,setZoom]=useState(1);
  const item=evidenceById[id];
  const achievement=achievementById[id];
  const visibleEvidence=evidence.filter(i=>i.status==='documented');
  const index=visibleEvidence.findIndex(i=>i.id===id);
  const change=(offset:number)=>{setZoom(1);onChange(visibleEvidence[(index+offset+visibleEvidence.length)%visibleEvidence.length].id);};
  const changeRef=useRef(change); changeRef.current=change;
  useEffect(()=>{
    const el=dialog.current;
    const previous=returnFocus;
    const priorOverflow=document.body.style.overflow;
    el?.showModal();document.body.style.overflow='hidden';
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Tab'){
        const focusable=Array.from(el?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], input, [tabindex="0"]')||[]).filter(node=>node.getClientRects().length>0);
        const first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
      }
      if(e.key==='ArrowRight'){e.preventDefault();changeRef.current(1);}
      if(e.key==='ArrowLeft'){e.preventDefault();changeRef.current(-1);}
    };
    el?.addEventListener('keydown',key);
    return ()=>{el?.removeEventListener('keydown',key);el?.close();document.body.style.overflow=priorOverflow;previous?.focus();};
  },[returnFocus]);
  return <dialog ref={dialog} className="evidence-modal" aria-labelledby="evidence-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
    <div className="viewer-shell">
      <div className="viewer-top"><span className="micro">EVIDENCE ARCHIVE <span className="muted">/ {String(index+1).padStart(2,'0')} OF {visibleEvidence.length}</span></span><button className="icon-button viewer-close" aria-label="关闭证明查看器" onClick={onClose} autoFocus><X size={21}/><span>关闭</span></button></div>
      <div className="viewer-main">
        <div className="viewer-art"><CertificateImage key={id} src={item.preview} title={item.title} zoom={zoom} setZoom={setZoom}/><div className="zoom-controls"><button className="icon-button" aria-label="缩小证明" disabled={zoom<=1} onClick={()=>setZoom(z=>Math.max(1,z-.5))}><ZoomOut size={18}/></button><span>{Math.round(zoom*100)}%</span><button className="icon-button" aria-label="放大证明" disabled={zoom>=4} onClick={()=>setZoom(z=>Math.min(4,z+.5))}><ZoomIn size={18}/></button><button className="icon-button" aria-label="重置缩放" onClick={()=>setZoom(1)}><RotateCcw size={16}/></button></div></div>
        <aside className="viewer-details"><span className="eyebrow">{item.category} / {item.status==='pending'?'补充材料':'原始材料归档'}</span><h2 id="evidence-title">{item.title}</h2><p>{item.description}</p>{achievement && <p className="achievement-significance">{achievement.significance}</p>}<dl><div><dt>出具机构 / 平台</dt><dd>{item.issuer}</dd></div>{item.date && <div className="viewer-date"><dt>{achievement?.dateLabel || item.dateLabel || '证书时间'}</dt><dd><time dateTime={item.date ?? undefined}>{dateText(item.date,true)}</time></dd></div>}{achievement?.relatedDates?.map(event=><div key={event.label}><dt>{event.label}</dt><dd>{dateText(event.date,true)}</dd></div>)}{item.identifier&&<div><dt>成果编号</dt><dd className="mono">{item.identifier}</dd></div>}<div><dt>成果层级 / 类型</dt><dd>{achievement?.levelLabel || item.level}</dd></div>{achievement && <div><dt>时间依据</dt><dd>{achievement.dateEvidence}</dd></div>}</dl>
          <a className="button button-light" href={item.original} target="_blank" rel="noopener noreferrer"><FileText size={16}/>查看原始证明<ArrowUpRight size={17}/></a>
          {item.verificationUrl&&<a className="button button-outline" href={item.verificationUrl} target="_blank" rel="noopener noreferrer">前往官方平台验证<ArrowUpRight size={17}/></a>}
          {item.note&&<p className="viewer-note">{item.note}</p>}<p className="source-note">材料来源：{item.source}</p>
        </aside>
      </div>
      <div className="viewer-bottom"><button onClick={()=>change(-1)} className="text-button"><ChevronLeft size={17}/>上一份证明</button><span className="micro muted">← → 切换 · ESC 关闭</span><button onClick={()=>change(1)} className="text-button">下一份证明<ChevronRight size={17}/></button></div>
    </div>
  </dialog>;
}

function CertificateImage({src,title,zoom,setZoom}:{src:string;title:string;zoom:number;setZoom:(zoom:number)=>void}) {
 const viewport=useRef<HTMLDivElement>(null);
 const [pan,setPan]=useState({x:0,y:0});
 useEffect(()=>{if(zoom===1)setPan({x:0,y:0});},[zoom]);
 const points=useRef(new Map<number,{x:number;y:number}>());
 const gesture=useRef({distance:0,zoom:1,x:0,y:0,panX:0,panY:0});
 const start=()=>{
  const values=[...points.current.values()];
  if(!values.length)return;
  const a=values[0],b=values[1]||a;
  gesture.current={distance:Math.hypot(a.x-b.x,a.y-b.y),zoom,x:(a.x+b.x)/2,y:(a.y+b.y)/2,panX:pan.x,panY:pan.y};
 };
 const constrain=(x:number,y:number,scale:number)=>{
  const image=viewport.current?.querySelector('img');const box=viewport.current;
  const maxX=image&&box?Math.max(0,(image.offsetWidth*scale-box.clientWidth)/2):0;
  const maxY=image&&box?Math.max(0,(image.offsetHeight*scale-box.clientHeight)/2):0;
  return {x:Math.max(-maxX,Math.min(maxX,x)),y:Math.max(-maxY,Math.min(maxY,y))};
 };
 const bounded=constrain(pan.x,pan.y,zoom);
 return <div ref={viewport} className="image-viewport touch-certificate" onPointerDown={e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;
  e.currentTarget.setPointerCapture(e.pointerId);points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});start();
 }} onPointerMove={e=>{
  if(!points.current.has(e.pointerId))return;
  points.current.set(e.pointerId,{x:e.clientX,y:e.clientY});
  const values=[...points.current.values()],a=values[0],b=values[1]||a,g=gesture.current;
  const scale=values.length>1&&g.distance>0?Math.max(1,Math.min(4,g.zoom*Math.hypot(a.x-b.x,a.y-b.y)/g.distance)):zoom;
  if(values.length>1)setZoom(scale);
  const ratio=scale/g.zoom;
  const rect=e.currentTarget.getBoundingClientRect();
  setPan(constrain(g.panX*ratio+((a.x+b.x)/2-g.x)+(g.x-rect.left-rect.width/2)*(1-ratio),g.panY*ratio+((a.y+b.y)/2-g.y)+(g.y-rect.top-rect.height/2)*(1-ratio),scale));
 }} onPointerUp={e=>{points.current.delete(e.pointerId);start();}} onPointerCancel={()=>points.current.clear()} onLostPointerCapture={e=>{points.current.delete(e.pointerId);}}>
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img src={src} alt={title+'完整证明'} draggable={false} style={{transform:`translate(${bounded.x}px,${bounded.y}px) scale(${zoom})`}}/>
 </div>;
}
