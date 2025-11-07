// Temporary module bridge for the legacy app entrypoint.
// Loads the existing app.js side effects and re-exports its window globals.
import '../app.js';

if (typeof window !== 'undefined' && typeof window.resizeCanvas === 'function') {
  window.resizeCanvas();
}

export const World = window.World;
export const resizeCanvas = window.resizeCanvas;
export const trainingUI = window.trainingUI;
