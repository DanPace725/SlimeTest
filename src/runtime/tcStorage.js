const DEFAULT_MAX_CHUNKS = 32;

const PHASE_ORDER = ['capture', 'compute', 'commit'];

const toUint32 = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return (value >>> 0);
  }
  if (typeof value === 'bigint') {
    return Number(value & 0xffffffffn);
  }
  if (typeof value === 'string') {
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
    }
    return hash >>> 0;
  }
  return 0;
};

const mixSeed = (base, label = 0) => {
  let seed = toUint32(base);
  const salt = toUint32(label);
  seed ^= salt + 0x9e3779b9 + ((seed << 6) >>> 0) + (seed >>> 2);
  return seed >>> 0;
};

const createMulberry32 = (seedValue) => {
  let a = (seedValue || 0) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    const result = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    return result;
  };
};

const defaultRandomSource = () => Math.random();

const TcRandom = (() => {
  let generator = defaultRandomSource;
  let currentSeed = null;
  const stack = [];

  const ensureNumber = (value) => toUint32(value || 0);

  return Object.freeze({
    random() {
      return Number(generator());
    },

    seed(seedValue) {
      const normalized = ensureNumber(seedValue);
      generator = createMulberry32(normalized);
      currentSeed = normalized;
      return normalized;
    },

    pushSeed(seedValue) {
      stack.push({ generator, seed: currentSeed });
      this.seed(seedValue);
      return currentSeed;
    },

    popSeed() {
      const prev = stack.pop();
      if (prev) {
        generator = prev.generator;
        currentSeed = prev.seed;
      } else {
        this.reset();
      }
      return currentSeed;
    },

    useGenerator(customGenerator, seed = null) {
      if (typeof customGenerator === 'function') {
        generator = () => Number(customGenerator());
        currentSeed = seed === null ? currentSeed : ensureNumber(seed);
      }
    },

    reset() {
      generator = defaultRandomSource;
      currentSeed = null;
      stack.length = 0;
    },

    runWithSeed(seedValue, fn) {
      this.pushSeed(seedValue);
      try {
        return fn(this.random.bind(this));
      } finally {
        this.popSeed();
      }
    },

    fork(label) {
      const base = currentSeed === null ? toUint32(Date.now()) : currentSeed;
      return createMulberry32(mixSeed(base, label));
    },

    getState() {
      return { seed: currentSeed, depth: stack.length };
    },

    isDeterministic() {
      return currentSeed !== null;
    }
  });
})();

class TcChunkStorage {
  constructor(options = {}) {
    this.maxChunks = Math.max(1, options.maxChunks || DEFAULT_MAX_CHUNKS);
    this.loadChunk = typeof options.loadChunk === 'function' ? options.loadChunk : null;
    this.saveChunk = typeof options.saveChunk === 'function' ? options.saveChunk : null;
    this.onEvict = typeof options.onEvict === 'function' ? options.onEvict : null;
    this.cache = new Map();
    this.order = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      loads: 0,
      saves: 0,
      evictions: 0
    };
  }

  configure(options = {}) {
    if (typeof options.maxChunks === 'number') {
      this.maxChunks = Math.max(1, Math.floor(options.maxChunks));
      this._trim();
    }
    if (typeof options.loadChunk === 'function') this.loadChunk = options.loadChunk;
    if (typeof options.saveChunk === 'function') this.saveChunk = options.saveChunk;
    if (typeof options.onEvict === 'function') this.onEvict = options.onEvict;
  }

  _touch(key) {
    if (this.order.has(key)) {
      this.order.delete(key);
    }
    this.order.set(key, true);
  }

  _getEntry(key) {
    return this.cache.get(key) || null;
  }

  _setEntry(key, entry) {
    this.cache.set(key, entry);
    this._touch(key);
    this._trim();
    return entry;
  }

  _trim() {
    while (this.cache.size > this.maxChunks) {
      const oldestKey = this.order.keys().next().value;
      if (oldestKey === undefined) break;
      this.evict(oldestKey);
    }
  }

  getChunk(key, options = {}) {
    const existing = this._getEntry(key);
    if (existing) {
      this.stats.hits += 1;
      existing.meta = { ...existing.meta, ...options };
      this._touch(key);
      return existing.data;
    }
    this.stats.misses += 1;
    let data = null;
    if (this.loadChunk) {
      data = this.loadChunk(key, options);
      this.stats.loads += 1;
    }
    const entry = {
      key,
      data,
      dirty: false,
      meta: { ...options }
    };
    this._setEntry(key, entry);
    return entry.data;
  }

  setChunk(key, data, options = {}) {
    let entry = this._getEntry(key);
    if (!entry) {
      entry = {
        key,
        data,
        dirty: Boolean(options.dirty !== false),
        meta: { ...options.meta }
      };
      this._setEntry(key, entry);
    } else {
      entry.data = data;
      entry.dirty = Boolean(options.dirty !== false);
      if (options.meta) {
        entry.meta = { ...entry.meta, ...options.meta };
      }
      this._touch(key);
    }
    return entry.data;
  }

  markDirty(key, dirty = true) {
    const entry = this._getEntry(key);
    if (!entry) return false;
    entry.dirty = Boolean(dirty);
    this._touch(key);
    return true;
  }

  flush(keys = null) {
    const targets = Array.isArray(keys)
      ? keys.map((k) => this._getEntry(k)).filter(Boolean)
      : Array.from(this.cache.values());

    for (const entry of targets) {
      if (!entry.dirty) continue;
      if (this.saveChunk) {
        this.saveChunk(entry.key, entry.data, entry.meta || {});
        this.stats.saves += 1;
      }
      entry.dirty = false;
    }
  }

  evict(key, { flush = true } = {}) {
    const entry = this._getEntry(key);
    if (!entry) return false;
    if (flush && entry.dirty) {
      this.flush([key]);
    }
    this.cache.delete(key);
    this.order.delete(key);
    this.stats.evictions += 1;
    if (this.onEvict) {
      this.onEvict(key, entry.data, entry.meta || {});
    }
    return true;
  }

  clear({ flush = false } = {}) {
    if (flush) this.flush();
    this.cache.clear();
    this.order.clear();
  }

  getStats() {
    return {
      ...this.stats,
      cached: this.cache.size,
      dirty: Array.from(this.cache.values()).filter((entry) => entry.dirty).length
    };
  }
}

