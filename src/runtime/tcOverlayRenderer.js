import { CONFIG } from './config.js';
import { TcOverlayStore } from './tcOverlayStore.js';

const CORNERS = {
  'top-left': { x: 20, y: 20 },
  'top-right': { x: -20, y: 20 },
  'bottom-left': { x: 20, y: -20 },
  'bottom-right': { x: -20, y: -20 }
};

const formatSummary = (summary) => {
  if (!summary || typeof summary !== 'object') return '';
  if (summary.description) return summary.description;
  const parts = [];
  if (typeof summary.activeCells !== 'undefined' && typeof summary.width !== 'undefined') {
    parts.push(`active ${summary.activeCells}/${summary.width}`);
  }
  if (typeof summary.headState === 'string') {
    parts.push(`state ${summary.headState}@${summary.headPosition ?? '?'}`);
  }
  if (summary.bias) {
    const bias = summary.bias;
    const biasParts = [];
    if (typeof bias.distress === 'number') biasParts.push(`distress=${bias.distress.toFixed(2)}`);
    if (typeof bias.bond === 'number') biasParts.push(`bond=${bias.bond.toFixed(2)}`);
    if (biasParts.length) {
      parts.push(`bias ${biasParts.join(', ')}`);
    }
  }
  if (summary.programLength) {
    parts.push(`${summary.programLength} ops`);
  }
  if (summary.machineId) {
    parts.push(summary.machineId);
  }
  if (parts.length === 0) {
    const entries = Object.entries(summary)
      .slice(0, 3)
      .map(([key, value]) => `${key}=${typeof value === 'number' ? value.toFixed?.(2) ?? value : value}`);
    return entries.join(' · ');
  }
  return parts.join(' · ');
};

export const drawTcOverlay = (ctx, canvasWidth, canvasHeight) => {
  const overlayConfig = CONFIG.tc?.overlay || {};
  if (!overlayConfig.enabled) return;
  const entries = TcOverlayStore.getEntries();
  if (!entries.length) return;

  const width = overlayConfig.width || 320;
  const padding = 12;
  const lineHeight = overlayConfig.lineHeight || 15;
  const headerHeight = 20;
  const maxEntries = Math.min(entries.length, overlayConfig.maxEntries || 6);
  const panelHeight = headerHeight + padding * 2 + maxEntries * (lineHeight + 6);

  const cornerKey = overlayConfig.corner || 'top-right';
  const corner = CORNERS[cornerKey] || CORNERS['top-right'];
  let x = corner.x > 0 ? corner.x : canvasWidth + corner.x - width;
  let y = corner.y > 0 ? corner.y : canvasHeight + corner.y - panelHeight;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(x, y, width, panelHeight);

  ctx.strokeStyle = 'rgba(0, 255, 136, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, width, panelHeight);

  ctx.fillStyle = '#00ff88';
  ctx.font = 'bold 13px ui-mono, monospace';
  ctx.fillText('TC Overlay', x + padding, y + padding + 4);

  ctx.font = '11px ui-mono, monospace';
  ctx.fillStyle = '#9cf5d7';
  ctx.fillText(`${entries.length} snapshots`, x + width - padding - 110, y + padding + 4);

  ctx.font = '11px ui-mono, monospace';
  ctx.fillStyle = '#e0ffe8';

  let cursorY = y + padding + headerHeight;
  const subset = entries.slice(0, maxEntries);
  for (const entry of subset) {
    const label = `${entry.type.replace('tc.', '')} · tick ${entry.tick}`;
    ctx.fillStyle = '#00ff99';
    ctx.fillText(label, x + padding, cursorY);
    cursorY += lineHeight;
    ctx.fillStyle = '#d4fbea';
    const detailLine = entry.manifestKey || entry.origin || '(no manifest)';
    ctx.fillText(detailLine, x + padding, cursorY);
    cursorY += lineHeight;
    const summaryLine = formatSummary(entry.summary);
    if (summaryLine) {
      ctx.fillStyle = '#a5efd9';
      ctx.fillText(summaryLine, x + padding, cursorY);
      cursorY += lineHeight;
    }
    cursorY += 6;
  }

  ctx.restore();
};
