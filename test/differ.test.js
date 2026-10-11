const test = require('node:test');
const assert = require('node:assert/strict');
const { diffJson } = require('../src/core/differ');

test('diffJson detects added, removed, and modified fields', () => {
  const left = { a: 1, b: 'old', c: [1, 2] };
  const right = { a: 1, b: 'new', c: [1, 2, 3], d: true };

  const result = diffJson(left, right);

  assert.equal(result.equal, false);
  assert.equal(result.stats.addedCount, 2); // 'd' and 'c[2]'
  assert.equal(result.stats.removedCount, 0);
  assert.equal(result.stats.modifiedCount, 1); // 'b'
});

test('diffJson correctly identifies identical objects', () => {
  const left = { x: 10, y: { z: 'test' } };
  const right = { x: 10, y: { z: 'test' } };

  const result = diffJson(left, right);
  assert.equal(result.equal, true);
  assert.equal(result.stats.totalDifferences, 0);
});
