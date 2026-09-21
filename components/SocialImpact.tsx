import { ArrowUpRight, HeartHandshake } from 'lucide-react';
import { EvidenceButton } from './Exhibition';
import { Counter } from './MotionSystem';
import { profile } from '@/data/profile';
import SectionHeading from './SectionHeading';

export default function SocialImpact(){return <section id="social" className="section social-section section-anchor"><div className="container"><SectionHeading index="09" eyebrow="BEYOND TECHNOLOGY" title={<>技术定义能力，<br/><span className="warm">责任定义成长。</span></>}/><div className="social-grid"><div className="volunteer-card panel" data-reveal><HeartHandshake size={25} strokeWidth={1.4}/><div className="volunteer-number"><Counter value={profile.volunteer.value}/><span>HOURS</span></div><h3>志愿服务时长</h3><p>走向人群，把时间给予需要的地方。</p><span className="disclosure">本人提供</span></div><div className="social-awards"><EvidenceButton id="social" className="social-award"><span className="micro">SOCIAL RESPONSIBILITY / 2025</span><h3>江西省“三下乡”<br/>社会实践优秀个人</h3><p>“青禾”社会实践服务队 · 叶森<br/>江西科技职业学院官方微信报道</p><span className="text-button">查看校方报道<ArrowUpRight size={17}/></span></EvidenceButton><EvidenceButton id="training" className="social-award compact"><div><span className="micro">2025 · 第一期</span><h3>入党积极分子培训班优秀学员</h3></div><ArrowUpRight size={19}/></EvidenceButton></div></div></div></section>;}
