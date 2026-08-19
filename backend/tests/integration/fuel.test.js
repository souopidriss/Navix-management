import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8104;
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
  await pool.execute('DELETE FROM fuel_records WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['FuelIntTest%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['FV-%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_FUEL_%']);
  await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['FuelIntTest%']);
  await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%fuel_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Fuel Integration', () => {
  let tokenA, tokenB, companyIdA, companyIdB;
  let vehicleA1, vehicleA2, vehicleB1;
  let driverA1, driverB1;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Fuel', lastName: 'AdminA',
      email: `fuel_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'FuelIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Fuel', lastName: 'AdminB',
      email: `fuel_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'FuelIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;

    const v1 = await req('POST', '/vehicles', {
      registrationNumber: `FV-${ts}-01`, brand: 'Toyota', model: 'Hilux',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v1.status, 201);
    vehicleA1 = v1.data.data.id;

    const v2 = await req('POST', '/vehicles', {
      registrationNumber: `FV-${ts}-02`, brand: 'Mercedes', model: 'Sprinter',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v2.status, 201);
    vehicleA2 = v2.data.data.id;

    const v3 = await req('POST', '/vehicles', {
      registrationNumber: `FV-${ts}-03`, brand: 'Renault', model: 'Master',
      fuelType: 'essence', status: 'available',
    }, { Authorization: `Bearer ${tokenB}` });
    assert.strictEqual(v3.status, 201);
    vehicleB1 = v3.data.data.id;

    const d1 = await req('POST', '/drivers', {
      firstName: 'Ali', lastName: 'Driver',
      employeeCode: `DRV_FUEL_${ts}`, phone: '+237600000001',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(d1.status, 201);
    driverA1 = d1.data.data.id;

    const d2 = await req('POST', '/drivers', {
      firstName: 'Bob', lastName: 'DriverB',
      employeeCode: `DRV_FUEL_B_${ts}`, phone: '+237600000002',
    }, { Authorization: `Bearer ${tokenB}` });
    assert.strictEqual(d2.status, 201);
    driverB1 = d2.data.data.id;
  });

  describe('POST /fuel', () => {
    it('should create a fuel record', async () => {
      const res = await req('POST', '/fuel', {
        vehicleId: vehicleA1,
        driverId: driverA1,
        fuelType: 'diesel',
        stationName: 'TotalEnergies',
        stationCity: 'Douala',
        quantity: 55,
        unitPrice: 605,
        mileage: 10100,
        paymentMethod: 'fuel_card',
        invoiceNumber: 'FN-001',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.id);
      assert.strictEqual(res.data.data.fuelNumber.startsWith('FL-'), true);
      assert.strictEqual(res.data.data.totalCost, 33275);
      assert.strictEqual(res.data.data.status, 'pending');
    });

    it('should reject without vehicleId', async () => {
      const res = await req('POST', '/fuel', {
        fuelType: 'diesel', quantity: 50, unitPrice: 600, mileage: 10000,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject quantity <= 0', async () => {
      const res = await req('POST', '/fuel', {
        vehicleId: vehicleA1, fuelType: 'diesel', quantity: 0, unitPrice: 600, mileage: 10200,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject without auth token', async () => {
      const res = await req('POST', '/fuel', {
        vehicleId: vehicleA1, fuelType: 'diesel', quantity: 50, unitPrice: 600, mileage: 10200,
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject odometer regression', async () => {
      const res = await req('POST', '/fuel', {
        vehicleId: vehicleA1, fuelType: 'diesel', quantity: 50, unitPrice: 600, mileage: 5000, stationName: 'Shell',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });

    it('should create with higher odometer', async () => {
      const res = await req('POST', '/fuel', {
        vehicleId: vehicleA1, fuelType: 'diesel', quantity: 50, unitPrice: 600, mileage: 10200, stationName: 'Shell',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.totalCost, 30000);
    });
  });

  describe('GET /fuel', () => {
    it('should list fuel records with pagination', async () => {
      const res = await req('GET', '/fuel?page=1&limit=10', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.fuelRecords));
      assert.ok(res.data.data.total >= 1);
    });

    it('should not return records from another company', async () => {
      const res = await req('GET', '/fuel', null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 200);
      for (const record of res.data.data.fuelRecords) {
        assert.strictEqual(record.companyId, companyIdB);
      }
    });

    it('should filter by fuelType', async () => {
      const res = await req('GET', '/fuel?fuelType=diesel', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      for (const record of res.data.data.fuelRecords) {
        assert.strictEqual(record.fuelType, 'diesel');
      }
    });

    it('should filter by vehicleId', async () => {
      const res = await req('GET', `/fuel?vehicleId=${vehicleA1}`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      for (const record of res.data.data.fuelRecords) {
        assert.strictEqual(record.vehicleId, vehicleA1);
      }
    });
  });

  describe('GET /fuel/:id', () => {
    it('should return fuel record by id', async () => {
      const list = await req('GET', '/fuel?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      const id = list.data.data.fuelRecords[0].id;
      const res = await req('GET', `/fuel/${id}`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, id);
    });

    it('should return 404 for non-existent', async () => {
      const res = await req('GET', '/fuel/00000000000000000000000000', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not access record from another company (IDOR)', async () => {
      const listA = await req('GET', '/fuel?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.fuelRecords.length === 0) return;
      const idA = listA.data.data.fuelRecords[0].id;
      const res = await req('GET', `/fuel/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('PUT /fuel/:id', () => {
    it('should update fuel record', async () => {
      const list = await req('GET', '/fuel?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      const id = list.data.data.fuelRecords[0].id;
      const res = await req('PUT', `/fuel/${id}`, {
        notes: 'Updated note',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.notes, 'Updated note');
    });

    it('should reject updating validated record', async () => {
      const list = await req('GET', '/fuel?status=validated&page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.fuelRecords.length === 0) return;
      const id = list.data.data.fuelRecords[0].id;
      const res = await req('PUT', `/fuel/${id}`, { notes: 'Nope' }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });

    it('should validate and calculate totalCost on update', async () => {
      const createRes = await req('POST', '/fuel', {
        vehicleId: vehicleA1, fuelType: 'diesel', quantity: 40, unitPrice: 610, mileage: 10500, stationName: 'Total',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('PUT', `/fuel/${id}`, {
        quantity: 45, unitPrice: 620,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.totalCost, 27900);
    });
  });

  describe('PATCH /fuel/:id (validate/cancel)', () => {
    it('should validate a pending record', async () => {
      const list = await req('GET', '/fuel?status=pending&page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.fuelRecords.length === 0) return;
      const id = list.data.data.fuelRecords[0].id;
      const res = await req('PUT', `/fuel/${id}`, { status: 'validated' }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'validated');
    });
  });

  describe('DELETE /fuel/:id', () => {
    it('should soft-delete a pending fuel record', async () => {
      const createRes = await req('POST', '/fuel', {
        vehicleId: vehicleA1, fuelType: 'diesel', quantity: 30, unitPrice: 600, mileage: 10800, stationName: 'Vivo',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('DELETE', `/fuel/${id}`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
    });
  });

  describe('GET /fuel/stats', () => {
    it('should return fuel stats', async () => {
      const res = await req('GET', '/fuel/stats', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.totalCost === 'number');
      assert.ok(typeof res.data.data.fuelCount === 'number');
    });
  });

  describe('GET /vehicles/:vehicleId/fuel', () => {
    it('should return vehicle fuel history', async () => {
      const res = await req('GET', `/vehicles/${vehicleA1}/fuel?page=1&limit=10`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.fuelRecords));
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await req('GET', '/vehicles/00000000000000000000000000/fuel', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('Tenant isolation', () => {
    it('should not access fuel record from another company', async () => {
      const listA = await req('GET', '/fuel?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.fuelRecords.length === 0) return;
      const idA = listA.data.data.fuelRecords[0].id;
      const res = await req('GET', `/fuel/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not create cross-tenant fuel with invalid vehicle', async () => {
      const res = await req('POST', '/fuel', {
        vehicleId: vehicleB1, fuelType: 'diesel', quantity: 50, unitPrice: 600, mileage: 5000, stationName: 'Shell',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not PUT cross-tenant fuel record', async () => {
      const listA = await req('GET', '/fuel?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.fuelRecords.length === 0) return;
      const idA = listA.data.data.fuelRecords[0].id;
      const res = await req('PUT', `/fuel/${idA}`, { notes: 'hack' }, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not DELETE cross-tenant fuel record', async () => {
      const listA = await req('GET', '/fuel?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.fuelRecords.length === 0) return;
      const idA = listA.data.data.fuelRecords[0].id;
      const res = await req('DELETE', `/fuel/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });
});
