// Slime-Bundle v0.6 — Learning system with plant ecology
// Controls: [WASD/Arrows]=move (Agent 1 when MANUAL) | [A]=auto toggle | [S]=toggle extended sensing
// [G]=scent gradient viz | [P]=fertility viz | [M]=mitosis toggle | [Space]=pause [R]=reset [C]=+5χ all 
// [T]=trail on/off [X]=clear trail [F]=diffusion on/off | [1-4]=toggle individual agents | [V]=toggle all | [L]=training UI
// [H]=agent dashboard | [U]=cycle HUD (full/minimal/hidden) | [K]=toggle hotkey strip | [O]=config panel

import { CONFIG } from './config.js';
import { SignalField } from './signalField.js';
import { HeuristicController, LinearPolicyController } from './controllers.js';
import { RewardTracker, EpisodeManager, updateFindTimeEMA, calculateAdaptiveReward } from './rewards.js';
import { CEMLearner, TrainingManager } from './learner.js';
import { TrainingUI } from './trainingUI.js';
import { visualizeScentGradient, visualizeScentHeatmap } from './scentGradient.js';
import { FertilityGrid, attemptSeedDispersal, attemptSpontaneousGrowth, getResourceSpawnLocation, getSpawnPressureMultiplier } from './plantEcology.js';
import { SignalResponseAnalytics } from './analysis/signalResponseAnalytics.js';
import { TcScheduler, TcRandom, TcStorage } from './tcStorage.js';
import { getRule110SpawnLocation, getRule110SpawnMultiplier, getRule110SpawnInfo, drawRule110Overlay } from './tcResourceBridge.js';
import { createBundleClass } from './src/core/bundle.js';
import { createResourceClass } from './src/core/resource.js';
import { createWorld } from './src/core/world.js';

