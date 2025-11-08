// Temporary module bridge for the legacy app entrypoint.
// Loads the existing app.js side effects and re-exports its window globals.
import '../app.js';

function setupMobileOptimizations() {
  if (typeof window === 'undefined') return;

  const body = document.body;
  const root = document.documentElement;
  const toggleButton = document.getElementById('mobile-overlay-toggle');
  const hud = document.getElementById('hud-container');

  if (!body || !root || !toggleButton) {
    return;
  }

  let overlaysOpen = false;
  let lastIsMobile = null;
  let resizeQueued = false;

  if (typeof window.matchMedia !== 'function') {
    return;
  }

  const widthQuery = window.matchMedia('(max-width: 768px)');
  const pointerQuery = window.matchMedia('(pointer: coarse)');

  const queueResizeCanvas = () => {
    if (resizeQueued || typeof window.resizeCanvas !== 'function') {
      return;
    }

    resizeQueued = true;
    window.requestAnimationFrame(() => {
      resizeQueued = false;
      if (typeof window.resizeCanvas === 'function') {
        window.resizeCanvas();
      }
    });
  };

  const ensureHudOffset = () => {
    if (!body.classList.contains('is-mobile') || !overlaysOpen || !hud) {
      root.style.setProperty('--hud-offset', '0px');
      return;
    }

    const hudRect = hud.getBoundingClientRect();
    const offset = Math.max(0, Math.ceil(hudRect.height + 12));
    root.style.setProperty('--hud-offset', `${offset}px`);
  };

  const applyOverlayState = () => {
    const isMobile = body.classList.contains('is-mobile');

    if (!isMobile) {
      body.classList.remove('mobile-overlays-open');
      toggleButton.setAttribute('aria-pressed', 'false');
      ensureHudOffset();
      return;
    }

    body.classList.toggle('mobile-overlays-open', overlaysOpen);
    toggleButton.setAttribute('aria-pressed', overlaysOpen ? 'true' : 'false');
    window.requestAnimationFrame(ensureHudOffset);
  };

  const prefersMobile = () => widthQuery.matches || pointerQuery.matches;

  const handleMobileChange = () => {
    const nextIsMobile = prefersMobile();
    body.classList.toggle('is-mobile', nextIsMobile);

    if (nextIsMobile !== lastIsMobile) {
      overlaysOpen = nextIsMobile ? false : true;
      lastIsMobile = nextIsMobile;
    }

    applyOverlayState();
    queueResizeCanvas();
  };

  const attachMediaListener = (query) => {
    if (!query) return;
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handleMobileChange);
    } else if (typeof query.addListener === 'function') {
      query.addListener(handleMobileChange);
    }
  };

  attachMediaListener(widthQuery);
  attachMediaListener(pointerQuery);

  toggleButton.addEventListener('click', () => {
    overlaysOpen = !overlaysOpen;
    applyOverlayState();
    queueResizeCanvas();
  });

  window.addEventListener('resize', () => {
    handleMobileChange();
    queueResizeCanvas();
    if (body.classList.contains('is-mobile') && overlaysOpen) {
      window.requestAnimationFrame(ensureHudOffset);
    }
  }, { passive: true });

  if (window.visualViewport) {
    const handleViewportChange = () => {
      window.requestAnimationFrame(() => {
        handleMobileChange();
        queueResizeCanvas();
        if (body.classList.contains('is-mobile') && overlaysOpen) {
          ensureHudOffset();
        }
      });
    };

    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
  }

  handleMobileChange();
}

setupMobileOptimizations();

if (typeof window !== 'undefined' && typeof window.resizeCanvas === 'function') {
  window.resizeCanvas();
}

export const World = window.World;
export const resizeCanvas = window.resizeCanvas;
export const trainingUI = window.trainingUI;
