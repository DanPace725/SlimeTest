<!-- ormd:0.1 -->
---
title: "Quick Test Checklist"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.732601Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 🧪 Quick Test Checklist

## Prerequisites
Start a local web server (ES6 modules require HTTP):

```bash
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx http-server

# Option 3: VS Code
# Use "Live Server" extension (right-click index.html)
```

Then navigate to: `http://localhost:8000`

---

## ✅ Test Checklist

### 1. Basic Functionality (30 seconds)
- [ ] Page loads without errors (check console F12)
- [ ] Two agents visible (cyan and magenta squares)
- [ ] Green resource sphere visible
- [ ] Agents move automatically
- [ ] HUD shows χ values updating
- [ ] Green trails appear behind agents

**Expected**: Original simulation works perfectly

---

### 2. Original Controls (1 minute)
- [ ] Press `[Space]` → Simulation pauses/unpauses
- [ ] Press `[A]` → Auto mode toggles
- [ ] Press `[R]` → World resets
- [ ] Press `[T]` → Trails toggle on/off
- [ ] Press `[X]` → Trails clear
- [ ] Press `[S]` → Extended sensing toggles
- [ ] Press `[C]` → Agents gain +5χ
- [ ] `[WASD]` controls agent 1 in manual mode

**Expected**: All controls work as before

---

### 3. Training Panel (30 seconds)
- [ ] Press `[L]` → Training panel appears (top-right)
- [ ] Panel shows "🧠 Training Control" header
- [ ] Two mode options: "Play Mode" and "Training Mode"
- [ ] "Play Mode" is selected by default
- [ ] Buttons visible: Start Training, Stop, Reset Learner
- [ ] Statistics section shows: Generation, Policy, Rewards, Status
- [ ] Learning curve chart visible (empty)
- [ ] Policy management buttons visible

**Expected**: UI appears and looks professional

---

### 4. Quick Training Test (2-3 minutes)
- [ ] Select "Training Mode" radio button
- [ ] Set generations to `3`
- [ ] Click "▶️ Start Training"
- [ ] Watch status update: "Training..."
- [ ] See generation counter increment: "Gen 1/3", "Gen 2/3", "Gen 3/3"
- [ ] Learning curve appears (green and orange lines)
- [ ] Best/Mean rewards update in real-time
- [ ] Console shows progress logs
- [ ] Training completes: "Training Complete!"
- [ ] Rewards are NOT all zero or NaN

**Expected**: Training runs without errors, rewards change

---

### 5. Policy Test (30 seconds)
- [ ] After training, click "🎮 Test Best Policy"
- [ ] Agent 1 switches to learned policy
- [ ] Agent moves (behavior may differ from heuristic)
- [ ] Agent can still collect resources
- [ ] χ still depletes normally

**Expected**: Learned policy controls agent

---

### 6. Save/Load (1 minute)
- [ ] Click "💾 Save Best Policy"
- [ ] JSON file downloads (`slime-policy-gen3.json`)
- [ ] Click "🔄 Reset Learner"
- [ ] Stats reset to zero
- [ ] Learning curve clears
- [ ] Click "📂 Load Policy"
- [ ] Select saved JSON file
- [ ] Stats restore (Generation 3, best reward shown)
- [ ] Learning curve reappears

**Expected**: Policy persists across sessions

---

## 🐛 Troubleshooting

### Panel doesn't appear
- Check console for errors
- Verify ES6 modules loading (must use HTTP server, not `file://`)
- Try `Ctrl+F5` to hard refresh

### Training seems stuck
- Check console for error messages
- Each generation takes 30s-2min (population × episode length)
- Visual simulation pauses during training (normal)

### Rewards are all negative
- Normal if agents die quickly at first
- Should improve over generations
- Check learning curve trends upward

### Browser freezes
- Training is CPU intensive
- Reduce generations or episode length in config
- Try smaller population size

### Action not applied error
- Make sure you're using the fixed `app.js`
- Clear browser cache and reload

---

## 🎯 Success Criteria

✅ **All tests pass** → System is working correctly!

🟡 **Some tests fail** → Note which ones, check console errors

❌ **Most tests fail** → Likely file not saved or server issue

---

## 📊 Expected Training Behavior

### First Generation
- Policies are random
- Rewards likely negative (agents die quickly)
- Mean reward: -50 to -20
- Best reward: -30 to -10

### After 10 Generations
- Policies improving
- Agents survive longer
- Mean reward: -10 to +5
- Best reward: 0 to +20

### After 50+ Generations
- Policies converged
- Agents consistently collect resources
- Mean reward: +10 to +30
- Best reward: +30 to +50

**Your mileage may vary** based on reward function tuning!

---

## 🚀 If Everything Works

Congratulations! Your learning system is functional. Try:

1. **Tune Rewards**: Modify `CONFIG.learning.rewards` in `config.js`
2. **Longer Training**: 50-100 generations
3. **Compare**: Save heuristic baseline, train policy, compare performance
4. **Experiment**: Different episode lengths, population sizes
5. **Research**: What behaviors emerge? Document findings!

---

## 📝 Report Issues

If tests fail, note:
1. Which test failed
2. Error messages in console (F12)
3. Expected vs actual behavior
4. Browser and OS version

Share this info for debugging help!

