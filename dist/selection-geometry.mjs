const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function newTouchArea(imageWidth, imageHeight, displayWidth, displayHeight, centerX, centerY) {
  const side = Math.min(180, Math.max(96, Math.min(displayWidth, displayHeight) * 0.4));
  const width = Math.min(imageWidth, Math.max(8, Math.round(side / displayWidth * imageWidth)));
  const height = Math.min(imageHeight, Math.max(8, Math.round(side / displayHeight * imageHeight)));
  return {
    x: Math.round(clamp(centerX - width / 2, 0, imageWidth - width)),
    y: Math.round(clamp(centerY - height / 2, 0, imageHeight - height)),
    w: width,
    h: height
  };
}

export function moveOrResizeArea(original, action, dx, dy, imageWidth, imageHeight, minWidth, minHeight) {
  if (action === 'move') {
    return {
      ...original,
      x: Math.round(clamp(original.x + dx, 0, imageWidth - original.w)),
      y: Math.round(clamp(original.y + dy, 0, imageHeight - original.h))
    };
  }
  let left = original.x, top = original.y;
  let right = original.x + original.w, bottom = original.y + original.h;
  if (action.includes('w')) left = clamp(original.x + dx, 0, right - minWidth);
  if (action.includes('e')) right = clamp(original.x + original.w + dx, left + minWidth, imageWidth);
  if (action.includes('n')) top = clamp(original.y + dy, 0, bottom - minHeight);
  if (action.includes('s')) bottom = clamp(original.y + original.h + dy, top + minHeight, imageHeight);
  left = Math.round(left); top = Math.round(top);
  right = Math.round(right); bottom = Math.round(bottom);
  return {x: left, y: top, w: right - left, h: bottom - top};
}
