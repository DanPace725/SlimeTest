import { createHash } from 'node:crypto';
import { TcScheduler, TcStorage } from '../../src/runtime/tcStorage.js';
import { registerAgentGenomeStepper } from '../../tc/tcGenomeRuntime.js';

const ensureNumber = (value, fallback = 0) => (typeof value === 'number' ? value : fallback);

const buildInterpretationBias = (bias = {}) => ({
  distress: ensureNumber(bias.distress, 0),
  bond: ensureNumber(bias.bond, 0)
});

const buildBundle = (spec = {}) => ({
  alive: spec.alive !== undefined ? Boolean(spec.alive) : true,
  hunger: ensureNumber(spec.hunger, 0),
  chi: ensureNumber(spec.chi, 0),
  interpretation_bias: buildInterpretationBias(spec.interpretation_bias)
});

const hashManifest = (snapshot, bundle) => {
  const manifest = {
    snapshot,
    bias: { ...bundle.interpretation_bias }
  };
  const serialized = JSON.stringify(manifest);
  return createHash('sha256').update(serialized, 'utf8').digest('hex');
};

export const runGenomeFixtureCase = (testCase, options = {}) => {
  const { enabled = true } = options;
  TcScheduler.reset();
  TcStorage.clear();
  TcScheduler.configure({ enabled, baseSeed: testCase.seed ?? 0 });

  const bundle = buildBundle(testCase.bundle || {});
  const prefix = `genome.${testCase.label}`;
  const { stepper, unsubscribe } = registerAgentGenomeStepper({
    bundle,
    program: testCase.program,
    stateKey: `${prefix}.state`,
    bufferKey: `${prefix}.buffer`,
    programKey: `${prefix}.program`
  });

  const hashes = [];
  for (let tick = 0; tick < (testCase.steps || 0); tick++) {
    const context = TcScheduler.beginTick({ tick, dt: 1, bundle });
    TcScheduler.runPhase('capture', context);
    TcScheduler.runPhase('compute', context);
    TcScheduler.runPhase('commit', context);
    TcScheduler.endTick(context);
    const snapshot = stepper.buildSnapshot(tick);
    hashes.push(hashManifest(snapshot, bundle));
  }

  unsubscribe();
  TcScheduler.configure({ enabled: false });
  return hashes;
};
