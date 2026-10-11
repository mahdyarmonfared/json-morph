const test = require('node:test');
const assert = require('node:assert/strict');
const { formatJson, minifyJson, validateJson } = require('../src/core/formatter');

test('formatJson beautifies JSON with specified indentation', () => {
  const raw = '{"a":1,"b":2}';
  const formatted = formatJson(raw, 2);
  assert.equal(formatted, '{\n  "a": 1,\n  "b": 2\n}');
});

test('minifyJson strips all extra whitespace', () => {
  const formatted = '{\n  "a": 1,\n  "b": 2\n}';
  const minified = minifyJson(formatted);
  assert.equal(minified, '{"a":1,"b":2}');
});

test('validateJson returns valid status and parses string', () => {
  assert.equal(validateJson('{"ok":true}').valid, true);
  assert.equal(validateJson('{invalid}').valid, false);
});
