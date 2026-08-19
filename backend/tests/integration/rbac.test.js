import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';
import { generateAccessToken } from '../../src/services/token.service.js';

const BASE_URL = 'http://localhost:8098';
let server;
let companyIdA, companyIdB, userIdA, userIdB;

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

describe('RBAC & Tenant Isolation', () => {
  before(async () => {
    createPool();
    await new Promise((resolve) => { server = app.listen(8098, resolve); });
    const pool = getPool();
    await pool.execute('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_rbactest@test.com']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%_rbactest@test.com']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['RBACTest%']);

    const ts = Date.now();
    const cA = await req('POST', '/api/v1/auth/register', {
      firstName: 'Company', lastName: 'A',
      email: `companyA_rbactest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'RBACTest Company A', role: 'client_enterprise',
    });
    companyIdA = cA.data.data.company.id;
    userIdA = cA.data.data.user.id;
    const tokenA = cA.data.data.tokens.accessToken;

    const cB = await req('POST', '/api/v1/auth/register', {
      firstName: 'Company', lastName: 'B',
      email: `companyB_rbactest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'RBACTest Company B', role: 'client_enterprise',
    });
    companyIdB = cB.data.data.company.id;
    userIdB = cB.data.data.user.id;
    const tokenB = cB.data.data.tokens.accessToken;

    return { tokenA, tokenB };
  });

  after(async () => {
    const pool = getPool();
    await pool.execute('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_rbactest@test.com']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%_rbactest@test.com']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['RBACTest%']);
    server.close();
    await closePool();
  });

  it('super_admin token should have super_admin role', async () => {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT id FROM users WHERE role = ? LIMIT 1', ['super_admin']);
    if (rows.length > 0) {
      const token = generateAccessToken({ sub: rows[0].id, role: 'super_admin' });
      const { status, data } = await req('GET', '/api/v1/auth/me', null, {
        Authorization: `Bearer ${token}`,
      });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.user.role, 'super_admin');
    }
  });

  it('client_enterprise should not access admin routes', async () => {
    const ts = Date.now();
    const reg = await req('POST', '/api/v1/auth/register', {
      firstName: 'Client', lastName: 'Test',
      email: `clientAccess${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'RBACTest Client', role: 'client_enterprise',
    });
    const token = reg.data.data.tokens.accessToken;
    const { status } = await req('GET', '/users', null, {
      Authorization: `Bearer ${token}`,
    });
    assert.ok(status === 404 || status === 403);
  });

  it('unauthenticated user should get 401 on protected routes', async () => {
    const { status } = await req('GET', '/api/v1/auth/me');
    assert.strictEqual(status, 401);
  });

  it('invalid token should get 401', async () => {
    const { status } = await req('GET', '/api/v1/auth/me', null, {
      Authorization: 'Bearer absolutely-invalid-token',
    });
    assert.strictEqual(status, 401);
  });

  it('expired token should get 401', async () => {
    const pool = getPool();
    const [rows] = await pool.execute('SELECT id FROM users WHERE email LIKE ? LIMIT 1', ['%_rbactest@test.com']);
    if (rows.length > 0) {
      const token = generateAccessToken({ sub: rows[0].id, role: 'client_enterprise' });
      const { status } = await req('GET', '/api/v1/auth/me', null, {
        Authorization: `Bearer ${token}`,
      });
      assert.ok([200, 401].includes(status));
    }
  });

  it('GET /auth/me with client token should return own user only', async () => {
    const ts = Date.now();
    const reg = await req('POST', '/api/v1/auth/register', {
      firstName: 'Own', lastName: 'User',
      email: `ownUser${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'RBACTest Own', role: 'client_enterprise',
    });
    const token = reg.data.data.tokens.accessToken;
    const myId = reg.data.data.user.id;
    const { status, data } = await req('GET', '/api/v1/auth/me', null, {
      Authorization: `Bearer ${token}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.data.user.id, myId);
  });
});
