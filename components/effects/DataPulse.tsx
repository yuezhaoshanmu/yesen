'use client';

import { useEffect, useRef } from 'react';

export const PARTICLE_EVENT = 'digital-network:event';
export type DataEvent = { type: 'message'; id: string } | { type: 'presence' };
export function emitDataEvent(detail: DataEvent) {
  window.dispatchEvent(new CustomEvent<DataEvent>(PARTICLE_EVENT, { detail }));
}

/** Ephemeral feedback lives above card surfaces, outside text and below dialogs. */
export default function DataPulse({ pointerFeedback = true }: { pointerFeedback?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = root.current;
    if (!host) return;
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Set<Animation>();
    const pending = new Map<string, number>();
    let raf = 0;
    let down: { x: number; y: number; id: number; scroll: number } | null = null;
    const allowed = () => !reduced.matches && !document.hidden && !document.querySelector('dialog[open]');
    const animate = (className: string, x: number, y: number, frames: Keyframe[], duration: number) => {
      if (!allowed() || host.childElementCount >= 24) return;
      if ((className === 'data-event-packet' || className === 'data-edge-packet') && host.querySelectorAll('.data-event-packet, .data-edge-packet').length >= 3) return;
      const dot = document.createElement('i');
      dot.className = className;
      dot.style.left = `${x}px`; dot.style.top = `${y}px`;
      host.append(dot);
      const animation = dot.animate(frames, { duration, easing: 'cubic-bezier(.2,.65,.3,1)' });
      animations.add(animation);
      const remove = () => { dot.remove(); animations.delete(animation); };
      animation.onfinish = remove; animation.oncancel = remove;
    };
    const pulse = (x: number, y: number, count = 5, radius = 17, duration = 340) => {
      for (let i = 0; i < count; i++) {
        const a = i / count * Math.PI * 2;
        animate('data-pulse-dot', x, y, [{ opacity: .55, transform: 'translate(-50%,-50%) scale(.7)' },
          { opacity: 0, transform: `translate(${Math.cos(a) * radius}px,${Math.sin(a) * radius}px) scale(.4)` }], duration);
      }
    };
    const pointerDown = (event: PointerEvent) => {
      if (event.isPrimary) down = { x: event.clientX, y: event.clientY, id: event.pointerId, scroll: scrollY };
    };
    const pointerUp = (event: PointerEvent) => {
      const start = down; down = null;
      if (!start || event.pointerId !== start.id || Math.hypot(start.x - event.clientX, start.y - event.clientY) > 10 || Math.abs(start.scroll - scrollY) > 4 || !allowed()) return;
      const target = event.target instanceof Element ? event.target : null;
      const portrait = target?.closest('.hero-portrait-stage');
      if (portrait && event.pointerType === 'touch') {
        const r = portrait.getBoundingClientRect();
        // Dots stay on the silhouette's outer edges, never on the face.
        for (let i = 0; i < 6; i++) {
          const side = i % 2 ? 1 : -1;
          animate('data-pulse-dot', side > 0 ? r.right - 9 : r.left + 9, r.top + r.height * (.57 + Math.floor(i / 2) * .16),
            [{ opacity: .5, transform: 'translate(0,0)' }, { opacity: 0, transform: `translate(${side * 14}px,-8px)` }], 500);
        }
        return;
      }
      const cta = target?.closest('[data-particle-cta], .hero-actions a, .hero-credential, .project-card a, .overview-entry button, .other-honor-card, .archive-card');
      if (cta) {
        pulse(event.clientX, event.clientY);
        if (event.pointerType === 'touch') {
          const r = (cta.closest('.overview-entry, .project-card, .national-card') || cta).getBoundingClientRect();
          animate('data-edge-packet', r.left + 8, r.top, [{ opacity: 0, transform: 'translateX(0)' }, { opacity: .6, offset: .2 }, { opacity: 0, transform: `translateX(${Math.min(r.width - 16, 150)}px)` }], 380);
        }
      } else if (event.pointerType === 'touch' && target?.closest('#home') && !target.closest('a,button,input')) {
        animate('data-touch-ripple', event.clientX, event.clientY,
          [{ opacity: .28, transform: 'translate(-50%,-50%) scale(.2)' }, { opacity: 0, transform: 'translate(-50%,-50%) scale(1)' }], 650);
        window.dispatchEvent(new CustomEvent('digital-network:ripple', { detail: { x: event.clientX, y: event.clientY } }));
      }
    };
    const visible = (r: DOMRect) => r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
    const deliver = () => {
      raf = 0;
      if (!allowed()) { pending.clear(); return; }
      const source = document.querySelector('[data-realtime-source]')?.getBoundingClientRect();
      for (const [id, until] of pending) {
        const card = document.querySelector(`[data-message-id="${CSS.escape(id)}"]`)?.closest('.gb-message');
        if (performance.now() > until) { pending.delete(id); continue; }
        if (!card) continue; // Wait for React's commit, not an arbitrary animation delay.
        pending.delete(id);
        const to = card.getBoundingClientRect();
        if (!visible(to)) continue;
        if (source && visible(source)) {
          const x = source.right + 4, y = source.top + source.height / 2;
          animate('data-event-packet', x, y, [{ opacity: 0, transform: 'translate(0,0)' }, { opacity: .75, offset: .15 },
            { opacity: 0, transform: `translate(${to.left - x}px,${to.top + 12 - y}px)` }], 720);
        } else {
          // On a phone the status and card can be screens apart; don't fly through unrelated text.
          animate('data-edge-packet', to.left, to.top + 8, [{ opacity: .55, transform: 'translateY(0)' }, { opacity: 0, transform: 'translateY(28px)' }], 500);
        }
      }
      if (pending.size) raf = requestAnimationFrame(deliver);
    };
    const receive = (event: Event) => {
      if (!allowed()) return;
      const data = (event as CustomEvent<DataEvent>).detail;
      if (data.type === 'message') {
        if (pending.size >= 3) return;
        pending.set(data.id, performance.now() + 1000);
        if (!raf) raf = requestAnimationFrame(deliver);
      } else {
        const r = document.querySelector('[data-presence-nodes]')?.getBoundingClientRect();
        if (r && visible(r)) pulse(r.right + 3, r.top + r.height / 2, 3, 10, 380);
      }
    };
    const cancel = () => { down = null; };
    const clear = () => { animations.forEach(a => a.cancel()); pending.clear(); cancelAnimationFrame(raf); raf = 0; };
    const preference = () => { if (reduced.matches || document.hidden) clear(); };
    if (pointerFeedback) {
      document.addEventListener('pointerdown', pointerDown, { passive: true });
      document.addEventListener('pointerup', pointerUp, { passive: true });
      document.addEventListener('pointercancel', cancel, { passive: true });
    }
    document.addEventListener('visibilitychange', preference);
    reduced.addEventListener('change', preference);
    window.addEventListener(PARTICLE_EVENT, receive);
    return () => { clear(); document.removeEventListener('pointerdown', pointerDown); document.removeEventListener('pointerup', pointerUp); document.removeEventListener('pointercancel', cancel); document.removeEventListener('visibilitychange', preference); reduced.removeEventListener('change', preference); window.removeEventListener(PARTICLE_EVENT, receive); };
  }, [pointerFeedback]);
  return <div ref={root} className="data-feedback-layer" aria-hidden="true" />;
}
