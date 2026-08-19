import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const BASE_URL = 'http://localhost:8099';
let server;

async function req(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

describe('Auth Integration', () => {
  before(async () => {
    createPool();
    await new Promise((resolve) => { server = app.listen(8099, resolve); });
    const pool = getPool();
    await pool.execute('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_inttest@test.com']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%_inttest@test.com']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['IntTest%']);
  });

  after(async () => {
    const pool = getPool();
    await pool.execute('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_inttest@test.com']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%_inttest@test.com']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['IntTest%']);
    server.close();
    await closePool();
  });

  let accessToken, refreshToken, userId;

  it('POST /auth/register — should register a client', async () => {
    const ts = Date.now();
    const { status, data } = await req('POST', '/api/v1/auth/register', {
      firstName: 'Test',
      lastName: 'Client',
      email: `client_inttest${ts}@test.com`,
      password: 'Test1234',
      confirmPassword: 'Test1234',
      companyName: 'IntTest Corp',
      role: 'client_enterprise',
    });
    assert.strictEqual(status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.user);
    assert.ok(data.data.tokens.accessToken);
    assert.ok(data.data.tokens.refreshToken);
    assert.strictEqual(data.data.user.role, 'client_enterprise');
    assert.ok(data.data.company);
    assert.strictEqual(data.data.company.name, 'IntTest Corp');
    accessToken = data.data.tokens.accessToken;
    refreshToken = data.data.tokens.refreshToken;
    userId = data.data.user.id;
  });

  it('POST /auth/register — should reject duplicate email', async () => {
    const ts = Date.now();
    const first = await req('POST', '/api/v1/auth/register', {
      firstName: 'First', lastName: 'User',
      email: `dup_inttest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'IntTest Dup', role: 'client_enterprise',
    });
    assert.strictEqual(first.status, 201);
    const second = await req('POST', '/api/v1/auth/register', {
      firstName: 'Second', lastName: 'User',
      email: `dup_inttest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'IntTest Dup 2', role: 'client_enterprise',
    });
    assert.strictEqual(second.status, 409);
  });

  it('POST /auth/register — should reject super_admin role', async () => {
    const ts = Date.now();
    const { status } = await req('POST', '/api/v1/auth/register', {
      firstName: 'Hacker', lastName: 'Admin',
      email: `hack_inttest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      role: 'super_admin',
    });
    assert.strictEqual(status, 400);
  });

  it('POST /auth/register — should reject weak password', async () => {
    const ts = Date.now();
    const { status, data } = await req('POST', '/api/v1/auth/register', {
      firstName: 'Weak', lastName: 'User',
      email: `weak_inttest${ts}@test.com`, password: 'weak', confirmPassword: 'weak',
      companyName: 'IntTest Weak', role: 'client_enterprise',
    });
    assert.strictEqual(status, 422);
  });

  it('POST /auth/login — should login with valid credentials', async () => {
    const ts = Date.now();
    const reg = await req('POST', '/api/v1/auth/register', {
      firstName: 'Login', lastName: 'Test',
      email: `login_inttest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'IntTest Login', role: 'client_enterprise',
    });
    const { status, data } = await req('POST', '/api/v1/auth/login', {
      email: `login_inttest${ts}@test.com`, password: 'Test1234',
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.tokens.accessToken);
    assert.ok(data.data.user);
  });

  it('POST /auth/login — should reject wrong password', async () => {
    const ts = Date.now();
    await req('POST', '/api/v1/auth/register', {
      firstName: 'Wp', lastName: 'Test',
      email: `wp_inttest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'IntTest Wp', role: 'client_enterprise',
    });
    const { status, data } = await req('POST', '/api/v1/auth/login', {
      email: `wp_inttest${ts}@test.com`, password: 'WrongPass99',
    });
    assert.strictEqual(status, 401);
    assert.strictEqual(data.error.code, 'AUTHENTICATION_ERROR');
  });

  it('POST /auth/login — should reject unknown email', async () => {
    const { status, data } = await req('POST', '/api/v1/auth/login', {
      email: 'nobody_inttest@test.com', password: 'Test1234',
    });
    assert.strictEqual(status, 401);
  });

  it('GET /auth/me — should return user profile', async () => {
    const { status, data } = await req('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${accessToken}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.user);
    assert.ok(data.data.user.email);
  });

  it('GET /auth/me — should reject without token', async () => {
    const { status } = await req('GET', '/api/v1/auth/me');
    assert.strictEqual(status, 401);
  });

  it('GET /auth/me — should reject with invalid token', async () => {
    const { status } = await req('GET', '/api/v1/auth/me', null, {
      Authorization: 'Bearer invalid-token-here',
    });
    assert.strictEqual(status, 401);
  });

  it('POST /auth/refresh — should refresh tokens', async () => {
    const { status, data } = await req('POST', '/api/v1/auth/refresh', { refreshToken });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.tokens.accessToken);
    assert.ok(data.data.tokens.refreshToken);
    accessToken = data.data.tokens.accessToken;
    refreshToken = data.data.tokens.refreshToken;
  });

  it('POST /auth/refresh — should reject invalid refresh token', async () => {
    const { status } = await req('POST', '/api/v1/auth/refresh', { refreshToken: 'invalid' });
    assert.strictEqual(status, 401);
  });

  it('POST /auth/change-password — should change password', async () => {
    const ts = Date.now();
    const reg = await req('POST', '/api/v1/auth/register', {
      firstName: 'Chpw', lastName: 'Test',
      email: `chpw_inttest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'IntTest Chpw', role: 'client_enterprise',
    });
    const loginToken = reg.data.data.tokens.accessToken;
    const { status, data } = await req('POST', '/api/v1/auth/change-password', {
      currentPassword: 'Test1234',
      newPassword: 'NewPass1234',
    }, { Authorization: `Bearer ${loginToken}` });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });

  it('POST /auth/logout — should logout', async () => {
    const { status, data } = await req('POST', '/api/v1/auth/logout', null, {
      Authorization: `Bearer ${accessToken}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });

  it('POST /auth/forgot-password — should accept any email', async () => {
    const { status, data } = await req('POST', '/api/v1/auth/forgot-password', {
      email: 'anyone_inttest@test.com',
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
  });
});
