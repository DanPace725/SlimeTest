# GitHub Project Structure for Emergence Engine

*Proposed organization for Future Directions development*

---

## Project Overview

**Name:** Emergence Engine Evolution Roadmap  
**Type:** GitHub Project Board (Table/Board view)  
**Purpose:** Track development from proof-of-concept to sophisticated emergence platform

---

## Milestones

### Milestone 1: Foundation (Q1 2026)
**Goal:** Establish architectural foundation for advanced features  
**Key Deliverables:**
- Architectural refactoring (Environment/Species/Individual layers)
- Basic memory system
- Configuration management improvements

### Milestone 2: Intelligence (Q2 2026)
**Goal:** Make agents feel genuinely alive  
**Key Deliverables:**
- Personality & trait system
- Reinforcement learning
- Memory-based decision making

### Milestone 3: Usability (Q2-Q3 2026)
**Goal:** Lower barrier to exploration  
**Key Deliverables:**
- Conversational LLM interface
- Parameter translation system
- Analysis & interpretation tools

### Milestone 4: Ecosystem (Q3-Q4 2026)
**Goal:** Create rich multi-species dynamics  
**Key Deliverables:**
- Multi-species support
- Evolutionary mechanics
- Co-evolution systems

### Milestone 5: Research Platform (2027+)
**Goal:** Enable serious scientific investigation  
**Key Deliverables:**
- Research protocols
- Data export & analysis
- Consciousness experiments

---

## Epic Labels

- `epic:architecture` - Foundational structural changes
- `epic:intelligence` - Personality, memory, learning systems
- `epic:llm-interface` - Conversational AI integration
- `epic:multi-species` - Species diversity and ecosystems
- `epic:evolution` - Genetic and evolutionary systems
- `epic:self-modifying` - Meta-optimization and code evolution
- `epic:research` - Scientific investigation directions
- `epic:applications` - Practical use cases
- `epic:technical` - Infrastructure and tooling
- `epic:visualization` - UI/UX improvements

---

## Priority Labels

- `priority:critical` - Blocking or foundational
- `priority:high` - Major impact, near-term
- `priority:medium` - Valuable but can wait
- `priority:low` - Nice-to-have
- `priority:research` - Exploratory, no timeline

---

## Complexity Labels

- `complexity:small` - Few hours to 1-2 days
- `complexity:medium` - 3-7 days
- `complexity:large` - 1-3 weeks
- `complexity:epic` - Weeks to months

---

## Type Labels

- `type:feature` - New functionality
- `type:refactor` - Code improvement
- `type:research` - Investigative work
- `type:documentation` - Docs and guides
- `type:optimization` - Performance improvement
- `type:experiment` - Prototype or test

---

## Status Columns

### Backlog
Ideas and planned work, prioritized

### Ready
Refined, unblocked, ready to start

### In Progress
Active development

### Review/Testing
Implemented, needs validation

### Done
Completed and merged

### Blocked/Deferred
Can't proceed or deprioritized

---

## Issues Breakdown

---

## 🎯 Quick Wins (10 Issues)

### Issue #1: Export simulation state to CSV
**Epic:** `epic:technical`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Add ability to export current simulation state (agent positions, energy, links, etc.) to CSV format for external analysis.

**Acceptance Criteria:**
- [ ] Export button in UI
- [ ] Exports: tick, agent ID, position (x,y), chi, link count, state
- [ ] Filename includes timestamp
- [ ] Works with 100+ agents without lag

**Implementation Notes:**
- Add export function to trainingUI.js
- Format: `tick,agentId,x,y,chi,linkCount,state`
- Consider streaming for large datasets

---

### Issue #2: Save/load named configuration presets
**Epic:** `epic:technical`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Allow users to save current config with a custom name and load it later from a preset list.

**Acceptance Criteria:**
- [ ] Save button with name input
- [ ] Load dropdown showing saved presets
- [ ] Delete preset option
- [ ] Stores in localStorage or JSON files
- [ ] Includes metadata (date saved, description)

**Implementation Notes:**
- Extend config.js
- Format: `{name, timestamp, description, config}`
- Consider preset categories (training, exploration, stress-test)

---

### Issue #3: Add "reset to baseline" button
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Quick button to restore default/baseline configuration without manual parameter adjustment.

**Acceptance Criteria:**
- [ ] Button in UI
- [ ] Restores to documented baseline config
- [ ] Confirms before reset if current config is modified
- [ ] Works without page reload

---

### Issue #4: Parameter bounds checking
**Epic:** `epic:technical`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Validate config parameters to prevent crashes from invalid values (negative chi, division by zero, etc.).

**Acceptance Criteria:**
- [ ] Define valid ranges for all parameters
- [ ] Validate on config load/change
- [ ] Show clear error messages
- [ ] Suggest corrections for common mistakes
- [ ] Document valid ranges

**Implementation Notes:**
- Add validation to config.js
- Consider JSON schema validation
- Log warnings for questionable but valid values

---

### Issue #5: Keyboard shortcuts
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Add keyboard shortcuts for common actions (pause, reset, speed control).

**Acceptance Criteria:**
- [ ] Space: pause/resume
- [ ] R: reset simulation
- [ ] +/-: adjust speed
- [ ] H: toggle help overlay
- [ ] S: take screenshot
- [ ] E: export data

**Implementation Notes:**
- Add key listener to index.html
- Show keyboard shortcuts in help overlay
- Ensure shortcuts don't conflict with browser

---

### Issue #6: Agent color coding by state
**Epic:** `epic:visualization`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Visual feedback: agents change color based on chi level, state, or behavior.

**Acceptance Criteria:**
- [ ] Color gradient: red (low chi) → yellow → green (high chi)
- [ ] Optional modes: by state, by link count, by age
- [ ] Toggle in UI
- [ ] Color legend displayed

**Implementation Notes:**
- Modify rendering in app.js
- Consider HSL color space for smooth gradients
- Make color scheme configurable

---

### Issue #7: FPS counter and performance metrics
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Display real-time performance metrics to identify bottlenecks.

