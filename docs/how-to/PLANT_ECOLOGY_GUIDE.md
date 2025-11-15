<!-- ormd:0.1 -->
---
title: "Plant Ecology System - Resource Management"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.731244Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# Plant Ecology System - Resource Management

## 🌿 Overview

The **Plant Ecology System** transforms resource spawning from random chaos into a rich, plant-inspired ecosystem with soil fertility, seed dispersal, and succession dynamics!

---

## ✅ What Was Implemented

### 1. **Fertility Grid System**
- Grid-based soil quality tracking (similar to trail system)
- Each cell has fertility value (0-1)
- Resources only grow in fertile soil
- Fertility visualized as green gradient overlay

### 2. **Resource Clustering (Patches)**
- Initial resources spawn in 3 fertile "patches"
- Patches create natural resource gardens
- Gaussian falloff from patch centers
- Resources cluster together like real plants

### 3. **Seed Dispersal**
- Existing resources can spawn "seeds" nearby
- Seeds only take root in fertile soil
- Creates spreading resource networks
- Distance-limited dispersal (120px radius)

### 4. **Spontaneous Growth**
- Resources can appear in fertile areas
- Biased toward high-fertility locations
- Simulates natural plant emergence
- Fills in gaps in the ecosystem

### 5. **Nutrient Depletion**
- Harvesting depletes local soil fertility
- Area-of-effect depletion (60px radius)
- Creates visible "dead zones" from over-harvesting
- Prevents infinite resource farming

### 6. **Ecological Recovery**
- Unharvested soil slowly recovers fertility
- Faster recovery in abandoned areas
- Grace period after harvest (2 seconds)
- Enables succession and regrowth

### 7. **Population Pressure**
- Too many agents cause global soil degradation
- Threshold: 6 agents (configurable)
- Simulates overgrazing/overpopulation
- Creates natural population limits

---

## 🎮 How It Works

### The Cycle

```
1. Initial State
   ├─ 3 fertile patches spawn
   └─ Resources cluster in patches

2. Growth Phase
   ├─ Seeds disperse to nearby fertile soil
   ├─ Spontaneous growth in high-fertility areas
   └─ Population expands

3. Harvesting Phase
   ├─ Agents collect resources
   ├─ Local soil becomes depleted
   └─ "Dead zones" form in overused areas

4. Recovery/Succession
   ├─ Abandoned areas recover fertility
   ├─ New resources sprout in recovered soil
   └─ Ecosystem shifts to new locations

5. Equilibrium or Collapse
   ├─ IF population balanced → stable patches
   └─ IF overpopulated → widespread degradation
```

---

## 🎨 Visualization

Press **[P]** to toggle fertility visualization!

### What You'll See

**Green Gradient Overlay:**
- Dark green = High fertility (0.8-1.0)
- Medium green = Moderate fertility (0.4-0.7)
- Light green = Low fertility (0.2-0.4)
- No color = Depleted (0-0.2)

