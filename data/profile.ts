export const profile = {
  name: '叶森',
  romanizedName: 'YESEN',
  school: '江西科技职业学院',
  schoolSource: 'CNVD-YCGW-202605069184.pdf：贡献者单位',
  disciplines: ['CYBERSECURITY', 'FULL STACK', 'INNOVATION'],
  year: 2026,
  academic: {
    value: 99.34, label: '学年加权平均分', status: 'self-reported',
    note: '本人提供，成绩单待补充',
    todo: 'TODO：补充成绩单、统计学年及加权计算依据。',
  },
  volunteer: {
    value: 137, label: '志愿服务时长', status: 'self-reported',
    note: '本人提供，服务时长证明待补充',
    todo: 'TODO：补充志愿服务平台时长记录与统计时间范围。',
  },
  edusrc: { rank: 24, month: '2026 年 5 月', label: 'EDUSRC 全国月度白帽榜', evidenceId: 'edusrc' },
  todos: [
    'TODO：专业、入学时间与具体学年未见材料，不展示猜测值。',
    'TODO：CVE 官方署名为 Missa (VulDB User)；汇总文档自述为本人，尚缺账号与实名关联的独立材料。',
    'TODO：两份高校漏洞报送证书仅有兑换订单，不能表述为已获证书。',
  ],
} as const;
