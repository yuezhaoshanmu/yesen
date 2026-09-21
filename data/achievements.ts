import { evidence, evidenceById } from './evidence';

export const nationalAchievements = [
  { id:'cnvd-20319', platform:'CNVD', certificateId:'CNVD-YCGW-202605069184', severity:'高危', title:'金和 OA · SQL 注入', explanation:'发现企业办公系统中可能被利用的数据安全风险，并获得原创漏洞证明。' },
  { id:'cnvd-20312', platform:'CNVD', certificateId:'CNVD-YCGW-202605069881', severity:'高危', title:'多媒体业务系统 · SQL 注入', explanation:'发现通用 Web 应用的安全缺陷，完成分析、复现与漏洞报送。' },
  { id:'cnvd-30548', platform:'CNVD', certificateId:'CNVD-YCGW-202607049250', severity:'中危', title:'DedeCMS · SQL 注入', explanation:'将内容管理系统的真实安全问题转化为可审核、可复现的技术报告。' },
  { id:'cnnvd-18260050', platform:'CNNVD', severity:'高危', title:'国家信息安全漏洞库 · 提交证明', explanation:'中国信息安全测评中心出具高危漏洞提交证明，提交人明确记载为叶森。' },
].map(item=>({...item,evidence:evidenceById[item.id]}));

export const cveAchievements = [
  { id:'cve-10292', number:'CVE-2026-10292', score:8.7, severity:'HIGH', title:'路由器任务编辑功能栈溢出', technicalTitle:'UTT HiPER 1200GW · formTaskEdit', date:'2026-06-01' },
  { id:'cve-10293', number:'CVE-2026-10293', score:8.7, severity:'HIGH', title:'路由器防火墙功能栈溢出', technicalTitle:'UTT HiPER 1200GW · formFireWall', date:'2026-06-01' },
  { id:'cve-87924', number:'CVE-2026-87924', score:6.9, severity:'MEDIUM', title:'库存管理系统身份认证缺失', technicalTitle:'Invoice Generation · Missing Authentication', date:'2026-09-09' },
  { id:'cve-87925', number:'CVE-2026-87925', score:6.9, severity:'MEDIUM', title:'库存管理系统 SQL 注入', technicalTitle:'storeCustomerOrderInvoice · SQL Injection', date:'2026-09-09' },
].map(item=>({...item,evidence:evidenceById[item.id]}));

export const achievementCounts = {
  cnvd:nationalAchievements.filter(i=>i.platform==='CNVD').length,
  cnnvd:nationalAchievements.filter(i=>i.platform==='CNNVD').length,
  cve:cveAchievements.length,
  competitions:evidence.filter(i=>i.category==='竞赛荣誉'&&i.status==='documented').length,
  certifications:evidence.filter(i=>i.category==='专业认证'&&i.status==='documented').length,
  documented:evidence.filter(i=>i.status==='documented').length,
};
export const journey = [
  { date:'2025.05', title:'将责任写入成长', description:'入党积极分子培训班优秀学员', evidenceId:'training' },
  { date:'2025.12', title:'走向真实的社会', description:'省级“三下乡”优秀个人 · 校方报道', evidenceId:'social' },
  { date:'2026.04', title:'建立系统的安全知识', description:'Google 专业认证、北京大学课程认证与两项校级竞赛优秀奖', evidenceId:'google' },
  { date:'2026.05', title:'从理论走向漏洞研究', description:'两份 CNVD 原创漏洞证明；EDUSRC 月榜第 24 名', evidenceId:'cnvd-20319' },
  { date:'2026.06', title:'进入国际漏洞体系', description:'两项 CVE 高危漏洞记录 · CVSS 4.0 8.7', evidenceId:'cve-10292' },
  { date:'2026.07', title:'让研究与工程相互印证', description:'睿抗江西赛区一等奖；DedeCMS 漏洞获 CNVD 收录', evidenceId:'raicom' },
  { date:'2026.09', title:'持续提交可验证的成果', description:'CNNVD 高危漏洞提交证明；新增两项 CVE 记录', evidenceId:'cnnvd-18260050' },
];
