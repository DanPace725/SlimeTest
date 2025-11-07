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
