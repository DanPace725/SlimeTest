<!-- ormd:0.1 -->
---
title: "Sensing System Rebalance - Option 2 (Moderate)"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.727874Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# Sensing System Rebalance - Option 2 (Moderate)

## 🎯 Problem Statement

The sensing system was too forgiving, causing:
1. **Resource "popping"** - Resources appearing/disappearing at edge of large vision radius
2. **Trivial cost** - Agents could afford max sensing after 1-2 resources
3. **Easy mode** - Fast frustration build meant quick sensing expansion
4. **No tradeoffs** - Holding max sensing was essentially free

---

## ✅ Changes Implemented

### 1. **Reduced Vision Range**

**Before:**
```javascript
aiSensoryRangeBase: 220px  // Free base vision
aiSensoryRangeMax: 560px   // Max expansion
Range: 220-560px (340px expansion possible)
```

**After:**
```javascript
aiSensoryRangeBase: 160px  // -27% reduction
aiSensoryRangeMax: 360px   // -36% reduction  
Range: 160-360px (200px expansion possible)
```

**Effect:**
- Less resource "popping" at vision edge
- More stable visual experience
- Forces agents to get closer to resources
- Base vision still adequate for local navigation

---

### 2. **Increased Expansion Cost**

**Before:**
```javascript
aiSenseRangePerChi: 55     // 55 pixels per chi per second
Cost to extend 100px: ~1.8 chi/sec
```

**After:**
```javascript
aiSenseRangePerChi: 30     // 30 pixels per chi per second
Cost to extend 100px: ~3.3 chi/sec (+83% more expensive!)
```

**Effect:**
- Expanding sensing is now a significant investment
- Can't casually max out sensing
- Must make strategic decisions about when to expand

---

### 3. **Quadratic Holding Cost**

**Before:**
```javascript
holdChiPerSec = aboveBase / (pxPerChiPerSec × 8)
// Linear scaling - holding max range very cheap
```

**After:**
```javascript
holdChiPerSec = (aboveBase²) / (pxPerChiPerSec × 100)
// Quadratic scaling - cost increases with range²!
```

**Cost Comparison:**

| Range Above Base | Old Cost/sec | New Cost/sec | Multiplier |
|-----------------|--------------|--------------|------------|
| +50px           | 0.11χ        | 0.83χ        | 7.5×       |
| +100px          | 0.23χ        | 3.33χ        | 14.5×      |
| +150px          | 0.34χ        | 7.50χ        | 22×        |
| +200px (max)    | 0.45χ        | 13.33χ       | 29.6×      |

**Effect:**
- Holding max sensing costs ~13 chi/sec! (Was 0.45)
- Forces agents to "pulse" sensing (expand when needed, retract to save chi)
- Creates dynamic sensing behavior
- Makes trail following more valuable

---

### 4. **Hunger Scaling**

**New mechanic:**
```javascript
hungerPenalty = 1 + hunger × 0.5
cost *= hungerPenalty
// 0% hungry = 1.0× cost
// 50% hungry = 1.25× cost  
// 100% hungry = 1.5× cost (50% more expensive!)
```

**Effect:**
- Hungry agents can't afford expensive sensing
- Must find food quickly or retract sensing
- Adds biological realism
- Creates desperation mechanics

---

### 5. **Slower Frustration Build**

**Before:**
```javascript
aiFrustrationBuildRate: 0.25   // 4 seconds to max frustration
aiFrustrationLowTrail: 0.20    // Lenient threshold
```

**After:**
```javascript
aiFrustrationBuildRate: 0.15   // 6.7 seconds to max frustration (-40%)
aiFrustrationLowTrail: 0.15    // Stricter threshold
```

**Effect:**
- Agents don't panic as quickly
- Must search longer before expanding sensing
- More deliberate behavior
- Trail following becomes more important

---

## 📊 Economic Analysis

### Old System (Too Easy)

**Scenario:** Agent with 15χ finds 1 resource (+10χ = 25χ total)

