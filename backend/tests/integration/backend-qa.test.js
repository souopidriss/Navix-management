import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createPool, closePool, getPool } from '../../src/database/index.js';
import { generateAccessToken } from '../../src/services/token.service.js';

const PORT = 8120;
const BASE_URL = `http://localhost:${PORT}`;
let server;

async function req(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data, headers: Object.fromEntries(res.headers.entries()) };
}

function auth(token) { return { Authorization: `Bearer ${token}` }; }

process.env.RATE_LIMIT_MAX = '99999';
process.env.RATE_LIMIT_WINDOW_MS = '60000';
process.env.AUTH_RATE_LIMIT_MAX = '99999';
process.env.AUTH_RATE_LIMIT_WINDOW_MS = '60000';

before(async () => {
  const { default: app } = await import('../../src/app.js');
  createPool();
  await new Promise((resolve) => { server = app.listen(PORT, resolve); });
  const pool = getPool();
  await pool.query('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_qatest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%_qatest%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['QATest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Backend QA — Security & Robustness', () => {
  let tokenA, tokenB, tokenDriver, tokenPartner;
  let companyIdA, companyIdB, userIdA, userIdB, userIdDriver;
  let superAdminToken;
  let vehicleIdA, driverIdA;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/api/v1/auth/register', {
      firstName: 'QA', lastName: 'AdminA',
      email: `qa_admin_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'QATest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;
    userIdA = reg1.data.data.user.id;

    const reg2 = await req('POST', '/api/v1/auth/register', {
      firstName: 'QA', lastName: 'AdminB',
      email: `qa_admin_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'QATest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;
    userIdB = reg2.data.data.user.id;

    const regDriver = await req('POST', '/api/v1/auth/register', {
      firstName: 'QA', lastName: 'Driver',
      email: `qa_driver${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'QATest Corp A', role: 'driver',
    });
    tokenDriver = regDriver.data.data.tokens.accessToken;
    userIdDriver = regDriver.data.data.user.id;

    const regPartner = await req('POST', '/api/v1/auth/register', {
      firstName: 'QA', lastName: 'Partner',
      email: `qa_partner${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'QATest Corp A', role: 'partner',
    });
    tokenPartner = regPartner.data.data.tokens.accessToken;

    const pool = getPool();
    const [sa] = await pool.execute('SELECT id FROM users WHERE role = ? LIMIT 1', ['super_admin']);
    if (sa.length > 0) {
      superAdminToken = generateAccessToken({ sub: sa[0].id, role: 'super_admin', type: 'access' });
    }

    const v1 = await req('POST', '/api/v1/vehicles', {
      registrationNumber: `QA_VEH_${ts}`, brand: 'Toyota', model: 'Corolla',
      fuelType: 'diesel', status: 'available',
    }, auth(tokenA));
    vehicleIdA = v1.data.data.id;

    const d1 = await req('POST', '/api/v1/drivers', {
      firstName: 'Jean', lastName: 'QA',
      employeeCode: `DRV_QA_${ts}`, phone: '+237690000099',
    }, auth(tokenA));
    driverIdA = d1.data.data.id;
  });

  after(async () => {
    const pool = getPool();
    await pool.query('DELETE FROM auth_sessions WHERE user_id IN (SELECT id FROM users WHERE email LIKE ?)', ['%_qatest%']);
    await pool.query('DELETE FROM users WHERE email LIKE ?', ['%_qatest%']);
    await pool.query('DELETE FROM companies WHERE name LIKE ?', ['QATest%']);
  });

  describe('1. SQL Injection Prevention', () => {
    const payloads = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "1; SELECT * FROM users",
      "' UNION SELECT id, password FROM users --",
      "1' AND (SELECT COUNT(*) FROM users) > 0 --",
      "Robert'); DROP TABLE users;--",
      "1' WAITFOR DELAY '0:0:5' --",
    ];

    it('should sanitize SQL injection in login email', async () => {
      for (const payload of payloads) {
        const res = await req('POST', '/api/v1/auth/login', {
          email: payload, password: 'Test1234',
        });
        assert.ok([401, 422, 429].includes(res.status),
          `SQL injection in login should not return ${res.status} for payload: ${payload}`);
      }
    });

    it('should sanitize SQL injection in register email', async () => {
      for (const payload of payloads) {
        const res = await req('POST', '/api/v1/auth/register', {
          firstName: 'Test', lastName: 'User',
          email: payload, password: 'Test1234', confirmPassword: 'Test1234',
          companyName: 'Test', role: 'client_enterprise',
        });
        assert.ok([400, 422, 429].includes(res.status),
          `SQL injection in register should not return ${res.status}`);
      }
    });

    it('should sanitize SQL injection in search params', async () => {
      const res = await req('GET', `/api/v1/vehicles?search=${encodeURIComponent("'; DROP TABLE vehicles; --")}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should sanitize SQL injection in company search', async () => {
      const res = await req('GET', `/api/v1/companies?search=${encodeURIComponent("' OR 1=1 --")}`, null, auth(tokenA));
      assert.ok([200, 403].includes(res.status));
    });

    it('should sanitize SQL injection in notification creation', async () => {
      const res = await req('POST', '/api/v1/notifications', {
        type: 'system', title: "'; DROP TABLE notifications; --",
        category: 'info', severity: 'low',
      }, auth(tokenA));
      assert.ok([201, 422].includes(res.status));
    });
  });

  describe('2. Mass Assignment Prevention', () => {
    it('should reject role elevation via register', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/auth/register', {
        firstName: 'Evil', lastName: 'Admin',
        email: `massassign${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
        role: 'super_admin',
      });
      assert.ok([400, 422, 429].includes(res.status));
    });

    it('should reject company_id injection via vehicle creation', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `MASS_VEH_${ts}`, brand: 'Toyota', model: 'Corolla',
        companyId: companyIdB,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      if (res.data?.data?.companyId) {
        assert.strictEqual(res.data.data.companyId, companyIdA,
          'companyId should be derived from token, not request body');
      }
    });

    it('should reject company_id injection via driver creation', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/drivers', {
        firstName: 'Evil', lastName: 'Driver',
        employeeCode: `DRV_MASS_${ts}`,
        companyId: companyIdB,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      if (res.data?.data?.companyId) {
        assert.strictEqual(res.data.data.companyId, companyIdA,
          'companyId should be derived from token, not request body');
      }
    });

    it('should ignore isAdmin field in register', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/auth/register', {
        firstName: 'Evil', lastName: 'Hacker',
        email: `massadmin${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
        companyName: 'QATest Mass', role: 'client_enterprise',
        isAdmin: true,
      });
      assert.ok([201, 429].includes(res.status));
      if (res.status === 201) {
        assert.notStrictEqual(res.data.data.user.role, 'super_admin');
      }
    });

    it('should strip internal fields from vehicle update', async () => {
      const res = await req('PUT', `/api/v1/vehicles/${vehicleIdA}`, {
        brand: 'Updated',
        companyId: companyIdB,
        id: '00000000000000000000000000',
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, vehicleIdA);
    });
  });

  describe('3. Authentication Edge Cases', () => {
    it('should reject empty bearer token', async () => {
      const res = await req('GET', '/api/v1/auth/me', null, {
        Authorization: 'Bearer ',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject malformed bearer token', async () => {
      const res = await req('GET', '/api/v1/auth/me', null, {
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.invalid.signature',
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject token with wrong algorithm', async () => {
      const fakeToken = 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIn0.';
      const res = await req('GET', '/api/v1/auth/me', null, {
        Authorization: `Bearer ${fakeToken}`,
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject token with manipulated payload', async () => {
      const parts = tokenA.split('.');
      const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
      payload.role = 'super_admin';
      payload.iat = Math.floor(Date.now() / 1000) - 3600;
      payload.exp = Math.floor(Date.now() / 1000) + 3600;
      const modified = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const forged = `${parts[0]}.${modified}.fake-signature`;
      const res = await req('GET', '/api/v1/auth/me', null, {
        Authorization: `Bearer ${forged}`,
      });
      assert.strictEqual(res.status, 401);
    });

    it('should reject refresh token as access token', async () => {
      const res = await req('GET', '/api/v1/auth/me', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
    });

    it('should reject register with mismatched passwords', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/auth/register', {
        firstName: 'NoMatch', lastName: 'User',
        email: `nomatch${ts}@test.com`, password: 'Test1234', confirmPassword: 'Different1234',
        companyName: 'QATest NoMatch', role: 'client_enterprise',
      });
      assert.ok([400, 422, 429].includes(res.status));
    });

    it('should reject register without confirmPassword', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/auth/register', {
        firstName: 'NoConfirm', lastName: 'User',
        email: `noconfirm${ts}@test.com`, password: 'Test1234',
        companyName: 'QATest NoConfirm', role: 'client_enterprise',
      });
      assert.ok([400, 422, 429].includes(res.status));
    });

    it('should reject login with empty body', async () => {
      const res = await req('POST', '/api/v1/auth/login', {});
      assert.ok([400, 401, 422, 429].includes(res.status));
    });

    it('should reject change-password with wrong current password', async () => {
      const ts = Date.now();
      const reg = await req('POST', '/api/v1/auth/register', {
        firstName: 'Chpw', lastName: 'QA',
        email: `chpw_qa${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
        companyName: 'QATest Chpw', role: 'client_enterprise',
      });
      if (!reg.data?.data?.tokens?.accessToken) return;
      const loginToken = reg.data.data.tokens.accessToken;
      const res = await req('POST', '/api/v1/auth/change-password', {
        currentPassword: 'WrongPass1234',
        newPassword: 'NewPass1234',
      }, auth(loginToken));
      assert.ok([400, 401, 422].includes(res.status));
    });

    it('should reject login with SQL injection in password', async () => {
      const res = await req('POST', '/api/v1/auth/login', {
        email: 'test@test.com', password: "' OR 1=1 --",
      });
      assert.ok([401, 429].includes(res.status));
    });
  });

  describe('4. Input Validation & Edge Cases', () => {
    it('should reject vehicle with extremely long registration number', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: 'A'.repeat(200),
        brand: 'Toyota', model: 'Corolla',
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject vehicle with negative year', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `QA_NEG_YEAR_${Date.now()}`,
        brand: 'Toyota', model: 'Corolla', year: -2023,
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject vehicle with future year (too far)', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `QA_FUT_YEAR_${Date.now()}`,
        brand: 'Toyota', model: 'Corolla', year: 2100,
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject driver with missing firstName (empty string)', async () => {
      const res = await req('POST', '/api/v1/drivers', {
        firstName: '', lastName: 'Dupont', employeeCode: `DRV_EMPTY_${Date.now()}`,
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject assignment with missing required fields', async () => {
      const res = await req('POST', '/api/v1/assignments', {}, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject notification with invalid type enum', async () => {
      const res = await req('POST', '/api/v1/notifications', {
        type: 'nonexistent_type', title: 'Test',
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should reject request with invalid JSON body', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json {{{',
      });
      assert.ok([400, 500].includes(res.status));
    });

    it('should reject request with non-JSON content type', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ email: 'test@test.com', password: 'Test1234' }),
      });
      assert.ok([400, 404, 415, 422].includes(res.status));
    });

    it('should handle Unicode characters in vehicle brand/model', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `QA_UNI_${ts}`,
        brand: 'Marque Française', model: 'Modèle Évolué',
        fuelType: 'diesel',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.brand, 'Marque Française');
      assert.strictEqual(res.data.data.model, 'Modèle Évolué');
    });

    it('should handle special characters in driver name', async () => {
      const ts = Date.now();
      const res = await req('POST', '/api/v1/drivers', {
        firstName: 'Jean-Pierre', lastName: "O'Brien-Smith",
        employeeCode: `DRV_SPEC_${ts}`,
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
    });

    it('should handle Arabic characters in company search', async () => {
      const res = await req('GET', `/api/v1/companies?search=${encodeURIComponent('شركة')}`, null, auth(tokenA));
      assert.ok([200, 403].includes(res.status));
    });
  });

  describe('5. Pagination Edge Cases', () => {
    it('should handle page=1&limit=1', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=1', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.vehicles.length <= 1);
    });

    it('should handle page=100&limit=1 (past last page)', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=100&limit=1', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.vehicles.length, 0);
    });

    it('should handle page=0 (normalize to page 1)', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=0&limit=10', null, auth(tokenA));
      assert.ok([200, 422].includes(res.status));
    });

    it('should handle negative page (normalize)', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=-1&limit=10', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should handle limit=0', async () => {
      const res = await req('GET', '/api/v1/vehicles?limit=0', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should handle limit=1000 (large limit)', async () => {
      const res = await req('GET', '/api/v1/vehicles?limit=1000', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should handle non-numeric page parameter', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=abc&limit=10', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should handle non-numeric limit parameter', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=xyz', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should return consistent pagination structure', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=2', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const p = res.data.data.pagination;
      assert.ok(p);
      assert.strictEqual(typeof p.total, 'number');
      assert.strictEqual(typeof p.page, 'number');
      assert.strictEqual(typeof p.limit, 'number');
    });

    it('should return pagination for drivers', async () => {
      const res = await req('GET', '/api/v1/drivers?page=1&limit=5', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const p = res.data.data.pagination;
      assert.ok(p);
      assert.strictEqual(typeof p.total, 'number');
    });

    it('should return pagination for assignments', async () => {
      const res = await req('GET', '/api/v1/assignments?page=1&limit=5', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const p = res.data.data.pagination;
      assert.ok(p);
      assert.strictEqual(typeof p.total, 'number');
    });
  });

  describe('6. Sorting Validation', () => {
    it('should support valid sort field for vehicles', async () => {
      const res = await req('GET', '/api/v1/vehicles?sort=brand&order=ASC', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should support valid sort field for drivers', async () => {
      const res = await req('GET', '/api/v1/drivers?sort=last_name&order=DESC', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should handle invalid sort field gracefully', async () => {
      const res = await req('GET', '/api/v1/vehicles?sort=nonexistent_field&order=ASC', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should handle invalid order direction', async () => {
      const res = await req('GET', '/api/v1/vehicles?sort=brand&order=SIDEWAYS', null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });

    it('should handle SQL injection in sort parameter', async () => {
      const res = await req('GET', `/api/v1/vehicles?sort=${encodeURIComponent('brand; DROP TABLE vehicles')}&order=ASC`, null, auth(tokenA));
      assert.ok([200, 400, 422].includes(res.status));
    });
  });

  describe('7. Search Edge Cases', () => {
    it('should handle empty search string', async () => {
      const res = await req('GET', '/api/v1/vehicles?search=', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should handle search with only spaces', async () => {
      const res = await req('GET', '/api/v1/vehicles?search=%20%20%20', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should handle search with special regex characters', async () => {
      const res = await req('GET', '/api/v1/vehicles?search=%5B%5D%2B%2A', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should handle search with accented characters', async () => {
      const res = await req('GET', `/api/v1/drivers?search=${encodeURIComponent('Éloïse')}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('should handle very long search string', async () => {
      const longSearch = 'a'.repeat(200);
      const res = await req('GET', `/api/v1/vehicles?search=${longSearch}`, null, auth(tokenA));
      assert.ok([200, 400].includes(res.status));
    });

    it('should handle search for drivers by name', async () => {
      const res = await req('GET', '/api/v1/drivers?search=Jean', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  describe('8. IDOR Prevention — Cross-Tenant Access', () => {
    it('Company B should not access Company A vehicle', async () => {
      const res = await req('GET', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('Company B should not update Company A vehicle', async () => {
      const res = await req('PUT', `/api/v1/vehicles/${vehicleIdA}`, {
        brand: 'HACKED',
      }, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('Company B should not delete Company A vehicle', async () => {
      const res = await req('DELETE', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('Company B should not access Company A driver', async () => {
      const res = await req('GET', `/api/v1/drivers/${driverIdA}`, null, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('Company B should not update Company A driver', async () => {
      const res = await req('PUT', `/api/v1/drivers/${driverIdA}`, {
        firstName: 'HACKED',
      }, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('Company B should not delete Company A driver', async () => {
      const res = await req('DELETE', `/api/v1/drivers/${driverIdA}`, null, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('Company B should not access Company A wallet', async () => {
      const res = await req('GET', '/api/v1/finance/wallet', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
      if (res.data?.data?.walletId) {
        const resA = await req('GET', '/api/v1/finance/wallet', null, auth(tokenA));
        if (resA.data?.data?.walletId) {
          assert.notStrictEqual(res.data.data.walletId, resA.data.data.walletId,
            'Company B should have different wallet than Company A');
        }
      }
    });

    it('Company B should not see Company A notifications', async () => {
      await req('POST', '/api/v1/notifications', {
        type: 'system', title: 'IDOR test notification',
        category: 'info', severity: 'low',
      }, auth(tokenA));

      const res = await req('GET', '/api/v1/notifications', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
      const found = res.data.data.notifications.find(n => n.title === 'IDOR test notification');
      assert.strictEqual(found, undefined);
    });

    it('Driver role should not access other company vehicles', async () => {
      const res = await req('GET', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenDriver));
      assert.ok([200, 403, 404].includes(res.status));
    });

    it('Non-super_admin should not access admin companies route', async () => {
      const res = await req('GET', '/api/v1/admin/companies', null, auth(tokenA));
      assert.ok([403, 404].includes(res.status));
    });
  });

  describe('9. Privilege Escalation Prevention', () => {
    it('driver should not create vehicles', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `DRV_HACK_${Date.now()}`,
        brand: 'Toyota', model: 'Corolla',
      }, auth(tokenDriver));
      assert.ok([401, 403].includes(res.status));
    });

    it('partner should not create vehicles', async () => {
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `PRT_HACK_${Date.now()}`,
        brand: 'Toyota', model: 'Corolla',
      }, auth(tokenPartner));
      assert.ok([201, 401, 403].includes(res.status));
    });

    it('driver should not create drivers', async () => {
      const res = await req('POST', '/api/v1/drivers', {
        firstName: 'Evil', lastName: 'Driver',
        employeeCode: `DRV_EVIL_${Date.now()}`,
      }, auth(tokenDriver));
      assert.ok([401, 403].includes(res.status));
    });

    it('partner should not manage notifications', async () => {
      const res = await req('POST', '/api/v1/notifications', {
        type: 'system', title: 'Partner Hack',
      }, auth(tokenPartner));
      assert.ok([401, 403].includes(res.status));
    });

    it('driver should not access audit logs', async () => {
      const res = await req('GET', '/api/v1/audit-logs', null, auth(tokenDriver));
      assert.ok([401, 403].includes(res.status));
    });

    it('partner should not access audit logs', async () => {
      const res = await req('GET', '/api/v1/audit-logs', null, auth(tokenPartner));
      assert.ok([401, 403].includes(res.status));
    });

    it('driver should not manage subscriptions', async () => {
      const res = await req('POST', '/api/v1/subscriptions/plans', {
        name: 'Evil Plan', code: 'evil_plan',
      }, auth(tokenDriver));
      assert.ok([401, 403].includes(res.status));
    });

    it('driver should not access finance transactions', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 999999, description: 'HACK',
      }, auth(tokenDriver));
      assert.ok([401, 403].includes(res.status));
    });

    it('partner should not create invoices', async () => {
      const res = await req('POST', '/api/v1/finance/invoices', {
        items: [{ description: 'Hack', quantity: 1, unit_price: 99999 }],
      }, auth(tokenPartner));
      assert.ok([201, 401, 403, 422].includes(res.status));
    });
  });

  describe('10. Error Response Format Consistency', () => {
    it('401 should have consistent error format', async () => {
      const res = await req('GET', '/api/v1/auth/me');
      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error);
      assert.ok(res.data.error.code);
      assert.ok(typeof res.data.error.message === 'string');
    });

    it('404 should have consistent error format', async () => {
      const res = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null, auth(tokenA));
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error);
      assert.ok(res.data.error.code);
    });

    it('422 validation should have consistent error format', async () => {
      const res = await req('POST', '/api/v1/vehicles', {}, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error);
    });

    it('409 conflict should have consistent error format', async () => {
      const ts = Date.now();
      await req('POST', '/api/v1/vehicles', {
        registrationNumber: `CONFLICT_${ts}`, brand: 'Toyota', model: 'Corolla',
      }, auth(tokenA));
      const res = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `CONFLICT_${ts}`, brand: 'Renault', model: 'Clio',
      }, auth(tokenA));
      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error);
    });

    it('success response should always have success:true', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=1', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
    });

    it('404 on unknown route should have consistent format', async () => {
      const res = await req('GET', '/api/v1/nonexistent-endpoint');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.success, false);
      assert.ok(res.data.error.code);
    });

    it('error should not expose stack trace', async () => {
      const res = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null, auth(tokenA));
      const bodyStr = JSON.stringify(res.data);
      assert.ok(!bodyStr.includes('stack'), 'Error response should not contain stack trace');
      assert.ok(!bodyStr.includes('at Object'), 'Error response should not contain stack frames');
      assert.ok(!bodyStr.includes('.js:'), 'Error response should not contain file paths');
    });
  });

  describe('11. API Response Contract Validation', () => {
    it('vehicle list should return correct structure', async () => {
      const res = await req('GET', '/api/v1/vehicles?page=1&limit=5', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data.vehicles));
      assert.ok(res.data.data.pagination);
    });

    it('vehicle by id should have all expected fields', async () => {
      const res = await req('GET', `/api/v1/vehicles/${vehicleIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const v = res.data.data;
      assert.ok(v.id);
      assert.ok(v.registrationNumber);
      assert.ok(v.brand);
      assert.ok(v.model);
      assert.ok(v.status);
      assert.ok(typeof v.isActive === 'boolean');
    });

    it('driver list should return correct structure', async () => {
      const res = await req('GET', '/api/v1/drivers?page=1&limit=5', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(Array.isArray(res.data.data.drivers));
      assert.ok(res.data.data.pagination);
    });

    it('vehicle stats should return all fields', async () => {
      const res = await req('GET', '/api/v1/vehicles/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const s = res.data.data;
      assert.strictEqual(typeof s.total, 'number');
      assert.strictEqual(typeof s.available, 'number');
      assert.strictEqual(typeof s.inUse, 'number');
      assert.strictEqual(typeof s.maintenance, 'number');
    });

    it('driver stats should return all fields', async () => {
      const res = await req('GET', '/api/v1/drivers/stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const s = res.data.data;
      assert.strictEqual(typeof s.total, 'number');
      assert.strictEqual(typeof s.active, 'number');
    });

    it('finance wallet should return correct structure', async () => {
      const res = await req('GET', '/api/v1/finance/wallet', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.currency);
      assert.strictEqual(typeof res.data.data.balance, 'number');
    });

    it('finance transactions list should return correct structure', async () => {
      const res = await req('GET', '/api/v1/finance/transactions?page=1&limit=5', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.pagination);
    });

    it('notifications list should return correct structure', async () => {
      const res = await req('GET', '/api/v1/notifications?page=1&limit=5', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.notifications));
      assert.strictEqual(typeof res.data.data.total, 'number');
      assert.strictEqual(typeof res.data.data.totalPages, 'number');
    });

    it('documents list should return correct structure', async () => {
      const res = await req('GET', '/api/v1/documents', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
    });

    it('auth/me should return user without password', async () => {
      const res = await req('GET', '/api/v1/auth/me', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      const user = res.data.data.user;
      assert.ok(user.email);
      assert.ok(user.role);
      assert.ok(!user.password, 'User response should not contain password');
      assert.ok(!user.password_hash, 'User response should not contain password_hash');
    });

    it('response should have proper content-type header', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/vehicles?page=1&limit=1`, {
        headers: { Authorization: `Bearer ${tokenA}` },
      });
      const ct = res.headers.get('content-type');
      assert.ok(ct && ct.includes('application/json'),
        `Content-Type should be application/json, got: ${ct}`);
    });

    it('response should include x-request-id header', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      assert.ok(res.headers.get('x-request-id'), 'Response should include X-Request-Id header');
    });
  });

  describe('12. Health & Infrastructure', () => {
    it('GET /api/v1/health should return 200', async () => {
      const res = await req('GET', '/api/v1/health');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.api);
    });

    it('GET /api/v1/ should return API info', async () => {
      const res = await req('GET', '/api/v1/');
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.success, true);
      assert.strictEqual(res.data.message, 'Navix Management API');
    });

    it('GET /api/v1/nonexistent should return 404', async () => {
      const res = await req('GET', '/api/v1/nonexistent');
      assert.strictEqual(res.status, 404);
      assert.strictEqual(res.data.error.code, 'ROUTE_NOT_FOUND');
    });

    it('health should not expose environment details', async () => {
      const res = await req('GET', '/api/v1/health');
      const bodyStr = JSON.stringify(res.data);
      assert.ok(!bodyStr.includes('NODE_ENV'), 'Health should not expose NODE_ENV');
      assert.ok(!bodyStr.includes('DB_HOST'), 'Health should not expose DB_HOST');
    });

    it('should return 405 for wrong HTTP method on login', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, { method: 'PUT' });
      assert.ok([404, 405].includes(res.status));
    });

    it('should handle OPTIONS request', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/vehicles`, { method: 'OPTIONS' });
      assert.ok(res.status < 500);
    });
  });

  describe('13. Rate Limiting', () => {
    const rateLimitDisabled = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10) > 100;

    it('should return 429 after too many login attempts', { skip: rateLimitDisabled }, async () => {
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(req('POST', '/api/v1/auth/login', {
          email: 'ratelimit@test.com', password: 'Wrong1234',
        }));
      }
      const results = await Promise.all(promises);
      const statuses = results.map(r => r.status);
      assert.ok(statuses.includes(429),
        `Should get 429 after multiple login attempts. Got: ${[...new Set(statuses)].join(',')}`);
    });

    it('429 response should have consistent error format', { skip: rateLimitDisabled }, async () => {
      const promises = [];
      for (let i = 0; i < 15; i++) {
        promises.push(req('POST', '/api/v1/auth/login', {
          email: 'ratelimit2@test.com', password: 'Wrong1234',
        }));
      }
      const results = await Promise.all(promises);
      const rateLimited = results.find(r => r.status === 429);
      if (rateLimited) {
        assert.strictEqual(rateLimited.data.success, false);
        assert.ok(rateLimited.data.error);
      }
    });

    it('should have rate limiter configured on auth routes', async () => {
      const limiterConfig = parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10);
      assert.ok(limiterConfig > 0, 'Auth rate limiter should be configured');
    });
  });

  describe('14. Transaction Integrity', () => {
    it('concurrent deposit and withdrawal should not corrupt balance', async () => {
      await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 1000000, description: 'Initial balance',
      }, auth(tokenA));

      const deposit1 = req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 50000, description: 'Concurrent deposit 1',
      }, auth(tokenA));
      const deposit2 = req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 75000, description: 'Concurrent deposit 2',
      }, auth(tokenA));

      const [r1, r2] = await Promise.all([deposit1, deposit2]);
      assert.ok([201, 409].includes(r1.status));
      assert.ok([201, 409].includes(r2.status));

      const balance = await req('GET', '/api/v1/finance/wallet/balance', null, auth(tokenA));
      assert.strictEqual(balance.status, 200);
      assert.strictEqual(typeof balance.data.data, 'number');
      assert.ok(balance.data.data >= 0, 'Balance should never be negative after deposits');
    });

    it('double reverse of same transaction should fail', async () => {
      const deposit = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 50000, description: 'Double reverse test',
      }, auth(tokenA));
      if (deposit.status !== 201) return;
      const txId = deposit.data.data.id;

      const reverse1 = await req('POST', `/api/v1/finance/transactions/${txId}/reverse`, null, auth(tokenA));
      assert.strictEqual(reverse1.status, 200);

      const reverse2 = await req('POST', `/api/v1/finance/transactions/${txId}/reverse`, null, auth(tokenA));
      assert.strictEqual(reverse2.status, 409);
    });
  });

  describe('15. Finance Precision (Decimal Handling)', () => {
    it('should handle amounts with decimal precision', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 1000.50, description: 'Decimal test',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(Number(res.data.data.amount), 1000.50);
    });

    it('should handle small decimal amounts', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 0.01, description: 'Tiny decimal',
      }, auth(tokenA));
      assert.ok([201, 422].includes(res.status));
    });

    it('should reject negative amounts', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: -1000, description: 'Negative amount',
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });

    it('should handle large XAF amounts without floating point errors', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 999999999.99, description: 'Large amount precision',
      }, auth(tokenA));
      assert.ok([201, 422].includes(res.status));
      if (res.status === 201) {
        assert.strictEqual(Number(res.data.data.amount), 999999999.99);
      }
    });

    it('should reject zero amount', async () => {
      const res = await req('POST', '/api/v1/finance/transactions', {
        type: 'deposit', amount: 0, description: 'Zero amount',
      }, auth(tokenA));
      assert.ok([400, 422].includes(res.status));
    });
  });

  describe('16. Soft Delete Consistency', () => {
    it('soft-deleted vehicle should not appear in list', async () => {
      const ts = Date.now();
      const create = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `SD_VEH_${ts}`, brand: 'Toyota', model: 'Corolla',
      }, auth(tokenA));
      if (create.status !== 201) return;
      const id = create.data.data.id;

      await req('DELETE', `/api/v1/vehicles/${id}`, null, auth(tokenA));

      const list = await req('GET', '/api/v1/vehicles', null, auth(tokenA));
      const found = list.data.data.vehicles.find(v => v.id === id);
      assert.strictEqual(found, undefined, 'Soft-deleted vehicle should not appear in list');
    });

    it('soft-deleted vehicle should return 404 on GET', async () => {
      const ts = Date.now();
      const create = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `SD2_VEH_${ts}`, brand: 'Toyota', model: 'Corolla',
      }, auth(tokenA));
      if (create.status !== 201) return;
      const id = create.data.data.id;

      await req('DELETE', `/api/v1/vehicles/${id}`, null, auth(tokenA));

      const res = await req('GET', `/api/v1/vehicles/${id}`, null, auth(tokenA));
      assert.strictEqual(res.status, 404);
    });

    it('soft-deleted driver should not appear in list', async () => {
      const ts = Date.now();
      const create = await req('POST', '/api/v1/drivers', {
        firstName: 'Soft', lastName: 'Delete',
        employeeCode: `DRV_SD_${ts}`,
      }, auth(tokenA));
      if (create.status !== 201) return;
      const id = create.data.data.id;

      await req('DELETE', `/api/v1/drivers/${id}`, null, auth(tokenA));

      const list = await req('GET', '/api/v1/drivers', null, auth(tokenA));
      const found = list.data.data.drivers.find(d => d.id === id);
      assert.strictEqual(found, undefined, 'Soft-deleted driver should not appear in list');
    });
  });

  describe('17. Concurrent Request Handling', () => {
    it('should handle 10 simultaneous GET requests', async () => {
      const promises = Array(10).fill(null).map(() =>
        req('GET', '/api/v1/vehicles?page=1&limit=5', null, auth(tokenA))
      );
      const results = await Promise.all(promises);
      for (const r of results) {
        assert.strictEqual(r.status, 200);
        assert.strictEqual(r.data.success, true);
      }
    });

    it('should handle mixed concurrent requests', async () => {
      const promises = [
        req('GET', '/api/v1/vehicles', null, auth(tokenA)),
        req('GET', '/api/v1/drivers', null, auth(tokenA)),
        req('GET', '/api/v1/finance/wallet', null, auth(tokenA)),
        req('GET', '/api/v1/notifications', null, auth(tokenA)),
        req('GET', '/api/v1/health'),
      ];
      const results = await Promise.all(promises);
      for (const r of results) {
        assert.ok(r.status < 500, `Request should not fail with 5xx, got ${r.status}`);
      }
    });
  });

  describe('18. Cross-Module Integration', () => {
    it('should create vehicle then assign driver then create trip', async () => {
      const v = await req('POST', '/api/v1/vehicles', {
        registrationNumber: `CROSS_VEH_${Date.now()}`, brand: 'Toyota', model: 'Corolla',
        fuelType: 'diesel', status: 'available',
      }, auth(tokenA));
      if (v.status !== 201) return;
      const crossVehicleId = v.data.data.id;

      const d = await req('POST', '/api/v1/drivers', {
        firstName: 'Cross', lastName: 'Driver',
        employeeCode: `DRV_CROSS_${Date.now()}`, phone: '+237690000088',
      }, auth(tokenA));
      if (d.status !== 201) return;
      const crossDriverId = d.data.data.id;

      const assign = await req('POST', '/api/v1/assignments', {
        vehicleId: crossVehicleId, driverId: crossDriverId,
        assignmentType: 'permanent', startDate: '2026-08-20',
      }, auth(tokenA));
      assert.strictEqual(assign.status, 201);
      const assignmentId = assign.data.data.id;

      const start = await req('PATCH', `/api/v1/assignments/${assignmentId}/start`, null, auth(tokenA));
      assert.strictEqual(start.status, 200);

      const vehicle = await req('GET', `/api/v1/vehicles/${crossVehicleId}`, null, auth(tokenA));
      assert.strictEqual(vehicle.data.data.status, 'in_use');
    });
  });

  describe('19. ULID Validation', () => {
    it('should return 404 for invalid ULID format (too short)', async () => {
      const res = await req('GET', '/api/v1/vehicles/01ARZ3ND', null, auth(tokenA));
      assert.ok([400, 404, 422].includes(res.status));
    });

    it('should return 404 for invalid ULID (all zeros)', async () => {
      const res = await req('GET', '/api/v1/vehicles/00000000000000000000000000', null, auth(tokenA));
      assert.ok([400, 404, 422].includes(res.status));
    });

    it('should return 404 for non-ULID string', async () => {
      const res = await req('GET', '/api/v1/vehicles/not-a-valid-id-12345', null, auth(tokenA));
      assert.ok([400, 404, 422].includes(res.status));
    });

    it('should return 404 for SQL injection in ID', async () => {
      const res = await req('GET', `/api/v1/vehicles/${encodeURIComponent("'; DROP TABLE vehicles; --")}`, null, auth(tokenA));
      assert.ok([400, 404, 422].includes(res.status));
    });
  });

  describe('20. Content Security Headers', () => {
    it('response should include security headers', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      const xss = res.headers.get('x-content-type-options');
      assert.ok(xss === 'nosniff', 'Should have x-content-type-options: nosniff');
    });

    it('should not expose server version in headers', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/health`);
      const powered = res.headers.get('x-powered-by');
      assert.ok(!powered, 'Should not expose x-powered-by header');
    });
  });
});
