// lib/pixi.js - PixiJS module wrapper with initialization checks
import * as PIXI from 'pixi.js';

// Ensure PIXI is properly initialized
if (!PIXI.utils) {
    console.error('PIXI.utils not available - initialization may have failed');
}

if (!PIXI.Application) {
    console.error('PIXI.Application not available - initialization may have failed');
}

// Export the initialized PIXI instance
export { PIXI };