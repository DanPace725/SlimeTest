<!-- ormd:0.1 -->
---
title: "Quick Start: TC-Resource Integration"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.733754Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# Quick Start: TC-Resource Integration

Link Rule 110 cellular automaton to resource spawning for a truly computational living environment!

## ⚠️ Common Issues

### Overlay Not Visible

If you don't see the green Rule 110 overlay after setup:

1. **showOverlay is disabled** - Set `CONFIG.tcResourceIntegration.showOverlay = true`
2. **Stepper not registered** - Make sure `window.rule110Stepper` exists
3. **Opacity too low** - Increase `CONFIG.tcResourceIntegration.overlayOpacity` to 0.5 or higher
4. **TC not enabled** - Run `enableTC('rule110')` first

### Overlay Disappears After World.reset()

**IMPORTANT:** `World.reset()` clears TC storage! Always register the stepper **AFTER** calling `World.reset()`:

```javascript
// ❌ WRONG ORDER - overlay will disappear
const { stepper } = registerRule110Stepper(...);
window.rule110Stepper = stepper;
World.reset();  // Clears TC storage!

// ✅ CORRECT ORDER
World.reset();  // Clear first
const { stepper } = registerRule110Stepper(...);
window.rule110Stepper = stepper;  // Then register
```

**Quick Fix** (run in console):
```javascript
(async () => {
  const { CONFIG } = await import('./config.js');
  CONFIG.tcResourceIntegration.showOverlay = true;
  CONFIG.tcResourceIntegration.overlayOpacity = 0.5;  // Make it visible!
  console.log('✅ Overlay should now be visible (if stepper is registered)');
})();
```

## 🚀 Quick Setup (Browser Console)

Paste this **complete block** into your browser console (all at once):

```javascript
(async () => {
  // Step 1: Enable TC first
  enableTC('rule110');
  
  // Step 2: Import CONFIG and enable TC-Resource integration
  const { CONFIG } = await import('./config.js');
  CONFIG.tcResourceIntegration.enabled = true;
  CONFIG.tcResourceIntegration.mode = 'hybrid';  // 'spatial', 'activity', or 'hybrid'
  CONFIG.tcResourceIntegration.showOverlay = true;  // Show Rule 110 visualization
  CONFIG.tcResourceIntegration.overlayOpacity = 0.5;  // Good visibility
  
  // Step 3: Reset world (clears TC storage, so do this BEFORE registering stepper)
  World.reset();
  
  // Step 4: Register Rule 110 stepper AFTER reset
  const { registerRule110Stepper } = await import('./tc/tcRule110.js');
  const { stepper } = registerRule110Stepper({
    width: 128,
    initializer: 'ether',
    stateKey: 'tc.rule110.state',
    bufferKey: 'tc.rule110.next'
  });
  window.rule110Stepper = stepper;
  
  console.log('✅ TC-Resource integration active!');
  console.log('Resources now spawn based on Rule 110 patterns');
  console.log('🟩 Green bars at top = Rule 110 cells (they update each frame)');
  console.log('📊 Activity bar shows % of active cells');
})();
```

**Note:** Paste the entire block including the `(async () => { ... })();` wrapper.

## 📊 What You'll See

### Understanding the Overlay

The green bars at the top of the screen **update in real-time** - this is **Rule 110 computing**!

- **Vertical green bars** = active cells (value = 1) in the cellular automaton
- **Black spaces** = inactive cells (value = 0)
- **Bars "flying across"** = the CA evolving - each frame applies Rule 110 to all cells
- **Activity bar (right)** = percentage of active cells + label below

This is **not a bug** - you're watching Turing-complete computation unfold! The patterns you see are:
- **Gliders** - structures that move across the screen
- **Static blocks** - stable patterns
- **Chaos** - rapidly changing regions
- **Propagating structures** - patterns that expand or contract

### With `mode: 'spatial'`
- Resources spawn at X coordinates matching **active cells** in Rule 110
- Creates horizontal **resource bands** that follow computational patterns
- Gliders in Rule 110 → moving resource patches
- Agents must track computational structures

### With `mode: 'activity'`
- Rule 110 **density** (% active cells) controls spawn rate
- High activity → more resources (computational "spring")
- Low activity → fewer resources (computational "winter")
- Random positions, but TC-modulated frequency

### With `mode: 'hybrid'` ⭐ RECOMMENDED
- **Both spatial AND activity** effects
- Resources cluster where Rule 110 is active
- Spawn rate varies with global activity
- Most dynamic and interesting!

### With `showOverlay: true`
- **Top bar shows Rule 110 state** - green vertical bars = active cells (1s)
- **Bars "fly" across screen** - this is the cellular automaton evolving in real-time!
- **Activity bar (right side)** - shows % of active cells and overall system activity
- Watch the computation driving your environment unfold!

## 🎮 Interactive Examples

### Example 1: Sparse Computational Desert

