import assert from 'node:assert/strict';
import test from 'node:test';
import { createParticleConfig, degradeParticleConfig, spherePoint } from '../components/effects/ParticleConfig';

test('particle budgets respect phones, weak CPUs, data saver, DPR and motion preferences', () => {
  const device = { width: 1440, dpr: 3, cores: 8, memory: 8, reduced: false };
  const desktop = createParticleConfig(device);
  assert(desktop.count >= 60 && desktop.count <= 120);
  assert.equal(desktop.dpr, 1.5);
  const mobile = createParticleConfig({ ...device, width: 390 });
  assert(mobile.count >= 20 && mobile.count <= 50);
  assert.equal(mobile.pointerRadius, 0);
  for (const limited of [{ cores: 2 }, { memory: 2 }, { saveData: true }]) {
    const config = createParticleConfig({ ...device, ...limited });
    assert.equal(config.tier, 'low');
    assert(config.count <= 24 && config.fps <= 18 && config.dpr <= 1);
  }
  assert(createParticleConfig({ ...device, reduced: true }).count <= 24);
  const slow = degradeParticleConfig(desktop);
  assert(slow.count < desktop.count && slow.fps < desktop.fps);
  assert.equal(slow.pointerRadius, 0);
});

test('CVE projection preserves a bounded sphere across rotation and quality levels', () => {
  for (const count of [16, 24, 48, 64]) for (let i = 0; i < count; i++) {
    const a = spherePoint(i, count, 0), b = spherePoint(i, count, Math.PI / 2);
    assert(Math.abs(Math.hypot(a.x, a.y, a.z) - 1) < 1e-10);
    assert(Math.abs(Math.hypot(b.x, b.y, b.z) - 1) < 1e-10);
    assert.equal(a.y, b.y);
  }
});
