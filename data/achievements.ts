import assets from './assets.json';
import type { Evidence } from './evidence-types';
import { dateParts, dateText, dateStamp } from './achievement-dates';

type Entry = Omit<Evidence, keyof (typeof assets)[keyof typeof assets]>;
const entries: Entry[] = [
  { id:'cnvd-20319', certificateNumber: 'CNVD-YCGW-202605069184', title:'北京金和网络股份有限公司金和OA存在SQL注入漏洞（CNVD-C-2026-195040）', category:'国家平台', issuer:'国家信息安全漏洞共享平台（CNVD）', date:'2026-05-02', dateLabel:'漏洞收录时间', identifier:'CNVD-2026-20319', level:'高危', status:'documented', description:'原创漏洞证明。贡献者：叶森；贡献者单位：江西科技职业学院。', note:'证书编号：CNVD-YCGW-202605069184。落款：中国互联网协会网络与信息安全工作委员会、国家互联网应急中心（CNCERT）。' },
  { id:'cnvd-20312', certificateNumber: 'CNVD-YCGW-202605069881', title:'北京神州视翰科技有限公司多媒体综合业务显示系统存在SQL注入漏洞（CNVD-C-2026-195041）', category:'国家平台', issuer:'国家信息安全漏洞共享平台（CNVD）', date:'2026-05-02', dateLabel:'漏洞收录时间', identifier:'CNVD-2026-20312', level:'高危', status:'documented', description:'北京神州视翰科技有限公司多媒体综合业务显示系统存在 SQL 注入漏洞。贡献者：叶森。', note:'证书编号：CNVD-YCGW-202605069881。贡献者单位：江西科技职业学院。落款：中国互联网协会网络与信息安全工作委员会、国家互联网应急中心（CNCERT）。' },
  { id:'cnvd-30548', certificateNumber: 'CNVD-YCGW-202607049250', title:'上海卓卓网络科技有限公司DedeCMS存在SQL注入漏洞（CNVD-2026-30548）', category:'国家平台', issuer:'国家信息安全漏洞共享平台（CNVD）', date:'2026-07-28', dateLabel:'漏洞收录时间', identifier:'CNVD-2026-30548', level:'中危', status:'documented', description:'上海卓卓网络科技有限公司 DedeCMS 存在 SQL 注入漏洞。贡献者：叶森。', note:'证书编号：CNVD-YCGW-202607049250。贡献者单位：江西科技职业学院。落款：中国互联网协会网络与信息安全工作委员会、国家互联网应急中心（CNCERT）。' },
  { id:'cnnvd-18260050', title:'CNNVD 信息安全漏洞提交证明', category:'国家平台', issuer:'中国信息安全测评中心', date:'2026-09-03', dateLabel:'证明出具时间', identifier:'CNNVD-2026-18260050', level:'高危', status:'documented', description:'国家信息安全漏洞库（CNNVD）出具的信息安全漏洞提交证明。提交人：叶森；提交时间：2026-08-25。', note:'证明未载明漏洞名称；以“提交证明”展示，不自行扩展为公开收录公告。' },
  { id:'cve-10292', cvss: { version: '4.0', score: 8.7, severity: 'HIGH' }, reporter: 'Missa (VulDB User)', technicalTitle: 'UTT HiPER 1200GW · formTaskEdit', title:'UTT HiPER 1200GW 栈缓冲区溢出', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-06-01', dateLabel:'CVE 发布时间', identifier:'CVE-2026-10292', level:'CVSS 4.0 · 8.7 / 高危', status:'documented', description:'formTaskEdit / strcpy 栈缓冲区溢出。官方记录报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-10292', note:'编号、评分及署名来自原始 PDF 和官网截图。个人归属来自荣誉汇总自述。' },
  { id:'cve-10293', cvss: { version: '4.0', score: 8.7, severity: 'HIGH' }, reporter: 'Missa (VulDB User)', technicalTitle: 'UTT HiPER 1200GW · formFireWall', title:'UTT HiPER 1200GW 防火墙功能栈溢出', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-06-01', dateLabel:'CVE 发布时间', identifier:'CVE-2026-10293', level:'CVSS 4.0 · 8.7 / 高危', status:'documented', description:'formFireWall / strcpy 栈缓冲区溢出。官方记录报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-10293', note:'个人归属来自荣誉汇总自述。' },
  { id:'cve-87924', cvss: { version: '4.0', score: 6.9, severity: 'MEDIUM' }, reporter: 'Missa (VulDB User)', technicalTitle: 'Invoice Generation · Missing Authentication', title:'库存管理系统身份认证缺失', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-09-09', dateLabel:'CVE 发布时间', identifier:'CVE-2026-87924', level:'CVSS 4.0 · 6.9 / 中危', status:'documented', description:'Rizwan17 inventory-management-system：Invoice Generation / invoice_bill.php 身份认证缺失。报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-87924', note:'编号、评分、日期和署名见汇总文档 image15.png。' },
  { id:'cve-87925', cvss: { version: '4.0', score: 6.9, severity: 'MEDIUM' }, reporter: 'Missa (VulDB User)', technicalTitle: 'storeCustomerOrderInvoice · SQL Injection', title:'库存管理系统 SQL 注入漏洞', category:'国际漏洞', issuer:'CVE Program · CNA: VulDB', date:'2026-09-09', dateLabel:'CVE 发布时间', identifier:'CVE-2026-87925', level:'CVSS 4.0 · 6.9 / 中危', status:'documented', description:'Rizwan17 inventory-management-system：manage.php / storeCustomerOrderInvoice SQL 注入。报告人：Missa (VulDB User)。', verificationUrl:'https://www.cve.org/CVERecord?id=CVE-2026-87925', note:'统一采用 CVSS 4.0；该记录其他评分版本有不同等级，未混用。' },
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

const sourceById = Object.fromEntries(entries.map(entry => [entry.id, { ...entry, ...assets[entry.id] }])) as Record<string, Evidence>;

export type AchievementLevel = 'international' | 'national' | 'national-ranking' | 'provincial' | 'school' | 'other';
export type AchievementCategory = 'technology' | 'certification' | 'competition' | 'social-practice' | 'training';
export type Achievement = {
  id: string; title: string; shortTitle: string;
  date: string | null; year: number | null; month: number | null; day: number | null;
  awardDateText: string; dateLabel: string; dateEvidence: string;
  level: AchievementLevel; levelLabel: string; levelEvidence: string;
  category: AchievementCategory; organization: string; summary: string;
  description: string; significance: string; certificate: string; evidencePath: string;
  officialUrl: string | null; evidence: Evidence; featured: boolean; order: number;
  detailId: string; contextNote?: string; relatedDates?: { label: string; date: string }[];
};

export const achievementLevels: { id: AchievementLevel; title: string; word: string; subtitle: string; en: string }[] = [
  { id: 'international', title: '国际认可成果', word: '国际', subtitle: '国际专业认证 · 通用漏洞成果', en: 'INTERNATIONAL' },
  { id: 'national', title: '国家级权威成果', word: '国家', subtitle: '权威漏洞平台 · 技术成果', en: 'NATIONAL' },
  { id: 'national-ranking', title: '全国实战排名', word: '全国', subtitle: '全国性专业实践成果', en: 'PROFESSIONAL PRACTICE' },
  { id: 'provincial', title: '省级荣誉', word: '省级', subtitle: '赛事一等奖 · 社会实践荣誉', en: 'PROVINCIAL' },
  { id: 'school', title: '校级荣誉', word: '校级', subtitle: '创新创业 · 学习成长', en: 'CAMPUS' },
  { id: 'other', title: '其他认证', word: '其他', subtitle: '课程学习 · 持续积累', en: 'CONTINUING LEARNING' },
];

type Metadata = Pick<Achievement, 'id' | 'shortTitle' | 'level' | 'levelLabel' | 'levelEvidence' | 'category' | 'significance' | 'dateLabel' | 'dateEvidence' | 'detailId'> & Partial<Pick<Achievement, 'featured' | 'contextNote' | 'relatedDates'>>;
const cveMeaning = '全球网络安全行业通用漏洞编号体系收录的安全成果，可被厂商、安全研究与漏洞管理系统引用。';
const cnvdMeaning = '原创漏洞获国家级权威漏洞平台 CNVD 收录，体现真实漏洞挖掘、分析与规范报送能力。';
const challengeMeaning = '在校级创新创业赛事中获得优秀奖，体现创新意识、团队协作与项目实践能力。';
const cveMetadata = {
  level: 'international', levelLabel: '国际通用漏洞成果', category: 'technology', significance: cveMeaning,
  levelEvidence: 'CVE 官方记录中的唯一编号及 CNA 信息；属于国际通用编号体系，不是竞赛奖项。',
  dateLabel: 'CVE 发布时间', detailId: 'global', featured: true,
  contextNote: '官方报告人：Missa；汇总文档声明为本人。',
} as const;
const cnvdMetadata = {
  level: 'national', levelLabel: '国家级权威平台技术成果', category: 'technology', significance: cnvdMeaning,
  levelEvidence: '原创漏洞证明落款：中国互联网协会网络与信息安全工作委员会、国家互联网应急中心（CNCERT）。',
  dateLabel: '漏洞收录时间', detailId: 'national', featured: true,
} as const;
const challengeMetadata = {
  level: 'school', levelLabel: '校级决赛 · 优秀奖', category: 'competition', significance: challengeMeaning,
  levelEvidence: '证书正文明确写“校级决赛”，盖章为共青团江西科技职业学院委员会。',
  dateLabel: '获奖时间', dateEvidence: '证书落款“二〇二六年四月”，无具体日。', detailId: 'archive',
} as const;

// Every classification is explicit and grounded in the source, never inferred from a title.
const metadata: Metadata[] = [
  { id: 'google', shortTitle: 'Google 网络安全专业职业认证', level: 'international', levelLabel: '国际专业认证', category: 'certification', featured: true, detailId: 'certification',
    significance: '全球领先科技企业 Google 推出的网络安全职业认证，体现系统化专业学习与基础实践能力。',
    dateLabel: '认证时间', dateEvidence: 'PDF 第 1 页：Apr 8, 2026。', levelEvidence: '证书载明 Google 开发、Coursera 提供的 Professional Certificate；非竞赛奖项。' },
  { id: 'edusrc', shortTitle: 'EDUSRC 5月白帽榜 · 全国第24名', level: 'national-ranking', levelLabel: '全国性专业实践排名', category: 'technology', featured: true, detailId: 'edusrc',
    significance: '与全国高校网络安全实践者同台参与真实漏洞研究，取得5月全国第24名。', dateLabel: '榜单时间',
    dateEvidence: 'image12 图表时间轴为 2026/05/01–2026/05/31，榜单第 24 位为叶森。', levelEvidence: '教育漏洞报告平台全国白帽榜截图及汇总文档说明，不属于行政等级奖项。' },
  { id: 'cnnvd-18260050', shortTitle: 'CNNVD 高危漏洞提交证明', level: 'national', levelLabel: '国家级权威平台技术成果', category: 'technology', featured: true, detailId: 'national',
    significance: '高危漏洞获中国信息安全测评中心出具提交证明，体现真实漏洞发现与分析能力。',
    dateLabel: '证明出具时间', dateEvidence: 'PDF 落款：2026年09月03日；提交时间另记为2026年08月25日。', levelEvidence: '国家信息安全漏洞库（CNNVD）证明，落款中国信息安全测评中心。',
    contextNote: '材料为提交证明；未载明公开收录时间。', relatedDates: [{ label: '漏洞提交时间', date: '2026-08-25' }] },
  { ...cnvdMetadata, id: 'cnvd-20319', shortTitle: 'CNVD 金和 OA 原创漏洞', dateEvidence: 'PDF“收录时间”：2026年05月02日。' },
  { ...cnvdMetadata, id: 'cnvd-20312', shortTitle: 'CNVD 神州视翰多媒体系统原创漏洞', dateEvidence: 'PDF“收录时间”：2026年05月02日。' },
  { ...cnvdMetadata, id: 'cnvd-30548', shortTitle: 'CNVD DedeCMS 原创漏洞', dateEvidence: 'PDF“收录时间”：2026年07月28日。' },
  { ...cveMetadata, id: 'cve-10292', shortTitle: 'CVE-2026-10292', dateEvidence: 'PDF 第 1 页 Published: 2026-06-01；不采用页脚打印时间。' },
  { ...cveMetadata, id: 'cve-10293', shortTitle: 'CVE-2026-10293', dateEvidence: 'PDF 第 1 页 Published: 2026-06-01；不采用页脚打印时间。' },
  { ...cveMetadata, id: 'cve-87924', shortTitle: 'CVE-2026-87924', dateEvidence: 'image15 官方记录 Published: 2026-09-09。' },
  { ...cveMetadata, id: 'cve-87925', shortTitle: 'CVE-2026-87925', dateEvidence: 'image16 官方记录 Published: 2026-09-09。' },
  { id: 'raicom', shortTitle: '睿抗江西赛区 · 一等奖', level: 'provincial', levelLabel: '省级赛事 · 一等奖', category: 'competition', featured: true, detailId: 'competitions',
    significance: '获得睿抗机器人开发者大赛江西赛区一等奖，体现技术实践、团队协作与创新应用能力。', dateLabel: '获奖时间',
    dateEvidence: 'image17 证书落款：2026年07月28日。', levelEvidence: '证书明确为江西赛区 AI 视觉应用竞赛项目一等奖，落款工业和信息化部人才交流中心。' },
  { ...challengeMetadata, id: 'challenge-care', shortTitle: '“挑战杯”优秀奖 · 颐护家' },
  { ...challengeMetadata, id: 'challenge-security', shortTitle: '“挑战杯”优秀奖 · 安帼' },
  { id: 'social', shortTitle: '江西省“三下乡”优秀个人', level: 'provincial', levelLabel: '省级社会实践荣誉', category: 'social-practice', detailId: 'archive',
    significance: '省级社会实践个人荣誉，体现志愿服务、社会实践与责任担当。', dateLabel: '获评年份',
    dateEvidence: 'image5 正文为2025年江西省“三下乡”表彰；2025年12月23日为报道日期，不是颁奖日期。',
    levelEvidence: '学校官方报道明确“省级荣誉”，引述省委宣传部、省教育厅、团省委、省学联联合发布的通报，点名叶森获评优秀个人。',
    contextNote: '依据学校官方报道。', relatedDates: [{ label: '校方报道时间', date: '2025-12-23' }] },
  { id: 'training', shortTitle: '入党积极分子培训班优秀学员', level: 'school', levelLabel: '校级学习荣誉', category: 'training', detailId: 'archive',
    significance: '获学校党校培训班优秀学员称号，体现认真学习、纪律意识与责任担当。', dateLabel: '获评时间',
    dateEvidence: 'image4 证书落款：二〇二五年五月二十七日。', levelEvidence: '颁发与盖章单位均为中共江西科技职业学院委员会党校。' },
  { id: 'pku', shortTitle: '北京大学《操作系统与虚拟化安全》', level: 'other', levelLabel: '在线课程认证 · 不作奖项定级', category: 'certification', detailId: 'archive',
    significance: '完成北京大学授权的《操作系统与虚拟化安全》在线课程及相关考核，积累系统安全知识。', dateLabel: '认证时间',
    dateEvidence: 'PDF 第 1 页：Apr 23, 2026。', levelEvidence: '北京大学授权、Coursera 授课的在线课程结业证明，不属于校级竞赛或荣誉。',
    contextNote: '' },
];

/** Unified public view: source dates/assets come from the evidence archive; no duplicate dates. */
export const achievements: Achievement[] = metadata.map((meta, order) => {
  const item = sourceById[meta.id];
  return {
    ...meta, title: item.title, date: item.date, ...dateParts(item.date),
    awardDateText: dateText(item.date, true), organization: item.issuer,
    summary: meta.significance, description: item.description, certificate: item.original, evidencePath: item.original,
    officialUrl: item.verificationUrl ?? null, evidence: item, featured: meta.featured ?? false, order,
  };
});
export const achievementById = Object.fromEntries(achievements.map(item => [item.id, item])) as Record<string, Achievement>;
export const achievementYears = [...new Set(achievements.flatMap(item => item.year ? [item.year] : []))].sort((a, b) => b - a);
export const levelCounts = Object.fromEntries(achievementLevels.map(level => [level.id, achievements.filter(item => item.level === level.id).length])) as Record<AchievementLevel, number>;

export function sortAchievements(items: Achievement[]) {
  const priority = achievementLevels.map(level => level.id);
  return [...items].sort((a, b) => priority.indexOf(a.level) - priority.indexOf(b.level)
    || (b.year ?? 0) - (a.year ?? 0) || (b.month ?? 0) - (a.month ?? 0)
    || (b.day ?? 0) - (a.day ?? 0) || a.order - b.order);
}
export const achievementFilters = [
  { id: 'all', label: '全部' }, { id: 'international', label: '国际' }, { id: 'national', label: '国家' },
  { id: 'provincial', label: '省级' }, { id: 'school', label: '校级' },
  { id: 'technology', label: '技术成果' }, { id: 'competition', label: '竞赛' }, { id: 'social-practice', label: '社会实践' },
] as const;
export type AchievementFilter = typeof achievementFilters[number]['id'];
export function filterAchievements(filter: AchievementFilter, year: number | null) {
  return sortAchievements(achievements.filter(item => (filter === 'all' || item.level === filter || item.category === filter) && (year === null || item.year === year)));
}

// Technical views are selected from the source, never a second hand-maintained ID list.
export const nationalAchievements = sortAchievements(achievements.filter(a => a.level === 'national')).map(a => ({
  ...a, platform: a.evidence.identifier!.split('-')[0], severity: a.evidence.level!, explanation: a.significance,
}));
export const cveAchievements = sortAchievements(achievements.filter(a => a.evidence.category === '国际漏洞')).map(a => ({
  ...a, number: a.evidence.identifier!, score: a.evidence.cvss!.score, severity: a.evidence.cvss!.severity,
  reporter: a.evidence.reporter!, technicalTitle: a.evidence.technicalTitle!,
}));

export const evidence: Evidence[] = [
  ...achievements.map(a => a.evidence),
  ...entries.filter(e => e.status === 'pending').map(e => sourceById[e.id]),
];
export const evidenceById = Object.fromEntries(evidence.map(e => [e.id, e])) as Record<string, Evidence>;
export const archiveCategories = ['全部', '国家平台', '国际漏洞', '专业认证', '竞赛荣誉', '社会实践', '安全实践'] as const;
// Groups enumerate levels, never a second list of achievement IDs.
export const achievementGroups = achievementLevels.map(level => ({
  ...level, items: sortAchievements(achievements.filter(a => a.level === level.id)),
})).filter(group => group.items.length);

if (process.env.NODE_ENV === 'development') {
  for (const a of achievements) if (!a.evidencePath) console.warn(`[achievement integrity] ${a.id}: missing evidencePath`);
}

export const achievementCounts = {
  cnvd: nationalAchievements.filter(item => item.platform === 'CNVD').length,
  cnnvd: nationalAchievements.filter(item => item.platform === 'CNNVD').length,
  cve: cveAchievements.length,
  competitions: achievements.filter(item => item.category === 'competition').length,
  certifications: achievements.filter(item => item.category === 'certification').length,
  documented: achievements.length,
  pending: evidence.filter(item => item.status === 'pending').length,
};
export const journey = [...achievements].sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '')).map(item => ({
  date: dateStamp(item.date), title: item.shortTitle, description: item.significance, evidenceId: item.id,
}));
