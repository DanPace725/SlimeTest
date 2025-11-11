import { mixSeed } from '../src/runtime/tcStorage.js';

const RULE110 = 110;
const ETHER_PATTERN = Uint8Array.from([
  0, 0, 0, 1,
  0, 0, 1, 1,
  0, 1, 1, 1,
  1, 0, 0, 0
]);

const GLIDER_PATTERN = Uint8Array.from([
  1, 1, 1, 1, 1,
  0, 0, 0,
  1, 0, 0, 1, 1, 0
]);

const DEFAULT_WIDTH = 256;

const clampOffset = (offset, width) => {
  if (Number.isFinite(offset)) {
    if (offset < 0) return 0;
    if (offset > width - 1) return width - 1;
    return Math.floor(offset);
  }
  return 0;
};

const createDeterministicRng = (seed) => {
  let state = mixSeed(seed, 0x6d2b79f5);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const toUint8 = (value) => (value ? 1 : 0);

const fillPattern = (width, pattern, phase = 0) => {
  const cells = new Uint8Array(width);
  const offset = ((phase % pattern.length) + pattern.length) % pattern.length;
  for (let i = 0; i < width; i++) {
    cells[i] = pattern[(offset + i) % pattern.length];
  }
  return cells;
};

const overlayPattern = (target, pattern, start) => {
  const width = target.length;
  const begin = clampOffset(start, width);
  for (let i = 0; i < pattern.length; i++) {
    const idx = begin + i;
    if (idx >= width) break;
    target[idx] = toUint8(pattern[i]);
  }
  return target;
};

export const rule110EtherInitializer = (width = DEFAULT_WIDTH, options = {}) => {
  const { phase = 0 } = options || {};
  const cells = fillPattern(width, ETHER_PATTERN, phase);
  return {
    cells,
    origin: 'ether',
    metadata: { rule: RULE110, phase }
  };
};

export const rule110GliderInitializer = (width = DEFAULT_WIDTH, options = {}) => {
  const { phase = 0, offset = null } = options || {};
  const base = fillPattern(width, ETHER_PATTERN, phase);
  const start = offset === null
    ? Math.max(0, Math.floor(width / 2) - Math.floor(GLIDER_PATTERN.length / 2))
    : clampOffset(offset, width);
  overlayPattern(base, GLIDER_PATTERN, start);
  return {
    cells: base,
    origin: 'ether+glider',
    metadata: { rule: RULE110, phase, offset: start }
  };
};

export const rule110RandomInitializer = (width = DEFAULT_WIDTH, options = {}) => {
  const { seed = 0, density = 0.5 } = options || {};
  const rng = createDeterministicRng(seed);
  const cells = new Uint8Array(width);
  for (let i = 0; i < width; i++) {
    cells[i] = rng() < density ? 1 : 0;
  }
  return {
    cells,
    origin: 'prng',
    metadata: { rule: RULE110, seed, density }
  };
};

export const RULE110_INITIALIZERS = {
  ether: rule110EtherInitializer,
  glider: rule110GliderInitializer,
  random: rule110RandomInitializer
};

export const resolveRule110Initializer = (name, width = DEFAULT_WIDTH, options = {}) => {
  const key = typeof name === 'string' ? name.toLowerCase() : '';
  const initializer = RULE110_INITIALIZERS[key] || RULE110_INITIALIZERS.ether;
  return initializer(width, options);
};

export const RULE110_DEFAULT_WIDTH = DEFAULT_WIDTH;
export const RULE110_ETHER_PATTERN = ETHER_PATTERN;
export const RULE110_GLIDER_PATTERN = GLIDER_PATTERN;
