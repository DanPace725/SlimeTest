import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { TcScheduler, TcStorage } from '../src/runtime/tcStorage.js';
import { registerRule110Stepper } from '../tc/tcRule110.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, '../analysis/fixtures/rule110-hashes.json');

const encodeCells = (cells) => {
  let binary = '';
  for (let i = 0; i < cells.length; i++) {
    binary += cells[i] ? '1' : '0';
  }
  return binary;
};

const computeHash = (cells) => {
  const binary = encodeCells(cells);
  return createHash('sha256').update(binary, 'utf8').digest('hex');
};

const loadFixture = (filePath) => {
  const data = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(data);
  if (!parsed || !Array.isArray(parsed.cases)) {
    throw new Error('Invalid fixture: missing cases array');
  }
  return parsed.cases;
};

const runCase = (testCase) => {
  const { label, initializer, width, steps, initializerOptions = {} } = testCase;
  TcScheduler.reset();
  TcStorage.clear();
  TcScheduler.configure({ enabled: true, baseSeed: 0 });
  const stateKey = `test.${label}.state`;
  const bufferKey = `test.${label}.next`;
  const { stepper, unsubscribe } = registerRule110Stepper({
    width,
    initializer,
    initializerOptions,
    stateKey,
    bufferKey
  });

  const hashes = [];
  for (let tick = 0; tick < steps; tick++) {
    const context = TcScheduler.beginTick({ tick, dt: 1 });
    TcScheduler.runPhase('capture', context);
    TcScheduler.runPhase('compute', context);
    TcScheduler.runPhase('commit', context);
    TcScheduler.endTick(context);
    const cells = Uint8Array.from(stepper.getState());
    hashes.push(computeHash(cells));
  }
  unsubscribe();
  TcScheduler.configure({ enabled: false });
  return hashes;
};

const fixtures = loadFixture(fixturePath);
let failures = 0;

for (const testCase of fixtures) {
  try {
    const hashes = runCase(testCase);
    const expected = testCase.hashes;
    if (!Array.isArray(expected) || expected.length !== hashes.length) {
      throw new Error(`Fixture mismatch for ${testCase.label}: expected ${expected?.length ?? 'unknown'} hashes, received ${hashes.length}`);
    }
    for (let i = 0; i < hashes.length; i++) {
      if (hashes[i] !== expected[i]) {
        throw new Error(`Hash mismatch for ${testCase.label} at step ${i}: expected ${expected[i]}, got ${hashes[i]}`);
      }
    }
    console.log(`Rule110 case '${testCase.label}' passed (${hashes.length} steps).`);
  } catch (err) {
    failures += 1;
    console.error(`Rule110 case '${testCase.label}' failed:`, err.message);
  }
}

if (failures > 0) {
  console.error(`Rule110 determinism tests failed (${failures} cases).`);
  process.exit(1);
}

console.log('Rule110 determinism tests passed.');