**Acceptance Criteria:**
- [ ] FPS display
- [ ] Tick rate (ticks per second)
- [ ] Agent count
- [ ] Update time breakdown (physics, rendering, etc.)
- [ ] Toggle visibility

**Implementation Notes:**
- Add performance monitoring to app.js
- Use `performance.now()` for accurate timing
- Display as overlay, not intrusive

---

### Issue #8: Screenshot capture with metadata
**Epic:** `epic:technical`  
**Priority:** `priority:low`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Capture current simulation view as image with config metadata embedded.

**Acceptance Criteria:**
- [ ] Screenshot button or keyboard shortcut
- [ ] Saves as PNG
- [ ] Includes tick count, agent count in filename
- [ ] Optional: embed config as JSON metadata
- [ ] Optional: include metrics overlay

**Implementation Notes:**
- Use canvas.toDataURL()
- Consider adding watermark with key params

---

### Issue #9: Comparison mode (side-by-side configs)
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Run two different configurations side-by-side for direct comparison.

**Acceptance Criteria:**
- [ ] Split screen view
- [ ] Independent simulation state
- [ ] Synchronized tick rate option
- [ ] Compare metrics (population, energy, etc.)
- [ ] Export comparison data

**Implementation Notes:**
- May require architectural changes
- Consider using two canvas elements
- Share common code but separate state

---

### Issue #10: Parameter randomization
**Epic:** `epic:technical`  
**Priority:** `priority:low`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Generate random valid configurations to explore parameter space.

**Acceptance Criteria:**
- [ ] Randomize button
- [ ] Respects parameter bounds
- [ ] Optional: constrain to "interesting" ranges
- [ ] Show what was randomized
- [ ] Can save interesting results

**Implementation Notes:**
- Use validated bounds from Issue #4
- Consider weighted randomization (avoid extremes)

---

## 🏗️ Architectural Refactoring (5 Issues)

### Issue #11: Design layered architecture specification
**Epic:** `epic:architecture`  
**Priority:** `priority:critical`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Document the three-layer architecture (Environment/Species/Individual) before implementation.

**Acceptance Criteria:**
- [ ] Clear separation of concerns documented
- [ ] API boundaries defined
- [ ] Data flow diagrams
- [ ] Migration strategy from current flat structure
- [ ] Example configurations for each layer

**Blocks:** Issues #12-15

**Implementation Notes:**
- Reference Future Directions section
- Consider existing config.js structure
- Plan for backward compatibility

---

### Issue #12: Implement Environment Layer
**Epic:** `epic:architecture`  
**Priority:** `priority:critical`  
**Complexity:** `complexity:large`  
**Type:** `type:refactor`

**Description:**
Create Environment layer containing world physics, resources, computation substrate, field dynamics.

**Acceptance Criteria:**
- [ ] Environment config separate from species/individual
- [ ] Contains: grid size, CA rules, field parameters, chi distribution
- [ ] Can be swapped without affecting species definitions
- [ ] Backward compatible with current configs

**Blocked By:** Issue #11

**Implementation Notes:**
- Refactor config.js
- Update app.js to use layered config
- Maintain existing functionality

---

### Issue #13: Implement Species Layer
**Epic:** `epic:architecture`  
**Priority:** `priority:critical`  
**Complexity:** `complexity:large`  
**Type:** `type:refactor`

**Description:**
Create Species layer with behavioral templates (genetic traits, movement patterns, psychology).

**Acceptance Criteria:**
- [ ] Species template structure defined
- [ ] Multiple species can coexist
- [ ] Agents instantiate from species templates
- [ ] Species can have inheritable traits
- [ ] Can define species-specific behaviors

**Blocked By:** Issue #11, #12

**Implementation Notes:**
- May require agent structure changes
- Consider species registry/factory pattern

---

### Issue #14: Implement Individual Layer
**Epic:** `epic:architecture`  
**Priority:** `priority:critical`  
**Complexity:** `complexity:large`  
**Type:** `type:refactor`

**Description:**
Create Individual layer for personal identity, memory, learned behaviors, personality development.

**Acceptance Criteria:**
- [ ] Per-agent state beyond species template
- [ ] Memory storage structure
- [ ] Personality trait storage
- [ ] Experience tracking
- [ ] Individual learning state

**Blocked By:** Issue #11, #12, #13

