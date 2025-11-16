<!-- ormd:0.1 -->
---
title: "Chi Recycling  Decay System"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.724136Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# Chi Recycling & Decay System

## Overview
Dead agents don't just disappear—they decay over time and recycle their remaining chi back into the environment, creating a beautiful ecological cycle where **death feeds life**.

## Concept
```
Agents eat plants → grow → reproduce → die → decay → fertilize soil → more plants grow
```

This creates a closed-loop ecosystem where:
- **Death is not wasteful** - chi is recycled back into the environment
- **Dead agents become fertilizer** - boosting soil fertility for future plant growth
- **Visual feedback** - agents visibly decay (fade, shrink) before removal
- **Population dynamics** - death opens up "slots" for new reproduction

## Configuration

### Decay Settings (`config.js`)
```javascript
decay: {
  enabled: true,                    // Enable decay system
  duration: 360,                    // Ticks for full decay (6 seconds at 60fps)
  fertilityBoost: 0.4,              // Chi → fertility conversion rate
  releaseRadius: 80,                // Area of effect for chi release (pixels)
  visualFade: true,                 // Gradually fade and shrink visually
  removeAfterDecay: true,           // Remove fully decayed agents from array
}
```

### Parameters Explained
- **`duration`**: How long (in ticks) before a dead agent is fully decayed and removed
  - Higher = slower decay, dead bodies persist longer
  - Lower = faster cleanup, more immediate recycling
  
- **`fertilityBoost`**: Conversion efficiency from chi to fertility
  - Each point of chi at death → `fertilityBoost` fertility added to soil
  - Higher = dead agents provide more nutrients
  
- **`releaseRadius`**: Spatial spread of the chi recycling effect
  - Larger radius = nutrients spread over wider area (good for general fertility)
  - Smaller radius = concentrated fertilization (creates hotspots)
  
- **`visualFade`**: Whether to show visual decay progression
  - Dead agents fade to brown/gray and shrink to 40% original size
  - Creates clear visual feedback of the decay process

## Implementation Details

### Death Tracking
When an agent dies (`chi === 0`):
```javascript
this.alive = false;
this.deathTick = globalTick;      // Record time of death
this.chiAtDeath = 0;               // Track remaining chi (usually 0)
```

