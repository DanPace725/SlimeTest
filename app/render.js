// app/render.js - Core rendering system using PixiJS
import { CONFIG } from '../config.js';
import { PIXI } from '../lib/pixi.js';

/**
 * Creates and configures the PixiJS rendering system.
 * 
 * @param {Object} config Configuration object
 * @param {number} config.width - Canvas width in logical pixels
 * @param {number} config.height - Canvas height in logical pixels 
 * @param {number} config.dpr - Device pixel ratio for high-DPI displays
 * @returns {Object} The rendering system
 */
export function createRenderSystem({ width = 800, height = 600, dpr = window.devicePixelRatio || 1 }) {
    // Initialize PixiJS application
    const pixiApp = new PIXI.Application({
        width: width,
        height: height,
        backgroundAlpha: 0,
        resolution: dpr,
        autoDensity: true,
        autoStart: false,
        antialias: true,
        powerPreference: 'high-performance'
    });

    // Create container hierarchy for visual layers
    const resourcesContainer = new PIXI.Container();
    resourcesContainer.sortableChildren = true;
    pixiApp.stage.addChild(resourcesContainer);

    const agentTrailsContainer = new PIXI.Container();
    agentTrailsContainer.sortableChildren = true;
    pixiApp.stage.addChild(agentTrailsContainer);

    const agentsContainer = new PIXI.Container();
    agentsContainer.sortableChildren = true;
    pixiApp.stage.addChild(agentsContainer);

    // For debugging
    if (typeof window !== 'undefined') {
        window.pixiApp = pixiApp;
        window.resourcesContainer = resourcesContainer;
        window.agentsContainer = agentsContainer;
        window.agentTrailsContainer = agentTrailsContainer;
    }

    function resize(width, height, dpr) {
        // Update PixiJS renderer resolution and dimensions
        pixiApp.renderer.resolution = dpr;
        pixiApp.renderer.resize(width, height);
    }

    function render(canvas, ctx, width, height) {
        // The context has setTransform(dpr, 0, 0, dpr, 0, 0),
        // so we draw at logical coordinates
        pixiApp.render();
        ctx.drawImage(pixiApp.view, 0, 0, width, height);
    }

    return {
        app: pixiApp,
        resourcesContainer,
        agentTrailsContainer,
        agentsContainer,
        resize,
        render
    };
}