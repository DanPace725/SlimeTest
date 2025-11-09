// app/constants.js - Shared constants and enums
export const SIGNAL_CHANNELS = {
    resource: 0,
    distress: 1,
    bond: 2
};

export const SIGNAL_MEMORY_LENGTH = Math.max(3, 12); // Default if not in CONFIG

// Signal system constants
export const SIGNAL_DISTRESS_NOISE_GAIN = 1.5;
export const SIGNAL_RESOURCE_PULL_GAIN = 2.5;
export const SIGNAL_BOND_CONFLICT_DAMP = 0.7;

// Agent display constants
export const CLASSIC_AGENT_COLORS = {
    1: { alive: "#00ffff", dead: "#005555" },  // cyan
    2: { alive: "#ff00ff", dead: "#550055" },  // magenta
    3: { alive: "#ffff00", dead: "#555500" },  // yellow
    4: { alive: "#ff8800", dead: "#553300" },  // orange
};

export const CLASSIC_AGENT_RGB = {
    1: { r: 0, g: 255, b: 255 },    // cyan
    2: { r: 255, g: 0, b: 255 },    // magenta
    3: { r: 255, g: 255, b: 0 },    // yellow
    4: { r: 255, g: 136, b: 0 }     // orange
};