**Resource Colors:**
- Bright green (#00ffBB) = In fertile soil
- Dim green (#009B58) = In depleted soil
- Glowing ring = Young resource (just sprouted)

**Console Messages:**
```
🌱 Seed sprouted at (450, 320) | Fertility: 0.87
🌿 Spontaneous growth at (680, 180) | Fertility: 0.92
```

---

## ⚙️ Configuration

All settings in `config.js` → `plantEcology` section:

```javascript
plantEcology: {
  enabled: true,                    // Master toggle
  
  // Grid settings
  fertilityCell: 40,                // Cell size (pixels)
  
  // Initial conditions
  initialFertility: 0.8,            // Starting soil quality
  fertilityVariation: 0.3,          // Random variation
  patchCount: 3,                    // Number of fertile patches
  patchRadius: 150,                 // Patch radius (pixels)
  patchFertility: 0.9,              // Patch center fertility
  
  // Growth mechanics
  seedChance: 0.02,                 // Seed spawn chance/sec
  seedDistance: 120,                // Max seed dispersal (pixels)
  growthFertilityThreshold: 0.3,    // Min fertility for growth
  growthChance: 0.15,               // Spontaneous growth chance/sec
  
  // Depletion & recovery
  harvestDepletion: 0.15,           // Fertility lost per harvest
  harvestRadius: 60,                // Depletion radius (pixels)
  fertilityRecovery: 0.05,          // Recovery rate/sec
  maxFertility: 1.0,                // Max fertility cap
  
  // Population pressure
  populationPressure: true,         // Enable overpopulation effects
  pressurePerAgent: 0.01,           // Degradation per agent/sec
  pressureThreshold: 6,             // Agents before pressure kicks in
}
```

---

## 🔬 Mechanics Deep Dive

### Fertility Grid

Similar to the trail system, world is divided into cells:
- **Grid size**: `innerWidth / 40` × `innerHeight / 40`
- **Cell size**: 40×40 pixels
- **Storage**: Float32Array for fertility values
- **Timestamp**: Track when each cell was last harvested

### Patch Generation

Initial patches created with Gaussian distribution:
```javascript
strength = exp(-(distance²) / (radius² × 0.5))
fertility = base + patchFertility × strength
```

Creates smooth, natural-looking fertile regions.

### Seed Dispersal

Every frame, each resource has a chance to spawn a seed:
1. Roll random chance (2% per second)
2. Pick random angle and distance (0-120px)
3. Check if location is fertile enough (>0.3)
4. If yes, create new resource there

### Harvest Depletion

When resource collected:
1. Find all grid cells within 60px radius
2. Calculate falloff: `strength = 1 - (dist / radius)`
3. Reduce fertility: `fertility -= 0.15 × strength`
4. Mark harvest timestamp

Creates circular "dead zones" around harvested resources.

### Recovery

Every frame, each grid cell:
1. Calculate time since last harvest
2. Apply recovery grace period (120 ticks = 2 sec)
3. Recover fertility: `fertility += 0.05 × dt × graceFactor`
4. Cap at maxFertility (1.0)

Abandoned areas recover faster!

### Population Pressure

When population > 6:
```javascript
excess = population - 6
degradation = 0.01 × excess × dt
fertility -= degradation  // Applied to ALL cells
```

Global effect - overpopulation hurts entire ecosystem!

---

## 📊 Expected Dynamics

### Early Game (0-60 seconds)
- **Resources**: Clustered in 3 patches
- **Behavior**: Agents converge on patches
- **Fertility**: High in patches, low elsewhere
- **Growth**: Seeds spread from initial patches

### Mid Game (60-180 seconds)
- **Resources**: Expanding networks from seeds
- **Behavior**: Agents follow resource expansion
- **Fertility**: Depletion zones appear near heavily-used patches
- **Growth**: New patches form in recovered areas

### Late Game (180+ seconds)
- **Resources**: Scattered across recovered areas
- **Behavior**: Agents migrate between patches
- **Fertility**: Mosaic of fertile/depleted zones
- **Growth**: Succession - resources shift to new locations

### Overpopulation Scenario
- **Population**: Exceeds carrying capacity (>8-12 agents)
- **Resources**: Can't keep up with demand
- **Fertility**: Global degradation
- **Outcome**: Resource scarcity → population crash → recovery

---

## 🌍 Ecological Patterns

### Patch Dynamics

**Formation:**
1. Initial patches spawn with high fertility
2. Resources cluster in patches
3. Agents converge on rich patches

**Succession:**
1. Heavy harvesting depletes patch soil
2. Resources stop growing in patch
3. Agents leave to find new patches
4. Old patch recovers fertility slowly
5. New resources eventually sprout
6. Cycle repeats!

### Boom-Bust Cycles

**Boom Phase:**
1. High fertility → lots of resources
2. Agents thrive → population grows (mitosis)
3. More agents → more harvesting

**Transition:**
1. Over-harvesting depletes soil
2. Resource growth slows
3. Population exceeds carrying capacity

**Bust Phase:**
1. Resource scarcity
2. Agents die off (chi depletion)
3. Population crashes

**Recovery:**
1. Fewer agents → less pressure
2. Soil fertility recovers
3. Resources regrow
4. Cycle repeats!

### Spatial Waves

Resources create "traveling wave" patterns:
- Front edge: High fertility, rapid growth
- Middle: Active harvesting, moderate fertility
- Back edge: Depleted, recovering
- Wave moves as agents migrate forward

---

## 🎯 Integration with Other Systems

### + Mitosis System
- Resources abundant → agents reproduce
- Resources scarce → population limited
- Creates true carrying capacity!

### + Scent Gradients
- Agents follow gradients to patches
- When patch depleted, gradients lead elsewhere
- Natural migration patterns emerge

### + Trail System
- Successful agents leave trails to patches
- Others follow trails to fertile areas
- Cooperative foraging reinforced

### All Together
**Emergent behavior:**
1. Agents find fertile patch (scent gradient)
2. Leave trails to patch (cooperation)
3. Reproduce if successful (mitosis)
4. Deplete patch over time (ecology)
5. Migrate to new patch (adaptation)
6. Cycle continues!

---

## 🔧 Tuning Guide

### Want More Resource Clustering?

```javascript
patchCount: 2,              // Fewer, larger patches
patchRadius: 200,           // Bigger patches
seedDistance: 80,           // Shorter dispersal (tighter clusters)
```

### Want Faster Regrowth?

```javascript
fertilityRecovery: 0.10,    // Faster recovery
growthChance: 0.25,         // More spontaneous growth
seedChance: 0.04,           // More seeds
```

### Want Harsher Depletion?

```javascript
harvestDepletion: 0.25,     // More depletion per harvest
harvestRadius: 80,          // Larger depletion area
fertilityRecovery: 0.02,    // Slower recovery
```

### Want Population Control?

```javascript
populationPressure: true,
pressureThreshold: 4,       // Earlier pressure
pressurePerAgent: 0.02,     // Stronger degradation
```

### Want Wandering Resources?

```javascript
patchCount: 5,              // Many small patches
patchRadius: 80,            // Smaller patches
seedDistance: 200,          // Long-range dispersal
fertilityVariation: 0.5,    // High variation
```

---

## 🧪 Experimental Scenarios

### Desert Mode (Harsh Environment)
```javascript
initialFertility: 0.3,      // Poor initial soil
patchCount: 1,              // Single oasis
harvestDepletion: 0.30,     // Harsh depletion
fertilityRecovery: 0.01,    // Very slow recovery
```

**Result:** Brutal survival, agents must be careful!

### Garden of Eden (Abundant Resources)
```javascript
initialFertility: 0.9,      // Rich soil everywhere
patchCount: 5,              // Many patches
harvestDepletion: 0.05,     // Gentle depletion
fertilityRecovery: 0.15,    // Fast recovery
```

**Result:** Easy mode, population explodes!

### Wandering Oasis (Dynamic Patches)
```javascript
patchCount: 2,
patchRadius: 100,
seedDistance: 250,          // Long dispersal
growthChance: 0.30,         // Aggressive growth
harvestDepletion: 0.20,
fertilityRecovery: 0.08,
```

**Result:** Resources "move" across landscape as agents deplete and recover areas!

---

## 📈 Statistics to Watch

### Fertility Health

Monitor in console or add to HUD:
```javascript
avgFertility = sum(fertility) / gridCells
```

- **> 0.7**: Healthy ecosystem
- **0.4 - 0.7**: Moderate pressure
- **0.2 - 0.4**: Heavy degradation
- **< 0.2**: Ecosystem collapse

### Resource Distribution

Count resources per fertility level:
- High fertility (>0.7): Should be most resources
- Medium (0.4-0.7): Moderate
- Low (<0.4): Few or none

Imbalance indicates over-harvesting!

### Succession Rate

Track how often patches shift:
- Fast succession: Resources moving rapidly
- Slow succession: Stable patches
- No succession: Ecosystem stuck

---

## 💡 Pro Tips

1. **Press [P]** to toggle fertility visualization - watch soil degrade and recover!

2. **Watch resource colors** - dim green = depleted soil, bright green = fertile soil

3. **Look for patterns** - resources cluster → agents converge → depletion → migration

4. **Population matters** - too many agents = global degradation

5. **Abandoned areas recover** - old patches can regrow after agents leave

6. **Seed dispersal creates networks** - resources spread like mycelial networks

7. **Try different configs** - harsh desert vs abundant garden have totally different dynamics

---

## 🐛 Troubleshooting

**Q: Resources not growing?**
- Check fertility - need >0.3 for growth
- Check population - too many agents cause pressure
- Wait for recovery - depleted areas need time

**Q: All resources in one spot?**
- Increase `patchCount` for distribution
- Increase `seedDistance` for dispersal
- Decrease `patchRadius` for smaller clusters

**Q: Resources everywhere?**
- Decrease `seedChance` and `growthChance`
- Increase `harvestDepletion`
- Decrease `fertilityRecovery`

**Q: No visible depletion?**
- Press [P] to show fertility overlay
- Check `harvestDepletion` - might be too low
- Check `fertilityRecovery` - might be too fast

**Q: Fertility won't recover?**
- Check population - overpopulation prevents recovery
- Check `pressureThreshold` - might be too low
- Increase `fertilityRecovery` rate

---

## 🎓 Theory: Why This Works

### Optimal Foraging Theory

Animals (and agents!) follow gradients to maximize energy intake:
1. Detect resource (scent gradient)
2. Exploit patch until depleted (diminishing returns)
3. Migrate to new patch (optimal foraging)

### Succession Ecology

Plant communities change over time:
1. **Pioneer stage**: First resources colonize fertile soil
2. **Growth stage**: Resources spread via seeds
3. **Mature stage**: Dense patches form
4. **Disturbance**: Harvesting depletes nutrients
5. **Recovery**: Abandoned areas regrow
6. **Cycle repeats**

### Carrying Capacity

Population limited by resources:
```
K = (resource growth rate) / (per-capita consumption)
```

When population > K:
- Resource depletion outpaces growth
- Fertility declines
- Population must decrease

**Our system implements this naturally!**

### Tragedy of the Commons

Shared resources get over-exploited:
- Individual agents benefit from harvesting
- Collective cost (soil depletion) shared by all
- Without restraint → collapse

**Can agents learn sustainable foraging?** 🤔

---

## 📝 Files Added/Modified

### New Files:
- **`plantEcology.js`** - Fertility grid & plant mechanics

### Modified Files:
- **`config.js`** - Added `plantEcology` config section
- **`app.js`** - Integrated fertility system, seed dispersal, depletion, visualization

---

## 🚀 What's Next?

### Possible Extensions:

1. **Different Resource Types**
   - "Fruit trees" vs "grass"
   - Different growth rates and yields

2. **Seasonal Cycles**
   - Fertility varies over time
   - "Spring" = high growth, "Winter" = low

3. **Nutrient Types**
   - Nitrogen, phosphorus, potassium
   - Different resources need different nutrients

4. **Symbiosis**
   - Some resources boost others' growth
   - Mycorrhizal networks!

5. **Fire/Disturbance**
   - Reset fertility in areas
   - Creates succession opportunities

6. **Agent Learning**
   - Can they learn sustainable harvesting?
   - Reward for preserving fertility?

---

## 🎉 Summary

You now have a **fully functional plant ecology system** with:

✅ Soil fertility grid with tracking  
✅ Resource clustering in fertile patches  
✅ Seed dispersal from existing resources  
✅ Spontaneous growth in fertile soil  
✅ Nutrient depletion on harvest  
✅ Ecological recovery over time  
✅ Population pressure effects  
✅ Fertility visualization ([P] key)  
✅ Integration with mitosis & scent systems  

**Resources no longer spawn randomly - they behave like living plants in a dynamic ecosystem!**

Press **[P]** to see the soil fertility and watch the ecology unfold! 🌿✨

---

## 🌍 The Big Picture

Your simulation now has THREE interconnected systems:

1. **Scent Gradients** → Navigation
2. **Mitosis** → Population Dynamics  
3. **Plant Ecology** → Resource Dynamics

Together they create a **truly emergent ecosystem** where:
- Agents navigate → find resources → reproduce
- Population grows → depletes resources → crashes
- Ecology recovers → resources regrow → cycle continues

**Watch natural selection and ecological succession happen in real-time!** 🔬🧬🌿

