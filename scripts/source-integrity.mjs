import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { inflateRawSync } from 'node:zlib';

const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
// Read the ZIP central directory: includes embedded images that DOCX prose omits.
function mediaInDocx(file) {
  const bytes = fs.readFileSync(file), media = new Map();
  for (let p = 0; p < bytes.length - 46; p++) {
    if (bytes.readUInt32LE(p) !== 0x02014b50) continue;
    const size = bytes.readUInt32LE(p + 20), len = bytes.readUInt16LE(p + 28);
    const name = bytes.subarray(p + 46, p + 46 + len).toString('utf8');
    if (!name.startsWith('word/media/')) continue;
    const offset = bytes.readUInt32LE(p + 42);
    const start = offset + 30 + bytes.readUInt16LE(offset + 26) + bytes.readUInt16LE(offset + 28);
    const data = bytes.subarray(start, start + size), method = bytes.readUInt16LE(p + 10);
    if (method !== 0 && method !== 8) throw new Error(`Unsupported DOCX compression: ${name}`);
    media.set(name, method === 8 ? inflateRawSync(data) : data);
  }
  return media;
}

export function auditSources(achievements, evidence, check) {
  const manifest = JSON.parse(fs.readFileSync('data/achievement-sources.json', 'utf8'));
  const ignored = new Set(['node_modules', '.git', 'research', 'qa', 'public', 'output', 'out']);
  const raw = [];
  function scan(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, entry.name);
      if (entry.isDirectory()) { if (!ignored.has(entry.name) && !entry.name.startsWith('.next')) scan(file); }
      else if (/\.(docx|pdf|png|jpe?g)$/i.test(entry.name)) raw.push(file.replaceAll('\\', '/').replace(/^\.\//, ''));
    }
  }
  scan('.');
  for (const file of raw) check(manifest.some(s => s.file === file && !s.member), `Unreviewed raw proof: ${file}. Classify it in achievement-sources.json.`);
  const docs = new Map();
  for (const file of raw.filter(f => f.endsWith('.docx'))) {
    const media = mediaInDocx(file); docs.set(file, media);
    for (const member of media.keys()) check(manifest.some(s => s.file === file && s.member === member), `Unreviewed DOCX proof: ${file} / ${member}`);
  }
  for (const source of manifest) {
    check(fs.existsSync(source.file), `Raw source missing: ${source.file}`);
    if (!fs.existsSync(source.file)) continue;
    const bytes = source.member ? docs.get(source.file)?.get(source.member) : fs.readFileSync(source.file);
    check(!!bytes && digest(bytes) === source.sha256, `Raw source changed; re-audit: ${source.file} ${source.member || ''}`);
    for (const id of source.achievementIds) check(achievements.some(a => a.id === id), `Proof has no achievement: ${source.file} / ${id}`);
    if (source.evidenceId) check(evidence.some(e => e.id === source.evidenceId), `Missing evidence ${source.evidenceId}`);
  }
  const sourceIds = new Set(manifest.flatMap(s => s.achievementIds));
  check(achievements.every(a => sourceIds.has(a.id)), 'An achievement has no audited raw source');
  check(sourceIds.size === achievements.length, 'Raw source count differs from achievement count');
  const originals = fs.readdirSync('public/evidence/originals');
  for (const file of originals) check(evidence.some(e => path.basename(e.original) === file), `Archived proof has no record: ${file}`);
  return manifest.length;
}
