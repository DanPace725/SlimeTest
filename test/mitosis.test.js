import assert from 'node:assert/strict';
import { evaluateMitosisReadiness } from '../src/systems/mitosis.js';
import { computeBaselineMitosisProbability } from '../src/systems/mitosisController.js';

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

await test('baseline mitosis probability responds to signals', () => {
  const config = {
    aiSensoryRangeBase: 200,
    mitosis: {
      threshold: 100,
      cost: 50,
      maxAliveAgents: 50,
      baseline: {
        threshold: 0.5,
        weights: {
          capacity: 1,
          strain: 1,
          pressure: 1,
          opportunity: 1,
          harmony: 1
        },
        pressureRadius: 120,
        pressureMaxNeighbors: 4,
        opportunityRadius: 160,
        opportunityMaxResources: 2
      }
    }
  };

  const bundle = {
    x: 0,
    y: 0,
    chi: 150,
    size: 40,
    hunger: 0,
    frustration: 0,
    currentSensoryRange: 160,
    signalContext: {
      resource: { amplitude: 0.6 },
      distress: { amplitude: 0.2 },
      bond: { amplitude: 0.4 }
    }
  };

  const world = {
    resourcePressure: 0.1,
    bundles: [bundle],
    resources: [
      { x: 50, y: 0, visible: true, depleted: false },
      { x: 300, y: 0, visible: true, depleted: false }
    ]
  };

  const healthy = computeBaselineMitosisProbability({ bundle, world, config });
  assert.ok(healthy.probability > 0.5, 'healthy state should favor mitosis');

  const stressedBundle = {
    ...bundle,
    hunger: 0.9,
    frustration: 0.8,
    chi: 40
  };
  const crowdedWorld = {
    ...world,
    resourcePressure: 0.8,
    bundles: [
      stressedBundle,
      { x: 10, y: 0, alive: true },
      { x: 20, y: 0, alive: true },
      { x: 30, y: 0, alive: true },
      { x: 40, y: 0, alive: true }
    ],
    resources: []
  };

  const stressed = computeBaselineMitosisProbability({
    bundle: stressedBundle,
    world: crowdedWorld,
    config
  });

  assert.ok(stressed.probability < healthy.probability, 'stress and pressure should reduce probability');
});
