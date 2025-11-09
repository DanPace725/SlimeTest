// Color conversion utilities
export function rgb2hex(r, g, b) {
  return (r << 16) + (g << 8) + b;
}

export function rgbToHexNumber({ r, g, b }) {
  return rgb2hex(
    Math.round(Math.max(0, Math.min(255, r))),
    Math.round(Math.max(0, Math.min(255, g))),
    Math.round(Math.max(0, Math.min(255, b)))
  );
}