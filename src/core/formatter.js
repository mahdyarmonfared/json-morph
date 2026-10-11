/**
 * JSON Formatting, Validation, and Minification Utilities for JsonMorph.
 */

function validateJson(input) {
  if (typeof input === 'object' && input !== null) {
    return { valid: true, data: input, error: null };
  }
  try {
    const data = JSON.parse(input);
    return { valid: true, data, error: null };
  } catch (err) {
    return { valid: false, data: null, error: err.message };
  }
}

function formatJson(input, indent = 2) {
  const val = validateJson(input);
  if (!val.valid) {
    throw new Error(`Invalid JSON: ${val.error}`);
  }
  const space = typeof indent === 'number' ? ' '.repeat(indent) : (indent === '\t' ? '\t' : '  ');
  return JSON.stringify(val.data, null, space);
}

function minifyJson(input) {
  const val = validateJson(input);
  if (!val.valid) {
    throw new Error(`Invalid JSON: ${val.error}`);
  }
  return JSON.stringify(val.data);
}

module.exports = {
  validateJson,
  formatJson,
  minifyJson
};
