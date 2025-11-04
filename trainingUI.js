// Training UI for Slime-Bundle Learning System
// Provides controls and visualization for training

export class TrainingUI {
  constructor(container) {
    this.container = container;
    this.panel = null;
    this.isVisible = false;
    this.callbacks = {};
    
    this.createUI();
  }
  
  createUI() {
    // Create panel
    this.panel = document.createElement('div');
    this.panel.id = 'training-panel';
    this.panel.classList.add('training-panel');

    // Header
    const header = document.createElement('div');
    header.classList.add('training-panel-header');
    const title = document.createElement('h3');
    title.classList.add('training-panel-title');
    title.textContent = '🧠 Training Control';
    header.appendChild(title);
    this.panel.appendChild(header);

    // Mode selection
    const modeSection = this.createSection('Mode');
    modeSection.insertAdjacentHTML('beforeend', `
      <label class="training-panel-label">
        <input type="radio" name="mode" value="play" checked> Play Mode (Heuristic AI)
      </label>
      <label class="training-panel-label">
        <input type="radio" name="mode" value="train"> Training Mode (Learn Policy)
      </label>
    `);
    this.panel.appendChild(modeSection);

    // Training controls
    const trainingSection = this.createSection('Training');
    trainingSection.insertAdjacentHTML('beforeend', `
      <div class="training-panel-field">
        <label class="training-panel-label" for="num-generations">Generations:</label>
        <input type="number" id="num-generations" value="10" min="1" max="100"
               class="training-panel-input">
      </div>
      <button id="start-training" class="training-panel-button">▶️ Start Training</button>
      <button id="stop-training" class="training-panel-button" disabled>⏸️ Stop</button>
      <button id="reset-learner" class="training-panel-button">🔄 Reset Learner</button>
    `);
    this.panel.appendChild(trainingSection);

    // Stats display
    const statsSection = this.createSection('Statistics');
    statsSection.insertAdjacentHTML('beforeend', `
      <div id="training-stats" class="training-panel-stats">
        <div>Generation: <span id="stat-generation" class="status-chip">0</span></div>
        <div>Policy: <span id="stat-policy" class="status-chip">-</span></div>
        <div>Best Reward: <span id="stat-best" class="status-chip">-</span></div>
        <div>Mean Reward: <span id="stat-mean" class="status-chip">-</span></div>
        <div>Status: <span id="stat-status" class="status-chip">Idle</span></div>
      </div>
    `);
    this.panel.appendChild(statsSection);

    // Policy management
    const policySection = this.createSection('Policy');
    policySection.insertAdjacentHTML('beforeend', `
      <button id="save-policy" class="training-panel-button">💾 Save Best Policy</button>
      <button id="load-policy" class="training-panel-button">📂 Load Policy</button>
      <div id="loaded-policy-info" class="loaded-policy-info is-hidden">
        <div class="loaded-policy-info-title">📁 Loaded Policy:</div>
        <div id="policy-filename">None</div>
        <div id="policy-details" class="loaded-policy-info-details">Generation: - | Reward: -</div>
      </div>
      <button id="use-policy" class="training-panel-button is-hidden">✅ Use This Policy</button>
      <button id="test-policy" class="training-panel-button">🎮 Test Best Policy</button>
    `);
    this.panel.appendChild(policySection);

    // Chart placeholder
    const chartSection = this.createSection('Learning Curve');
    chartSection.insertAdjacentHTML('beforeend', `
      <canvas id="learning-chart" width="100" height="120" class="training-panel-chart"></canvas>
    `);
    this.panel.appendChild(chartSection);

    // Keyboard shortcut hint
    const hint = document.createElement('div');
    hint.classList.add('training-panel-hint');
    hint.innerHTML = 'Press [L] to toggle this panel';
    this.panel.appendChild(hint);

    this.container.appendChild(this.panel);
    
    // Attach event listeners
    this.attachEventListeners();
  }
  
  createSection(title) {
    const section = document.createElement('div');
    section.classList.add('training-panel-section');
    section.innerHTML = `<div class="training-panel-section-title">${title}</div>`;
    return section;
  }
  
