<!-- ormd:0.1 -->
---
title: "Hunger System Implementation Guide"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.729848Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# Hunger System Implementation Guide

## Overview

The **Hunger System** adds a biologically-inspired drive mechanism that amplifies agent behavior based on time since last feeding. Hunger works alongside frustration to create more realistic, desperate foraging behavior as agents become increasingly hungry.

---

## 🧬 Biological Model

### Concept
Just like real organisms:
- **Hunger builds over time** as energy is expended
- **Hunger drives exploration** - starving agents take more risks
- **Hunger amplifies frustration** - hungry + stuck = desperate behavior
- **Eating provides relief** - collecting resources reduces hunger

### The Hunger-Frustration Interaction

```
Low Hunger + Low Frustration = Calm, efficient foraging
Low Hunger + High Frustration = Increased exploration (stuck but not desperate)
High Hunger + Low Frustration = Eager searching (hungry but making progress)
High Hunger + High Frustration = DESPERATE! (hungry AND stuck = risky behavior)
```

---

## 📊 How Hunger Works

### Hunger Value (0..1)
- **0.0** - Fully satisfied (just ate)
- **0.3** - Starting to get hungry (threshold low)
- **0.7** - Starving! (threshold high) 🍖
- **1.0** - Maximum hunger

### Hunger Dynamics

**Increases Over Time:**
```javascript
hunger += hungerBuildRate * dt  // Default: 0.08/sec
```

**Decreases When Eating:**
```javascript
hunger -= hungerDecayOnCollect  // Default: 0.7 (70% relief)
```

---

## 🎯 Hunger Effects

Hunger acts as an **amplifier** on four key behaviors:

### 1. **Exploration Noise** (Desperate Searching)
```javascript
hungerAmp = 1 + (hungerExplorationAmp - 1) * hunger
// Default max: 1.8x at full hunger
noise = baseNoise * hungerAmp
```

**Effect:** Hungry agents move more erratically, covering more area in search of food.

### 2. **Frustration Build Rate** (Getting Desperate Faster)
```javascript
hungerAmp = 1 + (hungerFrustrationAmp - 1) * hunger
// Default max: 2.5x at full hunger
frustrationGain *= hungerAmp
```

**Effect:** Hungry agents become frustrated much faster when stuck, leading to even more desperate behavior.

### 3. **Sensory Range** (Desperate for Clues)
```javascript
hungerAmp = 1 + (hungerSenseAmp - 1) * hunger
// Default max: 1.5x at full hunger
senseBoost *= hungerAmp
```

**Effect:** Hungry agents expand their sensory range more aggressively (at higher chi cost).

### 4. **Speed Surge** (Frantic Movement)
```javascript
hungerAmp = 1 + (hungerSurgeAmp - 1) * hunger
// Default max: 1.3x at full hunger
speed *= hungerAmp
```

**Effect:** Hungry agents move faster when frustrated, burning more energy in desperation.

---

## ⚙️ Configuration

### config.js Parameters

```javascript
// === Hunger System (biological drive) ===
hungerBuildRate: 0.08,              // Rate hunger increases per second
hungerDecayOnCollect: 0.7,          // How much hunger decreases when eating (0.7 = 70%)
hungerThresholdLow: 0.3,            // Below this, agent is "satisfied"
hungerThresholdHigh: 0.7,           // Above this, agent is "starving"
hungerExplorationAmp: 1.8,          // Max exploration multiplier when hungry
hungerFrustrationAmp: 2.5,          // Max frustration build multiplier when hungry
hungerSenseAmp: 1.5,                // Max sensory range multiplier when hungry
hungerSurgeAmp: 1.3,                // Max speed surge multiplier when hungry
```

### Tuning Guidelines

**For More Desperate Behavior:**
- ↑ Increase `hungerBuildRate` (0.10 - 0.15) → Agents get hungry faster
- ↑ Increase amplifiers (2.0 - 3.0) → Hunger has stronger effects
- ↓ Decrease `hungerDecayOnCollect` (0.5) → Less relief from eating

**For Calmer Behavior:**
- ↓ Decrease `hungerBuildRate` (0.05 - 0.06) → Agents stay satisfied longer
- ↓ Decrease amplifiers (1.2 - 1.5) → Hunger has weaker effects
- ↑ Increase `hungerDecayOnCollect` (0.8 - 0.9) → More relief from eating

