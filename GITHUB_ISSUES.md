# Emergence Engine - GitHub Issues

This document contains a comprehensive list of issues, improvements, and technical debt identified during a code review of the Emergence Engine project. Each issue is formatted for easy copy-paste into GitHub Issues.

---

## 🏗️ Architecture & Code Organization

### Issue #1: Refactor app.js - File Too Large (2173 lines)

**Priority:** High  
**Type:** Refactoring  
**Labels:** `technical-debt`, `architecture`, `refactoring`

**Description:**
The main `app.js` file is extremely large (2173 lines), making it difficult to navigate, maintain, and test. This violates the Single Responsibility Principle and makes the codebase harder to understand for new contributors.

**Current State:**
- app.js contains initialization, rendering, game loop, HUD, UI, trail systems, fertility grids, and more
- Mixing concerns makes debugging and testing difficult
- Hard to track dependencies and data flow

**Proposed Solution:**
Break app.js into smaller, focused modules:
1. `app/initialization.js` - Setup and bootstrap
2. `app/rendering.js` - Draw functions and rendering pipeline
3. `app/gameLoop.js` - Main simulation loop
4. `app/hud.js` - HUD and dashboard rendering
5. `app/trails.js` - Trail system management
6. Keep `app.js` as a thin orchestration layer

**Benefits:**
- Easier to test individual components
- Better code organization and maintainability
- Reduced cognitive load when reading code
- Easier to onboard new contributors

---

### Issue #2: Refactor config.js - Configuration File Too Large (1764 lines)

  **Priority:** Medium  
  **Type:** Refactoring  
  **Labels:** `technical-debt`, `configuration`, `refactoring`

  **Description:**
  `config.js` is 1764 lines long and contains configuration, schema definitions, UI building code, and snapshot management. This file should be split into multiple focused modules.

  **Current State:**
  - CONFIG object mixed with CONFIG_SCHEMA and CONFIG_HINTS
  - UI panel building code embedded in config file
  - Profile management code in config file
  - Makes finding and changing configuration difficult

  **Proposed Solution:**
  Split into:
  1. `config/defaults.js` - Default CONFIG object only
  2. `config/schema.js` - CONFIG_SCHEMA definitions
  3. `config/hints.js` - CONFIG_HINTS for tooltips
  4. `config/profiles.js` - Profile loading/saving logic
  5. `config/panel.js` - UI panel building code
  6. `config/manager.js` - ConfigIO and orchestration

  **Benefits:**
  - Easier to find and modify configuration values
  - Separates data from behavior
  - Easier to test configuration logic
  - Better for code splitting and tree-shaking

---

### Issue #3: Add package.json for Dependency Management

**Priority:** High  
**Type:** Enhancement  
**Labels:** `dependencies`, `tooling`, `documentation`

**Description:**
The project currently has no `package.json` file, making it unclear what dependencies are needed, what versions are compatible, and how to run tests or development scripts.

**Problems:**
- No clear dependency list for contributors
- No npm scripts for common tasks
- No version management for dependencies
- Unclear how to set up development environment

**Proposed Solution:**
Create a `package.json` with:
```json
{
  "name": "emergence-engine",
  "version": "0.6.0",
  "type": "module",
  "description": "Browser-based sandbox for emergent agent behavior",
  "scripts": {
    "test": "node --test test/**/*.test.js",
    "test:watch": "node --test --watch test/**/*.test.js",
    "dev": "npx http-server -p 8080",
    "lint": "eslint .",
    "format": "prettier --write ."
  },
  "dependencies": {
    "pixi.js": "^7.0.0"
  },
  "devDependencies": {
    "eslint": "^8.0.0",
    "prettier": "^3.0.0",
    "http-server": "^14.0.0"
  }
}
```

**Benefits:**
- Clear dependency documentation
- Standardized development workflow
- Easier for contributors to get started
- Enable automated tooling

---

## 🧪 Testing & Quality

### Issue #4: Improve Test Coverage - Only 8 Test Files

**Priority:** High  
**Type:** Testing  
**Labels:** `testing`, `quality`, `good-first-issue`

