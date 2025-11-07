import { clamp, mix, smoothstep } from '../utils/math.js';
import ParticipationManager from './participation.js';

const normalizeVector = ({ dx, dy }, fallback) => {
  const mag = Math.hypot(dx, dy);
  if (mag > 1e-6) {
    return { dx: dx / mag, dy: dy / mag };
  }
  return fallback;
};

export function computeSteering({
  bundle,
  dt,
  resource,
  config,
  clamp: clampFn = clamp,
  mix: mixFn = mix,
  smoothstep: smoothFn = smoothstep,
  held
}) {
  let desired = { dx: 0, dy: 0 };

  if (config.autoMove || bundle.id !== 1) {
    desired = bundle.computeAIDirection(resource);
  } else if (held) {
    const manual = { dx: 0, dy: 0 };
    if (held.has('w') || held.has('arrowup')) manual.dy -= 1;
    if (held.has('s') || held.has('arrowdown')) manual.dy += 1;
    if (held.has('a') || held.has('arrowleft')) manual.dx -= 1;
    if (held.has('d') || held.has('arrowright')) manual.dx += 1;
    desired = normalizeVector(manual, { dx: bundle._lastDirX, dy: bundle._lastDirY });
  } else {
    desired = { dx: bundle._lastDirX, dy: bundle._lastDirY };
  }

  let participationForce = { ax: 0, ay: 0 };
  if (ParticipationManager && typeof ParticipationManager.applyForce === 'function') {
    const desiredBeforeForce = { ...desired };
    participationForce = ParticipationManager.applyForce({
      bundle,
      dt,
      desired: desiredBeforeForce,
      baseSpeed: config.moveSpeedPxPerSec
    }) || participationForce;

    if (typeof bundle?.onParticipationForce === 'function') {
      try {
        bundle.onParticipationForce(participationForce, {
          desired: desiredBeforeForce,
          dt,
          resource,
          config
        });
      } catch (error) {
        if (config?.participation?.debugLog && typeof console !== 'undefined' && console.debug) {
          console.debug('[Steering] participation hook error:', error);
        }
      }
    }
  }

  if (participationForce.ax !== 0 || participationForce.ay !== 0) {
    desired = {
      dx: desired.dx + participationForce.ax,
      dy: desired.dy + participationForce.ay
    };
  }

  const f = clampFn(bundle.frustration, 0, 1);
  const h = clampFn(bundle.hunger, 0, 1);
  const turnRate = config.aiTurnRateBase + config.aiTurnRateGain * f;
  const hungerAmp = 1 + (config.hungerSurgeAmp - 1) * h;
  const surge = (1.0 + config.aiSurgeMax * smoothFn(0.2, 1.0, f)) * hungerAmp;

  const steerWeight = clampFn(turnRate * dt, 0, 1);
  const dirX = mixFn(bundle._lastDirX, desired.dx, steerWeight);
  const dirY = mixFn(bundle._lastDirY, desired.dy, steerWeight);
  const normalized = normalizeVector({ dx: dirX, dy: dirY }, { dx: bundle._lastDirX, dy: bundle._lastDirY });

  const heading = Math.atan2(normalized.dy, normalized.dx);
  const speed = config.moveSpeedPxPerSec * surge;
  const targetVx = normalized.dx * speed;
  const targetVy = normalized.dy * speed;
  const velLerp = 1 - Math.exp(-6 * dt);

  return {
    lastDirX: normalized.dx,
    lastDirY: normalized.dy,
    heading,
    vx: mixFn(bundle.vx, targetVx, velLerp),
    vy: mixFn(bundle.vy, targetVy, velLerp)
  };
}
