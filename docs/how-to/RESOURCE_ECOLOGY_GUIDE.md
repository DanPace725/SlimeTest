<!-- ormd:0.1 -->
---
title: "Resource Ecology System Guide"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.732908Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# Resource Ecology System Guide

## Overview

The **Resource Ecology System** simulates realistic ecosystem dynamics where resources start abundant but stabilize at a lower carrying capacity due to harvesting pressure. This creates a dynamic environment that mirrors real-world ecological patterns.

---

## 🌿 Ecological Model

### Inspiration: Carrying Capacity in Ecology

This system is based on **carrying capacity** - a fundamental concept in ecology:

```
Initial State: Virgin ecosystem with abundant resources
↓
Harvesting Pressure: Agents collect resources faster than recovery
↓
Depletion: Carrying capacity declines under pressure
↓
Stabilization: Ecosystem reaches sustainable equilibrium
```

**Real-World Examples:**
- **Fisheries:** Abundant fish → overfishing → depleted stocks → managed quotas
- **Agriculture:** Fertile land → intensive farming → soil depletion → rotation/fallow
- **Foraging:** Berry patches → heavy picking → fewer berries → regrowth at lower density

---

## 🎯 How It Works

### Phase 1: Initial Abundance (Gen 0)

```javascript
Resources at start: Random between 5-7 (configurable)
Carrying Capacity: Matches initial count (high)
Pressure: 0% (pristine ecosystem)
```

**Behavior:** Agents find resources easily, hunger stays low, little competition.

### Phase 2: Depletion (Early Collections)

```javascript
Each collection increases pressure by 1.5% (default)
Carrying capacity drops: 7 → 6 → 5 → 4...
Resources become scarcer
```

**Behavior:** Agents must search more, hunger increases, competition emerges.

### Phase 3: Stabilization (Long-term)

```javascript
Pressure reaches equilibrium (~67-100%)
Carrying capacity stabilizes: 2-4 resources (configurable)
Random spawning maintains stable population
```

**Behavior:** Sustainable foraging at lower density, consistent scarcity.

---

## ⚙️ Configuration Parameters

### In `config.js`:

```javascript
// === Resource Ecology (dynamic resource availability) ===
resourceDynamicCount: true,       // Enable dynamic ecology vs fixed count
resourceInitialMin: 5,            // Starting resources (min)
resourceInitialMax: 7,            // Starting resources (max)
resourceStableMin: 2,             // Stable minimum after depletion
resourceStableMax: 4,             // Stable maximum after depletion
resourceDepletionRate: 0.015,     // Pressure increase per collection (1.5%)
resourceRecoveryChance: 0.10,     // Chance per second to spawn resource (10%)

// Legacy mode
resourceCount: 3,                 // Fixed count (when resourceDynamicCount = false)
```

### Parameter Meanings

**`resourceInitialMin/Max`** - Initial abundance
- Higher values = more "virgin ecosystem" feel
- Random between min/max adds variation per episode
- Recommended: 5-7 for abundant start

**`resourceStableMin/Max`** - Long-term equilibrium
- Lower values = harsher ecosystem after depletion
- Should be less than initial values
- Recommended: 2-4 for challenging but fair

**`resourceDepletionRate`** - How fast ecosystem degrades
- Higher = faster decline to stable state
- Lower = slower, more gradual transition
- Recommended: 0.010-0.020 (1-2% per collection)

**`resourceRecoveryChance`** - Natural regeneration
- Chance per second to spawn a resource (if below stable max)
- Higher = more frequent spawns
- Recommended: 0.05-0.15 (5-15% per second)

---

## 📊 Ecological Metrics

### Carrying Capacity
Current maximum resources the ecosystem can support:
```javascript
carryingCapacity = stableMin + (initialMax - stableMin) × (1 - pressure)
```

**Example trajectory:**
```
Start: 7 resources, 0% pressure → capacity = 7
After 20 collections: 30% pressure → capacity ≈ 5
After 50 collections: 75% pressure → capacity ≈ 3
After 100 collections: 100% pressure → capacity = 2 (stable min)
```

### Resource Pressure
Accumulated harvesting stress on ecosystem (0-100%):
```javascript
Increases: +1.5% per resource collection
Decreases: -0.1% per second (slow natural recovery)
```

**Pressure Effects:**
- 0-33%: Abundant phase (high capacity)
- 33-67%: Transition phase (declining capacity)
- 67-100%: Stable phase (low capacity)

### Resource Count
Actual resources currently available:
```javascript
current ≤ carryingCapacity ≤ stableMax
```

