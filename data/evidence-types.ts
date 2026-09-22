import type assets from './assets.json';
export type EvidenceCategory = '国家平台' | '国际漏洞' | '专业认证' | '竞赛荣誉' | '社会实践' | '安全实践';
export type Evidence = {
  id: keyof typeof assets; title: string; category: EvidenceCategory;
  issuer: string; date: string | null; dateLabel?: string; identifier?: string;
  level?: string; description: string; verificationUrl?: string;
  cvss?: { version: '4.0'; score: number; severity: 'HIGH' | 'MEDIUM' }; reporter?: string; technicalTitle?: string; certificateNumber?: string;
  note?: string; status: 'documented' | 'pending';
} & (typeof assets)[keyof typeof assets];
