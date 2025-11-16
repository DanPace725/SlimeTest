<!-- ormd:0.1 -->
---
title: "Adaptive Reward System - Decision Tree"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.726861Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 🌳 Adaptive Reward System - Decision Tree

## Start Here: Should You Implement This?

```
┌─────────────────────────────────────────┐
│ Are resource-seeking weights weak?     │
│ (scores < 0.1 after 20+ generations)   │
└───────────┬─────────────────────────────┘
            │
            ├─ YES → Continue ↓
            │
            └─ NO → You're fine, skip this
            
┌─────────────────────────────────────────┐
│ Do agents learn survival but not       │
│ resource collection?                    │
└───────────┬─────────────────────────────┘
            │
            ├─ YES → Continue ↓
            │
            └─ NO → Different problem, debug first

┌─────────────────────────────────────────┐
│ Is current reward (~6 χ) smaller than  │
│ metabolic cost of typical search?      │
│ (cost ≈ 0.4 χ/s × find_time)           │
└───────────┬─────────────────────────────┘
            │
            ├─ YES → ✅ IMPLEMENT ADAPTIVE REWARDS
            │
            └─ NO → Just increase CONFIG.rewardChi

```

---

## Implementation Approach: Which Option?

```
┌─────────────────────────────────────────┐
│ Choose Your Reward Strategy             │
└───────────┬─────────────────────────────┘
            │
            ├─────────────────────────────────┐
            │                                 │
            ▼                                 ▼
    ┌─────────────────┐           ┌─────────────────┐
    │ OPTION 1:       │           │ OPTION 2:       │
    │ Adaptive/       │           │ Absolute        │
    │ Behavioral      │  ←PICK    │ Biological      │
    │                 │   THIS!   │ Anchor          │
    └────────┬────────┘           └────────┬────────┘
             │                              │
             ▼                              ▼
    Pro:                          Pro:
    • Auto-scales                 • Biologically exact
    • RL-friendly                 • Principled
    • Adapts to difficulty        
                                   Con:
    Con:                          • Very high rewards
    • Needs tuning                • May dominate learning
    • One extra parameter         • Fixed value
    
    USE CASE:                     USE CASE:
    Normal training,              Research/modeling
    want good learning            exact metabolism
```

**Recommendation:** **Option 1 (Adaptive/Behavioral)** with biological comments for context.

---

## Configuration Strategy

```
┌─────────────────────────────────────────┐
│ How aggressive should rewards be?       │
└───────────┬─────────────────────────────┘
            │
            ├─────────────┬─────────────┬─────────────┐
            │             │             │             │
            ▼             ▼             ▼             ▼
    Conservative   Balanced      Generous    Extreme
    gainFactor=4   gainFactor=6  gainFactor=8  gainFactor=10
    
    • Safer       • Recommended  • Faster      • High risk
    • Slower      • Good balance • learning     • May exploit
    • Stable      • ~3x boost    • ~4x boost   • ~5x boost
    
    reward≈12χ    reward≈19χ    reward≈25χ    reward≈32χ
```

**Recommendation:** Start with **gainFactor=6**, increase if learning is still slow.

---

## EMA Tuning

```
┌─────────────────────────────────────────┐
│ How fast should rewards adapt?          │
└───────────┬─────────────────────────────┘
            │
            ├─────────────┬─────────────┬─────────────┐
            │             │             │             │
            ▼             ▼             ▼             ▼
    Very Slow      Slow        Medium      Fast
    alpha=0.05    alpha=0.1   alpha=0.15  alpha=0.2
    
    • Stable      • Recommended • Responsive • Volatile
    • Ignores     • Smooths     • Tracks     • Noisy
      outliers      noise         trends    
    • ~20 samples • ~10 samples • ~7 samples • ~5 samples
      to converge   to converge   to converge  to converge
```

**Recommendation:** Start with **alpha=0.1**, decrease if rewards are too noisy.

---

## Implementation Phases

```
                    START
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │ PHASE 1: Core Tracking (30 min)    │
    │ • Add EMA to World                  │
    │ • Add config settings               │
    └────────────┬────────────────────────┘
                 │
                 ▼ [Test: EMA updates]
    ┌─────────────────────────────────────┐
    │ PHASE 2: Calculation (30 min)      │
    │ • Create reward functions           │
    │ • Add safety bounds                 │
    └────────────┬────────────────────────┘
                 │
                 ▼ [Test: Math correct]
    ┌─────────────────────────────────────┐
    │ PHASE 3: Integration (1 hour)      │
    │ • Hook into collection              │
    │ • Scale learning signals            │
    └────────────┬────────────────────────┘
                 │
                 ▼ [Test: Full episode]
    ┌─────────────────────────────────────┐
    │ PHASE 4: Validation (1 hour)       │
    │ • Run 10 training generations       │
    │ • Compare with baseline             │
    └────────────┬────────────────────────┘
                 │
                 ▼ [Good results?]
                 │
    ┌────────────┴────────────┐
    │ NO                      │ YES
    ▼                         ▼
    Tune parameters     ┌──────────────────────┐
    (adjust gainFactor) │ PHASE 5: Polish      │
    │                   │ • Add HUD display    │
    └────────→          │ • Enhance features   │
                        │ • Document results   │
                        └──────────────────────┘
                                  │
                                  ▼
                               DONE ✅
```

