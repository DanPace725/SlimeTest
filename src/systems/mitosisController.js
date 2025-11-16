import { clamp, sigmoid } from '../utils/math.js';

const clamp01 = (value) => clamp(Number.isFinite(value) ? value : 0, 0, 1);
const positive = (value, fallback) => Math.max(1, Number.isFinite(value) ? value : fallback);

function computeCapacity(bundle, mitosisConfig) {
  const threshold = positive(mitosisConfig?.threshold, 100);
  const cost = clamp(mitosisConfig?.cost ?? 0, 0, Number.POSITIVE_INFINITY);
  const scale = threshold + cost || threshold;
  return clamp01(bundle?.chi / scale);
}

function computeStrain(bundle, mitosisConfig) {
  const threshold = positive(mitosisConfig?.threshold, 100);
  const hunger = clamp01(bundle?.hunger);
  const frustration = clamp01(bundle?.frustration);
  const exhaustion = clamp01(1 - clamp01(bundle?.chi / (threshold * 1.5)));
  return clamp01((hunger + frustration + exhaustion) / 3);
}

function computePressure(bundle, world, mitosisConfig, baselineConfig) {
  const radius = positive(baselineConfig?.pressureRadius, 180);
  const maxNeighbors = positive(baselineConfig?.pressureMaxNeighbors, 6);
  let localCount = 0;
  let alive = 0;

  if (world?.bundles) {
    for (const other of world.bundles) {
      if (!other?.alive) continue;
      alive += 1;
      if (other === bundle) continue;
      const dx = other.x - bundle.x;
      const dy = other.y - bundle.y;
      const dist = Math.hypot(dx, dy);
      if (dist <= radius) localCount += 1;
    }
  }

  const localPressure = clamp01(localCount / maxNeighbors);
  const aliveCap = positive(mitosisConfig?.maxAliveAgents ?? mitosisConfig?.maxAgents, alive || 1);
  const globalPressure = clamp01(alive / aliveCap);
  return clamp01(localPressure * 0.6 + globalPressure * 0.4);
}

function computeOpportunity(bundle, world, config, baselineConfig) {
  const radius = positive(
    baselineConfig?.opportunityRadius,
    bundle?.currentSensoryRange ?? config?.aiSensoryRangeBase ?? 200
  );
  const maxResources = positive(baselineConfig?.opportunityMaxResources, 3);
  let nearby = 0;

  if (world?.resources) {
    for (const res of world.resources) {
      if (!res || res.depleted || res.visible === false) continue;
      const dx = res.x - bundle.x;
      const dy = res.y - bundle.y;
      if (Math.hypot(dx, dy) <= radius) nearby += 1;
    }
  }

  return clamp01(nearby / maxResources);
}

function computeHarmony(bundle, world) {
  let signalAvg = 0;

  // Prefer current signal context amplitudes if available
  if (bundle?.signalContext && typeof bundle.signalContext === 'object') {
    const amps = Object.values(bundle.signalContext)
      .map((ctx) => clamp01(ctx?.amplitude));
    if (amps.length > 0) {
      signalAvg = clamp01(amps.reduce((a, b) => a + b, 0) / amps.length);
    }
  } else if (typeof bundle?.getSignalAverage === 'function') {
    const resAmp = clamp01(bundle.getSignalAverage('resource'));
    const distressAmp = clamp01(bundle.getSignalAverage('distress'));
    const bondAmp = clamp01(bundle.getSignalAverage('bond'));
    signalAvg = clamp01((resAmp + distressAmp + bondAmp) / 3);
  }

  const resourceHarmony = clamp01(1 - clamp01(world?.resourcePressure));
  return clamp01((signalAvg + resourceHarmony) / 2);
}

export function computeBaselineSignals({ bundle, world, config, overrides = {} }) {
  const mitosisConfig = config?.mitosis ?? {};
  const baselineConfig = mitosisConfig.baseline ?? {};
  const gains = overrides.signalGains || {};

  const capacity = clamp01((computeCapacity(bundle, mitosisConfig)) * (gains.capacity ?? 1));
  const strain = clamp01((computeStrain(bundle, mitosisConfig)) * (gains.strain ?? 1));
  const pressure = clamp01((computePressure(bundle, world, mitosisConfig, baselineConfig)) * (gains.pressure ?? 1));
  const opportunity = clamp01((computeOpportunity(bundle, world, config, baselineConfig)) * (gains.opportunity ?? 1));
  const harmony = clamp01((computeHarmony(bundle, world)) * (gains.harmony ?? 1));

  return { capacity, strain, pressure, opportunity, harmony };
}

export function computeBaselineMitosisProbability({ bundle, world, config, overrides = {}, rng }) {
  const mitosisConfig = config?.mitosis ?? {};
  const baselineConfig = mitosisConfig.baseline ?? {};

  if (baselineConfig.enabled === false) {
    return {
      probability: 1,
      score: 0,
      threshold: baselineConfig.threshold ?? 0.5,
      signals: computeBaselineSignals({ bundle, world, config, overrides }),
      adjustments: overrides || null
    };
  }

  const signals = computeBaselineSignals({ bundle, world, config, overrides });
  const weights = overrides.weights || baselineConfig.weights || {};
  const wCap = weights.capacity ?? (baselineConfig.weights?.capacity ?? 1);
  const wStrain = weights.strain ?? (baselineConfig.weights?.strain ?? 1);
  const wPressure = weights.pressure ?? (baselineConfig.weights?.pressure ?? 1);
  const wOpp = weights.opportunity ?? (baselineConfig.weights?.opportunity ?? 1);
  const wHarmony = weights.harmony ?? (baselineConfig.weights?.harmony ?? 1);
  const threshold = baselineConfig.threshold ?? 0.5;
  const noiseLevel = overrides.noise ?? 0;
  const noise = noiseLevel > 0
    ? ((typeof rng === 'function' ? rng() : Math.random()) - 0.5) * noiseLevel
    : 0;

  const mitosisScore =
    wCap * signals.capacity -
    wStrain * signals.strain +
    wPressure * (1 - signals.pressure) +
    wOpp * signals.opportunity +
    wHarmony * signals.harmony;

  const probability = sigmoid(mitosisScore - threshold + noise);

  return {
    probability: clamp01(probability),
    score: mitosisScore,
    threshold,
    signals,
    adjustments: overrides || null
  };
}
