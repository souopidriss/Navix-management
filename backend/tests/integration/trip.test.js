import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8103;
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
  await pool.execute('DELETE FROM trips WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['TripIntTest%']);
  await pool.execute('DELETE FROM assignments WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['TripIntTest%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_TRIP_%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_TRIP2_%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_TRIP_B_%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['TAA-%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['TBB-%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['TCC-%']);
  await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['TripIntTest%']);
  await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%trip_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Trip Integration', () => {
  let tokenA, tokenB, companyIdA, companyIdB;
  let vehicleA1, vehicleA2, vehicleB1;
  let driverA1, driverA2, driverB1;
  let assignmentA1, assignmentA2, assignmentB1;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Trip', lastName: 'AdminA',
      email: `trip_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'TripIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Trip', lastName: 'AdminB',
      email: `trip_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'TripIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;

    const v1 = await req('POST', '/vehicles', {
      registrationNumber: `TAA-${ts}-01`, brand: 'Toyota', model: 'Hilux',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    vehicleA1 = v1.data.data.id;

    const v2 = await req('POST', '/vehicles', {
      registrationNumber: `TBB-${ts}-02`, brand: 'Mercedes', model: 'Sprinter',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    vehicleA2 = v2.data.data.id;

    const v3 = await req('POST', '/vehicles', {
      registrationNumber: `TCC-${ts}-03`, brand: 'Renault', model: 'Master',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenB}` });
    vehicleB1 = v3.data.data.id;

    const d1 = await req('POST', '/drivers', {
      firstName: 'Jean', lastName: 'Dupont',
      employeeCode: `DRV_TRIP_${ts}`, phone: '+237600000001',
    }, { Authorization: `Bearer ${tokenA}` });
    driverA1 = d1.data.data.id;

    const d2 = await req('POST', '/drivers', {
      firstName: 'Marie', lastName: 'Claire',
      employeeCode: `DRV_TRIP2_${ts}`, phone: '+237600000002',
    }, { Authorization: `Bearer ${tokenA}` });
    driverA2 = d2.data.data.id;

    const d3 = await req('POST', '/drivers', {
      firstName: 'Paul', lastName: 'Martin',
      employeeCode: `DRV_TRIP_B_${ts}`, phone: '+237600000003',
    }, { Authorization: `Bearer ${tokenB}` });
    driverB1 = d3.data.data.id;

    const a1 = await req('POST', '/assignments', {
      vehicleId: vehicleA1, driverId: driverA1,
      assignmentType: 'permanent', startDate: '2026-08-01',
      expectedEndDate: '2027-08-01',
    }, { Authorization: `Bearer ${tokenA}` });
    assignmentA1 = a1.data.data.id;

    const startA1 = await req('PATCH', `/assignments/${assignmentA1}/start`, null,
      { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(startA1.status, 200);

    const a2 = await req('POST', '/assignments', {
      vehicleId: vehicleA2, driverId: driverA2,
      assignmentType: 'temporary', startDate: '2026-08-01',
      expectedEndDate: '2027-08-01',
    }, { Authorization: `Bearer ${tokenA}` });
    assignmentA2 = a2.data.data.id;

    const aB1 = await req('POST', '/assignments', {
      vehicleId: vehicleB1, driverId: driverB1,
      assignmentType: 'permanent', startDate: '2026-08-01',
      expectedEndDate: '2027-08-01',
    }, { Authorization: `Bearer ${tokenB}` });
    assignmentB1 = aB1.data.data.id;

    const startB1 = await req('PATCH', `/assignments/${assignmentB1}/start`, null,
      { Authorization: `Bearer ${tokenB}` });
    assert.strictEqual(startB1.status, 200);
  });

  describe('POST /trips', () => {
    it('should create a planned trip with active assignment', async () => {
      const res = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Douala',
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.data.status, 'planned');
      assert.strictEqual(res.data.data.assignmentId, assignmentA1);
      assert.strictEqual(res.data.data.departureLocation, 'Douala');
      assert.strictEqual(res.data.data.arrivalLocation, 'Yaoundé');
    });

    it('should reject trip without assignment', async () => {
      const res = await req('POST', '/trips', {
        departureLocation: 'Douala',
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject trip with inactive assignment', async () => {
      const inactiveCreate = await req('POST', '/assignments', {
        vehicleId: vehicleA1, driverId: driverA2,
        assignmentType: 'temporary', startDate: '2026-09-01',
        expectedEndDate: '2026-12-31',
      }, { Authorization: `Bearer ${tokenA}` });
      if (inactiveCreate.status !== 201) return;
      const inactiveId = inactiveCreate.data.data.id;

      const res = await req('POST', '/trips', {
        assignmentId: inactiveId,
        departureLocation: 'Douala',
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });

    it('should reject without auth token', async () => {
      const res = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Douala',
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-09-01',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject missing departureLocation', async () => {
      const res = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject missing arrivalLocation', async () => {
      const res = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Douala',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject missing departureDate', async () => {
      const res = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Douala',
        arrivalLocation: 'Yaoundé',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });
  });

  describe('GET /trips', () => {
    it('should list trips with pagination', async () => {
      const res = await req('GET', '/trips?page=1&limit=10', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data.trips));
      assert.ok(res.data.data.pagination.total >= 1);
    });

    it('should not return trips from another company', async () => {
      const res = await req('GET', '/trips', null,
        { Authorization: `Bearer ${tokenA}` });
      const other = res.data.data.trips.filter((t) => t.companyId !== companyIdA);
      assert.strictEqual(other.length, 0);
    });

    it('should filter by status', async () => {
      const res = await req('GET', '/trips?status=planned', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      for (const t of res.data.data.trips) {
        assert.strictEqual(t.status, 'planned');
      }
    });
  });

  describe('GET /trips/:id', () => {
    it('should return trip by id', async () => {
      const list = await req('GET', '/trips?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      const id = list.data.data.trips[0]?.id;
      if (!id) return;

      const res = await req('GET', `/trips/${id}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, id);
    });

    it('should return 404 for non-existent trip', async () => {
      const res = await req('GET', '/trips/00000000000000000000000000', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not return trip from another company (IDOR)', async () => {
      const list = await req('GET', '/trips?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('GET', `/trips/${id}`, null,
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('PATCH /trips/:id/start', () => {
    it('should start a planned trip', async () => {
      const createRes = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Kribi',
        arrivalLocation: 'Edea',
        departureDate: '2026-09-02',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/trips/${id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'in_progress');
    });

    it('should reject starting already in_progress trip', async () => {
      const list = await req('GET', '/trips?status=in_progress&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('PATCH', `/trips/${id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('POST /trips/:id/finish', () => {
    it('should finish an in_progress trip', async () => {
      const list = await req('GET', '/trips?status=in_progress&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('POST', `/trips/${id}/finish`, {
        arrivalDate: '2026-09-03',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'completed');
    });

    it('should reject finishing a planned trip', async () => {
      const list = await req('GET', '/trips?status=planned&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('POST', `/trips/${id}/finish`, {
        arrivalDate: '2026-09-03',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });
  });

  describe('PATCH /trips/:id/cancel', () => {
    it('should cancel a planned trip', async () => {
      const createRes = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Bamenda',
        arrivalLocation: 'Bafoussam',
        departureDate: '2026-10-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/trips/${id}/cancel`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'cancelled');
    });

    it('should reject cancelling completed trip', async () => {
      const list = await req('GET', '/trips?status=completed&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('PATCH', `/trips/${id}/cancel`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('PATCH /trips/:id/pause', () => {
    it('should pause an in_progress trip', async () => {
      const createRes = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Limbé',
        arrivalLocation: 'Buea',
        departureDate: '2026-11-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      await req('PATCH', `/trips/${id}/start`, null,
        { Authorization: `Bearer ${tokenA}` });

      const res = await req('PATCH', `/trips/${id}/pause`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'suspended');
    });
  });

  describe('PATCH /trips/:id/resume', () => {
    it('should resume a suspended trip', async () => {
      const list = await req('GET', '/trips?status=suspended&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('PATCH', `/trips/${id}/resume`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'in_progress');
    });
  });

  describe('PUT /trips/:id', () => {
    it('should update trip fields', async () => {
      const createRes = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Ngaoundere',
        arrivalLocation: 'Maroua',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      const res = await req('PUT', `/trips/${id}`, {
        departureLocation: 'Garoua',
        notes: 'Updated trip',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.departureLocation, 'Garoua');
      assert.strictEqual(res.data.data.notes, 'Updated trip');
    });

    it('should reject updating completed trip', async () => {
      const list = await req('GET', '/trips?status=completed&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('PUT', `/trips/${id}`, { notes: 'Nope' },
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });
  });

  describe('DELETE /trips/:id', () => {
    it('should soft-delete a cancelled trip', async () => {
      const createRes = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Ebolowa',
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-11-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (createRes.status !== 201) return;
      const id = createRes.data.data.id;

      await req('PATCH', `/trips/${id}/cancel`, null,
        { Authorization: `Bearer ${tokenA}` });

      const res = await req('DELETE', `/trips/${id}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
    });

    it('should reject deleting active trip', async () => {
      const list = await req('GET', '/trips?status=in_progress&page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('DELETE', `/trips/${id}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 400);
    });
  });

  describe('GET /trips/stats', () => {
    it('should return trip stats', async () => {
      const res = await req('GET', '/trips/stats', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.total === 'number');
      assert.ok(typeof res.data.data.planned === 'number');
      assert.ok(typeof res.data.data.completed === 'number');
    });
  });

  describe('GET /trips/history', () => {
    it('should return history of completed/cancelled trips', async () => {
      const res = await req('GET', '/trips/history', null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.trips));
    });
  });

  describe('Tenant isolation', () => {
    it('should not access trip from another company', async () => {
      const list = await req('GET', '/trips?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('GET', `/trips/${id}`, null,
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not create cross-tenant trip', async () => {
      const res = await req('POST', '/trips', {
        assignmentId: assignmentA1,
        departureLocation: 'Douala',
        arrivalLocation: 'Yaoundé',
        departureDate: '2026-08-01',
      }, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not allow PUT cross-tenant trip', async () => {
      const list = await req('GET', '/trips?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('PUT', `/trips/${id}`, { notes: 'Hacked' },
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not allow DELETE cross-tenant trip', async () => {
      const list = await req('GET', '/trips?page=1&limit=1', null,
        { Authorization: `Bearer ${tokenA}` });
      if (list.data.data.trips.length === 0) return;
      const id = list.data.data.trips[0].id;

      const res = await req('DELETE', `/trips/${id}`, null,
        { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('Vehicle status synchronization', () => {
    it('should update vehicle to in_use on trip start and available on trip finish', async () => {
      const vRes = await req('POST', '/vehicles', {
        registrationNumber: `TV-${Date.now()}-sync`, brand: 'Toyota', model: 'Corolla',
        fuelType: 'essence', status: 'available',
      }, { Authorization: `Bearer ${tokenA}` });
      const syncVehicleId = vRes.data.data.id;

      const dRes = await req('POST', '/drivers', {
        firstName: 'Sync', lastName: 'Driver',
        employeeCode: `DRV_TRIP_SYNC_${Date.now()}`, phone: '+237600000099',
      }, { Authorization: `Bearer ${tokenA}` });
      const syncDriverId = dRes.data.data.id;

      const aRes = await req('POST', '/assignments', {
        vehicleId: syncVehicleId, driverId: syncDriverId,
        assignmentType: 'temporary', startDate: '2026-08-01',
        expectedEndDate: '2027-08-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (aRes.status !== 201) return;
      const syncAssignmentId = aRes.data.data.id;

      await req('PATCH', `/assignments/${syncAssignmentId}/start`, null,
        { Authorization: `Bearer ${tokenA}` });

      const tRes = await req('POST', '/trips', {
        assignmentId: syncAssignmentId,
        departureLocation: 'Yaoundé',
        arrivalLocation: 'Douala',
        departureDate: '2026-09-01',
      }, { Authorization: `Bearer ${tokenA}` });
      if (tRes.status !== 201) return;
      const tripId = tRes.data.data.id;

      await req('PATCH', `/trips/${tripId}/start`, null,
        { Authorization: `Bearer ${tokenA}` });

      const vehicle = await req('GET', `/vehicles/${syncVehicleId}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(vehicle.data.data.status, 'in_use');

      await req('POST', `/trips/${tripId}/finish`, { arrivalDate: '2026-09-02' },
        { Authorization: `Bearer ${tokenA}` });

      const vehicleAfter = await req('GET', `/vehicles/${syncVehicleId}`, null,
        { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(vehicleAfter.data.data.status, 'available');
    });
  });
});