**Description:**
The project has minimal test coverage with only 8 test files covering a small fraction of the codebase. Many critical systems lack tests entirely.

**Current Coverage:**
- ✅ movement.test.js
- ✅ mitosis.test.js
- ✅ metabolism.test.js
- ✅ sensing.test.js
- ✅ steering.test.js
- ✅ decay.test.js
- ✅ resourceSystem.test.js
- ✅ controllerAction.test.js

**Missing Tests:**
- ❌ Bundle class (src/core/bundle.js - 892+ lines!)
- ❌ World class (src/core/world.js)
- ❌ Trail system
- ❌ Signal field
- ❌ Fertility grid
- ❌ Controllers (controllers.js)
- ❌ Learner/CEM (learner.js)
- ❌ Rewards system (rewards.js)
- ❌ Observations (observations.js)
- ❌ Configuration management
- ❌ TC systems (Rule 110, Turing machines)

**Proposed Action:**
1. Add integration tests for core simulation loop
2. Add unit tests for Bundle and World classes
3. Add tests for learning/training systems
4. Set up code coverage reporting (e.g., c8, nyc)
5. Add CI to run tests on every commit
6. Aim for 70%+ coverage on core systems

**Benefits:**
- Catch regressions early
- Enable confident refactoring
- Document expected behavior
- Improve code quality

---

### Issue #5: Add ESLint Configuration

**Priority:** Medium  
**Type:** Tooling  
**Labels:** `tooling`, `code-quality`, `good-first-issue`

**Description:**
No ESLint configuration exists, leading to inconsistent code style, potential bugs, and harder code review.

**Proposed Solution:**
Create `.eslintrc.json`:
```json
{
  "env": {
    "browser": true,
    "es2022": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "off",
    "prefer-const": "warn",
    "no-var": "error"
  }
}
```

**Benefits:**
- Catch common errors before runtime
- Enforce consistent code style
- Improve code quality automatically
- Better IDE integration

---

### Issue #6: Add Prettier for Code Formatting

**Priority:** Low  
**Type:** Tooling  
**Labels:** `tooling`, `code-quality`, `good-first-issue`

**Description:**
No code formatting standard exists, leading to inconsistent indentation, line lengths, and styling.

**Proposed Solution:**
Create `.prettierrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always"
}
```

**Benefits:**
- No more debates about formatting
- Automatic formatting on save
- Consistent codebase style
- Easier code review (focus on logic, not style)

---

## 🔒 Code Quality & Best Practices

### Issue #7: Add .gitignore File

**Priority:** Medium  
**Type:** Configuration  
**Labels:** `tooling`, `good-first-issue`

**Description:**
No `.gitignore` file exists, which could lead to accidentally committing sensitive files, dependencies, or build artifacts.

**Proposed .gitignore:**
```gitignore
# Dependencies
node_modules/
package-lock.json
yarn.lock

# Environment variables
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Build output
dist/
build/
*.log

# Testing
coverage/
.nyc_output/

# Temporary files
tmp/
temp/
*.tmp
```

---

### Issue #8: Fix Observation Vector Dimension Hardcoding

**Priority:** Medium  
**Type:** Bug  
**Labels:** `bug`, `learning-system`

**Description:**
Observation vector dimensions are hardcoded as magic numbers in multiple places (15, 23, 29), creating maintenance issues and potential bugs when dimensions change.

**Locations:**
- `controllers.js:125` - `observationDims = 15`
- `learner.js:18` - `observationDims = 15`
- `observations.js:11` - Comments say 29 dims
- `config.js:421` - `observationDims: 23`
- `app.js:682` - `new CEMLearner(23, 3)`

**Problems:**
- Inconsistent values across files
- Easy to forget updating all locations
- Comments out of sync with code
- Hard to track actual dimension count

**Proposed Solution:**
1. Create a single source of truth in config:
```javascript
// config.js
export const OBSERVATION_DIMS = {
  chi: 3,        // chi_norm, frustration, alive
  motion: 2,     // vx, vy
  walls: 3,      // nx, ny, edge_mag
  resource: 3,   // dx, dy, visible
  trail: 4,      // mean, max, dirX, dirY
  scent: 3,      // intensity, gradX, gradY
  density: 5,    // near, mid, far, dirX, dirY
  signal: 6,     // resource, distress, bond, bias_res, bias_distress, bias_bond
  get total() {
    return this.chi + this.motion + this.walls + this.resource + 
           this.trail + this.scent + this.density + this.signal;
  }
};
```

