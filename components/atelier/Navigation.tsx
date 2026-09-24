'use client';
import { useEffect, useRef, useState } from 'react';
import { achievements } from '@/data/achievements';
import { ArrowUpRight, Menu, X } from 'lucide-react';
const primary = [['home', '首页'], ['overview', '成果'], ['national', '网络安全'], ['projects', '项目'], ['guestbook', '留言']];
const all = [...primary, ['certification', 'Google 认证'], ['edusrc', 'EDUSRC 排名'], ['global', 'CVE 国际成果'], ['authority-evidence', '权威证据索引'], ['competitions', '竞赛荣誉'], ['archive', '全部档案'], ['academic', '学业成绩'], ['fullstack', '全栈系统']];
export default function Navigation() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  const menu = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id); }), { rootMargin: '-15% 0px -65% 0px' });
    document.querySelectorAll('main > section').forEach(el => observer.observe(el));
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); menu.current?.focus(); } };
    document.addEventListener('keydown', escape);
    return () => { observer.disconnect(); document.removeEventListener('keydown', escape); };
  }, []);
  return <header className="museum-nav"><nav className="container" aria-label="主导航"><a className="museum-brand" href="#home" onClick={() => setOpen(false)} aria-label="叶森，返回首页">YESEN<span aria-hidden="true">＋</span></a><div className="museum-nav-primary">{primary.map(([id, name]) => <a href={`#${id}`} key={id} aria-current={id === active ? 'location' : undefined}>{name}{id === 'overview' && <sup className="nav-count">{achievements.length}</sup>}</a>)}</div><div className="museum-nav-right"><a href="#guestbook">建立连接<ArrowUpRight size={16} /></a><button ref={menu} type="button" aria-label={open ? '关闭导航' : '打开导航'} aria-controls="museum-menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={21} /> : <Menu size={21} />}</button></div></nav><div id="museum-menu" className="museum-menu" hidden={!open}><div className="container"><span className="label-mono">EXHIBITION DIRECTORY / 目录</span><div>{all.map(([id, name], i) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}><span>{String(i + 1).padStart(2, '0')}</span>{name}<ArrowUpRight size={22} /></a>)}</div></div></div></header>;
}
