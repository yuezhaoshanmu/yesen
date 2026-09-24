'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const fixed = (value: number) => Number(value.toFixed(4));
const nodes = Array.from({ length: 12 }, (_, i) => {
  const a = i * Math.PI / 6 - .35;
  return { x: fixed(624 + Math.cos(a) * (360 + i % 3 * 42)), y: fixed(378 + Math.sin(a) * (240 + i % 2 * 72)) };
});
const cloud = Array.from({ length: 112 }, (_, i) => {
  const y = 1 - (i + .5) / 56, a = i * 2.399963;
  return { x: fixed(624 + Math.cos(a) * Math.sqrt(1 - y * y) * 260), y: fixed(365 + y * 260), depth: fixed(Math.sin(a)) };
});
const mobileCloud = Array.from({ length: 40 }, (_, i) => {
  const y = 1 - (i + .5) / 20, a = i * 2.399963;
  return { x: fixed(624 + Math.cos(a) * Math.sqrt(1 - y * y) * 260), y: fixed(365 + y * 260), depth: fixed(Math.sin(a)) };
});
const routes = [
  'M 994 378 A 370 282 0 1 1 254 378 A 370 282 0 1 1 994 378',
  'M 970 215 A 390 150 -26 1 1 278 541 A 390 150 -26 1 1 970 215',
  'M 843 667 A 356 144 53 1 1 405 89 A 356 144 53 1 1 843 667',
];
const labels = ['SEC', 'CVE', 'TLS', 'CNVD', 'API', 'DB'];

