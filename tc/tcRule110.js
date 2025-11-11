import { TcStorage, TcScheduler } from '../src/runtime/tcStorage.js';
import { TcOverlayStore } from '../src/runtime/tcOverlayStore.js';
import {
  RULE110_DEFAULT_WIDTH,
  resolveRule110Initializer,
  rule110EtherInitializer
} from './tcInitializers.js';

const RULE110_RULESET = 110;
const CONTEXT_KEY = '__tcRule110__';
const STATE_KEY_DEFAULT = 'tc.rule110.state';
const BUFFER_KEY_DEFAULT = 'tc.rule110.next';

const RULE_TABLE = (() => {
  const table = new Uint8Array(8);
  table[0b111] = 0;
  table[0b110] = 1;
  table[0b101] = 1;
  table[0b100] = 0;
  table[0b011] = 1;
  table[0b010] = 1;
  table[0b001] = 1;
  table[0b000] = 0;
  return table;
})();

const isTypedArray = (value) => ArrayBuffer.isView(value) && !(value instanceof DataView);
const isIterable = (value) => value && typeof value[Symbol.iterator] === 'function';

const toCellValue = (value) => {
  if (typeof value === 'number') return value ? 1 : 0;
  if (typeof value === 'bigint') return value ? 1 : 0;
  if (typeof value === 'string') return value === '1' ? 1 : 0;
  return value ? 1 : 0;
};

const normalizeInitializerResult = (result) => {
  if (!result) {
    return { cells: null, origin: null, metadata: null };
  }
  if (isTypedArray(result) || Array.isArray(result) || isIterable(result)) {
    return { cells: result, origin: null, metadata: null };
  }
  if (typeof result === 'object') {
    const { cells = null, origin = null, metadata = null } = result;
    return { cells, origin, metadata };
  }
  return { cells: null, origin: null, metadata: null };
};

const copyCells = (target, source) => {
  const width = target.length;
  target.fill(0);
  if (!source) return target;
  if (isTypedArray(source)) {
    const view = source;
    const len = Math.min(width, view.length);
    for (let i = 0; i < len; i++) {
      target[i] = view[i] ? 1 : 0;
    }
    return target;
  }
  if (Array.isArray(source)) {
    const len = Math.min(width, source.length);
    for (let i = 0; i < len; i++) {
      target[i] = toCellValue(source[i]);
    }
    return target;
  }
  if (isIterable(source)) {
    let i = 0;
    for (const value of source) {
      if (i >= width) break;
      target[i++] = toCellValue(value);
    }
    return target;
  }
  if (typeof source === 'string') {
    const len = Math.min(width, source.length);
    for (let i = 0; i < len; i++) {
      target[i] = source.charCodeAt(i) === 49 ? 1 : 0;
    }
  }
  return target;
};

const ensureChunk = (storage, key, width) => {
  let chunk = storage.getChunk(key);
  if (!(isTypedArray(chunk) && chunk.length === width)) {
    const buffer = new Uint8Array(width);
    if (chunk) {
      copyCells(buffer, chunk);
    }
    chunk = storage.setChunk(key, buffer, { dirty: false });
  }
  return chunk;
};

const ensureState = (storage, keys, width) => {
  const current = ensureChunk(storage, keys.state, width);
  const buffer = ensureChunk(storage, keys.buffer, width);
  return { current, buffer };
};

const buildSnapshotPayload = (tick, cells, width, info) => {
  const payload = {
    type: 'tc.rule110.snapshot',
    tick,
    width,
    cells: Array.from(cells)
  };
  if (info.origin) {
    payload.origin = info.origin;
  }
  const metadata = { ...(info.metadata || {}) };
  metadata.rule = RULE110_RULESET;
  payload.metadata = metadata;
  return payload;
};

