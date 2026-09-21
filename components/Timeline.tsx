import { ArrowUpRight } from 'lucide-react';
import { journey } from '@/data/achievements';
import { EvidenceButton } from './Exhibition';
import SectionHeading from './SectionHeading';

export default function Timeline(){return <section id="journey" className="section container journey-section section-anchor"><div className="journey-heading"><SectionHeading index="11" eyebrow="THE JOURNEY" title={<>每一步，<br/><span className="subtle">都留下了凭证。</span></>}/><p>学习、发现、创造。<br/>让时间，连起真实的成长。</p></div><ol className="timeline">{journey.map(item=><li key={item.date} data-reveal><time className="mono">{item.date}</time><span className="timeline-node"/><div><h3>{item.title}</h3><p>{item.description}</p></div><EvidenceButton id={item.evidenceId} className="icon-button" label={'查看'+item.date+'的成长证明'}><ArrowUpRight size={18}/></EvidenceButton></li>)}</ol></section>;}
