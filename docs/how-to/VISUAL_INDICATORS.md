<!-- ormd:0.1 -->
---
title: "Visual Indicators Guide"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.734122Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 👁️ Visual Indicators Guide

## Overview

The simulation now has clear visual feedback showing when agents are using learned policies vs heuristic AI.

---

## 🎨 Agent Visual Indicators

### 1. **Yellow Pulsing Border**
When you see a **glowing yellow rectangle** around an agent:
- ✅ Agent is using a **controller** (learned policy or wrapped heuristic)
- ✅ Actions are being generated via `controller.act()`
- ✅ `useController = true` and `controller != null`

**What it looks like:**
```
┌─────────┐
│  Agent  │  ← Yellow pulsing border (opacity animates)
└─────────┘
```

### 2. **"POLICY" Label**
Yellow text **above** the agent:
- Shows when using a **LinearPolicyController** (learned weights)
- This is what you'll see during training or when testing learned policies

### 3. **"CTRL" Label**
Yellow text **above** the agent:
- Shows when using other controller types (e.g., HeuristicController wrapper)
- Less common in practice

### 4. **No Yellow Border/Label**
When there's **no yellow indicator**:
- Agent is using original **heuristic AI**
- Traditional behavior (frustration, trail-following, etc.)
- This is the default in Play mode

---

## 📊 HUD Indicators

### Agent Status Line

Each agent's line in the HUD now shows controller status:

```
Agent1: χ=12.5 ALIVE sense:220px | 🤖 POLICY | credits: 2.34
                                    ^^^^^^^^^^^
                                    Controller indicator
```

#### Possible Values:

- **🧠 HEURISTIC** - Using original hand-coded AI
- **🤖 POLICY** - Using learned LinearPolicyController  
- **🎮 CTRL** - Using other controller type

### Mode Display

Bottom line of HUD shows overall mode:

```
AUTO | PLAY | collected: 5 | tick: 1234 | diffusion: ON
       ^^^^
       Learning mode
```

- **PLAY** - Play mode (default, heuristic AI unless manually set)
- **TRAINING** - Training mode (agents will use policies during training)

---

## 🔍 Debug Mode: Action Values

Want to see the actual action values? Enable debug mode!

### How to Enable

In `config.js`, change:
```javascript
hud: { 
  show: true,
  showActions: true  // ← Set to true
},
```

### What You'll See

Small yellow text **below** agents showing:
```
T:0.35 P:0.82 S:0.15
```

Where:
- **T** = Turn (steering): -1 to 1
- **P** = Thrust (speed): 0 to 1  
- **S** = SenseFrac (sensing): 0 to 1

**Example interpretations:**
- `T:0.35` - Turning slightly right
- `T:-0.75` - Turning hard left
- `P:1.00` - Full thrust forward
- `P:0.20` - Slow/cautious movement
- `S:0.95` - Extended sensing active
- `S:0.05` - Minimal sensing

---

## 🎯 Quick Verification Tests

### Test 1: Default State (No Policy)
1. Open simulation
2. **Expected**: No yellow borders, HUD shows "🧠 HEURISTIC"
3. ✅ Confirms heuristic AI is active

### Test 2: Load a Policy
1. Press `[L]` to open training panel
2. Click "📂 Load Policy" and select a saved policy JSON
3. Click "🎮 Test Best Policy"
4. **Expected**: Agent 1 gets yellow border, label "POLICY", HUD shows "🤖 POLICY"
5. ✅ Confirms learned policy is active

### Test 3: Switch Modes
1. Open training panel `[L]`
2. Toggle between "Play Mode" and "Training Mode"
3. Watch HUD: should show "PLAY" or "TRAINING"
4. ✅ Confirms mode switching works

### Test 4: During Training
1. Start training (5 generations)
2. **During training**: Visualization pauses
3. **After training**: Click "🎮 Test Best Policy"
4. **Expected**: Agent 1 gets yellow border immediately
5. ✅ Confirms policy is applied

---

## 🐛 Troubleshooting

### "Yellow border appears but agent doesn't move"
- Check console for errors
- Policy might be outputting zero thrust
- Try training longer or resetting learner

### "No yellow border but training completed"
- Click "🎮 Test Best Policy" button
- Training doesn't auto-apply policies to Play mode
- Must explicitly test or switch to Training mode

