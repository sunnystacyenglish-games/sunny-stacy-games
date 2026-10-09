// Resolve one answer from the actual source-image region visible in a round lens.
// Inputs use normalized scene coordinates; pixel dimensions preserve aspect ratio.
export function selectLensAnswer(session, {x, y, radius, width, height, magnification = 2}, includeFound = false) {
  if (!session || session.sessionComplete || session.isTransitioning) return null;
  if (![x,y,radius,width,height,magnification].every(Number.isFinite) ||
      radius <= 0 || width <= 0 || height <= 0 || magnification <= 0) return null;
  const cx = x * width, cy = y * height, sourceRadius = radius / magnification;
  let best = null, bestDistance = Infinity;
  for (const answer of session.target.answers) {
    if (!includeFound && session.found.has(answer.id)) continue;
    const region = answer.type === 'object'
      ? session.scene.objects.find(o => o.id === answer.sceneObjectId)
      : session.scene.hotspots.find(h => h.id === answer.hotspotId);
    if (!region) continue;
    // Partially off-scene objects only expose their visible portion.
    const left = Math.max(0, region.x) * width, top = Math.max(0, region.y) * height;
    const right = Math.min(1, region.x + region.width) * width;
    const bottom = Math.min(1, region.y + region.height) * height;
    if (right <= left || bottom <= top) continue;
    const px = Math.max(left, Math.min(right, cx)), py = Math.max(top, Math.min(bottom, cy));
    if (Math.hypot(px-cx, py-cy) > sourceRadius) continue;
    const distance = Math.hypot((left+right)/2-cx, (top+bottom)/2-cy);
    // Strict comparison preserves authored answer order for ties.
    if (distance < bestDistance) { bestDistance = distance; best = answer; }
  }
  return best;
}
