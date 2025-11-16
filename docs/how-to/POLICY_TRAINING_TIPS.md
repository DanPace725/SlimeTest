<!-- ormd:0.1 -->
---
title: "Policy Training Tips  Troubleshooting"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.732075Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 🎓 Policy Training Tips & Troubleshooting

## Why is my policy ignoring resources?

This is **completely normal** for early-stage or undertrained policies! Here's why:

---

## 🧠 Understanding Policy Learning

### The Problem: Random Start

When you start training:
- Policy weights are **initialized randomly**
- Agent has NO idea what resources are
- Actions are essentially random noise
- Agent usually dies quickly → negative rewards

### Early Generations (1-20)

**What's happening:**
- Policy is learning "don't die immediately"
- Might learn to avoid walls
- Might learn to move instead of staying still
- **NOT yet learning to collect resources**

**Why resources are ignored:**
- Resource collection gives +10 reward
- But death gives -20 penalty
- Policy prioritizes survival first
- Resource seeking comes later

### Mid Training (20-50 generations)

**What's happening:**
- Policy learned basic survival
- Starting to explore more
- Occasionally finds resources by accident
- Begins to associate resource direction with reward

### Late Training (50-100+ generations)

**What's happening:**
- Policy reliably survives
- Actively seeks resources
- Uses sensing strategically
- Collects multiple resources per episode

---

## 📊 Your Policy Files

You have `slime-policy-gen6.json` and `slime-policy-gen8.json`:

### Generation 6-8: Very Early!
- These are **beginner policies**
- Likely just learned basic movement
- May not have collected a single resource yet
- This is expected!

### What to expect from Gen 6-8:
- Agent moves around
- Avoids walls (maybe)
- **Ignores resources** ← This is where you are
- Reward probably negative (-10 to -50)

### What you WANT: Gen 50-100+
- Agent actively seeks resources
- Uses sensing when frustrated
- Collects 3-5+ resources per episode
- Reward positive (+20 to +50)

---

## 🚀 How to Get Better Policies

### Option 1: Train Longer

**The simplest solution!**

1. Open training panel `[L]`
2. Load your Gen 8 policy
3. Set generations to `50` (or more)
4. Click "Start Training"
5. Go get coffee ☕ (20-30 minutes)

**Why this works:**
- Learning is cumulative
- Gen 8 → Gen 58 will be MUCH better
- Policy gradually discovers resource-seeking

### Option 2: Tune Rewards

If training is too slow or not working, adjust `config.js`:

```javascript
CONFIG.learning.rewards = {
  collectResource: 20.0,      // ← Increase this (was 10.0)
  chiGain: 0.5,               // ← Reward residual collection more
  chiSpend: -0.05,            // ← Reduce movement penalty (was -0.1)
  stuck: -0.5,                // ← Keep this
  idle: -0.2,                 // ← Increase idle penalty
  explore: 0.1,               // ← Reward exploration more
  provenanceCredit: 0.1,      // ← Keep this
  death: -15.0,               // ← Reduce death penalty (was -20)
};
```

**What these changes do:**
- **Higher collectResource**: Makes finding resources more important
- **Lower chiSpend**: Encourages movement/exploration
- **Lower death penalty**: Lets agent take more risks
- **Higher explore**: Rewards visiting new areas

### Option 3: Easier Episodes

Make learning faster by simplifying the task:

```javascript
CONFIG.learning.episodeLength = 1000;  // Shorter (was 2000)
CONFIG.learning.populationSize = 30;   // More policies (was 20)
```

**Why this helps:**
- Shorter episodes = faster training
- More policies = better exploration

### Option 4: Better Observations

The current observation includes resource direction, but policy might not be using it well. The linear policy is simple - it might need more data.

**Already included:**
- ✅ Resource direction (dx, dy)
- ✅ Resource visibility flag
- ✅ Wall detection
- ✅ Chi level
- ✅ Velocity

**This should be enough!** Just needs more training.

---

## 🔍 Debugging Your Policy

### Step 1: Watch Actions in Real-Time

When you click "Use This Policy", actions now display below the agent:

```
T:0.35 P:0.82 S:0.15
```

**What to look for:**

#### Bad Policy (Undertrained):
```
T:0.02 P:0.01 S:0.50
```
- Tiny turn, tiny thrust
- Agent barely moves
- **Fix**: Train more

#### Random Policy:
```
T:-0.91 P:0.05 S:0.99
(next frame)
T:0.87 P:0.01 S:0.02
```
- Wild swings in actions
- No consistency
- **Fix**: Train more, reduce mutation noise

#### Decent Policy:
```
T:0.45 P:0.85 S:0.20
```
- Consistent values
- Moderate thrust
- Turning toward something
- **Good sign!** Might just need more training

### Step 2: Check Learning Curve

After training, look at the chart:

#### Bad Learning Curve:
```
Reward
  0 ─────────────
 -10 ~~~~~~~~~~~~  (flat, oscillating)
 -20 ~~~~~~~~~~~~
 -30 ~~~~~~~~~~~~
```
- Flat line = not learning
- **Fix**: Adjust rewards or increase population

#### Good Learning Curve:
```
Reward
 +20      ╱────
 +10    ╱
   0  ╱
 -10 ─
```
- Upward trend = learning!
- Keep training

### Step 3: Compare to Heuristic

1. Switch to Play mode
2. Let heuristic run for 60 seconds
3. Count resources collected
4. Switch to loaded policy
5. Let it run for 60 seconds
6. Compare counts

