<!-- ormd:0.1 -->
---
title: "Own Trail Penalty System - Breaking Circuit Running"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.730594Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 🔄 Own Trail Penalty System - Breaking Circuit Running

## ✅ Implementation Complete!

Added a subtle penalty for walking on your own fresh trails to discourage circuit-running behavior.

---

## 🎯 What It Does

**Problem:** Agents were running perfect circuits, following their own trails repeatedly to maximize resource collection.

**Solution:** Small chi penalty when walking on own recently-laid trails nudges agents to explore new paths instead.

---

## ⚙️ Configuration

### New Parameters in `config.js`

```javascript
// === Own Trail Penalty (discourages circuit running) ===
ownTrailPenalty: 0.05,           // Chi cost per second for being on own fresh trail
ownTrailGraceAge: 60,            // Ticks before own trail is "safe" to cross (0 = always penalize)
```

### How It Works

**When moving, the agent checks:**
1. Is this trail mine? (`authorId === this.id`)
2. Is it fresh? (`age < ownTrailGraceAge`)
3. Is there significant trail here? (`value > 0.1`)

**If all true:** Lose `ownTrailPenalty × dt` chi per frame

---

## 🔧 Tuning Guide

### `ownTrailPenalty` (Chi cost per second)

**Default: 0.05 χ/s** (subtle nudge)

```javascript
ownTrailPenalty: 0.0,   // Disabled - allow circuit running
ownTrailPenalty: 0.05,  // Subtle - slight discouragement (default)
ownTrailPenalty: 0.1,   // Moderate - meaningful cost
ownTrailPenalty: 0.2,   // Strong - actively avoid own trails
ownTrailPenalty: 0.5,   // Extreme - harsh penalty
```

**Context:**
- Base metabolic cost: 0.15 χ/s
- Movement cost: 0.25 χ/s (current config)
- Penalty at 0.05: ~13% extra cost when on own trail

### `ownTrailGraceAge` (Ticks before safe)

**Default: 60 ticks** (~1 second at 60fps)

```javascript
ownTrailGraceAge: 0,    // Always penalize own trails
ownTrailGraceAge: 30,   // 0.5 second grace period
ownTrailGraceAge: 60,   // 1 second grace period (default)
ownTrailGraceAge: 120,  // 2 second grace period
ownTrailGraceAge: 300,  // 5 second grace period
```

**What this means:**
- Lower value = Penalize even very fresh trails
- Higher value = Only penalize if crossing old trail (circuit detected)

---

## 📊 Expected Impact

### Without Own Trail Penalty (Gen 9)
```
Strategy: Perfect circuit running
Reward: 1518-1538 (frozen)
Collections: ~75 per episode
Behavior: Repeatable path, same route every time
```

### With Own Trail Penalty
```
Strategy: Exploratory foraging (expected)
Reward: Variable but healthy
Collections: Similar total, more diverse paths
Behavior: Avoid recently visited areas, explore new zones
```

---

## 💡 How It Discourages Circuits

### Circuit Running (Without Penalty)
```
Agent path:
  Start → A → B → C → Resource → A → B → C → Resource → A → B → C...
  
Trail age when crossing:
  First loop: No trail
  Second loop: Trail ~2-3 seconds old ← Would trigger penalty!
  Result: Agent avoids retracing same path
```

### With Penalty Active
```
Agent path:
  Start → A → B → C → Resource → D → E → F → Resource → G → H → I...
  
Result: Explores new areas to avoid fresh trail penalty
```

---

## 🎮 Behavioral Changes Expected

### Before (Circuit Running)
- ✅ Efficient collection
- ✅ High rewards
- ❌ Repetitive behavior
- ❌ No true exploration
- ❌ Frozen strategy

### After (With Penalty)
- ✅ Still efficient
- ✅ Good rewards
- ✅ Diverse exploration
- ✅ Adapts to environment
- ✅ More variable behavior

---

## 🔬 Technical Details

### The Penalty Logic

Located in `app.js`, within `Bundle.applyAction()`:

```javascript
// Penalty for walking on own fresh trail (discourages circuits)
if (CONFIG.ownTrailPenalty > 0) {
  const isOwnTrail = authorId === this.id;
  const isFresh = age < CONFIG.ownTrailGraceAge;
  if (isOwnTrail && isFresh && value > 0.1) {
    const penalty = CONFIG.ownTrailPenalty * dt;
    this.chi -= penalty;
  }
}
```

**Safety checks:**
1. Config must enable penalty (`ownTrailPenalty > 0`)
2. Must be agent's own trail
3. Must be fresh (within grace period)
4. Must have significant trail value (>0.1)

### Why `value > 0.1`?

Prevents tiny penalties from trace amounts or evaporated trails. Only penalizes when there's a clear trail present.

---

## 📈 Comparing with Other Discouragement Methods