```javascript
(async () => {
  // Setup config first
  const { CONFIG } = await import('./config.js');
  CONFIG.tcResourceIntegration.enabled = true;
  CONFIG.tcResourceIntegration.mode = 'spatial';
  CONFIG.tcResourceIntegration.showOverlay = true;
  CONFIG.tcResourceIntegration.overlayOpacity = 0.5;
  
  // Reset BEFORE registering stepper (World.reset clears TC storage)
  World.reset();
  
  // NOW register glider initializer - creates sparse patterns
  const { registerRule110Stepper } = await import('./tc/tcRule110.js');
  const { stepper } = registerRule110Stepper({
    width: 128,
    initializer: 'glider',
    initializerOptions: { offset: 20 }
  });
  window.rule110Stepper = stepper;
  
  console.log('🌵 Sparse desert mode! Resources follow the glider.');
})();
```

### Example 2: Dense Computational Garden

```javascript
  (async () => {
    // Random initializer with high density
    const { registerRule110Stepper } = await import('./tc/tcRule110.js');
    const { stepper } = registerRule110Stepper({
      width: 128,
      initializer: 'random',
      initializerOptions: { density: 0.7, seed: 42 }
    });
    window.rule110Stepper = stepper;
    
    const { CONFIG } = await import('./config.js');
    CONFIG.tcResourceIntegration.enabled = true;
    CONFIG.tcResourceIntegration.mode = 'hybrid';
    CONFIG.tcResourceIntegration.activityInfluence = 0.8;  // Strong modulation
  
    
    console.log('🌳 Dense garden mode! Many clustered resources.');
  })();
```

### Example 3: Computational Seasons

```javascript
(async () => {
  // Activity mode creates temporal cycles
  const { CONFIG } = await import('./config.js');
  CONFIG.tcResourceIntegration.enabled = true;
  CONFIG.tcResourceIntegration.mode = 'activity';
  CONFIG.tcResourceIntegration.minSpawnMultiplier = 0.2;  // Harsh winters
  CONFIG.tcResourceIntegration.maxSpawnMultiplier = 2.0;  // Abundant springs
  CONFIG.tcResourceIntegration.activityInfluence = 1.0;   // Full effect
  CONFIG.tcResourceIntegration.showOverlay = true;
  
  World.reset();  // Reset first
  
  // Register stepper after reset
  const { registerRule110Stepper } = await import('./tc/tcRule110.js');
  const { stepper } = registerRule110Stepper({
    width: 128,
    initializer: 'ether'
  });
  window.rule110Stepper = stepper;
  
  console.log('🌦️ Seasonal mode! Watch spawn rate cycle with TC activity.');
  
  // Watch spawn rate vary as Rule 110 evolves
  window.seasonMonitor = setInterval(() => {
    if (window.rule110Stepper) {
      const activity = window.rule110Stepper.getState().filter(c => c === 1).length / 128;
      console.log(`Activity: ${(activity * 100).toFixed(1)}% → Spawn rate: ${(0.2 + activity * 1.8).toFixed(2)}x`);
    }
  }, 3000);
  
  console.log('Use clearInterval(window.seasonMonitor) to stop monitoring.');
})();
```

## 🔧 Configuration Options

All options in `CONFIG.tcResourceIntegration`:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `enabled` | boolean | false | Master switch |
| `mode` | string | 'hybrid' | 'spatial', 'activity', or 'hybrid' |
| `spatialMapping` | boolean | true | Map Rule 110 X → World X |
| `localityRadius` | number | 5 | Cells checked for local patterns |
| `verticalSpread` | number | 0.3 | Y variation (0=flat, 1=full) |
| `activityInfluence` | number | 0.5 | How much activity affects rate |
| `minSpawnMultiplier` | number | 0.5 | Min rate at 0% activity |
| `maxSpawnMultiplier` | number | 1.5 | Max rate at 100% activity |
| `showOverlay` | boolean | false | Show Rule 110 visualization |
| `overlayOpacity` | number | 0.3 | Overlay transparency (0.1=very faint, 0.5=moderate, 1.0=opaque) |
| `overlayHeight` | number | 40 | Overlay bar height (px) |
| `overlayPosition` | string | 'top' | 'top' or 'bottom' |

## 📈 Monitoring TC Activity

```javascript
// Check Rule 110 activity
const activity = window.rule110Stepper.getState().filter(c => c === 1).length / 128;
console.log(`Rule 110 Activity: ${(activity * 100).toFixed(1)}%`);

// Check last resource spawn location
const lastRes = World.resources[World.resources.length - 1];
console.log('Last spawn:', lastRes.tcData);

// Watch activity over time
let logInterval = setInterval(() => {
  const state = window.rule110Stepper.getState();
  const active = state.filter(c => c === 1).length;
  const activity = active / state.length;
  
  // Find resource positions
  const resPositions = World.resources.map(r => Math.floor((r.x / canvasWidth) * 100));
  
  console.log(`TC Activity: ${(activity * 100).toFixed(1)}% | Active cells: ${active}/128`);
  console.log(`Resource X positions: ${resPositions.join(', ')}%`);
}, 5000);

// Stop logging
clearInterval(logInterval);
```

