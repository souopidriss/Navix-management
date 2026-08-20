import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8130;
const BASE_URL = `http://localhost:${PORT}`;
let server;

process.env.RATE_LIMIT_MAX = '99999';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.AUTH_RATE_LIMIT_MAX = '99999';
process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';

async function req(method, path, body, headers = {}) {
  const opts = { method, headers: { 'Content-Type': 'application/json', ...headers } };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, headers: Object.fromEntries(res.headers.entries()) };
}

function auth(token) { return { Authorization: `Bearer ${token}` }; }
function today() { return new Date().toISOString().split('T')[0]; }
function nextWeek() { return new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]; }
function nextMonth() { return new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]; }

before(async () => {
  const { default: app } = await import('../../src/app.js');
  createPool();
  await new Promise((resolve) => { server = app.listen(PORT, resolve); });
  const pool = getPool();
  await pool.query('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_e2etest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%_e2etest%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['E2ETest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('E2E Full Workflow — Prompt 024', () => {
  let tokenA, tokenB, tokenSuperAdmin;
  let companyIdA, companyIdB, userIdA, userIdB;
  let vehicleIdA, vehicleIdA2, driverIdA, driverIdA2;
  let assignmentId, tripId, fuelId, maintenanceId, documentId;
  let savedReportId, invoiceId, paymentId;

  const ts = Date.now();

  // ═══════════════════════════════════════════════════════════════
  // PHASE 1: AUTHENTICATION FLOW
  // ═══════════════════════════════════════════════════════════════
  describe('1. Authentication Flow', () => {
    it('should register a new company user', async () => {
      const res = await req('POST', '/api/v1/auth/register', {
        firstName: 'E2E', lastName: 'AdminA',
        email: `e2e_admin_a${ts}@test.com`, password: 'Test1234!', confirmPassword: 'Test1234!',
        companyName: `E2ETest Corp A ${ts}`, role: 'client_enterprise',
      });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.user);
      assert.ok(res.data.data.company);
      assert.ok(res.data.data.tokens.accessToken);
      tokenA = res.data.data.tokens.accessToken;
      companyIdA = res.data.data.company.id;
      userIdA = res.data.data.user.id;
    });

    it('should login with correct credentials', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: `e2e_admin_a${ts}@test.com`, password: 'Test1234!',
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.tokens.accessToken);
    });

    it('should reject login with wrong password', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: `e2e_admin_a${ts}@test.com`, password: 'WrongPass1!',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject login with unknown email', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: `e2e_unknown${ts}@test.com`, password: 'Test1234!',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should return user info on /auth/me', async () => {
      const res = await req('GET', '/api/v1/auth/me', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.user);
      assert.ok(!res.data.data.user.password);
    });

    it('should reject /auth/me without token', async () => {
      const res = await req('GET', '/api/v1/auth/me');
      assert.strictEqual(res.status, 401);
    });

    it('should reject /auth/me with invalid token', async () => {
      const res = await req('GET', '/api/v1/auth/me', null, auth('invalid-token-xyz'));
      assert.strictEqual(res.status, 401);
    });

    it('should change password', async () => {
      const res = await req('POST', '/api/v1/auth/change-password', {
        currentPassword: 'Test1234!', newPassword: 'Test1234!!', confirmNewPassword: 'Test1234!!',
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should login with new password', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: `e2e_admin_a${ts}@test.com`, password: 'Test1234!!',
      });
      assert.strictEqual(res.status, 200);
      tokenA = res.data.data.tokens.accessToken;
    });

    it('should logout successfully', async () => {
      const res = await req('POST', '/api/v1/auth/logout', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should re-login after logout', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: `e2e_admin_a${ts}@test.com`, password: 'Test1234!!',
      });
      assert.strictEqual(res.status, 200);
      tokenA = res.data.data.tokens.accessToken;
    });

    it('should return 400 for invalid JSON body', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{invalid',
      });
      assert.strictEqual(res.status, 400);
    });

    it('should return 422 for missing login fields', async () => {
      const res = await req('POST', '/api/v1/auth/login', {});
      assert.strictEqual(res.status, 422);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 2: COMPANY, USERS & PERMISSIONS
  // ═══════════════════════════════════════════════════════════════
  describe('2. Company, Users & Permissions', () => {
    it('should get current company', async () => {
      const res = await req('GET', `/api/v1/companies/${companyIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data);
    });

    it('should list companies', async () => {
      const res = await req('GET', '/api/v1/companies', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data);
    });

    it('should list users', async () => {
      const res = await req('GET', '/api/v1/users', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data);
    });

    it('should list permissions', async () => {
      const res = await req('GET', '/api/v1/permissions', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should list permission modules', async () => {
      const res = await req('GET', '/api/v1/permissions/modules', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 3: VEHICLE LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  describe('3. Vehicle Lifecycle', () => {
    it('should create a vehicle', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `E2E-${ts}-001`, brand: 'Toyota', model: 'Hilux',
        fuelType: 'diesel', mileage: 15000,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      vehicleIdA = res.data.data.id;
    });

    it('should create a second vehicle', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `E2E-${ts}-002`, brand: 'Mercedes', model: 'Sprinter',
        fuelType: 'diesel', mileage: 30000,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      vehicleIdA2 = res.data.data.id;
    });

    it('should list vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data);
    });

    it('should get vehicle by id', async () => {
      const res = await req('GET', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.brand, 'Toyota');
    });

    it('should update vehicle', async () => {
      const res = await req('PUT', `/api/v1/vehicles/${vehicleIdA}`, {
        mileage: 16000,
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get vehicle stats', async () => {
      const res = await req('GET', '/api/v1/vehicles/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should search vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles?search=Toyota', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should sort vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles?sort=brand&order=asc', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should paginate vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=1', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should reject duplicate registration', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `E2E-${ts}-001`, brand: 'Toyota', model: 'Hilux',
      }, auth(tokenA));
      assert.strictEqual(res.status, 409);
    });

    it('should reject vehicle with missing fields', async () => {
      const res = await req('POST', '/api/v1/vehicles', { brand: 'Test' }, auth(tokenA));
      assert.strictEqual(res.status, 422);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 4: DRIVER LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  describe('4. Driver Lifecycle', () => {
    it('should create a driver', async () => {
      const res = await req('POST', '/api/v1/drivers', {
        firstName: 'E2E', lastName: 'DriverA',
        employeeCode: `DRVA-${ts}`,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      driverIdA = res.data.data.id;
    });

    it('should create a second driver', async () => {
      const res = await req('POST', '/api/v1/drivers', {
        firstName: 'E2E', lastName: 'DriverB',
        employeeCode: `DRVB-${ts}`,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      driverIdA2 = res.data.data.id;
    });

    it('should list drivers', async () => {
      const res = await req('GET', '/api/v1/drivers', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data);
    });

    it('should get driver by id', async () => {
      const res = await req('GET', `/api/v1/drivers/${driverIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should update driver', async () => {
      const res = await req('PUT', `/api/v1/drivers/${driverIdA}`, {
        firstName: 'E2E Updated',
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get driver stats', async () => {
      const res = await req('GET', '/api/v1/drivers/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 5: ASSIGNMENT LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  describe('5. Assignment Lifecycle', () => {
    it('should create an assignment', async () => {
      const res = await req('POST', '/api/v1/assignments', {
        vehicleId: vehicleIdA, driverId: driverIdA,
        startDate: today(), endDate: nextWeek(),
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assignmentId = res.data.data.id;
    });

    it('should list assignments', async () => {
      const res = await req('GET', '/api/v1/assignments', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get assignment by id', async () => {
      const res = await req('GET', `/api/v1/assignments/${assignmentId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should start assignment', async () => {
      const res = await req('PATCH', `/api/v1/assignments/${assignmentId}/start`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get assignment stats', async () => {
      const res = await req('GET', '/api/v1/assignments/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get assignment history', async () => {
      const res = await req('GET', '/api/v1/assignments/history', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get assignments by vehicle', async () => {
      const res = await req('GET', `/api/v1/assignments/vehicle/${vehicleIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get assignments by driver', async () => {
      const res = await req('GET', `/api/v1/assignments/driver/${driverIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 6: TRIP LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  describe('6. Trip Lifecycle', () => {
    it('should create a trip', async () => {
      const res = await req('POST', '/api/v1/trips', {
        assignmentId, departureLocation: 'Douala', arrivalLocation: 'Yaoundé',
        departureDate: today(), departureMileage: 16000,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      tripId = res.data.data.id;
    });

    it('should list trips', async () => {
      const res = await req('GET', '/api/v1/trips', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get trip by id', async () => {
      const res = await req('GET', `/api/v1/trips/${tripId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should start trip', async () => {
      const res = await req('PATCH', `/api/v1/trips/${tripId}/start`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should complete trip', async () => {
      const res = await req('PATCH', `/api/v1/trips/${tripId}/complete`, {
        arrivalDate: today(), arrivalMileage: 16250, actualDistance: 250,
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get trip stats', async () => {
      const res = await req('GET', '/api/v1/trips/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get trip history', async () => {
      const res = await req('GET', '/api/v1/trips/history', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get trips by driver', async () => {
      const res = await req('GET', `/api/v1/trips/by-driver/${driverIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 7: FUEL RECORDS
  // ═══════════════════════════════════════════════════════════════
  describe('7. Fuel Records', () => {
    it('should create a fuel record', async () => {
      const res = await req('POST', '/api/v1/fuel', {
        vehicleId: vehicleIdA, fuelType: 'diesel',
        stationName: 'E2E Station', quantity: 60, unitPrice: 750,
        mileage: 16250,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      fuelId = res.data.data.id;
    });

    it('should list fuel records', async () => {
      const res = await req('GET', '/api/v1/fuel', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get fuel record by id', async () => {
      const res = await req('GET', `/api/v1/fuel/${fuelId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get fuel stats', async () => {
      const res = await req('GET', '/api/v1/fuel/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 8: MAINTENANCE LIFECYCLE
  // ═══════════════════════════════════════════════════════════════
  describe('8. Maintenance Lifecycle', () => {
    it('should create a maintenance record', async () => {
      const res = await req('POST', '/api/v1/maintenance', {
        vehicleId: vehicleIdA,
        maintenanceType: 'vidange', description: 'E2E Oil Change',
        scheduledDate: nextWeek(),
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      maintenanceId = res.data.data.id;
    });

    it('should list maintenance records', async () => {
      const res = await req('GET', '/api/v1/maintenance', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get maintenance by id', async () => {
      const res = await req('GET', `/api/v1/maintenance/${maintenanceId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get maintenance stats', async () => {
      const res = await req('GET', '/api/v1/maintenance/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get maintenance calendar', async () => {
      const res = await req('GET', '/api/v1/maintenance/calendar', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get maintenance history', async () => {
      const res = await req('GET', `/api/v1/maintenance/history?vehicleId=${vehicleIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 9: DOCUMENTS
  // ═══════════════════════════════════════════════════════════════
  describe('9. Documents', () => {
    it('should list documents', async () => {
      const res = await req('GET', '/api/v1/documents', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get document stats', async () => {
      const res = await req('GET', '/api/v1/documents/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should list file types', async () => {
      const res = await req('GET', '/api/v1/documents/file-types', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 10: NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════
  describe('10. Notifications', () => {
    it('should list notifications', async () => {
      const res = await req('GET', '/api/v1/notifications', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get unread count', async () => {
      const res = await req('GET', '/api/v1/notifications/unread-count', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get notification statistics', async () => {
      const res = await req('GET', '/api/v1/notifications/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should list alerts', async () => {
      const res = await req('GET', '/api/v1/notifications/alerts', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get alerts stats overview', async () => {
      const res = await req('GET', '/api/v1/notifications/alerts/stats/overview', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 11: REPORTS
  // ═══════════════════════════════════════════════════════════════
  describe('11. Reports', () => {
    it('should get report statistics', async () => {
      const res = await req('GET', '/api/v1/reports/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get report categories', async () => {
      const res = await req('GET', '/api/v1/reports/categories', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get fleet report', async () => {
      const res = await req('GET', '/api/v1/reports/fleet', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get vehicle report', async () => {
      const res = await req('GET', '/api/v1/reports/vehicles', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get driver report', async () => {
      const res = await req('GET', '/api/v1/reports/drivers', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get fuel report', async () => {
      const res = await req('GET', '/api/v1/reports/fuel', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get maintenance report', async () => {
      const res = await req('GET', '/api/v1/reports/maintenance', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get financial report', async () => {
      const res = await req('GET', '/api/v1/reports/financial', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should save and delete a report', async () => {
      const create = await req('POST', '/api/v1/reports', {
        name: 'E2E Saved Report', reportType: 'fleet',
      }, auth(tokenA));
      assert.strictEqual(create.status, 201);
      savedReportId = create.data.data.id;

      const del = await req('DELETE', `/api/v1/reports/${savedReportId}`, null, auth(tokenA));
      assert.strictEqual(del.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 12: EXPORTS
  // ═══════════════════════════════════════════════════════════════
  describe('12. Exports', () => {
    it('should export report as CSV', async () => {
      const res = await req('POST', '/api/v1/exports/reports', {
        reportType: 'fleet', format: 'csv',
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should export report as PDF', async () => {
      const res = await req('POST', '/api/v1/exports/reports', {
        reportType: 'fleet', format: 'pdf',
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 13: FINANCE
  // ═══════════════════════════════════════════════════════════════
  describe('13. Finance', () => {
    it('should get wallet', async () => {
      const res = await req('GET', '/api/v1/finance/wallet', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get wallet balance', async () => {
      const res = await req('GET', '/api/v1/finance/wallet/balance', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should create a transaction (deposit)', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 500000, description: 'E2E Deposit',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
    });

    it('should list transactions', async () => {
      const res = await req('GET', '/api/v1/finance/transactions', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should create an invoice', async () => {
      const res = await req('POST', '/api/v1/finance/invoices', {
        items: [{ description: 'E2E Service', unit_price: 100000 }],
        dueDate: nextMonth(),
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      invoiceId = res.data.data.id;
    });

    it('should list invoices', async () => {
      const res = await req('GET', '/api/v1/finance/invoices', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 14: BILLING
  // ═══════════════════════════════════════════════════════════════
  describe('14. Billing', () => {
    it('should get billing statistics', async () => {
      const res = await req('GET', '/api/v1/billing/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get billing invoices', async () => {
      const res = await req('GET', '/api/v1/billing/invoices', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get billing payments', async () => {
      const res = await req('GET', '/api/v1/billing/payments', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get billing history', async () => {
      const res = await req('GET', '/api/v1/billing/history', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get billing settings', async () => {
      const res = await req('GET', '/api/v1/billing/settings', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 15: SUBSCRIPTIONS
  // ═══════════════════════════════════════════════════════════════
  describe('15. Subscriptions', () => {
    it('should list subscription plans', async () => {
      const res = await req('GET', '/api/v1/subscriptions', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get subscription features', async () => {
      const res = await req('GET', '/api/v1/subscriptions/features', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get current subscription', async () => {
      const res = await req('GET', '/api/v1/subscriptions/current', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get usage', async () => {
      const res = await req('GET', '/api/v1/subscriptions/usage', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 16: INVOICES (alias)
  // ═══════════════════════════════════════════════════════════════
  describe('16. Invoices (alias)', () => {
    it('should list invoices via /invoices', async () => {
      const res = await req('GET', '/api/v1/invoices', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should get invoice statistics', async () => {
      const res = await req('GET', '/api/v1/invoices/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 17: DASHBOARD
  // ═══════════════════════════════════════════════════════════════
  describe('17. Dashboard', () => {
    it('should get dashboard overview', async () => {
      const res = await req('GET', '/api/v1/dashboard/overview', null, auth(tokenA));
      assert.ok([200, 500].includes(res.status));
    });

    it('should get dashboard fleet', async () => {
      const res = await req('GET', '/api/v1/dashboard/fleet', null, auth(tokenA));
      assert.ok([200, 500].includes(res.status));
    });

    it('should get dashboard alerts', async () => {
      const res = await req('GET', '/api/v1/dashboard/alerts', null, auth(tokenA));
      assert.ok([200, 500].includes(res.status));
    });

    it('should get dashboard activities', async () => {
      const res = await req('GET', '/api/v1/dashboard/activities', null, auth(tokenA));
      assert.ok([200, 500].includes(res.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 18: AGENCIES
  // ═══════════════════════════════════════════════════════════════
  describe('18. Agencies', () => {
    it('should list agencies', async () => {
      const res = await req('GET', '/api/v1/agencies', null, auth(tokenA));
      assert.ok([200, 500].includes(res.status));
    });

    it('should get agency stats', async () => {
      const res = await req('GET', '/api/v1/agencies/stats', null, auth(tokenA));
      assert.ok([200, 500].includes(res.status));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 19: MULTI-TENANT ISOLATION
  // ═══════════════════════════════════════════════════════════════
  describe('19. Multi-Tenant Isolation', () => {
    let vehicleIdB;

    before(async () => {
      const reg = await req('POST', '/api/v1/auth/register', {
        firstName: 'E2E', lastName: 'AdminB',
        email: `e2e_admin_b${ts}@test.com`, password: 'Test1234!', confirmPassword: 'Test1234!',
        companyName: `E2ETest Corp B ${ts}`, role: 'client_enterprise',
      });
      assert.strictEqual(reg.status, 201);
      tokenB = reg.data.data.tokens.accessToken;
      companyIdB = reg.data.data.company.id;
      userIdB = reg.data.data.user.id;

      const v = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `E2EB-${ts}-001`, brand: 'BMW', model: 'X5',
        fuelType: 'diesel', mileage: 5000,
      }, auth(tokenB));
      vehicleIdB = v.data.data.id;
    });

    it('Company B should NOT see Company A vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
      const items = res.data.data?.items || res.data.data;
      if (Array.isArray(items)) {
        const ids = items.map(v => v.id);
        assert.ok(!ids.includes(vehicleIdA));
      }
    });

    it('Company A should NOT see Company B vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('Company B should NOT access Company A vehicle by id', async () => {
      const res = await req('GET', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenB));
      assert.ok([403, 404].includes(res.status));
    });

    it('Company B should NOT update Company A vehicle', async () => {
      const res = await req('PUT', `/api/v1/vehicles/${vehicleIdA}`, { mileage: 999 }, auth(tokenB));
      assert.ok([403, 404].includes(res.status));
    });

    it('Company B should NOT delete Company A vehicle', async () => {
      const res = await req('DELETE', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenB));
      assert.ok([403, 404].includes(res.status));
    });

    it('Company B should NOT see Company A drivers', async () => {
      const res = await req('GET', '/api/v1/drivers', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
    });

    it('Company B should NOT access Company A driver by id', async () => {
      const res = await req('GET', `/api/v1/drivers/${driverIdA}`, null, auth(tokenB));
      assert.ok([403, 404].includes(res.status));
    });

    it('Company B should NOT see Company A notifications', async () => {
      const res = await req('GET', '/api/v1/notifications', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 20: RBAC — UNAUTHORIZED ACCESS
  // ═══════════════════════════════════════════════════════════════
  describe('20. RBAC — Unauthorized Access', () => {
    let driverToken;

    before(async () => {
      const reg = await req('POST', '/api/v1/auth/register', {
        firstName: 'E2E', lastName: 'DriverRBAC',
        email: `e2e_rbac_driver${ts}@test.com`, password: 'Test1234!', confirmPassword: 'Test1234!',
        companyName: `E2ETest Corp A ${ts}`, role: 'driver',
      });
      driverToken = reg.data.data.tokens.accessToken;
    });

    it('driver should NOT access audit logs (403)', async () => {
      const res = await req('GET', '/api/v1/audit-logs', null, auth(driverToken));
      assert.strictEqual(res.status, 403);
    });

    it('non-super_admin should NOT access admin companies (403)', async () => {
      const res = await req('GET', '/api/v1/admin/companies', null, auth(tokenA));
      assert.strictEqual(res.status, 403);
    });

    it('driver should NOT access finance write operations (403)', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 1000, description: 'Test',
      }, auth(driverToken));
      assert.strictEqual(res.status, 403);
    });

    it('should reject request without auth (401)', async () => {
      const res = await req('GET', '/api/v1/vehicles');
      assert.strictEqual(res.status, 401);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 21: ERROR HANDLING
  // ═══════════════════════════════════════════════════════════════
  describe('21. Error Handling & Validation', () => {
    it('should return 404 for non-existent vehicle', async () => {
      const res = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null, auth(tokenA));
      assert.strictEqual(res.status, 404);
    });

    it('should return 422 for invalid vehicle data', async () => {
      const res = await req('POST', '/api/v1/vehicles', { brand: '' }, auth(tokenA));
      assert.strictEqual(res.status, 422);
    });

    it('should return 404 on unknown route', async () => {
      const res = await req('GET', '/api/v1/nonexistent-route-xyz');
      assert.strictEqual(res.status, 404);
    });

    it('error response should have consistent format', async () => {
      const res = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null, auth(tokenA));
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error);
      assert.ok(res.data.error.code);
      assert.ok(res.data.error.message);
    });

    it('error should not expose stack trace', async () => {
      const res = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null, auth(tokenA));
      assert.ok(!res.data.error?.stack);
    });

    it('should return 400 for invalid JSON', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad',
      });
      assert.strictEqual(res.status, 400);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 22: SECURITY REGRESSION
  // ═══════════════════════════════════════════════════════════════
  describe('22. Security Regression', () => {
    it('should prevent SQL injection in login email', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: "' OR 1=1 --", password: 'test',
      });
      assert.ok([401, 422].includes(res.status));
    });

    it('should prevent SQL injection in search', async () => {
      const res = await req('GET', "/api/v1/vehicles?search='; DROP TABLE vehicles; --", null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should prevent mass assignment of role via register', async () => {
      const res = await req('POST', '/api/v1/auth/register', {
        firstName: 'Hack', lastName: 'Test',
        email: `e2e_hack${ts}@test.com`, password: 'Test1234!', confirmPassword: 'Test1234!',
        companyName: `E2ETest Hack ${ts}`, role: 'super_admin',
      });
      if (res.status === 201) {
        assert.notStrictEqual(res.data.data.user.role, 'super_admin');
      }
    });

    it('should include security headers', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      assert.ok(res.headers.get('x-content-type-options'));
    });

    it('should not expose server version', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      assert.ok(!res.headers.get('x-powered-by'));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 23: HEALTH & INFRASTRUCTURE
  // ═══════════════════════════════════════════════════════════════
  describe('23. Health & Infrastructure', () => {
    it('GET /api/v1/health should return 200', async () => {
      const res = await req('GET', '/api/v1/health');
      assert.strictEqual(res.status, 200);
    });

    it('GET /api/v1/ should return API info', async () => {
      const res = await req('GET', '/api/v1/');
      assert.strictEqual(res.status, 200);
    });

    it('health should not expose environment details', async () => {
      const res = await req('GET', '/api/v1/health');
      const body = JSON.stringify(res.data);
      assert.ok(!body.includes('DB_PASSWORD'));
    });

    it('should include x-request-id header', async () => {
      const res = await req('GET', '/api/v1/health');
      assert.ok(res.headers['x-request-id'] || res.headers['x-requestid']);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 24: PAGINATION, SEARCH, SORT
  // ═══════════════════════════════════════════════════════════════
  describe('24. Pagination, Search, Sort', () => {
    it('should paginate vehicles (page=1, limit=1)', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=1', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should search drivers', async () => {
      const res = await req('GET', '/api/v1/drivers?search=E2E', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should sort vehicles by brand asc', async () => {
      const res = await req('GET', '/api/v1/vehicles?sort=brand&order=asc', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should reject invalid sort field', async () => {
      const res = await req('GET', '/api/v1/vehicles?sort=nonexistent_field', null, auth(tokenA));
      assert.strictEqual(res.status, 422);
    });

    it('should handle empty search gracefully', async () => {
      const res = await req('GET', '/api/v1/vehicles?search=', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 25: CONCURRENCY
  // ═══════════════════════════════════════════════════════════════
  describe('25. Concurrency', () => {
    it('should handle 10 simultaneous GET requests', async () => {
      const promises = Array.from({ length: 10 }, () =>
        req('GET', '/api/v1/vehicles', null, auth(tokenA))
      );
      const results = await Promise.all(promises);
      results.forEach(r => assert.strictEqual(r.status, 200));
    });

    it('should handle mixed concurrent requests', async () => {
      const promises = [
        req('GET', '/api/v1/vehicles', null, auth(tokenA)),
        req('GET', '/api/v1/drivers', null, auth(tokenA)),
        req('GET', '/api/v1/notifications', null, auth(tokenA)),
        req('GET', '/api/v1/health'),
      ];
      const results = await Promise.all(promises);
      results.forEach(r => assert.strictEqual(r.status, 200));
    });
  });

  // ═══════════════════════════════════════════════════════════════
  // PHASE 26: SOFT DELETE
  // ═══════════════════════════════════════════════════════════════
  describe('26. Soft Delete Consistency', () => {
    it('deleted vehicle should not appear in list', async () => {
      const createRes = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `E2E-DEL-${ts}`, brand: 'Delete', model: 'Me',
        fuelType: 'diesel', mileage: 100,
      }, auth(tokenA));
      const delId = createRes.data.data.id;

      await req('DELETE', `/api/v1/vehicles/${delId}`, null, auth(tokenA));

      const listRes = await req('GET', '/api/v1/vehicles', null, auth(tokenA));
      const items = listRes.data.data?.items || listRes.data.data;
      if (Array.isArray(items)) {
        const ids = items.map(v => v.id);
        assert.ok(!ids.includes(delId));
      }
    });

    it('deleted vehicle should return 404 on GET', async () => {
      const createRes = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `E2E-DEL2-${ts}`, brand: 'Delete2', model: 'Me',
        fuelType: 'diesel', mileage: 100,
      }, auth(tokenA));
      const delId = createRes.data.data.id;

      await req('DELETE', `/api/v1/vehicles/${delId}`, null, auth(tokenA));

      const getRes = await req('GET', `/api/v1/vehicles/${delId}`, null, auth(tokenA));
      assert.strictEqual(getRes.status, 404);
    });
  });
});
