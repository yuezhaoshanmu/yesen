import type { Metadata, Viewport } from 'next';
import './globals.css';
import './guestbook.css';
import './exhibition.css';
import './achievements.css';
import './reading.css';
import './particles.css';
import './atelier.css';
import './direction-v2.css';
import './flagship.css';

export const metadata: Metadata = {
  title: '叶森 YESEN — 个人技术成果与荣誉档案',
  description: '叶森的数字荣誉展厅。以原始证明呈现 Google 网络安全专业职业认证、EDUSRC 5月全国白帽榜第24名、CNNVD / CNVD 国家平台成果、CVE 国际漏洞成果、竞赛荣誉与三个全栈项目。',
  keywords: ['叶森','个人技术成果','数字荣誉展厅','CNVD','CNNVD','CVE','Google Cybersecurity','EDUSRC','国家奖学金评审'],
  authors: [{name:'叶森'}],
  openGraph: { title:'叶森 — 个人技术成果与荣誉档案', description:'从课堂，到真实世界。每一份成果，都有迹可循。', type:'website', locale:'zh_CN', images:[{url:'/og-image.jpg',width:1200,height:630,alt:'叶森的个人技术成果与荣誉档案'}] },
  twitter: {card:'summary_large_image',title:'叶森 — 个人技术成果与荣誉档案',images:['/og-image.jpg']},
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#f4f7f6'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body><a className="skip-link" href="#main">跳至正文</a>{children}</body></html>;
}
