'use client';
import Image from 'next/image';
export default function Portrait() {
  return <div className="editorial-portrait"><Image src="/images/1.png" alt="叶森个人形象照" width={1122} height={1402} priority quality={90} sizes="(max-width: 700px) 72vw, (max-width: 1500px) 440px, 520px" draggable={false} /></div>;
}
