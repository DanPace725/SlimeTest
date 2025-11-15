<!-- ormd:0.1 -->
---
title: "Policy Batch Analyzer Guide"
authors: ["Emergence Engine Team"]
dates:
  created: '2025-11-11T05:40:38.729223Z'
links: []
status: "complete"
description: "Emergence Engine documentation"
---

# 📊 Policy Batch Analyzer Guide

## What It Does

The Batch Analyzer extends the single-policy analyzer to:
- ✅ **Compare 3-100 policies** at once
- ✅ **Track learning progress** over generations
- ✅ **Export to CSV** for Excel/spreadsheet analysis
- ✅ **Export to JSON** for programmatic processing
- ✅ **Export to HTML** for beautiful visual reports
- ✅ **Identify trends** (improving/declining/stuck)
- ✅ **Highlight anomalies** and convergence issues

---

## Installation

No dependencies needed! Just Node.js.

---

## Basic Usage

### 1. Compare Multiple Policies

```bash
node policyBatchAnalyzer.js policy1.json policy2.json policy3.json
```

**Output:**
```
================================================================================
📊 BATCH POLICY ANALYSIS SUMMARY
================================================================================

Policies analyzed: 3
Generation range: 6 - 20
Best reward: 22.18
Worst reward: -24.47
Average resource-seeking score: 0.049

--------------------------------------------------------------------------------
Gen | Filename                      | Reward  | ResScore | Collapsed | Status   
--------------------------------------------------------------------------------
  6 | slime-policy-gen6.json       |   11.38 |    0.073 |     25.0% | ✗ Weak    
  8 | slime-policy-gen8.json       |  -24.47 |    0.056 |     25.0% | ✗ Weak    
 20 | slime-policy-gen20.json      |   22.18 |    0.017 |     64.6% | ✗ Weak    

--------------------------------------------------------------------------------
TRENDS:
  Reward:   11.38 → 22.18 (+10.80)
  Resource: 0.073 → 0.017 (-0.056)
  Sigma:    0.0295 → 0.0109
```

### 2. Export to CSV (Excel/Spreadsheet)

```bash
node policyBatchAnalyzer.js gen*.json --format csv
```

Creates `policy-comparison.csv` with:
- All performance metrics
- All key weights
- Resource-seeking scores
- Convergence stats

**Perfect for:**
- Plotting graphs in Excel
- Statistical analysis
- Sharing with collaborators
- Importing into Python/R

### 3. Export to HTML (Visual Report)

```bash
node policyBatchAnalyzer.js gen*.json --format html
```

Creates `policy-comparison.html` with:
- 📊 **Color-coded tables**
- 📈 **Bar chart visualizations**
- 🎯 **Automatic insights**
- 💡 **Trend analysis**
- 🎨 **Beautiful dark theme**

**Open in browser for interactive viewing!**

### 4. Export to JSON (Programmatic)

```bash
node policyBatchAnalyzer.js gen*.json --format json
```

Creates `policy-comparison.json` with:
- Full policy data
- Analyzed metrics
- Summary statistics
- Ready for custom processing

### 5. Custom Output Filename

```bash
node policyBatchAnalyzer.js gen*.json --format html --output my-report.html
```

---

## Advanced Usage

### Analyze Training Timeline

Save policies every 10 generations, then:

```bash
node policyBatchAnalyzer.js \
  slime-policy-gen10.json \
  slime-policy-gen20.json \
  slime-policy-gen30.json \
  slime-policy-gen40.json \
  slime-policy-gen50.json \
  --format html --output training-timeline.html
```

**See learning progression visually!**

### Compare Different Training Runs

```bash
node policyBatchAnalyzer.js \
  run1-gen50.json \
  run2-highReward-gen50.json \
  run3-lowPenalty-gen50.json \
  --format csv --output experiment-comparison.csv
```

**Identify which hyperparameters work best!**

### Export All Formats at Once

