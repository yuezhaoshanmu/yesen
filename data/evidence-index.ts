export type EvidenceCategory =
  | 'assessment'
  | 'official-platform'
  | 'scholarship-case'
  | 'research-output'
  | 'lab-achievement'
  | 'academic-innovation';

export type EvidenceItem = {
  id: string;
  institution: string;
  institutionEn?: string;
  source: string;
  category: EvidenceCategory;
  title: string;
  evidence: string;
  recognition: string;
  officialDomain: string;
  officialUrl?: string;
  verified: boolean;
  enabled: boolean;
  priority?: boolean;
  tags?: string[];
  metric?: string;
  metricLabel?: string;
  benchmark?: {
    sourceAchievement: string;
    sourceLevel?: string;
    sourceScore?: number;
    relation: 'same-category' | 'same-base-score';
    targetAchievement: string;
    targetLevel?: string;
    targetScore?: number;
    relationText: string;
  };
};

export const evidenceVerifiedDate = '2026-09-24';

export const evidenceIndex: readonly EvidenceItem[] = [
  { id: 'hit-professional', institution: '哈尔滨工业大学 · 计算学部', institutionEn: 'HARBIN INSTITUTE OF TECHNOLOGY · COMPUTING', source: '哈尔滨工业大学计算学部', category: 'assessment', title: '计算学部专业型硕士生国家奖学金初评打分办法（2026年）', evidence: '高危 CNVD 为 A 类成果，20 分/项；同一 A 类还包括国家级学科竞赛一等奖、国家发明专利、CCF / CAAI B 类论文等。', recognition: '高危 CNVD 与国家级学科竞赛一等奖同列 A 类成果', officialDomain: 'computing.hit.edu.cn', officialUrl: 'https://computing.hit.edu.cn/_upload/article/files/e5/86/8b43af5e443a938c77968b438fbe/25a4ff6d-a87e-42ee-920f-3cd0d3fcb60d.pdf', verified: true, enabled: true, priority: true, tags: ['高校评审', '国奖案例'], benchmark: { sourceAchievement: '高危 CNVD', sourceLevel: 'A类成果', sourceScore: 20, relation: 'same-category', targetAchievement: '国家级学科竞赛', targetLevel: '一等奖', relationText: '同列 A 类成果' } },
  { id: 'hit-academic', institution: '哈尔滨工业大学 · 计算学部', institutionEn: 'HARBIN INSTITUTE OF TECHNOLOGY · COMPUTING', source: '哈尔滨工业大学计算学部', category: 'assessment', title: '计算学部学术型硕士生国家奖学金初评打分办法（2026年）', evidence: '高危 CNVD 为 C 类成果，5 分/项；同一 C 类包括国家级学科竞赛三等奖。', recognition: '高危 CNVD 与国家级学科竞赛三等奖同列 C 类成果', officialDomain: 'computing.hit.edu.cn', officialUrl: 'https://computing.hit.edu.cn/_upload/article/files/e5/86/8b43af5e443a938c77968b438fbe/9a0c7e18-d8d1-4a43-bd59-e477a59c197b.pdf', verified: true, enabled: true, tags: ['高校评审', '国奖案例'], benchmark: { sourceAchievement: '高危 CNVD', sourceLevel: 'C类成果', sourceScore: 5, relation: 'same-category', targetAchievement: '国家级学科竞赛', targetLevel: '三等奖', relationText: '同列 C 类成果' } },
  { id: 'bit-assessment', institution: '北京理工大学 · 网络空间安全学院', institutionEn: 'BEIJING INSTITUTE OF TECHNOLOGY · CYBERSPACE SECURITY', source: '北京理工大学网络空间安全学院', category: 'assessment', title: '研究生综合测评办法', evidence: '该办法用于国家奖学金、学业奖学金等评定。高危 CNVD 原创漏洞证书记 50 分；国际 / 国家级竞赛三等奖基础标准分同为 50 分。', recognition: '高危 CNVD 与国家级竞赛三等奖具有相同基础分值', officialDomain: 'cst.bit.edu.cn', officialUrl: 'https://cst.bit.edu.cn/docs/2024-09/059d98278a3047c28104c9c400c1f044.pdf', verified: true, enabled: true, tags: ['高校评审', '国奖案例'], benchmark: { sourceAchievement: '高危 CNVD', sourceScore: 50, relation: 'same-base-score', targetAchievement: '国家级竞赛', targetLevel: '三等奖', targetScore: 50, relationText: '同基础分值' } },
  { id: 'cnvd-platform', institution: 'CNVD / CNCERT', source: '国家信息安全漏洞共享平台', category: 'official-platform', title: '国家信息安全漏洞共享平台官方介绍', evidence: '说明 CNVD 平台建设主体及漏洞应急处理体系定位。', recognition: '官方平台规则与定位', officialDomain: 'cnvd.org.cn', officialUrl: 'https://www.cnvd.org.cn/', verified: true, enabled: true, tags: ['CNVD'] },
  { id: 'cnnvd-platform', institution: 'CNNVD', source: '国家信息安全漏洞库', category: 'official-platform', title: '国家信息安全漏洞库技术支撑单位计划指南', evidence: '将 CNNVD 定义为国家级信息安全漏洞数据管理平台。', recognition: '官方平台规则与定位', officialDomain: 'cnnvd.org.cn', officialUrl: 'https://www.cnnvd.org.cn/', verified: true, enabled: true, tags: ['CNNVD'] },
  { id: 'cve-rules', institution: 'CVE Program', source: 'CVE Program', category: 'official-platform', title: 'CNA Operational Rules / CVE 官方规则', evidence: '定义 CVE 为国际性、社区驱动的公开漏洞识别与编目体系。', recognition: 'CVE 官方规则', officialDomain: 'cve.org', officialUrl: 'https://www.cve.org/ResourcesSupport/AllResources/CNARules', verified: true, enabled: true, tags: ['CVE'] },
  { id: 'edusrc-platform', institution: '教育漏洞报告平台 EDUSRC', source: '教育漏洞报告平台 EDUSRC', category: 'official-platform', title: '常态化漏洞挖掘演习专栏', evidence: '明确面向全国本科、高职高专院校在校师生。', recognition: '官方平台公开说明', officialDomain: 'sjtu.edu.cn', officialUrl: 'https://vulsrc.sjtu.edu.cn/', verified: true, enabled: true, tags: ['EDUSRC'] },
  { id: 'nwpu-cve', institution: '西北工业大学网络空间安全学院', source: '西北工业大学网络空间安全学院', category: 'scholarship-case', title: '《刘名轩：砺剑攻坚，护航苍穹》', evidence: '学院官方国家奖学金获得者事迹将“发现并成功提交 5 个高危 CVE 漏洞”作为科研与实践成果重点展示；该学生同时获得 2024 年研究生国家奖学金。', recognition: '国家奖学金获得者代表性科研实践成果', officialDomain: 'wlkjaqxy.nwpu.edu.cn', officialUrl: 'https://wlkjaqxy.nwpu.edu.cn/info/1091/11460.htm', verified: true, enabled: true, tags: ['CVE', '国奖案例'], metric: '5', metricLabel: 'HIGH-RISK CVE' },
  { id: 'sjtu-cve', institution: '上海交通大学 GoSec 实验室', source: '上海交通大学 GoSec 实验室', category: 'lab-achievement', title: 'GoSec@CS.SJTU · Achievement & Award', evidence: '实验室官方网站在 Achievement & Award 栏目直接列出多个 CVE 编号，与论文录用、竞赛成果等研究成果共同展示。', recognition: '高校实验室 Achievement & Award 正式成果', officialDomain: 'gosec.sjtu.edu.cn', officialUrl: 'https://gosec.sjtu.edu.cn/', verified: true, enabled: true, tags: ['CVE', '科研成果'], metric: 'CVE', metricLabel: 'ACHIEVEMENT & AWARD' },
  { id: 'zju-cve', institution: '浙江大学网络空间安全学院', source: '浙江大学网络空间安全学院', category: 'research-output', title: '浙江大学网络空间安全学院 · 学院简介', evidence: '学院介绍将 CCF-A 类论文、最佳/杰出论文奖、国际/国家专利、国内外标准、CVE 漏洞、开源项目与工具并列展示；官方数据为报批 CVE 漏洞 200 余项。', recognition: '网络空间安全学院科研产出', officialDomain: 'icsr.zju.edu.cn', officialUrl: 'https://icsr.zju.edu.cn/xygk/list.htm', verified: true, enabled: true, tags: ['CVE', '科研成果'], metric: '200+', metricLabel: 'CVE' },
  { id: 'fudan-cve', institution: '复旦大学系统软件与安全实验室', source: '复旦大学系统软件与安全实验室', category: 'research-output', title: 'VulGenie 相关研究成果官方介绍', evidence: '相关研究在 10 个流行 Java 应用中发现 46 个 0-day 漏洞，其中 10 个获得 CVE 编号，相关成果被 USENIX Security 2026 接收。', recognition: 'CVE 与国际顶级安全科研成果关联', officialDomain: 'secsys.fudan.edu.cn', officialUrl: 'https://secsys.fudan.edu.cn/', verified: true, enabled: true, tags: ['CVE', '科研成果'], metric: '46 / 10', metricLabel: '0-DAY / CVE' },
  { id: 'ucas-cve', institution: '中国科学院大学', source: '中国科学院大学 · 霍玮教师主页', category: 'research-output', title: '霍玮 · 中国科学院大学', evidence: '教师官方主页介绍 VARAS 平台挖掘零日漏洞 800 余个、获得 CVE 编号 400 余个；页面同时展示团队成员获得全国网络安全奖学金及国家奖学金等荣誉，属于同一科研团队背景说明。', recognition: '高水平漏洞研究科研成果', officialDomain: 'people.ucas.ac.cn', officialUrl: 'https://people.ucas.ac.cn/~huowei', verified: true, enabled: true, tags: ['CVE', '科研成果'], metric: '400+', metricLabel: 'CVE' },
  { id: 'whu-pending', institution: '武汉大学国家网络安全学院', source: '武汉大学国家网络安全学院', category: 'academic-innovation', title: 'CVE 进入学术创新成果评价体系', evidence: '待 whu.edu.cn 或 cse.whu.edu.cn 官方原页面核验；公开细则线索涉及 CNVD 漏洞证书、CVE 编号及 CVSS 高危等级。', recognition: '学术创新成果评价（待官方原页核验）', officialDomain: 'whu.edu.cn', verified: false, enabled: false, tags: ['CVE', '高校评审'] },
  { id: 'cnnvd-award', institution: '四川商务职业学院', source: '四川商务职业学院', category: 'official-platform', title: '学生获 2025 年 CNNVD 一级贡献奖', evidence: '高职学生 CNNVD 正式奖励案例。', recognition: '公开奖励案例', officialDomain: 'scsw.edu.cn', officialUrl: 'https://www.scsw.edu.cn/xxjsx/info/1381/5471.htm', verified: true, enabled: true, tags: ['CNNVD'] },
  { id: 'jsit-case', institution: '江苏信息职业技术学院', source: '江苏信息职业技术学院', category: 'scholarship-case', title: '2024 年度苏信十大人物', evidence: '公开案例同时展示 CNNVD 漏洞成果、综合测评与国家奖学金荣誉。', recognition: '公开学生成果案例', officialDomain: 'jsit.edu.cn', officialUrl: 'https://www.jsit.edu.cn/bgs/info/1011/2017.htm', verified: true, enabled: true, tags: ['CNNVD', '国奖案例'] },
] as const;

export const verifiedEvidenceCount = evidenceIndex.filter(item => item.enabled && item.verified).length;

