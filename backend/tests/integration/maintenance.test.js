import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8105;
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
  await pool.execute('DELETE FROM maintenance_records WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['MntIntTest%']);
  await pool.execute('DELETE FROM fuel_records WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['MntIntTest%']);
  await pool.execute('DELETE FROM vehicles WHERE registration_number LIKE ?', ['MV-%']);
  await pool.execute('DELETE FROM drivers WHERE employee_code LIKE ?', ['DRV_MNT_%']);
  await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['MntIntTest%']);
  await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%mnt_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Maintenance Integration', () => {
  let tokenA, tokenB, companyIdA, companyIdB;
  let vehicleA1, vehicleA2, vehicleA3, vehicleA4, vehicleA5, vehicleB1;
  let driverA1;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Mnt', lastName: 'AdminA',
      email: `mnt_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'MntIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Mnt', lastName: 'AdminB',
      email: `mnt_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'MntIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;

    const v1 = await req('POST', '/vehicles', {
      registrationNumber: `MV-${ts}-01`, brand: 'Toyota', model: 'Hilux',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v1.status, 201);
    vehicleA1 = v1.data.data.id;

    const v2 = await req('POST', '/vehicles', {
      registrationNumber: `MV-${ts}-02`, brand: 'Mercedes', model: 'Sprinter',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v2.status, 201);
    vehicleA2 = v2.data.data.id;

    const v3 = await req('POST', '/vehicles', {
      registrationNumber: `MV-${ts}-03`, brand: 'Renault', model: 'Master',
      fuelType: 'essence', status: 'available',
    }, { Authorization: `Bearer ${tokenB}` });
    assert.strictEqual(v3.status, 201);
    vehicleB1 = v3.data.data.id;

    const v4 = await req('POST', '/vehicles', {
      registrationNumber: `MV-${ts}-04`, brand: 'Peugeot', model: 'Partner',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v4.status, 201);
    vehicleA3 = v4.data.data.id;

    const v5 = await req('POST', '/vehicles', {
      registrationNumber: `MV-${ts}-05`, brand: 'Citroen', model: 'Berlingo',
      fuelType: 'essence', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v5.status, 201);
    vehicleA4 = v5.data.data.id;

    const v6 = await req('POST', '/vehicles', {
      registrationNumber: `MV-${ts}-06`, brand: 'Ford', model: 'Transit',
      fuelType: 'diesel', status: 'available',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(v6.status, 201);
    vehicleA5 = v6.data.data.id;

    const d1 = await req('POST', '/drivers', {
      firstName: 'Ali', lastName: 'DriverMnt',
      employeeCode: `DRV_MNT_${ts}`, phone: '+237600000001',
    }, { Authorization: `Bearer ${tokenA}` });
    assert.strictEqual(d1.status, 201);
    driverA1 = d1.data.data.id;
  });

  describe('POST /maintenances', () => {
    it('should create a planned maintenance record', async () => {
      const res = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'vidange',
        priority: 'normal',
        status: 'planned',
        scheduledDate: '2026-09-15',
        description: 'Vidange complète du moteur',
        workshop: 'Garage Central',
        mechanic: 'Jean Dupont',
        supplier: 'TotalEnergies',
        estimatedCost: 50000,
        mileage: 15000,
        notes: 'Premier entretien',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.id);
      assert.strictEqual(res.data.data.maintenanceType, 'vidange');
      assert.strictEqual(res.data.data.status, 'planned');
      assert.strictEqual(res.data.data.priority, 'normal');
      assert.strictEqual(res.data.data.description, 'Vidange complète du moteur');
      assert.strictEqual(res.data.data.vehicleId, vehicleA1);
      assert.strictEqual(res.data.data.companyId, companyIdA);
    });

    it('should reject without vehicleId (422)', async () => {
      const res = await req('POST', '/maintenances', {
        maintenanceType: 'vidange',
        scheduledDate: '2026-09-15',
        description: 'Test sans vehicleId',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject missing description (422)', async () => {
      const res = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'vidange',
        scheduledDate: '2026-09-15',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject without auth token (401)', async () => {
      const res = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'vidange',
        scheduledDate: '2026-09-15',
        description: 'Test sans auth',
      });
      assert.strictEqual(res.status, 401);
    });
  });

  describe('GET /maintenances', () => {
    it('should list maintenance records', async () => {
      const res = await req('GET', '/maintenances?page=1&limit=10', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.maintenances));
      assert.ok(res.data.data.total >= 1);
    });

    it('should not return records from another company', async () => {
      const res = await req('GET', '/maintenances', null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 200);
      for (const record of res.data.data.maintenances) {
        assert.strictEqual(record.companyId, companyIdB);
      }
    });
  });

  describe('GET /maintenances/:id', () => {
    it('should return maintenance by id', async () => {
      const list = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      const id = list.data.data.maintenances[0].id;
      const res = await req('GET', `/maintenances/${id}`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, id);
    });

    it('should return 404 for non-existent', async () => {
      const res = await req('GET', '/maintenances/00000000000000000000000000', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not access record from another company (IDOR)', async () => {
      const listA = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.maintenances.length === 0) return;
      const idA = listA.data.data.maintenances[0].id;
      const res = await req('GET', `/maintenances/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('PUT /maintenances/:id', () => {
    it('should update maintenance fields', async () => {
      const list = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      const id = list.data.data.maintenances[0].id;
      const res = await req('PUT', `/maintenances/${id}`, {
        notes: 'Updated maintenance note',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.notes, 'Updated maintenance note');
    });

    it('should reject updating completed record (409)', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'revision',
        status: 'planned',
        scheduledDate: '2026-10-01',
        description: 'Revision pour test lock',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const startRes = await req('PATCH', `/maintenances/${id}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(startRes.status, 200);

      const completeRes = await req('PATCH', `/maintenances/${id}/complete`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(completeRes.status, 200);

      const res = await req('PUT', `/maintenances/${id}`, { notes: 'Cannot update' }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });

    it('should not update record from another company (IDOR)', async () => {
      const listA = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.maintenances.length === 0) return;
      const idA = listA.data.data.maintenances[0].id;
      const res = await req('PUT', `/maintenances/${idA}`, { notes: 'hack' }, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('PATCH /maintenances/:id/start', () => {
    it('should start a planned maintenance → in_progress', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA2,
        maintenanceType: 'freinage',
        status: 'planned',
        scheduledDate: '2026-09-20',
        description: 'Changement des plaquettes de frein',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/maintenances/${id}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'in_progress');
      assert.ok(res.data.data.startedAt);
    });

    it('should reject starting completed maintenance', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'pneumatiques',
        status: 'planned',
        scheduledDate: '2026-10-05',
        description: 'Changement pneus pour test reject start',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const startRes = await req('PATCH', `/maintenances/${id}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(startRes.status, 200);

      const completeRes = await req('PATCH', `/maintenances/${id}/complete`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(completeRes.status, 200);

      const res = await req('PATCH', `/maintenances/${id}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });

    it('should reject starting when another maintenance is already in_progress for same vehicle', async () => {
      const createA = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'batterie',
        status: 'planned',
        scheduledDate: '2026-10-10',
        description: 'Remplacement batterie A',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createA.status, 201);
      const idA = createA.data.data.id;

      const createB = await req('POST', '/maintenances', {
        vehicleId: vehicleA1,
        maintenanceType: 'climatisation',
        status: 'planned',
        scheduledDate: '2026-10-12',
        description: 'Reparation clim B',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createB.status, 201);
      const idB = createB.data.data.id;

      const startA = await req('PATCH', `/maintenances/${idA}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(startA.status, 200);

      const res = await req('PATCH', `/maintenances/${idB}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });
  });

  describe('PATCH /maintenances/:id/complete', () => {
    it('should complete an in_progress maintenance → completed', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA3,
        maintenanceType: 'controle_technique',
        status: 'planned',
        scheduledDate: '2026-09-25',
        description: 'Controle technique annuel',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const startRes = await req('PATCH', `/maintenances/${id}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(startRes.status, 200);

      const res = await req('PATCH', `/maintenances/${id}/complete`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'completed');
      assert.ok(res.data.data.completedAt);
    });

    it('should reject completing a planned maintenance', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA3,
        maintenanceType: 'inspection',
        status: 'planned',
        scheduledDate: '2026-10-15',
        description: 'Inspection refus complete',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/maintenances/${id}/complete`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });
  });

  describe('PATCH /maintenances/:id/cancel', () => {
    it('should cancel a planned maintenance', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA4,
        maintenanceType: 'transmission',
        status: 'planned',
        scheduledDate: '2026-10-20',
        description: 'Entretien transmission à annuler',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/maintenances/${id}/cancel`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'cancelled');
    });

    it('should reject cancelling completed maintenance', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA4,
        maintenanceType: 'suspension',
        status: 'planned',
        scheduledDate: '2026-10-25',
        description: 'Suspension pour test cancel completed',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const startRes = await req('PATCH', `/maintenances/${id}/start`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(startRes.status, 200);

      const completeRes = await req('PATCH', `/maintenances/${id}/complete`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(completeRes.status, 200);

      const res = await req('PATCH', `/maintenances/${id}/cancel`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 409);
    });
  });

  describe('DELETE /maintenances/:id', () => {
    it('should soft-delete a planned maintenance', async () => {
      const createRes = await req('POST', '/maintenances', {
        vehicleId: vehicleA5,
        maintenanceType: 'moteur',
        status: 'planned',
        scheduledDate: '2026-11-01',
        description: 'Entretien moteur à supprimer',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(createRes.status, 201);
      const id = createRes.data.data.id;

      const res = await req('DELETE', `/maintenances/${id}`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
    });

    it('should not delete record from another company (IDOR)', async () => {
      const listA = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.maintenances.length === 0) return;
      const idA = listA.data.data.maintenances[0].id;
      const res = await req('DELETE', `/maintenances/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('GET /maintenances/stats', () => {
    it('should return maintenance statistics', async () => {
      const res = await req('GET', '/maintenances/stats', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.totalCount === 'number');
      assert.ok(typeof res.data.data.plannedCount === 'number');
      assert.ok(typeof res.data.data.completedCount === 'number');
      assert.ok(typeof res.data.data.monthCost === 'number');
      assert.ok(typeof res.data.data.yearCost === 'number');
      assert.ok(Array.isArray(res.data.data.statusDistribution));
    });
  });

  describe('GET /maintenances/calendar', () => {
    it('should return calendar events', async () => {
      const res = await req('GET', '/maintenances/calendar', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
    });
  });

  describe('GET /maintenances/history', () => {
    it('should return history for a vehicle', async () => {
      const res = await req('GET', `/maintenances/history?vehicleId=${vehicleA1}`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
    });
  });

  describe('GET /vehicles/:vehicleId/maintenances', () => {
    it('should return vehicle maintenance history', async () => {
      const res = await req('GET', `/vehicles/${vehicleA1}/maintenances`, null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
    });

    it('should return 404 for non-existent vehicle', async () => {
      const res = await req('GET', '/vehicles/00000000000000000000000000/maintenances', null, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });
  });

  describe('Tenant isolation', () => {
    it('should not access maintenance from another company (GET)', async () => {
      const listA = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.maintenances.length === 0) return;
      const idA = listA.data.data.maintenances[0].id;
      const res = await req('GET', `/maintenances/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not create cross-tenant maintenance', async () => {
      const res = await req('POST', '/maintenances', {
        vehicleId: vehicleB1,
        maintenanceType: 'vidange',
        scheduledDate: '2026-09-30',
        description: 'Cross tenant maintenance',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not PUT cross-tenant maintenance', async () => {
      const listA = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.maintenances.length === 0) return;
      const idA = listA.data.data.maintenances[0].id;
      const res = await req('PUT', `/maintenances/${idA}`, { notes: 'hack' }, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });

    it('should not DELETE cross-tenant maintenance', async () => {
      const listA = await req('GET', '/maintenances?page=1&limit=1', null, { Authorization: `Bearer ${tokenA}` });
      if (listA.data.data.maintenances.length === 0) return;
      const idA = listA.data.data.maintenances[0].id;
      const res = await req('DELETE', `/maintenances/${idA}`, null, { Authorization: `Bearer ${tokenB}` });
      assert.strictEqual(res.status, 404);
    });
  });
});
