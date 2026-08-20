import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createTransactionSchema, transactionIdParamSchema, financeQuerySchema,
  createInvoiceSchema, updateInvoiceSchema, invoiceStatusSchema,
  invoiceIdParamSchema, invoiceQuerySchema, createPaymentSchema,
  paymentIdParamSchema, paymentQuerySchema, statsQuerySchema,
} from '../../src/modules/finance/finance.schema.js';

describe('Finance Schemas', () => {

  describe('createTransactionSchema', () => {
    it('should accept valid deposit', () => {
      const result = createTransactionSchema.safeParse({
        type: 'deposit', amount: 5000, description: 'Dépôt test', method: 'cash',
      });
      assert.ok(result.success);
    });

    it('should accept valid withdrawal', () => {
      const result = createTransactionSchema.safeParse({
        type: 'withdrawal', amount: 2000, description: 'Retrait test',
      });
      assert.ok(result.success);
    });

    it('should accept full payload', () => {
      const result = createTransactionSchema.safeParse({
        type: 'payment', amount: 10000, description: 'Paiement',
        direction: 'out', method: 'mobile_money', label: 'Test',
        source: 'Source', destination: 'Dest', counterparty: 'CP',
        category: 'maintenance', entityType: 'vehicle', entityId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        metadata: { note: 'ok' },
      });
      assert.ok(result.success);
    });

    it('should reject missing type', () => {
      const result = createTransactionSchema.safeParse({ amount: 5000, description: 'test' });
      assert.ok(!result.success);
    });

    it('should reject invalid type', () => {
      const result = createTransactionSchema.safeParse({ type: 'invalid', amount: 5000, description: 'test' });
      assert.ok(!result.success);
    });

    it('should reject missing amount', () => {
      const result = createTransactionSchema.safeParse({ type: 'deposit', description: 'test' });
      assert.ok(!result.success);
    });

    it('should reject zero amount', () => {
      const result = createTransactionSchema.safeParse({ type: 'deposit', amount: 0, description: 'test' });
      assert.ok(!result.success);
    });

    it('should reject negative amount', () => {
      const result = createTransactionSchema.safeParse({ type: 'deposit', amount: -100, description: 'test' });
      assert.ok(!result.success);
    });

    it('should reject missing description', () => {
      const result = createTransactionSchema.safeParse({ type: 'deposit', amount: 5000 });
      assert.ok(!result.success);
    });

    it('should accept all valid transaction types', () => {
      const types = ['deposit', 'withdrawal', 'transfer', 'payment', 'refund', 'commission', 'fee', 'adjustment', 'income', 'expense', 'transfer_in', 'transfer_out'];
      for (const type of types) {
        const result = createTransactionSchema.safeParse({ type, amount: 100, description: 'test' });
        assert.ok(result.success, `Type ${type} should be valid`);
      }
    });

    it('should accept all payment methods', () => {
      const methods = ['cash', 'bank_transfer', 'card', 'mobile_money', 'cheque', 'other'];
      for (const method of methods) {
        const result = createTransactionSchema.safeParse({ type: 'deposit', amount: 100, description: 'test', method });
        assert.ok(result.success, `Method ${method} should be valid`);
      }
    });
  });

  describe('transactionIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = transactionIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject empty id', () => {
      const result = transactionIdParamSchema.safeParse({ id: '' });
      assert.ok(!result.success);
    });
  });

  describe('financeQuerySchema', () => {
    it('should apply defaults', () => {
      const result = financeQuerySchema.safeParse({});
      assert.ok(result.success);
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 20);
      assert.equal(result.data.sort, 'transaction_date');
      assert.equal(result.data.order, 'DESC');
    });

    it('should coerce page and limit', () => {
      const result = financeQuerySchema.safeParse({ page: '2', limit: '10' });
      assert.ok(result.success);
      assert.equal(result.data.page, 2);
      assert.equal(result.data.limit, 10);
    });

    it('should accept valid filters', () => {
      const result = financeQuerySchema.safeParse({
        transaction_type: 'deposit', status: 'completed', direction: 'in', method: 'cash',
      });
      assert.ok(result.success);
    });

    it('should accept search term', () => {
      const result = financeQuerySchema.safeParse({ search: 'test' });
      assert.ok(result.success);
    });

    it('should accept date range', () => {
      const result = financeQuerySchema.safeParse({ dateFrom: '2026-01-01', dateTo: '2026-12-31' });
      assert.ok(result.success);
    });

    it('should reject invalid sort field', () => {
      const result = financeQuerySchema.safeParse({ sort: 'password' });
      assert.ok(!result.success);
    });

    it('should reject limit > 100', () => {
      const result = financeQuerySchema.safeParse({ limit: 101 });
      assert.ok(!result.success);
    });
  });

  describe('createInvoiceSchema', () => {
    it('should accept valid minimal invoice', () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ description: 'Service', quantity: 1, unit_price: 50000 }],
      });
      assert.ok(result.success);
    });

    it('should accept full payload', () => {
      const result = createInvoiceSchema.safeParse({
        clientId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        partnerId: '01J8A2B3C4D5E6F7G8H9J0K1L3',
        taxRate: 0.18,
        dueAt: '2026-12-31',
        notes: 'Facture test',
        items: [
          { description: 'Service 1', quantity: 2, unit_price: 50000 },
          { description: 'Service 2', quantity: 1, unit_price: 10000, item_kind: 'addon' },
        ],
      });
      assert.ok(result.success);
    });

    it('should reject empty items', () => {
      const result = createInvoiceSchema.safeParse({ items: [] });
      assert.ok(!result.success);
    });

    it('should reject missing items', () => {
      const result = createInvoiceSchema.safeParse({});
      assert.ok(!result.success);
    });

    it('should reject item missing description', () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ quantity: 1, unit_price: 50000 }],
      });
      assert.ok(!result.success);
    });

    it('should reject negative unit_price', () => {
      const result = createInvoiceSchema.safeParse({
        items: [{ description: 'test', quantity: 1, unit_price: -100 }],
      });
      assert.ok(!result.success);
    });

    it('should accept all item kinds', () => {
      const kinds = ['subscription_renewal', 'setup', 'usage', 'addon', 'credit_note'];
      for (const kind of kinds) {
        const result = createInvoiceSchema.safeParse({
          items: [{ description: 'test', quantity: 1, unit_price: 100, item_kind: kind }],
        });
        assert.ok(result.success, `Kind ${kind} should be valid`);
      }
    });
  });

  describe('invoiceStatusSchema', () => {
    it('should accept valid status', () => {
      const result = invoiceStatusSchema.safeParse({ status: 'issued' });
      assert.ok(result.success);
    });

    it('should reject invalid status', () => {
      const result = invoiceStatusSchema.safeParse({ status: 'invalid' });
      assert.ok(!result.success);
    });

    it('should accept all statuses', () => {
      const statuses = ['draft', 'issued', 'sent', 'paid', 'partially_paid', 'overdue', 'cancelled', 'refunded'];
      for (const status of statuses) {
        const result = invoiceStatusSchema.safeParse({ status });
        assert.ok(result.success, `Status ${status} should be valid`);
      }
    });
  });

  describe('invoiceIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = invoiceIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject empty id', () => {
      const result = invoiceIdParamSchema.safeParse({ id: '' });
      assert.ok(!result.success);
    });
  });

  describe('invoiceQuerySchema', () => {
    it('should apply defaults', () => {
      const result = invoiceQuerySchema.safeParse({});
      assert.ok(result.success);
      assert.equal(result.data.page, 1);
      assert.equal(result.data.limit, 20);
    });

    it('should accept valid filters', () => {
      const result = invoiceQuerySchema.safeParse({ status: 'paid', clientId: 'test' });
      assert.ok(result.success);
    });

    it('should accept search', () => {
      const result = invoiceQuerySchema.safeParse({ search: 'INV-2026' });
      assert.ok(result.success);
    });

    it('should reject invalid sort field', () => {
      const result = invoiceQuerySchema.safeParse({ sort: 'secret' });
      assert.ok(!result.success);
    });
  });

  describe('createPaymentSchema', () => {
    it('should accept valid payment', () => {
      const result = createPaymentSchema.safeParse({
        invoiceId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        amount: 50000,
        method: 'cash',
      });
      assert.ok(result.success);
    });

    it('should accept full payload', () => {
      const result = createPaymentSchema.safeParse({
        invoiceId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        amount: 50000,
        method: 'bank_transfer',
        reference: 'REF-001',
        transactionReference: 'TX-2026-001',
        notes: 'Paiement test',
      });
      assert.ok(result.success);
    });

    it('should reject missing invoiceId', () => {
      const result = createPaymentSchema.safeParse({ amount: 50000, method: 'cash' });
      assert.ok(!result.success);
    });

    it('should reject missing amount', () => {
      const result = createPaymentSchema.safeParse({ invoiceId: 'test', method: 'cash' });
      assert.ok(!result.success);
    });

    it('should reject zero amount', () => {
      const result = createPaymentSchema.safeParse({ invoiceId: 'test', amount: 0, method: 'cash' });
      assert.ok(!result.success);
    });

    it('should reject missing method', () => {
      const result = createPaymentSchema.safeParse({ invoiceId: 'test', amount: 50000 });
      assert.ok(!result.success);
    });

    it('should reject invalid method', () => {
      const result = createPaymentSchema.safeParse({ invoiceId: 'test', amount: 50000, method: 'bitcoin' });
      assert.ok(!result.success);
    });

    it('should accept all payment methods', () => {
      const methods = ['cash', 'bank_transfer', 'card', 'mobile_money', 'cheque', 'other'];
      for (const method of methods) {
        const result = createPaymentSchema.safeParse({ invoiceId: 'test', amount: 100, method });
        assert.ok(result.success, `Method ${method} should be valid`);
      }
    });
  });

  describe('paymentIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = paymentIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject empty id', () => {
      const result = paymentIdParamSchema.safeParse({ id: '' });
      assert.ok(!result.success);
    });
  });

  describe('paymentQuerySchema', () => {
    it('should apply defaults', () => {
      const result = paymentQuerySchema.safeParse({});
      assert.ok(result.success);
      assert.equal(result.data.page, 1);
    });

    it('should accept valid filters', () => {
      const result = paymentQuerySchema.safeParse({ status: 'completed', method: 'cash' });
      assert.ok(result.success);
    });

    it('should accept search', () => {
      const result = paymentQuerySchema.safeParse({ search: 'test' });
      assert.ok(result.success);
    });
  });

  describe('statsQuerySchema', () => {
    it('should accept empty', () => {
      const result = statsQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept date range', () => {
      const result = statsQuerySchema.safeParse({ dateFrom: '2026-01-01', dateTo: '2026-12-31' });
      assert.ok(result.success);
    });

    it('should accept period', () => {
      const result = statsQuerySchema.safeParse({ period: 'month' });
      assert.ok(result.success);
    });

    it('should reject invalid period', () => {
      const result = statsQuerySchema.safeParse({ period: 'decade' });
      assert.ok(!result.success);
    });
  });
});