const phaseHandlers = {
  capture: new Set(),
  compute: new Set(),
  commit: new Set()
};

const TcScheduler = (() => {
  let config = {
    enabled: false,
    baseSeed: 0,
    tickSalt: 0x9e3779b9
  };
  let currentContext = null;
  let currentPhaseIndex = -1;

  const ensurePhaseOrder = (phase) => {
    const expected = PHASE_ORDER.indexOf(phase);
    if (expected === -1) return;
    if (expected > currentPhaseIndex + 1) {
      throw new Error(`TC scheduler phase out of order: attempted ${phase} after index ${currentPhaseIndex}`);
    }
    currentPhaseIndex = expected;
  };

  const callHandlers = (phase, context) => {
    const handlers = phaseHandlers[phase];
    if (!handlers || handlers.size === 0) return;
    for (const handler of handlers) {
      try {
        handler(context);
      } catch (err) {
        console.error(`Error in TC ${phase} handler:`, err);
      }
    }
  };

  return {
    configure(options = {}) {
      config = {
        ...config,
        ...options
      };
      if (!config.enabled) {
        TcRandom.reset();
      }
      return { ...config };
    },

    getConfig() {
      return { ...config };
    },

    beginTick(context = {}) {
      if (currentContext) {
        console.warn('TC scheduler: beginTick called while previous tick active. Forcing endTick.');
        this.endTick();
      }
      currentContext = {
        ...context,
        phase: null
      };
      currentPhaseIndex = -1;
      if (config.enabled) {
        const baseSeed = context.seed !== undefined ? context.seed : config.baseSeed;
        const tick = context.tick ?? 0;
        const tickSeed = mixSeed(baseSeed, mixSeed(config.tickSalt, tick));
        currentContext.seed = TcRandom.pushSeed(tickSeed);
      }
      return currentContext;
    },

    runPhase(phase, overrides = {}) {
      if (!currentContext) {
        console.warn(`TC scheduler: runPhase(${phase}) called without beginTick. Auto-beginning tick.`);
        this.beginTick();
      }
      ensurePhaseOrder(phase);
      currentContext = {
        ...currentContext,
        ...overrides,
        phase
      };
      callHandlers(phase, currentContext);
      return currentContext;
    },

    endTick(overrides = {}) {
      if (!currentContext) return null;
      currentContext = {
        ...currentContext,
        ...overrides,
        phase: null
      };
      if (config.enabled) {
        TcRandom.popSeed();
      }
      const result = currentContext;
      currentContext = null;
      currentPhaseIndex = -1;
      return result;
    },

    reset() {
      currentContext = null;
      currentPhaseIndex = -1;
      TcRandom.reset();
    },

    register(phase, handler) {
      if (!phaseHandlers[phase]) {
        throw new Error(`Unknown TC phase: ${phase}`);
      }
      phaseHandlers[phase].add(handler);
      return () => {
        phaseHandlers[phase].delete(handler);
      };
    },

    registerHooks(hooks = {}) {
      const disposers = [];
      for (const [phase, handler] of Object.entries(hooks)) {
        if (!handler) continue;
        disposers.push(this.register(phase, handler));
      }
      return () => {
        disposers.forEach((dispose) => {
          try { dispose(); } catch (err) { console.error('Error disposing TC hook:', err); }
        });
      };
    }
  };
})();

