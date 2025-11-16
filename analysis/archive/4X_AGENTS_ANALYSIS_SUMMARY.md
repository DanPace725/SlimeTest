# 4-Agent Training Analysis Summary

## Overview
Analysis of 4-agent multi-agent training from Generation 20 to Generation 90.

**Training Configuration:**
- **Agents:** 4 agents (all using shared policy)
- **Generations Analyzed:** 20, 50, 70, 90
- **Training Mode:** Multi-agent cooperative learning via trail sharing

---

## 📊 Key Findings

### 1. **Performance Improvement: ✓ STRONG**

```
Gen 20 → Gen 90: +529.80 reward (+13.9% improvement)
  - Gen 20: 3,813.83
  - Gen 50: 3,883.06 (+1.8%)
  - Gen 70: 4,099.04 (+5.6%)  
  - Gen 90: 4,343.64 (+6.0%)
```

**Analysis:**
- Steady improvement over 70 generations
- Learning curve shows consistent upward trend
- Best performance at Gen 90 with 4,343.64 reward
- Gen 0 baseline was only 1,758.20, showing **147% total improvement** to Gen 90

### 2. **Resource-Seeking Behavior: ⚠️ WEAK**

```
Average Resource-Seeking Score: 0.055 (WEAK)
  - Gen 20: 0.067
  - Gen 50: 0.051  
  - Gen 70: 0.054
  - Gen 90: 0.048 (DECLINING!)
```

**Critical Issue:** Despite reward improvements, resource-seeking declined -28% (0.067 → 0.048)

**Why This Matters:**
- Agents are NOT learning to directly seek resources
- Instead, they're optimizing for **trail-following and cooperation**
- Resource finding appears to be incidental, not intentional

### 3. **Learning Strategy: Trail-Based Cooperation**

**What the agents ARE learning:**

Gen 90 Turn Weights (Top 5):
1. **wallMag → -0.4460** (Strong wall avoidance)
2. **trailMean → +0.2003** (FOLLOW trails!)
3. **wallNy → -0.1250** (Wall navigation)
4. **resVisible → -0.1239** (NEGATIVE - avoid visible resources?!)
5. **chi → -0.1024** (Energy management)

Gen 90 Thrust Weights (Top 5):
1. **wallMag → +0.2226** (Thrust toward walls?!)
2. **resVisible → +0.1444** (Some resource seeking)
3. **trailMean → +0.1227** (Follow trails)
4. **chi → +0.1155** (Energy-based thrust)
5. **trailMax → +0.0807** (Seek strong trails)

**Key Insight:** 
The agents discovered that **following each other's trails** is more rewarding than directly seeking resources! This is emergent cooperative behavior.

### 4. **Convergence Status: ⚠️ MODERATE**

```
Collapsed Weights:
  - Gen 20: 45.8% (22/48 weights)
  - Gen 50: 68.8% (33/48 weights) ⚠️
  - Gen 70: 66.7% (32/48 weights)
  - Gen 90: 64.6% (31/48 weights) 
```

**Analysis:**
- High convergence (>60%) suggests policy is settling
- Some weights are "stuck" with very low exploration (σ ≤ 0.01)
- Average σ remains low at 0.0117
- **Recommendation:** Consider increasing mutation noise to escape local optimum

### 5. **Unexpected Behaviors**

**🚨 Turn Response to Resource Visibility: NEGATIVE (-0.124)**
- Agents actually turn AWAY from visible resources!
- This seems counterintuitive but may be strategic

**🚨 Resource Direction Weights: Near Zero**
```
Turn → resDx: -0.018 (almost zero)
Turn → resDy: -0.001 (almost zero)
Thrust → resDx: -0.028 (weak)
Thrust → resDy: -0.048 (weak)
```

**Hypothesis:** 
With 4 agents and 3 resources, the agents may have learned that:
1. Resources are abundant enough that random/trail-based exploration finds them
2. Cooperating via trails provides more consistent rewards (residual chi gain)
3. Direct resource-seeking is less efficient than "group foraging" via trails

---

## 🎯 Detailed Weight Analysis

### Resource-Seeking Weights (Gen 90)

| Feature | Turn | Thrust | Sense | Interpretation |
|---------|------|--------|-------|----------------|
| **resDx** | -0.018 | -0.028 | -0.069 | ❌ Not seeking X direction |
| **resDy** | -0.001 | -0.048 | -0.050 | ❌ Not seeking Y direction |
| **resVisible** | -0.124 | +0.144 | -0.050 | ⚠️ Thrust toward it, but turn away?! |

### Survival Weights (Gen 90)

| Feature | Turn | Thrust | Sense | Interpretation |
|---------|------|--------|-------|----------------|
| **wallMag** | -0.446 | +0.223 | -0.074 | ✓ Strong wall avoidance in turns |
| **chi** | -0.102 | +0.116 | -0.206 | ✓ Energy-aware behavior |
| **frustration** | +0.013 | -0.045 | -0.114 | ✓ Reduce sensing when frustrated |

### Trail-Following Weights (Gen 90)

| Feature | Turn | Thrust | Sense | Interpretation |
|---------|------|--------|-------|----------------|
| **trailMean** | +0.200 | +0.123 | -0.016 | ✓ Strong trail following! |
| **trailMax** | +0.047 | +0.081 | -0.013 | ✓ Seek strongest trails |
| **trailDirX** | +0.015 | +0.064 | +0.113 | ✓ Navigate using trail direction |
| **trailDirY** | +0.094 | +0.048 | -0.062 | ✓ Trail-based navigation |

