// Config Parameter Optimizer - CEM for heuristic tuning
// Uses Cross-Entropy Method to optimize CONFIG parameters directly

import { CONFIG } from '../../config.js';

/**
 * Define which CONFIG parameters to optimize and their bounds
 * Format: { path: 'config.path', min, max, init?, discrete? }
 */
export const TUNABLE_PARAMS = [
  // === Core Metabolism ===
  { path: 'baseDecayPerSecond', min: 0.05, max: 0.3, init: 0.10 },
  { path: 'moveSpeedPxPerSec', min: 80, max: 250, init: 150 },
  { path: 'moveCostPerSecond', min: 0.15, max: 0.8, init: 0.35 },
  
  // === Sensing ===
  { path: 'sensing.radius', min: 40, max: 200, init: 100 },
  { path: 'sensing.costPerSecond', min: 0.01, max: 0.2, init: 0.05 },
  { path: 'sensing.radiusRangeFactor', min: 1.2, max: 3.0, init: 2.0 },
  
  // === Trail System ===
  { path: 'trail.emitPerSecond', min: 0.3, max: 2.0, init: 1.0 },
  { path: 'trail.decayPerSecond', min: 0.03, max: 0.15, init: 0.08 },
  { path: 'trail.attractionGain', min: 0.05, max: 0.4, init: 0.15 },
  { path: 'trail.costPerSecond', min: 0.005, max: 0.08, init: 0.02 },
  
  // === Frustration (Exploration Noise) ===
  { path: 'frustration.riseRate', min: 0.03, max: 0.3, init: 0.1 },
  { path: 'frustration.fallRate', min: 0.03, max: 0.3, init: 0.15 },
  { path: 'frustration.noiseGain', min: 0.5, max: 2.5, init: 1.5 },
  { path: 'frustration.hungerAmplify', min: 0.1, max: 1.0, init: 0.5 },
  
  // === Link System ===
  { path: 'link.formCost', min: 0.5, max: 3.0, init: 1.2 },
  { path: 'link.maintPerSec', min: 0.005, max: 0.08, init: 0.02 },
  { path: 'link.decayPerSec', min: 0.005, max: 0.05, init: 0.015 },
  { path: 'link.strengthenPerUse', min: 0.01, max: 0.15, init: 0.04 },
  { path: 'link.guidanceGain', min: 0.2, max: 1.5, init: 0.6 },
];

/**
 * Fitness function - combines metrics into scalar fitness
 * @param {object} metricsHistory - Array of metric snapshots
 * @param {string} objective - 'F' (foraging), 'C' (collective), 'R' (resilient), or 'balanced'
 * @returns {number} - fitness score (higher is better)
 */
export function computeFitness(metricsHistory, objective = 'balanced') {
  if (!metricsHistory || metricsHistory.length === 0) {
    return -Infinity;
  }
  
  // Use last 50% of snapshots for evaluation (ignore early transient)
  const startIdx = Math.floor(metricsHistory.length * 0.5);
  const recentSnapshots = metricsHistory.slice(startIdx);
  
  // Helper to compute mean of metric across snapshots
  const mean = (key) => {
    const values = recentSnapshots.map(s => s[key] || 0).filter(v => isFinite(v));
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };
  
  // Helper for z-score normalization (using std dev)
  const std = (key) => {
    const values = recentSnapshots.map(s => s[key] || 0).filter(v => isFinite(v));
    if (values.length === 0) return 1;
    const m = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + (b - m) ** 2, 0) / values.length;
    return Math.sqrt(variance) || 1;
  };
  
  const z = (key) => {
    const m = mean(key);
    const s = std(key);
    return m / Math.max(s, 0.001); // Prevent division by zero
  };
  
  // Composite objectives (from Training.md)
  const F = z('find_rate') + z('energy_roi') - z('path_inefficiency');
  const C = z('shared_trail_use') + z('link_persistence') + z('guidance_efficacy');
  const R = z('spatial_coverage') + z('frontier_rate') - z('stuckness');
  
  // Survival bonus (penalize if agents die too quickly)
  const survivalBonus = mean('survival_rate') * 5;
  
  // Select fitness based on objective
  switch (objective) {
    case 'F': return F + survivalBonus;
    case 'C': return C + survivalBonus;
    case 'R': return R + survivalBonus;
    case 'balanced': 
    default:
      // Balanced: equal weight to all three objectives
      return (F + C + R) / 3 + survivalBonus;
  }
}

/**
 * ConfigOptimizer - CEM for CONFIG parameter tuning
 */
