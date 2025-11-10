// app/gameLoop.js - Main simulation loop and phase management

import { Resource } from '../src/core/resource.js';

export class GameLoop {
    constructor(world, systems, CONFIG) {
        this.world = world;
        this.systems = systems;
        this.CONFIG = CONFIG;
        this.globalTick = 0;
        this.lastSignalStatTick = 0;
        this.isCollectingBaseline = false;
        this.baselineMetricsTracker = null;
    }

    capturePhase = ({ tickContext }) => {
        const { Trail, SignalField } = this.systems;

        Trail.captureSnapshot();
        if (this.CONFIG.signal.enabled) {
            SignalField.captureSnapshot();
        }
        if (tickContext) {
            this.systems.TcScheduler.runPhase('capture', tickContext);
        }
    };

    updateAgentsPhase = ({ dt, tickContext }) => {
        const { ParticipationManager, Links } = this.systems;

        // Update participation system
        try {
            ParticipationManager.update(dt);
        } catch (error) {
            if (this.CONFIG?.participation?.debugLog) {
                console.debug('[Participation] update error:', error);
            }
        }

        // Agent link formation
        for (let i = 0; i < this.world.bundles.length; i++) {
            for (let j = i + 1; j < this.world.bundles.length; j++) {
                const a = this.world.bundles[i];
                const b = this.world.bundles[j];
                if (!a.alive || !b.alive) continue;
                this.tryFormLink(a, b);
            }
        }

        let totalEnergyDelta = 0;
        let totalChiSpent = 0;

        // Update all agents
        this.world.bundles.forEach(bundle => {
            const chiBeforeUpdate = bundle.chi;
            const posBeforeUpdate = { x: bundle.x, y: bundle.y };

            const nearestResource = this.world.getNearestResource(bundle);
            bundle.update(dt, nearestResource);

            // Track baseline metrics if enabled
            if (this.isCollectingBaseline && this.baselineMetricsTracker) {
                const dx = bundle.x - posBeforeUpdate.x;
                const dy = bundle.y - posBeforeUpdate.y;
                const speed = Math.hypot(dx, dy) / dt;
                this.baselineMetricsTracker.onMove(dx, dy, speed);

                const chiSpent = Math.max(0, chiBeforeUpdate - bundle.chi);
                if (chiSpent > 0) {
                    this.baselineMetricsTracker.onChiSpend(chiSpent, 'play-mode');
                    totalChiSpent += chiSpent;
                }
            }

            const applied = this.applyParticipationEnergy(bundle);
            if (applied !== 0) {
                totalEnergyDelta += applied;
            }
        });

        // Log energy changes if debugging enabled
        if (totalEnergyDelta !== 0 && this.CONFIG?.participation?.debugLog) {
            console.debug(
                `[Participation][Energy] Tick total Δχ=${totalEnergyDelta.toFixed(3)}`
            );
        }

        // Run compute phase for TC scheduler
        if (tickContext) {
            this.systems.TcScheduler.runPhase('compute', tickContext);
        }

        this.maintainLinks(dt);
    };

    environmentPhase = ({ dt }) => {
        const { Trail, SignalField, FertilityField } = this.systems;

        // Update environmental systems
        Trail.step(dt);
        if (this.CONFIG.signal.enabled) {
            SignalField.step(dt);
        }

        // Process resources
        this.world.updateEcology(dt);

        // Handle scent gradient and resource consumption
        if (this.CONFIG.scentGradient.consumable) {
            this.processResourceConsumption(dt);
        }

        // Clean up lineage tracking
        this.world.cleanupLineageLinks();

        // Process agent collisions
        if (this.CONFIG.enableAgentCollision) {
            this.handleAgentCollisions();
        }
    };

    resourcePhase = ({ dt }) => {
        // Process resource collection
        this.world.bundles.forEach(bundle => {
            if (!bundle.alive) return;
            this.processResourceCollection(bundle);
        });

        // Update resources
        this.world.resources.forEach(res => res.update(dt));

        // Handle plant ecology if enabled
        if (this.CONFIG.plantEcology.enabled && this.systems.FertilityField) {
            this.handlePlantEcology(dt);
        }
    };

    reproductionPhase = ({ mode }) => {
        if (mode !== 'play') return;

        const currentBundles = [...this.world.bundles];
        currentBundles.forEach(bundle => {
            if (bundle.alive) {
                bundle.attemptMitosis();
            }
        });
    };

    decayPhase = ({ dt }) => {
        if (!this.CONFIG.decay.enabled) return;

        try {
            const toRemove = [];
            this.world.bundles.forEach((bundle, idx) => {
                try {
                    const fullyDecayed = bundle.updateDecay(dt, this.systems.FertilityField);
                    if (fullyDecayed) {
                        toRemove.push(idx);
                    }
                } catch (err) {
                    console.error(`Error updating decay for agent ${bundle.id}:`, err);
                }
            });

            // Remove decayed agents
            for (let i = toRemove.length - 1; i >= 0; i--) {
                const idx = toRemove[i];
                if (idx >= 0 && idx < this.world.bundles.length) {
                    const removed = this.world.bundles.splice(idx, 1)[0];
                    removed.destroy();
                    console.log(`💀 Agent ${removed.id} fully decayed and removed | Pop: ${this.world.bundles.length}`);
                }
            }
        } catch (err) {
            console.error('Error in decay system:', err);
        }
    };

    finalizePhase = ({ tickContext }) => {
        if (tickContext) {
            this.systems.TcScheduler.runPhase('commit', tickContext);
        }
        this.globalTick++;

        // Update baseline metrics
        if (this.isCollectingBaseline && this.baselineMetricsTracker) {
            try {
                this.baselineMetricsTracker.step(
                    this.world,
                    this.systems.Trail,
                    this.globalTick,
                    this.systems.Links
                );
            } catch (err) {
                console.error('Error updating baseline metrics:', err);
                this.isCollectingBaseline = false;
            }
        }

        // Update signal stats periodically
        if (this.globalTick - this.lastSignalStatTick >= 30) {
            this.updateSignalStats();
        }
    };

