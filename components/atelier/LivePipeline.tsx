'use client';
import { useEffect, useRef } from 'react';
import { PARTICLE_EVENT, type DataEvent } from '../effects/DataPulse';
/** Writes and subscription receipts are separate facts; never simulate a realtime acknowledgement. */
export default function LivePipeline({database,live}:{database:boolean;live:boolean}) {
  const root=useRef<HTMLDivElement>(null);
  const liveRef=useRef(live);
  useEffect(()=>{liveRef.current=live;},[live]);
  useEffect(()=>{
    const host=root.current!,path=host.querySelector<SVGPathElement>('path')!,packet=host.querySelector<SVGCircleElement>('circle')!;
    let raf=0,lastWrite=0;
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    const geometry=()=>{const r=host.getBoundingClientRect();const pts=Array.from(host.querySelectorAll('.live-port')).map(n=>{const b=n.getBoundingClientRect();return `${b.x+b.width/2-r.x},${b.y+b.height/2-r.y}`;});path.setAttribute('d',pts.map((p,i)=>`${i?'L':'M'}${p}`).join(' '));};
    const run=(kind:'write'|'receive')=>{
      if(document.hidden||reduced.matches)return;
      const r=host.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
      // Coalesce an INSERT that follows this client's acknowledged write into the same 800ms gesture.
      if(kind==='receive'&&performance.now()-lastWrite<850){host.dataset.received='true';return;}
      cancelAnimationFrame(raf);geometry();
      if(kind==='write'){lastWrite=performance.now();delete host.dataset.received;}
      const start=performance.now();host.dataset.flow=kind;
      const frame=(now:number)=>{
        const t=Math.min((now-start)/800,1), end=kind==='write'&&!liveRef.current?2/3:1;
        const p=(kind==='receive'?2/3+(1/3)*t:end*t),v=path.getPointAtLength(p*path.getTotalLength());
        packet.setAttribute('cx',String(v.x));packet.setAttribute('cy',String(v.y));packet.style.opacity=t===1?'0':'1';
        if(t<1)raf=requestAnimationFrame(frame);else delete host.dataset.flow;
      };raf=requestAnimationFrame(frame);
    };
    const accepted=()=>run('write');const received=(e:Event)=>{if((e as CustomEvent<DataEvent>).detail.type==='message')run('receive');};
    const resize=new ResizeObserver(geometry);resize.observe(host);geometry();
    const clear=()=>{cancelAnimationFrame(raf);packet.style.opacity='0';delete host.dataset.flow;};
    const preference=()=>{if(reduced.matches||document.hidden)clear();};
    reduced.addEventListener('change',preference);document.addEventListener('visibilitychange',preference);
    window.addEventListener('yesen:write-accepted',accepted);window.addEventListener(PARTICLE_EVENT,received);
    return ()=>{clear();reduced.removeEventListener('change',preference);document.removeEventListener('visibilitychange',preference);resize.disconnect();window.removeEventListener('yesen:write-accepted',accepted);window.removeEventListener(PARTICLE_EVENT,received);};
  },[]);
  return <div className="live-pipeline" ref={root}><svg aria-hidden="true"><path /><circle className="write-packet" r="3.5" /></svg>{[['INPUT','你的一句话',true],['API','安全提交',database],['DATABASE',database?'已连接':'等待连接',database],['REALTIME',live?'实时连接':'普通模式',live]].map(([name,label,connected],i)=><div key={String(name)} data-connected={connected}><i className="live-port" /><span>0{i+1} / {name}</span><strong>{label}</strong></div>)}</div>;
}
