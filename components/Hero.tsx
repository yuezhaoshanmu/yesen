import { ArrowDown, ArrowUpRight, BadgeCheck } from 'lucide-react';
import { profile } from '@/data/profile';
import { projects } from '@/data/projects';
import HeroPortrait from './HeroPortrait';
import './hero.css';

export default function Hero() {
  const metrics = [
    { href: '#overview', className: 'hero-metric-academic', value: profile.academic.value.toFixed(2), unit: '分', label: profile.academic.label, note: profile.academic.note },
    { href: '#certification', className: 'hero-metric-google', value: 'Google', label: '网络安全专业认证', note: '9 门课程 · 实践评估' },
    { href: '#edusrc', value: profile.edusrc.rank, unit: '名', label: 'EDUSRC 全国白帽榜', note: '2026 年 5 月 · 月度排名' },
    { href: '#national', value: '国家级', chinese: true, label: '权威网络安全成果', note: 'CNNVD / CNVD' },
    { href: '#global', value: 'CVE', label: '国际通用漏洞成果', note: '漏洞研究 · 国际编号' },
    { href: '#projects', value: projects.length, unit: '个', label: '全栈项目实践', note: '从想法到工程落地' },
  ];

  return (
    <section id="home" className="hero hero-with-portrait section-anchor">
      <div className="hero-grid" aria-hidden="true" />
      <div className="hero-inner container">
        <div className="hero-topline">
          <span><i className="status-dot" />叶森 / 数字成果展厅</span>
          <span>PERSONAL ARCHIVE / 2026</span>
        </div>
        <div className="hero-stage">
          <div className="hero-copy">
            <div className="hero-intro"><span className="thin-line" />以真实成果，回答每一次期待</div>
            <div className="name-lockup">
              <h1>叶森<span className="name-dot">.</span></h1>
              <span className="romanized">Y E S E N</span>
            </div>
            <h2>以技术回应时代，<br /><span>以实践证明能力。</span></h2>
            <p className="hero-description">从系统学习，到真实世界的网络安全实践。<br />让每一份成果，都有迹可循。</p>
            <a href="#certification" className="hero-credential">
              <BadgeCheck size={17} aria-hidden="true" />
              <span><strong>Google</strong> 网络安全专业职业认证</span>
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
            <div className="hero-actions">
              <a className="button button-dark" href="#overview">浏览荣誉总览<ArrowUpRight size={17} /></a>
              <a className="hero-secondary" href="#projects">查看项目实践<ArrowUpRight size={15} /></a>
            </div>
          </div>
          <div className="hero-metrics" aria-label="核心成果摘要">
            {metrics.map((metric) => (
              <a href={metric.href} className={`hero-metric ${metric.className || ''}`} key={metric.href}>
                <span className={`metric-number${metric.chinese ? ' metric-chinese' : ''}`}>
                  {metric.value}{metric.unit && <small>{metric.unit}</small>}
                </span>
                <span className="metric-label">{metric.label}</span>
                <span className="metric-note">{metric.note}</span>
              </a>
            ))}
          </div>
          <HeroPortrait />
        </div>
        <div className="hero-bottom">
          <span>学习有深度，成果有依据。</span>
          <a href="#overview">继续浏览成果<ArrowDown size={13} /></a>
          <span>01 — 11</span>
        </div>
      </div>
    </section>
  );
}
