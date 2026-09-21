import AchievementDate from './AchievementDate';
import { achievementById } from '@/data/achievements';
import Image from 'next/image';
import { ArrowDown, ArrowUpRight, BadgeCheck, ScanLine, ShieldCheck, Terminal, Code2 } from 'lucide-react';
import { evidenceById } from '@/data/evidence';
import { googleCourses } from '@/data/google-certification';
import { EvidenceButton } from './Exhibition';

const capabilities = [
  { icon: ShieldCheck, title: '网络安全基础', detail: '认识安全风险、资产、威胁与漏洞', tools: '安全基础 · 风险管理' },
  { icon: ScanLine, title: '威胁检测与响应', detail: '理解安全运营中的检测与响应流程', tools: 'SIEM · IDS · 网络安全分析' },
  { icon: Terminal, title: '系统与数据工具', detail: '使用命令行与查询工具开展基础分析', tools: 'Linux · SQL' },
  { icon: Code2, title: '安全任务自动化', detail: '通过编程练习处理基础网络安全任务', tools: 'Python' },
];

export default function GoogleCertification() {
  const item = evidenceById.google;
  return <section id="certification" className="section google-section section-anchor" aria-labelledby="google-title">
    <div className="container">
      <div className="google-section-top" data-reveal>
        <div className="section-kicker"><span className="section-index">03</span><span className="eyebrow">国际企业专业认证</span></div>
        <span className="micro">INTERNATIONAL PROFESSIONAL CERTIFICATION</span>
      </div>
      <div className="google-feature">
        <div id="detail-google" className="google-feature-copy achievement-detail" data-reveal>
          <div className="google-credential-label"><span className="google-color-dots" aria-hidden="true"><i/><i/><i/><i/></span>Google Career Certificates</div>
          <h2 id="google-title"><span className="google-display">Google</span><span className="google-chinese-title">网络安全专业职业认证</span></h2>
          <p className="google-english-title" lang="en">Google Cybersecurity Professional Certificate</p>
          <p className="google-introduction">由<strong>全球领先科技与互联网企业 Google</strong>开发，<br className="desktop-break"/>通过 Coursera 完成的系统化网络安全职业认证。</p>
          <AchievementDate id="google"/><p className="achievement-significance">{achievementById.google.significance}</p><div className="google-completion"><BadgeCheck size={20}/><span><strong>9 门课程 · 含实践评估</strong><small>从安全基础，到分析工具与检测响应</small></span></div>
          <div className="google-actions">
            <EvidenceButton id="google" className="button button-dark">查看完整证书<ArrowUpRight size={17}/></EvidenceButton>
            {item.verificationUrl && <a href={item.verificationUrl} target="_blank" rel="noopener noreferrer" className="text-button">官方验证<ArrowUpRight size={16}/></a>}
          </div>
        </div>
        <div className="google-proof" data-reveal>
          <div className="google-proof-caption"><span>专业学习，有据可查。</span><span className="micro">GOOGLE · COURSERA</span></div>
          <EvidenceButton id="google" className="google-certificate" label="打开 Google 网络安全专业认证高清证书">
            <Image src={item.preview} width={item.width} height={item.height} alt="Google 网络安全专业职业认证完整证书，含九门课程及官方验证地址" sizes="(max-width: 800px) 90vw, 46vw"/>
            <span>点击查看高清证书 · 支持放大<ArrowUpRight size={17}/></span>
          </EvidenceButton>
          <div className="google-proof-meta"><AchievementDate id="google" full/><span>认证编号<strong className="mono">{item.identifier}</strong></span></div>
        </div>
      </div>
      <div className="google-learning-header" data-reveal><h3>认证背后的知识与能力</h3><p>依据证书所列课程与技能说明，覆盖入门级工具应用和安全分析。</p></div>
      <div className="google-capabilities">{capabilities.map(({icon:Icon,title,detail,tools},i)=><article className="google-capability" key={title} data-reveal style={{transitionDelay:`${i*65}ms`}}><Icon size={23} strokeWidth={1.5}/><h4>{title}</h4><p>{detail}</p><span>{tools}</span></article>)}</div>
      <details className="google-courses"><summary>查看证书所列的 9 门课程<span className="micro">CURRICULUM<ArrowDown size={14}/></span></summary><ol>{googleCourses.map(course=><li key={course.en}><span>{course.zh}</span><small lang="en">{course.en}</small></li>)}</ol><p>中文为课程名译文；以证书所列英文原名为准。</p></details>
      <a className="chapter-transition" href="#edusrc"><span>从系统学习，走向真实安全实践。</span><span>下一章 · EDUSRC 全国第 24 名<ArrowDown size={15}/></span></a>
    </div>
  </section>;
}
