import { createPool, closePool, getPool } from '../../src/database/index.js';
import { generateAccessToken } from '../../src/services/token.service.js';

export async function setupTestServer(port) {
  const { default: app } = await import('../../src/app.js');
  const server = app.listen(port);
  await new Promise((resolve) => { server.once('listening', resolve); });
  return server;
}

export async function teardownTestServer(server) {
  if (server) {
    await new Promise((resolve) => { server.close(resolve); });
  }
}

export function createReq(baseUrl) {
  return async function req(method, path, body, headers = {}) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', ...headers },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${baseUrl}${path}`, opts);
    const data = await res.json().catch(() => null);
    return { status: res.status, data, headers: Object.fromEntries(res.headers.entries()) };
  };
}

export function auth(token) {
  return { Authorization: `Bearer ${token}` };
}

export async function registerUser(req, ts, suffix = 'util', role = 'client_enterprise') {
  const reg = await req('POST', '/api/v1/auth/register', {
    firstName: 'Test', lastName: 'User',
    email: `test_${suffix}${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
    companyName: `UtilTest Corp ${suffix}`, role,
  });
  return {
    status: reg.status,
    token: reg.data?.data?.tokens?.accessToken,
    refreshToken: reg.data?.data?.tokens?.refreshToken,
    userId: reg.data?.data?.user?.id,
    companyId: reg.data?.data?.company?.id,
  };
}

export async function loginAs(req, email, password) {
  const res = await req('POST', '/api/v1/auth/login', { email, password });
  return {
    status: res.status,
    token: res.data?.data?.tokens?.accessToken,
    refreshToken: res.data?.data?.tokens?.refreshToken,
    userId: res.data?.data?.user?.id,
  };
}

export async function getSuperAdminToken(pool) {
  const [rows] = await pool.execute('SELECT id FROM users WHERE role = ? LIMIT 1', ['super_admin']);
  if (rows.length > 0) {
    return generateAccessToken({ sub: rows[0].id, role: 'super_admin', type: 'access' });
  }
  return null;
}

export async function cleanTestData(pool, patterns) {
  for (const [table, column, pattern] of patterns) {
    try {
      await pool.query(`DELETE FROM ${table} WHERE ${column} LIKE ?`, [pattern]);
    } catch (_e) { /* table may not exist */ }
  }
}

export async function createVehicle(req, token, overrides = {}) {
  const ts = Date.now();
  const res = await req('POST', '/api/v1/vehicles', {
    registrationNumber: `QA_VEH_${ts}_${Math.random().toString(36).slice(2, 6)}`,
    brand: 'Toyota', model: 'Corolla', year: 2023, fuelType: 'diesel',
    transmission: 'automatique', groupCode: 'B', capacity: 5, mileage: 0,
    ...overrides,
  }, auth(token));
  return { status: res.status, data: res.data?.data, id: res.data?.data?.id };
}

export async function createDriver(req, token, overrides = {}) {
  const ts = Date.now();
  const suffix = Math.random().toString(36).slice(2, 6);
  const res = await req('POST', '/api/v1/drivers', {
    firstName: 'Chauffeur', lastName: 'Test',
    employeeCode: `DRV_QA_${ts}_${suffix}`,
    phone: '+237690000000',
    ...overrides,
  }, auth(token));
  return { status: res.status, data: res.data?.data, id: res.data?.data?.id };
}

export const ULIDS = {
  VALID: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
  INVALID_FORMAT: 'not-a-ulid-at-all!!',
  ZEROS: '00000000000000000000000000',
  ALL_Z: 'ZZZZZZZZZZZZZZZZZZZZZZZZZZ',
  SHORT: '01ARZ3ND',
  LONG: '01ARZ3NDEKTSV4RRFFQ69G5FAVEXTRA',
  SQL: "'; DROP TABLE users; --",
  XSS: '<script>alert("xss")</script>',
  UNICODE: 'これは無効なULIDです',
  EMPTY: '',
  NULL_VALUE: null,
};
