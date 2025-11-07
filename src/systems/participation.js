import { clamp } from '../utils/math.js';

const noop = () => {};
const noopNumber = () => 0;

const EPSILON = 1e-6;
const DEFAULT_FORCE_FRACTION = 0.35;
const MIN_FADE = 1e-3;

const toFiniteNumber = (value, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sanitizeForce = (force) => {
  if (!force || typeof force !== 'object') {
    return { ax: 0, ay: 0 };
  }
  const ax = toFiniteNumber(force.ax, 0);
  const ay = toFiniteNumber(force.ay, 0);
  return { ax, ay };
};

const resetForce = (stateRef) => {
  stateRef.lastForce = { ax: 0, ay: 0 };
};

const state = {
  mode: 'idle',
  isActive: false,
  cursor: { x: 0, y: 0, visible: false },
  activeFields: new Map(),
  timers: {
    elapsed: 0,
    delta: 0,
    modeStart: 0,
    inactiveTime: 0
  },
  lastForce: { ax: 0, ay: 0 }
};

const hooks = {
  configResolver: () => ({}),
  onUpdate: noop,
  onApplyForce: noop,
  onSampleEnergy: noopNumber,
  onSampleSignal: noopNumber,
  onDraw: noop
};

const pointerHooks = {
  onPointerDown: noop,
  onPointerMove: noop,
  onPointerUp: noop,
  onPointerCancel: noop
};

function getConfig() {
  try {
    return hooks.configResolver(state) || {};
  } catch (error) {
    return {};
  }
}

function setMode(mode) {
  if (typeof mode === 'string' && mode !== state.mode) {
    state.mode = mode;
    state.timers.modeStart = state.timers.elapsed;
  }
}

function setActive(isActive) {
  const nextActive = Boolean(isActive);
  if (nextActive !== state.isActive) {
    state.isActive = nextActive;
    state.timers.inactiveTime = nextActive ? 0 : state.timers.inactiveTime;
    if (!nextActive) {
      clearActiveFieldEntries();
      resetForce(state);
    }
  }
}

function setCursor({ x, y, visible }) {
  if (typeof x === 'number') {
    state.cursor.x = x;
  }
  if (typeof y === 'number') {
    state.cursor.y = y;
  }
  if (typeof visible === 'boolean') {
    state.cursor.visible = visible;
  }
}

function setActiveFieldEntry(key, value) {
  if (key === undefined || key === null) {
    return;
  }
  if (value === undefined || value === null) {
    state.activeFields.delete(key);
    return;
  }
  const existing = state.activeFields.get(key);
  const createdAt = existing?.createdAt ?? state.timers.elapsed;
  state.activeFields.set(key, {
    ...existing,
    ...value,
    createdAt,
    updatedAt: state.timers.elapsed
  });
}

function clearActiveFieldEntries() {
  state.activeFields.clear();
  resetForce(state);
}

function update(dt) {
  const delta = typeof dt === 'number' && Number.isFinite(dt) ? dt : 0;
  state.timers.elapsed += delta;
  state.timers.delta = delta;
  if (!state.isActive) {
    state.timers.inactiveTime += delta;
  }
  const config = getConfig();
  if (!config?.enabled && state.isActive) {
    setActive(false);
  }
  hooks.onUpdate(state, config, delta);
}

const computeParticipationForce = (context, config) => {
  const { bundle } = context || {};
  if (!bundle || state.activeFields.size === 0) {
    return { ax: 0, ay: 0 };
  }

  const agentX = toFiniteNumber(bundle.x, 0);
  const agentY = toFiniteNumber(bundle.y, 0);
  const baseSpeed = Math.max(0, toFiniteNumber(context?.baseSpeed, 0));
  const maxFraction = clamp(
    toFiniteNumber(context?.maxFraction ?? config?.maxForceFraction ?? DEFAULT_FORCE_FRACTION, DEFAULT_FORCE_FRACTION),
    0,
    1
  );
  const now = state.timers.elapsed;

  let sumX = 0;
  let sumY = 0;
  const staleKeys = [];

  for (const [key, entryRaw] of state.activeFields.entries()) {
    const entry = entryRaw || {};
    const targetX = toFiniteNumber(entry.x ?? entry.position?.x, NaN);
    const targetY = toFiniteNumber(entry.y ?? entry.position?.y, NaN);
    if (!Number.isFinite(targetX) || !Number.isFinite(targetY)) {
      continue;
    }

    const dx = targetX - agentX;
    const dy = targetY - agentY;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);
    if (dist <= EPSILON) {
      continue;
    }

    const mode = entry.mode || state.mode;
    const modeConfig = config?.modes?.[mode] || {};
    const strength = Math.max(0, toFiniteNumber(entry.strength ?? modeConfig.strength, 0));
    const radius = Math.max(0, toFiniteNumber(entry.radius ?? modeConfig.radius, 0));
    if (strength <= 0 || radius <= 0) {
      continue;
    }

    const falloff = clamp(1 - dist / radius, 0, 1);
    if (falloff <= 0) {
      continue;
    }

    const decay = Math.max(0, toFiniteNumber(entry.decay ?? modeConfig.decay, 0));
    const age = Math.max(0, now - toFiniteNumber(entry.updatedAt, now));
    let fade = 1;
    if (decay > 0 && age > 0) {
      fade = Math.exp(-decay * age);
      if (fade < MIN_FADE) {
        staleKeys.push(key);
        continue;
      }
    }

    const influence = strength * falloff * fade;
    if (influence <= 0) {
      continue;
    }

    const dirX = dx / dist;
    const dirY = dy / dist;
    sumX += dirX * influence;
    sumY += dirY * influence;
  }

  if (staleKeys.length > 0) {
    for (const key of staleKeys) {
      state.activeFields.delete(key);
    }
  }

  const mag = Math.hypot(sumX, sumY);
  if (mag <= EPSILON) {
    return { ax: 0, ay: 0 };
  }

  const maxMagnitude = baseSpeed > 0 ? baseSpeed * maxFraction : maxFraction;
  if (maxMagnitude > 0 && mag > maxMagnitude) {
    const scale = maxMagnitude / mag;
    sumX *= scale;
    sumY *= scale;
  }

  return { ax: sumX, ay: sumY };
};

