import { clamp } from '../utils/math.js';

export function computeMovement({
  position,
  velocity,
  dt,
  size,
  canvasWidth,
  canvasHeight,
  moveCostPerSecond,
  depositPerSec,
  chi,
  agentId
}) {
  const oldX = position.x;
  const oldY = position.y;
  const nextX = oldX + velocity.vx * dt;
  const nextY = oldY + velocity.vy * dt;

  const half = size / 2;
  const clampedX = clamp(nextX, half, canvasWidth - half);
  const clampedY = clamp(nextY, half, canvasHeight - half);

  const movedDist = Math.hypot(clampedX - oldX, clampedY - oldY);
  const chiCost = movedDist > 0 ? Math.max(0, moveCostPerSecond) * dt : 0;

  const deposits = [];
  if (movedDist > 0 && depositPerSec > 0) {
    const health = clamp(chi / 20, 0.2, 1.0);
    const amount = depositPerSec * health * dt;
    const offsets = [
      { dx: 0, dy: 0, scale: 1 },
      { dx: -half, dy: -half, scale: 0.25 },
      { dx: half, dy: -half, scale: 0.25 },
      { dx: -half, dy: half, scale: 0.25 },
      { dx: half, dy: half, scale: 0.25 }
    ];

    for (const offset of offsets) {
      deposits.push({
        x: clampedX + offset.dx,
        y: clampedY + offset.dy,
        amount: amount * offset.scale,
        authorId: agentId
      });
    }
  }

  return {
    position: { x: clampedX, y: clampedY },
    movedDist,
    chiCost,
    deposits
  };
}

export function evaluateResidualEffects({ movedDist, sample, dt, config, agentId }) {
  if (movedDist <= 0) {
    return { chiGain: 0, chiPenalty: 0, creditAuthorId: null };
  }

  const { value = 0, authorId = 0, age = Infinity } = sample || {};
  let chiGain = 0;
  let creditAuthorId = null;

  const differentAuthor = authorId !== agentId && authorId !== 0;
  const oldEnough = age >= config.trailCooldownTicks;
  if (differentAuthor && oldEnough && value > 0) {
    const squashed = Math.sqrt(value);
    chiGain = Math.min(
      config.residualCapPerTick,
      config.residualGainPerSec * squashed * dt
    );
    if (chiGain > 0) {
      creditAuthorId = authorId;
    }
  }

  let chiPenalty = 0;
  if (config.ownTrailPenalty > 0) {
    const isOwnTrail = authorId === agentId;
    const isFresh = age < config.ownTrailGraceAge;
    if (isOwnTrail && isFresh && value > 0.1) {
      chiPenalty = config.ownTrailPenalty * dt;
    }
  }

  return { chiGain, chiPenalty, creditAuthorId };
}
