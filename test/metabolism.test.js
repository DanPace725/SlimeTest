import assert from 'node:assert/strict';
import { computeMetabolicCost } from '../src/systems/metabolism.js';

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

await test('computeMetabolicCost clamps negative inputs', () => {
  const result = computeMetabolicCost({ baseRate: -1, dt: -2 });
  assert.equal(result, 0);
});

await test('computeMetabolicCost scales with dt', () => {
  const result = computeMetabolicCost({ baseRate: 0.5, dt: 0.2 });
  assert.equal(result, 0.1);
});
