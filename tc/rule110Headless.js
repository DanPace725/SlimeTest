#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { TcScheduler, TcStorage } from '../tcStorage.js';
import { registerRule110Stepper } from './tcRule110.js';

const toNumber = (value, fallback = null) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const parseArgs = (argv) => {
  const options = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2);
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      options[key] = next;
      i += 1;
    } else {
      options[key] = true;
    }
  }
  return options;
};

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

const run = async () => {
  const args = parseArgs(process.argv.slice(2));
  const initializer = typeof args.initializer === 'string' ? args.initializer : 'ether';
  const width = toNumber(args.width, 128) || 128;
  const steps = toNumber(args.steps, 128) || 128;
  const baseSeed = toNumber(args.seedBase, 0) || 0;
  const initializerOptions = {};
  if (args.phase !== undefined) initializerOptions.phase = toNumber(args.phase, 0) ?? 0;
  if (args.offset !== undefined) initializerOptions.offset = toNumber(args.offset, 0) ?? 0;
  if (args.seed !== undefined) initializerOptions.seed = toNumber(args.seed, 0) ?? 0;
  if (args.density !== undefined) initializerOptions.density = toNumber(args.density, 0.5) ?? 0.5;

  const cwd = process.cwd();
  const defaultOutput = path.resolve(cwd, 'tc', 'rule110.ndjson');
  const outputPath = args.output ? path.resolve(cwd, args.output) : defaultOutput;
  await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });

  TcScheduler.reset();
  TcStorage.clear();
  TcScheduler.configure({ enabled: true, baseSeed });

  const { stepper, unsubscribe } = registerRule110Stepper({
    width,
    initializer,
    initializerOptions,
    stateKey: `headless.${initializer}.state`,
    bufferKey: `headless.${initializer}.buffer`
  });

  const lines = [];
  for (let tick = 0; tick < steps; tick++) {
    const context = TcScheduler.beginTick({ tick, dt: 1 });
    TcScheduler.runPhase('capture', context);
    TcScheduler.runPhase('compute', context);
    TcScheduler.runPhase('commit', context);
    TcScheduler.endTick(context);
    const cells = Uint8Array.from(stepper.getState());
    const hash = computeHash(cells);
    const entry = {
      tick,
      hash,
      width,
      initializer,
      options: { ...initializerOptions },
      origin: stepper.origin || null,
      metadata: stepper.metadata
    };
    lines.push(JSON.stringify(entry));
  }

  unsubscribe();
  TcScheduler.configure({ enabled: false });

  await fs.promises.writeFile(outputPath, `${lines.join('\n')}\n`, 'utf8');
  console.log(`Rule110 headless run wrote ${steps} hashes to ${outputPath}`);
};

run().catch((err) => {
  console.error('Rule110 headless run failed:', err);
  process.exit(1);
});
