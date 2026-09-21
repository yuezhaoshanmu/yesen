import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { evidenceById } from '@/data/evidence';
import { EvidenceButton } from './Exhibition';
import { profile } from '@/data/profile';
import SectionHeading from './SectionHeading';
import { Counter } from './MotionSystem';

export default function EduSrcSection(){return <section id="edusrc" className="section edusrc-section section-anchor"><div className="container edusrc-layout"><div><SectionHeading index="06" eyebrow="REAL-WORLD SECURITY PRACTICE" title={<>在真实环境中，<br/><span className="subtle">检验所学。</span></>}/><div className="ranking-number"><span>#</span><Counter value={profile.edusrc.rank}/><div><strong>EDUSRC</strong><span>全国月度白帽榜</span></div></div><p className="edusrc-description">教育漏洞报告平台，将安全研究连接到真实的教育信息系统。一次发现、一份报告，都是课堂之外的实践。</p><div className="ranking-period"><span className="status-dot"/>2026 年 5 月榜单 · 昵称「叶森」</div></div><div className="ranking-proof" data-reveal><div className="card-topline"><span className="micro">A PLACE EARNED THROUGH PRACTICE</span><span className="tag">原始排名截图</span></div><EvidenceButton id="edusrc" className="ranking-image" label="查看 EDUSRC 2026 年 5 月全国白帽榜第 24 名截图"><Image src={evidenceById.edusrc.preview} width={900} height={496} alt="EDUSRC 2026 年 5 月白帽榜：第 24 名，叶森" sizes="(max-width: 800px) 90vw, 48vw"/></EvidenceButton><div className="ranking-row"><span className="mono">24</span><span>叶森</span><span>正式白帽子</span><strong>100 <small>Rank</small></strong></div><div className="ranking-footer"><span>以当月存档截图为准</span><EvidenceButton id="edusrc" className="text-button">打开完整截图<ArrowUpRight size={16}/></EvidenceButton></div></div></div></section>;}
