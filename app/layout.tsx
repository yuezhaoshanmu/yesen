import type { Metadata, Viewport } from 'next';
import './globals.css';
import './guestbook.css';

export const metadata: Metadata = {
  title: '叶森 YESEN — 个人技术成果与荣誉档案',
  description: '叶森的数字荣誉展厅。以原始证明呈现 CNVD、CNNVD、CVE 网络安全成果、Google 网络安全专业认证、EDUSRC 月榜第 24 名、工程项目与社会实践。',
  keywords: ['叶森','个人技术成果','数字荣誉展厅','CNVD','CNNVD','CVE','Google Cybersecurity','EDUSRC','国家奖学金评审'],
  authors: [{name:'叶森'}],
  openGraph: { title:'叶森 — 个人技术成果与荣誉档案', description:'从课堂，到真实世界。每一份成果，都有迹可循。', type:'website', locale:'zh_CN', images:[{url:'/og-image.jpg',width:1200,height:630,alt:'叶森的个人技术成果与荣誉档案'}] },
  twitter: {card:'summary_large_image',title:'叶森 — 个人技术成果与荣誉档案',images:['/og-image.jpg']},
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:'#050b10'};
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="zh-CN"><body><a className="skip-link" href="#main">跳至正文</a>{children}</body></html>;
}