```
Action: Expand to max sensing (560px)
Cost: ~2 chi/sec (expand + hold)
Duration: Can hold for 12 seconds!
Result: Easily finds more resources → profit → cycle continues

Problem: No real cost, sensing is always worth it
```

### New System (Balanced)

**Scenario:** Agent with 15χ finds 1 resource (+10χ = 25χ total)

```
Option A: Conservative - Expand to 260px (+100px)
- Expand cost: ~1.7 chi/sec
- Hold cost: ~3.3 chi/sec  
- Total: ~5.0 chi/sec
- Duration: Can hold for 5 seconds
- Must find resource quickly or retract!

Option B: Aggressive - Expand to 360px (+200px max)
- Expand cost: ~3.3 chi/sec
- Hold cost: ~13.3 chi/sec
- Total: ~16.6 chi/sec  
- Duration: Can hold for 1.5 seconds!
- Extreme desperation move only

Strategic Decision: When to expand? How far? When to retract?
```

**Result:** Meaningful tradeoffs! Sensing is a resource management challenge.

---

## 🎮 Expected Behavioral Changes

### Before (Easy Mode)
1. Get frustrated → expand sensing → find resources easily
2. Maintain max sensing most of the time
3. Resources visible from far away (popping)
4. Little need for trail following
5. Individual foraging dominant

