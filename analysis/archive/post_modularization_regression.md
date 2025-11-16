# Post-Modularization Regression Notes

## Summary
- Automated node-based suites completed via the shared ESM loader and passed without failures.
- Manual browser simulation could not be executed in the container environment; a follow-up interactive review is still required.

## Test Matrix
| Command | Result |
| --- | --- |
| `node --loader ./test/esm-loader.mjs test/movement.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/metabolism.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/decay.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/steering.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/controllerAction.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/resourceSystem.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/sensing.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/mitosis.test.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/test-rule110.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/test-tape.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test/test-tc-disabled.js` | ✔ Passed |
| `node --loader ./test/esm-loader.mjs test-adaptive-rewards.js` | ✔ Passed with expected inline machine warning |

## Lessons Learned
- `config.js` must remain import-safe for Node-based utilities. Guarding DOM access behind browser checks prevents regression scripts from crashing when a window or document is unavailable.
- The TC configuration still references on-disk machine tables; falling back to inline descriptors avoids noisy warnings during headless runs and should be prioritized.

## Follow-Up Actions
- [ ] Schedule a manual simulation review in a browser build to validate UI wiring, hotkeys, and adaptive reward overlays.
- [ ] Track an issue to provide inline TC machine descriptors (or loader stubs) so regression scripts no longer warn about missing filesystem access.
