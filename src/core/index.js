/**
 * Core Exports for JsonMorph.
 */

const formatter = require('./formatter');
const differ = require('./differ');
const tsGenerator = require('./ts-generator');

module.exports = {
  ...formatter,
  ...differ,
  ...tsGenerator
};
