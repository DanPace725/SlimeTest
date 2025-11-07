import { clamp, smoothstep } from '../utils/math.js';

export function computeSensingUpdate(state, dt, config) {
  const {
    extendedSensing,
    alive,
    frustration,
    hunger,
    currentSensoryRange,
    targetSensoryRange,
    chi
  } = state;

  const base = config.aiSensoryRangeBase;
  const max = config.aiSensoryRangeMax;

  let nextTarget = targetSensoryRange ?? base;
  if (!extendedSensing || !alive) {
    nextTarget = base;
  } else {
    const f = clamp(frustration, 0, 1);
    const h = clamp(hunger, 0, 1);
    const hungerAmp = 1 + (config.hungerSenseAmp - 1) * h;
    const bias = smoothstep(0.0, 1.0, f) * config.aiSenseBiasFromFrustr * hungerAmp;
    nextTarget = clamp(base + (max - base) * bias, base, max);
  }

  const slew = config.aiSenseSlewPerSec * dt;
  const delta = clamp(nextTarget - currentSensoryRange, -slew, slew);
  let newRange = clamp(currentSensoryRange + delta, base, max);

  const achievedBoost = Math.max(0, newRange - currentSensoryRange);
  const pxPerChiPerSec = config.aiSenseRangePerChi;
  const safeDt = Math.max(1e-6, dt);
  const chiPerSecForBoost = achievedBoost > 0 ? (achievedBoost / safeDt) / pxPerChiPerSec : 0;
  let cost = chiPerSecForBoost * safeDt;

  const aboveBase = Math.max(0, newRange - base);
  const holdChiPerSec = (aboveBase * aboveBase) / (pxPerChiPerSec * 100);
  cost += holdChiPerSec * safeDt;

  const hungerPenalty = 1 + clamp(hunger, 0, 1) * 0.5;
  cost *= hungerPenalty;

  let limited = false;
  const availableChi = Math.max(0, chi);
  if (cost > availableChi) {
    const scale = availableChi / Math.max(cost, 1e-6);
    const scaledBoost = achievedBoost * scale;
    cost = availableChi;
    newRange = clamp(currentSensoryRange + scaledBoost, base, max);
    limited = true;
  }

  return {
    cost,
    currentSensoryRange: newRange,
    targetRange: nextTarget,
    limited
  };
}
