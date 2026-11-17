import test from 'node:test';
import assert from 'node:assert/strict';
import {newTouchArea, moveOrResizeArea} from '../dist/selection-geometry.mjs';

test('new selection is square on screen and stays within the image', () => {
  const area = newTouchArea(1200, 800, 300, 200, 0, 0);
  assert.equal(area.x, 0);
  assert.equal(area.y, 0);
  assert.ok(Math.abs(area.w / 1200 * 300 - area.h / 800 * 200) <= 1);
  assert.ok(area.w >= 8 && area.h >= 8);
});

test('moving a selection stops at the image edges', () => {
  const area = {x: 30, y: 40, w: 100, h: 90};
  assert.deepEqual(moveOrResizeArea(area, 'move', -500, 500, 300, 200, 50, 50), {x: 0, y: 110, w: 100, h: 90});
});

test('corner resizing respects minimum size and image bounds', () => {
  const area = {x: 30, y: 40, w: 100, h: 90};
  assert.deepEqual(moveOrResizeArea(area, 'nw', 500, 500, 300, 200, 64, 64), {x: 66, y: 66, w: 64, h: 64});
  assert.deepEqual(moveOrResizeArea(area, 'se', 500, 500, 300, 200, 64, 64), {x: 30, y: 40, w: 270, h: 160});
});
