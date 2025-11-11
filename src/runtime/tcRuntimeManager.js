import { registerRule110Stepper } from '../../tc/tcRule110.js';
import { RULE110_DEFAULT_WIDTH } from '../../tc/tcInitializers.js';
import { TcStorage } from './tcStorage.js';

const DEFAULT_STATE_KEY = 'tc.rule110.state';
const DEFAULT_BUFFER_KEY = 'tc.rule110.next';
const DEFAULT_SNAPSHOT_KEY = 'tc.rule110.snapshot';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const toFiniteNumber = (value, fallback = 0) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};
const toFiniteInt = (value, fallback = 0) => Math.floor(toFiniteNumber(value, fallback));
const toOptionalInt = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const normalized = Number(value);
  return Number.isFinite(normalized) ? Math.floor(normalized) : null;
};
const clamp01 = (value, fallback = 0.5) => clamp(toFiniteNumber(value, fallback), 0, 1);

const buildRule110Spec = (tcConfig = {}) => {
  const block = tcConfig.rule110 || {};
  const width = clamp(Math.floor(toFiniteNumber(block.width, RULE110_DEFAULT_WIDTH)), 8, 4096);
  const initializer = typeof block.initializer === 'string'
    ? block.initializer.toLowerCase()
    : 'ether';
  const phase = toFiniteInt(block.phase ?? 0, 0);
  const offset = toOptionalInt(block.offset);
  const randomSeed = toFiniteInt(block.randomSeed ?? 0, 0);
  const randomDensity = clamp01(block.randomDensity ?? 0.5, 0.5);
  const initializerOptions = {
    phase,
    seed: randomSeed,
    density: randomDensity
  };
  if (offset !== null) {
    initializerOptions.offset = offset;
  } else if (Object.prototype.hasOwnProperty.call(block, 'offset') && block.offset === null) {
    initializerOptions.offset = null;
  }
  const normalizeKey = (value, fallback) => (typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : fallback);
  return {
    width,
    initializer,
    initializerOptions,
    stateKey: normalizeKey(block.stateKey, DEFAULT_STATE_KEY),
    bufferKey: normalizeKey(block.bufferKey, DEFAULT_BUFFER_KEY),
    snapshotKey: normalizeKey(block.snapshotKey, DEFAULT_SNAPSHOT_KEY),
    captureSnapshots: Boolean(tcConfig.snapshots?.rule110?.capture)
  };
};

const rule110RuntimeState = {
  stepper: null,
  unsubscribe: null,
  signature: null,
  snapshotKey: DEFAULT_SNAPSHOT_KEY,
  captureSnapshots: false
};

const handleRule110Capture = ({ payload }) => {
  if (!rule110RuntimeState.captureSnapshots || !rule110RuntimeState.snapshotKey) {
    return;
  }
  if (!payload || typeof payload !== 'object') {
    return;
  }
  const snapshot = {
    ...payload,
    capturedAt: Date.now()
  };
  TcStorage.setChunk(rule110RuntimeState.snapshotKey, snapshot, {
    dirty: true,
    meta: { manifest: snapshot.type }
  });
};

const teardownRule110Runtime = () => {
  if (typeof rule110RuntimeState.unsubscribe === 'function') {
    try {
      rule110RuntimeState.unsubscribe();
    } catch (error) {
      console.error('Failed to tear down Rule 110 stepper:', error);
    }
  }
  if (typeof window !== 'undefined' && window.rule110Stepper === rule110RuntimeState.stepper) {
    delete window.rule110Stepper;
  }
  rule110RuntimeState.stepper = null;
  rule110RuntimeState.unsubscribe = null;
  rule110RuntimeState.signature = null;
};

export const applyTcRuntimeConfig = (tcConfig = {}) => {
  const spec = buildRule110Spec(tcConfig);
  rule110RuntimeState.captureSnapshots = spec.captureSnapshots;
  rule110RuntimeState.snapshotKey = spec.snapshotKey;

  if (!tcConfig.enabled || tcConfig.mode !== 'rule110') {
    teardownRule110Runtime();
    return;
  }

  const signature = JSON.stringify({
    width: spec.width,
    initializer: spec.initializer,
    initializerOptions: spec.initializerOptions,
    stateKey: spec.stateKey,
    bufferKey: spec.bufferKey
  });

  if (rule110RuntimeState.signature === signature && rule110RuntimeState.stepper) {
    return;
  }

  teardownRule110Runtime();
  const { stepper, unsubscribe } = registerRule110Stepper({
    width: spec.width,
    initializer: spec.initializer,
    initializerOptions: spec.initializerOptions,
    stateKey: spec.stateKey,
    bufferKey: spec.bufferKey,
    onCapture: handleRule110Capture
  });

  rule110RuntimeState.stepper = stepper;
  rule110RuntimeState.unsubscribe = unsubscribe;
  rule110RuntimeState.signature = signature;
  if (typeof window !== 'undefined') {
    window.rule110Stepper = stepper;
  }
};

export const getActiveRule110Stepper = () => rule110RuntimeState.stepper;
