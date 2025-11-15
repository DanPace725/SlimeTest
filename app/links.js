// app/links.js - Link system for agent-to-agent connections
import { CONFIG } from '../config.js';
import { SIGNAL_CHANNELS } from './constants.js';

/**
 * Creates a link system for managing agent-to-agent bonds and interactions.
 */
export class LinkSystem {
    constructor({ CONFIG, World, Trail, SignalField }) {
        this.CONFIG = CONFIG;
        this.World = World;
        this.Trail = Trail;
        this.SignalField = SignalField;
        this.links = []; // Link: { aId, bId, strength, age, restLen, lastUseTick }
    }

    /**
     * Returns links connected to a specific agent.
     */
    getLinksForAgent(id) {
        return this.links.filter(L => L.aId === id || L.bId === id);
    }

    /**
     * Gets the ID of the other agent in a link.
     */
    getOtherId(L, id) {
        return L.aId === id ? L.bId : L.aId;
    }

    /**
     * Gets a bundle by ID.
     */
    getBundleById(id) {
        return this.World.bundles.find(b => b.id === id);
    }

    /**
     * Checks if a link exists between two agents.
     */
    linkExists(aId, bId) {
        return this.links.some(L => (L.aId === aId && L.bId === bId) || (L.aId === bId && L.bId === aId));
    }

    /**
     * Removes all links connected to an agent.
     */
    removeLinksFor(id) {
        for (let i = this.links.length - 1; i >= 0; i--) {
            const L = this.links[i];
            if (L.aId === id || L.bId === id) {
                this.links.splice(i, 1);
            }
        }
    }

    /**
     * Triggers bonded exploration effects when an agent dies.
     */
    provokeBondedExploration(deadId) {
        const duration = this.CONFIG.bondLoss?.onDeathBoostDuration ?? 600;
        const affected = this.getLinksForAgent(deadId);
        const deadBundle = this.getBundleById(deadId);
        const deathPos = deadBundle ? { x: deadBundle.x, y: deadBundle.y } : null;

        for (const L of affected) {
            const survivorId = this.getOtherId(L, deadId);
            const survivor = this.getBundleById(survivorId);
            
            if (survivor && survivor.alive) {
                const previousTicks = survivor.bereavementBoostTicks || 0;
                const nextTicks = Math.max(previousTicks, duration);
                survivor.bereavementBoostTicks = nextTicks;
                
                const distressStrength = clamp(L.strength / 2, 0, 1);
                if (distressStrength > 0) {
                    survivor.emitSignal('distress', distressStrength, { cap: 1 });
                    if (deadBundle && deathPos) {
                        deadBundle.emitSignal('distress', distressStrength, { cap: 1, x: deathPos.x, y: deathPos.y });
                    } else if (deathPos && this.CONFIG.signal?.enabled && this.SignalField) {
                        this.SignalField.deposit(deathPos.x, deathPos.y, distressStrength, SIGNAL_CHANNELS.distress);
                    }
                }
            }
        }

        // Remove links tied to dead agent to avoid stale guidance
        this.removeLinksFor(deadId);
    }

    /**
     * Attempts to form a new link between two agents.
     */
    tryFormLink(a, b) {
        const maxR = this.CONFIG.link.radius;
        const dx = b.x - a.x, dy = b.y - a.y;
        const d = Math.hypot(dx, dy);
        
        if (d > maxR) return;
        if (!a.alive || !b.alive) return;
        if (this.linkExists(a.id, b.id)) return;
        if (a.chi < this.CONFIG.link.formCost || b.chi < this.CONFIG.link.formCost) return;

        // Shared-context: same hot trail cell snapshot
        const sA = this.Trail.sample(a.x, a.y);
        const sB = this.Trail.sample(b.x, b.y);
        const sharedHot = Math.min(sA.value, sB.value) > this.CONFIG.link.trailMin;
        if (!sharedHot) return;

        // Deduct formation cost
        a.chi -= this.CONFIG.link.formCost;
        b.chi -= this.CONFIG.link.formCost;

        // Create new link
        this.links.push({
            aId: a.id,
            bId: b.id,
            strength: this.CONFIG.link.initStrength,
            age: 0,
            restLen: d,
            lastUseTick: this.World.globalTick
        });
    }