Resources can spawn randomly but won't exceed capacity.

---

## 🎮 Behavioral Impact on Agents

### Early Game (High Resources)
```
✓ Easy to find food
✓ Low hunger levels
✓ Less frustration
✓ Agents can be "lazy" and still survive
✓ Less cooperation needed
```

### Mid Game (Declining Resources)
```
⚠ Resources becoming scarce
⚠ Hunger increases
⚠ More competition between agents
⚠ Trail-following becomes more valuable
⚠ Frustration episodes increase
```

### Late Game (Stable Low Resources)
```
🚨 Persistent scarcity
🚨 High hunger common
🚨 Desperate behavior frequent
🚨 Cooperation essential for survival
🚨 Only efficient agents thrive
```

---

## 🔬 Ecological Dynamics

### Pressure Accumulation
```javascript
Every resource collected → +1.5% pressure
Pressure decays slowly → -0.1% per second

Net effect: Harvesting faster than natural recovery = pressure builds
```

**Example Timeline:**
```
t=0s:    0% pressure, 7 resources
t=10s:   5 collections → 7.5% pressure, 6 resources
t=60s:   20 collections → 30% pressure, 5 resources
t=300s:  50 collections → 75% pressure, 3 resources
t=600s:  Stable at 2-3 resources, pressure ~80-100%
```

### Resource Recovery
When below stable max:
```javascript
10% chance per second to spawn resource
= 1 resource every ~10 seconds on average (if space available)
```

**Prevents extinction:** Even with heavy harvesting, some resources always regenerate.

### Carrying Capacity Dynamics
```javascript
Target capacity based on pressure:
  capacity = 2 + (7 - 2) × (1 - 0.75) = 2 + 1.25 ≈ 3 resources

Actual capacity adjusts gradually toward target.
```

This creates smooth transitions rather than sudden drops.

---

## 📈 HUD Display

The HUD shows real-time ecology status:

```
🌿 resources: 3/5 (pressure: 45%)
    ↑       ↑ ↑           ↑
    │       │ │           └─ Current harvesting pressure
    │       │ └───────────── Current carrying capacity
    │       └─────────────── Current resource count
    └─────────────────────── Dynamic ecology indicator
```

**Reading the metrics:**
- `3/5`: 3 resources currently, capacity is 5
- `pressure: 45%`: Ecosystem is moderately stressed
- Low pressure (0-30%) = abundant phase
- High pressure (70-100%) = depleted phase

---

## 🎯 Tuning Strategies

### For Abundant Ecosystems
```javascript
resourceInitialMax: 10        // Very abundant start
resourceStableMin: 4          // Higher stable floor
resourceDepletionRate: 0.008  // Slower decline
resourceRecoveryChance: 0.20  // Fast regeneration
```
**Effect:** Resources stay plentiful, less scarcity pressure.

### For Harsh Ecosystems
```javascript
resourceInitialMax: 5         // Moderate start
resourceStableMin: 1          // Brutal stable state
resourceDepletionRate: 0.025  // Rapid decline
resourceRecoveryChance: 0.05  // Slow regeneration
```
**Effect:** Quickly depletes, creates survival challenge.

### For Realistic Balance
```javascript
resourceInitialMin: 5         // Comfortable start
resourceInitialMax: 7
resourceStableMin: 2          // Scarce but survivable
resourceStableMax: 4
resourceDepletionRate: 0.015  // Moderate decline
resourceRecoveryChance: 0.10  // Balanced regeneration
```
**Effect:** Natural boom-bust cycle, realistic ecology. (Default)

### For Fixed Resources (Legacy)
```javascript
resourceDynamicCount: false   // Disable ecology
resourceCount: 3              // Always 3 resources
```
**Effect:** No ecology dynamics, constant resource count.

---

## 🧪 Experimental Variations

### Cyclic Seasons
```javascript
// Add to World.updateEcology():
const season = Math.sin(globalTick * 0.001); // Cycles over time
const seasonalBonus = season > 0 ? season * 2 : 0;
const targetCapacity = Math.floor(
  CONFIG.resourceStableMin + 
  (CONFIG.resourceInitialMax - CONFIG.resourceStableMin) * 
  (1 - this.resourcePressure) +
  seasonalBonus  // More resources in "summer"
);
```

### Catastrophic Events
```javascript
// Random resource crashes
if (Math.random() < 0.001 * dt) { // 0.1% chance per second
  this.resourcePressure = Math.min(1, this.resourcePressure + 0.3);
  console.log('💥 Ecosystem shock! Pressure +30%');
}
```

