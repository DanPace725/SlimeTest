import assert from 'node:assert/strict';
import { computeSensingUpdate } from '../src/core/sensing.js';

const baseConfig = {
  aiSensoryRangeBase: 120,
  aiSensoryRangeMax: 300,
  aiSenseBiasFromFrustr: 0.8,
  aiSenseSlewPerSec: 40,
  aiSenseRangePerChi: 20,
  hungerSenseAmp: 1.5
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

await test('computeSensingUpdate returns base range when sensing disabled', () => {
  const result = computeSensingUpdate({
    extendedSensing: false,
    alive: true,
    frustration: 0.5,
    hunger: 0.5,
    currentSensoryRange: 120,
    targetSensoryRange: 120,
    chi: 5
  }, 0.1, baseConfig);

  assert.equal(result.targetRange, baseConfig.aiSensoryRangeBase);
  assert.equal(result.currentSensoryRange, baseConfig.aiSensoryRangeBase);
  assert.equal(result.cost, 0);
});

await test('computeSensingUpdate expands range when frustrated and hungry', () => {
  const result = computeSensingUpdate({
    extendedSensing: true,
    alive: true,
    frustration: 1,
    hunger: 1,
    currentSensoryRange: 120,
    targetSensoryRange: 120,
    chi: 10
  }, 0.1, baseConfig);

  assert.ok(result.currentSensoryRange > 120);
  assert.ok(result.cost > 0);
  assert.ok(result.targetRange >= result.currentSensoryRange);
});