    /**
     * Updates link strengths and maintenance costs.
     */
    maintainLinks(dt) {
        for (let i = this.links.length - 1; i >= 0; i--) {
            const L = this.links[i];
            const a = this.getBundleById(L.aId);
            const b = this.getBundleById(L.bId);

            if (!a || !b || !a.alive || !b.alive) {
                // Link broken due to death - track lifetime if collecting baseline
                if (this.World.isCollectingBaseline && this.World.baselineMetricsTracker && L.age > 0) {
                    this.World.baselineMetricsTracker.onLinkBreak(L.age);
                }
                this.links.splice(i, 1);
                continue;
            }

            // χ maintenance proportional to strength
            const leak = this.CONFIG.link.maintPerSec * L.strength * dt;
            a.chi = Math.max(0, a.chi - leak);
            b.chi = Math.max(0, b.chi - leak);

            // Passive decay
            L.strength -= this.CONFIG.link.decayPerSec * dt;

            // Hunger-driven extra decay (averaged)
            const hA = clamp(a.hunger, 0, 1);
            const hB = clamp(b.hunger, 0, 1);
            const escapeA = Math.max(0, (hA - this.CONFIG.hungerThresholdHigh)) / Math.max(1e-6, 1 - this.CONFIG.hungerThresholdHigh);
            const escapeB = Math.max(0, (hB - this.CONFIG.hungerThresholdHigh)) / Math.max(1e-6, 1 - this.CONFIG.hungerThresholdHigh);
            const hungerEsc = (escapeA * escapeA + escapeB * escapeB) * 0.5; // Quadratic mean

            if (hungerEsc > 0) {
                L.strength -= this.CONFIG.link.hungerDecayPerSec * hungerEsc * dt;
            }

            // Use-based strengthening: projection of velocity along link direction
            const vx = b.x - a.x, vy = b.y - a.y;
            const len = Math.hypot(vx, vy) || 1;
            const ux = vx / len, uy = vy / len;
            const aProj = (a.vx * ux + a.vy * uy);
            const bProj = (b.vx * ux + b.vy * uy) * -1; // Moving toward each other counts
            const useFactor = Math.max(0, aProj) + Math.max(0, bProj);

            if (useFactor > 0) {
                L.strength += this.CONFIG.link.strengthenPerUse * dt;
                L.lastUseTick = this.World.globalTick;
            }

            // Emit bond signals
            const bondSignal = clamp(L.strength * 0.15 * dt, 0, 1);
            if (bondSignal > 0) {
                a.emitSignal('bond', bondSignal, { cap: 1 });
                b.emitSignal('bond', bondSignal, { cap: 1 });
            }

            // Clamp and breakage
            if (L.strength < this.CONFIG.link.minStrength) {
                // Link broken due to weakness - track lifetime if collecting baseline
                if (this.World.isCollectingBaseline && this.World.baselineMetricsTracker && L.age > 0) {
                    this.World.baselineMetricsTracker.onLinkBreak(L.age);
                }
                this.links.splice(i, 1);
                continue;
            }

            L.strength = Math.min(2.0, Math.max(0, L.strength));
            L.age += dt;
        }
    }

    /**
     * Draws all active links.
     */
    draw(ctx, getAgentColor) {
        if (!this.links.length) return;

        ctx.save();
        ctx.globalAlpha = 0.6;

        for (const L of this.links) {
            const a = this.getBundleById(L.aId);
            const b = this.getBundleById(L.bId);
            if (!a || !b) continue;

            const color = getAgentColor(L.aId, true);
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(1, L.strength * 2);
            ctx.beginPath();
            // Use interpolated visual positions to match agent rendering
            const aX = a.visualX !== undefined ? a.visualX : a.x;
            const aY = a.visualY !== undefined ? a.visualY : a.y;
            const bX = b.visualX !== undefined ? b.visualX : b.x;
            const bY = b.visualY !== undefined ? b.visualY : b.y;
            ctx.moveTo(aX, aY);
            ctx.lineTo(bX, bY);
            ctx.stroke();
        }

        ctx.restore();
    }
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}