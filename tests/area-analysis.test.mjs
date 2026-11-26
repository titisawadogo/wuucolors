import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeSelectedArea, sourceAreaBounds} from '../dist/area-analysis.js';
import {createColorAnalysis, addColorTile, exactColorPage, exactCsvChunks, exactPixelCount} from '../dist/color-analysis.js';

test('selection maps from a scaled preview to original image pixels', () => {
  assert.deepEqual(
    sourceAreaBounds({x: 50, y: 20, w: 80, h: 40}, 200, 100, 400, 200),
    {x: 100, y: 40, w: 160, h: 80}
  );
  assert.deepEqual(
    sourceAreaBounds({x: 5, y: 7, w: 10, h: 8}, 100, 100, 100, 100),
    {x: 5, y: 7, w: 10, h: 8}
  );
});

test('selected area counts a single accent pixel and excludes pixels outside it', async () => {
  const result = await analyzeSelectedArea({
    area: {x: 50, y: 20, w: 80, h: 40},
    previewWidth: 200, previewHeight: 100,
    sourceWidth: 400, sourceHeight: 200,
    tileSize: 32,
    readTile(x, y, width, height) {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const i = (row * width + col) * 4;
          const red = x + col === 120 && y + row === 50;
          const outsideBlue = x + col === 10 && y + row === 10;
          data[i] = outsideBlue ? 0 : 255;
          data[i + 1] = red || outsideBlue ? 0 : 255;
          data[i + 2] = red ? 0 : outsideBlue ? 255 : 255;
          data[i + 3] = 255;
        }
      }
      return data;
    }
  });

  assert.deepEqual(result.bounds, {x: 100, y: 40, w: 160, h: 80});
  assert.equal(result.analysis.total, 12_800);
  assert.equal(result.analysis.unique, 2);
  assert.equal(exactPixelCount(result.analysis, 0xFF0000), 1);
  assert.equal(exactPixelCount(result.analysis, 0xFFFFFF), 12_799);
  assert.equal(exactPixelCount(result.analysis, 0x0000FF), 0);
  assert.ok(result.palettes.accents.some(color => color.r === 255 && color.g === 0 && color.b === 0));
  assert.deepEqual(exactColorPage(result.analysis, 0, 'FF0000').rows, [{color: '#FF0000', count: 1}]);
  assert.match(exactCsvChunks(result.analysis, 0, 2), /#FF0000,1,0\.007813/);
});

test('full-image exact counting still uses the original dense scan', () => {
  const analysis = createColorAnalysis();
  addColorTile(analysis, new Uint8ClampedArray([
    255, 0, 0, 255,
    255, 255, 255, 255,
    0, 0, 255, 0
  ]));
  assert.equal(analysis.total, 2);
  assert.equal(analysis.unique, 2);
  assert.equal(exactPixelCount(analysis, 0xFF0000), 1);
  assert.deepEqual(exactColorPage(analysis, 0xFF0000, 'FF0000').rows, [{color: '#FF0000', count: 1}]);
  assert.match(exactCsvChunks(analysis, 0xFF0000, 0xFF0001), /#FF0000,1,50\.000000/);
});
