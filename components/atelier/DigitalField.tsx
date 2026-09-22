'use client';
import { useEffect, useRef } from 'react';
import type * as Three from 'three';
export type FieldMode = 'core' | 'globe' | 'aggregation' | 'topology';

/** Deterministic semantic geometry. Finite scenes settle; continuous scenes sleep offscreen. */
export default function DigitalField({ mode }: { mode: FieldMode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    let disposed = false, initialized = false;
    let stop: (() => void) | undefined;
    const lazy = new IntersectionObserver(async entries => {
      if (!entries[0].isIntersecting || initialized) return;
      initialized = true;
      const T = await import('three');
      if (disposed) return;
      let renderer: Three.WebGLRenderer;
      try { renderer = new T.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { host.dataset.render = 'fallback'; return; }
      host.dataset.render = 'webgl';
      host.appendChild(renderer.domElement);
      const mobile = matchMedia('(max-width: 700px)').matches;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      renderer.setPixelRatio(Math.min(devicePixelRatio, mobile ? 1.25 : 1.5));
      renderer.setClearColor(0x000000, 0);
      const scene = new T.Scene();
      if(mode === 'globe') scene.fog = new T.Fog(0xe2eeea, 7.1, 10.6);
      const camera = new T.PerspectiveCamera(mode === 'globe' ? 38 : 36, 1, .1, 60);
      camera.position.z = mode === 'globe' ? 8.1 : 9.2;
      const group = new T.Group(); scene.add(group);
      const continuous = mode === 'globe' || mode === 'core';
      const ink = mode === 'topology' ? 0x123f48 : 0x087f73;
      const material = (opacity: number) => new T.LineBasicMaterial({ color: ink, transparent: true, opacity, depthWrite: false });
      const line = (points: Three.Vector3[], opacity: number) => {
        const object = new T.Line(new T.BufferGeometry().setFromPoints(points), material(opacity)); group.add(object); return object;
      };
      const points = (positions: number[] | Float32Array, opacity: number, size: number) => {
        const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
        const pointMaterial = new T.PointsMaterial({ color: ink, size, transparent: true, opacity, depthWrite: false, sizeAttenuation: true });
        pointMaterial.onBeforeCompile = shader => { shader.fragmentShader = shader.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\nif (length(gl_PointCoord - vec2(0.5)) > 0.5) discard;'); };
        const object = new T.Points(geometry, pointMaterial); group.add(object); return object;
      };
      const routes: Three.Curve<Three.Vector3>[] = [];
      let animatedNodes: Three.Points | undefined;
      let origins: Float32Array | undefined, destinations: Float32Array | undefined;
      let topology: Three.BufferGeometry | undefined;
      let edgeVertices = 0;
      if (mode === 'core') {
        // Five nodes belong to physical orbit paths, not a free-floating particle cloud.
        for (let ring = 0; ring < 3; ring++) {
          const radius = 2.35 + ring * .17;
          const rotation = new T.Euler(.25 + ring * .66, .1 + ring * .57, -.2);
          const path = Array.from({ length: 161 }, (_, i) => new T.Vector3(Math.cos(i / 160 * Math.PI * 2) * radius, Math.sin(i / 160 * Math.PI * 2) * radius, 0).applyEuler(rotation));
          line(path, ring === 0 ? .2 : .12);
          routes.push(new T.CatmullRomCurve3(path.slice(0, -1), true));
        }
        animatedNodes = points(new Float32Array(15), .2, .095);
      } else if (mode === 'globe') {
        // Irregular geodesic neighbors across three depth shells; no globe texture or stock wireframe.
        const count = mobile ? 95 : 155;
        const positions: Three.Vector3[] = [];
        for (let i = 0; i < count; i++) {
          const y = 1 - 2 * (i + .5) / count, a = i * Math.PI * (3 - Math.sqrt(5));
          const r = i % 7 === 0 ? 1.75 : i % 5 === 0 ? 2.03 : 2.4;
          positions.push(new T.Vector3(Math.cos(a) * Math.sqrt(1-y*y)*r, y*r, Math.sin(a)*Math.sqrt(1-y*y)*r));
        }
        for (let layer = 0; layer < 3; layer++) {
          const coords = positions.filter((_, i) => i % 3 === layer).flatMap(p => p.toArray());
          points(coords, [.2,.27,.35][layer], [.055,.085,.125][layer]);
        }
        const edges: number[] = [];
        positions.forEach((a, i) => {
          const nearest = positions.map((b,j) => ({ j, d:a.distanceToSquared(b) })).filter(b => b.j > i && b.d < 1.65).sort((a,b)=>a.d-b.d).slice(0,2);
          nearest.forEach(({j}) => { edges.push(...a.toArray(), ...positions[j].toArray()); });
        });
        const geometry = new T.BufferGeometry(); geometry.setAttribute('position', new T.Float32BufferAttribute(edges,3));
        group.add(new T.LineSegments(geometry, material(.2)));
        for (let i = 0; i < 3; i++) {
          const a = positions[20+i*21], b = positions[48+i*23];
          const route = new T.QuadraticBezierCurve3(a, a.clone().add(b).normalize().multiplyScalar(2.8), b);
          routes.push(route); line(route.getPoints(70), .18);
        }
        // One fine perimeter provides scale while perspective separates foreground and rear nodes.
        line(Array.from({length:161},(_,i)=>new T.Vector3(Math.cos(i/160*Math.PI*2)*2.58,Math.sin(i/160*Math.PI*2)*2.58,0)), .1);
      } else if (mode === 'aggregation') {
        const canvas = document.createElement('canvas'); canvas.width=180; canvas.height=130;
        const ctx = canvas.getContext('2d')!; ctx.font='bold 118px Arial'; ctx.fillText('24', 10, 108);
        const pixels = ctx.getImageData(0,0,180,130).data, target: number[]=[];
        for(let y=15;y<112;y+=9) for(let x=10;x<170;x+=9) if(pixels[(y*180+x)*4+3]>80) target.push((x-90)/27,(65-y)/27,0);
        destinations = new Float32Array(target); origins = new Float32Array(target.length);
        for(let i=0;i<target.length/3;i++) origins.set([Math.sin(i*2.399)*3.4,Math.cos(i*1.719)*2.8,Math.sin(i)*.7],i*3);
        animatedNodes=points(origins,.2,.06);
      } else {
        const hubs=[new T.Vector3(-1.1,.5,0),new T.Vector3(1.6,-.4,0)];
        const coords:number[]=[],edges:number[]=[];
        for(let i=0;i<12;i++) {
          const hub=hubs[i%2], p=new T.Vector3(Math.cos(i*2.399)*3.4,Math.sin(i*2.399)*2.5,0);
          const mid=p.clone().lerp(hub,.5); mid.y=p.y;
          coords.push(...p.toArray()); edges.push(...p.toArray(),...mid.toArray(),...mid.toArray(),...hub.toArray());
        }
        edges.push(...hubs[0].toArray(),...hubs[1].toArray());
        topology=new T.BufferGeometry();topology.setAttribute('position',new T.Float32BufferAttribute(edges,3));edgeVertices=edges.length/3;
        group.add(new T.LineSegments(topology,material(.15)));points(coords,.15,.065);points(hubs.flatMap(p=>p.toArray()),.15,.16);
      }
      const packets = continuous ? points(new Float32Array(routes.length*3), mode === 'core' ? .2 : .35, .07) : undefined;
      let visible=false, entered=false, raf=0, time=0, last=0, elapsed=0, mx=0, my=0, modalOpen=false;
      const draw = (now: number) => {
        raf=0; const dt=Math.min((now-last)/1000 || 0,.05);last=now;
        if(!reduced.matches) {time+=dt;if(entered) elapsed+=dt;}
        const progress=reduced.matches?1:Math.min(elapsed/.85,1), eased=1-Math.pow(1-progress,3);
        host.dataset.settled=String(!continuous && progress>=1);
        if(mode==='globe') {group.rotation.y=time*Math.PI*2/90+mx*.06;group.rotation.x=-.15+my*.035;}
        if(mode==='core' && animatedNodes) {
          for(let i=0;i<5;i++) {const p=routes[i%3].getPoint((time/65+i/5)%1);animatedNodes.geometry.attributes.position.setXYZ(i,p.x,p.y,p.z);}
          animatedNodes.geometry.attributes.position.needsUpdate=true;
        }
        if(mode==='aggregation' && animatedNodes && origins && destinations) {
          const attr=animatedNodes.geometry.attributes.position;
          for(let i=0;i<origins.length/3;i++) attr.setXYZ(i,...[0,1,2].map(j=>origins![i*3+j]+(destinations![i*3+j]-origins![i*3+j])*eased) as [number,number,number]);
          attr.needsUpdate=true;
        }
        if(topology) topology.setDrawRange(0,Math.floor(edgeVertices*eased/2)*2);
        if(packets) {
          routes.forEach((route,i)=>{const p=route.getPoint((time/24+i*.31)%1);packets.geometry.attributes.position.setXYZ(i,p.x,p.y,p.z);});
          packets.geometry.attributes.position.needsUpdate=true;
          // A connected research sphere only surfaces a short, legible packet window;
          // the field itself remains quiet between transmissions.
          packets.visible=mode==='globe' ? time%7.5<1.2 : mode!=='core'||time%12<4;
        }
        renderer.render(scene,camera);
        host.dataset.frames=String(Number(host.dataset.frames||0)+1);
        if(visible && !document.hidden && !modalOpen && !reduced.matches && (continuous || progress<1)) raf=requestAnimationFrame(draw);
      };
      const schedule=()=>{cancelAnimationFrame(raf);raf=0;host.dataset.paused=String(!visible||document.hidden||modalOpen||reduced.matches);if(visible&&!document.hidden&&!modalOpen){last=performance.now();raf=requestAnimationFrame(draw);}};
      const resize=()=>{const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();schedule();};
      const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
      const visibilityObserver=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(entries[0].intersectionRatio>=.2)entered=true;schedule();},{threshold:[0,.2]});visibilityObserver.observe(host);
      const move=(e:PointerEvent)=>{if(e.pointerType!=='mouse'||mode!=='globe')return;mx=e.clientX/innerWidth*2-1;my=e.clientY/innerHeight*2-1;};
      const dialog=new MutationObserver(()=>{const open=!!document.querySelector('dialog[open]');if(open!==modalOpen){modalOpen=open;schedule();}});dialog.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open']});
      const lost=(e:Event)=>{e.preventDefault();host.dataset.render='fallback';cancelAnimationFrame(raf);visible=false;};
      renderer.domElement.addEventListener('webglcontextlost',lost);window.addEventListener('pointermove',move,{passive:true});document.addEventListener('visibilitychange',schedule);reduced.addEventListener('change',schedule);resize();
      stop=()=>{cancelAnimationFrame(raf);resizeObserver.disconnect();visibilityObserver.disconnect();dialog.disconnect();window.removeEventListener('pointermove',move);document.removeEventListener('visibilitychange',schedule);reduced.removeEventListener('change',schedule);renderer.domElement.removeEventListener('webglcontextlost',lost);scene.traverse(obj=>{const mesh=obj as Three.Mesh;mesh.geometry?.dispose();if(Array.isArray(mesh.material))mesh.material.forEach(m=>m.dispose());else mesh.material?.dispose();});renderer.dispose();renderer.domElement.remove();};
    },{rootMargin:'200px'});
    lazy.observe(host);
    return ()=>{disposed=true;lazy.disconnect();stop?.();};
  },[mode]);
  return <div className={`digital-field field-${mode}`} ref={root} aria-hidden="true"><div className="field-fallback"><i /><i /><i /><b /></div>{mode==='topology' && <div className="topology-authorities"><span>CNNVD</span><span>CNVD</span></div>}</div>;
}
