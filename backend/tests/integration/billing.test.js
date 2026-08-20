import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8111;
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
  await pool.query('DELETE FROM billing_payments WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['BillIntTest%']);
  await pool.query('DELETE FROM billing_invoice_items WHERE invoice_id IN (SELECT id FROM billing_invoices WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?))', ['BillIntTest%']);
  await pool.query('DELETE FROM billing_invoices WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['BillIntTest%']);
  await pool.query('DELETE FROM billing_history WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['BillIntTest%']);
  await pool.query('DELETE FROM billing_settings WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['BillIntTest%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['BillIntTest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%bill_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Billing Integration', () => {
  let tokenA, companyIdA, invoiceId, paymentId;

  before(async () => {
    const ts = Date.now();
    const reg = await req('POST', '/auth/register', {
      firstName: 'Bill', lastName: 'AdminA',
      email: `bill_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'BillIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg.status, 201);
    tokenA = reg.data.data.tokens.accessToken;
    companyIdA = reg.data.data.company.id;
  });

  function auth(token) { return { Authorization: `Bearer ${token}` }; }

  describe('Billing Settings', () => {
    it('GET /billing/settings should return or create settings', async () => {
      const res = await req('GET', '/billing/settings', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.defaultCurrency);
      assert.ok(typeof res.data.data.paymentTermsDays === 'number');
      assert.ok(typeof res.data.data.defaultTaxRate === 'number');
    });

    it('PATCH /billing/settings should update settings', async () => {
      const res = await req('PATCH', '/billing/settings', {
        paymentTermsDays: 15,
        defaultTaxRate: 0.18,
        autoReminders: true,
      }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.paymentTermsDays, 15);
      assert.strictEqual(res.data.data.defaultTaxRate, 0.18);
      assert.strictEqual(res.data.data.autoReminders, true);
    });

    it('PATCH /billing/settings without permission should 403', async () => {
      const res = await req('PATCH', '/billing/settings', {
        paymentTermsDays: 30,
      });
      assert.strictEqual(res.status, 401);
    });
  });

  describe('Invoice CRUD', () => {
    it('POST /billing/invoices should create invoice', async () => {
      const res = await req('POST', '/billing/invoices', {
        companyId: companyIdA,
        currency: 'XAF',
        taxRate: 0.18,
        items: [
          { kind: 'subscription_renewal', label: 'Abonnement Monthly', quantity: 1, unitPrice: 50000 },
          { kind: 'usage', label: 'Usage supplémentaire', quantity: 5, unitPrice: 1000 },
        ],
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.status, 'draft');
      assert.ok(res.data.data.number);
      assert.ok(res.data.data.total > 0);
      assert.ok(res.data.data.amountDue > 0);
      assert.strictEqual(Number(res.data.data.amountPaid), 0);
      invoiceId = res.data.data.id;
    });

    it('GET /billing/invoices should list invoices', async () => {
      const res = await req('GET', '/billing/invoices', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 1);
      assert.ok(res.data.pagination);
    });

    it('GET /billing/invoices/:id should return invoice', async () => {
      const res = await req('GET', `/billing/invoices/${invoiceId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.id, invoiceId);
    });

    it('GET /billing/invoices/:id/items should return invoice items', async () => {
      const res = await req('GET', `/billing/invoices/${invoiceId}/items`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 1);
    });

    it('POST /billing/invoices/:id/issue should issue invoice', async () => {
      const res = await req('POST', `/billing/invoices/${invoiceId}/issue`, {}, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.status, 'issued');
      assert.ok(res.data.data.issuedDate);
      assert.ok(res.data.data.dueDate);
    });

    it('POST /billing/invoices/:id/issue again should fail', async () => {
      const res = await req('POST', `/billing/invoices/${invoiceId}/issue`, {}, auth(tokenA));
      assert.strictEqual(res.status, 400);
    });

    it('GET /billing/invoices/:id/download should return simulated PDF', async () => {
      const res = await req('GET', `/billing/invoices/${invoiceId}/download`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.fileName);
      assert.ok(res.data.data.simulated);
    });
  });

  describe('Payment Simulation', () => {
    it('POST /billing/payments/simulate should simulate payment', async () => {
      const res = await req('POST', '/billing/payments/simulate', {
        invoiceId,
        method: 'bank_transfer',
        amount: 30000,
        transactionReference: 'TXN-TEST-001',
        paymentDate: '2026-08-20',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.success);
      assert.ok(res.data.data.payment);
      assert.ok(res.data.data.invoice);
      assert.strictEqual(res.data.data.payment.status, 'successful');
      assert.ok(res.data.data.payment.number);
      paymentId = res.data.data.payment.id;
    });

    it('GET /billing/payments should list payments', async () => {
      const res = await req('GET', '/billing/payments', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 1);
    });

    it('GET /billing/payments/:id should return payment', async () => {
      const res = await req('GET', `/billing/payments/${paymentId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.id, paymentId);
    });

    it('Invoice should be partially paid after partial payment', async () => {
      const res = await req('GET', `/billing/invoices/${invoiceId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'partially_paid');
      assert.ok(Number(res.data.data.amountPaid) > 0);
      assert.ok(Number(res.data.data.amountDue) >= 0);
    });
  });

  describe('Payment Refund', () => {
    it('POST /billing/payments/:id/refund should refund payment', async () => {
      const res = await req('POST', `/billing/payments/${paymentId}/refund`, {}, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.status, 'refunded');
    });
  });

  describe('Invoice Cancel', () => {
    it('POST /billing/invoices/:id/cancel should cancel invoice', async () => {
      const res = await req('POST', `/billing/invoices/${invoiceId}/cancel`, {}, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.status, 'cancelled');
    });
  });

  describe('Statistics & History', () => {
    it('GET /billing/statistics should return statistics', async () => {
      const res = await req('GET', '/billing/invoices/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(typeof res.data.data === 'object');
    });

    it('GET /billing/history should return billing history', async () => {
      const res = await req('GET', '/billing/history', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
    });
  });

  describe('Credits & Discounts (stubs)', () => {
    it('GET /billing/credits should return empty array', async () => {
      const res = await req('GET', '/billing/credits', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
    });

    it('GET /billing/discounts should return empty array', async () => {
      const res = await req('GET', '/billing/discounts', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
    });
  });

  describe('Auth & Security', () => {
    it('GET /billing/invoices without auth should 401', async () => {
      const res = await req('GET', '/billing/invoices');
      assert.strictEqual(res.status, 401);
    });

    it('POST /billing/invoices without auth should 401', async () => {
      const res = await req('POST', '/billing/invoices', {
        companyId: companyIdA, items: [{ label: 'Test', unitPrice: 1000 }],
      });
      assert.strictEqual(res.status, 401);
    });
  });
});
