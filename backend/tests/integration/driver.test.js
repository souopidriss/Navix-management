import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const BASE_URL = 'http://localhost:8101';
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

describe('Driver Integration', () => {
  let companyToken, secondCompanyToken, driverId;

  before(async () => {
    createPool();
    await new Promise((resolve) => { server = app.listen(8101, resolve); });
    const pool = getPool();
    await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_INTTEST_%']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['DrvIntTest%']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%drv_inttest@test.com']);

    const ts = Date.now();

    const reg1 = await req('POST', '/api/v1/auth/register', {
      firstName: 'Drv', lastName: 'Owner',
      email: `drv_owner1${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'DrvIntTest Corp 1', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    companyToken = reg1.data.data.tokens.accessToken;

    const reg2 = await req('POST', '/api/v1/auth/register', {
      firstName: 'Drv', lastName: 'Owner2',
      email: `drv_owner2${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'DrvIntTest Corp 2', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    secondCompanyToken = reg2.data.data.tokens.accessToken;
  });

  after(async () => {
    const pool = getPool();
    await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_INTTEST_%']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['DrvIntTest%']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%drv_inttest@test.com']);
    server.close();
    await closePool();
  });

  describe('POST /drivers', () => {
    it('should create a driver', async () => {
      const { status, data } = await req('POST', '/api/v1/drivers', {
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV_INTTEST_001',
        phone: '+237690000001',
        email: 'jean.dupont@inttest.com',
        licenseNumber: 'LIC-001',
        licenseCategory: 'B',
        licenseExpiryDate: '2026-12-31',
        yearsExperience: 5,
      }, { Authorization: `Bearer ${companyToken}` });

      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
      assert.ok(data.data);
      assert.strictEqual(data.data.firstName, 'Jean');
      assert.strictEqual(data.data.lastName, 'Dupont');
      assert.strictEqual(data.data.employeeCode, 'DRV_INTTEST_001');
      assert.strictEqual(data.data.fullName, 'Jean Dupont');
      assert.strictEqual(data.data.status, 'active');
      assert.strictEqual(data.data.availability, 'available');
      assert.strictEqual(data.data.isActive, true);
      driverId = data.data.id;
    });

    it('should reject duplicate employee code', async () => {
      const { status } = await req('POST', '/api/v1/drivers', {
        firstName: 'Pierre',
        lastName: 'Martin',
        employeeCode: 'DRV_INTTEST_001',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 409);
    });

    it('should reject without auth token', async () => {
      const { status } = await req('POST', '/api/v1/drivers', {
        firstName: 'No', lastName: 'Auth',
        employeeCode: 'DRV_INTTEST_NOAUTH',
      });
      assert.strictEqual(status, 401);
    });

    it('should reject missing firstName', async () => {
      const { status } = await req('POST', '/api/v1/drivers', {
        lastName: 'Dupont',
        employeeCode: 'DRV_INTTEST_NOFNAME',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 422);
    });

    it('should reject missing lastName', async () => {
      const { status } = await req('POST', '/api/v1/drivers', {
        firstName: 'Jean',
        employeeCode: 'DRV_INTTEST_NOLNAME',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 422);
    });

    it('should reject missing employeeCode', async () => {
      const { status } = await req('POST', '/api/v1/drivers', {
        firstName: 'Jean',
        lastName: 'Dupont',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 422);
    });

    it('should create driver with all optional fields', async () => {
      const { status, data } = await req('POST', '/api/v1/drivers', {
        firstName: 'Marie',
        lastName: 'Laurent',
        employeeCode: 'DRV_INTTEST_002',
        gender: 'female',
        birthDate: '1992-03-20',
        phone: '+237690000002',
        email: 'marie.laurent@inttest.com',
        city: 'Yaoundé',
        country: 'Cameroun',
        nationality: 'Camerounaise',
        licenseNumber: 'LIC-002',
        licenseCategory: 'C',
        licenseIssueDate: '2020-06-01',
        licenseExpiryDate: '2027-06-01',
        yearsExperience: 3,
        notes: 'Chauffeur expérimenté',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.data.gender, 'female');
      assert.strictEqual(data.data.city, 'Yaoundé');
      assert.strictEqual(data.data.nationality, 'Camerounaise');
    });
  });

  describe('GET /drivers', () => {
    it('should list drivers with pagination', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers?page=1&limit=10', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data.drivers));
      assert.ok(data.data.pagination);
      assert.ok(data.data.pagination.total >= 2);
      assert.ok(data.data.pagination.page === 1);
    });

    it('should filter by status', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers?status=active', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.ok(data.data.drivers.every((d) => d.status === 'active'));
    });

    it('should search by name', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers?search=Jean', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.ok(data.data.drivers.length >= 1);
    });

    it('should search by employee code', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers?search=DRV_INTTEST_002', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.ok(data.data.drivers.length >= 1);
    });

    it('should support sorting', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers?sort=first_name&order=ASC', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      const names = data.data.drivers.map((d) => d.firstName);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      assert.deepStrictEqual(names, sorted);
    });

    it('should not return drivers from another company', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers', null,
        { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.drivers.length, 0);
    });
  });

  describe('GET /drivers/:id', () => {
    it('should return driver by id', async () => {
      const { status, data } = await req('GET', `/api/v1/drivers/${driverId}`, null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.id, driverId);
      assert.strictEqual(data.data.firstName, 'Jean');
      assert.strictEqual(data.data.employeeCode, 'DRV_INTTEST_001');
    });

    it('should return 404 for non-existent driver', async () => {
      const { status } = await req('GET', '/api/v1/drivers/00000000000000000000000000', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 404);
    });

    it('should not return driver from another company (IDOR)', async () => {
      const { status } = await req('GET', `/api/v1/drivers/${driverId}`, null,
        { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 404);
    });
  });

  describe('PUT /drivers/:id', () => {
    it('should update driver fields', async () => {
      const { status, data } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        firstName: 'Jean (Updated)',
        yearsExperience: 10,
        city: 'Douala',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.firstName, 'Jean (Updated)');
      assert.strictEqual(data.data.yearsExperience, 10);
      assert.strictEqual(data.data.city, 'Douala');
    });

    it('should update fullName when firstName changes', async () => {
      const { status, data } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        firstName: 'Jean-Pierre',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.fullName, 'Jean-Pierre Dupont');
    });

    it('should allow valid transition: active -> on_mission', async () => {
      const { status, data } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        status: 'on_mission',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'on_mission');
    });

    it('should allow valid transition: on_mission -> available', async () => {
      const { status, data } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        status: 'available',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'available');
    });

    it('should reject invalid transition: on_mission -> suspended', async () => {
      const createRes = await req('POST', '/api/v1/drivers', {
        firstName: 'Trans', lastName: 'Test',
        employeeCode: 'DRV_INTTEST_TRANS',
      }, { Authorization: `Bearer ${companyToken}` });
      const transId = createRes.data.data.id;

      const res1 = await req('PUT', `/api/v1/drivers/${transId}`, {
        status: 'on_mission',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(res1.status, 200);

      const res2 = await req('PUT', `/api/v1/drivers/${transId}`, {
        status: 'suspended',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(res2.status, 400);
    });

    it('should reject duplicate employee code on update', async () => {
      const { status } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        employeeCode: 'DRV_INTTEST_002',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 409);
    });

    it('should reject expired license date', async () => {
      const { status } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        licenseExpiryDate: '2020-01-01',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 400);
    });

    it('should not update driver from another company (IDOR)', async () => {
      const { status } = await req('PUT', `/api/v1/drivers/${driverId}`, {
        firstName: 'HACKED',
      }, { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 404);
    });
  });

  describe('PATCH /drivers/:id/status', () => {
    it('should change status via PATCH', async () => {
      const { status, data } = await req('PATCH', `/api/v1/drivers/${driverId}/status`, {
        status: 'on_mission',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'on_mission');
    });

    it('should reject invalid transition via PATCH', async () => {
      const res = await req('PATCH', `/api/v1/drivers/${driverId}/status`, {
        status: 'suspended',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(res.status, 400);
    });

    it('should reset driver to active', async () => {
      const { status, data } = await req('PATCH', `/api/v1/drivers/${driverId}/status`, {
        status: 'active',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'active');
    });
  });

  describe('GET /drivers/stats', () => {
    it('should return driver stats', async () => {
      const { status, data } = await req('GET', '/api/v1/drivers/stats', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(typeof data.data.total, 'number');
      assert.strictEqual(typeof data.data.active, 'number');
      assert.strictEqual(typeof data.data.onMission, 'number');
      assert.strictEqual(typeof data.data.availableStatus, 'number');
      assert.strictEqual(typeof data.data.suspended, 'number');
      assert.strictEqual(typeof data.data.onLeave, 'number');
      assert.strictEqual(typeof data.data.inactive, 'number');
      assert.strictEqual(typeof data.data.expiredLicenses, 'number');
      assert.ok(data.data.total >= 2);
    });
  });

  describe('DELETE /drivers/:id', () => {
    it('should soft-delete a driver', async () => {
      const { status, data } = await req('DELETE', `/api/v1/drivers/${driverId}`, null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
    });

    it('should not find deleted driver', async () => {
      const { status } = await req('GET', `/api/v1/drivers/${driverId}`, null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 404);
    });

    it('should not delete driver from another company (IDOR)', async () => {
      const createRes = await req('POST', '/api/v1/drivers', {
        firstName: 'Del', lastName: 'Test',
        employeeCode: 'DRV_INTTEST_DEL',
      }, { Authorization: `Bearer ${companyToken}` });
      const id = createRes.data.data.id;
      const { status } = await req('DELETE', `/api/v1/drivers/${id}`, null,
        { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 404);
    });
  });
});
