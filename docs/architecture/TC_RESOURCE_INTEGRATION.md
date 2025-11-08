# TC Rule 110 → Resource Generation Integration

This document describes how Rule 110 cellular automaton state can influence resource spawning, making the environment truly driven by Turing-complete computation.

## Concept: Living Computational Environment

Instead of random resource spawns, resources emerge from **patterns in the Rule 110 cellular automaton**. The agents forage in an environment shaped by universal computation!

## Integration Approaches

### 🌟 Option 1: Pattern-Based Spawning (RECOMMENDED)

**Concept**: Resources spawn at locations corresponding to **active structures** in Rule 110.

```javascript
// Map Rule 110 cells to horizontal positions
const rule110State = window.rule110Stepper?.getState();
if (rule110State) {
  // Each active cell in Rule 110 is a potential resource spawn point
  for (let i = 0; i < rule110State.length; i++) {
    if (rule110State[i] === 1) {
      const x = (i / rule110State.length) * canvasWidth;
      const y = /* some Y logic */;
      // Spawn resource at (x, y)
    }
  }
}
```

**Pros**:
- Direct visual mapping
- Agents can learn to "read" Rule 110 patterns
- Emergent structures (gliders, etc.) create dynamic resource patches

**Cons**:
- Could create too many/few resources depending on Rule 110 state

---

### 🌊 Option 2: Activity-Modulated Spawning

**Concept**: Rule 110 **activity level** modulates spawn rate/probability.

```javascript
// Calculate Rule 110 "temperature" (% of active cells)
const activity = countActiveCells(rule110State) / rule110State.length;

// Use activity to modulate spawn chance
const baseSpawnChance = 0.1;
const tcModulatedChance = baseSpawnChance * (0.5 + activity * 1.5);
// Low activity = fewer spawns, high activity = more spawns
```

**Pros**:
- Smooth, gradual influence
- Agents experience computational "seasons"
- Easy to tune

**Cons**:
- Less direct connection
- Agents can't "see" the pattern, only feel effects

---

### 🎯 Option 3: Spatial Fertility Map

**Concept**: Rule 110 state creates a **fertility map** across the world.

```javascript
// Map Rule 110 to horizontal fertility bands
for (let i = 0; i < rule110State.length; i++) {
  const x = (i / rule110State.length) * canvasWidth;
  const fertility = calculateLocalActivity(rule110State, i, radius=5);
  
  // High fertility in regions with Rule 110 activity
  // Resources spawn preferentially in fertile regions
}
```

**Pros**:
- Integrates with existing FertilityGrid system
- Creates spatial patterns agents must navigate
- Rule 110 gliders create "moving gardens"

**Cons**:
- More complex implementation
- May need visual indicators for clarity

---

### 🌀 Option 4: Glider-Tracking Resources

**Concept**: Detect **emergent structures** (gliders) in Rule 110 and spawn resources that follow them.

```javascript
// Detect gliders in Rule 110
const gliders = detectGliders(rule110State);

// Each glider "carries" a resource
gliders.forEach(glider => {
  const resource = resources[glider.id];
  resource.x = (glider.position / rule110State.length) * canvasWidth;
  // Resources move with computational structures!
});
```

**Pros**:
- **MOST INTERESTING** - resources become living computational entities
- Agents hunt "living" patterns
- Demonstrates emergent complexity

**Cons**:
- Complex glider detection
- May be unpredictable

---

## Recommended Implementation: Hybrid Approach

Combine **spatial mapping** with **activity modulation**:

### Phase 1: Direct Mapping
Map Rule 110 state to horizontal bands, creating resource spawn zones:

