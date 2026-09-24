import Image from 'next/image';
import { ArrowDown, ArrowUpRight, Plus } from 'lucide-react';
import { EvidenceButton } from '../Exhibition';
import HonorGallery from '../HonorGallery';
import { evidenceById } from '@/data/evidence';
import { achievementById, cveAchievements, nationalAchievements, achievements, achievementGroups } from '@/data/achievements';
import { projects } from '@/data/projects';
import { googleCourses } from '@/data/google-certification';
import { profile } from '@/data/profile';
import DigitalField from './DigitalField';
import Portrait from './Portrait';
import StackFlow from './StackFlow';
import HeroNetwork from './HeroNetwork';

export function SceneLabel({ index, children, note }: { index: string; children: React.ReactNode; note?: string }) {
  return <div className="scene-label"><span><b>{index}</b>{children}</span>{note && <span className="scene-label-note">{note}</span>}</div>;
}

function Proof({ id, className = '', label }: { id: string; className?: string; label?: string }) {
  const item = evidenceById[id];
  return <EvidenceButton id={id} className={`museum-proof ${className}`} label={label || `查看${item.title}高清证明`}><Image src={item.preview} alt={item.title} width={item.width} height={item.height} sizes="(max-width: 700px) 94vw, (max-width: 1300px) 58vw, 850px" /><span className="proof-zoom"><Plus size={20} />查看原件</span></EvidenceButton>;
}

function DateMark({ id }: { id: string }) {
  const a = achievementById[id];
  return <time className="date-mark" dateTime={a.date || undefined}><span>{a.year || '—'}</span><i /><strong>{a.month ? String(a.month).padStart(2, '0') : '全年'}</strong></time>;
}

export function HeroScene() {
  return <section id="hero" className="museum-hero museum-scene" data-scene="core" aria-labelledby="hero-name">
    <span id="home" className="hero-home-anchor" aria-hidden="true" />
    <div className="hero-registration container"><span><i className="live-dot" /> 叶森的数字成果展</span><span>CYBERSECURITY × FULL STACK</span><span>PORTFOLIO / 2026</span></div>
    <div className="hero-boot-grid" aria-hidden="true" /><div className="editorial-stage container">
      <HeroNetwork />
      <h1 id="hero-name" className="editorial-name"><span className="name-ye">叶</span><span className="name-sen">森<i>.</i></span></h1>
      <span className="hero-roman" aria-hidden="true">Y E S E N</span>
      <div className="hero-person"><Portrait /></div>
      <div className="hero-manifesto"><span className="label-mono">RESEARCH. BUILD. VERIFY.</span><h2>以实践，<br />验证能力。</h2><p>从网络安全研究，到完整产品。<br />让技术，成为看得见的成果。</p><a href="#overview" className="museum-cta hero-explore"><span>探索成果</span><ArrowUpRight size={21} /><svg className="cta-draw" viewBox="0 0 210 54" preserveAspectRatio="none" aria-hidden="true"><rect x="1" y="1" width="208" height="52" pathLength="100" /></svg></a></div>
      <div className="hero-credentials"><span className="core-status"><i /> SYSTEM READY</span><a href="#academic"><strong>{profile.academic.value}</strong><span>学年加权均分 · 本人提供</span></a><a href="#edusrc"><strong>EDUSRC #{profile.edusrc.rank}</strong><span>2026.05 全国白帽榜</span></a><a href="#national"><strong>CNVD / CNNVD</strong><span>国家平台 · 原创研究</span></a><a href="#global"><strong>CVE</strong><span>{cveAchievements.length} 项国际通用漏洞成果</span></a></div>
      <div className="hero-floor" aria-hidden="true" />
    </div>
    <div className="hero-colophon container"><a href="#overview"><ArrowDown size={17} />向下探索</a><span>网络安全研究者 · 全栈开发者</span><span className="label-mono">{achievements.length} RECORDS / VERIFIED EVIDENCE</span></div>
  </section>;
}

