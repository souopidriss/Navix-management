import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';
import { generateId } from '../../src/utils/id.js';

const PORT = 8110;
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
  await pool.query('DELETE FROM subscriptions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['SubIntTest%']);
  await pool.query('DELETE FROM subscription_plans WHERE code LIKE ?', ['test_%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['SubIntTest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%sub_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Subscription Integration', () => {
  let tokenA, tokenB, companyIdA, companyIdB, planIdA, planIdB, subscriptionId;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Sub', lastName: 'AdminA',
      email: `sub_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'SubIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Sub', lastName: 'AdminB',
      email: `sub_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'SubIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;

    const pool = getPool();

    planIdA = generateId();
    await pool.query(
      `INSERT INTO subscription_plans (id, name, code, display_name, description, price_monthly, price_yearly, currency, max_vehicles, max_drivers, max_users, max_agencies, max_documents, max_storage_gb, max_trips_per_month, max_fuel_records_per_month, max_maintenance_records_per_month, features, trial_days, is_popular, is_active, sort_order, created_at, updated_at)
       VALUES (?, 'Test Starter', 'test_starter', 'Test Starter', 'Plan test', 19000, 190000, 'XAF', 5, 3, 2, 1, 50, 1, 200, 100, 50, '[]', 14, 0, 1, 1, NOW(), NOW())`,
      [planIdA],
    );

    planIdB = generateId();
    await pool.query(
      `INSERT INTO subscription_plans (id, name, code, display_name, description, price_monthly, price_yearly, currency, max_vehicles, max_drivers, max_users, max_agencies, max_documents, max_storage_gb, max_trips_per_month, max_fuel_records_per_month, max_maintenance_records_per_month, features, trial_days, is_popular, is_active, sort_order, created_at, updated_at)
       VALUES (?, 'Test Business', 'test_business', 'Test Business', 'Plan pro test', 51800, 518000, 'XAF', 15, 10, 5, 3, 200, 5, 1000, 500, 200, '[]', 14, 1, 1, 2, NOW(), NOW())`,
      [planIdB],
    );
  });

  function auth(token) { return { Authorization: `Bearer ${token}` }; }

  describe('Features & Plans', () => {
    it('GET /subscriptions/features should return features list', async () => {
      const res = await req('GET', '/subscriptions/features', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 10);
      assert.ok(res.data.data[0].code);
    });

    it('GET /subscriptions/plans/:planId/features should return plan features', async () => {
      const res = await req('GET', `/subscriptions/plans/${planIdA}/features`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
    });

    it('GET /subscriptions/plans/:planId/limits should return plan limits', async () => {
      const res = await req('GET', `/subscriptions/plans/${planIdA}/limits`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.maxVehicles, 5);
      assert.strictEqual(res.data.data.maxDrivers, 3);
    });

    it('GET /subscriptions/plans/:planId/limits should 404 for non-existent plan', async () => {
      const res = await req('GET', '/subscriptions/plans/nonexistent/limits', null, auth(tokenA));
      assert.strictEqual(res.status, 404);
    });
  });

  describe('Plan listing', () => {
    it('GET /subscriptions should list plans when no companyScopeId', async () => {
      const res = await req('GET', '/subscriptions', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
    });

    it('POST /subscriptions/plans without permission should return 403', async () => {
      const res = await req('POST', '/subscriptions/plans', {
        name: 'New Plan', code: 'new_plan',
      }, auth(tokenA));
      assert.strictEqual(res.status, 403);
    });
  });

  describe('Subscription CRUD', () => {
    it('POST /subscriptions should create subscription', async () => {
      const res = await req('POST', '/subscriptions', {
        companyId: companyIdA,
        planId: planIdA,
        billingInterval: 'monthly',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.companyId, companyIdA);
      assert.strictEqual(res.data.data.status, 'trialing');
      assert.strictEqual(res.data.data.billingInterval, 'monthly');
      assert.ok(res.data.data.trialStartDate);
      assert.ok(res.data.data.trialEndDate);
      subscriptionId = res.data.data.id;
    });

    it('POST /subscriptions duplicate should return 409', async () => {
      const res = await req('POST', '/subscriptions', {
        companyId: companyIdA,
        planId: planIdA,
        billingInterval: 'monthly',
      }, auth(tokenA));
      assert.strictEqual(res.status, 409);
    });

    it('GET /subscriptions/current should return current subscription', async () => {
      const res = await req('GET', '/subscriptions/current', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data);
      assert.strictEqual(res.data.data.id, subscriptionId);
    });

    it('GET /subscriptions/:id should return subscription', async () => {
      const res = await req('GET', `/subscriptions/${subscriptionId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.id, subscriptionId);
    });

    it('GET /subscriptions/:id wrong company should 404', async () => {
      const res = await req('GET', `/subscriptions/${subscriptionId}`, null, auth(tokenB));
      assert.strictEqual(res.status, 404);
    });

    it('GET /subscriptions/usage/:companyId should return usage', async () => {
      const res = await req('GET', `/subscriptions/usage/${companyIdA}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.companyId);
      assert.strictEqual(typeof res.data.data.vehiclesUsed, 'number');
    });

    it('GET /subscriptions/usage should return usage with limits', async () => {
      const res = await req('GET', '/subscriptions/usage', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
    });
  });

  describe('Plan Change', () => {
    it('PATCH /subscriptions/:id should change plan', async () => {
      const res = await req('PATCH', `/subscriptions/${subscriptionId}`, {
        planId: planIdB,
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.planId, planIdB);
      assert.ok(res.data.data.planChangedAt);
    });

    it('PATCH /subscriptions/:id to same plan should still succeed', async () => {
      const res = await req('PATCH', `/subscriptions/${subscriptionId}`, {
        planId: planIdB,
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
    });
  });

  describe('Cancel & Resume', () => {
    it('POST /subscriptions/:id/cancel should cancel', async () => {
      const res = await req('POST', `/subscriptions/${subscriptionId}/cancel`, {
        reason: 'Test annulation',
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.status, 'cancelled');
      assert.ok(res.data.data.cancelledAt);
    });

    it('POST /subscriptions/:id/cancel again should fail', async () => {
      const res = await req('POST', `/subscriptions/${subscriptionId}/cancel`, {}, auth(tokenA));
      assert.strictEqual(res.status, 400);
    });

    it('POST /subscriptions/:id/resume should resume', async () => {
      const res = await req('POST', `/subscriptions/${subscriptionId}/resume`, {}, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.status, 'active');
    });
  });

  describe('Renew', () => {
    it('POST /subscriptions/:id/renew should renew', async () => {
      const res = await req('POST', `/subscriptions/${subscriptionId}/renew`, {}, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.currentPeriodStart);
      assert.ok(res.data.data.currentPeriodEnd);
    });
  });

  describe('Validation', () => {
    it('POST /subscriptions without planId should fail with 422', async () => {
      const res = await req('POST', '/subscriptions', {
        companyId: companyIdB,
      }, auth(tokenB));
      assert.ok(res.status >= 400);
    });
  });

  describe('Auth & Security', () => {
    it('GET /subscriptions without auth should return 401', async () => {
      const res = await req('GET', '/subscriptions');
      assert.strictEqual(res.status, 401);
    });

    it('POST /subscriptions without auth should return 401', async () => {
      const res = await req('POST', '/subscriptions', {
        companyId: companyIdA, planId: planIdA,
      });
      assert.strictEqual(res.status, 401);
    });
  });
});
