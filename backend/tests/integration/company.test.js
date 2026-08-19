import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';
import { generateAccessToken } from '../../src/services/token.service.js';

const BASE_URL = 'http://localhost:8097';
let server;
let superAdminToken;
let ownerToken, ownerCompanyId;
let viewerToken;

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

describe('Company Integration', () => {
  before(async () => {
    createPool();
    await new Promise((resolve) => { server = app.listen(8097, resolve); });
    const pool = getPool();

    await pool.execute('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_comptest@test.com']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%_comptest@test.com']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['CompTest%']);

    const [sa] = await pool.execute('SELECT id FROM users WHERE role = ? LIMIT 1', ['super_admin']);
    if (sa.length > 0) {
      superAdminToken = generateAccessToken({ sub: sa[0].id, role: 'super_admin', type: 'access' });
    }

    const ts = Date.now();
    const reg = await req('POST', '/api/v1/auth/register', {
      firstName: 'Company', lastName: 'Owner',
      email: `owner_comptest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'CompTest Corp', role: 'client_enterprise',
    });
    ownerToken = reg.data.data.tokens.accessToken;
    ownerCompanyId = reg.data.data.company.id;

    const viewerReg = await req('POST', '/api/v1/auth/register', {
      firstName: 'Partner', lastName: 'Viewer',
      email: `partner_comptest${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'CompTest Viewer', role: 'partner',
    });
    viewerToken = viewerReg.data.data.tokens.accessToken;
  });

  after(async () => {
    const pool = getPool();
    await pool.execute('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_comptest@test.com']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%_comptest@test.com']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['CompTest%']);
    server.close();
    await closePool();
  });

  it('GET /companies — should require authentication', async () => {
    const { status } = await req('GET', '/api/v1/companies');
    assert.strictEqual(status, 401);
  });

  it('GET /companies — should list companies for owner (scoped)', async () => {
    const { status, data } = await req('GET', '/api/v1/companies', null, {
      Authorization: `Bearer ${ownerToken}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.ok(Array.isArray(data.data.companies));
    assert.ok(data.data.pagination);
    const ownCompany = data.data.companies.find((c) => c.id === ownerCompanyId);
    assert.ok(ownCompany, 'Owner should see own company');
  });

  it('GET /companies — should list all for super_admin', async () => {
    if (!superAdminToken) return;
    const { status, data } = await req('GET', '/api/v1/companies', null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(status, 200);
    assert.ok(data.data.companies.length > 0);
  });

  it('GET /companies/:id — should return own company details', async () => {
    const { status, data } = await req('GET', `/api/v1/companies/${ownerCompanyId}`, null, {
      Authorization: `Bearer ${ownerToken}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.data.id, ownerCompanyId);
    assert.ok(data.data.name);
    assert.ok(data.data.vehicleCount !== undefined);
    assert.ok(data.data.driverCount !== undefined);
    assert.ok(data.data.agencyCount !== undefined);
  });

  it('GET /companies/:id — should return 404 for non-existent', async () => {
    const fakeId = '00000000000000000000000000';
    const { status } = await req('GET', `/api/v1/companies/${fakeId}`, null, {
      Authorization: `Bearer ${ownerToken}`,
    });
    assert.strictEqual(status, 404);
  });

  it('POST /companies — should reject unauthenticated', async () => {
    const { status } = await req('POST', '/api/v1/companies', { name: 'Test' });
    assert.strictEqual(status, 401);
  });

  it('POST /companies — should create company as super_admin', async () => {
    if (!superAdminToken) return;
    const ts = Date.now();
    const { status, data } = await req('POST', '/api/v1/companies', {
      name: `CompTest New ${ts}`,
      code: `NEW${ts}`.substring(0, 12),
      email: `new_comptest${ts}@test.com`,
    }, { Authorization: `Bearer ${superAdminToken}` });
    assert.strictEqual(status, 201);
    assert.strictEqual(data.success, true);
    assert.ok(data.data.id);
    assert.strictEqual(data.data.status, 'pending');
    assert.ok(data.data.slug);
  });

  it('POST /companies — should reject missing name', async () => {
    if (!superAdminToken) return;
    const { status } = await req('POST', '/api/v1/companies', {
      code: 'NOEXIST',
    }, { Authorization: `Bearer ${superAdminToken}` });
    assert.ok(status === 422 || status === 400);
  });

  it('POST /companies — should reject duplicate code', async () => {
    if (!superAdminToken) return;
    const ts = Date.now();
    const code = `DUP${ts}`.substring(0, 12);
    await req('POST', '/api/v1/companies', {
      name: `CompTest Dup1 ${ts}`,
      code,
    }, { Authorization: `Bearer ${superAdminToken}` });
    const { status } = await req('POST', '/api/v1/companies', {
      name: `CompTest Dup2 ${ts}`,
      code,
    }, { Authorization: `Bearer ${superAdminToken}` });
    assert.strictEqual(status, 409);
  });

  it('PUT /companies/:id — should update own company', async () => {
    const { status, data } = await req('PUT', `/api/v1/companies/${ownerCompanyId}`, {
      description: 'Updated description',
      phone: '+237 600 000 001',
    }, { Authorization: `Bearer ${ownerToken}` });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.data.description, 'Updated description');
    assert.strictEqual(data.data.phone, '+237 600 000 001');
  });

  it('PUT /companies/:id — should reject unauthenticated', async () => {
    const { status } = await req('PUT', `/api/v1/companies/${ownerCompanyId}`, { name: 'Hacked' });
    assert.strictEqual(status, 401);
  });

  it('POST /companies/:id/activate — should activate as super_admin', async () => {
    if (!superAdminToken) return;
    const ts = Date.now();
    const created = await req('POST', '/api/v1/companies', {
      name: `CompTest ToActivate ${ts}`,
      code: `ACT${ts}`.substring(0, 12),
    }, { Authorization: `Bearer ${superAdminToken}` });
    const id = created.data.data.id;
    const { status, data } = await req('POST', `/api/v1/companies/${id}/activate`, null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.data.status, 'active');
    assert.strictEqual(data.data.isActive, true);
  });

  it('POST /companies/:id/suspend — should suspend as super_admin', async () => {
    if (!superAdminToken) return;
    const ts = Date.now();
    const created = await req('POST', '/api/v1/companies', {
      name: `CompTest ToSuspend ${ts}`,
      code: `SUS${ts}`.substring(0, 12),
    }, { Authorization: `Bearer ${superAdminToken}` });
    const id = created.data.data.id;
    const { status, data } = await req('POST', `/api/v1/companies/${id}/suspend`, null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(status, 200);
    assert.strictEqual(data.data.status, 'suspended');
  });

  it('DELETE /companies/:id — should soft delete as super_admin', async () => {
    if (!superAdminToken) return;
    const ts = Date.now();
    const created = await req('POST', '/api/v1/companies', {
      name: `CompTest ToDelete ${ts}`,
      code: `DEL${ts}`.substring(0, 12),
    }, { Authorization: `Bearer ${superAdminToken}` });
    const id = created.data.data.id;
    const { status, data } = await req('DELETE', `/api/v1/companies/${id}`, null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(status, 200);
    const { status: getStatus } = await req('GET', `/api/v1/companies/${id}`, null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(getStatus, 404);
  });

  it('GET /companies?search= — should search companies', async () => {
    if (!superAdminToken) return;
    const { status, data } = await req('GET', '/api/v1/companies?search=CompTest', null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(status, 200);
    assert.ok(data.data.companies.length > 0);
  });

  it('GET /companies?status= — should filter by status', async () => {
    if (!superAdminToken) return;
    const { status, data } = await req('GET', '/api/v1/companies?status=active', null, {
      Authorization: `Bearer ${superAdminToken}`,
    });
    assert.strictEqual(status, 200);
    assert.ok(data.data.companies.every((c) => c.status === 'active'));
  });
});
