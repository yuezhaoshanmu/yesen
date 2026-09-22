import assert from 'node:assert/strict';
import test from 'node:test';
import { achievements, achievementById, achievementYears, filterAchievements, levelCounts, sortAchievements } from '../data/achievements';
import { dateText, dateParts, dateStamp } from '../data/achievement-dates';
import { evidence } from '../data/evidence';
import { existsSync } from 'node:fs';
import path from 'node:path';
import sources from '../data/achievement-sources.json';
import { achievementGroups, cveAchievements, nationalAchievements, journey } from '../data/achievements';

test('every original proof reaches the overview, technical views and timeline exactly once', () => {
  const ids = achievements.map(a => a.id).sort();
  assert.equal(new Set(ids).size, ids.length, 'Duplicate achievement ID');
  assert.deepEqual([...new Set(sources.flatMap(s => s.achievementIds))].sort(), ids, 'Original proof omitted');
  assert.deepEqual(achievementGroups.flatMap(g => g.items.map(a => a.id)).sort(), ids, 'Overview omitted/duplicated a proof');
  assert.deepEqual(journey.map(a => a.evidenceId).sort(), ids);
  assert.deepEqual(cveAchievements.map(a => a.id).sort(), achievements.filter(a => a.evidence.category === '国际漏洞').map(a => a.id).sort());
  assert.deepEqual(nationalAchievements.map(a => a.id).sort(), achievements.filter(a => a.level === 'national').map(a => a.id).sort());
  for (const a of achievements) {
    for (const key of ['id', 'title', 'level', 'date', 'evidence', 'evidencePath', 'description'] as const) assert.ok(a[key], `${a.id}: ${key}`);
    assert.ok(existsSync(path.join(process.cwd(), 'public', a.evidencePath)), `${a.id}: missing certificate`);
  }
  for (const cve of cveAchievements) {
    assert.ok(cve.score > 0 && cve.score <= 10);
    assert.equal(cve.reporter, 'Missa (VulDB User)');
    assert.equal(cve.officialUrl, `https://www.cve.org/CVERecord?id=${cve.number}`);
  }
  assert.equal(achievementById['cnvd-20312'].evidence.certificateNumber, 'CNVD-YCGW-202605069881');
  assert.match(achievementById['challenge-care'].description, /颐护家——社区居家老年上门护理服务/);
  assert.match(achievementById['challenge-security'].description, /“安帼”女性数字安全守护平台/);
});

// Independently transcribed from the original files; see docs/ACHIEVEMENT_DATE_AUDIT.md.
const verifiedDates: Record<string, string> = {
  google: '2026-04-08', pku: '2026-04-23', edusrc: '2026-05',
  'cnnvd-18260050': '2026-09-03', 'cnvd-20319': '2026-05-02', 'cnvd-20312': '2026-05-02', 'cnvd-30548': '2026-07-28',
  'cve-10292': '2026-06-01', 'cve-10293': '2026-06-01', 'cve-87924': '2026-09-09', 'cve-87925': '2026-09-09',
  raicom: '2026-07-28', 'challenge-care': '2026-04', 'challenge-security': '2026-04', social: '2025', training: '2025-05-27',
};

test('all awarded records match verified source precision and have auditable classifications', () => {
  assert.equal(achievements.length, Object.keys(verifiedDates).length);
  assert.deepEqual(achievements.map(a => a.id).sort(), evidence.filter(e => e.status === 'documented').map(e => e.id).sort());
  for (const item of achievements) {
    assert.equal(item.date, verifiedDates[item.id], item.id);
    assert.equal(item.evidence.date, item.date);
    assert.ok(item.dateEvidence && item.levelEvidence && item.significance && item.organization && item.certificate, item.id);
  }
  assert.deepEqual(levelCounts, { international: 5, national: 4, 'national-ranking': 1, provincial: 2, school: 3, other: 1 });
  assert.deepEqual(achievementYears, [2026, 2025]);
  assert.equal(achievementById['edusrc-pending'], undefined);
});

test('partial dates never fabricate months or days', () => {
  assert.equal(dateText(null), '');
  assert.equal(dateStamp(null), '');
  assert.deepEqual(dateParts(null), { year: null, month: null, day: null });
  assert.deepEqual(dateParts('2025'), { year: 2025, month: null, day: null });
  assert.equal(dateText('2025', true), '2025年');
  assert.equal(dateText('2026-04', true), '2026年4月');
  assert.equal(dateText('2026-04-08'), '2026年4月');
  assert.equal(dateText('2026-04-08', true), '2026年4月8日');
  assert.equal(dateStamp('2026-04-08'), '2026.04');
  assert.equal(achievementById.social.month, null);
  assert.equal(achievementById['challenge-care'].day, null);
  assert.deepEqual(achievementById.social.relatedDates, [{ label: '校方报道时间', date: '2025-12-23' }]);
  assert.equal(achievementById['cnnvd-18260050'].dateLabel, '证明出具时间');
  assert.deepEqual(achievementById['cnnvd-18260050'].relatedDates, [{ label: '漏洞提交时间', date: '2026-08-25' }]);
});

test('filters keep professional ranking and online coursework out of administrative award levels', () => {
  const ids = (filter: Parameters<typeof filterAchievements>[0], year: number | null = null) => filterAchievements(filter, year).map(a => a.id);
  assert.deepEqual(ids('international'), ['cve-87924', 'cve-87925', 'cve-10292', 'cve-10293', 'google']);
  assert.deepEqual(ids('national'), ['cnnvd-18260050', 'cnvd-30548', 'cnvd-20319', 'cnvd-20312']);
  assert.deepEqual(ids('provincial'), ['raicom', 'social']);
  assert.deepEqual(ids('school'), ['challenge-care', 'challenge-security', 'training']);
  assert.deepEqual(ids('competition'), ['raicom', 'challenge-care', 'challenge-security']);
  assert.deepEqual(ids('social-practice'), ['social']);
  assert.equal(ids('technology').length, 9);
  assert.ok(ids('technology').includes('edusrc'));
  assert.deepEqual(ids('all', 2025), ['social', 'training']);
  assert.deepEqual(ids('international', 2025), []);
});

test('unknown dates sort last within a level and cannot be assigned to a year', () => {
  const unknown = { ...achievementById.google, id: 'no-date', date: null, year: null, month: null, day: null };
  assert.equal(sortAchievements([unknown, achievementById.google]).at(-1)?.id, 'no-date');
});
