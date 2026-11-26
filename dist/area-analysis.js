import {createColorAnalysis, addColorTile, buildFullPalettes} from './color-analysis.js';

export function sourceAreaBounds(area, previewWidth, previewHeight, sourceWidth, sourceHeight) {
  const x = Math.max(0, Math.min(sourceWidth, Math.floor(area.x / previewWidth * sourceWidth)));
  const y = Math.max(0, Math.min(sourceHeight, Math.floor(area.y / previewHeight * sourceHeight)));
  const right = Math.max(x, Math.min(sourceWidth, Math.ceil((area.x + area.w) / previewWidth * sourceWidth)));
  const bottom = Math.max(y, Math.min(sourceHeight, Math.ceil((area.y + area.h) / previewHeight * sourceHeight)));
  return {x, y, w: right - x, h: bottom - y};
}

export async function analyzeSelectedArea({area, previewWidth, previewHeight, sourceWidth, sourceHeight, readTile, isCurrent = () => true, onProgress = () => {}, yieldFrame = () => Promise.resolve(), tileSize = 128}) {
  const bounds = sourceAreaBounds(area, previewWidth, previewHeight, sourceWidth, sourceHeight);
  const analysis = createColorAnalysis({sparseExact: true});
  const totalTiles = Math.ceil(bounds.w / tileSize) * Math.ceil(bounds.h / tileSize);
  let done = 0;
  let lastYield = performance.now();
  for (let y = bounds.y; y < bounds.y + bounds.h; y += tileSize) {
    for (let x = bounds.x; x < bounds.x + bounds.w; x += tileSize) {
      if (!isCurrent()) return null;
      const width = Math.min(tileSize, bounds.x + bounds.w - x);
      const height = Math.min(tileSize, bounds.y + bounds.h - y);
      addColorTile(analysis, readTile(x, y, width, height));
      done++;
      if (performance.now() - lastYield > 12) {
        onProgress(Math.round(done / totalTiles * 100));
        await yieldFrame();
        lastYield = performance.now();
      }
    }
  }
  if (!isCurrent()) return null;
  return {bounds, analysis, palettes: buildFullPalettes(analysis, {minAccentTile: 1})};
}
