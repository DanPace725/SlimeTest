import assert from 'node:assert/strict';
import { evaluateDecayTransition } from '../src/systems/decay.js';

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

await test('evaluateDecayTransition handles continued life', () => {
  const result = evaluateDecayTransition({
    chi: 10,
    chiSpend: 3,
    alive: true,
    tick: 5,
    deathTick: -1,
    chiAtDeath: 0
  });

  assert.equal(result.chi, 7);
  assert.equal(result.alive, true);
  assert.equal(result.shouldProvokeBondedExploration, false);
});

await test('evaluateDecayTransition detects death event', () => {
  const result = evaluateDecayTransition({
    chi: 2,
    chiSpend: 5,
    alive: true,
    tick: 10,
    deathTick: -1,
    chiAtDeath: 4
  });

  assert.equal(result.chi, 0);
  assert.equal(result.alive, false);
  assert.equal(result.deathTick, 10);
  assert.equal(result.chiAtDeath, 0);
  assert.equal(result.shouldProvokeBondedExploration, true);
});
