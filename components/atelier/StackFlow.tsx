'use client';
import { useEffect, useRef } from 'react';

export default function StackFlow() {
  const root=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const host=root.current!;
    const path=host.querySelector<SVGPathElement>('.pipeline-path')!;
    const packet=host.querySelector<SVGCircleElement>('.pipeline-packet')!;
    const nodes=Array.from(host.querySelectorAll<HTMLElement>('[data-pipeline-node]'));
    const reduced=matchMedia('(prefers-reduced-motion: reduce)');
    let played=false,raf=0,start=0,distances:number[]=[];
    const geometry=()=>{
      const bounds=host.getBoundingClientRect();
      const coords=nodes.map(n=>{const r=n.getBoundingClientRect();return [r.left+r.width/2-bounds.left,r.top+r.height/2-bounds.top];});
      path.setAttribute('d',coords.map(([x,y],i)=>`${i?'L':'M'} ${x} ${y}`).join(' '));
      let length=0;distances=coords.map((p,i)=>{if(i)length+=Math.hypot(p[0]-coords[i-1][0],p[1]-coords[i-1][1]);return length;});
      distances=distances.map(d=>d/(length||1));
    };
    const finish=()=>{cancelAnimationFrame(raf);packet.style.opacity='0';nodes.forEach(n=>n.dataset.active='true');host.dataset.complete='true';};
    const draw=(now:number)=>{
      if(!start)start=now;
      const p=Math.min((now-start)/1300,1),point=path.getPointAtLength(p*path.getTotalLength());
      packet.setAttribute('cx',String(point.x));packet.setAttribute('cy',String(point.y));packet.style.opacity=p===1?'0':'1';
      nodes.forEach((n,i)=>{if(p>=distances[i]-.005)n.dataset.active='true';});
      if(p<1)raf=requestAnimationFrame(draw);else finish();
    };
    const observer=new IntersectionObserver(entries=>{if(entries[0].intersectionRatio>=.35&&!played){played=true;geometry();host.dataset.runs='1';if(reduced.matches)finish();else raf=requestAnimationFrame(draw);}},{threshold:[.35]});observer.observe(host);
    const resize=new ResizeObserver(geometry);resize.observe(host);geometry();
    const preference=()=>{if(reduced.matches)finish();};reduced.addEventListener('change',preference);
    return ()=>{cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();reduced.removeEventListener('change',preference);};
  },[]);
  return <div className="stack-flow" data-stack-flow ref={root}><svg className="pipeline-svg" aria-hidden="true"><path className="pipeline-path" /><circle className="pipeline-packet" r="4" /></svg><ol>{[['Frontend','界面与交互'],['Backend','业务与接口'],['Database','数据与状态'],['Deployment','部署与访问']].map(([name,label],i)=><li key={name}><span className="stack-port" data-pipeline-node>0{i+1}</span><strong>{name}</strong><span>{label}</span></li>)}</ol><div className="stack-destination"><b data-pipeline-node>LIVE</b><span>交付可访问的产品</span></div><p className="proof-note">从一次交互，到一个可访问的产品。全栈工程链路示意。</p></div>;
}
