# Config Optimization Training Guide

This directory contains tools and snapshots for optimizing CONFIG parameters using the Cross-Entropy Method (CEM).

## 📁 Directory Structure

```
training/
├── README.md                    # This file
├── convertOptimizedConfigs.js   # Converter script for config formats
├── snapshots/                   # Baseline metrics from heuristic AI
│   └── baseline-metrics-*.json
└── optConfigs/                  # Optimized configurations
    ├── optimized-config-*.json      # Full optimizer state
    └── config-profile-*.json        # Config panel compatible
```

## 🎯 Workflow

### 1. Collect Baseline Metrics

First, gather performance data from your current heuristic AI:

1. **Open Training Panel**: Press `[L]`
2. **Start Baseline Collection**: Click "▶️ Start" in "Baseline Metrics" section
3. **Let it run**: Wait for ~30+ snapshots (watch the counter)
4. **Stop Collection**: Click "⏸️ Stop"
5. **Export Data**: Click "📊 Export Baseline Metrics"

The exported file shows how your current config performs across all metrics (F, C, R).

### 2. Run Config Optimization

Optimize parameters to improve performance:

1. **Open Training Panel**: Press `[L]`
2. **Choose Objective**: Select from dropdown
   - **Balanced (F+C+R)**: All-around performance
   - **Foraging (F)**: Find resources efficiently
   - **Collective (C)**: Trail sharing & cooperation
   - **Resilient (R)**: Exploration & recovery
3. **Set Generations**: Start with 5-10 for testing
4. **Click "🚀 Start"**: Training begins!
   - World pauses during optimization
   - Console shows progress per generation
   - UI updates with fitness scores

### 3. Test Optimized Config

After optimization completes:

**Option A: Quick Test (Recommended)**
1. Click "🎮 Test" button
2. Config applies + world resets automatically
3. Watch agents perform with optimized parameters!

**Option B: Manual Apply**
1. Click "✅ Apply" button
2. Manually reset world if needed (`[R]` key)
3. Unpause with `[Space]`

### 4. Save & Export

Save your optimized configs:

1. **Click "💾 Save"**: Exports TWO files:
   - `optimized-config-genX-...json` - Full optimizer state (for resuming training)
   - `config-profile-genX-...json` - Config panel compatible (for easy loading)

## 📥 Loading Optimized Configs

### Method 1: Via Config Panel (Easiest)

Use the **config panel compatible** file (`config-profile-*.json`):

1. Press `[O]` to open config panel
2. Click **"Import"** button
3. Select `config-profile-genX-...json`
4. ✅ Parameters automatically update in sliders!

### Method 2: Via Training Panel

Use the **full optimizer** file (`optimized-config-*.json`):

1. Press `[L]` to open training panel
2. In "Config Optimization" section, click **"📂 Load"**
3. Select `optimized-config-genX-...json`
4. Click **"✅ Apply"** or **"🎮 Test"**

## 🔄 Converting Existing Files

If you have old optimizer files without the config panel format:

```bash
cd training
node convertOptimizedConfigs.js optConfigs/
```

This generates `config-profile-*.json` files for all your existing `optimized-config-*.json` files.

## 📊 Understanding the Metrics

### Composite Objectives

**Foraging Efficiency (F)**
```
F = z(find_rate) + z(energy_roi) - z(path_inefficiency)
```
- Maximize resource discovery rate
- Improve energy return on investment
- Minimize wasted movement

**Collective Intelligence (C)**
```
C = z(shared_trail_use) + z(link_persistence) + z(guidance_efficacy)
```
- Increase trail reuse (cooperation)
- Maintain stable agent links
- Improve trail-guided resource finding

**Resilient Exploration (R)**
```
R = z(spatial_coverage) + z(frontier_rate) - z(stuckness)
```
- Cover more territory
- Discover new areas continuously
- Avoid getting trapped

### Key Metrics Tracked

- **survival_rate**: Fraction of agents alive
- **mean_chi**: Average energy across agents
- **energy_roi**: Chi gained / chi spent
- **find_rate**: Resources found per 1000 ticks
- **spatial_coverage**: % of world explored
- **shared_trail_use**: % of chi from trail reuse
- **link_persistence**: Average age of agent links
- **guidance_efficacy**: % finds near strong trails

## ⚙️ Tunable Parameters

The optimizer adjusts 19 CONFIG parameters:

**Metabolism** (3)
- `baseDecayPerSecond`, `moveSpeedPxPerSec`, `moveCostPerSecond`

**Sensing** (3)
- `sensing.radius`, `sensing.costPerSecond`, `sensing.radiusRangeFactor`

**Trail System** (4)
- `trail.emitPerSecond`, `trail.decayPerSecond`, `trail.attractionGain`, `trail.costPerSecond`

**Frustration** (4)
- `frustration.riseRate`, `frustration.fallRate`, `frustration.noiseGain`, `frustration.hungerAmplify`

**Link System** (5)
- `link.formCost`, `link.maintPerSec`, `link.decayPerSec`, `link.strengthenPerUse`, `link.guidanceGain`

## 🎓 Tips

1. **Start small**: Run 5 generations first to test
2. **Compare objectives**: Try different objectives on same baseline
3. **Check convergence**: High convergence (>80%) means optimizer has settled
4. **Save everything**: Export both baseline and optimized configs
5. **Visual test**: Use "🎮 Test" button to see configs in action
6. **Iterate**: If stuck at low fitness, try more generations or different objective

## 🐛 Troubleshooting

**Training appears frozen?**
- Check console for progress logs (`📊 Gen X | Fitness: Y`)
- World is paused during training (normal behavior)

**Config doesn't apply?**
- Make sure you're using `config-profile-*.json` for config panel
- Or use `optimized-config-*.json` with training panel Load button

**Fitness is 0 or negative?**
- Check baseline metrics first - make sure agents survive
- Try "balanced" objective first before specialized ones
- Increase episode length in `config.js` if agents die too quickly

**Optimization takes forever?**
- Reduce generations (5 is plenty for testing)
- Each generation runs 20 episodes with full metrics tracking
- Expected time: ~30-60 seconds per generation

## 📖 Further Reading

See `plans/Training.md` for detailed metric definitions and optimization theory.

