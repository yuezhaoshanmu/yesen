#!/usr/bin/env node
/** Check enabled evidence URLs without affecting production rendering. */
import { evidenceIndex } from '../data/evidence-index';

const allowed = [/(^|\.)edu\.cn$/i, /(^|\.)ac\.cn$/i, /^cnvd\.org\.cn$/i, /^cnnvd\.org\.cn$/i, /^cve\.org$/i];
const isAllowed = (host: string) => allowed.some(pattern => pattern.test(host.replace(/^www\./i, '')));
const enabled = evidenceIndex.filter((item): item is typeof item & { officialUrl: string } => item.enabled && item.verified && Boolean(item.officialUrl));

async function main() {
  let failures = 0;
  for (const item of enabled) {
    try {
      const response = await fetch(item.officialUrl, { method: 'HEAD', redirect: 'follow' });
      const finalUrl = new URL(response.url || item.officialUrl);
      const ok = response.ok && finalUrl.protocol === 'https:' && isAllowed(finalUrl.hostname);
      if (!ok) { failures += 1; console.warn(`[evidence-links] warning ${item.id}: HTTP ${response.status}, final host ${finalUrl.hostname}`); }
      else console.log(`[evidence-links] ok ${item.id}: ${response.status} ${finalUrl.hostname}`);
    } catch (error) { failures += 1; console.warn(`[evidence-links] warning ${item.id}: ${error instanceof Error ? error.message : String(error)}`); }
  }
  if (failures) console.warn(`[evidence-links] ${failures} warning(s); production rendering is unchanged.`);
}
main();
