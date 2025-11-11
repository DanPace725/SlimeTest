class OverlayStore {
  constructor() {
    this.enabled = false;
    this.maxEntries = 6;
    this.entries = [];
    this.configuration = {
      corner: 'top-right',
      opacity: 0.85,
      width: 320,
      lineHeight: 15
    };
  }

  configure(options = {}) {
    const {
      enabled = false,
      maxEntries = 6,
      corner = 'top-right',
      opacity = 0.85,
      width = 320,
      lineHeight = 15
    } = options || {};
    this.enabled = Boolean(enabled);
    this.maxEntries = Math.max(1, Math.floor(maxEntries || 1));
    this.configuration = {
      corner,
      opacity,
      width,
      lineHeight
    };
    if (!this.enabled) {
      this.entries = [];
    } else if (this.entries.length > this.maxEntries) {
      this.entries.length = this.maxEntries;
    }
  }

  recordSnapshot(entry = {}) {
    if (!this.enabled) return;
    if (!entry.type) return;
    const normalized = {
      type: entry.type,
      tick: Number.isFinite(entry.tick) ? Math.floor(entry.tick) : 0,
      manifestKey: entry.manifestKey ?? null,
      origin: entry.origin ?? null,
      metadata: entry.metadata ? { ...entry.metadata } : null,
      summary: entry.summary ? { ...entry.summary } : null,
      timestamp: entry.timestamp ?? Date.now()
    };
    this.entries.unshift(normalized);
    if (this.entries.length > this.maxEntries) {
      this.entries.length = this.maxEntries;
    }
  }

  getEntries() {
    return this.entries.slice();
  }

  clear() {
    this.entries = [];
  }

  getConfig() {
    return {
      enabled: this.enabled,
      maxEntries: this.maxEntries,
      ...this.configuration
    };
  }
}

export const TcOverlayStore = new OverlayStore();

if (typeof window !== 'undefined') {
  window.TcOverlayStore = TcOverlayStore;
}
