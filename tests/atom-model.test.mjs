import test from 'node:test';
import assert from 'node:assert/strict';
import { nucleusPoints } from '../lib/atom-model.mjs';

test('nucleus geometry preserves actual proton and neutron counts from hydrogen to heavy elements', () => {
  for (const [protons, neutrons] of [[1, 0], [6, 6], [26, 30], [92, 146], [118, 176]]) {
    const points = nucleusPoints(protons, neutrons);
    assert.equal(points.length, protons + neutrons);
    assert.equal(points.filter(point => point.isProton).length, protons);
    assert.equal(points.filter(point => !point.isProton).length, neutrons);
    assert.ok(points.every(point => ['x', 'y', 'z'].every(axis => Number.isFinite(point[axis]))));
    assert.ok(points.every(point => Math.hypot(point.x, point.y, point.z) <= 23.001));
    assert.deepEqual(nucleusPoints(protons, neutrons), points, 'Paused geometry must not jitter across rerenders');
  }
});

test('nucleus geometry rejects invalid or unbounded particle counts', () => {
  for (const [protons, neutrons] of [[0,0], [119,0], [1,-1], [1,177], [NaN,6], [1.5,2], [1,Infinity]]) assert.throws(() => nucleusPoints(protons, neutrons));
});
