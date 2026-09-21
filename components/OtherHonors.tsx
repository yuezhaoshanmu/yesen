import AchievementDate from './AchievementDate';
import { achievementById } from '@/data/achievements';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { evidenceById } from '@/data/evidence';
import { profile } from '@/data/profile';
import { EvidenceButton } from './Exhibition';
import SectionHeading from './SectionHeading';
import HonorGallery from './HonorGallery';

const honors = ['challenge-care', 'challenge-security', 'social', 'training', 'pku'];

export default function OtherHonors() {
  return <section id="archive" className="section other-honors section-anchor"><div className="container">
    <SectionHeading index="08" eyebrow="LEARNING, SERVICE & GROWTH" title={<>其他荣誉，<span className="subtle">也是成长的侧面。</span></>} description="竞赛、社会实践与课程学习，共同记录技术之外的综合素质。"/>
    <div className="other-honors-grid">{honors.map(id=>{const item=evidenceById[id];return <EvidenceButton key={id} id={id} className="other-honor-card"><div className="other-honor-image"><Image src={item.thumbnail} width={item.width} height={item.height} alt={item.title+'证明缩略图'} sizes="(max-width: 650px) 88vw, (max-width: 1000px) 42vw, 28vw"/></div><div id={`detail-${id}`} className="other-honor-copy achievement-detail"><span className="eyebrow">{achievementById[id].levelLabel}</span><AchievementDate id={id}/><h3>{id==='pku'?'北京大学 · 操作系统与虚拟化安全':item.title}</h3><p className="achievement-significance">{achievementById[id].significance}</p>{achievementById[id].contextNote && <small className="achievement-context">{achievementById[id].contextNote}</small>}<p>{id==='social'?'校方报道存档':id==='pku'?'在线课程认证':'原始证明归档'}<ArrowUpRight size={17}/></p></div></EvidenceButton>;})}</div>
    <div className="growth-notes"><p><strong>{profile.academic.value}</strong><span>学年加权平均分<small>{profile.academic.note}</small></span></p><p><strong>{profile.volunteer.value}<small>h</small></strong><span>志愿服务时长<small>{profile.volunteer.note}</small></span></p></div>
    <details className="all-evidence"><summary><span>全部成果证明档案<small>核心成果与其他材料 · 可分类、搜索、放大查看</small></span><ArrowDown size={19}/></summary><HonorGallery/></details>
  </div></section>;
}