```bash
# CSV for analysis
node policyBatchAnalyzer.js gen*.json --format csv --output results.csv

# HTML for viewing
node policyBatchAnalyzer.js gen*.json --format html --output results.html

# JSON for backup
node policyBatchAnalyzer.js gen*.json --format json --output results.json
```

---

## CSV Format

### Columns Included

```csv
Filename, Generation, BestReward, MeanReward, EliteMean,
AvgSigma, MinSigma, MaxSigma, CollapsedPct, ResourceScore,
Turn_resDx, Turn_resDy, Turn_resVis,
Thrust_resDx, Thrust_resDy, Thrust_resVis,
Sense_resVis,
Turn_wallMag, Thrust_wallMag, Turn_chi, Thrust_chi
```

### What Each Column Means

| Column | Description | Good Value |
|--------|-------------|------------|
| `BestReward` | Best episode reward | > 20 |
| `MeanReward` | Population average | Improving trend |
| `EliteMean` | Top 5 policies average | Close to best |
| `AvgSigma` | Exploration level | 0.02-0.05 |
| `CollapsedPct` | Converged weights % | < 60% |
| `ResourceScore` | Overall resource-seeking | > 0.3 |
| `Turn_resDx` | Turn response to X direction | > 0.2 |
| `Thrust_resVis` | Thrust when resource visible | > 0.2 |
| `Turn_wallMag` | Wall avoidance (turn) | > 0.2 magnitude |
| `Thrust_wallMag` | Wall avoidance (thrust) | Positive |

### Example Excel Analysis

1. Open `policy-comparison.csv` in Excel
2. Select columns `Generation` and `BestReward`
3. Insert → Chart → Line Chart
4. **See learning curve!**

Repeat for:
- `Generation` vs `ResourceScore`
- `Generation` vs `AvgSigma`
- `Generation` vs `CollapsedPct`

---

## HTML Report Features

### 📊 Summary Statistics Box
Quick overview:
- Number of policies
- Generation range
- Best reward achieved
- Average resource score

### 📈 Performance Table
Color-coded for quick scanning:
- 🟢 **Green** = Good performance
- 🟡 **Yellow** = Moderate/warning
- 🔴 **Red** = Poor performance

### 🎯 Resource-Seeking Analysis
Detailed breakdown of weights:
- Turn response to resource direction
- Thrust response to resource visibility
- Overall seeking score

### 📉 Visual Charts
Interactive bar charts showing:
- Best reward progression
- Resource-seeking score over time

### 💡 Automatic Insights
The report generates insights like:
- "Performance improving ↑ (+94.9%)"
- "⚠ Highly converged - may be stuck"
- "Best performing policy: Gen 20"

### 🎨 Dark Theme UI
Easy on the eyes for long analysis sessions!

---

## JSON Format

### Structure

```json
{
  "timestamp": "2025-11-04T12:34:56.789Z",
  "numPolicies": 3,
  "summary": {
    "generations": [6, 8, 20],
    "bestRewards": [11.38, -24.47, 22.18],
    "resourceScores": [0.073, 0.056, 0.017],
    "avgSigmas": [0.0295, 0.0370, 0.0109]
  },
  "policies": [
    {
      "filename": "slime-policy-gen6.json",
      "generation": 6,
      "bestReward": 11.38,
      "resourceScore": 0.073,
      "resourceWeights": {...},
      "survivalWeights": {...}
    },
    ...
  ],
  "fullPolicies": [...]  // Complete policy data
}
```

### Use Cases

**Python Analysis:**
```python
import json
import matplotlib.pyplot as plt

with open('policy-comparison.json') as f:
    data = json.load(f)

plt.plot(data['summary']['generations'], 
         data['summary']['bestRewards'])
plt.xlabel('Generation')
plt.ylabel('Best Reward')
plt.show()
```

**JavaScript Processing:**
```javascript
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('policy-comparison.json'));

// Find best policy
const best = data.policies.reduce((a, b) => 
  a.bestReward > b.bestReward ? a : b
);
console.log(`Best: Gen ${best.generation}`);
```

---

## Interpreting Results

### Terminal Output

