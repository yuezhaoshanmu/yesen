export type ParticleConfig = {
  tier: 'desktop' | 'tablet' | 'mobile' | 'low';
  count: number;
  fps: number;
  dpr: number;
  connectionDistance: number;
  maxConnections: number;
  packetLimit: number;
  pointerRadius: number;
  reduced: boolean;
};

export function createParticleConfig({ width, dpr, cores, memory, reduced, saveData = false }: {
  width: number; dpr: number; cores: number; memory?: number; reduced: boolean; saveData?: boolean;
}): ParticleConfig {
  const tier = cores <= 4 || (memory !== undefined && memory <= 4) || saveData ? 'low' : width < 600 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';
  const count = { desktop: 96, tablet: 60, mobile: 36, low: 24 }[tier];
  return {
    tier, count: reduced ? Math.min(count, 24) : count,
    fps: tier === 'low' ? 18 : tier === 'mobile' ? 24 : 30,
    dpr: Math.min(dpr, tier === 'low' ? 1 : 1.5),
    connectionDistance: tier === 'desktop' ? 156 : tier === 'tablet' ? 128 : 100,
    maxConnections: tier === 'desktop' ? 2 : 1,
    packetLimit: tier === 'desktop' ? 3 : 2,
    pointerRadius: width > 900 && tier !== 'low' ? 150 : 0,
    reduced,
  };
}

export function degradeParticleConfig(config: ParticleConfig): ParticleConfig {
  return { ...config, tier: 'low', count: Math.min(config.count, 24), fps: 18,
    dpr: 1, connectionDistance: 90, maxConnections: 1, packetLimit: 2, pointerRadius: 0 };
}

export type NetworkNode = { u: number; v: number; phase: number; size: number };
// Stable distribution: resizing or React remounts never produce a new random sky.
export function createNetworkNodes(count: number): NetworkNode[] {
  let seed = 240526;
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  return Array.from({ length: count }, (_, i) => ({ u: random(), v: random(), phase: random() * Math.PI * 2, size: i % 19 === 0 ? 2.4 : .65 + random() * .7 }));
}

export function spherePoint(index: number, count: number, angle: number) {
  const y = 1 - 2 * (index + .5) / count;
  const r = Math.sqrt(1 - y * y);
  const theta = index * Math.PI * (3 - Math.sqrt(5)) + angle;
  return { x: Math.cos(theta) * r, y, z: Math.sin(theta) * r };
}
