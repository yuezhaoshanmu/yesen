'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { evidenceIndex, evidenceVerifiedDate, type EvidenceItem } from '@/data/evidence-index';

const filters = ['全部', 'CNVD', 'CNNVD', 'CVE', 'EDUSRC', '高校评审', '科研成果', '国奖案例'] as const;
const benchmarkIds = ['hit-professional', 'hit-academic', 'bit-assessment'];

function VerifyLink({ item }: { item: EvidenceItem }) {
  const [copied, setCopied] = useState(false);
  if (!item.officialUrl) return <span className="evidence-pending">待官方原页核验</span>;
  const copy = async () => { try { await navigator.clipboard.writeText(item.officialUrl!); } catch { /* optional */ } setCopied(true); window.setTimeout(() => setCopied(false), 1000); };
  return <div className="evidence-actions"><a className="evidence-verify" href={item.officialUrl} target="_blank" rel="noopener noreferrer" aria-label={`访问${item.institution}官方来源`}>官方核验 <ArrowUpRight size={14} /></a><small className="evidence-domain">{item.officialDomain}</small><button className="evidence-copy" type="button" onClick={copy} aria-label="复制官方链接">{copied ? <Check size={13} /> : <Copy size={13} />}</button></div>;
}

function Benchmark({ item }: { item: EvidenceItem }) {
  const b = item.benchmark;
  if (!b) return <span className="benchmark-empty">—</span>;
  const target = [b.targetAchievement, b.targetLevel].filter(Boolean).join(' ');
  return <div className="evidence-benchmark"><div className="benchmark-side benchmark-source-side"><strong>{b.sourceAchievement}</strong><b>{b.sourceLevel || (b.sourceScore != null ? `${b.sourceScore}分` : '')}</b>{b.sourceScore != null && b.sourceLevel && <small>{b.sourceScore}分 / 项</small>}</div><span className="benchmark-relation" aria-hidden="true">{b.relation === 'same-base-score' ? '=' : '≈'}</span><div className="benchmark-side benchmark-target-side"><strong>{target}</strong>{b.targetScore != null && <b>{b.targetScore}分</b>}</div><small className="benchmark-relation-text">{b.relationText}</small></div>;
}

function EvidenceRow({ item }: { item: EvidenceItem }) {
  return <article className="evidence-ledger-row" id={`evidence-${item.id}`}><div className="evidence-ledger-no">{String(evidenceIndex.indexOf(item) + 1).padStart(2, '0')}</div><div className="evidence-ledger-source"><strong>{item.institution}</strong><span>{item.source}</span></div><div className="evidence-ledger-content"><b>{item.title}</b><span className="evidence-category-label">{item.category === 'assessment' ? (item.id === 'bit-assessment' ? '综合测评 / 奖学金评定 · COMPREHENSIVE ASSESSMENT' : '国家奖学金评审 · NATIONAL SCHOLARSHIP') : ''}</span><p>{item.evidence}</p><small>{item.recognition}</small>{item.priority && <em className="direct-benchmark">DIRECT BENCHMARK <span>直接对照</span></em>}</div><div className="evidence-ledger-benchmark"><Benchmark item={item} /></div><VerifyLink item={item} /></article>;
}