## 🎯 What This Means

### Philosophically:
- **Environment is Turing-complete** - resources emerge from universal computation
- **Agents evolve computational intuition** - must learn to read algorithmic patterns
- **Simulation becomes meta** - life foraging in a thinking world

### Practically:
- **Spatial awareness** - agents learn that resources cluster predictably
- **Temporal patterns** - agents experience computational "seasons"
- **Emergent complexity** - simple rules (Rule 110) create rich environment

### Scientifically:
- **Reproducible** - same seed = same resource patterns
- **Analyzable** - can correlate agent success with TC patterns
- **Tunable** - control how much TC influences environment

## 🐛 Troubleshooting

**Q: Resources aren't spawning in TC patterns**
```javascript
(async () => {
  // Check if enabled
  const { CONFIG } = await import('./config.js');
  console.log('Enabled:', CONFIG.tcResourceIntegration.enabled);
  
  // Check if stepper exists
  console.log('Stepper:', window.rule110Stepper);
  
  // Re-register stepper if needed
  const { registerRule110Stepper } = await import('./tc/tcRule110.js');
  const { stepper } = registerRule110Stepper({
    width: 128,
    initializer: 'ether',
    stateKey: 'tc.rule110.state',
    bufferKey: 'tc.rule110.next'
  });
  window.rule110Stepper = stepper;
  
  // Enable integration
  CONFIG.tcResourceIntegration.enabled = true;
  
  // Reset world
  World.reset();
  
  console.log('✅ TC-Resource reset complete');
})();
```

**Q: Rule 110 seems frozen/not evolving**
```javascript
(async () => {
  const { CONFIG } = await import('./config.js');
  
  // Check TC is enabled
  console.log('TC enabled:', CONFIG.tc.enabled);
  
  // Check update cadence
  console.log('Update cadence:', CONFIG.tc.updateCadence);  // Should be 1
  
  // Re-enable if needed
  enableTC('rule110');
  
  console.log('⚠️ Reload page for full TC initialization');
  setTimeout(() => location.reload(), 2000);  // Reload in 2 seconds
})();
```

**Q: All resources spawning in same spot**
```javascript
(async () => {
  // Rule 110 might be too sparse - try different initializer
  const { registerRule110Stepper } = await import('./tc/tcRule110.js');
  const { stepper } = registerRule110Stepper({
    width: 128,
    initializer: 'random',
    initializerOptions: { density: 0.5, seed: Math.floor(Math.random() * 1000) }
  });
  window.rule110Stepper = stepper;
  World.reset();
  
  console.log('🎲 Random dense pattern applied');
})();
```

**Q: Want to see what's happening (overlay is too faint)**
```javascript
(async () => {
  const { CONFIG } = await import('./config.js');
  
  // Enable overlay (if not already enabled)
  CONFIG.tcResourceIntegration.showOverlay = true;
  
  // Make it MORE visible - increase opacity
  CONFIG.tcResourceIntegration.overlayOpacity = 0.5;  // or even 0.7 for very visible
  CONFIG.tcResourceIntegration.overlayHeight = 60;
  
  // Add logging to respawn
  if (World.resources.length > 0) {
    const originalRespawn = World.resources[0].respawn;
    World.resources.forEach(r => {
      r.respawn = function() {
        originalRespawn.call(this);
        if (this.tcData) {
          console.log(`🌱 Resource spawned from ${this.tcData.source} at (${Math.floor(this.x)}, ${Math.floor(this.y)})`);
        }
      };
    });
    console.log('✅ Logging enabled for resource spawns');
  }
})();
```

## 🎨 Visual Comparison

### Without TC Integration:
```
Resources: random positions
    🌱      🌱        🌱
 🌱       🌱      🌱     🌱
     🌱       🌱       🌱
```

### With TC Spatial Mode:
```
Resources: follow Rule 110 pattern
Rule110:  █ █ ██  ███ █  ██
Resources: 🌱🌱 🌱🌱  🌱🌱🌱 🌱  🌱🌱
(vertical alignment based on local activity)
```

### With TC Activity Mode:
```
High activity (60%):  many resources everywhere
     🌱 🌱 🌱 🌱 🌱 🌱 🌱
Low activity (15%):   few resources
          🌱        🌱
```

## 🚀 Next Level

Once you have TC-Resource working, try:

1. **Combine with Plant Ecology** - TC + fertility creates dual influence
2. **Add to observations** - let agents sense Rule 110 state
3. **Training experiments** - do agents learn faster with TC patterns?
4. **Custom initializers** - design specific computational environments
5. **Glider tracking** - make resources follow moving structures

See `../architecture/TC_RESOURCE_INTEGRATION.md` for advanced implementation details!

