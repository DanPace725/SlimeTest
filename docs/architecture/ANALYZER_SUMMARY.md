<!-- ormd:0.1 -->
---
title: "Policy Analyzer - Quick Summary"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.723526Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 📊 Policy Analyzer - Quick Summary

## What The Output Tells You

Based on your **Gen 6 vs Gen 20** analysis:

### 🎯 Key Findings

#### **Performance**
- **Gen 6**: Best reward = 11.38 (collected 1 resource barely)
- **Gen 20**: Best reward = 22.18 (collected 2+ resources!)
- **Improvement**: +94.9% 🎉

#### **The Problem: Both Policies Are WEAK at Resource-Seeking**

**Gen 6 Resource-Seeking Score: 0.073** ✗ Weak
**Gen 20 Resource-Seeking Score: 0.017** ✗ Even WORSE!

This explains why Gen 20 ignores resources even though it has better reward!

### 🔍 What Went Wrong?

Looking at the weight changes:

#### Gen 6 → Gen 20 Changes:
```
Resource Dir X (Turn):    -0.0077 → +0.0315  (improved but still weak)
Resource Dir Y (Turn):    -0.1762 → -0.0008  (improved but now too weak)
Resource Visible (Thrust): -0.0507 → -0.0099  (STILL NEGATIVE!)
```

**The Issue:** 
1. `resVisible → Thrust` should be **positive and strong** (> 0.2)
2. Instead it's **negative** (-0.01) meaning agent SLOWS DOWN when it sees resources!
3. This is opposite of what you want

#### Convergence Problem:
```
Gen 6:  12/48 weights collapsed (25%)  ✓ Still exploring
Gen 20: 31/48 weights collapsed (65%)  ⚠️ Stuck!
Average σ: 0.0109 (very low)
```

**Diagnosis:** Policy converged to a LOCAL OPTIMUM where:
- It learned to avoid walls (wallMag weight = 0.18 - strong!)
- It learned to not die immediately (survived longer)
- But it NEVER learned resource-seeking was valuable

### 📈 Learning Curves Tell the Story

**Gen 6 Curve:**
```
Spike at Gen 5: -28 → +11 (breakthrough!)
```
One lucky policy found a resource, got promoted

**Gen 20 Curve:**
```
Best was Gen 6: +22
Then: oscillates between +11 and -38
Latest: -38 (back to dying!)
```
Unstable, not improving anymore

---

## 🎯 What You Should Do

### Option 1: Increase Resource Reward (Easiest)

Edit `config.js`:
```javascript
CONFIG.learning.rewards = {
  collectResource: 50.0,  // ← MUCH higher (was 10)
  chiSpend: -0.03,        // ← Lower penalty (was -0.1)
  // ... rest same
}
```

Train from scratch. This makes resources SO valuable the policy can't ignore them.

### Option 2: Increase Exploration & Continue

Edit `config.js`:
```javascript
CONFIG.learning.mutationStdDev = 0.25  // ← Higher (was 0.1)
```

Load Gen 20, train 50 more generations. Might escape the local optimum.

### Option 3: Start Fresh & Train Longer

Gen 20 is still VERY early. Resource-seeking typically emerges at Gen 50-100+.

Start over, train to Gen 100 with default settings. Be patient!

---

## 🔬 Interesting Observations

### What Gen 20 DID Learn:

1. **Wall Avoidance** ✓
   - `wallMag → Thrust` = 0.18 (strong!)
   - Learned to thrust AWAY from walls

2. **Frustration Response** ✓
   - `frustration → Thrust` = 0.17 (strong!)
   - Thrusts more when frustrated (good!)

3. **Smart Sensing** ✓
   - `resVisible → SenseFrac` = 0.20 (strong positive!)
   - INCREASES sensing when resource visible (interesting strategy!)

### What It DIDN'T Learn:

1. **Resource Direction → Turn** ✗
   - Weights near zero
   - Doesn't turn toward resources

2. **Resource Visible → Thrust** ✗
   - **Negative weight!**
   - Slows down when resource appears (completely wrong!)

3. **Consistent Strategy** ✗
   - Learning curve shows wild oscillation
   - No stable improvement after Gen 6

---

## 💡 The Core Issue

Your policies learned **survival** but not **goal-seeking**. This is because:

1. **Death penalty (-20) dominates collectResource (+10)**
   - Policy learns "don't die" first
   - Takes 50+ generations to then learn "seek resources"

2. **Premature convergence**
   - Sigma collapsed too early
   - Got stuck in "don't die" optimum
   - Never explored resource-seeking

3. **Resource reward too small**
   - +10 for collecting resource
   - -0.1 per tick for chi spend
   - Over 2000 ticks, chi penalties add up to -200
   - One resource only offsets 100 ticks of chi penalty
   - Not motivating enough!

---

## 🚀 Expected Results After Fixes

With `collectResource: 50.0` and training to Gen 50:

**You should see:**
```
Resource-Seeking Score: 0.35 ✓ Strong
Turn Response:
  resDx      → 0.65 ✓ Strong positive
  resDy      → 0.58 ✓ Strong positive
  resVisible → 0.15 ✓ Positive
Thrust Response:
  resVisible → 0.45 ✓ Strong positive!
```

**Behavior:**
- Agent actively turns toward resources
- Thrusts forward when resource visible
- Collects 5-10 resources per episode
- Best reward: 100-200+

---

## 📊 Using the Analyzer

### Analyze Single Policy
```bash
node policyAnalyzer.js slime-policy-gen50.json
```

### Compare Two Policies
```bash
node policyAnalyzer.js slime-policy-gen20.json slime-policy-gen50.json
```

### Show All Weights (Debug)
```bash
node policyAnalyzer.js slime-policy-gen50.json --all
```

### Track Progress Over Time
```bash
# Save policies every 10 generations, then:
node policyAnalyzer.js slime-policy-gen10.json slime-policy-gen20.json
node policyAnalyzer.js slime-policy-gen20.json slime-policy-gen30.json
node policyAnalyzer.js slime-policy-gen30.json slime-policy-gen40.json
```

---

## 🎓 Key Metrics to Watch

### Resource-Seeking Score
- **< 0.1**: ✗ Ignores resources (Gen 6 & 20)
- **0.1-0.3**: ⚠️ Sometimes seeks resources
- **> 0.3**: ✓ Actively seeks resources (goal!)

### Convergence (Average σ)
- **> 0.05**: Still exploring actively
- **0.02-0.05**: Converging
- **< 0.02**: Highly converged (might be stuck)
- **< 0.01**: Collapsed (definitely stuck)

### Performance Trend
- **Upward curve**: Learning! Keep going
- **Flat curve**: Stuck, adjust hyperparameters
- **Oscillating**: Unstable, reduce mutation or increase elites

---

## 🎯 Success Criteria

Your policy is "good" when:
- ✅ Resource-Seeking Score > 0.3
- ✅ Best reward > 50
- ✅ Learning curve trending upward
- ✅ Stable improvement (not oscillating)
- ✅ `resVisible → Thrust` weight > 0.2

You're not there yet, but now you have the tools to get there! 🚀

---

## Files Created

1. **`policyAnalyzer.js`** - The analyzer script
2. **`../how-to/POLICY_ANALYZER_GUIDE.md`** - Comprehensive usage guide
3. **`ANALYZER_SUMMARY.md`** - This file (quick reference)

Run the analyzer after every training session to understand what's happening! 📊