export default function EvidenceIndex() {
  const [filter, setFilter] = useState<(typeof filters)[number]>('全部');
  const [visible, setVisible] = useState(false);
  const filtered = useMemo(() => evidenceIndex.filter(item => item.enabled && item.verified && (filter === '全部' || item.tags?.includes(filter) || (filter === '科研成果' && item.category === 'research-output'))), [filter]);
  const benchmarks = benchmarkIds.map(id => evidenceIndex.find(item => item.id === id)).filter((item): item is EvidenceItem => Boolean(item));
  useEffect(() => { const section = document.getElementById('authority-evidence'); if (!section) return; const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { threshold: 0.08 }); observer.observe(section); return () => observer.disconnect(); }, []);
  return <section id="authority-evidence" className={`evidence-index museum-scene${visible ? ' is-visible' : ''}`} aria-labelledby="evidence-index-title"><div className="container evidence-index-container">
    <div className="evidence-breath" aria-hidden="true"><i /><span>SECTION INDEX / 01</span><i /></div>
    <header className="evidence-index-header"><div className="evidence-heading-copy"><span className="evidence-eyebrow">EVIDENCE INDEX <i /> PUBLIC · VERIFIABLE · AUTHORITATIVE</span><h2 id="evidence-index-title">权威证据索引</h2><p>公开制度 · 高校案例 · 官方平台 · 在线核验</p><p className="evidence-lede">以下资料来自高校官网与公开制度文件。评审对照只表示对应高校、培养类型与年度文件中的具体评价口径。</p></div><div className="evidence-meta"><strong>{evidenceIndex.filter(item => item.enabled && item.verified).length}</strong><span>项已核验公开来源</span><span>核验日期：{evidenceVerifiedDate.replaceAll('-', '.')}</span></div></header>
    <section className="academic-benchmark" aria-labelledby="academic-benchmark-title"><div className="academic-benchmark-heading"><div><span className="evidence-part-label">ACADEMIC BENCHMARK</span><h3 id="academic-benchmark-title">高校评审对照速览</h3></div><p>成果等级直接可比较证据。每条关系均限定在具体高校、培养类型、评审文件与年度内。</p></div><div className="academic-benchmark-list">{benchmarks.map((item, index) => { const b = item.benchmark!; const school = item.institution.split(' · '); const track = index === 0 ? '专业型硕士 · 国家奖学金' : index === 1 ? '学术型硕士 · 国家奖学金' : '网络空间安全学院 · 综合测评'; return <article className="academic-benchmark-row" key={item.id}><div className="academic-benchmark-index">{String(index + 1).padStart(2, '0')}<i /></div><div className="academic-benchmark-source"><strong>{(item.institutionEn || school[0]).toUpperCase()}</strong><span>{school[1] || item.institution}</span><em>{track}</em><small>{item.title}</small></div><div className="academic-benchmark-focus"><span>高危 CNVD</span><b>{b.sourceLevel || ''}</b>{b.sourceScore != null && <strong>{b.sourceScore}<small>分{index < 2 ? ' / 项' : ''}</small></strong>}</div><div className="academic-benchmark-target"><span>{b.targetAchievement}</span><b>{b.targetLevel || ''}{b.targetScore != null ? ` · ${b.targetScore}分` : ''}</b><small>{b.relationText}</small></div><VerifyLink item={item} /></article>; })}</div></section>
    <section className="evidence-part evidence-part-ledger"><div className="evidence-part-label">FULL INDEX / 02</div><div><h3>完整权威证据索引</h3><p>制度与认定 · 评审对照 · 官方核验</p></div><div className="evidence-toolbar"><div className="evidence-filters" role="group" aria-label="证据来源筛选">{filters.map(name => <button type="button" aria-pressed={filter === name} className={filter === name ? 'is-active' : ''} key={name} onClick={() => setFilter(name)}>{name}</button>)}</div></div><div className="evidence-ledger-head"><span>NO.</span><span>SOURCE <small>高校 / 来源</small></span><span>EVIDENCE <small>制度及认定</small></span><span>BENCHMARK <small>评审对照</small></span><span>VERIFY <small>官方核验</small></span></div><div className="evidence-ledger">{filtered.map(item => <EvidenceRow item={item} key={item.id} />)}</div></section>
    <p className="evidence-disclaimer">以上“同档”“同基础分值”关系，均依据对应高校公开评审制度整理。不同高校、培养类型及年度的评价规则存在差异，相关关系仅表示该具体制度中的评价口径，不代表 CNVD 在全国范围内统一等同于某一竞赛奖项。</p>
  </div></section>;
}

