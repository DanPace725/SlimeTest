import assert from 'node:assert/strict';
import { computeMovement, evaluateResidualEffects } from '../src/systems/movement.js';

const movementConfig = {
  moveCostPerSecond: 0.5,
  depositPerSec: 2
};

const residualConfig = {
  residualCapPerTick: 3,
  residualGainPerSec: 4,
  trailCooldownTicks: 5,
  ownTrailPenalty: 1,
  ownTrailGraceAge: 2
};

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

await test('computeMovement clamps position and creates deposits', () => {
  const result = computeMovement({
    position: { x: 10, y: 10 },
    velocity: { vx: 20, vy: 0 },
    dt: 0.5,
    size: 4,
    canvasWidth: 30,
    canvasHeight: 30,
    moveCostPerSecond: movementConfig.moveCostPerSecond,
    depositPerSec: movementConfig.depositPerSec,
    chi: 10,
    agentId: 1
  });

  assert.ok(result.position.x <= 28); // clamped near edge
  assert.equal(result.deposits.length, 5);
  assert.ok(result.chiCost > 0);
});

await test('evaluateResidualEffects returns gains and penalties', () => {
  const gain = evaluateResidualEffects({
    movedDist: 1,
    sample: { value: 4, authorId: 2, age: 6 },
    dt: 0.25,
    config: residualConfig,
    agentId: 1
  });

  assert.ok(gain.chiGain > 0);
  assert.equal(gain.creditAuthorId, 2);

  const penalty = evaluateResidualEffects({
    movedDist: 1,
    sample: { value: 1, authorId: 1, age: 0 },
    dt: 0.5,
    config: residualConfig,
    agentId: 1
  });

  assert.ok(penalty.chiPenalty > 0);
});
