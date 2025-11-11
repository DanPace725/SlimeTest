import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runGenomeFixtureCase } from './helpers/genomeHarness.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturePath = path.resolve(__dirname, '../analysis/fixtures/genome-runtime-hashes.json');

const loadFixtures = (targetPath) => {
  const contents = fs.readFileSync(targetPath, 'utf8');
  const parsed = JSON.parse(contents);
  if (!parsed || !Array.isArray(parsed.cases)) {
    throw new Error('Genome fixture file is missing the cases array.');
  }
  return parsed.cases;
};

const fixtures = loadFixtures(fixturePath);
let failures = 0;

for (const testCase of fixtures) {
  try {
    const hashes = runGenomeFixtureCase(testCase, { enabled: false });
    if (!Array.isArray(testCase.hashes) || hashes.length !== testCase.hashes.length) {
      throw new Error(
        `Fixture hash count mismatch for ${testCase.label}: expected ${testCase.hashes?.length ?? 'unknown'}, got ${hashes.length}`
      );
    }
    for (let i = 0; i < hashes.length; i++) {
      if (hashes[i] !== testCase.hashes[i]) {
        throw new Error(`Hash mismatch at step ${i}: expected ${testCase.hashes[i]}, got ${hashes[i]}`);
      }
    }
    console.log(`TC disabled genome case '${testCase.label}' passed (${hashes.length} steps).`);
  } catch (err) {
    failures += 1;
    console.error(`TC disabled genome case '${testCase.label}' failed:`, err.message);
  }
}

if (failures > 0) {
  console.error(`TC disabled genome regression tests failed (${failures} cases).`);
  process.exit(1);
}

console.log('TC disabled genome regression tests passed.');