2. Use `OBSERVATION_DIMS.total` everywhere instead of hardcoded numbers

**Benefits:**
- Single source of truth
- Self-documenting code
- Easy to add/remove observation features
- Prevents dimension mismatch bugs

---

### Issue #9: Remove Magic Numbers Throughout Codebase

**Priority:** Medium  
**Type:** Refactoring  
**Labels:** `code-quality`, `refactoring`, `good-first-issue`

**Description:**
Many magic numbers exist throughout the codebase without explanation or named constants.

**Examples:**
- `app.js:287` - `SIGNAL_RESOURCE_PULL_GAIN = 2.5` (good!)
- `app.js:465` - `(hue * 137.5) % 360` - Golden angle, should be named
- `app.js:1388` - `hudWidth = 175` - Should be CONFIG constant
- `bundle.js:97` - `this.tailFadeTicks = 25` - Should be CONFIG
- `rewards.js:155` - `if (this.stuckTicks > 30)` - Should be CONFIG
- `observations.js:122` - `const margin = 50` - Should be CONFIG

**Proposed Solution:**
Add named constants to CONFIG or create local constants with descriptive names:
```javascript
const GOLDEN_ANGLE_DEGREES = 137.5; // Used for color distribution
const HUD_DEFAULT_WIDTH = 175;
const TRAIL_FADE_TICKS = 25;
const STUCK_THRESHOLD_TICKS = 30;
const WALL_AVOIDANCE_MARGIN = 50;
```

**Benefits:**
- Self-documenting code
- Easier to tune parameters
- No guessing about what numbers mean
- Easier to maintain

---

### Issue #10: Add JSDoc Documentation

**Priority:** Medium  
**Type:** Documentation  
**Labels:** `documentation`, `code-quality`

**Description:**
Many functions lack JSDoc documentation, making it difficult to understand parameters, return values, and behavior without reading implementation.

**Examples Needing Documentation:**
- `controllers.js` - All controller classes
- `learner.js` - CEM algorithm details
- `src/systems/movement.js` - Movement calculations
- `src/systems/steering.js` - Steering behavior
- `bundle.js` - Bundle class methods
- Most utility functions

**Good Examples in Code:**
- `rewards.js:7-14` - Good JSDoc on calculateAdaptiveReward
- `observations.js:7-20` - Good structure documentation

**Proposed Solution:**
Add comprehensive JSDoc to all public functions and classes:
```javascript
/**
 * Compute agent movement for one timestep
 * @param {Object} params - Movement parameters
 * @param {Object} params.position - Current position {x, y}
 * @param {Object} params.velocity - Current velocity {vx, vy}
 * @param {number} params.dt - Delta time in seconds
 * @param {number} params.size - Agent size for collision
 * @param {number} params.canvasWidth - World width for clamping
 * @param {number} params.canvasHeight - World height for clamping
 * @returns {Object} Result with {position, movedDist, chiCost, deposits}
 */
export function computeMovement(params) { ... }
```

**Benefits:**
- Better IDE autocomplete
- Self-documenting code
- Easier for new contributors
- Can generate API documentation

---

## 🚀 Performance & Optimization

### Issue #11: Optimize Trail System Performance

**Priority:** Medium  
**Type:** Performance  
**Labels:** `performance`, `optimization`

**Description:**
The trail system iterates over buffers multiple times per frame, which could be optimized.

**Current Issues:**
- `app.js:780-813` - Evaporation and diffusion in separate passes
- `app.js:819-841` - Trail drawing iterates entire buffer
- Could combine operations to reduce cache misses

**Proposed Optimizations:**
1. Combine evaporation and diffusion in single pass
2. Use dirty rectangles to only update changed regions
3. Consider using WebGL for trail rendering (PixiJS filters)
4. Add performance budgeting to limit trail operations