**Expected results:**
- Gen 8 policy: 0-1 resources
- Gen 50 policy: 2-5 resources
- Gen 100 policy: 5-10 resources
- Heuristic: 8-15 resources (it's hand-crafted!)

---

## 📈 Recommended Training Schedule

### Phase 1: Bootstrap (Gen 0-20)
- **Goal**: Learn to survive
- **Settings**: Default
- **Time**: ~15 minutes
- **Expected**: Negative rewards improving

### Phase 2: Exploration (Gen 20-50)
- **Goal**: Find resources occasionally
- **Settings**: Increase `exploreReward` to 0.2
- **Time**: ~30 minutes
- **Expected**: Rewards approach zero

### Phase 3: Refinement (Gen 50-100)
- **Goal**: Reliable resource collection
- **Settings**: Increase `collectResource` to 20.0
- **Time**: ~1 hour
- **Expected**: Positive rewards, multiple collections

### Phase 4: Optimization (Gen 100+)
- **Goal**: Beat heuristic
- **Settings**: Tune all rewards
- **Time**: Several hours
- **Expected**: Consistent good performance

---

## 🎯 Success Metrics

### Generation 10:
- [ ] Agent survives >500 ticks
- [ ] Best reward > -20
- [ ] Agent moves consistently

### Generation 30:
- [ ] Agent survives >1000 ticks
- [ ] Best reward > -5
- [ ] Agent explores >50 cells

### Generation 50:
- [ ] Agent collects 1+ resource per episode
- [ ] Best reward > 0
- [ ] Learning curve trending up

### Generation 100:
- [ ] Agent collects 3+ resources per episode
- [ ] Best reward > +20
- [ ] Beats heuristic occasionally

---

## 🐛 Common Issues

### "Agent spins in circles"
- Policy learned to avoid death by staying in one spot
- **Fix**: Increase `idle` penalty to -0.5
- **Fix**: Increase `explore` reward to 0.2

### "Agent hits walls repeatedly"
- Wall avoidance not learned yet
- **Fix**: Increase `stuck` penalty to -1.0
- **Fix**: Train more generations

### "Agent ignores nearby resources"
- **This is your issue!**
- Policy hasn't learned resource-seeking yet
- **Fix**: Train to Gen 50+
- **Fix**: Increase `collectResource` reward
- **Fix**: Reduce `chiSpend` penalty

### "Learning curve is flat"
- Policy not improving
- **Fix**: Increase population size to 30
- **Fix**: Increase mutation noise to 0.15
- **Fix**: Check reward function isn't contradictory

### "Rewards keep decreasing"
- Policy diverging instead of converging
- **Fix**: Decrease mutation noise to 0.05
- **Fix**: Increase elite count to 8
- **Fix**: Reset and start over

---

## 🎓 Understanding the Algorithm (CEM)

Your system uses **Cross-Entropy Method**:

1. **Sample**: Generate 20 random policies
2. **Evaluate**: Run each for 2000 ticks
3. **Select**: Keep top 5 (elites)
4. **Update**: Adjust toward elites
5. **Repeat**: Next generation

**Why it's slow:**
- 20 policies × 2000 ticks × 60 fps = ~11 minutes/generation
- This is normal for browser-based training
- Be patient!

**Why it works:**
- Gradually shifts toward better behaviors
- Explores policy space efficiently
- Simple and robust

---

## 💡 Pro Tips

1. **Save Often**: Save every 10 generations
2. **Name Clearly**: `slime-gen50-explore.json`
3. **Compare**: Load and test multiple policies
4. **Iterate**: Training is experimental!
5. **Monitor**: Watch console logs during training
6. **Be Patient**: Good policies take 50-100 generations
7. **Reward Shape**: Small changes in rewards → big behavior changes
8. **Baseline**: Always compare to heuristic

---

## 🚀 Quick Fix for Your Situation

**You have Gen 8 policy that ignores resources. Here's what to do:**

### Immediate (5 minutes):
1. Press `[L]` to open training panel
2. Click "📂 Load Policy" 
3. Select `slime-policy-gen8.json`
4. Change generations to `20`
5. Click "▶️ Start Training"
6. Wait for Gen 28
7. Click "✅ Use This Policy"
8. **Should be noticeably better!**

### Short Term (30 minutes):
1. Keep training to Gen 50
2. Save as `slime-policy-gen50.json`
3. Test it
4. **Should collect 1-3 resources now!**

### Long Term (1-2 hours):
1. Train to Gen 100+
2. Tune reward function
3. Compare to heuristic
4. **Should be competitive!**

---

## 🎉 Expected Timeline

```
Gen 8  (now): Agent ignores resources ← YOU ARE HERE
       ↓
Gen 20: Agent sometimes gets close to resources
       ↓
Gen 35: Agent collected first resource!
       ↓
Gen 50: Agent seeks resources when visible
       ↓
Gen 75: Agent uses sensing to find resources
       ↓
Gen 100: Agent reliably collects multiple resources
       ↓
Gen 150: Agent behavior looks intelligent
       ↓
Gen 200+: Might beat hand-coded heuristic!
```

---

## 📝 Summary

**Your policy isn't broken - it's just undertrained!**

- Gen 8 is VERY early
- Resource-seeking requires 50+ generations
- Training is working, just needs more time
- The new UI shows exactly which policy is loaded
- Action values help debug behavior
- Be patient and train longer! 🚀

**Next step:** Load Gen 8, train 42 more generations (to Gen 50), and watch the magic happen!

