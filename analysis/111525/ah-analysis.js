import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load all three AH JSON files
const files = [
  'adaptive-heuristics-1763250931030.json',
  'adaptive-heuristics-1763251230762.json',
  'adaptive-heuristics-1763251703959.json'
];

const data = files.map(file => {
  const content = fs.readFileSync(path.join(__dirname, file), 'utf8');
  return JSON.parse(content);
});

console.log('=== Adaptive Heuristics Analysis ===\n');

// 1. Compare baseline rewards
console.log('1. BASELINE REWARD EVOLUTION:');
data.forEach((d, i) => {
  const timestamp = new Date(parseInt(files[i].split('-')[2].split('.')[0]));
  console.log(`Snapshot ${i+1} (${timestamp.toLocaleTimeString()}): ${d.baselineReward.toFixed(4)}`);
});
console.log();

// 2. Analyze reward history statistics
console.log('2. REWARD HISTORY STATISTICS:');
data.forEach((d, i) => {
  const rewards = d.rewardHistory;
  const avg = rewards.reduce((a,b) => a+b, 0) / rewards.length;
  const min = Math.min(...rewards);
  const max = Math.max(...rewards);
  const std = Math.sqrt(rewards.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / rewards.length);

  console.log(`Snapshot ${i+1}:`);
  console.log(`  Average: ${avg.toFixed(4)}`);
  console.log(`  Min/Max: ${min.toFixed(4)} / ${max.toFixed(4)}`);
  console.log(`  Std Dev: ${std.toFixed(4)}`);
  console.log(`  Range: ${(max - min).toFixed(4)}`);
});
console.log();

// 3. Compare key multiplier changes
console.log('3. KEY MULTIPLIER COMPARISONS:');
const keyMultipliers = [
  'resourceAttractionStrength',
  'moveSpeedPxPerSec',
  'exploreNoiseBase',
  'exploreNoiseGain',
  'turnRateGain',
  'mitosisWCapacity',
  'mitosisWStrain'
];

keyMultipliers.forEach(mult => {
  console.log(`${mult}:`);
  data.forEach((d, i) => {
    const val = d.adaptiveMultipliers[mult];
    const change = i === 0 ? 0 : val - data[i-1].adaptiveMultipliers[mult];
    const changeStr = i === 0 ? '' : ` (${change >= 0 ? '+' : ''}${change.toFixed(4)})` ;
    console.log(`  Snapshot ${i+1}: ${val.toFixed(4)}${changeStr}`);
  });
  console.log();
});

// 4. Analyze gradient magnitudes
console.log('4. GRADIENT ANALYSIS:');
const avgGradients = {};

data.forEach((d, i) => {
  if (d.trainingData && d.trainingData.length > 0) {
    console.log(`Snapshot ${i+1} has ${d.trainingData.length} training examples`);

    keyMultipliers.forEach(mult => {
      const gradients = d.trainingData.map(td => Math.abs(td.gradients[mult] || 0));
      const avg = gradients.reduce((a,b) => a+b, 0) / gradients.length;
      if (!avgGradients[mult]) avgGradients[mult] = [];
      avgGradients[mult].push(avg);
    });
  } else {
    console.log(`Snapshot ${i+1} has no training data`);
  }
});

console.log('\nAverage absolute gradients by snapshot:');
keyMultipliers.forEach(mult => {
  if (avgGradients[mult] && avgGradients[mult].length > 0) {
    console.log(`${mult}:`);
    avgGradients[mult].forEach((avg, i) => {
      console.log(`  Snapshot ${i+1}: ${avg.toFixed(6)}`);
    });
  }
});
console.log();

// 5. Training data analysis
console.log('5. TRAINING DATA SUMMARY:');
data.forEach((d, i) => {
  if (d.trainingData && d.trainingData.length > 0) {
    const trainingRewards = d.trainingData.map(td => td.reward);
    const avgTraining = trainingRewards.reduce((a,b) => a+b, 0) / trainingRewards.length;
    console.log(`Snapshot ${i+1}: ${d.trainingData.length} training examples, avg reward: ${avgTraining.toFixed(4)}`);
  } else {
    console.log(`Snapshot ${i+1}: No training data available`);
  }
});

// 6. Parameter bounds analysis
console.log('\n6. PARAMETER BOUNDS ANALYSIS:');
const bounds = {
  exploreNoiseBase: { min: 0, max: 3 },
  exploreNoiseGain: { min: 0, max: 3 },
  turnRateGain: { min: 0, max: 1 },
  sensoryRangeBase: { min: 0.5, max: 2 },
  frustrationBuildRate: { min: 0.5, max: 2 },
  frustrationDecayRate: { min: 0.5, max: 2 }
};

Object.entries(bounds).forEach(([param, {min, max}]) => {
  console.log(`${param} (bounds: ${min}-${max}):`);
  data.forEach((d, i) => {
    const val = d.adaptiveMultipliers[param];
    const status = val <= min ? 'AT MIN' : val >= max ? 'AT MAX' : 'within bounds';
    console.log(`  Snapshot ${i+1}: ${val.toFixed(4)} - ${status}`);
  });
  console.log();
});

// 7. Correlation analysis
console.log('7. REWARD vs PARAMETERS CORRELATION:');
const correlations = {};

keyMultipliers.forEach(mult => {
  const values = data.map(d => d.adaptiveMultipliers[mult]);
  const rewards = data.map(d => d.baselineReward);

  // Simple correlation coefficient
  const n = values.length;
  const sumX = values.reduce((a,b) => a+b, 0);
  const sumY = rewards.reduce((a,b) => a+b, 0);
  const sumXY = values.reduce((sum, x, i) => sum + x * rewards[i], 0);
  const sumX2 = values.reduce((sum, x) => sum + x*x, 0);
  const sumY2 = rewards.reduce((sum, y) => sum + y*y, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX*sumX) * (n * sumY2 - sumY*sumY));

  const correlation = denominator === 0 ? 0 : numerator / denominator;
  correlations[mult] = correlation;
});

console.log('Correlation between parameter values and baseline reward:');
Object.entries(correlations)
  .sort(([,a], [,b]) => Math.abs(b) - Math.abs(a))
  .forEach(([mult, corr]) => {
    console.log(`  ${mult}: ${corr.toFixed(4)}`);
  });

// Save detailed analysis to JSON
const analysis = {
  timestamp: new Date().toISOString(),
  snapshots: data.map((d, i) => ({
    file: files[i],
    timestamp: new Date(parseInt(files[i].split('-')[2].split('.')[0])),
    baselineReward: d.baselineReward,
    rewardStats: {
      average: d.rewardHistory.reduce((a,b) => a+b, 0) / d.rewardHistory.length,
      min: Math.min(...d.rewardHistory),
      max: Math.max(...d.rewardHistory),
      std: Math.sqrt(d.rewardHistory.reduce((sq, n) => {
        const avg = d.rewardHistory.reduce((a,b) => a+b, 0) / d.rewardHistory.length;
        return sq + Math.pow(n - avg, 2);
      }, 0) / d.rewardHistory.length)
    },
    keyMultipliers: keyMultipliers.reduce((obj, mult) => {
      obj[mult] = d.adaptiveMultipliers[mult];
      return obj;
    }, {}),
    trainingDataCount: d.trainingData ? d.trainingData.length : 0
  })),
  correlations,
  avgGradients,
  insights: []
};

fs.writeFileSync(path.join(__dirname, 'ah-analysis-results.json'), JSON.stringify(analysis, null, 2));
console.log('\nDetailed analysis saved to ah-analysis-results.json');
