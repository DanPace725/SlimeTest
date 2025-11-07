import assert from 'node:assert/strict';
import { computeSteering } from '../src/systems/steering.js';

const baseConfig = {
  autoMove: true,
  aiTurnRateBase: 1,
  aiTurnRateGain: 0.5,
  hungerSurgeAmp: 1.2,
  aiSurgeMax: 0.3,
  moveSpeedPxPerSec: 100
};

const createBundle = (overrides = {}) => ({
  id: 2,
  _lastDirX: 1,
  _lastDirY: 0,
  vx: 0,
  vy: 0,
  frustration: 0,
  hunger: 0,
  computeAIDirection: () => ({ dx: 1, dy: 0 }),
  ...overrides
});

const test = async (name, fn) => {
  try {
    await fn();
    console.log(`✔ ${name}`);
  } catch (error) {
    console.error(`✖ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
};

await test('computeSteering follows heuristic direction under auto move', () => {
  const bundle = createBundle();
  const result = computeSteering({
    bundle,
    dt: 0.1,
    resource: null,
    config: baseConfig,
    held: new Set()
  });

  assert.ok(result.vx > 0);
  assert.equal(result.lastDirX, 1);
  assert.equal(result.lastDirY, 0);
});

await test('computeSteering respects manual input', () => {
  const bundle = createBundle({ id: 1 });
  const held = new Set(['arrowup']);
  const result = computeSteering({
    bundle,
    dt: 0.1,
    resource: null,
    config: { ...baseConfig, autoMove: false },
    held
  });

  assert.ok(result.lastDirY < 0);
});