    processResourceCollection(bundle) {
        for (const resource of this.world.resources) {
            if (!resource.visible || resource.depleted || !bundle.overlapsResource(resource)) continue;

            const collected = this.systems.collectResource({
                bundle,
                resource,
                world: this.world,
                config: this.CONFIG,
                onCollected: ({ resource }) => {
                    if (this.CONFIG.plantEcology.enabled && this.systems.FertilityField) {
                        this.systems.FertilityField.depleteAt(resource.x, resource.y, this.globalTick);
                    }
                    this.trackResourceCollection(bundle, resource);
                }
            });

            if (collected) break;
        }
    }

    trackResourceCollection(bundle, resource) {
        if (!this.isCollectingBaseline || !this.baselineMetricsTracker) return;

        const rewardAmount = this.CONFIG.rewardChi || 0;
        this.baselineMetricsTracker.onChiReward(rewardAmount, 'resource', this.globalTick);

        const sample = this.systems.Trail.sample(bundle.x, bundle.y);
        const nearTrail = sample.value > 0.15;
        this.baselineMetricsTracker.onResourceFound(nearTrail);

        const provenanceCredit = this.systems.Ledger.getCredits(bundle.id);
        if (provenanceCredit > 0) {
            this.baselineMetricsTracker.onChiFromReuse(provenanceCredit);
        }
    }

    handlePlantEcology(dt) {
        const aliveCount = this.world.bundles.filter(b => b.alive).length;
        let maxResources = this.CONFIG.resourceStableMax;

        if (this.CONFIG.resourceScaleWithAgents) {
            const spawnPressure = this.CONFIG.plantEcology.spawnPressure;
            const minResourceMultiplier = spawnPressure?.minResourceMultiplier ?? 1;
            const pressureMultiplier = this.systems.getSpawnPressureMultiplier(aliveCount, minResourceMultiplier);
            maxResources = Math.floor(
                this.clamp(
                    this.CONFIG.resourceBaseAbundance * pressureMultiplier,
                    this.CONFIG.resourceScaleMinimum,
                    this.CONFIG.resourceScaleMaximum
                )
            );
        }

        // Handle excess resources
        if (this.world.resources.length > maxResources) {
            const excess = this.world.resources.length - maxResources;
            const removed = this.world.resources.splice(-excess, excess);
            removed.forEach(res => res.destroy());
            console.log(`🔪 Culled ${excess} excess resources due to competition (${aliveCount} agents)`);
        }

        // Try seed dispersal
        const seedLocation = this.systems.attemptSeedDispersal(
            this.world.resources,
            this.systems.FertilityField,
            this.globalTick,
            dt,
            aliveCount
        );

        if (seedLocation && this.world.resources.length < maxResources) {
            const newResource = new this.systems.Resource(
                seedLocation.x,
                seedLocation.y,
                this.CONFIG.resourceRadius
            );
            this.world.resources.push(newResource);
            console.log(`🌱 Seed sprouted at (${Math.round(seedLocation.x)}, ${Math.round(seedLocation.y)}) | Fertility: ${seedLocation.fertility.toFixed(2)}`);
        }

        // Try spontaneous growth
        const growthLocation = this.systems.attemptSpontaneousGrowth(
            this.systems.FertilityField,
            dt,
            aliveCount,
            this.systems.canvasWidth,
            this.systems.canvasHeight
        );

        if (growthLocation && this.world.resources.length < maxResources) {
            const newResource = new this.systems.Resource(
                growthLocation.x,
                growthLocation.y,
                this.CONFIG.resourceRadius
            );
            this.world.resources.push(newResource);
            console.log(`🌿 Spontaneous growth at (${Math.round(growthLocation.x)}, ${Math.round(growthLocation.y)}) | Fertility: ${growthLocation.fertility.toFixed(2)}`);
        }

        // Update fertility field
        this.systems.FertilityField.update(dt, aliveCount, this.globalTick);
    }

    handleAgentCollisions() {
        for (let i = 0; i < this.world.bundles.length; i++) {
            for (let j = i + 1; j < this.world.bundles.length; j++) {
                const a = this.world.bundles[i];
                const b = this.world.bundles[j];
                if (!a.alive || !b.alive) continue;

                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const dist = Math.hypot(dx, dy);
                const minDist = a.size;

                if (dist < minDist && dist > 0.001) {
                    const overlap = minDist - dist;
                    const nx = dx / dist;
                    const ny = dy / dist;
                    const pushStrength = this.CONFIG.agentCollisionPushback;

                    // Apply collision response
                    a.x -= nx * overlap * pushStrength;
                    a.y -= ny * overlap * pushStrength;
                    b.x += nx * overlap * pushStrength;
                    b.y += ny * overlap * pushStrength;

                    // Clamp positions to canvas bounds
                    const half = a.size / 2;
                    a.x = this.clamp(a.x, half, this.systems.canvasWidth - half);
                    a.y = this.clamp(a.y, half, this.systems.canvasHeight - half);
                    b.x = this.clamp(b.x, half, this.systems.canvasWidth - half);
                    b.y = this.clamp(b.y, half, this.systems.canvasHeight - half);
                }
            }
        }
    }

    clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    getPhases() {
        return [
            this.capturePhase,
            this.updateAgentsPhase,
            this.environmentPhase,
            this.resourcePhase,
            this.reproductionPhase,
            this.decayPhase,
            this.finalizePhase
        ];
    }
}