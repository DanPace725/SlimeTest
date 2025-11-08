export function initializeCanvasManager({ canvas, ctx, getAvailableSize }) {
  if (!canvas) {
    throw new Error('initializeCanvasManager requires a canvas element');
  }

  let dpr = 1;
  let canvasWidth = typeof window !== 'undefined' ? window.innerWidth : canvas?.width || 0;
  let canvasHeight = typeof window !== 'undefined' ? window.innerHeight : canvas?.height || 0;
  let offsetTop = 0;
  let offsetLeft = 0;
  let offsetBottom = 0;
  let offsetRight = 0;
  const resizeCallbacks = new Set();

  const applyResize = () => {
    if (typeof window !== 'undefined') {
      dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 3));
    }

    const size = typeof getAvailableSize === 'function'
      ? getAvailableSize()
      : { width: canvasWidth, height: canvasHeight };

    canvasWidth = Math.max(0, size?.width ?? canvasWidth);
    canvasHeight = Math.max(0, size?.height ?? canvasHeight);
    offsetTop = Math.max(0, size?.topOffset ?? 0);
    offsetLeft = Math.max(0, size?.leftOffset ?? 0);
    offsetBottom = Math.max(0, size?.bottomOffset ?? 0);
    offsetRight = Math.max(0, size?.rightOffset ?? 0);

    const targetWidth = Math.floor(canvasWidth * dpr);
    const targetHeight = Math.floor(canvasHeight * dpr);

    if (canvas.width !== targetWidth) canvas.width = targetWidth;
    if (canvas.height !== targetHeight) canvas.height = targetHeight;

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    if (canvas.style) {
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      canvas.style.position = 'fixed';
      canvas.style.top = `${offsetTop}px`;
      canvas.style.left = `${offsetLeft}px`;
      canvas.style.right = 'auto';
      canvas.style.bottom = 'auto';
    }

    for (const callback of resizeCallbacks) {
      callback({
        width: canvasWidth,
        height: canvasHeight,
        dpr,
        canvas,
        ctx,
        topOffset: offsetTop,
        leftOffset: offsetLeft,
        bottomOffset: offsetBottom,
        rightOffset: offsetRight
      });
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('resize', applyResize, { passive: true });
  }

  const onResize = (callback) => {
    if (typeof callback === 'function') {
      resizeCallbacks.add(callback);
      return () => resizeCallbacks.delete(callback);
    }
    return () => {};
  };

  const getState = () => ({
    width: canvasWidth,
    height: canvasHeight,
    dpr,
    topOffset: offsetTop,
    leftOffset: offsetLeft,
    bottomOffset: offsetBottom,
    rightOffset: offsetRight
  });

  return { resizeCanvas: applyResize, onResize, getState };
}
