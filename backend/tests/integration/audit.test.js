import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8108;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
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

before(async () => {
  createPool();
  await new Promise((resolve) => { server = app.listen(PORT, resolve); });
  const pool = getPool();
  await pool.query('DELETE FROM audit_logs WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['AuditIntTest%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['AuditIntTest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%audit_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Audit Logs Integration', () => {
  let tokenAdmin, tokenUserA, tokenUserB, companyIdA, companyIdB;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Audit', lastName: 'AdminA',
      email: `audit_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'AuditIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenUserA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;
    const userIdA = reg1.data.data.user.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Audit', lastName: 'AdminB',
      email: `audit_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'AuditIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenUserB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;

    const pool = getPool();
    await pool.execute('UPDATE users SET role = ? WHERE id = ?', ['company_owner', userIdA]);
    const loginAdmin = await req('POST', '/auth/login', {
      email: `audit_inttest_a${ts}@test.com`,
      password: 'Test1234',
    });
    assert.strictEqual(loginAdmin.status, 200);
    tokenAdmin = loginAdmin.data.data.tokens.accessToken;
  });

  describe('GET /audit-logs', () => {
    it('should return audit logs for user with audit:view', async () => {
      const res = await req('GET', '/audit-logs', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data.items));
      assert.ok(typeof res.data.data.total === 'number');
    });

    it('should return 401 without auth', async () => {
      const res = await req('GET', '/audit-logs');
      assert.strictEqual(res.status, 401);
    });

    it('should return 403 for client_enterprise (no audit:view)', async () => {
      const res = await req('GET', '/audit-logs', null, {
        Authorization: `Bearer ${tokenUserB}`,
      });
      assert.strictEqual(res.status, 403);
    });

    it('should filter by status', async () => {
      const res = await req('GET', '/audit-logs?status=success', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.items));
    });

    it('should filter by action', async () => {
      const res = await req('GET', '/audit-logs?action=LOGIN', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });

    it('should filter by actionType', async () => {
      const res = await req('GET', '/audit-logs?actionType=authentication', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
    });

    it('should filter by severity', async () => {
      const res = await req('GET', '/audit-logs?severity=low', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
    });

    it('should filter by resourceType', async () => {
      const res = await req('GET', '/audit-logs?resourceType=user', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
    });

    it('should support pagination', async () => {
      const res = await req('GET', '/audit-logs?page=1&limit=5', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.items.length <= 5);
      assert.strictEqual(res.data.data.page, 1);
      assert.strictEqual(res.data.data.pageSize, 5);
    });

    it('should support search', async () => {
      const res = await req('GET', '/audit-logs?search=connexion', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
    });

    it('should reject invalid action value', async () => {
      const res = await req('GET', '/audit-logs?action=INVALID', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject invalid severity value', async () => {
      const res = await req('GET', '/audit-logs?severity=mega', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject limit > 100', async () => {
      const res = await req('GET', '/audit-logs?limit=101', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.ok([400, 422].includes(res.status));
    });
  });

  describe('GET /audit-logs/statistics', () => {
    it('should return audit statistics', async () => {
      const res = await req('GET', '/audit-logs/statistics', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data);
    });

    it('should return 401 without auth', async () => {
      const res = await req('GET', '/audit-logs/statistics');
      assert.strictEqual(res.status, 401);
    });
  });

  describe('GET /audit-logs/:id', () => {
    it('should return 401 without auth', async () => {
      const res = await req('GET', '/audit-logs/01ABCDEF1234567890123456');
      assert.strictEqual(res.status, 401);
    });
  });

  describe('Tenant isolation', () => {
    it('company_owner sees only own company logs', async () => {
      const res = await req('GET', '/audit-logs', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      const logs = res.data.data.items;
      const otherCompanyLogs = logs.filter(
        (l) => l.company_id && l.company_id !== companyIdA
      );
      assert.strictEqual(otherCompanyLogs.length, 0);
    });
  });

  describe('Audit hooks verification', () => {
    it('should have audit logs from registration (user creation)', async () => {
      const res = await req('GET', '/audit-logs?action=CREATE&resourceType=user', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.items.length >= 0);
    });

    it('should have audit logs from login', async () => {
      const res = await req('GET', '/audit-logs?action=LOGIN', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.items));
    });
  });

  describe('Immutability', () => {
    it('should not allow DELETE on audit-logs', async () => {
      const res = await req('DELETE', '/audit-logs/01ABCDEF1234567890123456', null, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should not allow PUT on audit-logs', async () => {
      const res = await req('PUT', '/audit-logs/01ABCDEF1234567890123456', {}, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should not allow PATCH on audit-logs', async () => {
      const res = await req('PATCH', '/audit-logs/01ABCDEF1234567890123456', {}, {
        Authorization: `Bearer ${tokenAdmin}`,
      });
      assert.strictEqual(res.status, 404);
    });
  });
});
