import assert from 'node:assert/strict';
import { evaluateMitosisReadiness } from '../src/systems/mitosis.js';

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

await test('evaluateMitosisReadiness calls provided predicates', () => {
  let budCalled = 0;
  let mitoCalled = 0;
  const result = evaluateMitosisReadiness({
    canBud: () => { budCalled += 1; return true; },
    canMitosis: () => { mitoCalled += 1; return false; }
  });

  assert.equal(budCalled, 1);
  assert.equal(mitoCalled, 1);
  assert.equal(result.buddingReady, true);
  assert.equal(result.mitosisReady, false);
});
