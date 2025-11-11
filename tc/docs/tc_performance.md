# TC Performance & Regression Summary

## Regression coverage with `tc.enabled = false`
- Added `test/test-tc-disabled.js` to replay the existing Rule 110 and unary tape fixtures with the TC scheduler fully disabled.
- The script reuses the canonical hash fixtures under `analysis/fixtures/` to assert that the disabled scheduler continues to emit the exact same bit patterns as the deterministic baselines.
- Run with: `node --experimental-loader ./test/esm-loader.mjs test/test-tc-disabled.js`.

## Perf telemetry methodology
- Introduced `analysis/tc/measureTcPerformance.mjs` to benchmark TC-heavy workloads with the scheduler toggled on/off.
- The harness runs 2,000 ticks of a 256-cell Rule 110 stepper and the unary incrementer tape machine while capturing wall-clock timing and `process.cpuUsage` deltas.
- Results are persisted to `analysis/tc/tc-performance-report.json` for reproducibility (file regenerated on each invocation).
- Execute via: `node --experimental-loader ./test/esm-loader.mjs analysis/tc/measureTcPerformance.mjs`.

## Observations (2025-11-07 snapshot)
- **Rule 110:** TC-off mode trails by ~10% wall time due to hook overhead, but CPU per step remains within 4% of TC-on thanks to the shared chunk cache.
- **Unary tape:** TC-off is marginally faster (≈3% wall/CPU improvement) because manifest emission remains idle while storage churn stays low.
- No cache-size adjustments were required; the default 32-chunk budget was sufficient to keep both workloads eviction-free.
- Future tuning knobs remain `TcScheduler.tickSalt` (already pinned) and `TcChunkStorage.maxChunks` when scaling to wider tapes.

## Genome runtime monitoring (2025-11-12 baseline)
- **Shared scheduler plumbing.** The genome interpreter now registers through `registerAgentGenomeStepper`, so its capture/compute/commit costs show up in the same `TcScheduler` traces we already collect for Rule 110 and tape steppers. Any deterministic drift can be reproduced locally via `node --experimental-loader ./test/esm-loader.mjs test/test-genome-runtime.js`, which replays the fixtures under `analysis/fixtures/genome-runtime-hashes.json`.【F:tc/tcGenomeRuntime.js†L629-L666】【F:test/test-genome-runtime.js†L1-L47】【F:analysis/fixtures/genome-runtime-hashes.json†L1-L105】
- **TC-off guardrail.** `test/test-genome-disabled.js` mirrors the existing TC-disabled regression to prove that toggling `tc.enabled` still bypasses the interpreter without perturbing the rest of the sim. Keep this script green whenever touching scheduler plumbing; it doubles as the smoke test for “genome hooks detached equals no-op.”【F:test/test-genome-disabled.js†L1-L47】
- **Signal-field touchpoints.** Genome outputs only mutate `bundle.interpretation_bias` before `computeAIDirection` multiplies them into signal-sourced gradients, so the channel stats/analytics cadence documented in the TC channel design note remain the authoritative guide for monitoring noise or bias spikes. Treat any sustained divergence in signal power/coherence as a regression in the genome pathway rather than the signal stack itself.【F:src/core/bundle.js†L378-L392】【F:tc/docs/tc_channel_design.md†L3-L23】
- **Performance expectation.** Each interpreter tick executes a single instruction, stages bias updates in the buffer, and writes them back during commit; no typed-array copies occur, and storage churn stays inside the small object chunks described in `createGenomeRuntime`. On current hardware the two published fixtures finish in sub-millisecond wall time, so profiling should flag anything above ~1 ms per 10 genome ticks as anomalous. If totals exceed that budget, inspect scheduler phase timings before widening chunk caches or changing manifests.【F:tc/tcGenomeRuntime.js†L400-L618】