const TcStorage = new TcChunkStorage();

const applyTcConfig = (tcConfig = {}) => {
  const config = tcConfig || {};
  const enabled = Boolean(config.enabled);
  const baseSeed = config.seed ?? config.baseSeed ?? 0;
  const tickSalt = config.tickSalt ?? 0x9e3779b9;
  const maxChunks = config.maxCachedChunks ?? config.maxChunks ?? DEFAULT_MAX_CHUNKS;
  TcScheduler.configure({ enabled, baseSeed, tickSalt });
  TcStorage.configure({ maxChunks });
};

const ensureDir = async (fsModule, targetDir) => {
  if (!fsModule || !targetDir) return;
  const mkdir = fsModule.promises?.mkdir;
  if (typeof mkdir === 'function') {
    await mkdir(targetDir, { recursive: true });
  } else if (typeof fsModule.mkdirSync === 'function') {
    try {
      fsModule.mkdirSync(targetDir, { recursive: true });
    } catch (err) {
      if (err && err.code !== 'EEXIST') throw err;
    }
  }
};

const createHeadlessEmitter = (options = {}) => {
  const snapshotLines = [];
  const manifestLines = [];
  const {
    directory = null,
    fs: fsModule = null,
    path: pathModule = null,
    snapshotFile = 'tc-snapshots.ndjson',
    manifestFile = 'tc-manifest.ndjson'
  } = options;

  let snapshotPath = null;
  let manifestPath = null;
  let prepared = false;

  const resolvePath = (fileName) => {
    if (!directory) return fileName;
    if (pathModule && typeof pathModule.join === 'function') {
      return pathModule.join(directory, fileName);
    }
    return `${directory.replace(/\/$/, '')}/${fileName}`;
  };

  const prepareStreams = async () => {
    if (prepared || !fsModule || !directory) {
      prepared = true;
      return;
    }
    await ensureDir(fsModule, directory);
    prepared = true;
  };

  const writeLine = async (kind, line) => {
    const target = kind === 'snapshot' ? snapshotLines : manifestLines;
    target.push(line);
    if (!fsModule || !directory) return;
    await prepareStreams();
    if (kind === 'snapshot' && !snapshotPath) {
      snapshotPath = resolvePath(snapshotFile);
      fsModule.writeFileSync(snapshotPath, '', 'utf8');
    }
    if (kind === 'manifest' && !manifestPath) {
      manifestPath = resolvePath(manifestFile);
      fsModule.writeFileSync(manifestPath, '', 'utf8');
    }
    const targetPath = kind === 'snapshot' ? snapshotPath : manifestPath;
    if (targetPath) {
      fsModule.appendFileSync(targetPath, `${line}\n`, 'utf8');
    }
  };

  return {
    async writeSnapshot(payload) {
      if (!payload || typeof payload !== 'object') return;
      const line = JSON.stringify(payload);
      await writeLine('snapshot', line);
    },

    async writeManifest(entry) {
      if (!entry || typeof entry !== 'object') return;
      const line = JSON.stringify(entry);
      await writeLine('manifest', line);
    },

    getSnapshotLines() {
      return [...snapshotLines];
    },

    getManifestLines() {
      return [...manifestLines];
    },

    getPaths() {
      return { snapshotPath, manifestPath };
    }
  };
};

export {
  TcRandom,
  TcChunkStorage,
  TcStorage,
  TcScheduler,
  applyTcConfig,
  createHeadlessEmitter,
  mixSeed
};

if (typeof window !== 'undefined') {
  window.TcRandom = TcRandom;
  window.TcStorage = TcStorage;
  window.TcScheduler = TcScheduler;
}