### Decay Process
Each frame, dead agents:
1. **Calculate decay progress** (0 to 1 based on time since death)
2. **Release chi gradually** into fertility grid (2% per interval)
3. **Visual transformation**:
   - Fade to 70% → 0% opacity
   - Color shifts to dark brown (#3C3228)
   - Shrink to 40% of original size
4. **Removal** when fully decayed (`decayProgress >= 1.0`)

### Chi Recycling Mechanics
```javascript
// Every 10 ticks, release some chi into the soil
const chiToRelease = this.chiAtDeath * 0.02;  // 2% per release
const fertilityGain = chiToRelease * CONFIG.decay.fertilityBoost;

fertilityGrid.addFertilityRadial(
  this.x,                           // Center at dead agent position
  this.y, 
  CONFIG.decay.releaseRadius,       // Spread over radius
  fertilityGain                     // Amount to add
);
```

The fertility boost uses a **Gaussian falloff**:
- Strongest at the death location
- Gradually decreases with distance
- Integrated into existing plant ecology system

## Integration with Other Systems

### Plant Ecology
- Dead agents boost fertility → more resources spawn nearby
- Creates **resource clustering** around battlegrounds
- Agents that die in fertile areas make them even more fertile
- **Positive feedback loop**: successful areas → more deaths → more fertility → even more successful

### Mitosis System
- Death creates population "slots" for new births
- Carrying capacity now properly accounts for living agents only
- Dead agents no longer block reproduction
- **Population cycles**: growth → overpopulation → starvation → decay → recovery → growth

### Visual System
- Dead agents remain visible during decay
- Clear visual progression (size, color, opacity)
- Easy to distinguish dead (brown, fading) from alive (colored, vibrant)
- Removal happens smoothly, not instantly

## Ecological Dynamics

### Resource Hotspots
Areas with high agent activity become more fertile over time:
1. **Abundant resources** → agents gather and reproduce
2. **Overpopulation** → competition for resources
3. **Starvation** → agents die in clusters
4. **Decay** → dead agents fertilize the area
5. **Resource boom** → more plants grow in fertile soil
6. **New cycle** → attracts new agents

### Population Regulation
The decay system creates natural population control:
- **Overpopulation** leads to mass die-offs
- **Die-offs** fertilize the environment
- **Fertility boost** increases carrying capacity
- **Recovery phase** allows population to rebound
- **Stable oscillations** emerge naturally

### Strategic Implications for Learning
The decay system adds new strategic dimensions:
- **Risk/Reward**: High-traffic areas are fertile but dangerous
- **Timing**: Dying in the right place can help future population
- **Spatial patterns**: Dead zones become future resource hotspots
- **Long-term thinking**: Current population shapes future environment

## Tuning Guide

### For Faster Ecological Turnover
```javascript
duration: 180,              // Faster decay (3 seconds)
fertilityBoost: 0.6,        // More fertility per chi
releaseRadius: 60,          // Concentrated hotspots
```
Result: Rapid cycle, dramatic resource shifts, volatile populations

### For Stable, Gradual Change
```javascript
duration: 600,              // Slower decay (10 seconds)
fertilityBoost: 0.3,        // Less fertility per chi
releaseRadius: 120,         // Spread out fertilization
```
Result: Smooth transitions, persistent dead bodies, gentle population waves

### For Maximum Visual Drama
```javascript
duration: 480,              // Long decay (8 seconds)
visualFade: true,           // Enable fading
removeAfterDecay: true,     // Clean up eventually
```
Result: Dramatic battlefields covered in decaying bodies that slowly fade away

## Future Extensions

### Possible Enhancements
1. **Chi inheritance**: Dead agents with chi > 0 leave "corpse resources" that can be harvested
2. **Decay byproducts**: Create temporary "nutrient pools" that agents can collect
3. **Disease/Toxicity**: Overpopulated areas create toxic soil that inhibits growth
4. **Scavenger behavior**: Agents learn to seek out decaying bodies for chi
5. **Trail boosting**: Decay releases chi into nearby trails, not just fertility
6. **Generation tracking**: Display "fossil record" of lineages in soil fertility patterns

### Performance Considerations
- Decay processing only runs on dead agents
- Fertility updates are grid-based (efficient)
- Agent removal happens in batches
- Visual effects are GPU-accelerated (canvas transforms)

Current performance: **Negligible impact** even with 32 agents decaying simultaneously.

## Visual Indicators

### Dead Agent Appearance
- **Fresh death**: Full size, colored but slightly transparent (70% opacity)
- **Mid-decay**: Shrinking, turning brown, ~40% opacity
- **Near removal**: Small (40% size), dark brown, ~10% opacity
- **Removal**: Disappears from array, no longer rendered

### Fertility Visualization
When fertility display is enabled (`[P]` key):
- **Green hotspots** appear where agents have decayed
- **Gradual spread** shows chi dispersal over time
- **Color intensity** shows fertility level
- **Dynamic changes** as decay progresses

## Console Feedback
```
💀 Agent 7 fully decayed and removed | Pop: 12
🌱 Seed sprouted at (450, 320) | Fertility: 0.78  ← Boosted by decay!
🧫 Mitosis! Agent 5 (gen 1) → Agent 15 (gen 2) | Pop: 13
```

Watch for fertility levels increasing in areas with recent deaths!

## Summary

The decay system transforms death from a failure state into a **meaningful contribution** to the ecosystem. Dead agents don't just vanish—they leave a lasting impact by fertilizing the soil for future generations. This creates:

- **Emergent resource patterns** based on historical population movements
- **Natural population cycles** with boom/bust dynamics
- **Strategic depth** for learned policies
- **Beautiful visual storytelling** of life, death, and rebirth

The circle of life, simulated! 🌱💀🧬

