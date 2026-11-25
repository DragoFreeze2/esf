import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from './server.js';

function startTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      resolve({ server, port: address.port });
    });
  });
}

test('serves index.html on root and protects server files', async () => {
  const { server, port } = await startTestServer();
  try {
    const rootRes = await fetch(`http://127.0.0.1:${port}/`);
    assert.equal(rootRes.status, 200);
    const html = await rootRes.text();
    assert.match(html, /Ember Smoke &amp; Flavor/);

    const assetRes = await fetch(`http://127.0.0.1:${port}/assets/hero.jpg`);
    assert.equal(assetRes.status, 200);
    assert.match(assetRes.headers.get('content-type') || '', /image\/jpeg/);

    for (const menuAsset of [
      'full-chicken.jpg',
      'half-chicken.jpg',
      'ember-heat.jpg',
      'ember-white.jpg',
      'original-bbq.jpg',
      'white-rice.jpg',
      'red-rice.jpg',
      'smoked-vegetables.jpg',
      'lamb-neck-sandwich.jpg',
      'rice-and-fasolia.jpg',
    ]) {
      const assetCheck = await fetch(`http://127.0.0.1:${port}/assets/${menuAsset}`);
      assert.equal(assetCheck.status, 200);
      assert.match(assetCheck.headers.get('content-type') || '', /image\/jpeg/);
    }

    const serverFileRes = await fetch(`http://127.0.0.1:${port}/server.js`);
    assert.equal(serverFileRes.status, 404);

    const pkgFileRes = await fetch(`http://127.0.0.1:${port}/package.json`);
    assert.equal(pkgFileRes.status, 404);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
});