---

## Troubleshooting Decision Tree

```
┌─────────────────────────────────────────┐
│ Is resource-seeking improving?          │
└───────────┬─────────────────────────────┘
            │
            ├─ YES → ✅ Success! Keep training
            │
            ├─ NO → Check avgFindTime in HUD
            │        │
            │        ├─ <5s → Resources too easy
            │        │        • Add more agents
            │        │        • Larger environment
            │        │
            │        ├─ 5-15s → Normal range
            │        │          Check reward value
            │        │          │
            │        │          ├─ <10χ → Increase gainFactor
            │        │          ├─ 10-30χ → Good, keep training
            │        │          └─ >50χ → Decrease gainFactor
            │        │
            │        └─ >20s → Resources too hard
            │                  • Check if agents are stuck
            │                  • Reduce environment size
            │                  • Check wall penalties

┌─────────────────────────────────────────┐
│ Are rewards stable?                     │
└───────────┬─────────────────────────────┘
            │
            ├─ YES → ✅ Good
            │
            └─ NO (jumping wildly)
                      │
                      ├─ Decrease emaAlpha (0.1→0.05)
                      ├─ Check for bugs (NaN, Infinity)
                      └─ Verify safety bounds active

┌─────────────────────────────────────────┐
│ Is training too slow?                   │
└───────────┬─────────────────────────────┘
            │
            ├─ Increase gainFactor (6→8)
            ├─ Decrease evapPerSec (make trails less valuable)
            ├─ Decrease residualGainPerSec (make reuse less rewarding)
            └─ Check collectResource multiplier in Phase 6
```

---

## Quick Reference Card

### Key Formulas

```javascript
// Effective metabolic cost
C_base = baseDecay + moveFraction × moveCost
       = 0.15 + 0.7 × 0.35
       = 0.395 χ/s

// Adaptive reward
reward = gainFactor × C_base × avgFindTime

// EMA update
avgFindTime = (1 - alpha) × oldAvg + alpha × currentFindTime

// With defaults:
reward = 6 × 0.395 × 8 = 18.96 χ ≈ 19 χ
```

### Default Configuration

```javascript
adaptiveReward: {
  enabled: true,
  gainFactor: 6.0,          // 4-10 range
  avgMoveFraction: 0.7,     // 70% moving
  emaAlpha: 0.1,            // Slow smoothing
  minReward: 3.0,           // Safety floor
  maxReward: 100.0,         // Safety ceiling
}
```

### Expected Reward Ranges

| Find Time | Conservative (4x) | Balanced (6x) | Generous (8x) |
|-----------|-------------------|---------------|---------------|
| 5s        | 8 χ              | 12 χ         | 16 χ         |
| 8s        | 13 χ             | 19 χ         | 25 χ         |
| 12s       | 19 χ             | 28 χ         | 38 χ         |
| 15s       | 24 χ             | 36 χ         | 47 χ         |
| 20s       | 32 χ             | 47 χ         | 63 χ         |

---

## Files to Modify

```
Priority 1 (Core):
├── config.js          [+20 lines] Add adaptiveReward config
├── rewards.js         [+40 lines] Add calculation functions
├── app.js             [+30 lines] Integrate & track EMA
└── app.js (World)     [+10 lines] Add EMA state

Priority 2 (Optional):
├── app.js (HUD)       [+10 lines] Display stats
└── rewards.js         [+5 lines]  Scale provenance credit

Documentation:
├── REWARD_SYSTEM_IMPLEMENTATION_PLAN.md [Created ✅]
├── REWARD_SYSTEM_SUMMARY.md             [Created ✅]
└── REWARD_DECISION_TREE.md              [This file ✅]
```

---

## Success Checklist

### After Implementation
- [ ] Code compiles without errors
- [ ] HUD shows avgFindTime and reward
- [ ] No NaN or Infinity values
- [ ] Rewards in expected range (10-40 χ)

### After 10 Generations
- [ ] avgFindTime has stabilized
- [ ] Rewards are consistent
- [ ] No crashes or performance issues
- [ ] Best reward still improving

### After 20 Generations
- [ ] Resource score > 0.10 (was 0.04)
- [ ] Turn→resDx/resDy weights > 0.1
- [ ] Thrust→resVis weight > 0.1
- [ ] Compare favorably with Gen 30 baseline

### After 30-40 Generations
- [ ] Resource score > 0.15
- [ ] Seeking weights > 0.2
- [ ] Agents visibly seek resources
- [ ] Best reward > 60

---

## The One-Page Summary

**Problem:** Fixed 6 χ reward too weak → agents don't learn to seek resources

**Solution:** Dynamic reward scaling with search difficulty
```
reward = 6 × metabolic_cost_per_sec × avg_time_to_find
       ≈ 19 χ (for typical 8-second searches)
```

**Implementation:** 4 phases, ~4 hours, ~100 lines total

**Risk:** Low (backward compatible, bounded, toggleable)

**Reward:** 3-5x stronger learning signal → resource-seeking in ~20 gens

**Next Step:** Implement Phase 1-3, test, then continue based on results

---

**Ready to code? Start with `REWARD_SYSTEM_IMPLEMENTATION_PLAN.md` Phase 1!** 🚀