---

## 💡 Key Insights & Interpretations

### 1. **Emergent Multi-Agent Strategy**
The 4 agents discovered a **cooperative foraging strategy**:
- Agent deposits trail → Other agents follow → Find resources → Repeat
- This creates a positive feedback loop where trail-following is rewarded
- Resources are found as a byproduct of exploration, not direct seeking

### 2. **Why Resource-Seeking Score Declined**
The reward function may be favoring:
- **Survival duration** (staying alive longer)
- **Residual chi gain** from walking on others' trails
- **Exploration bonuses** for coverage
- NOT heavily rewarding direct resource collection

### 3. **The "Swarm Effect"**
With 4 agents and 3 resources:
- High agent density means resources are found frequently anyway
- Trail network becomes dense and informative
- Individual resource-seeking becomes less important than group coordination

### 4. **Convergence Concerns**
- 64.6% of weights have collapsed (σ ≤ 0.01)
- Policy may be stuck in a "good enough" local optimum
- To improve further, consider:
  - Increasing mutation noise (σ)
  - Adjusting reward weights to favor resource collection
  - Adding diversity pressure to CEM/CMA-ES

---

## 📈 Performance Trends

### Best Reward Over Generations
```
Gen 0:  1,758.20
Gen 20: 3,813.83 (+117%)
Gen 50: 3,883.06 (+1.8%)
Gen 70: 4,099.04 (+5.6%)
Gen 90: 4,343.64 (+6.0%)
```

**Trend:** Steady improvement with diminishing returns

### Mean Reward (Population Average)
```
Gen 20: 1,123.21
Gen 90: 2,855.31 (+154% improvement!)
```

**Interpretation:** The entire population is getting better, not just the elite

### Elite Mean Reward (Top 5 Policies)
```
Gen 20: 2,582.33
Gen 90: 3,216.05 (+24.5%)
```

---

## 🔬 Experimental Observations

### Positive Findings ✓
1. **Stable learning:** Consistent improvement over 90 generations
2. **Cooperative behavior:** Agents learned to use each other's trails effectively
3. **Wall avoidance:** Strong learned response (-0.446 turn weight)
4. **Energy management:** Chi-aware thrusting and sensing
5. **No catastrophic forgetting:** Performance never regressed

### Areas of Concern ⚠️
1. **Weak resource-seeking:** Score declined from 0.067 → 0.048
2. **High convergence:** 64.6% of weights collapsed
3. **Counterintuitive weights:** Negative turn response to visible resources
4. **Diminishing returns:** Improvements slowing after Gen 70

### Mystery Behaviors 🤔
1. Why do agents turn AWAY from visible resources? (-0.124 weight)
2. Why is direct resource-seeking so weak despite high rewards?
3. Is the trail-following strategy actually optimal for this environment?

---

## 🎮 Recommendations

### For Better Resource-Seeking
1. **Increase reward for collection:**
   ```javascript
   rewards.collectResource: 500.0 (up from 200.0)
   ```

2. **Reduce residual gain rewards:**
   ```javascript
   rewards.provenanceCredit: 0.5 (down from 1.0)
   ```

3. **Add shaped reward for approaching resources:**
   ```javascript
   rewards.approachResource: +1.0 per pixel closer
   ```

### For Better Exploration
1. **Increase mutation noise:**
   ```javascript
   mutationStdDev: 0.2 (up from 0.1)
   ```

2. **Use adaptive sigma:**
   - Increase σ when improvement plateaus
   - Decrease σ when actively improving

3. **Add diversity bonus:**
   - Penalize policies too similar to elites
   - Encourage exploration of weight space

### For Comparison
**Try training with different agent counts:**
- 2 agents (baseline)
- 4 agents (current - cooperative)
- 8 agents (swarm intelligence?)
- 1 agent (no cooperation)

Compare resource-seeking scores to see how multi-agent dynamics affect learning.

---

## 📊 Visual Analysis

An interactive HTML report has been generated: **`4x-agents-analysis.html`**

Open this file in a browser to see:
- Performance comparison charts
- Resource-seeking score visualization  
- Weight heatmaps
- Learning curves
- Convergence analysis

---

## 🔍 Conclusion

The 4-agent training run demonstrates **successful multi-agent learning** with rewards improving by 13.9% (Gen 20→90) and 147% (Gen 0→90).

However, the agents learned an **unexpected strategy**: instead of direct resource-seeking, they developed a **trail-following cooperative behavior** that achieves high rewards through group coordination.

This is actually a **fascinating emergent behavior** showing that the multi-agent system found a local optimum based on cooperation rather than individual optimization. Whether this is desirable depends on your goals:

- **If you want cooperation:** ✓ Success! The agents learned to work together
- **If you want resource-seeking:** ⚠️ Need to adjust reward function

The declining resource-seeking score (0.067 → 0.048) suggests the current reward structure favors survival and trail-following over direct resource collection.

**Next Steps:**
1. Review the HTML report for detailed visualizations
2. Test policies in play mode to observe behaviors
3. Adjust reward weights if resource-seeking is desired
4. Consider training with modified configs for comparison

---

*Analysis generated on November 4, 2025*
*Tools used: `policyBatchAnalyzer.js`, `policyAnalyzer.js`*

