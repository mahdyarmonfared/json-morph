#!/usr/bin/env node

const { execute } = require('../src/cli/runner');

execute(process.argv.slice(2)).catch((err) => {
  console.error('Fatal JsonMorph error:', err);
  process.exit(1);
});
