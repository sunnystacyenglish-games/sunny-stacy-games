// View-only geometry. Scene coordinates remain normalized; nothing is persisted.
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

export function fitSceneView(viewport, image, {zoom = 1, panX = 0, panY = 0} = {}) {
  const values = [viewport.width, viewport.height, image.width, image.height, zoom, panX, panY];
  if (!values.every(Number.isFinite) || values.slice(0, 5).some(n => n <= 0)) {
    throw new RangeError('Scene view needs positive dimensions and zoom.');
  }
  const scale = Math.min(viewport.width / image.width, viewport.height / image.height) * zoom;
  const width = image.width * scale, height = image.height * scale;
  // Keep a fitting axis centered; prevent panning an enlarged scene completely away.
  const x = clamp(panX, -Math.max(0, (width - viewport.width) / 2), Math.max(0, (width - viewport.width) / 2));
  const y = clamp(panY, -Math.max(0, (height - viewport.height) / 2), Math.max(0, (height - viewport.height) / 2));
  return {left: (viewport.width - width) / 2 + x, top: (viewport.height - height) / 2 + y,
    width, height, scale, panX: x, panY: y};
}

export function sceneToView(point, rect) {
  return {x: rect.left + point.x * rect.width, y: rect.top + point.y * rect.height};
}

export function viewToScene(point, rect) {
  if (!(rect.width > 0 && rect.height > 0)) throw new RangeError('Scene rectangle must have positive dimensions.');
  // Do not clamp: callers must distinguish letterboxing from an actual scene hit.
  return {x: (point.x - rect.left) / rect.width, y: (point.y - rect.top) / rect.height};
}

export function lensToScene(point, lensCenter, sceneRect, magnification) {
  if (!Number.isFinite(magnification) || magnification <= 0) throw new RangeError('Invalid magnification.');
  return viewToScene({x: lensCenter.x + (point.x - lensCenter.x) / magnification,
    y: lensCenter.y + (point.y - lensCenter.y) / magnification}, sceneRect);
}