### After (Balanced Challenge)
1. Must search carefully with limited vision
2. Expand sensing only when necessary
3. Retract sensing to conserve chi
4. Resources appear more stable (less popping)
5. **Trail following becomes critical** (cheap alternative to sensing)
6. **Cooperation more valuable** (follow others' trails)
7. **Strategic depth** (when to expand vs. save chi)

---

## 🧠 Strategic Implications

### Good Strategies
✅ **Pulse Sensing** - Expand when lost, retract when following trails  
✅ **Trail Following** - Use others' trails instead of expensive sensing  
✅ **Conservation** - Keep sensing low when chi is scarce  
✅ **Targeted Expansion** - Only expand when truly stuck  

### Bad Strategies  
❌ **Always Max** - Will drain chi reserves (~13 chi/sec!)  
❌ **Ignore Trails** - Missing free navigation information  
❌ **Panic Expansion** - Expanding too early wastes chi  
❌ **Never Expand** - Will get stuck in dead zones  

### Emergent Behaviors
🔍 **Desperate Scouting** - Low chi agents retract sensing to survive  
🤝 **Trail Dependency** - Agents cluster along successful trails  
📍 **Territorial Behavior** - Agents stay in known fertile areas  
🌊 **Boom-Bust Sensing** - Sensing expands/contracts with chi wealth  

---

## 🔄 Interaction with Other Systems

### + Plant Ecology
- **Synergy:** Must stay near fertile patches (limited vision)
- **Effect:** Agents become more territorial
- **Dynamic:** Depleted patches → must move → risky exploration

### + Mitosis
- **Synergy:** New agents start with small sensing (balance mechanic)
- **Effect:** Offspring must earn their sensing range
- **Dynamic:** Population growth limited by sensing cost

### + Scent Gradients
- **Synergy:** Scent provides navigation without sensing cost
- **Effect:** Scent becomes primary navigation tool
- **Dynamic:** Follow scent gradient with minimal sensing

### + Trail System
- **Critical:** Trails now essential for efficient foraging
- **Effect:** Cooperation through trails is highly rewarded
- **Dynamic:** Trail networks become highways

---

## 🎯 Tuning Knobs

If you need to adjust difficulty:

### Make it Easier
```javascript
aiSensoryRangeBase: 180      // +20px more vision
aiSenseRangePerChi: 35       // Less expensive
// Or reduce quadratic constant:
holdChiPerSec = (aboveBase²) / (pxPerChiPerSec × 150)  // Was 100
```

### Make it Harder
```javascript
aiSensoryRangeBase: 140      // -20px less vision
aiSenseRangePerChi: 25       // More expensive
// Or increase hunger penalty:
hungerPenalty = 1 + hunger × 1.0  // Was 0.5 (100% penalty at max hunger!)
```

### Tweak Holding Cost Curve
```javascript
// Current: quadratic (cost = range²)
holdChiPerSec = (aboveBase²) / (pxPerChiPerSec × 100)

// Cubic (even steeper!): cost = range³
holdChiPerSec = (aboveBase³) / (pxPerChiPerSec × 1000)

// Square root (gentler): cost = √range
holdChiPerSec = Math.sqrt(aboveBase) / (pxPerChiPerSec × 0.5)
```

---

## 📈 Testing Checklist

After rebalance, watch for:

- [ ] Resource popping reduced (visual stability)
- [ ] Agents pulse sensing (expand/retract dynamically)
- [ ] Trail following increases (agents cluster on trails)
- [ ] Chi management matters (low chi = small sensing)
- [ ] Frustration less frequent (not panicking constantly)
- [ ] Strategic diversity (different agents use different ranges)
- [ ] Desperation behavior (starving agents retract sensing)
- [ ] Cooperation emerges (following trails > solo exploration)

---

## 💡 Advanced Optimization

### For Learning Agents

The new sensing economics create interesting learning opportunities:

**Observation Space:**
- Current sensing range (normalized)
- Current chi reserves
- Sensing cost (chi/sec)
- Nearby trail intensity

**Action Space:**
- Could add "sensing intensity" as action dimension
- Policy could learn optimal sensing strategy

**Reward Shaping:**
- Reward efficient sensing (minimize cost per resource found)
- Penalize excessive sensing cost
- Reward trail utilization

**Emergent Strategies:**
- Agents might learn to "scout" with high sensing, then "exploit" with low sensing
- Could develop sensing schedules (expand periodically)
- Might learn cooperative scouting (one expands, others follow)

---

## 🔬 Mathematical Model

### Sensing Cost Function

```
Total Cost = Expansion Cost + Holding Cost × Hunger Penalty

Where:
  Expansion Cost = (Δrange / dt) / rangePerChi × dt
  Holding Cost = (range - base)² / (rangePerChi × 100) × dt
  Hunger Penalty = 1 + hunger × 0.5

Simplified:
  C(r, h) = f(Δr) + (r - r₀)² / k + [f(Δr) + (r - r₀)² / k] × h × 0.5

Where:
  r = current range
  r₀ = base range (160px)
  Δr = change in range
  h = hunger (0-1)
  k = cost constant (30 × 100 = 3000)
```

### Optimal Range

Given chi budget B (chi/sec), optimal range:

```
(r - r₀)² / k = B
r = r₀ + √(k × B)

Example:
  Budget = 5 chi/sec
  r = 160 + √(3000 × 5)
  r = 160 + √15000
  r = 160 + 122
  r ≈ 282px

So with 5 chi/sec budget, optimal range is ~282px (not max 360px!)
```

---

## 🎉 Summary

**What Changed:**
- Vision range: 220-560px → 160-360px (-27% base, -36% max)
- Expansion cost: 55px/chi → 30px/chi (+83% more expensive)
- Holding cost: Linear → Quadratic (up to 30× more expensive)
- Hunger penalty: None → 0-50% cost increase
- Frustration: 4s to max → 6.7s to max (-40% slower)

**Why It Matters:**
- Creates strategic depth (sensing management)
- Reduces visual popping (tighter ranges)
- Encourages cooperation (trail following)
- Balances mitosis (new agents limited)
- Adds tension (must manage chi budget)

**Expected Feel:**
- More challenging but fair
- Rewards careful play
- Encourages social behavior
- Creates emergent strategies
- Still accessible (not brutal)

**Bottom Line:**
Sensing is now a **strategic resource** rather than a free tool. Agents must make meaningful choices about when and how much to expand their vision! 🎯

