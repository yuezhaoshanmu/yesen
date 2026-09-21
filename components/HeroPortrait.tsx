'use client';

import Image from 'next/image';
import { useRef } from 'react';

export default function HeroPortrait() {
  const touch = useRef<{ id: number; x: number; y: number } | null>(null);
  const feedback = useRef<Animation | null>(null);

  return (
    <div className="hero-portrait-stage">
      <div className="hero-portrait-enter">
        <div
          className="hero-portrait-touch"
          onPointerDown={(event) => {
            if (event.pointerType === 'touch' && event.isPrimary) {
              touch.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
            }
          }}
          onPointerCancel={() => { touch.current = null; }}
          onPointerUp={(event) => {
            const start = touch.current;
            touch.current = null;
            if (!start || event.pointerType !== 'touch' || event.pointerId !== start.id) return;
            if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
            feedback.current?.cancel();
            feedback.current = event.currentTarget.animate(
              [{ transform: 'scale(1)' }, { transform: 'scale(0.98)' }, { transform: 'scale(1)' }],
              { duration: 200, easing: 'ease-out' },
            );
          }}
        >
          <Image
            className="hero-portrait-image"
            src="/images/1.png"
            alt="叶森个人形象照"
            width={1122}
            height={1402}
            priority
            sizes="(max-width: 600px) 280px, (max-width: 900px) 360px, (max-height: 800px) 360px, (max-width: 1500px) 420px, 480px"
            quality={85}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
}