**Expected Benefits:**
- Reduce CPU time in trail update
- Better frame rates with many agents
- More headroom for additional features

---

### Issue #12: Memory Leak Risk - Event Listeners Not Cleaned Up

**Priority:** High  
**Type:** Bug  
**Labels:** `bug`, `memory-leak`, `browser`

**Description:**
Several event listeners are added but may not be properly removed, leading to memory leaks especially during resets or when creating/destroying many agents.

**Locations:**
- `app.js:147-170` - Canvas mousemove and mouseleave listeners
- `config.js:1699-1702` - Window keydown listener
- `bundle.js` - Event listeners in Bundle class may not clean up on destroy

**Proposed Solution:**
1. Track all event listeners in cleanup arrays
2. Implement proper cleanup in destroy/reset methods
3. Use AbortController for easier cleanup:
```javascript
const controller = new AbortController();
canvas.addEventListener('mousemove', handler, { signal: controller.signal });
// Later:
controller.abort(); // Removes all listeners
```

**Benefits:**
- Prevent memory leaks
- Proper cleanup on reset
- Better browser performance over time

---

## 🎨 User Experience & Interface

### Issue #13: Add Keyboard Shortcuts Documentation

**Priority:** Low  
**Type:** Documentation  
**Labels:** `documentation`, `ux`, `good-first-issue`

**Description:**
Keyboard shortcuts exist in code but documentation is scattered and incomplete.

**Current State:**
- README.md has basic controls table
- app.js comments list some keys
- No in-app help screen
- No discoverable way to learn shortcuts

**Proposed Solution:**
1. Add Help overlay (press `?` or `H`)
2. Show keyboard shortcuts in modal
3. Add visual indicators for key states (e.g., "AUTO" when auto-mode enabled)
4. Update README with complete shortcut list

**Keys to Document:**
- Core: WASD, Space, R, A, M, T, etc.
- Training: L (training UI)
- Config: O (config panel), 1-9 (profiles)
- Debug: H (dashboard), U (HUD), K (hotkeys), G/P (overlays)

---

### Issue #14: Improve Mobile/Touch Support

**Priority:** Medium  
**Type:** Enhancement  
**Labels:** `enhancement`, `mobile`, `accessibility`

**Description:**
The simulation is keyboard-heavy and has limited touch support, making it difficult to use on tablets and mobile devices.

**Current Limitations:**
- No touch controls for agent movement
- Config panel awkward on mobile
- Small UI elements hard to tap
- No pinch-to-zoom for viewing agents

**Proposed Solution:**
1. Add on-screen virtual joystick for agent control
2. Make UI panels responsive to screen size
3. Add touch gestures (pinch zoom, pan)
4. Larger tap targets for buttons/controls
5. Detect mobile and show appropriate help

**Benefits:**
- Wider audience reach
- Better demos on tablets
- More accessible overall

---

### Issue #15: Add Accessibility Features

**Priority:** Medium  
**Type:** Accessibility  
**Labels:** `accessibility`, `a11y`, `enhancement`

**Description:**
The application lacks basic accessibility features, making it difficult for users with disabilities.

**Missing Features:**
- No ARIA labels on interactive elements
- No keyboard focus indicators
- Canvas has no alternative text
- No screen reader support
- No reduced motion option
- No high contrast mode

**Proposed Solution:**
1. Add ARIA labels to all buttons and controls
2. Ensure all functionality accessible via keyboard
3. Add visible focus indicators
4. Provide text alternatives for visual information
5. Add `prefers-reduced-motion` support
6. Consider adding data export for screen readers

**Example:**
```javascript
button.setAttribute('aria-label', 'Start simulation');
button.setAttribute('role', 'button');
button.setAttribute('tabindex', '0');
```

**Benefits:**
- Wider audience reach
- Better for all users
- Potential educational use
- Legal compliance (depending on context)

---

## 🔧 Development & Tooling

### Issue #16: Add CI/CD Pipeline

**Priority:** Medium  
**Type:** DevOps  
**Labels:** `ci-cd`, `tooling`, `automation`

**Description:**
No continuous integration or deployment pipeline exists, meaning tests aren't run automatically and quality gates aren't enforced.