(() => {
    const canvas = document.getElementById("view");
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
  
    // ---------- DPR-aware sizing ----------
    let dpr = 1;
    let canvasWidth = innerWidth;
    let canvasHeight = innerHeight;
    
    // Initialize UI state variables before getAvailableSize uses them
    let showAgentDashboard = false; // Toggle for agent dashboard overlay
    
    const getAvailableSize = () => {
      const configPanel = document.getElementById("config-panel");
      const panelOpen = configPanel && configPanel.style.display !== "none";
      const panelWidth = panelOpen ? 360 : 0; // Config panel width
      // Canvas now fills full viewport, HUD/Dashboard are drawn on top
      
      return {
        width: innerWidth - panelWidth,
        height: innerHeight,
        panelWidth: panelWidth,
        topReserve: 0
      };
    };
    
    const resize = () => {
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
      const avail = getAvailableSize();
      canvasWidth = avail.width;
      canvasHeight = avail.height;
      
      canvas.width  = Math.floor(canvasWidth  * dpr);
      canvas.height = Math.floor(canvasHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      // Update canvas CSS to position it correctly - full viewport
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      
      // Only resize Trail if it's been initialized
      // Trail is defined later in the code, so we check if it exists
      if (typeof Trail !== 'undefined' && Trail && Trail.resize) {
        Trail.resize();
      }

      if (SignalField && SignalField.resize) {
        SignalField.resize(canvasWidth, canvasHeight, ctx);
      }
      
      // Recreate FertilityField if plant ecology is enabled
      if (CONFIG.plantEcology.enabled && typeof FertilityGrid !== 'undefined') {
        FertilityField = new FertilityGrid(canvasWidth, canvasHeight);
      }
    };
    window.addEventListener("resize", resize, { passive: true });
    
    // Expose resize function globally so config panel can trigger it
    window.resizeCanvas = resize;
    
    // Note: Initial resize will be called after Trail is defined
  
    // Config is now imported from config.js
  
    // ---------- Input ----------
    const held = new Set();
    let showScentGradient = true; // Toggle for scent gradient visualization
    let showFertility = false; // Toggle for fertility grid visualization
    let hudDisplayMode = 'full'; // 'full', 'minimal', or 'hidden'
    let showHotkeyStrip = true; // Toggle for hotkey strip at bottom
    
    window.addEventListener("keydown", (e) => {
      const k = e.key.toLowerCase();
      if (["arrowup","w","arrowdown","s","arrowleft","a","arrowright","d"].includes(k)) held.add(k);
      if (e.code === "Space") { World.paused = !World.paused; e.preventDefault(); }
      else if (e.code === "KeyR") { World.reset(); }
      else if (e.code === "KeyK") { 
        // Toggle hotkey strip
        showHotkeyStrip = !showHotkeyStrip;
        const hotkeyStrip = document.getElementById("hotkey-strip");
        if (hotkeyStrip) {
          if (showHotkeyStrip) {
            hotkeyStrip.classList.remove("hidden");
          } else {
            hotkeyStrip.classList.add("hidden");
          }
        }
        console.log(`⌨️  Hotkey strip ${showHotkeyStrip ? "VISIBLE" : "HIDDEN"}`);
        e.preventDefault();
      }
      else if (e.code === "KeyC") { 
        World.bundles.forEach(b => { 
          b.chi += 5; 
          b.alive = true;
          // Reset decay state when reviving
          b.deathTick = -1;
          b.decayProgress = 0;
        }); 
      }
      else if (e.code === "KeyS") { World.bundles.forEach(b => { b.extendedSensing = !b.extendedSensing; }); }
      else if (e.code === "KeyT") { CONFIG.renderTrail = !CONFIG.renderTrail; }
      else if (e.code === "KeyX") { Trail.clear(); SignalField.clear(); }
      else if (e.code === "KeyF") { CONFIG.enableDiffusion = !CONFIG.enableDiffusion; }
      else if (e.code === "KeyA") { CONFIG.autoMove = !CONFIG.autoMove; }
      else if (e.code === "KeyL") { if (window.trainingUI) window.trainingUI.toggle(); }
      else if (e.code === "KeyG") { showScentGradient = !showScentGradient; } // Toggle scent gradient visualization
      else if (e.code === "KeyM") { 
        CONFIG.mitosis.enabled = !CONFIG.mitosis.enabled; 
        console.log(`🧫 Mitosis ${CONFIG.mitosis.enabled ? "ENABLED" : "DISABLED"}`);
      } // Toggle mitosis
      else if (e.code === "KeyP") {
        showFertility = !showFertility;
      } // Toggle plant/fertility visualization
      else if (e.code === "KeyH") {
        showAgentDashboard = !showAgentDashboard;
      } // Toggle agent dashboard overlay
      else if (e.code === "KeyU") {
        // Cycle through HUD display modes: full -> minimal -> hidden -> full
        if (hudDisplayMode === 'full') hudDisplayMode = 'minimal';
        else if (hudDisplayMode === 'minimal') hudDisplayMode = 'hidden';
        else hudDisplayMode = 'full';
        console.log(`📊 HUD mode: ${hudDisplayMode.toUpperCase()}`);
      } // Toggle HUD display mode
      // Toggle individual agents visibility
      else if (e.code === "Digit1") { if (World.bundles[0]) World.bundles[0].visible = !World.bundles[0].visible; }
      else if (e.code === "Digit2") { if (World.bundles[1]) World.bundles[1].visible = !World.bundles[1].visible; }
      else if (e.code === "Digit3") { if (World.bundles[2]) World.bundles[2].visible = !World.bundles[2].visible; }
      else if (e.code === "Digit4") { if (World.bundles[3]) World.bundles[3].visible = !World.bundles[3].visible; }
      else if (e.code === "KeyV") { World.bundles.forEach(b => b.visible = !b.visible); } // Toggle all
      else if (e.code === "KeyE") {
        // Take screenshot
        e.preventDefault();
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
          const filename = `slime-screenshot-${timestamp}.png`;
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log(`📸 Screenshot saved: ${filename}`);
        }, 'image/png');
      }
    });
    window.addEventListener("keyup", (e) => held.delete(e.key.toLowerCase()));
  
    // ---------- Helpers ----------
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const SIGNAL_CHANNELS = {
      resource: 0,
      distress: 1,
      bond: 2
    };
    const SIGNAL_MEMORY_LENGTH = Math.max(3, CONFIG.signal?.memoryLength || 12);
    const SIGNAL_DISTRESS_NOISE_GAIN = 1.5;
    const SIGNAL_RESOURCE_PULL_GAIN = 2.5;  // Increased from 0.65 - stronger signal following
    const SIGNAL_BOND_CONFLICT_DAMP = 0.7;
    const normalizeRewardSignal = (rewardChi) => {
      if (!Number.isFinite(rewardChi)) return 0;
      const base = Math.max(CONFIG.rewardChi || rewardChi || 0, 1e-6);
      return clamp(rewardChi / base, 0, 1);
    };
    const mix = (a,b,t)=>a+(b-a)*t;
    const randomRange = (min, max) => TcRandom.random() * (max - min) + min;
    const smoothstep = (e0,e1,x)=> {
      const t = clamp((x - e0) / Math.max(1e-6, e1 - e0), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const getSignalConfig = () => CONFIG.signal || {};
    const getSignalSensitivity = (channel) => {
      const cfg = getSignalConfig();
      return cfg?.sensitivity?.[channel] ?? 1;
    };
    const getSignalDecayRate = (channel) => {
      const cfg = getSignalConfig();
      return clamp(cfg?.decay?.[channel] ?? 0.08, 0, 1);
    };
    const getSignalWeight = (channel) => {
      const cfg = getSignalConfig();
      const value = cfg?.channelWeights?.[channel];
      return Number.isFinite(value) ? value : 1;
    };
    const getSignalActivationThreshold = () => {
      const cfg = getSignalConfig();
      const value = cfg?.activationThreshold;
      return clamp(Number.isFinite(value) ? value : 0.05, 0, 1);
    };

    // Generate color for agent based on ID (supports unlimited agents)
    const getAgentColor = (id, alive = true) => {
      // First 4 agents use classic colors for consistency
      const classicColors = {
        1: { alive: "#00ffff", dead: "#005555" },  // cyan
        2: { alive: "#ff00ff", dead: "#550055" },  // magenta
        3: { alive: "#ffff00", dead: "#555500" },  // yellow
        4: { alive: "#ff8800", dead: "#553300" },  // orange
      };
      
      if (id <= 4 && classicColors[id]) {
        return alive ? classicColors[id].alive : classicColors[id].dead;
      }
      
      // For agents beyond 4, use HSL with varying hue
      const hue = ((id - 1) * 137.5) % 360; // Golden angle for good distribution
      const saturation = alive ? 100 : 30;
      const lightness = alive ? 50 : 20;
      return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    };
    
    // Get RGB values for trail rendering
    const getAgentColorRGB = (id) => {
      // First 4 use classic RGB
      const classicRGB = {
        1: { r: 0, g: 255, b: 255 },    // cyan
        2: { r: 255, g: 0, b: 255 },    // magenta
        3: { r: 255, g: 255, b: 0 },    // yellow
        4: { r: 255, g: 136, b: 0 }     // orange
      };
      
      if (id <= 4 && classicRGB[id]) {
        return classicRGB[id];
      }
      
      // Convert HSL to RGB for agents beyond 4
      const hue = ((id - 1) * 137.5) % 360;
      const s = 1.0;
      const l = 0.5;
      
      const c = (1 - Math.abs(2 * l - 1)) * s;
      const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
      const m = l - c / 2;
      
      let r, g, b;
      if (hue < 60) { r = c; g = x; b = 0; }
      else if (hue < 120) { r = x; g = c; b = 0; }
      else if (hue < 180) { r = 0; g = c; b = x; }
      else if (hue < 240) { r = 0; g = x; b = c; }
      else if (hue < 300) { r = x; g = 0; b = c; }
      else { r = c; g = 0; b = x; }
      
      return {
        r: Math.round((r + m) * 255),
        g: Math.round((g + m) * 255),
        b: Math.round((b + m) * 255)
      };
    };
  
    // ---------- Global time & economy ----------
    let globalTick = 0;
    let lastSignalStatTick = 0;
    const Ledger = {
      credits: {},  // authorId -> total χ from reuse
      credit(authorId, amount) { this.credits[authorId] = (this.credits[authorId] || 0) + amount; },
      getCredits(authorId) { return this.credits[authorId] || 0; }
    };
    
    // ---------- Link System (agent-to-agent tubes) ----------
    // Link: { aId, bId, strength, age, restLen, lastUseTick }
    const Links = [];
    function linksForAgent(id) {
      return Links.filter(L => L.aId === id || L.bId === id);
    }
    function otherId(L, id) { return L.aId === id ? L.bId : L.aId; }
    function getBundleById(id) { return World.bundles.find(b => b.id === id); }
    function linkExists(aId, bId) {
      return Links.some(L => (L.aId === aId && L.bId === bId) || (L.aId === bId && L.bId === aId));
    }
    function removeLinksFor(id) {
      for (let i = Links.length - 1; i >= 0; i--) {
        const L = Links[i];
        if (L.aId === id || L.bId === id) Links.splice(i, 1);
      }
    }
    function provokeBondedExploration(deadId) {
      const duration = CONFIG.bondLoss?.onDeathBoostDuration ?? 600;
      const affected = linksForAgent(deadId);
      const deadBundle = getBundleById(deadId);
      const deathPos = deadBundle ? { x: deadBundle.x, y: deadBundle.y } : null;
      for (const L of affected) {
        const survivorId = otherId(L, deadId);
        const survivor = getBundleById(survivorId);
        if (survivor && survivor.alive) {
          const previousTicks = survivor.bereavementBoostTicks || 0;
          const nextTicks = Math.max(previousTicks, duration);
          survivor.bereavementBoostTicks = nextTicks;
          const distressStrength = clamp(L.strength / 2, 0, 1);
          if (distressStrength > 0) {
            survivor.emitSignal('distress', distressStrength, { cap: 1 });
            if (deadBundle && deathPos) {
              deadBundle.emitSignal('distress', distressStrength, { cap: 1, x: deathPos.x, y: deathPos.y });
            } else if (deathPos && CONFIG.signal?.enabled && SignalField) {
              SignalField.deposit(deathPos.x, deathPos.y, distressStrength, SIGNAL_CHANNELS.distress);
            }
          }
        }
      }
      // Immediately remove links tied to dead agent to avoid stale guidance
      removeLinksFor(deadId);
    }
    function tryFormLink(a, b) {
      const maxR = CONFIG.link.radius;
      const dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.hypot(dx, dy);
      if (d > maxR) return;
      if (!a.alive || !b.alive) return;
      if (linkExists(a.id, b.id)) return;
      if (a.chi < CONFIG.link.formCost || b.chi < CONFIG.link.formCost) return;
      // Shared-context: same hot trail cell snapshot
      const sA = Trail.sample(a.x, a.y);
      const sB = Trail.sample(b.x, b.y);
      const sharedHot = Math.min(sA.value, sB.value) > CONFIG.link.trailMin;
      if (!sharedHot) return;
      a.chi -= CONFIG.link.formCost;
      b.chi -= CONFIG.link.formCost;
      Links.push({
        aId: a.id,
        bId: b.id,
        strength: CONFIG.link.initStrength,
        age: 0,
        restLen: d,
        lastUseTick: globalTick
      });
    }
    function maintainLinks(dt) {
      // maintenance leak and passive decay; strengthen on use; breakage
      for (let i = Links.length - 1; i >= 0; i--) {
        const L = Links[i];
        const a = getBundleById(L.aId);
        const b = getBundleById(L.bId);
        if (!a || !b || !a.alive || !b.alive) { Links.splice(i, 1); continue; }
        // χ maintenance proportional to strength
        const leak = CONFIG.link.maintPerSec * L.strength * dt;
        a.chi = Math.max(0, a.chi - leak);
        b.chi = Math.max(0, b.chi - leak);
        // passive decay
        L.strength -= CONFIG.link.decayPerSec * dt;
        // hunger-driven extra decay (averaged)
        const hA = clamp(a.hunger, 0, 1);
        const hB = clamp(b.hunger, 0, 1);
        const escapeA = Math.max(0, (hA - CONFIG.hungerThresholdHigh)) / Math.max(1e-6, 1 - CONFIG.hungerThresholdHigh);
        const escapeB = Math.max(0, (hB - CONFIG.hungerThresholdHigh)) / Math.max(1e-6, 1 - CONFIG.hungerThresholdHigh);
        const hungerEsc = (escapeA * escapeA + escapeB * escapeB) * 0.5; // quadratic mean
        if (hungerEsc > 0) {
          L.strength -= CONFIG.link.hungerDecayPerSec * hungerEsc * dt;
        }
        // use-based strengthening: projection of velocity along link direction
        const vx = b.x - a.x, vy = b.y - a.y;
        const len = Math.hypot(vx, vy) || 1;
        const ux = vx / len, uy = vy / len;
        const aProj = (a.vx * ux + a.vy * uy);
        const bProj = (b.vx * ux + b.vy * uy) * -1; // moving toward each other counts
        const useFactor = Math.max(0, aProj) + Math.max(0, bProj);
        if (useFactor > 0) {
          L.strength += CONFIG.link.strengthenPerUse * dt;
          L.lastUseTick = globalTick;
        }
        const bondSignal = clamp(L.strength * 0.15 * dt, 0, 1);
        if (bondSignal > 0) {
          a.emitSignal('bond', bondSignal, { cap: 1 });
          b.emitSignal('bond', bondSignal, { cap: 1 });
        }
        // clamp and breakage
        if (L.strength < CONFIG.link.minStrength) { Links.splice(i, 1); continue; }
        L.strength = Math.min(2.0, Math.max(0, L.strength));
        L.age += dt;
      }
    }
    function reinforceLinks(dt) {
      // deposit faint trail along each link segment, scaled by strength
      const samples = 10;
      for (const L of Links) {
        const a = getBundleById(L.aId);
        const b = getBundleById(L.bId);
        if (!a || !b) continue;
        const depBase = CONFIG.depositPerSec * 0.01 * L.strength * dt; // Reduced from 0.1 to 0.01
        for (let s = 0; s <= samples; s++) {
          const t = s / samples;
          const x = a.x + (b.x - a.x) * t;
          const y = a.y + (b.y - a.y) * t;
          Trail.deposit(x, y, depBase, 0); // authorId 0 for neutral paving
        }
      }
    }
  
    // ---------- Learning System ----------
    let learningMode = 'play'; // 'play' or 'train'
    const learner = new CEMLearner(23, 3); // 23 obs dims (was 15, now includes scent+density), 3 action dims
    const episodeManager = new EpisodeManager();
    let trainingManager = null;
    let currentTrainingPolicy = null;
    let stopTrainingFlag = false;
    let loadedPolicyInfo = null; // Store info about loaded policy file
  
    // ---------- Trail field (downsampled) ----------
    const Trail = {
      w: 0, h: 0, cell: CONFIG.trailCell,
      buf: null, tmp: null, snapshot: null,
      authorBuf: null, authorSnapshot: null,
      timestampBuf: null, timestampSnapshot: null,
      img: null, offscreen: null,
  
      resize() {
        this.cell = CONFIG.trailCell;
        this.w = Math.max(1, Math.floor(canvasWidth  / this.cell));
        this.h = Math.max(1, Math.floor(canvasHeight / this.cell));
        const len = this.w * this.h;
        this.buf = new Float32Array(len);
        this.tmp = new Float32Array(len);
        this.snapshot = new Float32Array(len);
        this.authorBuf = new Uint32Array(len);
        this.authorSnapshot = new Uint32Array(len);
        this.timestampBuf = new Uint32Array(len);
        this.timestampSnapshot = new Uint32Array(len);
        this.img = ctx.createImageData(this.w, this.h);
        this.offscreen = document.createElement('canvas');
        this.offscreen.width = this.w;
        this.offscreen.height = this.h;
      },
      clear() {
        if (this.buf) this.buf.fill(0);
        if (this.authorBuf) this.authorBuf.fill(0);
        if (this.timestampBuf) this.timestampBuf.fill(0);
      },
      index(ix, iy) { return iy * this.w + ix; },
      inBounds(ix, iy) { return ix >= 0 && iy >= 0 && ix < this.w && iy < this.h; },
  
      deposit(px, py, amount, authorId) {
        const ix = Math.floor(px / this.cell);
        const iy = Math.floor(py / this.cell);
        if (!this.inBounds(ix, iy)) return;
        const i = this.index(ix, iy);
        this.buf[i] = Math.min(1, this.buf[i] + amount);
        this.authorBuf[i] = authorId;
        this.timestampBuf[i] = globalTick;
      },
  
      sample(px, py) {
        // from snapshot
        const ix = Math.floor(px / this.cell);
        const iy = Math.floor(py / this.cell);
        if (!this.inBounds(ix, iy)) return { value: 0, authorId: 0, age: Infinity };
        const i = this.index(ix, iy);
        const value = this.snapshot[i];
        const authorId = this.authorSnapshot[i];
        const timestamp = this.timestampSnapshot[i];
        const age = globalTick - timestamp;
        return { value, authorId, age };
      },
  
      captureSnapshot() {
        if (this.buf) {
          this.snapshot.set(this.buf);
          this.authorSnapshot.set(this.authorBuf);
          this.timestampSnapshot.set(this.timestampBuf);
        }
      },
  
      step(dt) {
        if (!this.buf) return;
  
        // Evaporation (exponential-ish)
        const k = CONFIG.evapPerSec * dt;
        for (let i = 0; i < this.buf.length; i++) {
          const v = this.buf[i];
          this.buf[i] = v > 0 ? Math.max(0, v - k * v) : 0;
        }
  
        // Diffusion (cross kernel)
        if (CONFIG.enableDiffusion) {
          const a = CONFIG.diffusePerSec * dt;
          if (a > 0) {
            const w = this.w, h = this.h, src = this.buf, dst = this.tmp;
            for (let y = 0; y < h; y++) {
              const yUp = (y > 0) ? y-1 : y;
              const yDn = (y < h-1) ? y+1 : y;
              for (let x = 0; x < w; x++) {
                const xLt = (x > 0) ? x-1 : x;
                const xRt = (x < w-1) ? x+1 : x;
                const iC = y*w + x;
                const vC = src[iC];
                const vUp = src[yUp*w + x];
                const vDn = src[yDn*w + x];
                const vLt = src[y*w + xLt];
                const vRt = src[y*w + xRt];
                const mean = (vUp + vDn + vLt + vRt) * 0.25;
                dst[iC] = clamp(vC + a * (mean - vC), 0, 1);
              }
            }
            const t = this.buf; this.buf = this.tmp; this.tmp = t;
          }
        }
      },
  
      draw() {
        if (!CONFIG.renderTrail || !this.buf || !this.offscreen) return;
        const data = this.img.data;
        
        for (let i = 0; i < this.buf.length; i++) {
          const v = this.buf[i];                 // 0..1
          const authorId = this.authorBuf[i];
          const intensity = Math.floor(Math.pow(v, 0.6) * 255);
          const o = i * 4;
          
          // Get color based on author using dynamic color function
          // Neutral deposits (authorId===0) use a subtle gray to avoid overpowering
          const color = authorId !== 0 ? getAgentColorRGB(authorId) : { r: 140, g: 140, b: 140 };
          
          data[o+0] = Math.floor(color.r * intensity / 255);
          data[o+1] = Math.floor(color.g * intensity / 255);
          data[o+2] = Math.floor(color.b * intensity / 255);
          data[o+3] = Math.min(255, intensity * 1.5);
        }
        const octx = this.offscreen.getContext('2d');
        octx.putImageData(this.img, 0, 0);
  
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.globalCompositeOperation = "lighter";
        ctx.drawImage(
          this.offscreen,
          0, 0, this.w, this.h,
          0, 0, this.w * this.cell, this.h * this.cell
        );
        ctx.globalCompositeOperation = "source-over";
        ctx.restore();
      }
    };
    
    // Call resize after Trail is defined (done later in code)
    // resize(); // Moved to after Trail initialization
    
    // ---------- Fertility Grid (Plant Ecology) ----------
    let FertilityField = null;
    if (CONFIG.plantEcology.enabled) {
      FertilityField = new FertilityGrid(canvasWidth, canvasHeight);
    }
    
    // Now that Trail is defined, call initial resize
    resize();
  
    // ---------- Entities ----------
    const Bundle = createBundleClass({
      Trail,
      getGlobalTick: () => globalTick,
      getCanvasWidth: () => canvasWidth,
      getCanvasHeight: () => canvasHeight,
      Ledger,
      getSignalWeight,
      getSignalSensitivity,
      getSignalDecayRate,
      getSignalActivationThreshold,
      linksForAgent,
      otherId,
      getBundleById,
      held,
      provokeBondedExploration,
      getAgentColor,
      getAgentColorRGB,
      getWorld: () => World
    });
    const terrainHeightFn = typeof getTerrainHeight === 'function'
      ? (x, y) => getTerrainHeight(x, y)
      : undefined;

    const Resource = createResourceClass({
      getGlobalTick: () => globalTick,
      getCanvasWidth: () => canvasWidth,
      getCanvasHeight: () => canvasHeight,
      getFertilityField: () => FertilityField,
      getRule110Stepper: () => (typeof window !== 'undefined' ? window.rule110Stepper : null),
      getTerrainHeight: terrainHeightFn,
      getViewportWidth: () => innerWidth,
      getViewportHeight: () => innerHeight
    });
  
    // ---------- World ----------
    const World = createWorld({
      Trail,
      getCanvasWidth: () => canvasWidth,
      getCanvasHeight: () => canvasHeight,
      getGlobalTick: () => globalTick,
      setGlobalTick: (value) => { globalTick = value; },
      Ledger,
      Links,
      Bundle,
      Resource,
      getPerformanceNow: () => performance.now()
    });
    World.reset();
    
    // Expose World globally for console access
    if (typeof window !== 'undefined') {
      window.World = World;
    }
  
    // ---------- Lineage Visualization ----------
    function drawLineageLinks(ctx) {
      if (!CONFIG.mitosis.showLineage || !World.lineageLinks || World.lineageLinks.length === 0) {
        return;
      }
      
      const maxDistance = CONFIG.mitosis.lineageMaxDistance || 500;
      const fadeDuration = CONFIG.mitosis.lineageFadeDuration || 600;
      const baseOpacity = CONFIG.mitosis.lineageOpacity || 0.4;
      const color = CONFIG.mitosis.lineageColor || "#888888";
      
      ctx.save();
      ctx.strokeStyle = color;
      
      World.lineageLinks.forEach(link => {
        // Find parent and child bundles
        const parent = World.bundles.find(b => b.id === link.parentId);
        const child = World.bundles.find(b => b.id === link.childId);
        
        if (!parent || !child) return; // Skip if either doesn't exist
        
        // Calculate distance
        const dx = child.x - parent.x;
        const dy = child.y - parent.y;
        const dist = Math.hypot(dx, dy);
        
        // Skip if too far away
        if (dist > maxDistance) return;
        
        // Calculate fade based on age
        const age = globalTick - link.birthTick;
        const fadeProgress = Math.min(1, age / fadeDuration);
        const opacity = baseOpacity * (1 - fadeProgress * 0.7); // Fade to 30% of base opacity
        
        if (opacity < 0.05) return; // Too faded to draw
        
        // Draw line
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(child.x, child.y);
        ctx.stroke();
      });
      
      ctx.restore();
    }
    
    function getControllerBadge(bundle, index = 0) {
      if (bundle.useController && bundle.controller) {
        if (index === 0 && loadedPolicyInfo) {
          return `🤖 ${loadedPolicyInfo.filename.replace('.json', '').substring(0, 12)}`;
        }
        return bundle.controller.constructor.name === "LinearPolicyController" ? "🤖 POLICY" : "🎮 CTRL";
      }
      return "🧠 AI";
    }

    // ---------- HUD ----------
    function drawHUD() {
      if (!CONFIG.hud.show || hudDisplayMode === 'hidden') return;
      ctx.save();
      
      const baselineY = 10;
      const padding = 14;
      const lineHeight = 16;
      const sectionSpacing = 10;
      
      // Helper function to draw status badge (horizontal layout)
      const drawBadge = (x, y, enabled, label) => {
        const badgeWidth = 80; // Fixed width for alignment
        const badgeHeight = 16;
        
        // Badge background
        ctx.fillStyle = enabled 
          ? "rgba(0, 255, 136, 0.2)" 
          : "rgba(128, 128, 128, 0.15)";
        ctx.fillRect(x, y - 11, badgeWidth, badgeHeight);
        
        // Badge border
        ctx.strokeStyle = enabled 
          ? "rgba(0, 255, 136, 0.5)" 
          : "rgba(128, 128, 128, 0.3)";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y - 11, badgeWidth, badgeHeight);
        
        // Check mark or cross
        ctx.fillStyle = enabled ? "#4dffaa" : "#666";
        ctx.font = "bold 11px ui-mono, monospace";
        ctx.fillText(enabled ? "✓" : "✗", x + 4, y);
        
        // Label
        ctx.fillStyle = enabled ? "#00ff88" : "#888";
        ctx.font = "12px ui-mono, monospace";
        ctx.fillText(label, x + 18, y);
        
        return y + badgeHeight + 3; // Return next Y position
      };
      
      // Calculate metrics
      const totalAgents = World.bundles.length;
      const aliveCount = World.bundles.filter(b => b.alive).length;
      const totalChi = World.bundles.reduce((sum, b) => sum + b.chi, 0);
      const avgChi = totalAgents ? totalChi / totalAgents : 0;
      const avgFrustration = totalAgents
        ? World.bundles.reduce((sum, b) => sum + b.frustration, 0) / totalAgents
        : 0;
      const avgHunger = totalAgents
        ? World.bundles.reduce((sum, b) => sum + b.hunger, 0) / totalAgents
        : 0;

      let resourceSummary = `${World.resources.length}`;
      let resourceDetails = "";
      if (CONFIG.plantEcology.enabled) {
        if (CONFIG.resourceScaleWithAgents) {
          const spawnPressure = CONFIG.plantEcology.spawnPressure;
          const minResourceMultiplier = spawnPressure?.minResourceMultiplier ?? spawnPressure?.minSeedMultiplier ?? 1;
          const pressureMultiplier = getSpawnPressureMultiplier(aliveCount, minResourceMultiplier);
          const maxResources = Math.floor(
            clamp(
              CONFIG.resourceBaseAbundance * pressureMultiplier,
              CONFIG.resourceScaleMinimum,
              CONFIG.resourceScaleMaximum
            )
          );
          const pressurePct = Math.round((1 - pressureMultiplier) * 100);
          resourceSummary = `${World.resources.length}/${maxResources}`;
          resourceDetails = `pressure ${pressurePct}%`;
        } else {
          resourceSummary = `${World.resources.length}/${World.carryingCapacity}`;
          resourceDetails = `cap ${World.carryingCapacity}`;
        }
      } else if (CONFIG.resourceDynamicCount) {
        resourceSummary = `${World.resources.length}/${World.carryingCapacity}`;
        resourceDetails = `pressure ${(World.resourcePressure * 100).toFixed(0)}%`;
      }

      const hudSections = [];

      // Minimal mode: compact single line
      if (hudDisplayMode === 'minimal') {
        hudSections.push({
          color: "#88ffff",
          lines: [
            `📊 ${aliveCount}/${totalAgents}  χ:${avgChi.toFixed(1)}  🌿:${resourceSummary}  tick:${globalTick}`
          ]
        });
      } else {
        // Full mode: organized sections
        
        // Section 1: Agent Statistics
        hudSections.push({
          color: "#88ffff",
          lines: [
            `📊 AGENTS`,
            `   alive:   ${aliveCount}/${totalAgents}`,
            `   avg χ:   ${avgChi.toFixed(1)}`,
            `   births:  ${World.totalBirths}`,
            `   avg F/H: ${Math.round(avgFrustration * 100)}% / ${Math.round(avgHunger * 100)}%`
          ]
        });

        // Section 2: Simulation Stats
        const simLines = [
          `⚙️  SIMULATION`,
          `   mode:      ${CONFIG.autoMove ? "AUTO" : "MANUAL"}`,
          `   learning:  ${learningMode === 'train' ? "TRAINING" : "PLAY"}`,
          `   tick:      ${globalTick}`,
          `   χ earned:  ${World.collected}`
        ];
        hudSections.push({
          color: "#00ff88",
          lines: simLines
        });

        // Section 3: Resources
        const resourceLines = [
          `🌿 RESOURCES`,
          `   count:  ${resourceSummary}`
        ];
        if (resourceDetails) {
          resourceLines.push(`   ${resourceDetails}`);
        }
        hudSections.push({
          color: "#ffaa00",
          lines: resourceLines
        });

        // Section 4: Status badges (visual checkmarks) - vertical layout
        hudSections.push({
          type: 'badges',
          color: "#88ddff",
          label: "⚡ STATUS",
          badges: [
            { label: 'Trail', enabled: CONFIG.renderTrail },
            { label: 'Diffusion', enabled: CONFIG.enableDiffusion },
            { label: 'Mitosis', enabled: CONFIG.mitosis.enabled },
            { label: 'Scent', enabled: showScentGradient },
            { label: 'Fertility', enabled: showFertility },
            { label: 'Dashboard', enabled: showAgentDashboard }
          ]
        });
      }

      // Calculate HUD dimensions
      let totalLines = 0;
      let badgeCount = 0;
      hudSections.forEach(section => {
        if (section.type === 'badges') {
          totalLines += 1; // Header line
          badgeCount = section.badges.length;
        } else {
          totalLines += section.lines.length;
        }
      });
      
      // Add space for vertical badges (each badge is ~19px including spacing)
      const badgeVerticalSpace = badgeCount * 19;
      const hudHeight = padding * 2 + totalLines * lineHeight + (hudSections.length - 1) * sectionSpacing + badgeVerticalSpace;
      const hudWidth = hudDisplayMode === 'minimal' ? 500 : 175;

      // Draw HUD background
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(baselineY, baselineY, hudWidth, hudHeight);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.5)";
      ctx.lineWidth = 1;
      ctx.strokeRect(baselineY, baselineY, hudWidth, hudHeight);

      // Draw HUD content
      ctx.font = "13px ui-mono, monospace";
      ctx.textAlign = "left";
      
      let currentY = baselineY + padding + 13;
      
      hudSections.forEach(section => {
        if (section.type === 'badges') {
          // Draw status badges section header
          ctx.fillStyle = section.color;
          ctx.font = "bold 13px ui-mono, monospace";
          ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          ctx.fillText(section.label, baselineY + padding, currentY);
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          
          currentY += lineHeight + 3;
          
          // Draw status badges vertically
          const badgeX = baselineY + padding + 3;
          section.badges.forEach(badge => {
            currentY = drawBadge(badgeX, currentY, badge.enabled, badge.label);
          });
          currentY += sectionSpacing;
        } else {
          // Draw text lines
          const lines = section.lines.filter(Boolean);
          ctx.fillStyle = section.color;
          lines.forEach((line, idx) => {
            // Add subtle shadow for readability
            ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Make section headers bold
            if (idx === 0) {
              ctx.font = "bold 13px ui-mono, monospace";
            } else {
              ctx.font = "12px ui-mono, monospace";
            }
            
            ctx.fillText(line, baselineY + padding, currentY);
            
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            
            currentY += lineHeight;
          });
          currentY += sectionSpacing;
        }
      });

      if (showAgentDashboard) {
        drawAgentDashboardOverlay(baselineY);
      }

      ctx.restore();
    }

    function drawAgentDashboardOverlay(baselineY = 10) {
      const agents = World.bundles;
      if (!agents.length) return;

      const viewWidth = canvas.width / dpr;
      const viewHeight = canvas.height / dpr;
      const padding = 12;
      const rowHeight = 17; // Slightly increased for better readability
      const headerHeight = 65; // Updated to match actual header layout
      const rightMargin = 10; // Margin from right edge
      
      // Fixed column widths for aligned table layout
      ctx.font = "12px ui-mono, monospace";
      const colWidths = {
        vis: 28,      // "vis/alive" - icons
        id: 36,       // "ID"
        chi: 62,      // "χ" with value
        cr: 62,       // "cr" with value
        f: 48,        // "F" with %
        h: 48,        // "H" with %
        sense: 60,    // "sense" with value
        controller: 80 // "controller"
      };
      
      const singleColumnWidth = Object.values(colWidths).reduce((sum, w) => sum + w, 0) + 8; // +8 for spacing
      const maxRows = Math.max(1, Math.floor((viewHeight - padding * 2 - headerHeight) / rowHeight));
      const maxColumns = Math.max(1, Math.floor((viewWidth - padding * 2 - rightMargin) / singleColumnWidth));

      let columns = 1;
      let rowsPerColumn = Math.ceil(agents.length / columns);
      while (columns < maxColumns && rowsPerColumn > maxRows) {
        columns += 1;
        rowsPerColumn = Math.ceil(agents.length / columns);
      }

      columns = Math.max(1, Math.min(columns, maxColumns, agents.length || 1));
      rowsPerColumn = Math.max(1, Math.ceil(agents.length / columns));

      // Calculate panel width - ensure it fits all content
      const calculatedWidth = columns * singleColumnWidth + padding * 2;
      const maxWidth = viewWidth - rightMargin - padding; // Leave margin from right edge
      const panelWidth = Math.min(maxWidth, calculatedWidth);
      const panelHeight = Math.min(viewHeight - 20, headerHeight + rowsPerColumn * rowHeight + padding * 2);
      const panelX = Math.max(padding, viewWidth - panelWidth - rightMargin);
      const panelY = baselineY; // Aligned to same baseline as HUD

      ctx.save();
      
      // Draw dashboard background with higher opacity
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
      ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
      ctx.strokeStyle = "rgba(0, 255, 136, 0.6)";
      ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);

      // Draw header text with shadow for readability
      const titleY = panelY + padding + 15; // Title baseline
      const headerRowY = titleY + 18; // Header row below title with spacing
      
      ctx.font = "13px ui-mono, monospace";
      ctx.fillStyle = "#00ff88";
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 2;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillText(`Agent dashboard (${agents.length})`, panelX + padding, titleY);
      
      // Draw header row with fixed column alignment
      ctx.font = "12px ui-mono, monospace";
      ctx.fillStyle = "#d0ffd8";
      
      // Add shadow to header for readability
      ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
      ctx.shadowBlur = 1;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      
      const drawHeaderRow = (startX, startY) => {
        let x = startX;
        ctx.fillText("vis", x, startY);
        x += colWidths.vis;
        ctx.fillText("ID", x, startY);
        x += colWidths.id;
        ctx.fillText("chi", x, startY);
        x += colWidths.chi;
        ctx.fillText("credits", x, startY);
        x += colWidths.cr;
        ctx.fillText("Frust", x, startY);
        x += colWidths.f;
        ctx.fillText("Hunger", x, startY);
        x += colWidths.h;
        ctx.fillText("sense", x, startY);
        x += colWidths.sense;
        ctx.fillText("control", x, startY);
      };
      
      // Draw header for each column
      for (let col = 0; col < columns; col++) {
        const headerX = panelX + padding + col * singleColumnWidth;
        drawHeaderRow(headerX, headerRowY);
      }
      
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      const contentY = headerRowY + 20; // Start content below header with spacing

      agents.forEach((bundle, index) => {
        const column = Math.floor(index / rowsPerColumn);
        const row = index % rowsPerColumn;
        const rowBaseX = panelX + padding + column * singleColumnWidth;
        const rowY = contentY + row * rowHeight;
        if (rowY > panelY + panelHeight - padding) return;

        const aliveIcon = bundle.alive ? "✓" : "✗";
        const visibilityIcon = bundle.visible ? "👁" : "🚫";
        const frustrationPct = Math.round(clamp(bundle.frustration, 0, 1) * 100).toString().padStart(3, " ");
        const hungerPct = Math.round(clamp(bundle.hunger, 0, 1) * 100).toString().padStart(3, " ");
        const chiStr = bundle.chi.toFixed(1).padStart(5, " ");
        const creditStr = Ledger.getCredits(bundle.id).toFixed(1).padStart(5, " ");
        const senseStr = Math.round(bundle.currentSensoryRange || 0).toString().padStart(3, " ");
        const controllerLabel = getControllerBadge(bundle, index); // No truncation
        const idLabel = `A${bundle.id.toString().padStart(2, "0")}`;

        ctx.fillStyle = bundle.alive ? getAgentColor(bundle.id, true) : "#777777";
        
        // Add text shadow for readability
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Draw each field with fixed column alignment
        let x = rowBaseX;
        ctx.fillText(`${visibilityIcon}${aliveIcon}`, x, rowY);
        x += colWidths.vis;
        ctx.fillText(idLabel, x, rowY);
        x += colWidths.id;
        ctx.fillText(`χ${chiStr}`, x, rowY);
        x += colWidths.chi;
        ctx.fillText(`cr${creditStr}`, x, rowY);
        x += colWidths.cr;
        ctx.fillText(`F${frustrationPct}%`, x, rowY);
        x += colWidths.f;
        ctx.fillText(`H${hungerPct}%`, x, rowY);
        x += colWidths.h;
        ctx.fillText(`s${senseStr}`, x, rowY);
        x += colWidths.sense;
        ctx.fillText(controllerLabel, x, rowY);
        
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      });

      const totalCapacity = rowsPerColumn * columns;
      if (totalCapacity < agents.length) {
        ctx.font = "11px ui-mono, monospace";
        ctx.fillStyle = "#ffaa88";
        ctx.shadowColor = "rgba(0, 0, 0, 0.8)";
        ctx.shadowBlur = 1;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.fillText(`showing ${totalCapacity} of ${agents.length} agents`, panelX + padding, panelY + panelHeight - padding);
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.restore();
    }

    // ---------- Main loop ----------
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
  
      if (!World.paused) {
        const tcEnabled = TcScheduler.getConfig().enabled;
        const beginTick = tcEnabled ? TcScheduler.beginTick({
          tick: globalTick,
          dt,
          mode: learningMode,
          scheduler: 'play',
          world: World
        }) : null;
        let tickContext = beginTick;
        try {
          Trail.captureSnapshot(); // fair residuals (prev frame)
          if (CONFIG.signal.enabled) {
            SignalField.captureSnapshot();
          }
          if (tcEnabled) TcScheduler.runPhase('capture', tickContext);

          // Link formation pass (cheap local heuristic)
          for (let i = 0; i < World.bundles.length; i++) {
            for (let j = i + 1; j < World.bundles.length; j++) {
              const a = World.bundles[i];
              const b = World.bundles[j];
              if (!a.alive || !b.alive) continue;
              tryFormLink(a, b);
            }
          }

          // Update each bundle with nearest resource
          World.bundles.forEach(b => {
            const nearestResource = World.getNearestResource(b);
            b.update(dt, nearestResource);
          });

          if (tcEnabled) TcScheduler.runPhase('compute', tickContext);

          // Link maintenance & decay, use-based strengthening
          maintainLinks(dt);

          Trail.step(dt);
          if (CONFIG.signal.enabled) {
            SignalField.step(dt);
          }

          // Trail reinforcement along active links
          reinforceLinks(dt);

          // Update resource ecology (carrying capacity dynamics)
          World.updateEcology(dt);

          // Consumable scent gradient: orbiting erodes, absence recovers
          if (CONFIG.scentGradient.consumable) {
            const orbitBand = CONFIG.scentGradient.orbitBandPx;
            const minStrength = CONFIG.scentGradient.minStrength;
            const minRange = CONFIG.scentGradient.minRange;
            const baseStrength = CONFIG.scentGradient.strength;
            const baseRange = CONFIG.scentGradient.maxRange;
            const consumeRate = CONFIG.scentGradient.consumePerSec * dt;
            const recoverRate = CONFIG.scentGradient.recoverPerSec * dt;

            for (const res of World.resources) {
              if (!res.visible) continue;
              // Find nearest alive agent distance
              let nearest = Infinity;
              for (const b of World.bundles) {
                if (!b.alive) continue;
                const d = Math.hypot(res.x - b.x, res.y - b.y);
                if (d < nearest) nearest = d;
              }
              // Inside orbit band (outside core radius)
              const inner = res.r;
              const outer = res.r + orbitBand;
              if (nearest > inner && nearest <= outer) {
                const t = 1 - (nearest - inner) / Math.max(1e-6, outer - inner); // 0..1 closer => bigger
                const use = t * t; // quadratic for stronger close-in consumption
                res.scentStrength = Math.max(minStrength, res.scentStrength - consumeRate * use);
                // Optionally tie range to strength fraction
                const frac = res.scentStrength / baseStrength;
                const targetRange = Math.max(minRange, baseRange * frac);
                // Smoothly relax toward target
                res.scentRange += (targetRange - res.scentRange) * 0.5;
              } else {
                // Recover when no close orbiters
                res.scentStrength = Math.min(baseStrength, res.scentStrength + recoverRate);
                res.scentRange = Math.min(baseRange, res.scentRange + (baseRange - res.scentRange) * 0.1);
              }
            }
          }
        
        // Clean up expired lineage links
        World.cleanupLineageLinks();

        // Agent collision detection and separation
        if (CONFIG.enableAgentCollision) {
          for (let i = 0; i < World.bundles.length; i++) {
            for (let j = i + 1; j < World.bundles.length; j++) {
              const a = World.bundles[i];
              const b = World.bundles[j];
              
              // Skip if either agent is dead
              if (!a.alive || !b.alive) continue;
              
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const dist = Math.hypot(dx, dy);
              const minDist = a.size; // Both agents same size
              
              if (dist < minDist && dist > 0.001) {
                // Overlapping! Push them apart
                const overlap = minDist - dist;
                const nx = dx / dist; // Normalized direction
                const ny = dy / dist;
                
                // Push each agent away by half the overlap
                const pushStrength = CONFIG.agentCollisionPushback;
                a.x -= nx * overlap * pushStrength;
                a.y -= ny * overlap * pushStrength;
                b.x += nx * overlap * pushStrength;
                b.y += ny * overlap * pushStrength;
                
                // Keep agents in bounds after collision
                const half = a.size / 2;
                a.x = clamp(a.x, half, canvasWidth - half);
                a.y = clamp(a.y, half, canvasHeight - half);
                b.x = clamp(b.x, half, canvasWidth - half);
                b.y = clamp(b.y, half, canvasHeight - half);
              }
            }
          }
        }

        // Resource collection - check all resources for each bundle
        World.bundles.forEach(b => {
          if (!b.alive) return;
          
          for (let res of World.resources) {
            // Only collect if resource is visible (not on cooldown)
            if (res.visible && b.overlapsResource(res)) {
              const rewardChi = CONFIG.rewardChi;
              b.chi += rewardChi;
              b.alive = true;
              b.lastCollectTick = globalTick;
              b.frustration = 0;
              // Eating reduces hunger significantly
              b.hunger = Math.max(0, b.hunger - CONFIG.hungerDecayOnCollect);
              // Reset decay state (in case agent was dead/decaying)
              b.deathTick = -1;
              b.decayProgress = 0;
              const rewardSignal = normalizeRewardSignal(rewardChi);
              if (rewardSignal > 0) {
                b.emitSignal('resource', rewardSignal, { absolute: true, x: b.x, y: b.y });
              }
              World.collected += 1;
              World.onResourceCollected(); // Track ecology impact

              // Deplete fertility at harvest location (plant ecology)
              if (CONFIG.plantEcology.enabled && FertilityField) {
                FertilityField.depleteAt(res.x, res.y, globalTick);
              }
              
              // Start cooldown instead of immediate respawn
              res.startCooldown();
              break; // Only collect one resource per frame
            }
          }
        });
        
        // Update resources (aging)
        World.resources.forEach(res => res.update(dt));
        
        // Plant Ecology: Seed dispersal and spontaneous growth
        if (CONFIG.plantEcology.enabled && FertilityField) {
          // Calculate dynamic resource limit based on living agents (INVERSE: more agents = less food)
          let maxResources = CONFIG.resourceStableMax;
          const aliveCount = World.bundles.filter(b => b.alive).length;

          if (CONFIG.resourceScaleWithAgents) {
            const spawnPressure = CONFIG.plantEcology.spawnPressure;
            const minResourceMultiplier = spawnPressure?.minResourceMultiplier ?? spawnPressure?.minSeedMultiplier ?? 1;
            const pressureMultiplier = getSpawnPressureMultiplier(aliveCount, minResourceMultiplier);
            const targetAbundance = CONFIG.resourceBaseAbundance * pressureMultiplier;
            maxResources = Math.floor(
              clamp(
                targetAbundance,
                CONFIG.resourceScaleMinimum,
                CONFIG.resourceScaleMaximum
              )
            );
          }

          if (World.resources.length > maxResources) {
            const excess = World.resources.length - maxResources;
            World.resources.splice(-excess, excess);
            console.log(`🔪 Culled ${excess} excess resources due to competition (${aliveCount} agents)`);
          }

          // Seed dispersal (resources spawn near existing ones)
          const seedLocation = attemptSeedDispersal(World.resources, FertilityField, globalTick, dt, aliveCount);
          if (seedLocation && World.resources.length < maxResources) {
            const newResource = new Resource(seedLocation.x, seedLocation.y, CONFIG.resourceRadius);
            World.resources.push(newResource);
            console.log(`🌱 Seed sprouted at (${Math.round(seedLocation.x)}, ${Math.round(seedLocation.y)}) | Fertility: ${seedLocation.fertility.toFixed(2)}`);
          }

          // Spontaneous growth (resources appear in fertile soil)
          const growthLocation = attemptSpontaneousGrowth(FertilityField, dt, aliveCount);
          if (growthLocation && World.resources.length < maxResources) {
            const newResource = new Resource(growthLocation.x, growthLocation.y, CONFIG.resourceRadius);
            World.resources.push(newResource);
            console.log(`🌿 Spontaneous growth at (${Math.round(growthLocation.x)}, ${Math.round(growthLocation.y)}) | Fertility: ${growthLocation.fertility.toFixed(2)}`);
          }

          // Update fertility grid (recovery + population pressure)
          FertilityField.update(dt, aliveCount, globalTick);
        }

        // Mitosis - agents attempt reproduction (only in play mode, not during training)
        if (learningMode === 'play') {
          // Use traditional for loop to avoid issues with array modification during iteration
          const currentBundles = [...World.bundles]; // Copy array
          currentBundles.forEach(b => {
            if (b.alive) {
              b.attemptMitosis();
            }
          });
        }

        // Decay - dead agents decay and recycle chi into fertility
        if (CONFIG.decay.enabled) {
          try {
            // Update decay for all dead agents and mark fully decayed ones for removal
            const toRemove = [];
            World.bundles.forEach((b, idx) => {
              try {
                const fullyDecayed = b.updateDecay(dt, FertilityField);
                if (fullyDecayed) {
                  toRemove.push(idx);
                }
              } catch (err) {
                console.error(`Error updating decay for agent ${b.id}:`, err);
              }
            });
            
            // Remove fully decayed agents (iterate backwards to avoid index shifts)
            for (let i = toRemove.length - 1; i >= 0; i--) {
              const idx = toRemove[i];
              if (idx >= 0 && idx < World.bundles.length) {
                const removed = World.bundles.splice(idx, 1)[0];
                console.log(`💀 Agent ${removed.id} fully decayed and removed | Pop: ${World.bundles.length}`);
              }
            }
          } catch (err) {
            console.error('Error in decay system:', err);
          }
          }

          if (tcEnabled) TcScheduler.runPhase('commit', tickContext);
          globalTick++;
          if (globalTick - lastSignalStatTick >= 30) {
            lastSignalStatTick = globalTick;
            const fieldStats = typeof SignalField.getStats === 'function' ? SignalField.getStats() : null;
            const responseSummary = SignalResponseAnalytics.getSummary();
            if (window.trainingUI && typeof window.trainingUI.updateSignalStats === 'function') {
              const snr = fieldStats?.snr ?? [];
              const totalPower = fieldStats?.totalPower ?? [];
              const channelCount = fieldStats?.channels ?? (SignalField.channelCount || 0);
              window.trainingUI.updateSignalStats({
                channelCount,
                diversity: fieldStats?.diversity ?? 0,
                snr,
                totalPower,
                coherence: responseSummary?.coherence ?? 0,
                perChannel: responseSummary?.perChannel ?? {}
              });
            }
          }
        } catch (err) {
          console.error('Critical error in main loop (tick ' + globalTick + '):', err);
          console.error('Stack trace:', err.stack);
          // Don't pause - let simulation continue
        } finally {
          if (tcEnabled && tickContext) {
            TcScheduler.endTick(tickContext);
          }
        }
      }
  
      // draw
      ctx.fillStyle = "#000"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw fertility visualization if enabled (below trails)
      if (showFertility && CONFIG.plantEcology.enabled && FertilityField) {
        FertilityField.draw(ctx);
      }

      if (CONFIG.signal.enabled) {
        SignalField.draw(ctx);
      }
      Trail.draw();
      
      // Draw links (debug visualization)
      (function drawLinks() {
        if (!Links.length) return;
        ctx.save();
        ctx.globalAlpha = 0.6;
        for (const L of Links) {
          const a = getBundleById(L.aId);
          const b = getBundleById(L.bId);
          if (!a || !b) continue;
          const color = getAgentColor(L.aId, true);
          ctx.strokeStyle = color;
          ctx.lineWidth = Math.max(1, L.strength * 2);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        ctx.restore();
      })();
      
      // Draw lineage links (parent-child connections)
      if (CONFIG.mitosis.showLineage) {
        drawLineageLinks(ctx);
      }
      
      // Draw all resources (only visible ones)
      World.resources.forEach(res => {
        if (res.visible) {
          res.draw(ctx);
        }
      });
      
      World.bundles.forEach(b => b.draw(ctx));
      
      drawHUD();
      
      // Draw Rule 110 overlay LAST (on top of everything including HUD)
      // Note: showOverlay can be enabled independently of tcResourceIntegration for debugging
      if (CONFIG.tcResourceIntegration?.showOverlay && window.rule110Stepper) {
        drawRule110Overlay(ctx, window.rule110Stepper, canvasWidth, canvasHeight);
      }
  
      requestAnimationFrame(loop);
    }
    
    // ---------- Training System Integration ----------
    
    /**
     * Run one episode with a given policy
     * Returns total reward (combined from all agents)
     */
    async function runEpisode(policy) {
      // Reset world for fresh episode
      World.reset();
      episodeManager.startEpisode();
      
      // Set ALL bundles to use this policy (shared policy multi-agent learning!)
      World.bundles.forEach(bundle => {
        bundle.controller = policy;
        bundle.useController = true;
        bundle.rewardTracker.reset();
      });
      
      // Reset ledger for provenance tracking
      Ledger.credits = {};
      
      let totalReward = 0;
      let episodeTicks = 0;
      const maxTicks = CONFIG.learning.episodeLength;
      
      // Run episode (continue while ANY agent is alive)
      while (episodeTicks < maxTicks && World.bundles.some(b => b.alive)) {
        const dt = 1/60; // Fixed timestep for training
        const tcEnabled = TcScheduler.getConfig().enabled;
        const beginTick = tcEnabled ? TcScheduler.beginTick({
          tick: globalTick,
          dt,
          mode: 'train',
          scheduler: 'episode',
          world: World
        }) : null;
        let tickContext = beginTick;
        try {
          // Capture snapshot for fair trail sampling
          Trail.captureSnapshot();
          if (CONFIG.signal.enabled) {
            SignalField.captureSnapshot();
          }
          if (tcEnabled) TcScheduler.runPhase('capture', tickContext);

          // Update BOTH agents
          let totalChiSpent = 0;
          let totalCollected = 0;

          for (let i = 0; i < World.bundles.length; i++) {
          const bundle = World.bundles[i];
          if (!bundle.alive) continue; // Skip dead agents

          // Track chi before update
          const chiBeforeUpdate = bundle.chi;

          // Update bundle with nearest resource
          const nearestResource = World.getNearestResource(bundle);
          bundle.update(dt, nearestResource);

          // Calculate chi spent
          const chiSpent = Math.max(0, chiBeforeUpdate - bundle.chi);
          totalChiSpent += chiSpent;

          // Check resource collection - check all resources
          let collectedResource = false;

          for (let res of World.resources) {
            // Only collect if resource is visible (not on cooldown)
            if (bundle.alive && res.visible && bundle.overlapsResource(res)) {
              // === Adaptive Reward Calculation ===
              let rewardChi;
              
              if (CONFIG.adaptiveReward?.enabled) {
                // Update EMA and get adaptive reward
                const dtFind = updateFindTimeEMA(World);
                rewardChi = calculateAdaptiveReward(World.avgFindTime);
                
                // Update stats
                World.rewardStats.totalRewards += rewardChi;
                World.rewardStats.avgRewardGiven = World.rewardStats.totalRewards / (World.collected + 1);
                
                // Log for debugging (every 10 collections)
                if (World.collected % 10 === 0 && World.collected > 0) {
                  console.log(`[Adaptive Reward] Find #${World.collected}: ` +
                              `dt=${dtFind.toFixed(2)}s, ` +
                              `avgT=${World.avgFindTime.toFixed(2)}s, ` +
                              `reward=${rewardChi.toFixed(2)}χ`);
                }
              } else {
                // Fallback to fixed reward
                rewardChi = CONFIG.rewardChi;
              }
              
              bundle.chi += rewardChi;
              bundle.alive = true;
              bundle.lastCollectTick = globalTick;
              bundle.frustration = 0;
              // Eating reduces hunger significantly
              bundle.hunger = Math.max(0, bundle.hunger - CONFIG.hungerDecayOnCollect);
              // Reset decay state (in case agent was dead/decaying)
              bundle.deathTick = -1;
              bundle.decayProgress = 0;
              const rewardSignal = normalizeRewardSignal(rewardChi);
              if (rewardSignal > 0) {
                bundle.emitSignal('resource', rewardSignal, { absolute: true, x: bundle.x, y: bundle.y });
              }
              World.collected += 1;
              World.onResourceCollected(); // Track ecology impact
              // Start cooldown instead of immediate respawn
              res.startCooldown();
              collectedResource = true;
              totalCollected++;
              break; // Only collect one resource per frame
            }
          }
          
          // Compute reward for this agent
          const provenanceCredit = Ledger.getCredits(bundle.id);
          const stepReward = bundle.rewardTracker.computeStepReward(
            collectedResource,
            chiSpent,
            provenanceCredit,
            World.resources  // Pass resources for gradient climbing reward
          );
          totalReward += stepReward;
        }

          if (tcEnabled) TcScheduler.runPhase('compute', tickContext);

          // Update trail field (shared environment)
          Trail.step(dt);
          if (CONFIG.signal.enabled) {
            SignalField.step(dt);
          }

          if (tcEnabled) TcScheduler.runPhase('commit', tickContext);

          globalTick++;
          episodeTicks++;

          // Yield to browser occasionally to keep UI responsive
          if (episodeTicks % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        } finally {
          if (tcEnabled && tickContext) {
            TcScheduler.endTick(tickContext);
          }
        }
      }
      
      // Add death penalties for agents that died
      for (const bundle of World.bundles) {
        if (!bundle.alive && episodeTicks < maxTicks) {
          totalReward += CONFIG.learning.rewards.death;
        }
      }
      
      const summary = episodeManager.endEpisode(World.bundles[0].rewardTracker);
      return totalReward;
    }
    
    /**
     * Initialize Training Manager
     */
    function initializeTrainingManager() {
      trainingManager = new TrainingManager(
        learner,
        () => World.reset(),
        (policy) => runEpisode(policy)
      );
    }
    
    /**
     * Initialize Training UI and callbacks
     */
    function initializeTrainingUI() {
      const ui = new TrainingUI(document.body);
      window.trainingUI = ui; // Make globally accessible
      
      // Mode change
      ui.on('onModeChange', (mode) => {
        learningMode = mode;
        if (mode === 'train') {
          console.log('Switched to Training Mode');
          World.bundles.forEach(b => b.useController = true);
        } else {
          console.log('Switched to Play Mode');
          World.bundles.forEach(b => b.useController = false);
        }
      });
      
      // Start training
      ui.on('onStartTraining', async (numGenerations) => {
        if (!trainingManager) initializeTrainingManager();
        
        stopTrainingFlag = false; // Reset flag
        
        console.log(`🤝 Multi-Agent Training Starting: ALL ${World.bundles.length} agents use shared policy`);
        console.log(`   Episode reward = Sum of all agent rewards`);
        console.log(`   Agents can learn cooperation via trails and provenance credits!`);
        
        ui.updateStats({
          status: 'Multi-Agent Training...',
          generation: learner.generation,
          populationSize: CONFIG.learning.populationSize
        });
        
        World.paused = true; // Pause visualization during training
        
        for (let gen = 0; gen < numGenerations; gen++) {
          // Check stop flag
          if (stopTrainingFlag) {
            console.log('Training stopped by user');
            break;
          }
          
          const result = await trainingManager.runGeneration();
          
          // Update UI
          ui.updateStats({
            status: `Gen ${result.generation}/${numGenerations}`,
            generation: result.generation,
            bestReward: result.bestReward,
            meanReward: result.meanReward,
            currentPolicy: trainingManager.currentPolicy,
            populationSize: CONFIG.learning.populationSize
          });
          
          // Update chart
          const stats = learner.getStats();
          if (stats) {
            ui.drawLearningCurve(stats.history);
          }
          
          console.log(`Gen ${result.generation}: best=${result.bestReward.toFixed(2)}, mean=${result.meanReward.toFixed(2)}`);
        }
        
        ui.updateStats({
          status: stopTrainingFlag ? 'Training Stopped' : 'Training Complete!',
          generation: learner.generation,
          bestReward: learner.bestReward,
          populationSize: CONFIG.learning.populationSize
        });
        
        World.paused = false;
        
        document.getElementById('start-training').disabled = false;
        document.getElementById('stop-training').disabled = true;
      });
      
      // Stop training
      ui.on('onStopTraining', () => {
        stopTrainingFlag = true;
        if (trainingManager) {
          trainingManager.stop();
        }
        World.paused = false;
        console.log('Stop training requested');
      });
      
      // Reset learner
      ui.on('onResetLearner', () => {
        learner.generation = 0;
        learner.bestReward = -Infinity;
        learner.bestWeights = null;
        learner.history = [];
        learner.mu = new Array(learner.weightDims).fill(0);
        learner.sigma = new Array(learner.weightDims).fill(CONFIG.learning.mutationStdDev);
        
        ui.updateStats({
          status: 'Learner Reset',
          generation: 0,
          bestReward: 0,
          meanReward: 0
        });
        
        ui.drawLearningCurve([]);
        
        console.log('Learner reset to initial state');
      });
      
      // Save policy
      ui.on('onSavePolicy', () => {
        const state = learner.save();
        const json = JSON.stringify(state, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `slime-policy-gen${learner.generation}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('Policy saved!');
      });
      
      // Load policy
      ui.on('onLoadPolicy', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const state = JSON.parse(e.target.result);
                learner.load(state);
                
                // Store loaded policy info
                loadedPolicyInfo = {
                  filename: file.name,
                  generation: learner.generation,
                  bestReward: learner.bestReward,
                  timestamp: new Date().toLocaleString()
                };
                
                // Update UI
                ui.updateStats({
                  status: 'Policy Loaded!',
                  generation: learner.generation,
                  bestReward: learner.bestReward
                });
                ui.drawLearningCurve(learner.history);
                ui.showLoadedPolicyInfo(file.name, learner.generation, learner.bestReward);
                
                console.log(`Policy loaded: ${file.name} (Gen ${learner.generation}, Reward: ${learner.bestReward.toFixed(2)})`);
              } catch (err) {
                console.error('Failed to load policy:', err);
                alert('Failed to load policy file');
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      });
      
      // Test best policy
      ui.on('onTestPolicy', () => {
        const bestPolicy = learner.getBestPolicy();
        if (bestPolicy) {
          World.reset();
          // Apply policy to ALL agents
          World.bundles.forEach(bundle => {
            bundle.controller = bestPolicy;
            bundle.useController = true;
          });
          learningMode = 'play';
          const infoStr = loadedPolicyInfo 
            ? `${loadedPolicyInfo.filename} (Gen ${loadedPolicyInfo.generation})`
            : `current best (Gen ${learner.generation})`;
          console.log(`Testing policy (ALL ${World.bundles.length} AGENTS): ${infoStr}`);
        } else {
          alert('No trained policy available yet!');
        }
      });
      
      // Use loaded policy (same as test, but clearer)
      ui.on('onUsePolicy', () => {
        const bestPolicy = learner.getBestPolicy();
        if (bestPolicy) {
          World.reset();
          // Apply policy to ALL agents (multi-agent!)
          World.bundles.forEach(bundle => {
            bundle.controller = bestPolicy;
            bundle.useController = true;
          });
          learningMode = 'play';
          
          // Enable action display for debugging
          CONFIG.hud.showActions = true;
          
          if (loadedPolicyInfo) {
            console.log(`Using loaded policy (ALL ${World.bundles.length} AGENTS): ${loadedPolicyInfo.filename} (Gen ${loadedPolicyInfo.generation}, Reward: ${loadedPolicyInfo.bestReward.toFixed(2)})`);
            console.log(`💡 Tip: Watch all agents' actions (T=turn, P=thrust, S=sense) with yellow borders.`);
            console.log(`🤝 Multi-agent: All agents use the same policy and can learn from each other's trails!`);
          } else {
            console.log(`Using current best policy (ALL ${World.bundles.length} AGENTS, Gen ${learner.generation})`);
          }
        } else {
          alert('No policy loaded yet!');
        }
      });
      
      console.log('Training UI initialized. Press [L] to toggle.');
    }
    
    // Initialize training UI when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeTrainingUI);
    } else {
      initializeTrainingUI();
    }
    
    // Start main loop
    requestAnimationFrame(loop);
  })();
  