**For Balanced Risk-Taking:**
- Keep `hungerFrustrationAmp` high (2.5) → Hungry stuck agents get desperate
- Keep `hungerExplorationAmp` moderate (1.5 - 2.0) → Controlled randomness
- Adjust thresholds to control when effects kick in

---

## 📈 Visual Indicators

### HUD Display
Each agent shows two bars:
- **Red/Pink Bar** - Frustration (0..1)
- **Orange Bar** - Hunger (0..1) 🍖

### In-World Effects

**Starving Agent (hunger ≥ 0.7):**
- **Dashed orange ring** pulsing around the agent
- Faster, more erratic movement
- Aggressive sensory expansion (if extended sensing enabled)
- More prone to frustration

**Highly Frustrated Agent (frustration ≥ 0.9):**
- **Solid red ring** pulsing around the agent

**Hungry + Frustrated:**
- **Both rings visible** - Agent is in desperate mode!

---

## 🔬 Behavioral Examples

### Scenario 1: Well-Fed Agent (hunger = 0.2)
```
✓ Calm exploration
✓ Patient trail following
✓ Minimal sensory expansion
✓ Frustration builds slowly
Result: Efficient, conservative foraging
```

### Scenario 2: Moderately Hungry (hunger = 0.5)
```
⚠ Increased exploration noise (+40%)
⚠ Moderate sensory expansion boost (+25%)
⚠ Frustration builds ~1.75x faster
Result: More active searching, moderate risk-taking
```

### Scenario 3: STARVING (hunger = 0.9)
```
🚨 Exploration noise +72%
🚨 Sensory boost +45%
🚨 Frustration builds 2.4x faster!
🚨 Speed surge +27%
Result: Desperate, risky, erratic behavior
```

### Scenario 4: Starving + Stuck (hunger = 0.9, frustration = 0.9)
```
💥 MAXIMUM DESPERATION
💥 Wild exploration patterns
💥 Maximum sensory range (expensive!)
💥 Frantic high-speed movement
💥 Chi depletion accelerates
Result: All-or-nothing survival mode
```

---

## 🎮 Emergent Behaviors

### Feast-or-Famine Dynamics
- Successful agents: collect food → hunger drops → calm foraging → repeat
- Struggling agents: no food → hunger rises → desperate → MORE struggling → death

### Risk Escalation
As hunger increases, agents naturally:
1. Explore more randomly (covering new ground)
2. Expand senses aggressively (burning chi to find food)
3. Move faster when frustrated (risky chi expenditure)
4. Get frustrated faster (triggering desperate measures sooner)

### Group Dynamics
In multi-agent scenarios:
- Well-fed agents can forage efficiently
- Hungry agents become more exploratory
- Starving agents may discover new resources through desperate exploration
- Trail cooperation becomes more valuable to hungry agents

---

## 🧪 Training Implications

### For Machine Learning

**Observation Space:**
Consider adding hunger to observations:
```javascript
obs.hunger = bundle.hunger;  // Add to buildObservation()
```

**Reward Shaping:**
- Penalize high hunger states to encourage resource collection
- Reward hunger reduction (eating) explicitly
- Consider survival-duration bonus for maintaining low hunger

**Policy Learning:**
- Agents can learn to manage hunger vs. chi trade-offs
- Optimal policies balance exploration (hunger-driven) with exploitation
- Hunger creates natural curriculum: easy early, harder as time passes

### Expected Learning Patterns

**Novice Policies:**
- Ignore hunger → random behavior regardless of state
- May starve due to inefficient foraging

**Intermediate Policies:**
- React to high hunger → explore more when hungry
- Still inefficient hunger management

**Advanced Policies:**
- Proactive hunger management → collect food before starving
- Balance hunger, chi, and frustration optimally
- May learn "hunger threshold strategies" (eat at 0.6, not 0.9)

---

## 🎯 Design Philosophy

### Why Hunger Matters

**Without Hunger:**
- Agents have no urgency
- Exploration is constant regardless of state
- No escalating desperation
- Less biologically realistic

**With Hunger:**
- Time-based urgency emerges naturally
- Behavior escalates from calm → desperate
- Creates interesting state-dependent strategies
- More engaging to watch and more realistic