function applyForce(context) {
  if (!state.isActive) {
    resetForce(state);
    return { ax: 0, ay: 0 };
  }

  const config = getConfig();
  if (!config?.enabled) {
    clearActiveFieldEntries();
    return { ax: 0, ay: 0 };
  }

  const computed = computeParticipationForce(context, config);
  const hookResult = hooks.onApplyForce(state, config, {
    ...context,
    computed
  });
  const force = sanitizeForce(hookResult && typeof hookResult === 'object' ? hookResult : computed);
  state.lastForce = force;
  return force;
}

function sampleEnergy(agentBundle) {
  const sample = hooks.onSampleEnergy(state, getConfig(), agentBundle);
  return typeof sample === 'number' && Number.isFinite(sample) ? sample : 0;
}

function sampleSignal(agentBundle) {
  const sample = hooks.onSampleSignal(state, getConfig(), agentBundle);
  return typeof sample === 'number' && Number.isFinite(sample) ? sample : 0;
}

function draw(ctx) {
  hooks.onDraw(state, getConfig(), ctx);
}

function getLastForce() {
  return { ...state.lastForce };
}

function setConfig(resolver) {
  hooks.configResolver = typeof resolver === 'function' ? resolver : hooks.configResolver;
  return manager;
}

function setEmitters({
  onUpdate,
  onApplyForce,
  onSampleEnergy,
  onSampleSignal,
  onDraw
} = {}) {
  if (typeof onUpdate === 'function') {
    hooks.onUpdate = onUpdate;
  }
  if (typeof onApplyForce === 'function') {
    hooks.onApplyForce = onApplyForce;
  }
  if (typeof onSampleEnergy === 'function') {
    hooks.onSampleEnergy = onSampleEnergy;
  }
  if (typeof onSampleSignal === 'function') {
    hooks.onSampleSignal = onSampleSignal;
  }
  if (typeof onDraw === 'function') {
    hooks.onDraw = onDraw;
  }
  return manager;
}

function setPointerHandlers({
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onPointerCancel
} = {}) {
  if (typeof onPointerDown === 'function') {
    pointerHooks.onPointerDown = onPointerDown;
  }
  if (typeof onPointerMove === 'function') {
    pointerHooks.onPointerMove = onPointerMove;
  }
  if (typeof onPointerUp === 'function') {
    pointerHooks.onPointerUp = onPointerUp;
  }
  if (typeof onPointerCancel === 'function') {
    pointerHooks.onPointerCancel = onPointerCancel;
  }
  return manager;
}

function handlePointerEvent(type, payload = {}) {
  const handlerMap = {
    pointerdown: pointerHooks.onPointerDown,
    pointermove: pointerHooks.onPointerMove,
    pointerup: pointerHooks.onPointerUp,
    pointercancel: pointerHooks.onPointerCancel
  };

  const handler = handlerMap[type];
  if (typeof handler !== 'function') {
    return;
  }

  const config = getConfig();

  try {
    handler(state, config, payload);
  } catch (error) {
    if (config?.debugLog && typeof console !== 'undefined' && console.debug) {
      console.debug('[Participation] Pointer handler threw:', error);
    }
  }
}

function resetTimers() {
  state.timers.elapsed = 0;
  state.timers.delta = 0;
  state.timers.modeStart = 0;
  state.timers.inactiveTime = 0;
}

const manager = {
  state,
  setMode,
  setActive,
  setCursor,
  setActiveFieldEntry,
  clearActiveFieldEntries,
  resetTimers,
  getConfig,
  setConfig,
  setEmitters,
  setPointerHandlers,
  handlePointerEvent,
  update,
  applyForce,
  sampleEnergy,
  sampleSignal,
  draw,
  getLastForce
};

export default manager;