### Resource Types
```javascript
// Different resources with different spawn rates
resources: [
  { type: 'common', count: 4, recovery: 0.15 },
  { type: 'rare', count: 1, recovery: 0.02 }
]
```

---

## 📊 Statistics & Analytics

### Track in Console
```javascript
// Add to World.onResourceCollected():
if (World.collected % 10 === 0) {
  console.log(`[Ecology] Collections: ${World.collected}, ` +
              `Resources: ${World.resources.length}/${World.carryingCapacity}, ` +
              `Pressure: ${(World.resourcePressure * 100).toFixed(1)}%`);
}
```

### Recommended Metrics
- **Collections per resource** = Total collections / Current resource count
  - Low = resources plentiful
  - High = agents competing heavily

- **Pressure trend** = Rate of pressure increase
  - Increasing = unsustainable harvesting
  - Stable = equilibrium reached

- **Spawn frequency** = Resources added / time
  - Matches recovery chance if below capacity

---

## 🌍 Ecological Parallels

### Tragedy of the Commons
Individual agents optimize for themselves, collectively deplete shared resources:
```
Each agent: "I'll collect this resource" (rational)
Result: All agents → depleted ecosystem → all suffer
```

**Solution in simulation:** Agents must learn sustainable harvesting rates.

### r/K Selection Theory
- **r-selected:** Thrive in abundant phase (fast reproduction, opportunistic)
- **K-selected:** Thrive in stable phase (efficient, competitive)

Agents that adapt to both phases perform best.

### Lotka-Volterra Dynamics
Predator-prey oscillations:
```
High resources → agents thrive → population grows →
→ resources depleted → agents starve → population drops →
→ resources recover → cycle repeats
```

This system creates similar boom-bust patterns!

---

## 🎓 Teaching Moments

### For Students
1. **Carrying capacity:** Resources can't support unlimited growth
2. **Sustainability:** Harvest rate must not exceed recovery rate
3. **Competition:** Scarcity creates competitive pressure
4. **Cooperation:** Sharing information (trails) helps all agents

### For ML Training
1. **Non-stationary environment:** Resource availability changes over time
2. **Long-term strategy:** Agents must adapt to changing conditions
3. **Exploration-exploitation:** Balance immediate gains vs. sustainable foraging
4. **Multi-agent dynamics:** Actions affect environment for all agents

---

## 🔧 Troubleshooting

### Resources disappear completely
**Cause:** Recovery chance too low or pressure too high
**Fix:** Increase `resourceRecoveryChance` or decrease `resourceDepletionRate`

### Too many resources always
**Cause:** Recovery too high or pressure too low
**Fix:** Decrease `resourceRecoveryChance` or increase `resourceDepletionRate`

### No transition (stuck at initial count)
**Cause:** Depletion rate too low
**Fix:** Increase `resourceDepletionRate` to 0.02-0.03

### Instant depletion to minimum
**Cause:** Depletion rate too high
**Fix:** Decrease `resourceDepletionRate` to 0.01 or lower

---

## 🚀 Future Enhancements

### Spatial Variation
```javascript
// Different regions have different capacities
regions = [
  { x: 0-400, capacity: 'high' },
  { x: 400-800, capacity: 'low' }
]
```

### Resource Quality
```javascript
// Resources give different rewards based on ecosystem health
reward = baseReward × (1 + 0.5 × (1 - pressure))
// Healthy ecosystem = more nutritious resources
```

### Agent Impact
```javascript
// Larger/faster agents cause more pressure per collection
pressure += depletionRate × agent.size / baseSize
```

### Ecosystem Services
```javascript
// Healthy ecosystem provides benefits
if (pressure < 0.3) {
  agents.forEach(a => a.chiGainBonus *= 1.2); // 20% bonus in healthy ecosystem
}
```

---

## 📚 Summary

The **Resource Ecology System** brings your simulation to life with realistic ecosystem dynamics:

✅ **Initial abundance** → agents thrive, low competition
✅ **Gradual depletion** → increasing scarcity, rising hunger
✅ **Stable equilibrium** → sustainable but challenging
✅ **Natural variation** → random spawns add unpredictability
✅ **Visual feedback** → HUD shows current state
✅ **Configurable** → tune to desired difficulty

**Key insight:** The environment itself becomes a dynamic challenge that evolves with agent behavior, creating emergent ecological patterns and forcing adaptation over time.

---

*Resource Ecology System implemented November 4, 2025*  
*Based on carrying capacity theory and optimal foraging models*

