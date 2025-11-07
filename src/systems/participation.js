const noop = () => {};
const noopNumber = () => 0;

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
  }
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
  state.activeFields.set(key, {
    ...value,
    updatedAt: state.timers.elapsed
  });
}

function clearActiveFieldEntries() {
  state.activeFields.clear();
}

function update(dt) {
  const delta = typeof dt === 'number' && Number.isFinite(dt) ? dt : 0;
  state.timers.elapsed += delta;
  state.timers.delta = delta;
  if (!state.isActive) {
    state.timers.inactiveTime += delta;
  }
  hooks.onUpdate(state, getConfig(), delta);
}

function applyForce(agentBundle) {
  if (!state.isActive) {
    return { ax: 0, ay: 0 };
  }
  const result = hooks.onApplyForce(state, getConfig(), agentBundle);
  if (result && typeof result === 'object') {
    const { ax = 0, ay = 0 } = result;
    return { ax, ay };
  }
  return { ax: 0, ay: 0 };
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
  draw
};

export default manager;
