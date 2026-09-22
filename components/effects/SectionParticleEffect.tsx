export type SectionEffect = 'aggregation' | 'security' | 'globe' | 'credential';

/** Layout anchor only. Every section is rendered by the same global Canvas. */
export default function SectionParticleEffect({ kind }: { kind: SectionEffect }) {
  return <div className={`section-particle-anchor particle-${kind}`} data-particle-effect={kind} aria-hidden="true">
    {kind === 'security' && <span className="particle-caption">SECURITY NETWORK <i /> CNNVD / CNVD</span>}
    {kind === 'globe' && <span className="particle-caption">GLOBAL VULNERABILITY NETWORK</span>}
  </div>;
}