  attachEventListeners() {
    // Mode change
    this.panel.querySelectorAll('input[name="mode"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (this.callbacks.onModeChange) {
          this.callbacks.onModeChange(e.target.value);
        }
      });
    });
    
    // Training buttons
    document.getElementById('start-training')?.addEventListener('click', () => {
      const gens = parseInt(document.getElementById('num-generations')?.value || 10);
      if (this.callbacks.onStartTraining) {
        this.callbacks.onStartTraining(gens);
      }
      document.getElementById('start-training').disabled = true;
      document.getElementById('stop-training').disabled = false;
    });
    
    document.getElementById('stop-training')?.addEventListener('click', () => {
      if (this.callbacks.onStopTraining) {
        this.callbacks.onStopTraining();
      }
      document.getElementById('start-training').disabled = false;
      document.getElementById('stop-training').disabled = true;
    });
    
    document.getElementById('reset-learner')?.addEventListener('click', () => {
      if (confirm('Reset learner and start fresh?')) {
        if (this.callbacks.onResetLearner) {
          this.callbacks.onResetLearner();
        }
      }
    });
    
    // Policy buttons
    document.getElementById('save-policy')?.addEventListener('click', () => {
      if (this.callbacks.onSavePolicy) {
        this.callbacks.onSavePolicy();
      }
    });
    
    document.getElementById('load-policy')?.addEventListener('click', () => {
      if (this.callbacks.onLoadPolicy) {
        this.callbacks.onLoadPolicy();
      }
    });
    
    document.getElementById('test-policy')?.addEventListener('click', () => {
      if (this.callbacks.onTestPolicy) {
        this.callbacks.onTestPolicy();
      }
    });
    
    document.getElementById('use-policy')?.addEventListener('click', () => {
      if (this.callbacks.onUsePolicy) {
        this.callbacks.onUsePolicy();
      }
    });
  }
  
  // Toggle visibility
  toggle() {
    this.isVisible = !this.isVisible;
    this.panel.classList.toggle('is-visible', this.isVisible);
  }

  show() {
    this.isVisible = true;
    this.panel.classList.add('is-visible');
  }

  hide() {
    this.isVisible = false;
    this.panel.classList.remove('is-visible');
  }
  
  // Update statistics
  updateStats(stats) {
    document.getElementById('stat-generation').textContent = stats.generation || 0;
    document.getElementById('stat-policy').textContent = stats.currentPolicy !== undefined ? 
      `${stats.currentPolicy + 1}/${stats.populationSize}` : '-';
    document.getElementById('stat-best').textContent = stats.bestReward ? 
      stats.bestReward.toFixed(2) : '-';
    document.getElementById('stat-mean').textContent = stats.meanReward ? 
      stats.meanReward.toFixed(2) : '-';
    document.getElementById('stat-status').textContent = stats.status || 'Idle';
  }
  
  // Show loaded policy info
  showLoadedPolicyInfo(filename, generation, bestReward) {
    const infoDiv = document.getElementById('loaded-policy-info');
    const filenameDiv = document.getElementById('policy-filename');
    const detailsDiv = document.getElementById('policy-details');
    const useButton = document.getElementById('use-policy');
    
    if (infoDiv && filenameDiv && detailsDiv && useButton) {
      infoDiv.classList.remove('is-hidden');
      filenameDiv.textContent = filename;
      detailsDiv.textContent = `Generation: ${generation} | Best Reward: ${bestReward ? bestReward.toFixed(2) : 'N/A'}`;
      useButton.classList.remove('is-hidden');
    }
  }

  // Hide loaded policy info
  hideLoadedPolicyInfo() {
    const infoDiv = document.getElementById('loaded-policy-info');
    const useButton = document.getElementById('use-policy');

    if (infoDiv) infoDiv.classList.add('is-hidden');
    if (useButton) useButton.classList.add('is-hidden');
  }
  
  // Draw learning curve
  drawLearningCurve(history) {
    const canvas = document.getElementById('learning-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, width, height);
    
    if (!history || history.length === 0) return;
    
    // Find min/max rewards
    const bestRewards = history.map(h => h.bestReward);
    const meanRewards = history.map(h => h.meanReward);
    const minReward = Math.min(...bestRewards, ...meanRewards);
    const maxReward = Math.max(...bestRewards, ...meanRewards);
    const range = maxReward - minReward || 1;
    
    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = (i / 4) * height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    // Helper function to draw line
    const drawLine = (data, color) => {
      if (data.length < 2) return;
      
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      data.forEach((val, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((val - minReward) / range) * height;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    };
    
    // Draw lines
    drawLine(meanRewards, '#ffaa00');  // orange for mean
    drawLine(bestRewards, '#00ff88');  // green for best
    
    // Legend
    ctx.fillStyle = '#ffaa00';
    ctx.fillText('Mean', 5, 15);
    ctx.fillStyle = '#00ff88';
    ctx.fillText('Best', 50, 15);
  }
  
  // Register callbacks
  on(event, callback) {
    this.callbacks[event] = callback;
  }
}