#### Summary Section
```
Policies analyzed: 3
Generation range: 6 - 20
Best reward: 22.18
```

**What it tells you:**
- How many policies compared
- Training timespan covered
- Peak performance achieved

#### Table Section
```
Gen | Filename         | Reward  | ResScore | Collapsed | Status
  6 | gen6.json       |   11.38 |    0.073 |     25.0% | ✗ Weak
 20 | gen20.json      |   22.18 |    0.017 |     64.6% | ✗ Weak
```

**Red flags:**
- ✗ Weak status = policy ignores resources
- High collapsed % = stuck in local optimum
- Negative rewards = dying quickly
- Decreasing resource score = learning wrong thing

#### Trends Section
```
TRENDS:
  Reward:   11.38 → 22.18 (+10.80)   ← Good! Improving
  Resource: 0.073 → 0.017 (-0.056)   ← Bad! Getting worse at seeking
  Sigma:    0.0295 → 0.0109          ← Warning! Converging rapidly
```

**What to do:**
- If reward up but resource score down → learning survival, not goals
- If sigma dropping fast → increase mutation noise
- If both declining → restart with better rewards

---

## Workflow Examples

### 1. Track Training Progress

**Goal:** See if training is working

```bash
# During training, save every 10 generations
# Then analyze:
node policyBatchAnalyzer.js \
  slime-policy-gen10.json \
  slime-policy-gen20.json \
  slime-policy-gen30.json \
  slime-policy-gen40.json \
  slime-policy-gen50.json
```

**Look for:**
- ✅ Increasing best reward
- ✅ Increasing resource score
- ✅ Sigma staying above 0.02
- ✅ Collapsed % staying below 70%

### 2. Compare Hyperparameter Experiments

**Goal:** Find best reward settings

```bash
# Three training runs with different configs
node policyBatchAnalyzer.js \
  default-gen50.json \
  highResourceReward-gen50.json \
  lowChiPenalty-gen50.json \
  --format csv --output experiments.csv
```

**Open in Excel, compare:**
- Which has highest best reward?
- Which has highest resource score?
- Which converged healthily?

### 3. Diagnose Stuck Training

**Goal:** Understand why Gen 50 isn't better than Gen 20

```bash
node policyBatchAnalyzer.js gen10.json gen20.json gen30.json gen50.json --format html
```

**Open HTML report, check:**
- When did convergence happen? (collapsed % spike)
- When did resource score peak? (might have regressed)
- Are weights actually changing? (compare tables)

### 4. Present Results

**Goal:** Share findings with team/advisor

```bash
node policyBatchAnalyzer.js gen*.json --format html --output final-results.html
```

**Open in browser, screenshot:**
- Summary statistics
- Learning curves
- Key insights section

---

## Tips & Best Practices

### 1. Name Files Systematically

```
✅ Good:
  slime-policy-gen10.json
  slime-policy-gen20.json
  slime-policy-gen30.json

❌ Bad:
  policy1.json
  policy_backup.json
  final_FINAL_v2.json
```

Systematic names sort correctly!

### 2. Save Regularly

During long training runs:
```javascript
// In app.js, after each generation:
if (generation % 10 === 0) {
  // Click "Save Best Policy"
  // Or implement auto-save
}
```

You can't analyze what you didn't save!

### 3. Keep a Log

Create `training-log.txt`:
```
Gen 10: Default settings
Gen 20: Increased collectResource to 20.0
Gen 30: Increased mutation to 0.15
Gen 40: Reset and started fresh
```

Helps interpret results later!

### 4. Export All Formats

For important milestones:
```bash
# Complete analysis package
node policyBatchAnalyzer.js gen*.json --format csv --output milestone1.csv
node policyBatchAnalyzer.js gen*.json --format html --output milestone1.html
node policyBatchAnalyzer.js gen*.json --format json --output milestone1.json
```

### 5. Version Control Policies

```bash
git add slime-policy-gen50.json
git commit -m "Gen 50: First policy with positive resource score"
```