**Proposed Solution:**
Create `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test
      - run: npm run lint
      
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Check index.html loads
        run: |
          python -m http.server 8080 &
          sleep 2
          curl http://localhost:8080/index.html
```

**Benefits:**
- Automatic test execution
- Catch errors before merge
- Enforce code quality standards
- Build confidence in changes

---

### Issue #17: Add Development Documentation

**Priority:** Medium  
**Type:** Documentation  
**Labels:** `documentation`, `good-first-issue`

**Description:**
Missing developer documentation for setting up, building, and contributing to the project.

**Missing Documentation:**
- How to set up development environment
- Architecture overview (what goes where)
- How to add new features
- How to run and write tests
- Code style guidelines
- Git workflow / branching strategy

**Proposed Solution:**
Create `docs/DEVELOPMENT.md`:
```markdown
# Development Guide

## Setup
1. Clone repository
2. Run `npm install`
3. Run `npm run dev` to start local server
4. Open http://localhost:8080

## Architecture
- `app.js` - Main application entry point
- `src/core/` - Core simulation classes
- `src/systems/` - Behavior systems
- `src/ui/` - User interface components
...
```

**Benefits:**
- Easier onboarding for contributors
- Fewer questions in issues/PRs
- Better contribution quality
- Preserved knowledge

---

## 🐛 Bugs & Issues

### Issue #18: Fix Observation Vector Comment Mismatch

**Priority:** Low  
**Type:** Bug  
**Labels:** `bug`, `documentation`

**Description:**
Comments in `observations.js` claim 29 dimensions but code shows 29 vector elements (correct). However, CONFIG says 23 dimensions, creating confusion.

**Location:** `observations.js:11`

**Current Code:**
```javascript
/**
 * Observation components (29 dims total):
 * - χ state: [chi_norm, frustration, alive]  (3)
 * - Motion: [vx_norm, vy_norm]               (2)
 * - Walls: [nx, ny, edge_mag]                (3)
 * - Resource: [res_dx, res_dy, res_visible]  (3)
 * - Trails: [trail_mean, trail_max, tdir_x, tdir_y] (4)
 * - Scent Gradient: [intensity, grad_x, grad_y] (3) - NEW!
 * - Food Density: [near, mid, far, dens_dir_x, dens_dir_y] (5) - NEW!
 * - Signal Field: [sig_res, sig_distress, sig_bond, bias_res, bias_distress, bias_bond] (6) - NEW!
 */
```

Adds up to 29, but CONFIG.learning.observationDims says 23.

**Solution:** Audit actual observation vector, update CONFIG to match, ensure all code uses correct value.

---

### Issue #19: Unused Config Parameters

**Priority:** Low  
**Type:** Code Quality  
**Labels:** `cleanup`, `technical-debt`

**Description:**
Some CONFIG parameters appear unused or deprecated but remain in the codebase.

**Examples:**
- `CONFIG.rewardChi` - Marked as DEPRECATED in comments
- `CONFIG.resourceCount` - Legacy mode, rarely used
- Some signal field parameters may be unused

**Proposed Solution:**
1. Audit all CONFIG parameters
2. Mark deprecated ones clearly
3. Remove truly unused ones
4. Add migration guide if needed

---

### Issue #20: Missing Input Validation

**Priority:** Medium  
**Type:** Security  
**Labels:** `security`, `validation`, `bug`

**Description:**
User input from config panel and imported profiles lacks validation, potentially causing crashes or unexpected behavior.

**Issues:**
- No validation when importing JSON profiles
- Config values not clamped to valid ranges
- No type checking on user input
- Malformed JSON could crash application

**Example Risk:**
User imports profile with `moveCostPerSecond: -999` causing agents to gain energy from moving.

**Proposed Solution:**
1. Add schema validation for imported profiles:
```javascript
function validateConfig(config) {
  if (config.moveCostPerSecond < 0) {
    throw new Error('moveCostPerSecond must be >= 0');
  }
  // ... more validation
}
```

2. Clamp values to schema min/max
3. Validate JSON structure before applying
4. Show user-friendly error messages

---

## 📊 Monitoring & Analytics

