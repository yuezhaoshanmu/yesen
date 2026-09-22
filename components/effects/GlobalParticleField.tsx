'use client';

import { useEffect, useRef } from 'react';
import { createNetworkNodes, createParticleConfig, degradeParticleConfig, spherePoint } from './ParticleConfig';
import type { SectionEffect } from './SectionParticleEffect';
import DataPulse from './DataPulse';

type Point = { x: number; y: number; depth?: number };
type Anchor = { element: HTMLElement; kind: SectionEffect; rect: DOMRect; entered: number | null };
const TAU = Math.PI * 2;
const clamp = (n: number) => Math.max(0, Math.min(1, n));

export default function GlobalParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !ctx) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    const configForDevice = () => createParticleConfig({ width: innerWidth, dpr: devicePixelRatio || 1, cores: navigator.hardwareConcurrency || 8, memory: nav.deviceMemory, reduced: reduced.matches, saveData: nav.connection?.saveData });
    let config = configForDevice();
    const seeds = createNetworkNodes(120);
    const tokens = getComputedStyle(document.documentElement);
    const palette = ['--particle-blue', '--particle-cyan', '--particle-green', '--particle-silver'].map(t => tokens.getPropertyValue(t).trim());
    const brand = ['--particle-google-blue', '--particle-google-red', '--particle-google-yellow', '--particle-google-green'].map(t => tokens.getPropertyValue(t).trim());
    let width = innerWidth, height = innerHeight;
    let frame = 0, last = 0, clock = 0, dirty = true, paused = document.hidden, disposed = false;
    let slowFrames = 0, samples = 0, renderCost = 0, degraded = false;
    let heroRect: DOMRect | undefined;
    let portraitRect: DOMRect | undefined;
    let masks: DOMRect[] = [];
    let sectionRects: { id: string; rect: DOMRect }[] = [];
    let activeSection = 'home';
    const pointer = { x: -1000, y: -1000, strength: 0, active: false };
    let ripple: { x: number; y: number; start: number } | null = null;
    const anchors: Anchor[] = Array.from(document.querySelectorAll<HTMLElement>('[data-particle-effect]')).map(element => ({ element, kind: element.dataset.particleEffect as SectionEffect, rect: element.getBoundingClientRect(), entered: null }));
    const hero = document.getElementById('home');
    const portrait = document.querySelector('.hero-portrait-image');
    const sections = Array.from(document.querySelectorAll('main > section'));
    const maskElements = Array.from(document.querySelectorAll('.hero-copy, .hero-metrics, .hero-topline, .hero-bottom, .hero-portrait-image, .ranking-number > span, .ranking-number > div'));
    const dot = (p: Point, radius: number, alpha: number, color = palette[0]) => {
      ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, TAU); ctx.fill();
    };
    const line = (a: Point, b: Point, alpha: number, color = palette[1]) => {
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = .65;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    };
    const packet = (a: Point, b: Point, progress: number, alpha = .5) => dot({ x: a.x + (b.x - a.x) * progress, y: a.y + (b.y - a.y) * progress }, 1.65, alpha, palette[2]);
    const visible = (r: DOMRect) => r.bottom > 0 && r.top < height && r.right > 0 && r.left < width && r.width > 0;
    const measure = () => {
      heroRect = hero?.getBoundingClientRect(); portraitRect = portrait?.getBoundingClientRect();
      masks = maskElements.map(el => el.getBoundingClientRect());
      sectionRects = sections.map(el => ({ id: el.id, rect: el.getBoundingClientRect() }));
      anchors.forEach(a => { a.rect = a.element.getBoundingClientRect(); });
      dirty = false;
    };
    const resizeCanvas = () => {
      width = innerWidth; height = innerHeight;
      canvas.width = Math.round(width * config.dpr); canvas.height = Math.round(height * config.dpr);
      ctx.setTransform(config.dpr, 0, 0, config.dpr, 0, 0);
      canvas.dataset.quality = config.tier; canvas.dataset.particleCount = String(config.count);
      canvas.dataset.fps = String(config.fps); canvas.dataset.motion = config.reduced ? 'reduced' : 'full';
      dirty = true;
    };
    const protectContent = () => {
      ctx.beginPath(); ctx.rect(0, 0, width, height);
      masks.filter(visible).forEach(r => ctx.rect(r.left - 6, r.top - 5, r.width + 12, r.height + 10));
      ctx.clip('evenodd');
    };
    const network = (points: Point[], opacity: number, maxDistance: number, packetBudget: number) => {
      // Spatial buckets bound neighborhood checks as the viewport grows.
      const buckets = new Map<string, number[]>();
      points.forEach((p, i) => {
        const key = `${Math.floor(p.x / maxDistance)},${Math.floor(p.y / maxDistance)}`;
        const bucket = buckets.get(key) || []; bucket.push(i); buckets.set(key, bucket);
      });
      let packets = 0;
      points.forEach((a, i) => {
        let connected = 0;
        const bx = Math.floor(a.x / maxDistance), by = Math.floor(a.y / maxDistance);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
          for (const j of buckets.get(`${bx + dx},${by + dy}`) || []) {
            if (j <= i || connected >= config.maxConnections) continue;
            const b = points[j], distance = Math.hypot(a.x - b.x, a.y - b.y);
            if (distance > maxDistance) continue;
            line(a, b, (.08 + .1 * (1 - distance / maxDistance)) * opacity);
            connected++;
            const phase = (clock / 1000 + i * .71) % 10;
            if (!config.reduced && phase < 2.8 && i % 9 === 0 && packets < packetBudget) {
              packet(a, b, phase / 2.8, opacity * .48); packets++;
            }
          }
        }
        dot(a, seeds[i].size, opacity * (.3 + (i % 4) * .045), palette[i % 4]);
      });
    };
    const drawField = (time: number, heroVisible: boolean) => {
      const count = heroVisible ? config.count : Math.min(12, Math.floor(config.count / 3));
      const points: Point[] = [];
      for (let i = 0; i < count; i++) {
        const s = seeds[i];
        let x = s.u * width, y = s.v * height;
        if (heroVisible && heroRect) {
          y = heroRect.top + s.v * Math.min(heroRect.height, height * 1.3);
          if (i < 12 && portraitRect) {
            const a = i / 12 * TAU;
            x = portraitRect.left + portraitRect.width / 2 + Math.cos(a) * (portraitRect.width * .59 + 10);
            y = portraitRect.top + portraitRect.height * .64 + Math.sin(a) * portraitRect.height * .31;
          }
        } else {
          // Quiet continuity in the outer gutters; module diagrams carry the meaning.
          x = i % 2 ? width - 10 - s.u * 22 : 10 + s.u * 22;
        }
        x += Math.sin(time * .11 + s.phase) * 6;
        y += Math.cos(time * .09 + s.phase) * 5;
        const dx = x - pointer.x, dy = y - pointer.y, distance = Math.hypot(dx, dy);
        if (heroVisible && distance < config.pointerRadius && distance > 0) {
          const force = (1 - distance / config.pointerRadius) * 5 * pointer.strength;
          x += dx / distance * force; y += dy / distance * force;
        }
        if (ripple && heroVisible) {
          const rx = x - ripple.x, ry = y - ripple.y, rd = Math.hypot(rx, ry);
          const age = clamp((clock - ripple.start) / 650);
          if (rd < 110 && rd > 0) { const f = Math.sin(age * Math.PI) * 6 * (1 - rd / 110); x += rx / rd * f; y += ry / rd * f; }
        }
        points.push({ x, y });
      }
      ctx.save();
      if (heroVisible && heroRect) { ctx.beginPath(); ctx.rect(0, heroRect.top, width, heroRect.height); ctx.clip(); }
      protectContent();
      const fade = config.reduced ? 1 : clamp((clock - 200) / 550);
      network(points, (heroVisible ? .9 : .27) * fade, config.connectionDistance, heroVisible ? config.packetLimit : 0);
      if (heroVisible && width > 1024 && !config.reduced) {
        ctx.font = '9px Consolas, monospace'; ctx.fillStyle = palette[0]; ctx.globalAlpha = .055 * fade;
        ['HTTPS', 'API', 'SEC'].forEach((label, i) => { const p = points[15 + i * 11]; if (p) ctx.fillText(label, p.x + 7, p.y - 8); });
      }
      ctx.restore();
    };
    const drawAnchor = (a: Anchor, count: number, time: number) => {
      const r = a.rect;
      if (a.entered === null) {
        a.entered = clock;
        a.element.dataset.particleEntered = 'true';
        a.element.closest('section')?.setAttribute('data-network-entered', 'true');
      }
      const age = config.reduced ? 10 : (clock - a.entered) / 1000;
      const fade = config.reduced ? 1 : clamp(age / .7);
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      ctx.save(); ctx.beginPath(); ctx.rect(r.left, r.top, r.width, r.height); ctx.clip();
      if (a.kind === 'aggregation') {
        protectContent();
        const progress = 1 - Math.pow(1 - clamp(age / 1.8), 3);
        const points = seeds.slice(0, Math.min(36, count)).map((s, i) => {
          const theta = i / Math.min(36, count) * TAU;
          const startX = cx + Math.cos(theta) * r.width * .6;
          const startY = cy + Math.sin(theta) * r.height * .7;
          const endX = cx + Math.cos(theta) * r.width * (.29 + (i % 3) * .045);
          const endY = cy + Math.sin(theta) * r.height * (.29 + (i % 3) * .035);
          return { x: startX + (endX - startX) * progress + Math.sin(time * .12 + s.phase) * 2,
            y: startY + (endY - startY) * progress + Math.cos(time * .12 + s.phase) * 2 };
        });
        network(points, fade * .85, 90, 1);
        a.element.dataset.aggregationComplete = String(progress === 1);
      } else if (a.kind === 'security') {
        const n = Math.min(count, 30);
        const coreCount = n < 20 ? 4 : 6;
        const middleCount = Math.floor((n - coreCount) / 2);
        const ringSizes = [coreCount, middleCount, n - coreCount - middleCount];
        const ringStarts = [0, coreCount, coreCount + middleCount];
        const points = Array.from({ length: n }, (_, i) => {
          const ring = i < ringStarts[1] ? 0 : i < ringStarts[2] ? 1 : 2;
          const k = i - ringStarts[ring];
          const total = ringSizes[ring];
          const theta = k / total * TAU + (ring % 2) * .22;
          return { x: cx + Math.cos(theta) * r.width * (.14 + ring * .14), y: cy - 8 + Math.sin(theta) * r.height * (.14 + ring * .14) };
        });
        points.forEach((p, i) => {
          const ring = i < ringStarts[1] ? 0 : i < ringStarts[2] ? 1 : 2;
          const k = i - ringStarts[ring];
          const previous = points[ringStarts[ring] + (k + 1) % ringSizes[ring]];
          const reveal = clamp((age - i * .018) / .4);
          line(p, previous, reveal * .13);
          if (ring > 0) {
            const parent = ringStarts[ring - 1] + Math.round(k / ringSizes[ring] * ringSizes[ring - 1]) % ringSizes[ring - 1];
            line(p, points[parent], clamp((age - .25) / .7) * .11);
          }
          dot(p, i < coreCount ? 2.4 : 1.2, reveal * .55, palette[i < coreCount ? 2 : 0]);
        });
        if (!config.reduced && age > 1 && points.length > 7) {
          const phase = time % 9;
          if (phase < 3) packet(points[7], points[1], phase / 3, .55);
        }
      } else if (a.kind === 'globe') {
        const n = Math.min(count, 64), radius = Math.min(r.width * .42, (r.height - 28) * .47);
        const sphere = Array.from({ length: n }, (_, i) => spherePoint(i, n, time * .045));
        const points = sphere.map(p => ({ x: cx + p.x * radius, y: cy - 10 + p.y * radius, depth: (p.z + 1) / 2 }));
        const connectionThreshold = Math.min(1.2, .57 * Math.sqrt(64 / n));
        const edges: [number, number][] = [];
        points.forEach((p, i) => {
          let links = 0;
          for (let j = i + 1; j < n; j++) {
            const q = sphere[j], v = sphere[i];
            if (links < (config.tier === 'desktop' ? 4 : 2) && Math.hypot(q.x - v.x, q.y - v.y, q.z - v.z) < connectionThreshold) {
              line(p, points[j], fade * (.04 + p.depth * .11)); edges.push([i, j]); links++;
            }
          }
          dot(p, .8 + p.depth * 1.1, fade * (.16 + p.depth * .47), palette[i % 3]);
        });
        // Projected meridian: a subtle structural cue, not a glowing globe asset.
        ctx.globalAlpha = .085 * fade; ctx.strokeStyle = palette[0]; ctx.lineWidth = .65;
        ctx.beginPath(); ctx.ellipse(cx, cy - 10, radius, radius * .3, -.18, 0, TAU); ctx.stroke();
        if (!config.reduced && edges.length && time % 12 < 3) {
          const [from, to] = edges[Math.floor(time / 12) % edges.length];
          packet(points[from], points[to], time % 12 / 3, .4);
        }
      } else {
        // Four brand points only, tracing the outside of the certificate mount.
        for (let i = 0; i < 4; i++) {
          const p = (time * .009 + i / 4) % 1;
          const edge = p * 4;
          const x = edge < 1 ? r.left + 6 + edge * (r.width - 12) : edge < 2 ? r.right - 6 : edge < 3 ? r.right - 6 - (edge - 2) * (r.width - 12) : r.left + 6;
          const y = edge < 1 ? r.top + 6 : edge < 2 ? r.top + 6 + (edge - 1) * (r.height - 12) : edge < 3 ? r.bottom - 6 : r.bottom - 6 - (edge - 3) * (r.height - 12);
          dot({ x, y }, 1.7, .5 * fade, brand[i]);
        }
      }
      ctx.restore();
    };
    const render = (now: number) => {
      frame = 0;
      if (disposed || paused) return;
      const delta = last ? now - last : 1000 / config.fps;
      if (!config.reduced && delta < 1000 / config.fps - 1) { frame = requestAnimationFrame(render); return; }
      if (!config.reduced) clock += Math.min(delta, 70);
      last = now;
      const started = performance.now();
      if (dirty) measure();
      ctx.clearRect(0, 0, width, height);
      const current = sectionRects.find(s => s.rect.top <= height * .45 && s.rect.bottom > height * .45)?.id || 'home';
      if (current !== activeSection) { activeSection = current; canvas.dataset.section = current; }
      pointer.strength += ((pointer.active ? 1 : 0) - pointer.strength) * .15;
      const heroVisible = !!heroRect && visible(heroRect);
      drawField(config.reduced ? 0 : clock / 1000, heroVisible);
      const active = anchors.filter(a => visible(a.rect));
      // Shared per-screen budget, including sections that overlap while scrolling.
      const localBudget = Math.floor((config.count - (heroVisible ? config.count : Math.min(12, Math.floor(config.count / 3)))) / Math.max(1, active.length));
      if (localBudget > 0) active.forEach(a => drawAnchor(a, localBudget, config.reduced ? 0 : clock / 1000));
      if (ripple && clock - ripple.start > 650) ripple = null;
      if (!config.reduced && !degraded) {
        renderCost += performance.now() - started; samples++;
        if (delta > 1000 / config.fps * 1.8 && delta < 500) slowFrames++;
        if (samples >= 90) {
          if (renderCost / samples > 7 || slowFrames > 28) { config = degradeParticleConfig(config); degraded = true; resizeCanvas(); }
          samples = 0; slowFrames = 0; renderCost = 0;
        }
      }
      if (!config.reduced) frame = requestAnimationFrame(render);
    };
    const wake = () => { if (!frame && !paused && !disposed) frame = requestAnimationFrame(render); };
    const invalidate = () => { dirty = true; wake(); };
    const resize = () => { config = degraded ? degradeParticleConfig(configForDevice()) : configForDevice(); resizeCanvas(); wake(); };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !config.pointerRadius) return;
      pointer.x = event.clientX; pointer.y = event.clientY;
      pointer.active = !!(event.target instanceof Element && event.target.closest('#home'));
    };
    const leave = () => { pointer.active = false; };
    const onRipple = (event: Event) => { if (!config.reduced) ripple = { ...(event as CustomEvent<Point>).detail, start: clock }; };
    const suspension = () => {
      const next = document.hidden || !!document.querySelector('dialog[open]');
      if (next === paused) return;
      paused = next; canvas.dataset.paused = String(paused); pointer.active = false;
      if (paused) { cancelAnimationFrame(frame); frame = 0; ctx.clearRect(0, 0, width, height); }
      else { last = 0; dirty = true; wake(); }
    };
    const mutation = new MutationObserver(suspension);
    mutation.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
    const observer = new ResizeObserver(invalidate);
    sections.forEach(s => observer.observe(s));
    anchors.forEach(a => observer.observe(a.element));
    window.addEventListener('scroll', invalidate, { passive: true }); window.addEventListener('resize', resize, { passive: true });
    document.addEventListener('pointermove', onPointer, { passive: true }); document.addEventListener('pointerleave', leave);
    window.addEventListener('blur', leave); window.addEventListener('digital-network:ripple', onRipple);
    document.addEventListener('visibilitychange', suspension); reduced.addEventListener('change', resize);
    resizeCanvas(); canvas.dataset.section = 'home'; canvas.dataset.paused = String(paused); wake();
    return () => {
      disposed = true; cancelAnimationFrame(frame); mutation.disconnect(); observer.disconnect();
      window.removeEventListener('scroll', invalidate); window.removeEventListener('resize', resize);
      document.removeEventListener('pointermove', onPointer); document.removeEventListener('pointerleave', leave);
      window.removeEventListener('blur', leave); window.removeEventListener('digital-network:ripple', onRipple);
      document.removeEventListener('visibilitychange', suspension); reduced.removeEventListener('change', resize);
    };
  }, []);
  return <><canvas ref={ref} className="global-particle-field" aria-hidden="true" /><DataPulse /></>;
}