export function HonorIndex() {
  return <section id="overview" className="honor-index museum-scene" data-scene="index" data-achievement-total={achievements.length}><div className="honor-stage"><div className="container">
    <div className="hero-index-line" aria-hidden="true"><i /><span>ACHIEVEMENT INDEX</span></div>
    <SceneLabel index="02" note={`${achievements.length} 项已归档成果`}>DIGITAL HONOR INDEX</SceneLabel>
    <div className="index-intro"><h2>每一份成果，<br /><em>都有迹可循。</em></h2><p>时间是刻度，实践是路径。<br />从系统学习，走向真实世界。</p></div>
    <nav className="index-pagination" aria-label="档案分类">{achievementGroups.map(g => <a key={g.id} href={`#honor-${g.id}`}><span>{String(g.items.length).padStart(2, '0')}</span>{g.word}</a>)}</nav>
    <div className="honor-ledger">{achievementGroups.map((group, index) => <div className="honor-level" id={`honor-${group.id}`} key={group.id} data-honor-level={group.id}>
      <div className="level-title"><span className="label-mono">0{index + 1} / {group.en}</span><h3>{group.word}</h3><p>{group.subtitle}</p><span className="level-count">{String(group.items.length).padStart(2, '0')} <small>项独立成果</small></span></div>
      <div className="level-records">{group.items.map(a => <article className="index-record" key={a.id} data-achievement={a.id}>
        <DateMark id={a.id} /><div className="index-record-copy"><small>{a.levelLabel}</small><a href={`#detail-${a.id}`}><strong>{a.shortTitle}</strong></a><span>{a.dateLabel} · {a.awardDateText}</span>{a.level === 'school' && <p>{a.description}</p>}</div>
        <div className="index-record-actions"><a href={`#detail-${a.id}`} aria-label={`查看${a.shortTitle}详情`}><ArrowUpRight size={23} /></a><EvidenceButton id={a.id} label={`查看${a.shortTitle}原件`}>查看原件</EvidenceButton></div>
      </article>)}</div>
    </div>)}</div>
    <div className="index-footnote"><span>分类依据原始材料；认证、技术成果与竞赛奖项分别说明。</span><a href="#archive">完整证明档案<ArrowUpRight size={17} /></a></div>
  </div></div></section>;
}

export function GoogleScene() {
  return <section id="certification" className="google-museum museum-scene" data-scene="paper"><div className="container">
    <SceneLabel index="03" note="THE FOUNDATION">从系统学习开始</SceneLabel>
    <div className="object-composition" id="detail-google"><div className="object-copy"><span className="label-mono">GOOGLE CAREER CERTIFICATES</span><h2 id="google-title">Google<span>网络安全<br />专业职业认证</span></h2><p>九门课程，一套完整的安全知识体系。<br />让每一次实践，都有扎实的起点。</p><div className="object-date"><DateMark id="google" /><span>认证完成<br /><strong>2026 年 4 月 8 日</strong></span></div><a className="text-link" href={evidenceById.google.verificationUrl} target="_blank" rel="noopener noreferrer">官方验证<ArrowUpRight size={18} /></a></div>
      <div className="google-object"><span className="object-caption label-mono">OBJECT 001 / PROFESSIONAL CERTIFICATE</span><Proof id="google" className="paper-enter" label="打开 Google 网络安全专业认证高清证书" /><div className="object-caption"><span>知识的分量，有据可查。</span><span className="label-mono">GOOGLE × COURSERA</span></div></div></div>
    <details className="museum-curriculum"><summary><span>探索九门课程</span><span className="label-mono">LINUX / PYTHON / SQL / SIEM <Plus size={18} /></span></summary><ol>{googleCourses.map(c => <li key={c.en}><strong>{c.zh}</strong><span>{c.en}</span></li>)}</ol></details>
  </div></section>;
}

export function EduScene() {
  return <section id="edusrc" className="edu-museum museum-scene" data-scene="aggregation"><div className="edu-network" aria-hidden="true"><DigitalField mode="aggregation" /></div><div className="container">
    <SceneLabel index="04" note="REAL-WORLD SECURITY PRACTICE">EDUSRC / 教育漏洞报告平台</SceneLabel>
    <div className="edu-composition" id="detail-edusrc"><div className="rank-composition"><span className="label-mono">NATIONAL MONTHLY RANKING</span><h2 className="rank-giant"><small>#</small>24<span className="sr-only">名</span></h2><h3>全国月度白帽榜</h3><p>真实研究，在全国同台验证。</p><div className="rank-period"><DateMark id="edusrc" /><span>2026 年 5 月<br />昵称「叶森」</span></div></div><div className="evidence-display"><div className="screen-top"><span className="live-dot" /><span>EDUSRC / MAY 2026</span><span>ARCHIVED</span></div><div className="ranking-object"><Proof id="edusrc" className="ranking-screen" label="查看 EDUSRC 2026 年 5 月全国白帽榜第 24 名截图" /><i className="ranking-scan" aria-hidden="true" /></div><div className="evidence-strip"><strong>24 <span>叶森</span></strong><span>正式白帽子</span><span className="label-mono">VERIFIED RECORD</span></div><p className="proof-note">以 2026 年 5 月原始榜单为准，不代表实时或全年排名。</p></div></div>
  </div></section>;
}