Track successful policies in git!

---

## Common Analysis Patterns

### Pattern 1: "Is it learning?"

```bash
node policyBatchAnalyzer.js gen10.json gen20.json gen30.json
```

Check trends section:
- Reward should increase
- Resource score should increase (eventually)
- If both flat → adjust hyperparameters

### Pattern 2: "Why did it get worse?"

```bash
node policyBatchAnalyzer.js gen40.json gen50.json gen60.json
```

Look at:
- Did collapsed % spike? (premature convergence)
- Did sigma drop below 0.01? (stopped exploring)
- Compare weight tables (what changed?)

### Pattern 3: "Which experiment won?"

```bash
node policyBatchAnalyzer.js \
  expA-gen50.json \
  expB-gen50.json \
  expC-gen50.json \
  --format csv
```

Sort CSV by:
1. BestReward (descending)
2. ResourceScore (descending)
3. CollapsedPct (ascending)

### Pattern 4: "When did learning plateau?"

```bash
node policyBatchAnalyzer.js gen*.json --format html
```

Look at bar charts:
- Where does reward flatline?
- When does resource score stop improving?
- That's your plateau point

---

## Troubleshooting

### "No valid policies loaded"

**Problem:** File paths wrong or files don't exist

**Fix:**
```bash
# Check files exist
ls slime-policy-*.json

# Use full paths if needed
node policyBatchAnalyzer.js ./policies/gen10.json
```

### "Glob patterns don't work"

**Problem:** Shell not expanding `*.json`

**Fix (PowerShell):**
```powershell
$files = Get-ChildItem slime-policy-*.json
node policyBatchAnalyzer.js $files --format csv
```

**Fix (Bash/Linux):**
```bash
node policyBatchAnalyzer.js slime-policy-*.json --format csv
```

### "HTML not displaying correctly"

**Problem:** Missing features in old browsers

**Fix:** Use modern browser:
- Chrome/Edge (Chromium)
- Firefox
- Safari

### "CSV has weird characters"

**Problem:** UTF-8 encoding issue

**Fix in Excel:**
1. Data → From Text/CSV
2. File Origin → 65001: Unicode (UTF-8)
3. Import

---

## Output Files Location

All exports save to **current directory** by default:
- `policy-comparison.csv`
- `policy-comparison.json`
- `policy-comparison.html`

Override with `--output`:
```bash
node policyBatchAnalyzer.js gen*.json --format html --output reports/final.html
```

---

## Integration with Other Tools

### Excel / Google Sheets

1. Open CSV in Excel
2. Create pivot tables
3. Generate charts
4. Statistical analysis

### Python

```python
import pandas as pd

df = pd.read_csv('policy-comparison.csv')
df.plot(x='Generation', y='BestReward')
```

### R

```r
data <- read.csv('policy-comparison.csv')
plot(data$Generation, data$BestReward)
```

### Jupyter Notebook

```python
import json
import matplotlib.pyplot as plt

with open('policy-comparison.json') as f:
    data = json.load(f)

plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
plt.plot(data['summary']['generations'], 
         data['summary']['bestRewards'])
plt.title('Best Reward')

plt.subplot(1, 2, 2)
plt.plot(data['summary']['generations'],
         data['summary']['resourceScores'])
plt.title('Resource-Seeking Score')
plt.show()
```

---

## Summary

The Batch Analyzer lets you:
1. ✅ **Compare multiple policies** at once
2. ✅ **Track learning progress** over time
3. ✅ **Export for analysis** (CSV/JSON/HTML)
4. ✅ **Spot trends** automatically
5. ✅ **Share results** beautifully

**Quick commands to remember:**
```bash
# Terminal summary
node policyBatchAnalyzer.js gen*.json

# Excel analysis
node policyBatchAnalyzer.js gen*.json --format csv

# Visual report
node policyBatchAnalyzer.js gen*.json --format html

# Programmatic
node policyBatchAnalyzer.js gen*.json --format json
```

Now you can analyze training runs systematically! 📊🚀

