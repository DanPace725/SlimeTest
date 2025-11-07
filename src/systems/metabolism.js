export function computeMetabolicCost({ baseRate, dt }) {
  const safeRate = Math.max(0, Number.isFinite(baseRate) ? baseRate : 0);
  const safeDt = Math.max(0, Number.isFinite(dt) ? dt : 0);
  return safeRate * safeDt;
}
