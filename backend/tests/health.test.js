import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('Health Check', () => {
  it('GET /api/v1/health should return 200 or 503 with correct format', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const body = await res.json();

    assert.ok(body.success !== undefined, 'Response should have success field');
    assert.ok(body.api !== undefined, 'Response should have api field');
    assert.ok(body.timestamp !== undefined, 'Response should have timestamp');
    assert.ok(body.version !== undefined, 'Response should have version');
    assert.ok(typeof body.message === 'string', 'Message should be a string');
  });
});

describe('API Root', () => {
  it('GET /api/v1/ should return API info', async () => {
    const res = await fetch(`${baseUrl}/api/v1/`);
    const body = await res.json();

    assert.equal(body.success, true);
    assert.equal(body.message, 'Navix Management API');
    assert.equal(body.version, 'v1');
  });
});

describe('404 Handler', () => {
  it('GET /api/v1/does-not-exist should return 404 with error format', async () => {
    const res = await fetch(`${baseUrl}/api/v1/does-not-exist`);

    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error);
    assert.equal(body.error.code, 'ROUTE_NOT_FOUND');
  });
});

describe('Request ID', () => {
  it('Should return X-Request-Id header', async () => {
    const res = await fetch(`${baseUrl}/api/v1/health`);
    const requestId = res.headers.get('x-request-id');

    assert.ok(requestId, 'Should have X-Request-Id header');
    assert.ok(typeof requestId === 'string' && requestId.length > 0);
  });
});