**Implementation Notes:**
- Foundation for personality system (Issue #16)
- Consider memory limits for performance

---

### Issue #15: Migration and testing
**Epic:** `epic:architecture`  
**Priority:** `priority:critical`  
**Complexity:** `complexity:medium`  
**Type:** `type:refactor`

**Description:**
Migrate existing configurations to new architecture and validate no regression.

**Acceptance Criteria:**
- [ ] All existing configs work with new architecture
- [ ] Automated tests pass
- [ ] Performance unchanged
- [ ] Documentation updated
- [ ] Migration guide for users

**Blocked By:** Issues #12-14

**Implementation Notes:**
- Test with all profiles/* configs
- Compare behavior against baseline recordings

---

## 🧠 Personality & Memory Systems (8 Issues)

### Issue #16: Design memory system architecture
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:research` + `type:documentation`

**Description:**
Design memory system supporting episodic, semantic, and social memory.

**Acceptance Criteria:**
- [ ] Memory types defined (episodic, semantic, social, trauma/success)
- [ ] Storage format specified
- [ ] Retrieval mechanism designed
- [ ] Decay/forgetting strategy
- [ ] Performance impact analyzed

**Blocks:** Issues #17-20

**Implementation Notes:**
- Balance detail vs. performance
- Consider circular buffers for episodic memory
- Reference cognitive science literature

---

### Issue #17: Implement episodic memory
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Agents remember specific events: "I found food at location X at tick T."

**Acceptance Criteria:**
- [ ] Store location-based memories
- [ ] Time-stamped events
- [ ] Success/failure context
- [ ] Memory retrieval by location/time
- [ ] Configurable memory capacity

**Blocked By:** Issue #16

**Implementation Notes:**
- Event types: food_found, near_death, link_formed, etc.
- Store last N events per agent
- Consider spatial indexing for location queries

---

### Issue #18: Implement semantic memory
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Agents learn general patterns: "Trail-following usually works."

**Acceptance Criteria:**
- [ ] Strategy effectiveness tracking
- [ ] Generalized patterns (not specific events)
- [ ] Confidence levels based on experience
- [ ] Updates over time
- [ ] Influences decision making

**Blocked By:** Issue #16

**Implementation Notes:**
- Track: trail_following_success_rate, cooperation_payoff, etc.
- Exponential moving average for adaptive learning

---

### Issue #19: Implement social memory
**Epic:** `epic:intelligence`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Agents remember interactions with other agents: "Agent Y is trustworthy."

**Acceptance Criteria:**
- [ ] Track relationships with other agents
- [ ] Trust/reputation scores
- [ ] Interaction history
- [ ] Social learning (learn from others' success)
- [ ] Preferential bonding based on history

**Blocked By:** Issue #16

**Implementation Notes:**
- Store relationships by agent ID
- Handle agent death (memory cleanup)
- Consider social network analysis

---

### Issue #20: Implement trauma/success memory
**Epic:** `epic:intelligence`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Memorable events (near-death, windfall) have stronger influence on behavior.

**Acceptance Criteria:**
- [ ] Detect memorable events (chi < threshold, sudden gain, etc.)
- [ ] Higher weight in memory
- [ ] Affects personality traits
- [ ] Persists longer than normal memories

**Blocked By:** Issue #16, #17

**Implementation Notes:**
- Threshold-based detection
- Emotional valence (positive/negative)
- Influences risk tolerance, exploration bias

---

### Issue #21: Design personality trait system
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Define personality trait dimensions and how they blend nature (inherited) and nurture (learned).

**Acceptance Criteria:**
- [ ] Trait dimensions defined (exploration bias, cooperation, risk tolerance, patience)
- [ ] Nature/nurture blend formula (50/50)
- [ ] How traits influence decisions
- [ ] Trait evolution over time
- [ ] Limits and constraints

**Blocks:** Issues #22-24

**Implementation Notes:**
- Reference personality psychology (Big Five, etc.)
- Keep simple initially, can expand later

---

### Issue #22: Implement personality traits
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Agents have personality traits that affect decision-making.

**Acceptance Criteria:**
- [ ] Traits: exploration_bias, cooperation_tendency, risk_tolerance, patience
- [ ] Values range [-1, 1] or [0, 1]
- [ ] Initialized from species template (nature)
- [ ] Modified by experience (nurture)
- [ ] Influences behavior decisions

**Blocked By:** Issue #21

**Implementation Notes:**
- Add to agent structure
- Modify decision functions in controllers.js
- Visualize in agent inspector

---

### Issue #23: Implement reinforcement learning
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Agents adjust personality traits based on outcomes of their actions.

**Acceptance Criteria:**
- [ ] Track action → outcome correlations
- [ ] Update traits based on success/failure
- [ ] Learning rate configurable
- [ ] Successful strategies amplified
- [ ] Failed strategies dampened
- [ ] Doesn't override core species traits completely

**Blocked By:** Issues #21, #22

**Implementation Notes:**
- Credit assignment problem (which action caused outcome?)
- Use temporal discounting
- Consider actor-critic approach

---

### Issue #24: Implement memory-based decision making
**Epic:** `epic:intelligence`  
**Priority:** `priority:high`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Agents use memories to inform current decisions (not just reactive).

**Acceptance Criteria:**
- [ ] Query memory before decisions
- [ ] "Have I been here before? What happened?"
- [ ] Use semantic memory for strategy selection
- [ ] Use social memory for partner selection
- [ ] Balances memory with current sensory input

**Blocked By:** Issues #17-20, #22

**Implementation Notes:**
- Modify controllers.js decision functions
- Add memory weight vs. sensory weight parameter
- Avoid analysis paralysis (fast decisions)

---

## 🤖 Conversational LLM Interface (10 Issues)

### Issue #25: Research LLM integration options
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:research`

**Description:**
Evaluate options for LLM integration (local via Ollama, API via Claude/GPT, both).

**Acceptance Criteria:**
- [ ] Document pros/cons of each approach
- [ ] Cost analysis
- [ ] Latency considerations
- [ ] Privacy implications
- [ ] Recommended architecture

**Blocks:** Issues #26-34

**Implementation Notes:**
- Consider hybrid: local for fast ops, API for complex reasoning
- Test with simple parameter translation task

---

### Issue #26: Design conversational interface architecture
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Design how conversation state, context, and simulation state interact.

**Acceptance Criteria:**
- [ ] Conversation flow documented
- [ ] Context management strategy
- [ ] How LLM accesses simulation state
- [ ] How LLM modifies parameters
- [ ] Safety boundaries defined

**Blocked By:** Issue #25  
**Blocks:** Issues #27-34

**Implementation Notes:**
- Message format
- System prompts
- Function calling for parameter changes

---

### Issue #27: Set up Electron/Tauri app structure
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:refactor`

**Description:**
Convert from web app to standalone app with filesystem access (needed for LLM integration).

**Acceptance Criteria:**
- [ ] Choose Electron or Tauri
- [ ] Migrate existing UI
- [ ] Filesystem access working
- [ ] Can run local processes
- [ ] Build system configured

**Blocked By:** Issue #26

**Implementation Notes:**
- Tauri is lighter, Electron more mature
- Consider development vs. production builds

---

### Issue #28: Implement Phase 1 - Parameter translation
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Natural language → parameter changes. "Make them more cooperative" → adjust link.guidanceGain.

**Acceptance Criteria:**
- [ ] LLM understands parameter names and effects
- [ ] Translates intent to parameter changes
- [ ] Shows user what will change before applying
- [ ] Validates changes are reasonable
- [ ] Can undo changes

**Blocked By:** Issues #26, #27

**Implementation Notes:**
- Create parameter dictionary for LLM
- Use function calling to structure changes
- Prompt engineering critical here

---

### Issue #29: Implement Phase 2 - Analysis & interpretation
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
LLM analyzes current simulation state and explains emergent behavior.

**Acceptance Criteria:**
- [ ] "Why are they clustering?" → explains in natural language
- [ ] Can query specific metrics
- [ ] Identifies unusual patterns
- [ ] Suggests explanations for behavior
- [ ] References parameter settings

**Blocked By:** Issue #28

**Implementation Notes:**
- Provide LLM with: current params, metrics, recent events
- May need to generate summaries (not full state)
- Consider vision API for visual analysis

---

### Issue #30: Implement Phase 3 - Training objectives
**Epic:** `epic:llm-interface`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Natural language training goals → objective function → CEM optimization.

**Acceptance Criteria:**
- [ ] "Optimize for long-term survival" → defines fitness function
- [ ] Configures training parameters
- [ ] Runs CEM or other optimizer
- [ ] Reports results with interpretation
- [ ] Can refine based on feedback

**Blocked By:** Issue #29

**Implementation Notes:**
- Reuse existing learner.js infrastructure
- LLM translates goal → reward function code
- Safety: validate objective functions

---

### Issue #31: Implement Phase 4 - Autonomous experimentation
**Epic:** `epic:llm-interface`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
LLM designs and runs experiments overnight, generates reports.

**Acceptance Criteria:**
- [ ] "Run experiments on energy metabolism" → designs protocol
- [ ] Runs multiple variations
- [ ] Collects data systematically
- [ ] Generates summary report
- [ ] Highlights interesting findings

**Blocked By:** Issue #30

**Implementation Notes:**
- Experiment templates
- Results database
- Report generation
- Human review before major changes

---

### Issue #32: Context management system
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Manage conversation history, simulation context, and relevant documentation.

**Acceptance Criteria:**
- [ ] Stores conversation history
- [ ] Retrieves relevant past context
- [ ] Includes current simulation state
- [ ] References documentation when needed
- [ ] Manages token limits

**Blocked By:** Issue #26

**Implementation Notes:**
- Vector database for semantic search over docs/history?
- Sliding window for conversation
- Summarization for old context

---

### Issue #33: LLM integration tests
**Epic:** `epic:llm-interface`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Test suite for LLM integration (parameter translation accuracy, etc.).

**Acceptance Criteria:**
- [ ] Test parameter translation accuracy
- [ ] Test interpretation quality
- [ ] Test objective function generation
- [ ] Test safety boundaries
- [ ] Regression tests

**Blocked By:** Issues #28-31

**Implementation Notes:**
- Use known good examples
- Check LLM doesn't suggest dangerous params
- Evaluate interpretation against human assessment

---

### Issue #34: LLM interface documentation
**Epic:** `epic:llm-interface`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:documentation`

**Description:**
User guide for conversational interface.

**Acceptance Criteria:**
- [ ] How to phrase requests
- [ ] Example conversations
- [ ] What the LLM can/can't do
- [ ] Troubleshooting
- [ ] API costs and usage

**Blocked By:** Issues #28-31

---

## 🌍 Multi-Species Ecosystems (6 Issues)

### Issue #35: Design species template system
**Epic:** `epic:multi-species`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Define how species templates work and how agents inherit from them.

**Acceptance Criteria:**
- [ ] Species template structure
- [ ] Trait inheritance mechanism
- [ ] How multiple species interact in shared environment
- [ ] Species-specific behaviors
- [ ] Visual differentiation (colors, shapes)

**Blocked By:** Issue #13 (Species Layer)  
**Blocks:** Issues #36-40

**Implementation Notes:**
- Build on Species Layer from architecture refactor
- Consider species as config presets

---

### Issue #36: Create example species: Foragers
**Epic:** `epic:multi-species`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Implement Foragers: fast movement, high trail following, strong cooperation.

**Acceptance Criteria:**
- [ ] Species config defined
- [ ] Behavioral traits implemented
- [ ] Visually distinct
- [ ] Can coexist with base species
- [ ] Documented behavior patterns

**Blocked By:** Issue #35

---

### Issue #37: Create example species: Explorers
**Epic:** `epic:multi-species`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Implement Explorers: slow methodical, low trail following, independent, impatient.

**Acceptance Criteria:**
- [ ] Species config defined
- [ ] Behavioral traits implemented
- [ ] Visually distinct
- [ ] Can coexist with others
- [ ] Documented behavior patterns

**Blocked By:** Issue #35

---

### Issue #38: Create example species: Coordinators
**Epic:** `epic:multi-species`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Implement Coordinators: medium speed, extreme cooperation, facilitate group formation.

**Acceptance Criteria:**
- [ ] Species config defined
- [ ] Social hub behaviors
- [ ] Visually distinct
- [ ] Facilitates others' cooperation
- [ ] Documented behavior patterns

**Blocked By:** Issue #35

---

### Issue #39: Create example species: Scouts
**Epic:** `epic:multi-species`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Implement Scouts: very fast, low energy cost, high sensing range, short lifespan.

**Acceptance Criteria:**
- [ ] Species config defined
- [ ] Fast movement + high sensing
- [ ] Short lifespan mechanics
- [ ] Visually distinct
- [ ] Documented behavior patterns

**Blocked By:** Issue #35

---

### Issue #40: Multi-species analysis tools
**Epic:** `epic:multi-species`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Tools to analyze multi-species dynamics (population ratios, niche partitioning, symbiosis detection).

**Acceptance Criteria:**
- [ ] Track population per species over time
- [ ] Detect cooperation between species
- [ ] Identify resource partitioning
- [ ] Analyze species interactions
- [ ] Export multi-species data

**Blocked By:** Issues #36-39

**Implementation Notes:**
- Extend policyAnalyzer.js
- Species-specific metrics
- Interaction matrix visualization

---

## 🧬 Evolutionary Systems (7 Issues)

### Issue #41: Design evolutionary mechanics
**Epic:** `epic:evolution`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Design reproduction, inheritance, mutation, and selection mechanisms.

**Acceptance Criteria:**
- [ ] Reproduction mechanics defined
- [ ] Genetic crossover strategy
- [ ] Mutation rates and methods
- [ ] Fitness criteria
- [ ] Population management

**Blocks:** Issues #42-47

**Implementation Notes:**
- Reference evolutionary algorithms literature
- Balance exploration vs. exploitation
- Consider sexual vs. asexual reproduction

---

### Issue #42: Implement reproduction mechanics
**Epic:** `epic:evolution`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Agents can reproduce when conditions met (chi threshold, maturity, etc.).

**Acceptance Criteria:**
- [ ] Reproduction costs chi
- [ ] Creates offspring agent
- [ ] Reproduction conditions configurable
- [ ] Can be disabled for non-evolutionary runs
- [ ] Population control (death when overcrowded)

**Blocked By:** Issue #41

**Implementation Notes:**
- Add reproduction trigger to controllers.js
- Chi cost should be significant
- Consider cooldown period

---

### Issue #43: Implement genetic inheritance
**Epic:** `epic:evolution`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Offspring inherit traits from parent(s) with variation.

**Acceptance Criteria:**
- [ ] Parameter inheritance (copy parent traits)
- [ ] Genetic crossover (if two parents)
- [ ] Small mutations (5-10% variation)
- [ ] Personality inheritance (nature component)
- [ ] Species membership inherited

**Blocked By:** Issues #41, #42

**Implementation Notes:**
- Which parameters are genetic vs. environmental?
- Mutation rate per parameter
- Bounds checking after mutation

---

### Issue #44: Implement fitness tracking
**Epic:** `epic:evolution`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Track fitness metrics to identify successful strategies.

**Acceptance Criteria:**
- [ ] Lifetime chi accumulation
- [ ] Offspring count
- [ ] Lifespan (ticks alive)
- [ ] Cooperation success
- [ ] Fitness score calculation

**Blocked By:** Issue #41

**Implementation Notes:**
- Add fitness tracking to agent
- Log fitness at death
- Export for analysis

---

### Issue #45: Implement speciation mechanics
**Epic:** `epic:evolution`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Populations diverge into distinct species over time.

**Acceptance Criteria:**
- [ ] Detect trait divergence
- [ ] Geographic isolation (agents in different regions)
- [ ] Behavioral isolation (different strategies)
- [ ] Species boundary emergence
- [ ] Track species lineage

**Blocked By:** Issues #42-44

**Implementation Notes:**
- Clustering algorithm on trait space?
- Define species distance metric
- Visualize phylogenetic tree

---

### Issue #46: Long-term evolution experiments
**Epic:** `epic:evolution`  
**Priority:** `priority:low`  
**Complexity:** `complexity:medium`  
**Type:** `type:experiment`

**Description:**
Run 1000+ generation experiments to observe evolutionary dynamics.

**Acceptance Criteria:**
- [ ] Can run unattended for days
- [ ] Checkpointing (save/resume)
- [ ] Periodic snapshots
- [ ] Data collection throughout
- [ ] Final analysis report

**Blocked By:** Issues #42-45

**Implementation Notes:**
- Headless mode (no rendering)
- Automatic data export
- Consider cloud computing

---

### Issue #47: Evolutionary analysis tools
**Epic:** `epic:evolution`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Analyze evolutionary trajectories (fitness over time, trait distributions, phylogeny).

**Acceptance Criteria:**
- [ ] Fitness landscape visualization
- [ ] Trait distribution over generations
- [ ] Lineage tracking
- [ ] Identify evolutionary innovations
- [ ] Compare to theoretical predictions

**Blocked By:** Issue #46

**Implementation Notes:**
- Extend policyAnalyzer.js
- Phylogenetic visualization
- Statistical analysis of evolution

---

## 🔧 Self-Modifying Code (8 Issues)

### Issue #48: Design self-modification architecture
**Epic:** `epic:self-modifying`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:documentation`

**Description:**
Design safe architecture for LLM-proposed code changes.

**Acceptance Criteria:**
- [ ] Safety architecture documented
- [ ] Sandbox strategy defined
- [ ] Validation criteria (tests, invariants, benchmarks)
- [ ] Human review process
- [ ] Rollback mechanisms

**Blocks:** Issues #49-55

**Implementation Notes:**
- Reference Future Directions safety section
- Inspired by genetic programming, AutoML
- Start conservative, expand gradually

---

### Issue #49: Implement Phase 1 - Read-only analysis
**Epic:** `epic:self-modifying`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
LLM reads codebase, proposes changes as diffs, human applies manually.

**Acceptance Criteria:**
- [ ] LLM can read project files
- [ ] Proposes changes in diff format
- [ ] Explains rationale for changes
- [ ] Human reviews and applies
- [ ] No automatic code modification

**Blocked By:** Issue #48

**Implementation Notes:**
- Build on LLM interface (Issues #28-31)
- Git integration for diff display
- Clear change proposals

---

### Issue #50: Set up sandboxed execution environment
**Epic:** `epic:self-modifying`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Isolated environment to test code changes safely.

**Acceptance Criteria:**
- [ ] Docker/VM isolation
- [ ] Can run modified code
- [ ] Resource limits (CPU, memory, time)
- [ ] Network isolation
- [ ] Clean teardown

**Blocked By:** Issue #48

**Implementation Notes:**
- Docker is probably easiest
- WebAssembly sandbox for browser?
- Copy codebase to sandbox, test, destroy

---

### Issue #51: Define behavioral invariants
**Epic:** `epic:self-modifying`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Define properties that must hold regardless of code changes.

**Acceptance Criteria:**
- [ ] Agents must survive (no immediate death)
- [ ] No crashes or infinite loops
- [ ] Bounded memory usage
- [ ] Bounded execution time
- [ ] Chi conservation (if applicable)
- [ ] Documented as testable assertions

**Blocked By:** Issue #48  
**Blocks:** Issues #52-55

**Implementation Notes:**
- Inspired by formal verification
- Write as test suite
- Run before/after changes

---

### Issue #52: Implement Phase 2 - Sandboxed testing
**Epic:** `epic:self-modifying`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
LLM proposes changes, tests in sandbox, reports results.

**Acceptance Criteria:**
- [ ] Automatic sandbox testing
- [ ] Runs behavioral invariants
- [ ] Compares to baseline behavior
- [ ] Reports test results
- [ ] Human approves merge

**Blocked By:** Issues #49-51

**Implementation Notes:**
- Automated testing pipeline
- Comparison metrics
- Clear go/no-go decision

---

### Issue #53: Implement Phase 3 - Automated testing
**Epic:** `epic:self-modifying`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Comprehensive test suite allows auto-apply if tests pass.

**Acceptance Criteria:**
- [ ] Full test coverage
- [ ] Regression tests
- [ ] Performance benchmarks
- [ ] Auto-apply if all pass
- [ ] Human reviews periodically

**Blocked By:** Issue #52

**Implementation Notes:**
- Requires high confidence in test suite
- Still needs human oversight
- Version control integration

---

### Issue #54: Shadow testing system
**Epic:** `epic:self-modifying`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Run stable and modified versions in parallel to detect subtle differences.

**Acceptance Criteria:**
- [ ] Run both versions simultaneously
- [ ] Compare outputs/behaviors
- [ ] Detect divergence
- [ ] Statistical significance testing
- [ ] Rollback if divergence detected

**Blocked By:** Issue #52

**Implementation Notes:**
- Similar to Issue #9 (comparison mode)
- Need deterministic simulations
- Compare metrics, not exact state

---

### Issue #55: Implement Phase 4 - Autonomous evolution
**Epic:** `epic:self-modifying`  
**Priority:** `priority:low`  
**Complexity:** `complexity:epic`  
**Type:** `type:experiment`

**Description:**
System runs overnight experiments, tries variations, keeps what works.

**Acceptance Criteria:**
- [ ] Can run unattended
- [ ] Tries code variations
- [ ] Evaluates improvements
- [ ] Keeps successful changes
- [ ] Human reviews discoveries
- [ ] Full audit log

**Blocked By:** Issues #52-54

**Implementation Notes:**
- Meta-optimization of code, not just parameters
- Genetic programming inspired
- High risk, high reward
- Requires extensive safety infrastructure

---

## 🔬 Research Directions (10 Issues)

### Issue #56: Research: Minimal conditions for consciousness
**Epic:** `epic:research`  
**Priority:** `priority:research`  
**Complexity:** `complexity:epic`  
**Type:** `type:research`

**Description:**
Investigate: At what threshold does subjective experience emerge?

**Approach:**
- Implement memory, temporal integration, self-reference
- Scale up network complexity
- Add meta-awareness layer
- Test behavioral markers

**Metrics:**
- Self-recognition
- Anticipation
- Theory of mind
- Surprise/curiosity

**Dependencies:** Issues #16-24 (memory/personality systems)

---

### Issue #57: Research: Computational ecology
**Epic:** `epic:research`  
**Priority:** `priority:research`  
**Complexity:** `complexity:large`  
**Type:** `type:research`

**Description:**
How do different CA rules shape evolutionary outcomes?

**Approach:**
- Test Rule 110, Rule 30, Rule 90, etc.
- Vary computational complexity
- Measure adaptation strategies
- Map fitness landscapes

**Hypothesis:** More computationally rich environments → more diverse strategies

**Implementation Notes:**
- Extend tc/ system
- Systematic comparison framework

---

### Issue #58: Research: Thermodynamic bounds on intelligence
**Epic:** `epic:research`  
**Priority:** `priority:research`  
**Complexity:** `complexity:medium`  
**Type:** `type:research`

**Description:**
What's the minimal energy budget for adaptive behavior?

**Approach:**
- Systematically reduce chi availability
- Measure intelligence metrics
- Find phase transitions
- Compare to biological systems

**Implementation Notes:**
- Automated chi scaling experiments
- Intelligence benchmarks needed

---

### Issue #59: Research: Constraint design principles
**Epic:** `epic:research`  
**Priority:** `priority:research`  
**Complexity:** `complexity:large`  
**Type:** `type:research`

**Description:**
Can we derive principles for designing constraints that produce desired behaviors?

**Approach:**
- Catalog constraint configurations → outcomes
- Use meta-optimization
- Build design heuristics
- Test generalization

**Implementation Notes:**
- Large-scale parameter sweep
- Pattern recognition in results
- "If you want X, constrain Y" rules

---

### Issue #60: Research: Collective cognition
**Epic:** `epic:research`  
**Priority:** `priority:research`  
**Complexity:** `complexity:large`  
**Type:** `type:research`

**Description:**
When does a swarm become "smart" as a collective?

**Approach:**
- Implement problem-solving challenges
- Measure individual vs. collective performance
- Identify coordination patterns
- Compare to biological collectives

**Implementation Notes:**
- Need benchmark tasks (mazes, resource allocation)
- Measure emergence of collective intelligence

---

### Issue #61: Implement cognitive test battery
**Epic:** `epic:research`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Suite of tests to measure agent/swarm intelligence.

**Tests:**
- Navigation (mazes, obstacle avoidance)
- Resource allocation (optimal distribution)
- Problem solving (multi-step challenges)
- Social coordination (group tasks)
- Learning rate (adaptation speed)

**Blocked By:** None (can implement anytime)

---

### Issue #62: Implement self-recognition tests
**Epic:** `epic:research`  
**Priority:** `priority:low`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Test if agents can distinguish self from others.

**Approaches:**
- Mirror test analogue
- Self vs. other agent identification
- Own-state awareness

**Blocked By:** Issues #16-24 (memory/personality)

---

### Issue #63: Implement theory of mind tests
**Epic:** `epic:research`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Test if agents model other agents' states/intentions.

**Approaches:**
- Predict other agents' behavior
- Cooperation requires modeling partners
- Deception detection

**Blocked By:** Issue #62

---

### Issue #64: Data export for academic publication
**Epic:** `epic:research`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Export data in formats suitable for academic papers.

**Acceptance Criteria:**
- [ ] CSV export for statistics
- [ ] JSON for full replication
- [ ] Metadata (config, environment, version)
- [ ] Publication-quality plots
- [ ] LaTeX table generation

---

### Issue #65: Write research protocols document
**Epic:** `epic:research`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:documentation`

**Description:**
Standard protocols for running experiments and collecting data.

**Contents:**
- Experimental design guidelines
- Control group requirements
- Statistical significance testing
- Replication procedures
- Data collection standards

---

## 🎮 Practical Applications (5 Issues)

### Issue #66: Educational platform prototype
**Epic:** `epic:applications`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Interactive demos and guided explorations for teaching emergence.

**Features:**
- Guided tutorials
- Explanation overlays
- Interactive parameter exploration
- "What if?" scenarios
- Student-friendly interface

---

### Issue #67: Game AI integration example
**Epic:** `epic:applications`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:experiment`

**Description:**
Demonstrate using Emergence Engine for game NPC behavior.

**Features:**
- Export agent behaviors to game engine
- Personality-driven NPCs
- Emergent storytelling
- Integration guide

---

### Issue #68: Swarm robotics export
**Epic:** `epic:applications`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
Export coordination algorithms for physical robot swarms.

**Features:**
- Real physics constraints
- Communication limits
- Hardware-compatible control
- ROS integration?

---

### Issue #69: Organizational dynamics abstraction
**Epic:** `epic:applications`  
**Priority:** `priority:low`  
**Complexity:** `complexity:medium`  
**Type:** `type:experiment`

**Description:**
Map simulation concepts to organizational dynamics (teams, information flow, etc.).

**Features:**
- Abstract away biology
- Team coordination metrics
- Communication patterns
- Decision-making processes

---

### Issue #70: Research platform packaging
**Epic:** `epic:applications`  
**Priority:** `priority:low`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Package for academic researchers (systematic experiments, data export, hypothesis testing).

**Features:**
- Experiment templates
- Data export utilities
- Statistical analysis tools
- Documentation for researchers

---

## 🔧 Technical Infrastructure (10 Issues)

### Issue #71: Performance profiling
**Epic:** `epic:technical`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:optimization`

**Description:**
Identify performance bottlenecks in simulation loop.

**Acceptance Criteria:**
- [ ] Profile major functions
- [ ] Identify hotspots
- [ ] Document performance characteristics
- [ ] Target optimization areas

---

### Issue #72: Spatial indexing optimization
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:large`  
**Type:** `type:optimization`

**Description:**
Optimize agent lookups using spatial data structures (grid, quadtree, etc.).

**Acceptance Criteria:**
- [ ] Faster nearest-neighbor queries
- [ ] Reduced O(n²) comparisons
- [ ] Scales to 1000+ agents
- [ ] No behavior changes

**Implementation Notes:**
- Grid-based spatial hashing
- Update when agents move

---

### Issue #73: GPU acceleration research
**Epic:** `epic:technical`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:research`

**Description:**
Investigate GPU compute shaders for field updates and agent processing.

**Acceptance Criteria:**
- [ ] Prototype GPU implementation
- [ ] Performance comparison
- [ ] Feasibility assessment
- [ ] Implementation strategy if viable

**Implementation Notes:**
- WebGPU API
- Data transfer overhead critical
- May not be worth complexity

---

### Issue #74: Web Workers for parallel processing
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:optimization`

**Description:**
Use Web Workers to parallelize agent updates.

**Acceptance Criteria:**
- [ ] Agents processed in parallel
- [ ] Synchronization handled correctly
- [ ] Performance improvement measured
- [ ] Falls back gracefully

**Implementation Notes:**
- Partition agents across workers
- Handle shared state (fields)

---

### Issue #75: Time-series data export
**Epic:** `epic:technical`  
**Priority:** `priority:high`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Export metrics over time for analysis (population, energy, coherence, etc.).

**Acceptance Criteria:**
- [ ] CSV format
- [ ] Configurable metrics
- [ ] Configurable sample rate
- [ ] Works with long runs

**Implementation Notes:**
- Extend Issue #1
- Circular buffer for memory efficiency

---

### Issue #76: Network topology export
**Epic:** `epic:technical`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Export link structure as graph for network analysis.

**Acceptance Criteria:**
- [ ] Graph format (edge list, adjacency matrix)
- [ ] Compatible with NetworkX, igraph
- [ ] Timestamped snapshots
- [ ] Includes node attributes (chi, position, etc.)

---

### Issue #77: 3D visualization option
**Epic:** `epic:visualization`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:feature`

**Description:**
3D rendering option using Three.js or WebGL.

**Features:**
- Agents as spheres
- Fields as volumetric fog
- Camera controls
- Optional for users who want it

---

### Issue #78: Trail history visualization
**Epic:** `epic:visualization`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:feature`

**Description:**
Show agent paths over time (fading trails).

**Acceptance Criteria:**
- [ ] Store recent positions per agent
- [ ] Render as fading lines
- [ ] Configurable trail length
- [ ] Performance impact acceptable

---

### Issue #79: Energy flow visualization
**Epic:** `epic:visualization`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Visualize chi transfer between agents and environment.

**Acceptance Criteria:**
- [ ] Show chi absorption from fields
- [ ] Show chi sharing via links
- [ ] Animated flow
- [ ] Toggle on/off

---

### Issue #80: Agent inspector tool
**Epic:** `epic:visualization`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:feature`

**Description:**
Click agent to view detailed internal state.

**Acceptance Criteria:**
- [ ] Shows: chi, position, velocity, links, state
- [ ] Shows: personality traits (when implemented)
- [ ] Shows: memories (when implemented)
- [ ] Real-time updates
- [ ] Can follow agent

**Implementation Notes:**
- Side panel or modal
- Useful for debugging and understanding

---

## 📚 Documentation (10 Issues)

### Issue #81: Theoretical foundation document
**Epic:** `epic:documentation`  
**Priority:** `priority:high`  
**Complexity:** `complexity:large`  
**Type:** `type:documentation`

**Description:**
Comprehensive explanation of E², C-F-A, Zone 3, theoretical underpinnings.

**Contents:**
- E² (Emergence from Entanglement)
- Constraint-Field-Agent framework
- Zone 3 theory
- Thermodynamic foundations
- Why this approach matters

---

### Issue #82: Architecture guide
**Epic:** `epic:documentation`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
How the system is structured and how components interact.

**Contents:**
- Layered architecture (after refactor)
- Module responsibilities
- Data flow
- Extension points

**Blocked By:** Issues #11-15 (architectural refactor)

---

### Issue #83: API reference
**Epic:** `epic:documentation`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
If we make this a library, document the public API.

**Contents:**
- Function signatures
- Parameter descriptions
- Return values
- Usage examples

---

### Issue #84: Tutorial series
**Epic:** `epic:documentation`  
**Priority:** `priority:high`  
**Complexity:** `complexity:large`  
**Type:** `type:documentation`

**Description:**
Step-by-step tutorials from basics to advanced.

**Tutorials:**
1. Getting started
2. Understanding emergence
3. Parameter exploration
4. Training with CEM
5. Multi-species simulations
6. Custom behaviors
7. Running experiments
8. Data analysis

---

### Issue #85: Contributor guide
**Epic:** `epic:documentation`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:documentation`

**Description:**
How to contribute to the project (if open-sourced).

**Contents:**
- Setup instructions
- Code style
- Testing requirements
- PR process
- Issue templates

---

### Issue #86: Philosophy & motivation document
**Epic:** `epic:documentation`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Why this project exists and what it's trying to accomplish.

**Contents:**
- Core philosophy
- Research goals
- Design principles
- Trajectory so far
- Future vision

---

### Issue #87: Parameter reference
**Epic:** `epic:documentation`  
**Priority:** `priority:high`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Complete reference of all configuration parameters.

**For Each Parameter:**
- Name and path
- Valid range
- Default value
- What it controls
- How it affects behavior
- Related parameters

---

### Issue #88: Troubleshooting guide
**Epic:** `epic:documentation`  
**Priority:** `priority:medium`  
**Complexity:** `complexity:small`  
**Type:** `type:documentation`

**Description:**
Common problems and solutions.

**Sections:**
- Performance issues
- Unexpected behavior
- Configuration errors
- Browser compatibility

---

### Issue #89: Case studies
**Epic:** `epic:documentation`  
**Priority:** `priority:low`  
**Complexity:** `complexity:medium`  
**Type:** `type:documentation`

**Description:**
Documented examples of interesting emergent behaviors.

**Examples:**
- Emergence of cooperation
- Multi-cellular formation
- Resource competition
- Evolutionary adaptation

---

### Issue #90: Video tutorials
**Epic:** `epic:documentation`  
**Priority:** `priority:low`  
**Complexity:** `complexity:large`  
**Type:** `type:documentation`

**Description:**
Screencast tutorials for visual learners.

**Topics:**
- Quick start
- Parameter exploration
- Running experiments
- Interpreting results

---

## Summary Statistics

**Total Issues:** 90

**By Epic:**
- Architecture: 5
- Intelligence: 8
- LLM Interface: 10
- Multi-Species: 6
- Evolution: 7
- Self-Modifying: 8
- Research: 10
- Applications: 5
- Technical: 10
- Visualization: 5
- Documentation: 10
- Quick Wins: 10

**By Priority:**
- Critical: 5
- High: 25
- Medium: 35
- Low: 15
- Research: 10

**By Complexity:**
- Small: 20
- Medium: 40
- Large: 25
- Epic: 5

**By Type:**
- Feature: 45
- Refactor: 5
- Research: 12
- Documentation: 18
- Optimization: 5
- Experiment: 5

---

## Dependency Graph (Major Chains)

```
Architecture Refactor (#11-15)
    ↓
Species Layer (#13)
    ↓
Multi-Species System (#35-40)

Memory System Design (#16)
    ↓
Memory Types (#17-20)
    ↓
Personality System (#21-24)

LLM Research (#25-26)
    ↓
App Structure (#27)
    ↓
LLM Phases (#28-31)
    ↓
Autonomous Experimentation (#31)

Evolution Design (#41)
    ↓
Reproduction (#42-44)
    ↓
Speciation (#45)
    ↓
Long-term Experiments (#46)

Self-Mod Design (#48)
    ↓
Sandboxing (#50) + Invariants (#51)
    ↓
Automated Testing (#52-53)
    ↓
Autonomous Evolution (#55)
```

---

## Recommended Roadmap

### Phase 1: Foundation (Months 1-3)
- Complete Quick Wins (#1-10)
- Begin Architecture Refactor (#11-15)
- Start Documentation (#81, #87)

### Phase 2: Intelligence (Months 4-6)
- Memory System (#16-20)
- Personality System (#21-24)
- Agent Inspector (#80)

### Phase 3: Usability (Months 7-9)
- LLM Interface (#25-34)
- Tutorial Series (#84)

### Phase 4: Expansion (Months 10-12)
- Multi-Species (#35-40)
- Evolution Basics (#41-44)
- Research Tools (#61, #64-65)

### Phase 5: Advanced (Year 2+)
- Self-Modifying Code (#48-55)
- Research Directions (#56-60)
- Applications (#66-70)

---

## Project Board Views

### View 1: Kanban (Status)
Columns: Backlog | Ready | In Progress | Review | Done | Blocked

### View 2: Priority Matrix
Axes: Priority (High/Med/Low) vs Complexity (Small/Large)

### View 3: Epic Timeline
Timeline view grouped by epic, showing milestone dependencies

### View 4: Team View
If multiple contributors, assign issues and show workload

---

## Issue Templates

### Feature Request Template
```
**Epic:** 
**Priority:** 
**Complexity:** 
**Type:** feature

**Description:**
What feature should be added?

**Acceptance Criteria:**
- [ ] Criterion 1
- [ ] Criterion 2

**Implementation Notes:**
Technical considerations

**Blocked By:**
Dependencies

**Blocks:**
What depends on this
```

### Bug Report Template
```
**Description:**
What's broken?

**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Environment:**
Browser/OS/Version

**Screenshots:**
```

### Research Question Template
```
**Epic:** epic:research
**Type:** type:research

**Question:**
What are we investigating?

**Hypothesis:**

**Approach:**

**Success Metrics:**

**Dependencies:**
```

---

## Notes

1. **Start Small:** Begin with Quick Wins to build momentum
2. **Prioritize Foundation:** Architecture refactor unlocks many features
3. **Document as You Go:** Don't defer all documentation to the end
4. **Iterate:** Don't need to complete one epic before starting another
5. **Community Input:** If open-sourced, let community help prioritize
6. **Stay Flexible:** This is a living roadmap, adapt as needed

---

*Generated: November 2025*  
*Based on: Future Directions.md*  
*Total Estimated Effort: ~2-3 person-years for full roadmap*

