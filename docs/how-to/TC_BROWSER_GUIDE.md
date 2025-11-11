# TC (Turing Complete) Features in Browser

The Essence Engine simulation includes **Turing Complete** computational features that can run alongside your simulation! This guide explains what works in the browser and how to use it.

## What is TC?

The TC system provides:
- **Rule 110**: A Turing-complete cellular automaton that runs in parallel with your simulation
- **Turing Machines**: Full Turing machine implementations (tape-based universal computation)
- **Deterministic Seeding**: Reproducible random number generation for experiments
- **Snapshot Capture**: Record computational state for analysis

## Browser Compatibility ✅

**Good News**: Almost everything works in the browser!

### ✅ Works in Browser:
- `TcStorage.js` - Core scheduler and storage
- `tc/tcRule110.js` - Rule 110 cellular automaton
- `tc/tcTape.js` - Turing machine tape system
- `tc/tcInitializers.js` - Initialization functions
- All integration hooks in main simulation

### ❌ Node.js Only:
- `tc/rule110Headless.js` - CLI tool for batch processing and file export
- File-based machine loading (can use inline definitions instead)

## Quick Start

### Method 0: Config Panel (UI-first)

Press **O** in the browser build to open the config panel. Expand the **TC** group and you’ll find sliders for the master settings we now expose:

- Toggle **Enable TC runtime** to wire up the deterministic scheduler.
- Tweak **TC update cadence** if you want Rule 110 to advance less frequently than every tick.
- Use the new **Rule 110** controls (width, initializer, phase, random seed/density) to seed the automaton without touching code.
- Flip **Show TC overlay** on to surface the live `tc.rule110.snapshot` feed in the HUD. Opacity, size, and corner placement are configurable.

Save/load profiles from that same panel; the schema now round-trips every `tc.*` field that appears in the UI, so presets such as `profiles/universality/casual_universality_flex.json` import/export cleanly.

### Method 1: Browser Console

Open your browser console and type:

```javascript
// Enable Rule 110
enableTC('rule110')

// Or with custom options
enableTC('rule110', { 
  seed: 42, 
  updateCadence: 1,  // Run every tick
  captureSnapshots: true 
})

// Disable TC
disableTC()
```

Then **reload the page** to apply the settings.

### Method 2: Edit config.js

In `src/runtime/config.js`, change the TC section:

```javascript
tc: {
  enabled: true,           // Enable TC
  seed: 0,                 // Random seed for determinism
  updateCadence: 1,        // Run every tick (or null for default)
  mode: 'rule110',         // 'rule110' or 'tape'
  rule110: {               // Browser UI writes these automatically now
    width: 128,
    initializer: 'ether',
    phase: 0,
    randomSeed: 0,
    randomDensity: 0.5,
    snapshotKey: 'tc.rule110.snapshot'
  },
  snapshots: {
    rule110: {
      capture: true,       // Capture Rule 110 snapshots
      schema: 'schemas/tc_rule110_snapshot.schema.json'
    }
  }
}
```

### Method 3: Load a Profile

There's a pre-configured profile at:
```
profiles/universality/casual_universality_flex.json
```

This enables Rule 110 with optimized settings for demonstration.

## Using Turing Machines in Browser

Turing machines need their definitions embedded (not loaded from files). In `config.js`:

```javascript
tc: {
  enabled: true,
  mode: 'tape',
  machines: {
    unaryIncrementer: {
      // Instead of file path, use inline definition:
      table: {
        id: "unaryIncrementer",
        description: "Increments a unary number",
        alphabet: ["_", "1"],
        blank: "_",
        initialState: "scan",
        haltStates: ["halt"],
        states: {
          scan: {
            "1": { write: "1", move: "R", next: "scan" },
            "_": { write: "1", move: "N", next: "halt", halt: true }
          },
          halt: {}
        }
      }
    }
  }
}
```

## What Happens When TC is Enabled?

When you enable TC features:

1. **Rule 110 Mode**: A cellular automaton runs in parallel with your simulation
   - Provides Turing-complete computation
   - Uses deterministic seeding for reproducibility
   - Can capture snapshots for analysis
   
2. **Tape Mode**: Turing machines can execute
   - Register machines using `TapeMachineRegistry`
   - Machines can be triggered by simulation events
   - Full tape-based computation available