/** SVG owns the opening clock from first paint. WebGL progressively enhances only the core. */
export default function HeroNetwork() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current!;
    // The hero section is identified separately from the home anchor so that
    // the authority evidence section can follow it as the first content block.
    const hero = host.closest<HTMLElement>('#hero') ?? host.closest<HTMLElement>('#home');
    if (!hero) return;
    gsap.registerPlugin(ScrollTrigger);
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = matchMedia('(min-width: 701px)');
    let disposed = false, disposeCore: (() => void) | undefined;
    const elapsed = () => Number(host.querySelector('.security-orbit')?.getAnimations()[0]?.currentTime ?? 1400);
    // No mobile WebGL context, model, texture, or heavy pointer work.
    if (desktop.matches && !reduced.matches) {
      import('./PointCloudCore').then(({ mountPointCloud }) => {
        if (disposed) return;
        disposeCore = mountPointCloud(host, elapsed());
      }).catch(() => { host.dataset.core = 'svg'; });
    }
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const ctx = gsap.context(() => {
        const exit = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: .25, invalidateOnRefresh: true } });
        exit.to('.hero-person', { scale: .96, duration: .2, ease: 'none' }, 0)
          .to('.point-cloud-mount,.svg-cloud', { scale: 1.1, transformOrigin:'52% 47%', duration: .2, ease: 'none' }, 0)
          .to('.network-orbits', { scale: 1.25, rotation: 8, transformOrigin: '52% 47%', duration: .2, ease: 'none' }, 0)
          .to('.hero-person', { opacity: .35, duration: .4, ease: 'none' }, .2)
          .to('.network-distant', { y: 90, duration:.35, ease:'none' }, .2)
          .to('.hero-colophon span:last-child', { opacity:0, duration:.45 }, .55)
          .to('.hero-network', { opacity: .18, duration: .5, ease: 'none' }, .35)
          .to('.editorial-name,.hero-manifesto,.hero-credentials', { clipPath: 'inset(0 0 100% 0)', duration: .4, ease: 'none' }, .6);
        const line = document.querySelector<HTMLElement>('.academic-handoff');
        if (!line) return;
        const relays = hero.querySelectorAll<HTMLElement>('.handoff-particles i');
        gsap.fromTo(relays, { opacity: 0 }, {
          opacity: .6, left: i => `${8 + i / (relays.length - 1) * 84}%`,
          top: () => line.getBoundingClientRect().top - hero.querySelector('.handoff-particles')!.getBoundingClientRect().top + 1,
          duration: 1, ease: 'power2.inOut',
          scrollTrigger: { trigger: hero, start: 'top -15%', end: 'bottom 35%', scrub: .3, invalidateOnRefresh: true },
        });
        gsap.fromTo(line.querySelector('i'), { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: hero, start: 'top -45%', end: 'bottom 35%', scrub: .3 } });
      }, hero);
      return () => ctx.revert();
    });
    let pointerFrame = 0, x = 0, y = 0;
    const move = (e: PointerEvent) => {
      if (!desktop.matches || reduced.matches || e.pointerType !== 'mouse') return;
      const rect = hero.getBoundingClientRect();
      x = (e.clientX / rect.width - .5) * 2; y = ((e.clientY - rect.top) / rect.height - .5) * 2;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(() => {
        hero.style.setProperty('--pointer-x', String(x)); hero.style.setProperty('--pointer-y', String(y)); pointerFrame = 0;
      });
    };
    const leave = () => { hero.style.setProperty('--pointer-x', '0'); hero.style.setProperty('--pointer-y', '0'); };
    hero.addEventListener('pointermove', move, { passive: true }); hero.addEventListener('pointerleave', leave);
    return () => { disposed = true; disposeCore?.(); media.revert(); cancelAnimationFrame(pointerFrame); hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', leave); leave(); };
  }, []);
  return <>
    <div className="hero-network" ref={root} aria-hidden="true">
      <div className="core-radial" />
      <svg className="network-svg" viewBox="0 0 1200 800" fill="none">
        <defs><radialGradient id="node-light"><stop stopColor="#087368" stopOpacity=".32" /><stop offset="1" stopColor="#087368" stopOpacity="0" /></radialGradient></defs>
        <g className="network-distant">
          {nodes.map((n, i) => <g key={i}>
            <path className="network-connection" pathLength="100" d={`M ${n.x} ${n.y} L ${nodes[(i + 1) % nodes.length].x} ${nodes[(i + 1) % nodes.length].y} L 624 378`} style={{ '--i': i } as CSSProperties} />
            <g className="network-node" style={{ '--i': i, transformOrigin: `${n.x}px ${n.y}px` } as CSSProperties}><circle cx={n.x} cy={n.y} r="15" fill="url(#node-light)" /><circle cx={n.x} cy={n.y} r="3" fill="#087368" /><circle cx={n.x} cy={n.y} r="7" stroke="#087368" strokeOpacity=".35" /></g>
          </g>)}
        </g>
        <g className="network-orbits">{routes.map((d, i) => <path id={`security-route-${i}`} key={i} className={`security-orbit orbit-${i}`} d={d} pathLength="100" />)}</g>
        {[cloud, mobileCloud].map((points, index) => <g className={`svg-cloud ${index ? 'mobile-cloud' : 'desktop-cloud'}`} key={index}>{points.map((p, i) => <circle className="core-point" key={i} cx={p.x} cy={p.y} r={p.depth > 0 ? 2.3 : 1.5} fill="#12675f" opacity={p.depth > 0 ? .64 : .24} style={{ '--i': i % 7, '--dx': `${fixed(Math.sin(i * 13.1) * 440)}px`, '--dy': `${fixed(Math.cos(i * 7.3) * 360)}px` } as CSSProperties} />)}</g>)}
        <g className="convergence">{Array.from({ length: 40 }, (_, i) => <circle key={i} cx={fixed(624 + Math.sin(i * 2.4) * 80)} cy={fixed(378 + Math.cos(i * 2.4) * 80)} r={i % 3 === 0 ? 2.8 : 1.7} fill="#0b7166" style={{ '--dx': `${fixed(Math.cos(i * 2.4) * 700)}px`, '--dy': `${fixed(Math.sin(i * 2.4) * 480)}px`, '--i': i % 5 } as CSSProperties} />)}</g>
        <g className="ambient-nodes">{Array.from({ length: 8 }, (_, i) => <circle key={i} cx={fixed(624 + Math.sin(i * 2.4) * (310 + i % 3 * 45))} cy={fixed(378 + Math.cos(i * 2.4) * (255 + i % 2 * 70))} r="2" fill="#135e58" style={{ '--i': i } as CSSProperties} />)}</g>
        <g className="network-labels">{labels.map((label, i) => <text key={label} x={nodes[i * 2].x + 14} y={nodes[i * 2].y - 12}>{label}</text>)}</g>
        <g className="opening-packets">{routes.map((d, i) => <circle key={i} r="3" fill="#086e63" style={{ offsetPath: `path('${d}')`, '--i': i } as CSSProperties} />)}</g>
        <g className="idle-packets">{routes.map((d, i) => <circle key={i} r="2.4" fill="#086e63" style={{ offsetPath: `path('${d}')`, '--i': i } as CSSProperties} />)}</g>
        <circle className="core-pulse" cx="624" cy="378" r="175" />
      </svg>
      <div className="point-cloud-mount" />
      <span className="network-caption">SECURITY ORBIT / DIGITAL CORE</span>
    </div>
    <div className="handoff-particles" aria-hidden="true">{Array.from({ length: 20 }, (_, i) => <i key={i} style={{ left: `${fixed(24 + Math.sin(i * 2.4) * 20 + 28)}%`, top: `${fixed(36 + Math.cos(i * 2.4) * 25)}%` }} />)}</div>
  </>;
}