### Issue #21: Add Performance Monitoring

**Priority:** Low  
**Type:** Enhancement  
**Labels:** `performance`, `monitoring`, `enhancement`

**Description:**
No built-in performance monitoring exists, making it hard to identify bottlenecks or regressions.

**Proposed Solution:**
Add performance tracking:
```javascript
const perfMonitor = {
  frames: [],
  record(dt, phase) {
    this.frames.push({ dt, phase, timestamp: performance.now() });
    if (this.frames.length > 60) this.frames.shift();
  },
  getStats() {
    const avgFps = 1000 / (this.frames.reduce((sum, f) => sum + f.dt, 0) / this.frames.length);
    return { avgFps, frames: this.frames };
  }
};
```

Add to HUD or console for monitoring.

---

### Issue #22: Add Error Boundary for Simulation

**Priority:** Medium  
**Type:** Reliability  
**Labels:** `error-handling`, `reliability`

**Description:**
Errors in simulation loop crash the entire application with no recovery mechanism.

**Current Behavior:**
- Uncaught error stops simulation permanently
- User must reload page
- State is lost

**Proposed Solution:**
1. Wrap simulation loop in try-catch
2. Log errors to console
3. Attempt recovery or graceful pause
4. Show error modal to user
5. Add "Report Bug" button with error details

```javascript
try {
  runSimulationStep();
} catch (error) {
  console.error('Simulation error:', error);
  World.paused = true;
  showErrorModal(error);
}
```

---

## 🎯 Feature Requests

### Issue #23: Add Simulation Presets

**Priority:** Low  
**Type:** Enhancement  
**Labels:** `enhancement`, `feature`, `good-first-issue`

**Description:**
Add built-in simulation presets to showcase different behaviors and make it easier for new users to explore features.

**Proposed Presets:**
1. **"Efficient Foragers"** - Optimized agents with good sensing
2. **"Exploration"** - High frustration, wide searching
3. **"Colony Builder"** - Focus on trails and cooperation
4. **"Sparse Resources"** - Survival mode with limited food
5. **"Population Dynamics"** - Mitosis enabled, ecology stress
6. **"Rule 110 Demo"** - TC features enabled

**Implementation:**
Store as JSON profiles in `profiles/presets/` directory, load on startup.

---

### Issue #24: Add Replay/Recording System

**Priority:** Low  
**Type:** Enhancement  
**Labels:** `enhancement`, `feature`

**Description:**
Add ability to record and replay simulations for analysis, debugging, and demonstrations.

**Proposed Features:**
1. Record button in UI
2. Capture agent positions, resources, trails per tick
3. Save as compressed JSON
4. Replay mode with timeline scrubber
5. Export as video/GIF (optional)

**Use Cases:**
- Debug emergent behaviors
- Create demos and tutorials
- Share interesting simulation runs
- Analyze agent learning progress

---

### Issue #25: Add Simulation Export/Import

**Priority:** Low  
**Type:** Enhancement  
**Labels:** `enhancement`, `feature`, `good-first-issue`

**Description:**
Allow exporting and importing full simulation state (not just config).

**Export Should Include:**
- Current world state (agents, resources, trails)
- Configuration
- Random seed for reproducibility
- Timestamp and version

**Use Cases:**
- Save interesting simulation states
- Share simulations with others
- Continue simulation later
- Compare before/after scenarios

---

## 📝 Documentation

### Issue #26: Improve Code Comments

**Priority:** Low  
**Type:** Documentation  
**Labels:** `documentation`, `code-quality`

**Description:**
Some areas of the code lack explanatory comments, especially complex algorithms.

**Needs Better Comments:**
- `app.js:683-813` - Trail system (evaporation, diffusion)
- `learner.js:55-64` - Box-Muller transform needs explanation
- `bundle.js:160-214` - Smooth trail renderer Catmull-Rom splines
- Steering behavior calculations
- Signal field interpretation

**Best Practices:**
- Explain "why" not "what"
- Document assumptions and invariants
- Add references for algorithms
- Keep comments updated with code

---

### Issue #27: Create Architecture Diagrams

**Priority:** Low  
**Type:** Documentation  
**Labels:** `documentation`, `architecture`