export class ConfigOptimizer {
  constructor(tunableParams = TUNABLE_PARAMS, objective = 'balanced') {
    this.params = tunableParams;
    this.objective = objective;
    
    // CEM population settings
    this.populationSize = 20;  // Smaller than neural net training (configs are expensive to evaluate)
    this.eliteCount = 5;       // Top 25%
    
    // Initialize distribution (mu, sigma) for each parameter
    this.mu = this.params.map(p => p.init !== undefined ? p.init : (p.min + p.max) / 2);
    this.sigma = this.params.map(p => (p.max - p.min) / 6); // Start with ~3 sigma = range
    
    // Training state
    this.generation = 0;
    this.bestFitness = -Infinity;
    this.bestConfig = null;
    this.history = [];
  }
  
  /**
   * Sample N config sets from current distribution
   * @returns {Array} Array of config objects
   */
  sampleConfigs() {
    const configs = [];
    
    for (let i = 0; i < this.populationSize; i++) {
      const configSample = {};
      
      for (let j = 0; j < this.params.length; j++) {
        const param = this.params[j];
        
        // Sample from Gaussian N(mu, sigma)
        const raw = this._sampleGaussian(this.mu[j], this.sigma[j]);
        
        // Clamp to bounds
        let value = Math.max(param.min, Math.min(param.max, raw));
        
        // Handle discrete parameters if needed
        if (param.discrete) {
          value = Math.round(value);
        }
        
        configSample[param.path] = value;
      }
      
      configs.push(configSample);
    }
    
    return configs;
  }
  
  /**
   * Apply a config sample to the global CONFIG
   * @param {object} configSample - Object with parameter paths and values
   */
  applyConfig(configSample) {
    for (const [path, value] of Object.entries(configSample)) {
      this._setNestedProperty(CONFIG, path, value);
    }
  }
  
  /**
   * Restore CONFIG to baseline values
   */
  restoreBaselineConfig() {
    for (const param of this.params) {
      const baselineValue = param.init !== undefined ? param.init : (param.min + param.max) / 2;
      this._setNestedProperty(CONFIG, param.path, baselineValue);
    }
  }
  
  /**
   * Update distribution based on elite configs
   * @param {Array} elites - Array of {config, fitness} objects
   */
  updateDistribution(elites) {
    if (elites.length === 0) return;
    
    // Update mu: mean of elite configs
    for (let j = 0; j < this.params.length; j++) {
      const path = this.params[j].path;
      const eliteValues = elites.map(e => e.config[path]);
      this.mu[j] = eliteValues.reduce((a, b) => a + b, 0) / elites.length;
    }
    
    // Update sigma: std dev of elite configs (with minimum floor)
    for (let j = 0; j < this.params.length; j++) {
      const path = this.params[j].path;
      const eliteValues = elites.map(e => e.config[path]);
      const mean = this.mu[j];
      const variance = eliteValues.reduce((a, v) => a + (v - mean) ** 2, 0) / elites.length;
      const stdDev = Math.sqrt(variance);
      
      // Keep sigma bounded: don't let it collapse too much or explode
      const minSigma = (this.params[j].max - this.params[j].min) / 50; // 2% of range
      const maxSigma = (this.params[j].max - this.params[j].min) / 3;  // 33% of range
      this.sigma[j] = Math.max(minSigma, Math.min(maxSigma, stdDev));
    }
    
    this.generation++;
  }
  
  /**
   * Get current best config as formatted object
   * @returns {object} Config object with nested structure
   */
  getBestConfig() {
    if (!this.bestConfig) return null;
    
    const formatted = {};
    for (const [path, value] of Object.entries(this.bestConfig)) {
      this._setNestedProperty(formatted, path, value);
    }
    return formatted;
  }
  
  /**
   * Export best config in ConfigIO snapshot format (for main config panel)
   * @returns {object} ConfigIO-compatible snapshot
   */
  exportConfigIOSnapshot() {
    if (!this.bestConfig) return null;
    
    return {
      version: 1,
      ts: Date.now(),
      params: this.bestConfig  // Already in flat "path.to.param": value format
    };
  }
  
  /**
   * Get optimizer statistics
   * @returns {object} Stats object
   */
  getStats() {
    return {
      generation: this.generation,
      bestFitness: this.bestFitness,
      populationSize: this.populationSize,
      eliteCount: this.eliteCount,
      objective: this.objective,
      convergence: this._computeConvergence()
    };
  }
  
  /**
   * Save optimizer state
   * @returns {object} Serialized state
   */
  save() {
    return {
      generation: this.generation,
      mu: this.mu,
      sigma: this.sigma,
      bestFitness: this.bestFitness,
      bestConfig: this.bestConfig,
      history: this.history,
      objective: this.objective,
      params: this.params
    };
  }
  
  /**
   * Load optimizer state
   * @param {object} state - Serialized state
   */
  load(state) {
    this.generation = state.generation;
    this.mu = state.mu;
    this.sigma = state.sigma;
    this.bestFitness = state.bestFitness;
    this.bestConfig = state.bestConfig;
    this.history = state.history;
    this.objective = state.objective || 'balanced';
    if (state.params) {
      this.params = state.params;
    }
  }
  
