const cloneInstructionList = (program = []) => {
  if (!Array.isArray(program)) return [];
  const cloned = [];
  for (const entry of program) {
    if (!entry || typeof entry !== 'object') continue;
    const op = typeof entry.op === 'string' ? entry.op : null;
    if (!op) continue;
    const args = Array.isArray(entry.args) ? entry.args.slice() : [];
    cloned.push({ op, args });
  }
  return cloned;
};

const cloneMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object') return null;
  return { ...metadata };
};

const GENOME_PRESETS = {
  'hunger-loop': {
    program: [
      { op: 'SET_EXPLORE', args: [0.25] },
      { op: 'IF_HUNGER_GT', args: [0.6, 3] },
      { op: 'SET_BOND_THRESHOLD', args: [0.5] },
      { op: 'GOTO', args: [1] }
    ],
    manifestKey: 'preset:hunger-loop',
    origin: 'preset.hunger-loop',
    metadata: {
      description: 'Loop that raises explore noise when hunger exceeds 60% and relaxes bonds otherwise.'
    }
  },
  'chi-branch': {
    program: [
      { op: 'SET_EXPLORE', args: [0.8] },
      { op: 'IF_CHI_LT', args: [8, 3] },
      { op: 'GOTO', args: [0] },
      { op: 'SET_BOND_THRESHOLD', args: [0.2] },
      { op: 'GOTO', args: [0] }
    ],
    manifestKey: 'preset:chi-branch',
    origin: 'preset.chi-branch',
    metadata: {
      description: 'Keeps high exploration until chi recovers, then lowers bond threshold to stay linked.'
    }
  }
};

const resolveGenomePreset = (name) => {
  if (!name || typeof name !== 'string') return null;
  const key = name.trim().toLowerCase();
  const preset = GENOME_PRESETS[key];
  if (!preset) return null;
  return {
    program: cloneInstructionList(preset.program),
    manifestKey: preset.manifestKey ?? `preset:${key}`,
    origin: preset.origin ?? key,
    metadata: cloneMetadata(preset.metadata)
  };
};

export {
  GENOME_PRESETS,
  resolveGenomePreset,
  cloneInstructionList
};