**Description:**
Add visual diagrams to help understand system architecture and data flow.

**Diagrams Needed:**
1. **Component Diagram** - Show major modules and dependencies
2. **Data Flow** - How observations → actions → updates
3. **Learning Pipeline** - CEM training loop
4. **Event Flow** - User input → simulation → rendering
5. **Class Hierarchy** - Bundle, Resource, Controller classes

**Tools:**
- Mermaid (can embed in markdown)
- draw.io
- PlantUML

---

## 🔬 Research & Experimentation

### Issue #28: Investigate WebGL Rendering

**Priority:** Low  
**Type:** Research  
**Labels:** `research`, `performance`, `enhancement`

**Description:**
Investigate whether WebGL rendering via PixiJS filters could improve performance for trails and visual effects.

**Current State:**
- Trails rendered on 2D canvas
- Diffusion calculated on CPU
- Could be GPU-accelerated

**Research Questions:**
1. Can trail diffusion run on GPU?
2. Would WebGL fragment shaders be faster?
3. What's the complexity of implementation?
4. Browser compatibility concerns?

**Expected Outcome:**
Document findings, create proof-of-concept if promising.

---

### Issue #29: Explore WebAssembly for Simulation Core

**Priority:** Low  
**Type:** Research  
**Labels:** `research`, `performance`, `enhancement`

**Description:**
Research whether core simulation calculations could benefit from WebAssembly.

**Candidates for WASM:**
- Trail system updates (large buffers)
- Particle systems
- Distance calculations
- Learning/training computations

**Trade-offs:**
- Performance gains vs. complexity
- Maintainability
- Browser support
- Build toolchain requirements

---

## 🎓 Educational & Community

### Issue #30: Create Tutorial Series

**Priority:** Low  
**Type:** Documentation  
**Labels:** `documentation`, `education`, `good-first-issue`

**Description:**
Create step-by-step tutorials for common tasks and learning the codebase.

**Proposed Tutorials:**
1. **"Your First Agent"** - Create a custom agent behavior
2. **"Understanding Trails"** - How the pheromone system works
3. **"Training 101"** - Train your first policy
4. **"Adding Observations"** - Extend the observation vector
5. **"Custom Rewards"** - Modify the reward function

**Format:**
- Markdown with code examples
- Progressive complexity
- Include exercises
- Link to related code

---

## Summary Statistics

**Total Issues Identified:** 30

**By Priority:**
- 🔴 High: 5
- 🟡 Medium: 13
- 🟢 Low: 12

**By Type:**
- 🐛 Bug: 4
- 🏗️ Refactoring: 5
- 🔧 Tooling: 6
- 📚 Documentation: 6
- ✨ Enhancement: 6
- 🚀 Performance: 2
- 🔬 Research: 2

**Quick Wins (Good First Issues):**
- Issue #5: Add ESLint Configuration
- Issue #6: Add Prettier
- Issue #7: Add .gitignore
- Issue #9: Remove Magic Numbers
- Issue #13: Keyboard Shortcuts Documentation
- Issue #17: Development Documentation
- Issue #23: Add Simulation Presets
- Issue #25: Simulation Export/Import
- Issue #30: Create Tutorial Series

---

## Getting Started

### For Maintainers
Start with high-priority issues that provide the most value:
1. Issue #3 - Add package.json (unblocks tooling)
2. Issue #1 - Refactor app.js (improves maintainability)
3. Issue #4 - Improve test coverage (enables confident changes)
4. Issue #8 - Fix observation dimensions (prevents bugs)

### For Contributors
Look for "good-first-issue" labeled items - they're easier entry points that don't require deep system knowledge.

### Issue Template
When creating issues on GitHub, use this format:
```markdown
**Priority:** [High/Medium/Low]
**Type:** [Bug/Enhancement/Refactoring/Documentation/etc.]
**Labels:** [comma, separated, labels]

## Description
[Clear description of the issue]

## Current Behavior
[What happens now]

## Expected Behavior
[What should happen]

## Proposed Solution
[How to fix/implement]

## Benefits
[Why this matters]
```

---

*Generated from code review on 2025-11-09*

