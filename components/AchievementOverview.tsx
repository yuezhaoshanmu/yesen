'use client';

import { useState } from 'react';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { achievementCounts, achievementFilters, achievementLevels, achievementYears, filterAchievements, levelCounts, type Achievement, type AchievementFilter } from '@/data/achievements';
import { dateStamp, dateText } from '@/data/achievement-dates';
import { profile } from '@/data/profile';
import { EvidenceButton } from './Exhibition';

function OverviewEntry({ item }: { item: Achievement }) {
  return <li className="overview-entry" data-achievement={item.id}>
    <div className="overview-date"><time dateTime={item.date?.slice(0, 7)} title={item.awardDateText}>{dateStamp(item.date)}</time><span>{item.dateLabel}</span></div>
    <div className="overview-node" aria-hidden="true"/>
    <div className="overview-entry-copy">
      <span className="overview-entry-level">{item.levelLabel}</span>
      <h4>{item.shortTitle}</h4><p>{item.significance}</p>
      {item.contextNote && <small className="overview-context">{item.contextNote}</small>}
      <div className="overview-entry-actions"><EvidenceButton id={item.id} label={`查看${item.shortTitle}的证明`}>查看证明<ArrowUpRight size={14}/></EvidenceButton><a href={`#detail-${item.id}`} aria-label={`定位${item.shortTitle}的详细介绍`}>详细介绍<ArrowDown size={13}/></a></div>
    </div>
  </li>;
}

export default function AchievementOverview() {
  const [filter, setFilter] = useState<AchievementFilter>('all');
  const [year, setYear] = useState<number | null>(null);
  const items = filterAchievements(filter, year);
  const stats = [
    { label: '国际认可成果', value: levelCounts.international, hint: 'Google 专业认证 · CVE', tone: 'international' },
    { label: '国家级权威成果', value: levelCounts.national, hint: 'CNNVD · CNVD 技术成果', tone: 'national' },
    { label: '省级荣誉', value: levelCounts.provincial, hint: '赛事一等奖 · 三下乡', tone: 'provincial' },
    { label: '校级 / 其他成果', value: levelCounts.school + levelCounts.other, hint: `${levelCounts.school} 项校级 · ${levelCounts.other} 项课程认证`, tone: 'school' },
  ];
  return <section id="overview" className="section honors-overview section-anchor" aria-labelledby="overview-title"><div className="container">
    <div className="overview-heading"><div><div className="section-kicker"><span className="section-index">02</span><span className="eyebrow">ACHIEVEMENT OVERVIEW</span></div><h2 id="overview-title">荣誉总览<span>每一步，都有据可循。</span></h2><p>以时间为轴，记录每一次学习、实践与技术成果。</p></div><span className="overview-total"><strong>{achievementCounts.documented}</strong>项成果归档</span></div>
    <div className="overview-stats">{stats.map(stat => <div key={stat.label} className={`overview-stat stat-${stat.tone}`}><span>{stat.label}</span><strong>{stat.value}<small>项</small></strong><p>{stat.hint}</p></div>)}</div>
    <p className="overview-count-note">另含 {levelCounts['national-ranking']} 项全国实战排名 · 每个 CVE 编号独立计数</p>
    <div className="overview-tools">
      <div className="overview-filters" role="group" aria-label="筛选荣誉层级与类别">{achievementFilters.map(option => <button type="button" key={option.id} aria-pressed={filter === option.id} onClick={() => setFilter(option.id)}>{option.label}</button>)}</div>
      {achievementYears.length > 1 && <div className="overview-years" role="group" aria-label="筛选成果年份"><span>年份</span><button type="button" aria-pressed={year === null} onClick={() => setYear(null)}>全部年份</button>{achievementYears.map(value => <button type="button" key={value} aria-pressed={year === value} onClick={() => setYear(value)}>{value}</button>)}</div>}
    </div>
    <div className="overview-result-line"><p role="status" aria-live="polite">{year ? `${year}年 · ` : ''}{achievementFilters.find(option => option.id === filter)?.label} · {items.length} 项成果</p><span>按层级排列 · 同层级最新优先</span></div>
    <div className="overview-grid" key={`${filter}-${year}`}>
      {achievementLevels.map(level => {
        const group = items.filter(item => item.level === level.id);
        if (!group.length) return null;
        return <article className={`overview-group level-${level.id}`} key={level.id} aria-labelledby={`overview-${level.id}`}>
          <header className="overview-group-heading"><div><span className="overview-level-en">{level.en}</span><h3 id={`overview-${level.id}`}><strong>{level.word}</strong><span>{level.title}</span></h3><p>{level.subtitle}</p></div><span className="overview-group-count">{group.length} 项</span></header>
          {level.id === 'national-ranking' && <div className="overview-rank"><span>EDUSRC<br/>{dateText(group[0].date)}白帽榜</span><strong>{profile.edusrc.rank}<small>名</small></strong><span>全国实战排名</span></div>}
          <ol className="overview-timeline">{group.map(item => <OverviewEntry key={item.id} item={item}/>)}</ol>
        </article>;
      })}
    </div>
    {!items.length && <div className="overview-empty"><h3>该年份暂无此类成果</h3><p>可以切换年份，或返回完整荣誉总览。</p><button className="button button-dark" type="button" onClick={() => { setFilter('all'); setYear(null); }}>查看全部成果</button></div>}
    <a href="#certification" className="chapter-transition"><span>从时间与成果，走进每一份真实证明。</span><span>下一章 · Google 网络安全专业认证<ArrowDown size={15}/></span></a>
  </div></section>;
}
