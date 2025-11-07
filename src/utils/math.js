export const clamp = (value, min, max) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

export const mix = (a, b, t) => a + (b - a) * t;

export const smoothstep = (edge0, edge1, x) => {
  const denom = Math.max(1e-6, edge1 - edge0);
  const t = clamp((x - edge0) / denom, 0, 1);
  return t * t * (3 - 2 * t);
};
