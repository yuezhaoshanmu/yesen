export const profile = {
  name: '叶森',
  romanizedName: 'YESEN',
  school: '江西科技职业学院',
  schoolSource: 'CNVD-YCGW-202605069184.pdf：贡献者单位',
  disciplines: ['CYBERSECURITY', 'FULL STACK', 'INNOVATION'],
  year: 2026,
  academic: {
    value: 99.34, label: '学年加权平均分', status: 'self-reported',
    note: '本人提供',
  },
  volunteer: {
    value: 137, label: '志愿服务时长', status: 'self-reported',
    note: '本人提供',
  },
  edusrc: { rank: 24, month: '2026 年 5 月', label: 'EDUSRC 全国月度白帽榜', evidenceId: 'edusrc' },
} as const;