3. **Deterministic Random**: `TcRandom` provides seeded RNG
   - All random operations become reproducible
   - Useful for training consistency and debugging
   - Can be isolated per-phase (capture, compute, commit)

## Integration with Controllers

Controllers can hook into TC phases:

```javascript
controller.registerTcHooks({
  capture: (ctx) => {
    // Called during snapshot capture phase
  },
  compute: (ctx) => {
    // Called during computation phase  
  },
  commit: (ctx) => {
    // Called during state commit phase
  }
});
```

## Performance Considerations

- **updateCadence: 1** = Run every tick (most responsive, higher CPU)
- **updateCadence: null** = Default cadence (balanced)
- **updateCadence: 10** = Run every 10 ticks (lower CPU, less frequent updates)

Rule 110 and Turing machines add minimal overhead when properly configured.

## Snapshot Capture

When `capture: true`, the TC system records computational state:

```javascript
tc: {
  snapshots: {
    rule110: {
      capture: true,  // Captures Rule 110 state
      schema: 'schemas/tc_rule110_snapshot.schema.json'
    }
  }
}
```

Snapshots are stored in `TcStorage` and can be accessed programmatically:

```javascript
const snapshot = TcStorage.get('tc.rule110.state');
```

## Monitoring & Overlays

There are two ways to see the computation evolve while the world runs:

- **TC Overlay HUD** – Toggle `tc.overlay.enabled` (or the “Show TC overlay” checkbox in the panel) to pin a manifest feed to the canvas. Width, opacity, and history length are configurable in the same group.
- **Rule 110 bar overlay** – Set `CONFIG.tcResourceIntegration.showOverlay = true` (or flip the “TC resource overlay” toggle in the resource integration block) to render a band of live cells plus the active-cell meter that `tcResourceBridge` exposes. This overlay draws directly from `window.rule110Stepper`, which is now registered automatically whenever `tc.mode === 'rule110'`.

## Advanced: Custom Turing Machines

You can define custom Turing machines for your experiments:

```javascript
import { TapeMachineRegistry } from './tc/tcTape.js';

// Define your machine
const myMachine = {
  id: "myCustomMachine",
  alphabet: ["0", "1", "_"],
  blank: "_",
  initialState: "start",
  haltStates: ["halt"],
  states: {
    start: {
      "0": { write: "1", move: "R", next: "start" },
      "1": { write: "0", move: "R", next: "start" },
      "_": { write: "_", move: "N", next: "halt", halt: true }
    },
    halt: {}
  }
};

// Register it
TapeMachineRegistry.register(myMachine);
```

## Debugging TC Features

Check if TC is active:

```javascript
console.log(CONFIG.tc);  // View current TC configuration
TcScheduler.getConfig();  // Get runtime TC config
TcStorage.getStats();     // Get storage statistics
```

## Example: Casual Universality Flex

This profile demonstrates Turing-complete computation running alongside essence agents:

1. Open the config panel (**O**) and load `profiles/universality/casual_universality_flex.json`.
2. The preset turns on TC, locks `tc.rule110` to an ether initializer, enables the TC overlay, and keeps schemas pointed at `tc.rule110.snapshot`.
3. Watch the HUD panel or the resource overlay to confirm the automaton is ticking in sync with the organism world.
4. Agents learn in this Turing-complete environment

The simulation is now **provably universal** - it can compute anything computable!

## Troubleshooting

**Q: I enabled TC but nothing changed**
- Make sure to reload the page after changing settings
- Check browser console for any errors
- Verify `CONFIG.tc.enabled === true`

**Q: File loading errors for machines**
- In browser, use inline definitions instead of file paths
- Uncomment the inline table definition in `config.js`

**Q: How do I see TC activity?**
- Rule 110 runs silently in background
- Use `TcStorage.getStats()` to see activity
- Enable snapshot capture to record state

## References

- [Casual Universality Flex Profile](../profiles/universality/casual_universality_flex.json)
- [TC Performance Notes](../../tc/docs/tc_performance.md)
- [TC Channel Design](../../tc/docs/tc_channel_design.md)
- [Rule 110 Wikipedia](https://en.wikipedia.org/wiki/Rule_110)

