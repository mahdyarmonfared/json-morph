/**
 * HTTP Server & REST API Engine for JsonMorph.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { diffJson, generateTypeScript, formatJson, minifyJson } = require('../core');
const { chalk } = require('../cli/ansi');

const UI_DIR = path.join(__dirname, '../ui');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function isPathSafe(baseDir, targetPath) {
  const resolvedBase = path.resolve(baseDir);
  const resolvedTarget = path.resolve(targetPath);
  return resolvedTarget === resolvedBase || resolvedTarget.startsWith(resolvedBase + path.sep);
}

function handleStaticFile(req, res) {
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') {
    reqPath = '/index.html';
  }

  const filePath = path.join(UI_DIR, reqPath);

  if (!isPathSafe(UI_DIR, filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('403 Forbidden: Directory traversal blocked');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  });
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
      if (body.length > 5 * 1024 * 1024) { // 5MB limit
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body.trim()) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', reject);
  });
}

function createServer() {
  const server = http.createServer(async (req, res) => {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const urlPath = req.url.split('?')[0];

    // API Routes
    if (urlPath === '/api/diff' && req.method === 'POST') {
      try {
        const { left, right } = await parseJsonBody(req);
        if (left === undefined || right === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Both left and right JSON payloads required' }));
          return;
        }

        const result = diffJson(left, right);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    if (urlPath === '/api/to-ts' && req.method === 'POST') {
      try {
        const { json, rootName } = await parseJsonBody(req);
        if (json === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'JSON payload is required' }));
          return;
        }

        const ts = generateTypeScript(json, rootName || 'RootObject');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ts }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    if (urlPath === '/api/format' && req.method === 'POST') {
      try {
        const { json, indent = 2, minify = false } = await parseJsonBody(req);
        if (json === undefined) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'JSON payload is required' }));
          return;
        }

        const output = minify ? minifyJson(json) : formatJson(json, indent);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ output }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
      return;
    }

    if (urlPath === '/api/health' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', name: 'json-morph', version: '1.0.0' }));
      return;
    }

    // Static Asset Delivery
    if (req.method === 'GET') {
      handleStaticFile(req, res);
      return;
    }

    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('Method Not Allowed');
  });

  return server;
}

function startServer(port = 3020) {
  const server = createServer();
  server.listen(port, () => {
    console.log(`\n🧬 JsonMorph Web Studio running at: http://localhost:${port}`);
    console.log(`Press Ctrl+C to stop.\n`);
  });
  return server;
}

module.exports = {
  createServer,
  startServer,
  isPathSafe
};