export function NationalScene() {
  return <section id="national" className="national-museum museum-scene" data-scene="national"><div className="container"><SceneLabel index="05" note="NATIONAL SECURITY CONTRIBUTIONS">专业研究，权威证明</SceneLabel>
    <div className="national-composition"><div className="national-copy"><h2>国家</h2><h3>CNNVD / CNVD</h3><p>让安全研究，<br />经得起专业检验。</p><span className="label-mono">ORIGINAL CONTRIBUTIONS<br />2026 / EVIDENCE COLLECTION</span></div><div className="collector-display"><div className="collector-topology" aria-hidden="true"><DigitalField mode="topology" /></div><Proof id="cnvd-20319" className="collector-back" /><Proof id="cnnvd-18260050" className="collector-front" /><span className="collector-caption label-mono">SELECT AN OBJECT TO EXAMINE ↗</span></div></div>
    <div className="national-chronology"><div className="chronology-year"><span className="label-mono">RESEARCH ARCHIVE</span><strong>2026</strong><i /><span className="chronology-month" aria-hidden="true">09</span><small>原始证明时间</small></div><div className="national-register"><div className="national-stack-stage">{[...nationalAchievements].sort((a, b) => (b.date || '').localeCompare(a.date || '')).map(a => <div key={a.id} id={`detail-${a.id}`} className="national-record" data-authority={a.platform} data-month={String(a.month).padStart(2, '0')}><DateMark id={a.id} /><span><strong>{a.platform}</strong><span>{a.evidence.title}</span><small>{a.evidence.identifier} · {a.evidence.note}</small><small>{a.dateLabel} · {a.awardDateText}</small></span><EvidenceButton id={a.id} className="text-link" label={`查看${a.platform} ${a.evidence.identifier}证明`}>查看证明<ArrowUpRight size={18} /></EvidenceButton></div>)}</div></div></div><p className="proof-note">CNNVD 展示为高危漏洞提交证明；CNVD 展示为原创漏洞证明。具体编号与时间以原件为准。</p>
  </div></section>;
}

function TechnicalGauge() {
  return <div className="technical-gauge" aria-label="最高 CVSS 4.0 评分 8.7，高危"><svg viewBox="0 0 240 200" aria-hidden="true"><path className="gauge-track" d="M 35 160 A 100 100 0 1 1 205 160" /><path className="gauge-value" d="M 35 160 A 100 100 0 1 1 205 160" pathLength="100" strokeDasharray="87 100" /><path className="gauge-ticks" d="M 49 150 A 83 83 0 1 1 191 150" /></svg><strong>8.7</strong><span>CVSS 4.0 / HIGH</span><small>最高记录评分</small></div>;
}

