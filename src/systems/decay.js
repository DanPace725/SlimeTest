export function evaluateDecayTransition({ chi, chiSpend, alive, tick, deathTick, chiAtDeath }) {
  const nextChi = Math.max(0, (chi ?? 0) - (chiSpend ?? 0));
  const wasAlive = Boolean(alive);

  if (nextChi === 0 && wasAlive) {
    return {
      chi: 0,
      alive: false,
      deathTick: tick,
      chiAtDeath: 0,
      shouldProvokeBondedExploration: true
    };
  }

  return {
    chi: nextChi,
    alive: wasAlive,
    deathTick: deathTick,
    chiAtDeath: chiAtDeath,
    shouldProvokeBondedExploration: false
  };
}

export function createDecaySystem({ getGlobalTick, config }) {
  if (typeof getGlobalTick !== 'function') throw new Error('getGlobalTick is required');
  if (!config) throw new Error('config is required');

  const currentTick = () => getGlobalTick();

  function applyLifecycleTransition(bundle, { chiSpend }) {
    const result = evaluateDecayTransition({
      chi: bundle.chi,
      chiSpend,
      alive: bundle.alive,
      tick: currentTick(),
      deathTick: bundle.deathTick,
      chiAtDeath: bundle.chiAtDeath
    });

    bundle.chi = result.chi;
    bundle.alive = result.alive;
    bundle.deathTick = result.deathTick;
    bundle.chiAtDeath = result.chiAtDeath;

    return result;
  }

  function updateCorpseDecay(bundle, dt, fertilityGrid) {
    const decayConfig = config.decay || {};
    if (!decayConfig.enabled) return false;
    if (bundle.alive) return false;

    const tick = currentTick();

    if (typeof bundle.deathTick !== 'number') bundle.deathTick = -1;
    if (typeof bundle.decayProgress !== 'number') bundle.decayProgress = 0;
    if (typeof bundle.chiAtDeath !== 'number') bundle.chiAtDeath = 0;

    if (bundle.deathTick < 0) {
      bundle.deathTick = tick;
    }

    const duration = decayConfig.duration || 1;
    const ticksSinceDeath = tick - bundle.deathTick;
    bundle.decayProgress = Math.min(1, ticksSinceDeath / duration);

    if (fertilityGrid && config.plantEcology?.enabled && ticksSinceDeath % 10 === 0) {
      const chiToRelease = bundle.chiAtDeath * 0.02;
      if (chiToRelease > 0 && !Number.isNaN(chiToRelease)) {
        const fertilityGain = chiToRelease * decayConfig.fertilityBoost;
        if (fertilityGain > 0 && !Number.isNaN(fertilityGain)) {
          fertilityGrid.addFertilityRadial(
            bundle.x,
            bundle.y,
            decayConfig.releaseRadius,
            fertilityGain
          );
          bundle.chiAtDeath = Math.max(0, bundle.chiAtDeath - chiToRelease);
        }
      }
    }

    return decayConfig.removeAfterDecay && bundle.decayProgress >= 1.0;
  }

  return {
    applyLifecycleTransition,
    updateCorpseDecay
  };
}
