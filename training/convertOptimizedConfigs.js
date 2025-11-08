#!/usr/bin/env node
/**
 * Convert optimized config files to config panel compatible format
 * 
 * Usage:
 *   node convertOptimizedConfigs.js <input-file> [output-file]
 * 
 * Or convert all files in a directory:
 *   node convertOptimizedConfigs.js optConfigs/
 */

const fs = require('fs');
const path = require('path');

function convertToConfigPanelFormat(optimizedConfig) {
  const metadata = optimizedConfig.metadata || {};
  const bestConfig = optimizedConfig.optimizerState?.bestConfig || {};
  
  const genLabel = metadata.generation !== undefined ? `gen${metadata.generation}` : 'unknown';
  const objective = metadata.objective || 'balanced';
  const fitness = metadata.bestFitness !== undefined ? metadata.bestFitness.toFixed(3) : 'N/A';
  const convergence = metadata.convergence !== undefined ? (metadata.convergence * 100).toFixed(1) : 'N/A';
  
  return {
    name: `Optimized ${objective} (${genLabel})`,
    description: `Auto-optimized config targeting ${objective} objective. Fitness: ${fitness}, Convergence: ${convergence}%`,
    snapshot: {
      version: 1,
      ts: metadata.exportedAt ? new Date(metadata.exportedAt).getTime() : Date.now(),
      params: bestConfig
    }
  };
}

function processFile(inputPath, outputPath) {
  try {
    console.log(`Reading: ${inputPath}`);
    const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    
    const converted = convertToConfigPanelFormat(data);
    
    if (!outputPath) {
      // Auto-generate output filename
      const dir = path.dirname(inputPath);
      const base = path.basename(inputPath, '.json');
      outputPath = path.join(dir, `config-profile-${base}.json`);
    }
    
    fs.writeFileSync(outputPath, JSON.stringify(converted, null, 2));
    console.log(`✅ Converted: ${outputPath}`);
    
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node convertOptimizedConfigs.js <input-file> [output-file]');
    console.log('  node convertOptimizedConfigs.js <directory>/');
    console.log('');
    console.log('Examples:');
    console.log('  node convertOptimizedConfigs.js optConfigs/optimized-config-gen5.json');
    console.log('  node convertOptimizedConfigs.js optConfigs/');
    process.exit(1);
  }
  
  const inputPath = args[0];
  const outputPath = args[1];
  
  // Check if input is a directory
  if (fs.statSync(inputPath).isDirectory()) {
    console.log(`Converting all JSON files in: ${inputPath}\n`);
    
    const files = fs.readdirSync(inputPath)
      .filter(f => f.endsWith('.json') && f.startsWith('optimized-config-'));
    
    if (files.length === 0) {
      console.log('No optimized-config-*.json files found in directory');
      process.exit(1);
    }
    
    let successCount = 0;
    for (const file of files) {
      const fullPath = path.join(inputPath, file);
      if (processFile(fullPath)) {
        successCount++;
      }
    }
    
    console.log(`\n✅ Successfully converted ${successCount}/${files.length} files`);
  } else {
    // Single file
    if (processFile(inputPath, outputPath)) {
      console.log('\n✅ Conversion complete!');
      console.log('Import the converted file using the config panel [O] → Import button');
    }
  }
}

main();

