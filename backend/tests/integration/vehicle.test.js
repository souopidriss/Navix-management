import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const BASE_URL = 'http://localhost:8100';
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

describe('Vehicle Integration', () => {
  let companyToken, secondCompanyToken, companyId, secondCompanyId, vehicleId;

  before(async () => {
    createPool();
    await new Promise((resolve) => { server = app.listen(8100, resolve); });
    const pool = getPool();
    await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['VEH_INTTEST_%']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['VehIntTest%']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%veh_inttest@test.com']);

    const ts = Date.now();

    const reg1 = await req('POST', '/api/v1/auth/register', {
      firstName: 'Veh', lastName: 'Owner',
      email: `veh_owner1${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'VehIntTest Corp 1', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    companyToken = reg1.data.data.tokens.accessToken;
    companyId = reg1.data.data.company.id;

    const reg2 = await req('POST', '/api/v1/auth/register', {
      firstName: 'Veh', lastName: 'Owner2',
      email: `veh_owner2${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'VehIntTest Corp 2', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    secondCompanyToken = reg2.data.data.tokens.accessToken;
    secondCompanyId = reg2.data.data.company.id;
  });

  after(async () => {
    const pool = getPool();
    await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['VEH_INTTEST_%']);
    await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['VehIntTest%']);
    await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%veh_inttest@test.com']);
    server.close();
    await closePool();
  });

  describe('POST /vehicles', () => {
    it('should create a vehicle', async () => {
      const { status, data } = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_001',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2023,
        fuelType: 'diesel',
        transmission: 'automatique',
        groupCode: 'B',
        capacity: 5,
        mileage: 0,
      }, { Authorization: `Bearer ${companyToken}` });

      assert.strictEqual(status, 201);
      assert.strictEqual(data.success, true);
      assert.ok(data.data);
      assert.strictEqual(data.data.registrationNumber, 'VEH_INTTEST_001');
      assert.strictEqual(data.data.brand, 'Toyota');
      assert.strictEqual(data.data.model, 'Corolla');
      assert.strictEqual(data.data.year, 2023);
      assert.strictEqual(data.data.fuelType, 'diesel');
      assert.strictEqual(data.data.status, 'available');
      assert.strictEqual(data.data.isActive, true);
      vehicleId = data.data.id;
    });

    it('should reject duplicate registration number', async () => {
      const { status } = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_001',
        brand: 'Renault', model: 'Clio',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 409);
    });

    it('should reject without auth token', async () => {
      const { status } = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_NOAUTH',
        brand: 'Toyota', model: 'Corolla',
      });
      assert.strictEqual(status, 401);
    });

    it('should reject missing registrationNumber', async () => {
      const { status } = await req('POST', '/api/v1/vehicles', {
        brand: 'Toyota', model: 'Corolla',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 422);
    });

    it('should reject missing brand', async () => {
      const { status } = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_NOBRAND', model: 'Corolla',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 422);
    });

    it('should accept optional VIN', async () => {
      const { status, data } = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_002',
        brand: 'Honda', model: 'Civic',
        vin: '1HGBH41JXMN109186',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.data.vin, '1HGBH41JXMN109186');
    });

    it('should default status to available', async () => {
      const { status, data } = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_003',
        brand: 'Peugeot', model: '308',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 201);
      assert.strictEqual(data.data.status, 'available');
    });

    it('should accept all valid fuel types', async () => {
      const fuels = ['diesel', 'essence', 'hybride', 'electrique'];
      for (let i = 0; i < fuels.length; i++) {
        const { status } = await req('POST', '/api/v1/vehicles', {
          registrationNumber: `VEH_INTTEST_FUEL_${i}`,
          brand: 'Toyota', model: 'Test', fuelType: fuels[i],
        }, { Authorization: `Bearer ${companyToken}` });
        assert.strictEqual(status, 201);
      }
    });
  });

  describe('GET /vehicles', () => {
    it('should list vehicles with pagination', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles?page=1&limit=10', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.ok(Array.isArray(data.data.vehicles));
      assert.ok(data.data.pagination);
      assert.ok(data.data.pagination.total >= 3);
      assert.ok(data.data.pagination.page === 1);
    });

    it('should filter by status', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles?status=available', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.ok(data.data.vehicles.every((v) => v.status === 'available'));
    });

    it('should filter by groupCode', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles?groupCode=B', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.ok(data.data.vehicles.every((v) => v.groupCode === 'B'));
    });

    it('should search by brand', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles?search=Toyota', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.ok(data.data.vehicles.length >= 2);
    });

    it('should support sorting', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles?sort=brand&order=ASC', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      const brands = data.data.vehicles.map((v) => v.brand);
      const sorted = [...brands].sort((a, b) => a.localeCompare(b));
      assert.deepStrictEqual(brands, sorted);
    });

    it('should not return vehicles from another company', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles', null,
        { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.vehicles.length, 0);
    });
  });

  describe('GET /vehicles/:id', () => {
    it('should return vehicle by id', async () => {
      const { status, data } = await req('GET', `/api/v1/vehicles/${vehicleId}`, null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.id, vehicleId);
      assert.strictEqual(data.data.registrationNumber, 'VEH_INTTEST_001');
    });

    it('should return 404 for non-existent vehicle', async () => {
      const { status } = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 404);
    });

    it('should not return vehicle from another company (IDOR)', async () => {
      const { status } = await req('GET', `/api/v1/vehicles/${vehicleId}`, null,
        { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 404);
    });
  });

  describe('PUT /vehicles/:id', () => {
    it('should update vehicle fields', async () => {
      const { status, data } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        brand: 'Toyota (Updated)',
        mileage: 5000,
        color: 'Gris metal',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.brand, 'Toyota (Updated)');
      assert.strictEqual(data.data.mileage, 5000);
      assert.strictEqual(data.data.color, 'Gris metal');
    });

    it('should allow valid transition: available -> in_use', async () => {
      const { status, data } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        status: 'in_use',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'in_use');
    });

    it('should allow valid transition: in_use -> maintenance', async () => {
      const { status, data } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        status: 'maintenance',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'maintenance');
    });

    it('should reject invalid transition: maintenance -> in_use', async () => {
      const { status } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        status: 'in_use',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 400);
    });

    it('should allow valid transition: maintenance -> available', async () => {
      const { status, data } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        status: 'available',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'available');
    });

    it('should reject duplicate registration on update', async () => {
      const { status } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        registrationNumber: 'VEH_INTTEST_002',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 409);
    });

    it('should not update vehicle from another company (IDOR)', async () => {
      const { status } = await req('PUT', `/api/v1/vehicles/${vehicleId}`, {
        brand: 'HACKED',
      }, { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 404);
    });
  });

  describe('PATCH /vehicles/:id/status', () => {
    it('should change status via PATCH', async () => {
      const { status, data } = await req('PATCH', `/api/v1/vehicles/${vehicleId}/status`, {
        status: 'in_use',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'in_use');
    });

    it('should reject invalid transition: in_use -> out_of_service is valid but let us test via wrong path', async () => {
      const res1 = await req('PATCH', `/api/v1/vehicles/${vehicleId}/status`, {
        status: 'maintenance',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(res1.status, 200);

      const res2 = await req('PATCH', `/api/v1/vehicles/${vehicleId}/status`, {
        status: 'in_use',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(res2.status, 400);
    });

    it('should reset vehicle to available', async () => {
      const { status, data } = await req('PATCH', `/api/v1/vehicles/${vehicleId}/status`, {
        status: 'available',
      }, { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.data.status, 'available');
    });
  });

  describe('GET /vehicles/stats', () => {
    it('should return vehicle stats', async () => {
      const { status, data } = await req('GET', '/api/v1/vehicles/stats', null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(typeof data.data.total, 'number');
      assert.strictEqual(typeof data.data.available, 'number');
      assert.strictEqual(typeof data.data.inUse, 'number');
      assert.strictEqual(typeof data.data.maintenance, 'number');
      assert.strictEqual(typeof data.data.outOfService, 'number');
      assert.strictEqual(typeof data.data.active, 'number');
      assert.strictEqual(typeof data.data.inactive, 'number');
      assert.ok(Array.isArray(data.data.byGroup));
      assert.ok(data.data.total >= 3);
    });
  });

  describe('DELETE /vehicles/:id', () => {
    it('should soft-delete a vehicle', async () => {
      const { status, data } = await req('DELETE', `/api/v1/vehicles/${vehicleId}`, null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 200);
      assert.strictEqual(data.success, true);
    });

    it('should not find deleted vehicle', async () => {
      const { status } = await req('GET', `/api/v1/vehicles/${vehicleId}`, null,
        { Authorization: `Bearer ${companyToken}` });
      assert.strictEqual(status, 404);
    });

    it('should not delete vehicle from another company (IDOR)', async () => {
      const createRes = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'VEH_INTTEST_DELETE',
        brand: 'Toyota', model: 'Test',
      }, { Authorization: `Bearer ${companyToken}` });
      const id = createRes.data.data.id;
      const { status } = await req('DELETE', `/api/v1/vehicles/${id}`, null,
        { Authorization: `Bearer ${secondCompanyToken}` });
      assert.strictEqual(status, 404);
    });
  });
});
