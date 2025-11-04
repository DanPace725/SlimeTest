// Slime-Bundle Configuration
// Organized config for physics, trails, AI, and learning

export const CONFIG = {
  // === Physics & Core Mechanics ===
  startChi: 15,
  baseDecayPerSecond: 0.10,
  moveSpeedPxPerSec: 160,
  moveCostPerSecond: 0.25,
  rewardChi: 10,                    // DEPRECATED: kept for backward compatibility
  resourceRadius: 8,
  bundleSize: 40,

  // === Resource Ecology (dynamic resource availability) ===
  resourceDynamicCount: true,       // Use dynamic resource ecology vs fixed count
  resourceInitialMin: 5,            // Starting resources (min) - initial abundance
  resourceInitialMax: 7,            // Starting resources (max) - initial abundance
  resourceStableMin: 2,             // Stable minimum after depletion
  resourceStableMax: 4,             // Stable maximum after depletion
  resourceDepletionRate: 0.015,     // Rate of decline per collection (carrying capacity pressure)
  resourceRecoveryChance: 0.10,     // Chance per second to add a resource (if below stable max)
  // Legacy fixed count (used when resourceDynamicCount = false)
  resourceCount: 3,                 // Fixed number of resources (legacy mode)

  // === Adaptive Reward System ===
  // Biologically-grounded rewards that scale with search difficulty
  // Based on ATP/glucose metabolism and optimal foraging theory
  adaptiveReward: {
    enabled: true,                 // Toggle adaptive vs fixed reward
    gainFactor: 5.0,               // "Ecosystem generosity" (4-10 range recommended)
    avgMoveFraction: 0.7,          // Assume 70% of time spent moving
    emaAlpha: 0.15,                 // EMA smoothing (0.05-0.2, lower = more stable)
    minReward: 3.0,                // Safety floor (prevent tiny rewards)
    maxReward: 100.0,              // Safety ceiling (prevent explosion)
    
    // Optional: Absolute biological anchor (disabled by default)
    // When enabled, rewards based on ~1 femtomole glucose = 6×10⁸ molecules
    useAbsoluteAnchor: false,
    chiPerATP: 1 / 1e8,            // 1 χ per 10^8 ATP molecules
    moleculesPerPatch: 6e8,        // 1 femtomole = 6×10^8 molecules
    atpPerGlucose: 30,             // ~30 ATP per glucose molecule
  },

  // === Trail System ===
  trailCell: 6,
  depositPerSec: 2.5,
  evapPerSec: 0.015,
  diffusePerSec: 0.08,
  enableDiffusion: false,             // Diffusion off by default for cleaner trails
  renderTrail: true,

  // === Residuals (public-good reuse) ===
  residualGainPerSec: 0.8,
  residualCapPerTick: 0.3,
  trailCooldownTicks: 8,
  
  // === Own Trail Penalty (discourages circuit running) ===
  ownTrailPenalty: 0.05,           // Chi cost per second for being on own fresh trail
  ownTrailGraceAge: 60,            // Ticks before own trail is "safe" to cross (0 = always penalize)

  // === Autonomy ===
  autoMove: true,                     // Start in auto mode (no manual control)

  // === Sensing (smooth + delta-paid) ===
  aiSensoryRangeBase: 220,
  aiSensoryRangeMax: 560,
  aiSenseCostPerSecond: 1.0,
  aiSenseRangePerChi: 55,
  aiSenseBiasFromFrustr: 0.65,
  aiSenseSlewPerSec: 380,

  // === Wall Avoidance ===
  aiWallAvoidMargin: 100,         // Distance from wall to start avoiding (pixels)
  aiWallAvoidStrength: 3.5,       // Strength of wall repulsion force

  // === Agent Collision ===
  enableAgentCollision: true,     // Enable collision between agents
  agentCollisionPushback: 0.3,    // Strength of separation force (0-1) - reduced to avoid wall pushing

  // === Exploration & Trail Following ===
  aiExploreNoiseBase: 0.15,
  aiExploreNoiseGain: 0.55,
  aiTrailFollowingNear: 0.75,
  aiTrailFollowingFar: 2.6,
  aiSampleDistance: 46,

  // === Frustration (now smooth 0..1) ===
  aiFrustrationBuildRate: 0.25,
  aiFrustrationDecayRate: 0.6,
  aiFrustrationSightGrace: 90,
  aiFrustrationLowTrail: 0.20,

  // === Frustration Effects ===
  aiSurgeMax: 0.35,
  aiTurnRateBase: 4.0,
  aiTurnRateGain: 3.5,

  // === Hunger System (biological drive) ===
  hungerBuildRate: 0.08,              // Rate hunger increases per second
  hungerDecayOnCollect: 0.7,          // How much hunger decreases when collecting resource (0.7 = 70% relief)
  hungerThresholdLow: 0.3,            // Below this, agent is "satisfied"
  hungerThresholdHigh: 0.7,           // Above this, agent is "starving"
  hungerExplorationAmp: 1.8,          // Multiplier on exploration noise when hungry (max)
  hungerFrustrationAmp: 2.5,          // Multiplier on frustration build rate when hungry (max)
  hungerSenseAmp: 1.5,                // Multiplier on sensory range bias when hungry (max)
  hungerSurgeAmp: 1.3,                // Multiplier on speed surge when hungry (max)

  // === Resource Scent Gradient System ===
  // Resources emit "scent" that decreases with distance, giving agents a gradient to climb
  scentGradient: {
    enabled: true,                    // Enable scent gradient system
    maxRange: 400,                    // Maximum distance scent can be detected (pixels)
    falloffType: 'inverse-square',    // 'linear', 'inverse', 'inverse-square', 'exponential'
    strength: 1.0,                    // Base strength of scent at resource location
    
    // Distance-based reward settings
    rewardEnabled: true,              // Give rewards for getting closer to food
    rewardScale: 0.5,                 // Scaling factor for distance rewards (χ per pixel closer)
    rewardUpdateInterval: 10,         // Check distance every N ticks (avoid per-frame noise)
    
    // Multi-scale density sensing
    densitySensingEnabled: true,      // Enable food density sensing in observations
    densityRadiusNear: 200,           // Near field radius (pixels)
    densityRadiusMid: 400,            // Mid field radius (pixels)
    densityRadiusFar: 600,            // Far field radius (pixels)
  },

  // === HUD ===
  hud: { 
    show: true,
    showActions: false  // Show action values (turn/thrust/senseFrac) for debugging
  },

  // === Learning System ===
  learning: {
    // Observation vector settings
    observationDims: 23,          // total observation vector size (was 15, now includes scent+density)
    normalizeObs: true,           // normalize observations to [-1, 1]
    
    // Action space
    turnRate: 0.1,                // max turn per step (radians)
    thrustScale: 1.0,             // thrust multiplier
    
    // Reward function weights
    rewards: {
      collectResource: 500.0,      // +R when collecting resource
      chiGain: 0.5,               // +R per χ gained (residual reuse)
      chiSpend: -0.1,             // -R per χ spent
      stuck: -0.8,                // -R when stuck near walls
      idle: -0.2,                 // -R per tick when idle
      explore: 10.0,              // +R for unique trail coverage
      provenanceCredit: 1,        // +R when others reuse your trails
      death: -50.0,               // -R when χ reaches 0
      gradientClimb: 2.0,         // +R per pixel moved closer to food (gradient climbing)
    },
    
    // Episode settings
    episodeLength: 5000,          // max ticks per episode
    terminateOnDeath: true,       // end episode when χ = 0
    
    // CEM/CMA-ES settings
    populationSize: 20,           // number of policies per generation
    eliteCount: 5,                // top K policies to keep
    mutationStdDev: 0.5,          // initial exploration noise
    generations: 100,             // training generations
  },

  // === Rendering & UI ===
  rendering: {
    renderTrail: true,
    hud: { show: true },
  },

  // === Controls ===
  controls: {
    autoMove: false,              // toggle with [A]
  },
};