const createRule110Stepper = (options = {}) => {
  const {
    width = RULE110_DEFAULT_WIDTH,
    storage = TcStorage,
    stateKey = STATE_KEY_DEFAULT,
    bufferKey = BUFFER_KEY_DEFAULT,
    initializer = rule110EtherInitializer,
    initializerOptions = {},
    onCapture = null,
    onCommit = null,
    metadata: initialMetadata = {},
    origin: initialOrigin = null,
    initialize = true
  } = options;

  const keys = { state: stateKey, buffer: bufferKey };
  const stateInfo = {
    origin: initialOrigin,
    metadata: { ...initialMetadata }
  };

  ensureState(storage, keys, width);

  const applyInitializer = (init, initOptions = {}) => {
    const { current, buffer } = ensureState(storage, keys, width);
    const source = typeof init === 'string'
      ? resolveRule110Initializer(init, width, initOptions)
      : (typeof init === 'function' ? init(width, initOptions) : init);
    const resolved = normalizeInitializerResult(source);
    copyCells(current, resolved.cells);
    buffer.fill(0);
    storage.markDirty(stateKey, true);
    storage.markDirty(bufferKey, false);
    stateInfo.origin = resolved.origin ?? stateInfo.origin;
    if (resolved.metadata) {
      stateInfo.metadata = { ...stateInfo.metadata, ...resolved.metadata };
    }
    return current;
  };

  if (initialize) {
    applyInitializer(initializer, initializerOptions);
  }

  const getTickContext = (ctx) => {
    let bag = ctx[CONTEXT_KEY];
    if (!bag) {
      const { current, buffer } = ensureState(storage, keys, width);
      bag = { current, buffer };
      ctx[CONTEXT_KEY] = bag;
    }
    return bag;
  };

  return {
    width,
    stateKey,
    bufferKey,
    get origin() {
      return stateInfo.origin;
    },
    get metadata() {
      return { rule: RULE110_RULESET, ...stateInfo.metadata };
    },
    setState(cells, info = {}) {
      const { current, buffer } = ensureState(storage, keys, width);
      copyCells(current, cells);
      buffer.fill(0);
      storage.markDirty(stateKey, true);
      storage.markDirty(bufferKey, false);
      if (typeof info.origin !== 'undefined') {
        stateInfo.origin = info.origin;
      }
      if (info.metadata) {
        stateInfo.metadata = { ...stateInfo.metadata, ...info.metadata };
      }
      return current;
    },
    applyInitializer(init = initializer, initOptions = initializerOptions) {
      return applyInitializer(init, initOptions);
    },
    getState() {
      const { current } = ensureState(storage, keys, width);
      return current;
    },
    capture(ctx = {}) {
      const { current, buffer } = getTickContext(ctx);
      buffer.fill(0);
      if (typeof onCapture === 'function') {
        const snapshot = Uint8Array.from(current);
        onCapture({
          tick: ctx.tick ?? 0,
          payload: buildSnapshotPayload(ctx.tick ?? 0, snapshot, width, stateInfo),
          cells: snapshot
        });
      }
      if (TcOverlayStore.getConfig().enabled) {
        let activeCells = 0;
        for (let i = 0; i < current.length; i++) {
          if (current[i]) activeCells += 1;
        }
        TcOverlayStore.recordSnapshot({
          type: 'tc.rule110.snapshot',
          tick: ctx.tick ?? 0,
          manifestKey: stateInfo.metadata?.manifestKey ?? null,
          origin: stateInfo.origin ?? null,
          metadata: stateInfo.metadata,
          summary: {
            width,
            activeCells
          }
        });
      }
      return current;
    },
    compute(ctx = {}) {
      const { current, buffer } = getTickContext(ctx);
      const lastIndex = width - 1;
      for (let i = 0; i < width; i++) {
        const left = i === 0 ? 0 : current[i - 1];
        const center = current[i];
        const right = i === lastIndex ? 0 : current[i + 1];
        const ruleIndex = (left << 2) | (center << 1) | right;
        buffer[i] = RULE_TABLE[ruleIndex];
      }
      storage.markDirty(bufferKey, true);
      return buffer;
    },
    commit(ctx = {}) {
      const { current, buffer } = getTickContext(ctx);
      current.set(buffer);
      storage.markDirty(stateKey, true);
      storage.markDirty(bufferKey, false);
      if (typeof onCommit === 'function') {
        const snapshot = Uint8Array.from(current);
        onCommit({
          tick: ctx.tick ?? 0,
          payload: buildSnapshotPayload(ctx.tick ?? 0, snapshot, width, stateInfo),
          cells: snapshot
        });
      }
      return current;
    },
    buildSnapshot(tick = 0, cells = null) {
      const source = cells || this.getState();
      return buildSnapshotPayload(tick, source, width, stateInfo);
    }
  };
};

const registerRule110Stepper = (options = {}) => {
  const stepper = createRule110Stepper(options);
  const unsubscribe = TcScheduler.registerHooks({
    capture(ctx) {
      stepper.capture(ctx);
    },
    compute(ctx) {
      stepper.compute(ctx);
    },
    commit(ctx) {
      stepper.commit(ctx);
    }
  });
  return { stepper, unsubscribe };
};

export {
  RULE110_RULESET,
  RULE_TABLE,
  createRule110Stepper,
  registerRule110Stepper
};
