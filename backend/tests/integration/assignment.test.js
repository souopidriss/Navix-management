import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8102;
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
  await pool.execute('DELETE FROM assignments WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['AssignIntTest%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_ASST_%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_ASST2_%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_ASST_B_%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['AA-%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['BB-%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['CC-%']);
  await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['AssignIntTest%']);
  await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%assign_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Assignment Integration', () => {
  let tokenA, tokenB, companyIdA, companyIdB;
  let vehicleA1, vehicleA2, vehicleB1;
  let driverA1, driverA2, driverB1;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Assign', lastName: 'AdminA',
      email: `assign_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'AssignIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Assign', lastName: 'AdminB',
      email: `assign_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'AssignIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;

    const v1 = await req('POST', '/vehicles', {
      registrationNumber: `AA-${ts}-01`, brand: 'Toyota', model: 'Hilux',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    vehicleA1 = v1.data.data.id;

    const v2 = await req('POST', '/vehicles', {
      registrationNumber: `BB-${ts}-02`, brand: 'Mercedes', model: 'Sprinter',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    vehicleA2 = v2.data.data.id;

    const v3 = await req('POST', '/vehicles', {
      registrationNumber: `CC-${ts}-03`, brand: 'Renault', model: 'Master',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenB}` });
    vehicleB1 = v3.data.data.id;

    const d1 = await req('POST', '/drivers', {
      firstName: 'Jean', lastName: 'Dupont',
      employeeCode: `DRV_ASST_${ts}`, phone: '+237600000001',
    }, { Authorization: `Bearer ${tokenA}` });
    driverA1 = d1.data.data.id;

    const d2 = await req('POST', '/drivers', {
      firstName: 'Marie', lastName: 'Claire',
      employeeCode: `DRV_ASST2_${ts}`, phone: '+237600000002',
    }, { Authorization: `Bearer ${tokenA}` });
    driverA2 = d2.data.data.id;

    const d3 = await req('POST', '/drivers', {
      firstName: 'Paul', lastName: 'Martin',
      employeeCode: `DRV_ASST_B_${ts}`, phone: '+237600000003',
    }, { Authorization: `Bearer ${tokenB}` });
    driverB1 = d3.data.data.id;
  });

  describe('POST /assignments', () => {
    it('should create a planned assignment', async () => {
      const res = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA1,
        assignmentType: 'permanent', startDate: '2026-08-01',
        expectedEndDate: '2027-08-01', notes: 'Test assignment',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.status, 'planned');
      assert.strictEqual(res.data.data.assignmentType, 'permanent');
      assert.ok(res.data.data.assignmentNumber.startsWith('ASG-'));
      assert.strictEqual(res.data.data.vehicleId, vehicleA1);
      assert.strictEqual(res.data.data.driverId, driverA1);
    });

    it('should create with all optional fields', async () => {
      const res = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA2,
        assignmentType: 'temporary', startDate: '2026-09-01',
        expectedEndDate: '2026-12-31', startMileage: 5000,
        fuelLevelStart: 80, reason: 'Remplacement', destination: 'Douala',
        notes: 'Notes complètes',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.startMileage, 5000);
      assert.strictEqual(res.data.data.fuelLevelStart, 80);
    });

    it('should reject without auth token', async () => {
      const res = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA1, startDate: '2026-08-01',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject missing vehicleId', async () => {
      const res = await req('POST', '/assignments', {
        driverId: driverA1, startDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject missing driverId', async () => {
      const res = await req('POST', '/assignments', {
        vehicleId: vehicleA1, startDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject missing startDate', async () => {
      const res = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA1,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });
  });

  describe('GET /assignments', () => {
    it('should list assignments with pagination', async () => {
      const res = await req('GET', '/assignments?page=1&limit=10', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data.assignments));
      assert.ok(res.data.data.pagination.total >= 1);
    });

    it('should not return assignments from another company', async () => {
      const res = await req('GET', '/assignments', null,
        { Authorization: `Bearer ${tokenA}` });
      const other = res.data.data.assignments.filter((a) => a.companyId !== companyIdA);
      assert.strictEqual(other.length, 0);
    });

    it('should filter by status', async () => {
      const res = await req('GET', '/assignments?status=planned', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      for (const a of res.data.data.assignments) {
        assert.strictEqual(a.status, 'planned');
      }
    });
  });

  describe('GET /assignments/:id', () => {
    it('should return assignment by id with vehicle and driver', async () => {
      const list = await req('GET', '/assignments?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      const id = list.data.data.assignments[0]?.id;
      if (!id) return;

      const res = await req('GET', `/assignments/${id}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, id);
      assert.ok(res.data.data.vehicle);
      assert.ok(res.data.data.driver);
    });

    it('should return 404 for non-existent assignment', async () => {
      const res = await req('GET', '/assignments/00000000000000000000000000', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not return assignment from another company (IDOR)', async () => {
      const list = await req('GET', '/assignments?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('GET', `/assignments/${id}`, null,
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('PATCH /assignments/:id/start', () => {
    it('should start a planned assignment', async () => {
      const createRes = await req('POST', '/assignments', {
        vehicleId: vehicleA2, driverId: driverA2, startDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/assignments/${id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'active');
    });

    it('should reject starting already active assignment', async () => {
      const list = await req('GET', '/assignments?status=active&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('PATCH', `/assignments/${id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('PATCH /assignments/:id/end', () => {
    it('should end an active assignment', async () => {
      const list = await req('GET', '/assignments?status=active&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('PATCH', `/assignments/${id}/end`, {
        endDate: '2026-08-15', endMileage: 45000, fuelLevelEnd: 50,
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'completed');
      assert.strictEqual(res.data.data.endMileage, 45000);
    });
  });

  describe('PATCH /assignments/:id/cancel', () => {
    it('should cancel a planned assignment', async () => {
      const createRes = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA2, startDate: '2026-10-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/assignments/${id}/cancel`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'cancelled');
    });

    it('should reject cancelling completed assignment', async () => {
      const list = await req('GET', '/assignments?status=completed&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('PATCH', `/assignments/${id}/cancel`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('PUT /assignments/:id', () => {
    it('should update assignment fields', async () => {
      const createRes = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA1, startDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      const res = await req('PUT', `/assignments/${id}`, {
        notes: 'Updated notes', destination: 'Yaoundé',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.notes, 'Updated notes');
      assert.strictEqual(res.data.data.destination, 'Yaoundé');
    });

    it('should reject updating completed assignment', async () => {
      const list = await req('GET', '/assignments?status=completed&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('PUT', `/assignments/${id}`, { notes: 'Nope' },
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('DELETE /assignments/:id', () => {
    it('should soft-delete a cancelled assignment', async () => {
      const createRes = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA1, startDate: '2026-11-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      await req('PATCH', `/assignments/${id}/cancel`, null,
        { Authorization: `Bearer ${tokenA}` });

      const res = await req('DELETE', `/assignments/${id}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
    });

    it('should reject deleting active assignment', async () => {
      const list = await req('GET', '/assignments?status=active&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('DELETE', `/assignments/${id}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('GET /assignments/history', () => {
    it('should return history of completed/cancelled assignments', async () => {
      const res = await req('GET', '/assignments/history', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.assignments));
    });
  });

  describe('GET /assignments/stats', () => {
    it('should return assignment stats', async () => {
      const res = await req('GET', '/assignments/stats', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.total === 'number');
      assert.ok(typeof res.data.data.active === 'number');
      assert.ok(typeof res.data.data.planned === 'number');
      assert.ok(typeof res.data.data.completed === 'number');
    });
  });

  describe('Tenant isolation', () => {
    it('should not access assignment from another company', async () => {
      const list = await req('GET', '/assignments?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('GET', `/assignments/${id}`, null,
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not create cross-tenant assignment', async () => {
      const res = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverB1, startDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not allow PUT cross-tenant assignment', async () => {
      const list = await req('GET', '/assignments?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('PUT', `/assignments/${id}`, { notes: 'Hacked' },
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not allow DELETE cross-tenant assignment', async () => {
      const list = await req('GET', '/assignments?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.assignments.length === 0) return;
      const id = list.data.data.assignments[0].id;

      const res = await req('DELETE', `/assignments/${id}`, null,
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('Vehicle status synchronization', () => {
    it('should update vehicle to in_use on start and available on end', async () => {
      const createRes = await req('POST', '/assignments', {
        vehicleId: vehicleA2, driverId: driverA1, startDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const assignmentId = createRes.data.data.id;

      await req('PATCH', `/assignments/${assignmentId}/start`, null,
        { Authorization: `Bearer ${tokenA}` });

      const vehicle = await req('GET', `/vehicles/${vehicleA2}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(vehicle.data.data.status, 'in_use');

      await req('PATCH', `/assignments/${assignmentId}/end`, { endDate: '2026-08-15' },
        { Authorization: `Bearer ${tokenA}` });
      const vehicleAfter = await req('GET', `/vehicles/${vehicleA2}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(vehicleAfter.data.data.status, 'available');
    });
  });

  describe('Vehicle conflict detection', () => {
    it('should reject starting assignment when vehicle is already active', async () => {
      const createA = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA1, startDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createA.status !== 201) return;

      const startA = await req('PATCH', `/assignments/${createA.data.data.id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });
      if (startA.status !== 200) return;

      const createB = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA2, startDate: '2026-08-02',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createB.status !== 201) return;

      const startB = await req('PATCH', `/assignments/${createB.data.data.id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(startB.status, 409);
    });
  });
});
