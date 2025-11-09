# src

This directory contains the modularized source code for the Essence Engine simulation. The codebase has been refactored to separate concerns into distinct modules:

## Directory Structure

- **`core/`** - Core simulation systems including world state management, training orchestration, and simulation loop. These modules handle high-level coordination and state.

- **`systems/`** - Individual behavior systems implemented as pure functions. These modules contain the mechanics for movement, metabolism, resource collection, etc., without side effects.

- **`ui/`** - Browser-specific UI code including canvas management and input handling. These modules isolate DOM and browser APIs from core simulation logic.

- **`utils/`** - Shared utility functions and helpers used across multiple modules.

## Entry Point

The `index.js` file serves as a compatibility bridge, re-exporting globals from the legacy `app.js` entry point. The main application entry point is `app.js` in the root directory, which imports from these modular packages.

## Migration Status

Most core functionality has been migrated to `src/`, but some systems (like the Trail system) remain in `app.js` for now. Future refactoring will continue to move remaining code into appropriate `src/` modules.
