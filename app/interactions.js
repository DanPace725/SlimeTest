// app/interactions.js - Mouse interaction tracking and tooltips

/**
 * Creates a mouse interaction tracking system for resource tooltips and other hover effects.
 * 
 * @param {Object} config Configuration object
 * @param {HTMLCanvasElement} config.canvas - The canvas element to track mouse events on
 * @param {Object} config.World - The world object containing resources array
 * @param {Function} config.drawResourceTooltip - Function to draw resource tooltip
 * @returns {Object} The mouse tracking system
 */
export function createMouseTracker({ canvas, World, drawResourceTooltip }) {
    const mousePos = { x: 0, y: 0, hoveredResource: null };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mousePos.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mousePos.y = (e.clientY - rect.top) * (canvas.height / rect.height);
        
        // Check if mouse is over any resource
        mousePos.hoveredResource = null;
        const hoverRadius = 30; // Detection radius for hover
        
        for (const res of World.resources) {
            const dx = mousePos.x - res.x;
            const dy = mousePos.y - res.y;
            const dist = Math.hypot(dx, dy);
            
            if (dist <= res.r + hoverRadius) {
                mousePos.hoveredResource = res;
                break;
            }
        }
    });
    
    canvas.addEventListener('mouseleave', () => {
        mousePos.hoveredResource = null;
    });

    return {
        mousePos,
        drawHoveredResourceTooltip(ctx) {
            if (mousePos.hoveredResource) {
                drawResourceTooltip(ctx, mousePos.hoveredResource);
            }
        }
    };
}