export function GlobalScene() {
  return <section id="global" className="global-museum museum-scene" data-scene="globe"><div className="container"><SceneLabel index="06" note="GLOBAL SECURITY NETWORK">国际通用漏洞编号成果</SceneLabel><div className="global-composition"><div className="global-copy"><h2>国际</h2><h3>漏洞有编号。<br />研究无边界。</h3><p>CVE 让每一项安全发现，<br />进入全球通用的漏洞语言。</p></div><div className="global-sphere"><DigitalField mode="globe" /><span className="sphere-lat label-mono">CVE / CONNECTED RESEARCH</span><TechnicalGauge /></div></div>
    <div className="dossier-heading"><h3>安全研究档案</h3><span className="label-mono">SECURITY DOSSIER / {String(cveAchievements.length).padStart(2, '0')} RECORDS</span></div><div className="security-dossiers">{cveAchievements.map((a, i) => <article className="security-dossier" data-severity={a.score >= 8 ? "high" : "medium"} key={a.id} id={`detail-${a.id}`}><span className="dossier-number">0{i + 1} / RESEARCH RECORD</span><h3>{a.number}</h3><p>{a.title}</p><dl><div><dt>CVSS 4.0</dt><dd className="dossier-score"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" /><circle className="dossier-arc" cx="22" cy="22" r="19" pathLength="100" strokeDasharray={`${a.score * 10} 100`} /></svg>{a.score.toFixed(1)}</dd></div><div><dt>SEVERITY</dt><dd>{a.severity}</dd></div><div><dt>PUBLISHED</dt><dd><time dateTime={a.date || undefined}>{a.date?.replaceAll('-', '.')}</time></dd></div><div><dt>REPORTER</dt><dd>{a.reporter}</dd></div></dl><div className="dossier-links"><EvidenceButton id={a.id} className="text-link" label={`查看 ${a.number} 证明`}>原始记录<ArrowUpRight size={17} /></EvidenceButton><a href={a.evidence.verificationUrl} target="_blank" rel="noopener noreferrer">CVE.org ↗</a></div></article>)}</div><p className="proof-note">评分统一采用 CVSS 4.0。官方报告人署名为 Missa；个人归属来自本人提供的成果汇总。</p>
  </div></section>;
}

export function AwardScene() {
  return <section id="competitions" className="award-museum museum-scene" data-scene="award"><div className="container"><SceneLabel index="07" note="THE AWARD MOMENT">2026 睿抗机器人开发者大赛</SceneLabel><div className="award-rule" aria-hidden="true" /><div className="award-composition" id="detail-raicom"><div><span className="label-mono">RAICOM / JIANGXI</span><h2>一等奖<i>¹</i></h2><h3>让技术，走上赛场。</h3><p>江西赛区 · AI 视觉应用竞赛项目</p><div className="award-caption"><DateMark id="raicom" /><span>工业和信息化部人才交流中心<br /><strong>2026 年 7 月 28 日</strong></span></div><small className="proof-note">¹ 省级赛事 · 江西赛区一等奖</small></div><div className="award-object"><Proof id="raicom" label="查看睿抗机器人开发者大赛一等奖证书" /></div></div></div></section>;
}

export function ArchiveScene() {
  const ids = achievements.filter(a => a.detailId === 'archive' && a.category !== 'social-practice').map(a => a.id);
  return <section id="archive" className="archive-museum museum-scene" data-scene="archive"><div className="container"><SceneLabel index="08" note="HUMAN DIMENSION">成长的其他侧面</SceneLabel><div className="archive-intro"><h2>技术之外，<br />同样认真。</h2><p>竞赛、学习与社会实践。<br />不喧哗，也值得被记录。</p></div><div className="editorial-archive"><div className="human-editor-note"><span className="label-mono">HUMAN DIMENSION / 01</span><h3>能力之外，<br />是选择与担当。</h3><p>把所学带进团队，<br />把认真留在日常。<br />每一个平凡的投入，<br />都让成长更完整。</p></div>{ids.map(id => { const a = achievementById[id]; return <article key={id} id={`detail-${id}`}><Proof id={id} /><div className="archive-meta"><span>{a.awardDateText}</span><span>{a.levelLabel}</span></div><h3>{a.shortTitle}</h3><p>{id === 'social' ? '校方报道存档 · 获评年份为 2025 年' : id === 'pku' ? '在线课程认证，不作竞赛奖项定级' : a.significance}</p></article>; })}</div><div className="social-responsibility" id="detail-social"><div><span className="label-mono">SOCIAL RESPONSIBILITY</span><h3>把时间，交给需要的人。</h3><strong>{profile.volunteer.value}<small>h</small></strong><p>志愿服务时长 · 本人提供</p></div><div className="social-proof"><Proof id="social" /><h3>江西省“三下乡”<br />优秀个人</h3><p>2025 年省级社会实践荣誉 · 校方报道存档</p></div></div><details className="all-evidence"><summary><span>打开完整证明档案<small>分类、搜索与高清原件</small></span><Plus size={24} /></summary><HonorGallery /></details></div></section>;
}

export function AcademicScene() {
  return <section id="academic" className="academic-museum museum-scene" data-scene="academic"><div className="academic-handoff" aria-hidden="true"><i /></div><div className="container"><SceneLabel index="01" note="ACADEMIC ANCHOR">每一分，都来自认真</SceneLabel><div className="academic-composition"><div><span className="label-mono">ACADEMIC YEAR / WEIGHTED AVERAGE</span><h2>{profile.academic.value}<span>分</span></h2><p>学年加权平均分</p></div><div className="academic-courses"><strong>10<span> / 17</span></strong><p>10 门满分，17 门课程。</p><div className="academic-nodes" role="img" aria-label="10 门满分课程">{Array.from({ length: 10 }, (_, i) => <i key={i} aria-hidden="true" />)}</div><span className="label-mono">CONSISTENCY IS A PRACTICE.</span></div></div><div className="academic-foot"><span>把每一次学习，变成下一次实践的底气。</span><small>成绩与课程数据由本人提供</small></div></div></section>;
}

const projectMessages = ['让照护，更近一步。', '连接两代人的日常。', '让每一次相聚，有戏。'];
export function ProjectScenes() {
  return <><section id="fullstack" className="fullstack-museum museum-scene" data-scene="stack"><div className="container"><SceneLabel index="10" note="FROM INTERACTION TO DELIVERY">从想法，到完整产品</SceneLabel><div className="stack-title"><h2>一个人，<br /><em>连接整个系统。</em></h2><span className="stack-giant">全 栈<small>FULL STACK</small></span></div><StackFlow /></div></section>
  <section id="projects" className="project-museum museum-scene" data-scene="projects"><div className="project-stage"><div className="container"><SceneLabel index="11" note="DESIGNED & BUILT BY YESEN">三个想法，三个真实入口</SceneLabel><div className="project-stage-heading"><h2>让技术，进入日常。</h2><div className="project-pagination" aria-label="选择项目">{projects.map((p, i) => <a href={`#project-${p.id}`} key={p.id} data-project-tab={i}>0{i + 1}<span>{p.name}</span></a>)}</div></div></div><div className="case-studies">{projects.map((p, i) => <article id={`project-${p.id}`} className={`case-study case-${p.color}`} key={p.id} data-project-scene><div className="container"><div className="case-grid"><div className="case-copy"><span className="label-mono">SELECTED WORK / 0{i + 1} — 03</span><h3>{p.name}</h3><h4>{projectMessages[i]}</h4><p>{p.description}</p><div className="case-role"><span>独立全栈开发</span><span>{p.tags.join(' / ')}</span></div><a className="museum-cta" href={p.url} target="_blank" rel="noopener noreferrer">访问项目<ArrowUpRight size={21} /></a></div><div className="product-presentation"><a className="case-screen" href={p.url} target="_blank" rel="noopener noreferrer" aria-label={`访问${p.name}项目`}><div className="case-browser"><span>● ● ●</span><span>{p.domain}</span><ArrowUpRight size={16} /></div><Image src={`/projects/${p.id}-desktop.webp`} alt={`${p.name}实际网站截图`} width={1440} height={1000} sizes="(max-width: 800px) 94vw, 65vw" /><span className="case-screen-caption">实际项目页面 / 点击访问<ArrowUpRight size={20} /></span></a><div className="product-mobile"><span className="phone-speaker" aria-hidden="true" /><Image src={`/projects/${p.id}-mobile.webp`} alt={`${p.name}实际移动端页面`} width={390} height={844} sizes="(max-width: 700px) 95px, 180px" /><span className="mobile-caption">MOBILE / LIVE SITE</span></div></div></div></div></article>)}</div></div></section></>;
}

export function EndingScene() {
  return <footer id="ending" className="ending-museum museum-scene" data-scene="ending"><div className="container"><SceneLabel index="13" note="THE NEXT CHAPTER IS OPEN">持续学习，持续创造</SceneLabel><h2><span>以知识为基础，</span><span>以实践验证能力，</span><span><em>以技术创造价值。</em></span></h2><div className="ending-signature"><span>叶森<i> / YESEN</i></span><span className="label-mono">LEARN · BUILD · SECURE · CREATE</span><a href="#home">回到起点<ArrowUpRight size={22} /></a></div><div className="ending-colophon"><span>© 2026 YESEN · 数字成果展</span><span>每一份成果，都有迹可循。</span></div></div></footer>;
}