```javascript
function getRule110SpawnLocation(rule110Stepper, canvasWidth, canvasHeight) {
  const state = rule110Stepper.getState();
  
  // Find active cells (value = 1)
  const activeCells = [];
  for (let i = 0; i < state.length; i++) {
    if (state[i] === 1) activeCells.push(i);
  }
  
  if (activeCells.length === 0) {
    // Fallback if all dead
    return { x: canvasWidth / 2, y: canvasHeight / 2 };
  }
  
  // Pick random active cell
  const cellIndex = activeCells[Math.floor(TcRandom.random() * activeCells.length)];
  
  // Map to world coordinates
  const x = (cellIndex / state.length) * canvasWidth;
  
  // Use local activity for Y position (creates vertical structure)
  const localActivity = getLocalActivity(state, cellIndex, 5); // 5-cell radius
  const y = canvasHeight * (0.5 + (TcRandom.random() - 0.5) * localActivity);
  
  return { x, y };
}

function getLocalActivity(state, center, radius) {
  let count = 0;
  for (let i = -radius; i <= radius; i++) {
    const idx = (center + i + state.length) % state.length;
    if (state[idx] === 1) count++;
  }
  return count / (2 * radius + 1); // 0..1
}
```

### Phase 2: Activity Modulation
Use overall Rule 110 activity to modulate spawn rates:

```javascript
function getRule110Activity(rule110Stepper) {
  const state = rule110Stepper.getState();
  let activeCount = 0;
  for (let i = 0; i < state.length; i++) {
    if (state[i] === 1) activeCount++;
  }
  return activeCount / state.length; // 0..1
}

// In spawn logic:
const tcActivity = getRule110Activity(window.rule110Stepper);
const spawnMultiplier = 0.5 + tcActivity; // 0.5x to 1.5x base rate
```

---

## Configuration Options

Add to `config.js`:

```javascript
tcResourceIntegration: {
  enabled: true,
  
  // How Rule 110 influences spawning
  mode: 'spatial',  // 'spatial', 'activity', 'hybrid', 'glider'
  
  // Spatial mapping
  horizontalMapping: true,  // Map Rule 110 X → World X
  localityRadius: 5,        // Cells to check for local activity
  
  // Activity modulation
  activityInfluence: 0.5,   // 0 = no influence, 1 = full control
  minSpawnMultiplier: 0.3,  // Min spawn rate at 0% activity
  maxSpawnMultiplier: 1.5,  // Max spawn rate at 100% activity
  
  // Visual feedback
  showTcMapping: true,      // Show Rule 110 state overlay
  mappingOpacity: 0.2,      // Overlay transparency
  
  // Glider tracking (advanced)
  trackGliders: false,
  gliderDetectionWindow: 10,
  gliderVelocityThreshold: 1
}
```

---

## Expected Behaviors

### With Pattern-Based Spawning:
- **Dense Rule 110 regions** → resource clusters
- **Sparse regions** → resource deserts
- **Gliders** → moving resource patches
- Agents learn to **correlate visual patterns** with food availability

### With Activity Modulation:
- **High activity** → abundant resources (computational "spring")
- **Low activity** → scarce resources (computational "winter")
- Agents experience **cyclical scarcity** driven by computation
- Creates long-term temporal patterns

### With Hybrid:
- **Spatial + temporal** complexity
- Resources cluster in computational "hotspots"
- Activity waves create **migration pressure**
- Agents must track both space and time

---

## Implementation Strategy

1. **Add helper functions** to read Rule 110 state
2. **Modify `Resource.respawn()`** to check TC integration setting
3. **Add TC mapping visualization** (optional overlay)
4. **Tune parameters** for balanced gameplay

---

## Philosophical Implications

This integration means:

✨ **The environment is Turing-complete**
- Resources emerge from universal computation
- Agent survival depends on understanding algorithmic patterns

🧬 **Agents evolve computational intuition**
- Successful agents learn to "read" Rule 110
- Selection pressure for pattern recognition

🌍 **Living computational ecology**
- Not just agents are alive - the *world* computes
- Demonstrates computation → emergence → life

---

## Next Steps

1. Implement basic spatial mapping
2. Add visualization overlay
3. Test with various Rule 110 initializers (ether, glider, random)
4. Monitor agent learning curves
5. Tune parameters for interesting dynamics

This creates a truly **computationally alive** environment where agents don't just *exist in* a Turing machine - they *forage in one*! 🎯

