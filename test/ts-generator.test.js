const test = require('node:test');
const assert = require('node:assert/strict');
const { generateTypeScript } = require('../src/core/ts-generator');

test('generateTypeScript produces strict TypeScript interface definitions', () => {
  const json = {
    id: 1,
    username: 'alice',
    isAdmin: true,
    skills: ['node', 'react'],
    address: {
      city: 'Paris',
      zip: 75001
    }
  };

  const ts = generateTypeScript(json, 'User');

  assert.ok(ts.includes('export interface User {'));
  assert.ok(ts.includes('id: number;'));
  assert.ok(ts.includes('username: string;'));
  assert.ok(ts.includes('isAdmin: boolean;'));
  assert.ok(ts.includes('skills: string[];'));
  assert.ok(ts.includes('address: Address;'));
  assert.ok(ts.includes('export interface Address {'));
});
