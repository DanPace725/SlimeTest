import { createHash } from 'node:crypto';
import { TcChunkStorage, TcScheduler, createHeadlessEmitter } from '../src/runtime/tcStorage.js';

function hashLines(lines) {
  const hash = createHash('sha256');
  for (const line of lines) {
    hash.update(String(line));
    hash.update('\n');
  }
  return hash.digest('hex');
}

async function runBlink(seed) {
  TcScheduler.reset();
  TcScheduler.configure({ enabled: true, baseSeed: seed, tickSalt: 0xa341316c });

  const emitter = createHeadlessEmitter();
  const pending = [];
  const commits = [];

  const storage = new TcChunkStorage({
    maxChunks: 2,
    loadChunk: (key) => {
      if (key === 'blink') return [1, 0, 1];
      return [0];
    },
    saveChunk: (key, data) => {
      commits.push({ key, data: Array.isArray(data) ? [...data] : data });
    },
    onEvict: (key) => {
      commits.push({ evicted: key });
    }
  });

  const unsubscribe = TcScheduler.registerHooks({
    capture(ctx) {
      const cells = storage.getChunk('blink');
      pending.push(
        emitter.writeSnapshot({
          type: 'tc.rule110.snapshot',
          tick: ctx.tick,
          width: cells.length,
          cells: Array.from(cells)
        })
      );
    },
    compute(ctx) {
      const cells = storage.getChunk('blink');
      for (let i = 0; i < cells.length; i++) {
        cells[i] = cells[i] ? 0 : 1;
      }
      storage.markDirty('blink');
      if (ctx.tick % 2 === 0) {
        storage.setChunk(`filler-${ctx.tick}`, [ctx.tick & 1], { dirty: true });
      }
    },
    commit(ctx) {
      storage.flush();
      pending.push(
        emitter.writeManifest({
          type: 'tc.rule110.snapshot',
          tick: ctx.tick,
          width: storage.getChunk('blink').length,
          commits: commits.length
        })
      );
    }
  });

  for (let tick = 0; tick < 4; tick++) {
    const context = TcScheduler.beginTick({ tick, dt: 1, mode: 'test', world: null });
    TcScheduler.runPhase('capture', context);
    TcScheduler.runPhase('compute', context);
    TcScheduler.runPhase('commit', context);
    TcScheduler.endTick(context);
  }

  unsubscribe();
  await Promise.all(pending);
  TcScheduler.configure({ enabled: false });

  const digest = hashLines([
    ...emitter.getSnapshotLines(),
    ...emitter.getManifestLines(),
    JSON.stringify(commits)
  ]);

  return { digest, commits };
}

const runA = await runBlink(42);
const runB = await runBlink(42);

if (runA.digest !== runB.digest) {
  console.error('Deterministic blink test failed.');
  console.error('Run A digest:', runA.digest);
  console.error('Run B digest:', runB.digest);
  process.exit(1);
}

console.log('Deterministic blink test hash:', runA.digest);