| Method | Effect | Subtlety | Our Choice |
|--------|--------|----------|------------|
| **Own trail penalty** | -0.05 χ/s | ✅ Subtle | **← This!** |
| Increase evaporation | Trails fade faster | Moderate | Already tuned |
| Reduce residual gain | Less benefit from trails | Strong | May hurt cooperation |
| Add noise to movement | Random exploration | Too disruptive | Not needed |

**Why this is best:**
- Doesn't affect trail cooperation (other agents still benefit)
- Doesn't reduce trail visibility
- Gives gentle nudge, not hard block
- Agents can still cross old trails when needed

---

## 🎯 Interaction with Other Systems

### Trail Evaporation
```javascript
evapPerSec: 0.10  // Trails fade at 0.1/s
```
- Faster evaporation = trails disappear quicker
- Works WITH own trail penalty
- After ~10 seconds, trails mostly gone anyway

### Trail Cooldown
```javascript
trailCooldownTicks: 8  // Can't reuse trails for 8 ticks
```
- Prevents instant reuse of OTHER agents' trails
- Own trail penalty is separate (prevents reusing OWN trails)
- Different timescales: cooldown is ~0.13s, grace age is ~1s

### Residual Gain
```javascript
residualGainPerSec: 0.8  // Gain from OTHER trails
```
- Own trail penalty doesn't affect OTHER agents' trail benefits
- Encourages cooperation while discouraging self-following

---

## 🧪 Testing Recommendations

### Test 1: Visual Observation
```
1. Open index.html
2. Enable trail rendering
3. Watch agent movement
4. Look for: Non-repeating paths, diverse exploration
```

### Test 2: Reward Variance
```
Train 20 generations
Compare variance in rewards:
  High variance = exploring different paths ✅
  Zero variance = still frozen ❌
```

### Test 3: Trail Crossing Behavior
```
Watch for:
  - Does agent avoid recently walked areas? ✅
  - Does agent still cross old trails when needed? ✅
  - Is movement still smooth and purposeful? ✅
```

---

## 🔧 Quick Tuning for Different Goals

### Goal: Break Extreme Circuit Running (Gen 9 style)

```javascript
ownTrailPenalty: 0.1,    // Stronger penalty
ownTrailGraceAge: 120,   // Penalize even 2-second-old trails
```

### Goal: Subtle Exploration Nudge (Recommended)

```javascript
ownTrailPenalty: 0.05,   // Gentle penalty (default)
ownTrailGraceAge: 60,    // 1 second grace (default)
```

### Goal: Prevent Any Trail Following

```javascript
ownTrailPenalty: 0.2,    // Strong penalty
ownTrailGraceAge: 0,     // Penalize immediately
```

### Goal: Disable Feature

```javascript
ownTrailPenalty: 0.0,    // Disabled
```

---

## 💭 Design Philosophy

### Why "Subtle Nudge"?

**We want:**
- Encourage exploration ✅
- Maintain efficiency ✅
- Allow strategic trail crossing ✅
- Preserve learned behaviors ✅

**We don't want:**
- Force random movement ❌
- Punish all trail use ❌
- Break existing strategies ❌
- Add computational overhead ❌

**Result:** A gentle economic pressure that makes diverse exploration slightly more rewarding than circuit running.

---

## 🎮 Expected Training Differences

### Generation Comparison Prediction

| Gen | Without Penalty | With Penalty (0.05) |
|-----|-----------------|---------------------|
| 1-10 | Learning circuits | Learning + exploring |
| 20-30 | Frozen at circuit | Variable strategies |
| 50+ | Same circuit (1518) | Diverse paths (1400-1600?) |

**Key difference:** More variance in strategies, less perfect freezing

---

## 📊 Success Metrics

After training with penalty:

✅ **Lower sigma convergence** (>0.02 vs <0.01)  
✅ **Higher reward variance** between generations  
✅ **Different weight patterns** across generations  
✅ **Visual diversity** in agent paths  
✅ **Non-deterministic rewards** (not exactly same each gen)

---

## 🔄 Next Steps

1. **Test manually** - Open browser and watch behavior
2. **Train 10-20 gens** - See if freezing is broken
3. **Analyze variance** - Compare reward distributions
4. **Tune if needed** - Adjust penalty/grace based on results
5. **Document findings** - See if circuits are truly broken

---

## 🏆 Summary

**What:** Small chi penalty for walking on own fresh trails

**Why:** Break circuit-running behavior, encourage exploration

**How:** -0.05 χ/s when on own trail younger than 60 ticks

**Impact:** Gentle nudge away from perfect circuits toward diverse foraging

**Risk:** Very low - easily tunable, easily disabled

**Status:** ✅ **Ready to test!**

---

**Let's see if this nudge is enough to break the frozen circuit pattern!** 🔬✨

