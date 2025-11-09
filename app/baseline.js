// app/baseline.js - Baseline metrics collection and analysis

import { MetricsTracker } from '../src/core/metricsTracker.js';

/**
 * Creates a baseline metrics collection system for analyzing agent behavior.
 */
export class BaselineMetricsSystem {
    constructor({ World, Trail }) {
        this.World = World;
        this.Trail = Trail;
        this.isCollecting = false;
        this.metricsTracker = null;
    }

    /**
     * Start collecting baseline metrics.
     */
    startCollection() {
        if (this.isCollecting) {
            console.warn('Baseline collection already in progress');
            return false;
        }
        
        try {
            this.metricsTracker = new MetricsTracker();
            this.metricsTracker.init(this.World, this.Trail, this.World.globalTick);
            this.isCollecting = true;
            
            console.log('📊 Started baseline metrics collection');
            console.log('   Tracker initialized:', !!this.metricsTracker);
            console.log('   Step method exists:', typeof this.metricsTracker.step);
            return true;
        } catch (err) {
            console.error('Failed to start baseline collection:', err);
            this.metricsTracker = null;
            this.isCollecting = false;
            return false;
        }
    }

    /**
     * Stop collecting baseline metrics.
     */
    stopCollection() {
        if (!this.isCollecting) {
            console.warn('No baseline collection in progress');
            return false;
        }
        
        this.isCollecting = false;
        console.log(`📊 Stopped baseline metrics collection (${this.metricsTracker?.hist?.length || 0} snapshots)`);
        return true;
    }

    /**
     * Get collected metrics history.
     */
    getMetrics() {
        if (!this.metricsTracker) {
            return null;
        }
        return this.metricsTracker.getHistory();
    }

    /**
     * Track movement and chi spending statistics.
     */
    trackMovementAndChi(bundle, posBeforeUpdate, chiBeforeUpdate, dt) {
        if (!this.isCollecting || !this.metricsTracker) return;

        // Track movement
        const dx = bundle.x - posBeforeUpdate.x;
        const dy = bundle.y - posBeforeUpdate.y;
        const speed = Math.hypot(dx, dy) / dt;
        this.metricsTracker.onMove(dx, dy, speed);

        // Track chi spending
        const chiSpent = Math.max(0, chiBeforeUpdate - bundle.chi);
        if (chiSpent > 0) {
            this.metricsTracker.onChiSpend(chiSpent, 'play-mode');
        }
    }

    /**
     * Track resource collection statistics.
     */
    trackResourceCollection(bundle, rewardAmount, trailSample, provenanceCredit) {
        if (!this.isCollecting || !this.metricsTracker) return;

        // Track reward
        this.metricsTracker.onChiReward(rewardAmount, 'resource', this.World.globalTick);

        // Track guidance efficacy (was agent near strong trail?)
        const nearTrail = trailSample > 0.15; // Strong trail threshold
        this.metricsTracker.onResourceFound(nearTrail);

        // Track chi from reuse (provenance credits)
        if (provenanceCredit > 0) {
            this.metricsTracker.onChiFromReuse(provenanceCredit);
        }
    }

    /**
     * Track link lifetimes and breaks.
     */
    trackLinkBreak(age) {
        if (!this.isCollecting || !this.metricsTracker) return;
        this.metricsTracker.onLinkBreak(age);
    }

    /**
     * Update metrics for current tick.
     */
    update(links) {
        if (!this.isCollecting || !this.metricsTracker) return;

        try {
            if (typeof this.metricsTracker.step === 'function') {
                // Pass links array for active link age tracking
                this.metricsTracker.step(this.World, this.Trail, this.World.globalTick, links);
            } else {
                console.error('metricsTracker.step is not a function, stopping collection');
                this.isCollecting = false;
            }
        } catch (err) {
            console.error('Error updating baseline metrics:', err);
            this.isCollecting = false;
        }
    }
}