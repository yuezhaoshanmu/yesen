import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { evidenceIndex } from '../data/evidence-index';

test('homepage mounts authority evidence directly after hero', () => {
  const source = readFileSync('app/page.tsx', 'utf8');
  assert.match(source, /<HeroScene\s*\/><?EvidenceIndex\s*\/>/);
});

test('enabled evidence links use official allowlisted domains', () => {
  const allowed = [/\.edu\.cn$/i, /\.ac\.cn$/i, /^cnvd\.org\.cn$/i, /^cnnvd\.org\.cn$/i, /^cve\.org$/i];
  for (const item of evidenceIndex.filter(item => item.enabled && item.verified)) {
    assert.ok(item.officialUrl, `${item.id} needs an official URL`);
    const url = new URL(item.officialUrl!);
    assert.equal(url.protocol, 'https:', item.id);
    assert.ok(allowed.some(pattern => pattern.test(url.hostname.replace(/^www\./, ''))), `${item.id} has a non-official host`);
  }
});

test('pending Wuhan University evidence stays hidden', () => {
  const item = evidenceIndex.find(item => item.id === 'whu-pending');
  assert.equal(item?.verified, false);
  assert.equal(item?.enabled, false);
});
