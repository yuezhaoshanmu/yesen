import assets from './assets.json';

export type EvidenceCategory = '国家平台' | '国际漏洞' | '专业认证' | '竞赛荣誉' | '社会实践' | '安全实践';
export type Evidence = {
  id: keyof typeof assets; title: string; category: EvidenceCategory;
  issuer: string; date: string | null; dateLabel?: string; identifier?: string;
  level?: string; description: string; verificationUrl?: string;
  note?: string; status: 'documented' | 'pending';
} & (typeof assets)[keyof typeof assets];
type Entry = Omit<Evidence, keyof (typeof assets)[keyof typeof assets]>;
const entries: Entry[] = [
  { id:'cnvd-20319', title:'金和 OA SQL 注入漏洞', category:'国家平台', issuer:'国家信息安全漏洞共享平台（CNVD）', date:'2026-05-02', dateLabel:'漏洞收录时间', identifier:'CNVD-2026-20319', level:'高危', status:'documented', description:'原创漏洞证明。贡献者：叶森；贡献者单位：江西科技职业学院。', note:'证书编号：CNVD-YCGW-202605069184。落款：中国互联网协会网络与信息安全工作委员会、国家互联网应急中心（CNCERT）。' },
  { id:'cnvd-20312', title:'多媒体综合业务显示系统 SQL 注入漏洞', category:'国家平台', issuer:'国家信息安全漏洞共享平台（CNVD）', date:'2026-05-02', dateLabel:'漏洞收录时间', identifier:'CNVD-2026-20312', level:'高危', status:'documented', description:'北京神州视翰科技有限公司多媒体综合业务显示系统存在 SQL 注入漏洞。贡献者：叶森。', note:'证书编号：CNVD-YCGW-202605069881。' },
  { id:'cnvd-30548', title:'DedeCMS SQL 注入漏洞', category:'国家平台', issuer:'国家信息安全漏洞共享平台（CNVD）', date:'2026-07-28', dateLabel:'漏洞收录时间', identifier:'CNVD-2026-30548', level:'中危', status:'documented', description:'上海卓卓网络科技有限公司 DedeCMS 存在 SQL 注入漏洞。贡献者：叶森。', note:'证书编号：CNVD-YCGW-202607049250。' },
  { id:'cnnvd-18260050', title:'CNNVD 信息安全漏洞提交证明', category:'国家平台', issuer:'中国信息安全测评中心', date:'2026-09-03', dateLabel:'证明出具时间', identifier:'CNNVD-2026-18260050', level:'高危', status:'documented', description:'国家信息安全漏洞库（CNNVD）出具的信息安全漏洞提交证明。提交人：叶森；提交时间：2026-08-25。', note:'证明未载明漏洞名称；以“提交证明”展示，不自行扩展为公开收录公告。' },
  { id:'cve-10292', title:'UTT HiPER 1200GW 栈缓冲区溢出', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-06-01', dateLabel:'CVE 发布时间', identifier:'CVE-2026-10292', level:'CVSS 4.0 · 8.7 / 高危', status:'documented', description:'formTaskEdit / strcpy 栈缓冲区溢出。官方记录报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-10292', note:'编号、评分及署名来自原始 PDF 和官网截图。个人归属来自荣誉汇总自述。' },
  { id:'cve-10293', title:'UTT HiPER 1200GW 防火墙功能栈溢出', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-06-01', dateLabel:'CVE 发布时间', identifier:'CVE-2026-10293', level:'CVSS 4.0 · 8.7 / 高危', status:'documented', description:'formFireWall / strcpy 栈缓冲区溢出。官方记录报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-10293', note:'个人归属来自荣誉汇总自述。' },
  { id:'cve-87924', title:'库存管理系统身份认证缺失', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-09-09', dateLabel:'CVE 发布时间', identifier:'CVE-2026-87924', level:'CVSS 4.0 · 6.9 / 中危', status:'documented', description:'Rizwan17 inventory-management-system：Invoice Generation / invoice_bill.php 身份认证缺失。报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-87924', note:'编号、评分、日期和署名见汇总文档 image15.png。' },
  { id:'cve-87925', title:'库存管理系统 SQL 注入漏洞', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-09-09', dateLabel:'CVE 发布时间', identifier:'CVE-2026-87925', level:'CVSS 4.0 · 6.9 / 中危', status:'documented', description:'Rizwan17 inventory-management-system：manage.php / storeCustomerOrderInvoice SQL 注入。报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-87925', note:'统一采用 CVSS 4.0；该记录其他评分版本有不同等级，未混用。' },
  { id:'google', title:'Google 网络安全专业职业认证', category:'专业认证', issuer:'Google · Coursera', date:'2026-04-08', dateLabel:'认证时间', identifier:'P6KEAPHJ0ZGQ', level:'专业职业认证 · 9 门课程', status:'documented', description:'完成 Google 开发的九门课程及实践评估，覆盖网络安全基础、风险管理、威胁检测与响应，以及入门级 Python、Linux、SQL、SIEM 和 IDS 工具应用。', verificationUrl:'https://coursera.org/verify/professional-cert/P6KEAPHJ0ZGQ', note:'证书姓名显示为“森 叶”。' },
  { id:'pku', title:'操作系统与虚拟化安全', category:'专业认证', issuer:'北京大学 · Coursera', date:'2026-04-23', dateLabel:'认证时间', identifier:'3DPBXPZ2D92U', level:'在线课程认证', status:'documented', description:'完成北京大学授权的《操作系统与虚拟化安全》在线课程及相关考核，积累系统安全知识。', verificationUrl:'https://coursera.org/verify/3DPBXPZ2D92U', note:'证书姓名显示为“森 叶”。' },
  { id:'edusrc', title:'EDUSRC 2026 年 5 月白帽榜第 24 名', category:'安全实践', issuer:'教育漏洞报告平台（EDUSRC）', date:'2026-05', dateLabel:'榜单时间', level:'全国月度白帽榜 · 第 24 名', status:'documented', description:'截图显示 2026 年 5 月榜单中，昵称“叶森”列于第 24 位，Rank 值为 100。', note:'只证明所提供截图中的月度排名，不等同于历史总榜、实时排名或全年排名。' },
  { id:'raicom', title:'睿抗机器人开发者大赛江西赛区一等奖', category:'竞赛荣誉', issuer:'工业和信息化部人才交流中心', date:'2026-07-28', dateLabel:'获奖时间', identifier:'IITCHJRAIC26008150', level:'江西赛区 · AI 视觉应用 · 一等奖', status:'documented', description:'2026 睿抗机器人开发者大赛（RAICOM）江西赛区 AI 视觉应用竞赛项目一等奖。团队成员：杨燕青、叶森、肖文浩；指导老师：杨祖威、廖世达。' },
  { id:'challenge-care', title:'“挑战杯”校级决赛优秀奖 · 颐护家', category:'竞赛荣誉', issuer:'共青团江西科技职业学院委员会', date:'2026-04', dateLabel:'获奖时间', level:'校级决赛 · 优秀奖', status:'documented', description:'2026 年第十五届“挑战杯”江西省大学生创业计划竞赛校级决赛；项目：颐护家——社区居家老年上门护理服务。证书团队成员含叶森。', note:'原始证书写“挑战杯”，并非“挑战者杯”；赛事范围为校级决赛。' },
  { id:'challenge-security', title:'“挑战杯”校级决赛优秀奖 · 安帼', category:'竞赛荣誉', issuer:'共青团江西科技职业学院委员会', date:'2026-04', dateLabel:'获奖时间', level:'校级决赛 · 优秀奖', status:'documented', description:'2026 年第十五届“挑战杯”江西省大学生创业计划竞赛校级决赛；项目：“安帼”女性数字安全守护平台。证书团队成员含叶森。' },
  { id:'social', title:'江西省“三下乡”社会实践优秀个人', category:'社会实践', issuer:'省委宣传部、省教育厅、团省委、省学联（校方报道转述）', date:'2025', dateLabel:'获评年份', level:'省级社会实践荣誉', status:'documented', description:'江西科技职业学院官方微信报道：“青禾”社会实践服务队学生叶森获评优秀个人。', note:'材料为学校官方微信报道截图；校方报道日期为2025年12月23日，不等同于颁奖日期。' },
  { id:'training', title:'入党积极分子培训班优秀学员', category:'社会实践', issuer:'中共江西科技职业学院委员会党校', date:'2025-05-27', dateLabel:'获评时间', level:'2025 年第一期 · 优秀学员', status:'documented', description:'叶森在 2025 年第一期入党积极分子培训班中表现突出，被授予“优秀学员”称号。' },
  { id:'edusrc-pending', title:'高校漏洞报送证书兑换记录', category:'安全实践', issuer:'教育漏洞报告平台（EDUSRC）', date:null, dateLabel:'证书获得时间', level:'证书兑换记录', status:'pending', description:'截图存在上海交通大学、江西财经大学漏洞报送证书兑换订单，订单状态为“未发货”。', note:'此为订单截图，不作为已获得感谢证书计入荣誉。' },
];
// Keep the archive and lightbox navigation in the same order as the exhibition.
const displayOrder: Entry['id'][] = ['google','edusrc','cnnvd-18260050','cnvd-20319','cnvd-20312','cnvd-30548','cve-10292','cve-10293','cve-87924','cve-87925','raicom','challenge-care','challenge-security','social','training','pku','edusrc-pending'];
export const evidence: Evidence[] = [...entries].sort((a,b)=>displayOrder.indexOf(a.id)-displayOrder.indexOf(b.id)).map(entry => ({ ...entry, ...assets[entry.id] }));
export const evidenceById = Object.fromEntries(evidence.map(item => [item.id, item])) as Record<string, Evidence>;
export const archiveCategories = ['全部', '国家平台', '国际漏洞', '专业认证', '竞赛荣誉', '社会实践', '安全实践'] as const;