### "Yellow border flickers"
- Normal! It pulses to be visible
- If it appears/disappears rapidly, check `useController` flag

### "HUD shows POLICY but no yellow border"
- Check that agent is alive
- Dead agents don't show controller indicators
- Press `[C]` to give agents +5χ

### "Action values don't update"
- Ensure `CONFIG.hud.showActions = true`
- Refresh page after config change
- Values only show when controller is active

---

## 🎨 Color Coding Summary

| Color | Meaning |
|-------|---------|
| **Yellow border** | Controller active |
| **Yellow text (POLICY/CTRL)** | Controller type label |
| **Yellow action values** | Debug: turn/thrust/sense |
| **Cyan** | Agent 1 |
| **Magenta** | Agent 2 |
| **Green** | Sensing ring (extended sensing) |
| **Red pulse** | High frustration |
| **Green trails** | Pheromone/residual χ |

---

## 📸 Example Scenarios

### Scenario A: Normal Play (No Policy)
```
┌─────┐              ┌─────┐
│  A1 │              │  A2 │
└─────┘              └─────┘
Cyan agent          Magenta agent

HUD: Agent1: ... | 🧠 HEURISTIC | ...
HUD: Agent2: ... | 🧠 HEURISTIC | ...
```

### Scenario B: Testing Learned Policy
```
  POLICY
┏━━━━━━━┓           ┌─────┐
┃   A1  ┃           │  A2 │
┗━━━━━━━┛           └─────┘
Yellow border       Normal
Pulsing

HUD: Agent1: ... | 🤖 POLICY | ...
HUD: Agent2: ... | 🧠 HEURISTIC | ...
```

### Scenario C: Debug Mode Active
```
  POLICY
┏━━━━━━━┓
┃   A1  ┃
┗━━━━━━━┛
T:0.45 P:0.89 S:0.12
(action values below)

Turn right 45%
Thrust 89%
Sensing 12%
```

---

## 🔧 Developer Notes

### How It Works

#### Visual Border
```javascript
// In Bundle.draw()
if (this.useController && this.controller && this.alive) {
  // Draw yellow pulsing border
}
```

#### Controller Type Detection
```javascript
const label = this.controller.constructor.name === "LinearPolicyController" 
  ? "POLICY" : "CTRL";
```

#### Action Storage
```javascript
// In Bundle.update()
if (this.useController && this.controller) {
  const action = this.controller.act(obs);
  this.lastAction = action; // Stored here
  this.applyAction(action, dt);
}
```

### Extending the System

Want to add more indicators?

**Example: Show observation vector**
```javascript
// In Bundle.draw()
if (this.lastObs && CONFIG.hud.showObs) {
  ctx.fillText(`χ:${this.lastObs.chi.toFixed(2)}`, this.x, this.y + 20);
}
```

**Example: Different color per policy type**
```javascript
const borderColor = this.controller.generation > 50 ? "#00ff00" : "#ffff00";
```

---

## ✅ Verification Checklist

Use this to confirm indicators are working:

- [ ] Load page → no yellow borders (heuristic mode)
- [ ] Press `[L]` → training panel appears
- [ ] HUD shows "🧠 HEURISTIC" for both agents
- [ ] Switch to "Training Mode" → HUD shows "TRAINING"
- [ ] Run 3 generations → training completes
- [ ] Click "🎮 Test Best Policy" → Agent 1 gets yellow border
- [ ] HUD shows "🤖 POLICY" for Agent 1
- [ ] Label "POLICY" appears above Agent 1
- [ ] Agent 1 moves under policy control
- [ ] Enable `showActions` in config → action values appear
- [ ] Press `[R]` to reset → yellow border clears (back to heuristic)

If all checked ✅ → Visual indicators working perfectly!

---

## 🎓 Summary

You now have **three layers of feedback**:

1. **Visual (on agent)**: Yellow border + label
2. **HUD (status)**: Controller type per agent + mode
3. **Debug (optional)**: Real-time action values

This makes it immediately obvious:
- ✅ Which agents are using policies
- ✅ What type of controller is active
- ✅ Whether training/play mode is enabled
- ✅ (Debug) What actions are being taken

**No more guessing if policies are working!** 🎉

