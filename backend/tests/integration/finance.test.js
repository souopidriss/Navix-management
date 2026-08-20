import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8109;
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
  await pool.execute('DELETE FROM financial_transactions WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['FinIntTest%']);
  await pool.execute('DELETE FROM payments WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['FinIntTest%']);
  await pool.execute('DELETE FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['FinIntTest%']);
  await pool.execute('DELETE FROM invoice_items WHERE invoice_id IN (SELECT id FROM invoices WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?))', ['FinIntTest%']);
  await pool.execute('DELETE FROM financial_accounts WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['FinIntTest%']);
  await pool.execute('DELETE FROM companies WHERE name LIKE ?', ['FinIntTest%']);
  await pool.execute('DELETE FROM users WHERE email LIKE ?', ['%fin_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Finance Integration', () => {
  let tokenA, tokenB, companyIdA, companyIdB, invoiceId, paymentId;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Finance', lastName: 'AdminA',
      email: `fin_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'FinIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Finance', lastName: 'AdminB',
      email: `fin_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'FinIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
    companyIdB = reg2.data.data.company.id;
  });

  function auth(token) { return { Authorization: `Bearer ${token}` }; }

  describe('Wallet & Balance', () => {
    it('GET /finance/wallet should return wallet', async () => {
      const res = await req('GET', '/finance/wallet', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.walletId);
      assert.strictEqual(res.data.data.currency, 'XAF');
      assert.strictEqual(typeof res.data.data.balance, 'number');
    });

    it('GET /finance/wallet/balance should return balance', async () => {
      const res = await req('GET', '/finance/wallet/balance', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(typeof res.data.data, 'number');
    });

    it('GET /finance/wallet without auth should return 401', async () => {
      const res = await req('GET', '/finance/wallet');
      assert.strictEqual(res.status, 401);
    });
  });

  describe('Transactions CRUD', () => {
    let transactionId;
    let withdrawalId;

    it('POST /finance/transactions should create deposit', async () => {
      const res = await req('POST', '/finance/transactions', {
        type: 'deposit', amount: 500000, description: 'Dépôt initial',
        method: 'bank_transfer', source: 'Banque Atlantique',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.type, 'deposit');
      assert.strictEqual(res.data.data.direction, 'in');
      assert.strictEqual(Number(res.data.data.amount), 500000);
      assert.ok(res.data.data.reference);
      assert.strictEqual(Number(res.data.data.balanceAfter), 500000);
      transactionId = res.data.data.id;
    });

    it('GET /finance/transactions should list transactions', async () => {
      const res = await req('GET', '/finance/transactions', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 1);
      assert.ok(res.data.pagination);
    });

    it('GET /finance/transactions/:id should return transaction', async () => {
      const res = await req('GET', `/finance/transactions/${transactionId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.id, transactionId);
    });

    it('POST /finance/transactions should create withdrawal', async () => {
      const res = await req('POST', '/finance/transactions', {
        type: 'withdrawal', amount: 100000, description: 'Retrait caisse',
        method: 'cash', destination: 'Caisse bureau',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.data.type, 'withdrawal');
      assert.strictEqual(res.data.data.direction, 'out');
      assert.strictEqual(Number(res.data.data.balanceAfter), 400000);
      withdrawalId = res.data.data.id;
    });

    it('POST /finance/transactions should fail with insufficient balance', async () => {
      const res = await req('POST', '/finance/transactions', {
        type: 'withdrawal', amount: 999999999, description: 'Retrait trop élevé',
      }, auth(tokenA));
      assert.strictEqual(res.status, 400);
    });

    it('POST /finance/transactions should reject invalid type', async () => {
      const res = await req('POST', '/finance/transactions', {
        type: 'invalid', amount: 100, description: 'test',
      }, auth(tokenA));
      assert.strictEqual(res.status, 422);
    });

    it('POST /finance/transactions should reject zero amount', async () => {
      const res = await req('POST', '/finance/transactions', {
        type: 'deposit', amount: 0, description: 'test',
      }, auth(tokenA));
      assert.strictEqual(res.status, 422);
    });

    it('POST /finance/transactions/:id/reverse should reverse transaction', async () => {
      const res = await req('POST', `/finance/transactions/${withdrawalId}/reverse`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.type, 'refund');
    });

    it('POST /finance/transactions/:id/reverse same transaction again should fail', async () => {
      const res = await req('POST', `/finance/transactions/${withdrawalId}/reverse`, null, auth(tokenA));
      assert.strictEqual(res.status, 409);
    });

    it('GET /finance/transactions/reference/preview should return reference', async () => {
      const res = await req('GET', '/finance/transactions/reference/preview', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.startsWith('TRX-'));
    });
  });

  describe('Tenant Isolation - Transactions', () => {
    it('Company A should not see Company B transactions', async () => {
      await req('POST', '/finance/transactions', {
        type: 'deposit', amount: 99999, description: 'A only',
      }, auth(tokenA));

      const res = await req('GET', '/finance/transactions', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
      const hasA = res.data.data.some(t => t.description === 'A only');
      assert.strictEqual(hasA, false, 'Company B should not see Company A transactions');
    });
  });

  describe('Statistics', () => {
    it('GET /finance/wallet/statistics should return statistics', async () => {
      const res = await req('GET', '/finance/wallet/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok('totalIncome' in res.data.data);
      assert.ok('totalExpense' in res.data.data);
      assert.ok('netBalance' in res.data.data);
      assert.ok('monthlyEvolution' in res.data.data);
    });

    it('GET /finance/wallet/summary should return summary', async () => {
      const res = await req('GET', '/finance/wallet/summary', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok('balance' in res.data.data);
      assert.ok('recentTransactions' in res.data.data);
    });
  });

  describe('Invoices CRUD', () => {
    it('POST /finance/invoices should create invoice', async () => {
      const res = await req('POST', '/finance/invoices', {
        items: [
          { description: 'Location flotte mensuelle', quantity: 1, unit_price: 500000 },
          { description: 'Assurance véhicules', quantity: 3, unit_price: 50000 },
        ],
        taxRate: 0.18,
        notes: 'Facture test',
        dueAt: '2026-12-31',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.success);
      assert.ok(res.data.data.reference.startsWith('INV-'));
      assert.strictEqual(res.data.data.status, 'draft');
      assert.ok(res.data.data.items.length === 2);
      assert.ok(Number(res.data.data.total) > 0);
      invoiceId = res.data.data.id;
    });

    it('GET /finance/invoices should list invoices', async () => {
      const res = await req('GET', '/finance/invoices', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 1);
    });

    it('GET /finance/invoices/:id should return invoice with items', async () => {
      const res = await req('GET', `/finance/invoices/${invoiceId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(res.data.data.items.length === 2);
    });

    it('PATCH /finance/invoices/:id/status should issue invoice', async () => {
      const res = await req('PATCH', `/finance/invoices/${invoiceId}/status`, { status: 'issued' }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'issued');
      assert.ok(res.data.data.issuedAt);
    });

    it('GET /finance/invoices/statistics should return stats', async () => {
      const res = await req('GET', '/finance/invoices/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok('totalCount' in res.data.data);
    });
  });

  describe('Payments', () => {
    it('POST /finance/payments should create payment', async () => {
      const res = await req('POST', '/finance/payments', {
        invoiceId: invoiceId,
        amount: 100000,
        method: 'bank_transfer',
        reference: 'VIR-001',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);
      assert.ok(res.data.success);
      assert.strictEqual(Number(res.data.data.amount), 100000);
      assert.strictEqual(res.data.data.method, 'bank_transfer');
      paymentId = res.data.data.id;
    });

    it('GET /finance/payments should list payments', async () => {
      const res = await req('GET', '/finance/payments', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.ok(Array.isArray(res.data.data));
    });

    it('GET /finance/payments/:id should return payment', async () => {
      const res = await req('GET', `/finance/payments/${paymentId}`, null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.success);
      assert.strictEqual(res.data.data.id, paymentId);
    });

    it('POST /finance/payments with duplicate reference should fail', async () => {
      const res = await req('POST', '/finance/payments', {
        invoiceId: invoiceId,
        amount: 50000,
        method: 'bank_transfer',
        transactionReference: 'DUP-REF-001',
      }, auth(tokenA));
      assert.strictEqual(res.status, 201);

      const res2 = await req('POST', '/finance/payments', {
        invoiceId: invoiceId,
        amount: 50000,
        method: 'bank_transfer',
        transactionReference: 'DUP-REF-001',
      }, auth(tokenA));
      assert.strictEqual(res2.status, 409);
    });

    it('GET /finance/payments/statistics should return stats', async () => {
      const res = await req('GET', '/finance/payments/statistics', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok('totalCompleted' in res.data.data);
    });
  });

  describe('Invoice Status Transitions', () => {
    it('Invalid transition should fail', async () => {
      const createRes = await req('POST', '/finance/invoices', {
        items: [{ description: 'test', quantity: 1, unit_price: 10000 }],
      }, auth(tokenA));
      const invId = createRes.data.data.id;

      const res = await req('PATCH', `/finance/invoices/${invId}/status`, { status: 'paid' }, auth(tokenA));
      assert.strictEqual(res.status, 409);
    });

    it('Valid transition draft→issued should succeed', async () => {
      const createRes = await req('POST', '/finance/invoices', {
        items: [{ description: 'test', quantity: 1, unit_price: 10000 }],
      }, auth(tokenA));
      const invId = createRes.data.data.id;

      const res = await req('PATCH', `/finance/invoices/${invId}/status`, { status: 'issued' }, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'issued');
    });
  });

  describe('Tenant Isolation - Invoices & Payments', () => {
    it('Company B should not see Company A invoices', async () => {
      await req('POST', '/finance/invoices', {
        items: [{ description: 'A invoice', quantity: 1, unit_price: 100000 }],
      }, auth(tokenA));

      const res = await req('GET', '/finance/invoices', null, auth(tokenB));
      assert.strictEqual(res.status, 200);
      const hasA = res.data.data.some(i => i.notes === 'A invoice' || i.items?.some(item => item.description === 'A invoice'));
      assert.strictEqual(hasA, false);
    });
  });

  describe('Filters & Search', () => {
    it('GET /finance/transactions with type filter', async () => {
      const res = await req('GET', '/finance/transactions?transaction_type=deposit', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      res.data.data.forEach(t => assert.strictEqual(t.type, 'deposit'));
    });

    it('GET /finance/transactions with direction filter', async () => {
      const res = await req('GET', '/finance/transactions?direction=in', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      res.data.data.forEach(t => assert.strictEqual(t.direction, 'in'));
    });

    it('GET /finance/transactions with search', async () => {
      const res = await req('GET', '/finance/transactions?search=Dépôt', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });

    it('GET /finance/invoices with status filter', async () => {
      const res = await req('GET', '/finance/invoices?status=draft', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
    });
  });

  describe('Category Stats', () => {
    it('GET /finance/transactions/category-stats should return stats', async () => {
      const res = await req('GET', '/finance/transactions/category-stats', null, auth(tokenA));
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
    });
  });
});
