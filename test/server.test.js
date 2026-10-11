const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('http');
const path = require('path');
const { createServer, isPathSafe } = require('../src/server/server');

test('isPathSafe correctly detects directory traversal attempts', () => {
  const base = path.join(__dirname, '../src/ui');
  const safeFile = path.join(__dirname, '../src/ui/index.html');
  const unsafeFile = path.join(__dirname, '../src/ui/../server/server.js');

  assert.equal(isPathSafe(base, safeFile), true);
  assert.equal(isPathSafe(base, unsafeFile), false);
});

test('HTTP server /api/diff endpoint returns structural difference delta', async () => {
  const server = createServer();
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;

  try {
    const postData = JSON.stringify({
      left: { title: 'First' },
      right: { title: 'Second' }
    });

    const res = await new Promise((resolve, reject) => {
      const req = http.request(`http://127.0.0.1:${port}/api/diff`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => resolve({ statusCode: response.statusCode, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(postData);
      req.end();
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.data.equal, false);
    assert.equal(res.data.stats.modifiedCount, 1);
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
