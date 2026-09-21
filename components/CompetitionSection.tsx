import AchievementDate from './AchievementDate';
import { achievementById } from '@/data/achievements';
import Image from 'next/image';
import { ArrowUpRight, Award } from 'lucide-react';
import { evidenceById } from '@/data/evidence';
import { EvidenceButton } from './Exhibition';
import SectionHeading from './SectionHeading';

export default function CompetitionSection(){return <section id="competitions" className="section container section-anchor"><SectionHeading index="07" eyebrow="COMPETITIONS & INNOVATION" title={<>把技术带上赛场，<br/><span className="subtle">让协作产生答案。</span></>}/><div className="competition-feature panel" data-reveal><div id="detail-raicom" className="competition-copy achievement-detail"><span className="eyebrow warm">省级赛事 · 江西赛区一等奖</span><div className="prize-title"><Award size={52} strokeWidth={1}/><h3>一等奖<span>江西赛区</span></h3></div><h4>2026 睿抗机器人开发者大赛</h4><p>RAICOM · AI 视觉应用竞赛项目</p><AchievementDate id="raicom"/><p className="achievement-significance">{achievementById.raicom.significance}</p><div className="competition-issuer">颁发机构<span>工业和信息化部人才交流中心</span></div><EvidenceButton id="raicom" className="text-button">查看获奖证书<ArrowUpRight size={17}/></EvidenceButton></div><EvidenceButton id="raicom" className="competition-certificate" label="查看睿抗机器人开发者大赛一等奖证书"><Image src={evidenceById.raicom.preview} width={809} height={567} alt="2026 睿抗江西赛区 AI 视觉应用一等奖获奖证书" sizes="(max-width: 800px) 90vw, 45vw"/></EvidenceButton></div></section>;}
