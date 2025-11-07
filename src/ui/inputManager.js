const movementKeys = [
  'arrowup',
  'w',
  'arrowdown',
  's',
  'arrowleft',
  'a',
  'arrowright',
  'd'
];

export function initializeInputManager({
  canvas,
  getWorld,
  getTrail,
  getSignalField,
  getTrainingUI,
  CONFIG
}) {
  const held = new Set();
  const state = {
    showScentGradient: true,
    showFertility: false,
    hudDisplayMode: 'full',
    showAgentDashboard: false
  };
  let showHotkeyStrip = true;

  const handleKeydown = (event) => {
    const e = event || window.event;
    const key = e.key.toLowerCase();
    if (movementKeys.includes(key)) {
      held.add(key);
    }

    const world = typeof getWorld === 'function' ? getWorld() : undefined;
    const trail = typeof getTrail === 'function' ? getTrail() : undefined;
    const signalField = typeof getSignalField === 'function' ? getSignalField() : undefined;
    const trainingUI = typeof getTrainingUI === 'function' ? getTrainingUI() : undefined;

    switch (e.code) {
      case 'Space':
        if (world) {
          world.paused = !world.paused;
          e.preventDefault();
        }
        break;
      case 'KeyR':
        world?.reset();
        break;
      case 'KeyK': {
        showHotkeyStrip = !showHotkeyStrip;
        const hotkeyStrip = document.getElementById('hotkey-strip');
        if (hotkeyStrip) {
          hotkeyStrip.classList.toggle('hidden', !showHotkeyStrip);
        }
        console.log(`⌨️  Hotkey strip ${showHotkeyStrip ? 'VISIBLE' : 'HIDDEN'}`);
        e.preventDefault();
        break;
      }
      case 'KeyC':
        world?.bundles?.forEach((bundle) => {
          bundle.chi += 5;
          bundle.alive = true;
          bundle.deathTick = -1;
          bundle.decayProgress = 0;
        });
        break;
      case 'KeyS':
        world?.bundles?.forEach((bundle) => {
          bundle.extendedSensing = !bundle.extendedSensing;
        });
        break;
      case 'KeyT':
        if (CONFIG) CONFIG.renderTrail = !CONFIG.renderTrail;
        break;
      case 'KeyX':
        trail?.clear?.();
        signalField?.clear?.();
        break;
      case 'KeyF':
        if (CONFIG) CONFIG.enableDiffusion = !CONFIG.enableDiffusion;
        break;
      case 'KeyA':
        if (CONFIG) CONFIG.autoMove = !CONFIG.autoMove;
        break;
      case 'KeyL':
        trainingUI?.toggle?.();
        break;
      case 'KeyG':
        state.showScentGradient = !state.showScentGradient;
        break;
      case 'KeyM':
        if (CONFIG?.mitosis) {
          CONFIG.mitosis.enabled = !CONFIG.mitosis.enabled;
          console.log(`🧫 Mitosis ${CONFIG.mitosis.enabled ? 'ENABLED' : 'DISABLED'}`);
        }
        break;
      case 'KeyP':
        state.showFertility = !state.showFertility;
        break;
      case 'KeyH':
        state.showAgentDashboard = !state.showAgentDashboard;
        break;
      case 'KeyU':
        if (state.hudDisplayMode === 'full') state.hudDisplayMode = 'minimal';
        else if (state.hudDisplayMode === 'minimal') state.hudDisplayMode = 'hidden';
        else state.hudDisplayMode = 'full';
        console.log(`📊 HUD mode: ${state.hudDisplayMode.toUpperCase()}`);
        break;
      case 'Digit1':
      case 'Digit2':
      case 'Digit3':
      case 'Digit4': {
        const index = Number(e.code.replace('Digit', '')) - 1;
        const bundle = world?.bundles?.[index];
        if (bundle) bundle.visible = !bundle.visible;
        break;
      }
      case 'KeyV':
        world?.bundles?.forEach((bundle) => {
          bundle.visible = !bundle.visible;
        });
        break;
      case 'KeyE':
        if (canvas) {
          e.preventDefault();
          canvas.toBlob((blob) => {
            if (!blob) return;
            const url = URL.createObjectURL(blob);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `slime-screenshot-${timestamp}.png`;
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log(`📸 Screenshot saved: ${filename}`);
          }, 'image/png');
        }
        break;
      default:
        break;
    }
  };

  const handleKeyup = (event) => {
    const key = event.key.toLowerCase();
    held.delete(key);
  };

  window.addEventListener('keydown', handleKeydown);
  window.addEventListener('keyup', handleKeyup);

  const dispose = () => {
    window.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('keyup', handleKeyup);
  };

  return { held, state, dispose };
}