### The Amplifier Approach

Hunger uses **multiplicative amplification** rather than additive:
```javascript
// Amplifier approach (what we use)
noise = baseNoise * (1 + hungerEffect)

// Additive approach (not used)
noise = baseNoise + hungerBonus
```

**Why?** Amplifiers scale with existing values:
- Works with frustration synergistically
- Preserves relative differences in behavior
- Creates exponential desperation in worst-case scenarios
- More biologically plausible (hormonal amplification)

---

## 📊 Statistics & Monitoring

### Track in HUD
Current implementation shows:
- Hunger bars for each agent
- Visual pulse when starving (≥0.7)

### Recommended Analytics
Consider logging:
- Average hunger over time
- Time spent in "starving" state
- Correlation between hunger and resource collection
- Chi efficiency vs. hunger level

---

## 🔧 Debugging & Testing

### Test Scenarios

**1. Starvation Test**
```javascript
CONFIG.hungerBuildRate = 0.3;  // Very fast hunger
CONFIG.resourceCount = 1;      // Limited resources
// Expected: Agents should show desperate behavior
```

**2. Abundance Test**
```javascript
CONFIG.hungerBuildRate = 0.02; // Slow hunger
CONFIG.resourceCount = 10;     // Abundant resources
// Expected: Agents should stay calm, rarely starving
```

**3. Amplification Test**
```javascript
CONFIG.hungerExplorationAmp = 5.0;  // Extreme amplification
// Expected: Starving agents should be wildly erratic
```

### Debug Commands

**Force Hunger:**
```javascript
// In console while running
World.bundles.forEach(b => b.hunger = 0.9);
```

**Reset Hunger:**
```javascript
World.bundles.forEach(b => b.hunger = 0);
```

**Monitor Hunger:**
```javascript
setInterval(() => {
  console.log(`Hunger: ${World.bundles.map(b => b.hunger.toFixed(2)).join(', ')}`);
}, 1000);
```

---

## 🚀 Future Enhancements

### Potential Extensions

**1. Hunger-Based Death**
```javascript
if (this.hunger >= 1.0) {
  this.alive = false; // Starved to death
}
```

**2. Variable Hunger Rates**
```javascript
// Base on activity level
hungerRate = CONFIG.hungerBuildRate * (1 + movementSpeed * 0.5);
```

**3. Partial Feeding**
```javascript
// Resources give different hunger relief
smallFood: hungerRelief = 0.3
mediumFood: hungerRelief = 0.6
largeFood: hungerRelief = 0.9
```

**4. Cooperative Feeding**
```javascript
// Agents can share resources when hungry
if (ally.hunger > 0.8 && this.hunger < 0.3) {
  shareFood(ally, 0.3);
}
```

**5. Hunger-Driven Aggression**
```javascript
// Very hungry agents might "steal" from trails
if (this.hunger > 0.8) {
  trailReuseFactor *= 1.5;
}
```

---

## 📚 Related Systems

### Interacts With:
- **Frustration System** - Amplifies frustration build rate
- **Sensory System** - Amplifies range expansion
- **Movement System** - Amplifies speed surge
- **Exploration System** - Amplifies noise/randomness
- **Chi/Energy System** - More desperate = more chi spent

### Synergies:
- Hunger + Frustration = Exponential desperation
- Hunger + Low Chi = Death spiral (risky!)
- Hunger + Extended Sensing = Expensive but effective searching
- Hunger + Trail Following = Desperate cooperation

---

## 🎓 Summary

The **Hunger System** creates biologically realistic behavior by:

1. ✅ **Building over time** - Creates urgency
2. ✅ **Amplifying exploration** - Desperate searching when hungry
3. ✅ **Amplifying frustration** - Faster desperation when stuck + hungry
4. ✅ **Rewarding feeding** - Eating provides relief and calm
5. ✅ **Escalating risk** - Hungrier = more desperate = riskier behavior

This makes agents more interesting to observe, more biologically plausible, and creates natural emergent behaviors like feast-or-famine cycles and escalating desperation.

**The key insight:** Hunger doesn't replace frustration - it **amplifies** it. A well-fed frustrated agent is patient. A starving frustrated agent is desperate!

---

*Hunger System implemented November 4, 2025*
*Works alongside Frustration, Sensing, and Trail systems*

