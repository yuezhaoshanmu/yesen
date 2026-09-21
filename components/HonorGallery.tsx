'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Search } from 'lucide-react';
import { evidence, archiveCategories } from '@/data/evidence';
import { EvidenceButton } from './Exhibition';
import SectionHeading from './SectionHeading';

export default function HonorGallery(){
 const [category,setCategory]=useState<string>('全部');const [query,setQuery]=useState('');
 const filtered=evidence.filter(e=>(category==='全部'||e.category===category)&&`${e.title} ${e.identifier||''} ${e.issuer}`.toLowerCase().includes(query.trim().toLowerCase()));
 return <section id="archive" className="section container archive-section section-anchor"><div className="archive-heading"><SectionHeading index="10" eyebrow="PROOF OF WORK / HONOR ARCHIVE" title={<>荣誉，<span className="subtle">不止于文字。</span></>} description="证书、原始截图、官方记录。每一份成果，都有迹可循。"/><div className="archive-total"><strong>{evidence.filter(i=>i.status==='documented').length}</strong><span>份成果证明归档<br/>另有 1 份待补充记录</span></div></div><div className="archive-tools"><div className="archive-filters" role="group" aria-label="筛选证明类别">{archiveCategories.map(c=><button key={c} aria-pressed={category===c} className={category===c?'selected':''} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="archive-search"><Search size={15}/><input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索成果 / 编号" aria-label="搜索成果名称、机构或编号"/></label></div><p className="sr-only" role="status">找到 {filtered.length} 份材料</p><div className="archive-grid">{filtered.map((item,i)=><EvidenceButton id={item.id} key={item.id} className="archive-card"><div className={`archive-image ${item.height>item.width?'vertical':''}`}><Image src={item.thumbnail} width={item.width} height={item.height} alt={item.title+'证明缩略图'} sizes="(max-width: 600px) 90vw, (max-width: 1000px) 45vw, 25vw"/><span className="archive-open"><ArrowUpRight size={19}/></span></div><div className="archive-card-meta"><span className="micro">{item.category}<span>{String(i+1).padStart(2,'0')}</span></span><h3>{item.title}</h3><span className="archive-card-date">{item.date}<span>{item.status==='pending'?'待补充证书':item.verificationUrl?'附官方验证入口':'原始证明'}</span></span></div></EvidenceButton>)}</div>{filtered.length===0&&<div className="archive-empty"><Search size={24}/><h3>未找到匹配的成果</h3><p>试试“CNVD”“Google”或其他编号。</p><button className="text-button" onClick={()=>{setCategory('全部');setQuery('');}}>清除筛选<ArrowUpRight size={15}/></button></div>}</section>;
}