  // ===== Helper Methods =====
  
  /**
   * Sample from Gaussian distribution using Box-Muller transform
   */
  _sampleGaussian(mu, sigma) {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mu + z0 * sigma;
  }
  
  /**
   * Set nested property using dot notation (e.g., 'trail.emitPerSecond')
   */
  _setNestedProperty(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!(parts[i] in current)) {
        current[parts[i]] = {};
      }
      current = current[parts[i]];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  /**
   * Compute convergence metric (0 = not converged, 1 = fully converged)
   */
  _computeConvergence() {
    let totalNormalizedSigma = 0;
    
    for (let j = 0; j < this.params.length; j++) {
      const range = this.params[j].max - this.params[j].min;
      const normalizedSigma = this.sigma[j] / range;
      totalNormalizedSigma += normalizedSigma;
    }
    
    const avgNormalizedSigma = totalNormalizedSigma / this.params.length;
    // Convergence: 1 - avgSigma (where 0.02 = ~converged, 0.33 = exploring)
    return Math.max(0, 1 - (avgNormalizedSigma * 3));
  }
}

/**
 * ConfigTrainingManager - coordinates config optimization loop
 */
export class ConfigTrainingManager {
  constructor(optimizer, worldResetFn, runEpisodeFn) {
    this.optimizer = optimizer;
    this.worldReset = worldResetFn;
    this.runEpisode = runEpisodeFn;
    this.isTraining = false;
    this.stopRequested = false;
  }
  
  /**
   * Run one generation of config optimization
   * @param {function} progressCallback - Called with (current, total, status)
   * @returns {object} Generation results
   */
  async runGeneration(progressCallback = null) {
    if (this.isTraining) {
      throw new Error('Training already in progress');
    }
    
    this.isTraining = true;
    const generation = this.optimizer.generation;
    
    try {
      // Sample configs
      const configs = this.optimizer.sampleConfigs();
      const results = [];
      
      // Evaluate each config
      for (let i = 0; i < configs.length; i++) {
        if (this.stopRequested) {
          this.stopRequested = false;
          this.isTraining = false;
          return { stopped: true };
        }
        
        if (progressCallback) {
          progressCallback(i + 1, configs.length, `Evaluating config ${i + 1}/${configs.length}`);
        }
        
        const config = configs[i];
        
        // Apply config to global CONFIG
        this.optimizer.applyConfig(config);
        
        // Run episode and get metrics
        const { totalReward, metricsHistory } = await this.runEpisode();
        
        // Compute fitness
        const fitness = computeFitness(metricsHistory, this.optimizer.objective);
        
        results.push({
          config,
          fitness,
          reward: totalReward,
          metricsHistory
        });
      }
      
      // Sort by fitness
      results.sort((a, b) => b.fitness - a.fitness);
      
      // Select elites
      const elites = results.slice(0, this.optimizer.eliteCount);
      
      // Update best
      if (elites[0].fitness > this.optimizer.bestFitness) {
        this.optimizer.bestFitness = elites[0].fitness;
        this.optimizer.bestConfig = elites[0].config;
      }
      
      // Update distribution
      this.optimizer.updateDistribution(elites);
      
      // Record history
      this.optimizer.history.push({
        generation,
        bestFitness: this.optimizer.bestFitness,
        meanFitness: results.reduce((sum, r) => sum + r.fitness, 0) / results.length,
        eliteMeanFitness: elites.reduce((sum, e) => sum + e.fitness, 0) / elites.length,
        convergence: this.optimizer._computeConvergence()
      });
      
      // Restore baseline config
      this.optimizer.restoreBaselineConfig();
      
      this.isTraining = false;
      
      return {
        generation,
        results,
        elites,
        bestFitness: this.optimizer.bestFitness,
        convergence: this.optimizer._computeConvergence()
      };
      
    } catch (error) {
      this.isTraining = false;
      throw error;
    }
  }
  
  /**
   * Run multiple generations
   * @param {number} numGenerations - Number of generations to run
   * @param {function} progressCallback - Called with progress updates
   */
  async runTraining(numGenerations, progressCallback = null) {
    for (let gen = 0; gen < numGenerations; gen++) {
      if (this.stopRequested) {
        this.stopRequested = false;
        break;
      }
      
      const genResults = await this.runGeneration((current, total, status) => {
        if (progressCallback) {
          const overallProgress = `Gen ${gen + 1}/${numGenerations} | ${status}`;
          progressCallback(current, total, overallProgress);
        }
      });
      
      if (genResults.stopped) break;
    }
  }
  
  /**
   * Request training stop (gracefully)
   */
  stop() {
    this.stopRequested = true;
  }
}

