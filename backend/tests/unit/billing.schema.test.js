import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createBillingInvoiceSchema, billingInvoiceIdParamSchema, billingInvoiceQuerySchema,
  billingPaymentIdParamSchema, simulatePaymentSchema, billingPaymentQuerySchema,
  updateBillingSettingsSchema, billingHistoryQuerySchema,
} from '../../src/modules/billing/billing.schema.js';

describe('Billing Schemas', () => {

  describe('createBillingInvoiceSchema', () => {
    it('should accept valid payload', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
      });
      assert.ok(result.success);
    });

    it('should accept with items', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        subscriptionId: '01JS1A2B3C4D5E6F7G8H9J0K1L2',
        currency: 'XAF', taxRate: 0.18,
        periodStart: '2026-08-01', periodEnd: '2026-08-31',
        status: 'draft', notes: 'Test invoice',
        items: [
          { kind: 'subscription_renewal', label: 'Renouvellement', description: 'Monthly', quantity: 1, unitPrice: 50000 },
          { kind: 'usage', label: 'Usage', quantity: 10, unitPrice: 500 },
        ],
      });
      assert.ok(result.success);
    });

    it('should accept without companyId (overridden server-side)', () => {
      const result = createBillingInvoiceSchema.safeParse({});
      assert.ok(result.success);
    });

    it('should reject invalid status', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: 'a', status: 'invalid',
      });
      assert.ok(!result.success);
    });

    it('should reject invalid taxRate', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: 'a', taxRate: 1.5,
      });
      assert.ok(!result.success);
    });

    it('should reject empty items array', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: 'a', items: [],
      });
      assert.ok(!result.success);
    });

    it('should reject item without label', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: 'a', items: [{ unitPrice: 100 }],
      });
      assert.ok(!result.success);
    });

    it('should reject negative unitPrice', () => {
      const result = createBillingInvoiceSchema.safeParse({
        companyId: 'a', items: [{ label: 'Test', unitPrice: -100 }],
      });
      assert.ok(!result.success);
    });
  });

  describe('billingInvoiceIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = billingInvoiceIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject missing id', () => {
      const result = billingInvoiceIdParamSchema.safeParse({});
      assert.ok(!result.success);
    });
  });

  describe('billingInvoiceQuerySchema', () => {
    it('should accept empty query', () => {
      const result = billingInvoiceQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept full query', () => {
      const result = billingInvoiceQuerySchema.safeParse({
        page: 1, limit: 10, sort: 'total', order: 'ASC', status: 'paid',
      });
      assert.ok(result.success);
    });

    it('should reject invalid status', () => {
      const result = billingInvoiceQuerySchema.safeParse({ status: 'unknown' });
      assert.ok(!result.success);
    });

    it('should reject invalid sort', () => {
      const result = billingInvoiceQuerySchema.safeParse({ sort: 'invalid' });
      assert.ok(!result.success);
    });
  });

  describe('simulatePaymentSchema', () => {
    it('should accept valid payload', () => {
      const result = simulatePaymentSchema.safeParse({
        invoiceId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
      });
      assert.ok(result.success);
      assert.strictEqual(result.data.method, 'bank_transfer');
    });

    it('should accept full payload', () => {
      const result = simulatePaymentSchema.safeParse({
        invoiceId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        method: 'mobile_money', amount: 50000,
        currency: 'XAF', transactionReference: 'TXN-123',
        paymentDate: '2026-08-20',
      });
      assert.ok(result.success);
    });

    it('should reject missing invoiceId', () => {
      const result = simulatePaymentSchema.safeParse({});
      assert.ok(!result.success);
    });

    it('should reject invalid method', () => {
      const result = simulatePaymentSchema.safeParse({
        invoiceId: 'a', method: 'bitcoin',
      });
      assert.ok(!result.success);
    });

    it('should reject negative amount', () => {
      const result = simulatePaymentSchema.safeParse({
        invoiceId: 'a', amount: -100,
      });
      assert.ok(!result.success);
    });
  });

  describe('billingPaymentIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = billingPaymentIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject missing id', () => {
      const result = billingPaymentIdParamSchema.safeParse({});
      assert.ok(!result.success);
    });
  });

  describe('billingPaymentQuerySchema', () => {
    it('should accept empty query', () => {
      const result = billingPaymentQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept full query', () => {
      const result = billingPaymentQuerySchema.safeParse({
        page: 2, limit: 5, sort: 'amount', order: 'ASC',
        status: 'successful', method: 'card',
      });
      assert.ok(result.success);
    });

    it('should reject invalid status', () => {
      const result = billingPaymentQuerySchema.safeParse({ status: 'unknown' });
      assert.ok(!result.success);
    });

    it('should reject invalid method', () => {
      const result = billingPaymentQuerySchema.safeParse({ method: 'bitcoin' });
      assert.ok(!result.success);
    });
  });

  describe('updateBillingSettingsSchema', () => {
    it('should accept empty update', () => {
      const result = updateBillingSettingsSchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept partial update', () => {
      const result = updateBillingSettingsSchema.safeParse({
        defaultCurrency: 'XAF', paymentTermsDays: 30,
      });
      assert.ok(result.success);
    });

    it('should accept full update', () => {
      const result = updateBillingSettingsSchema.safeParse({
        defaultCurrency: 'XAF', paymentTermsDays: 15,
        defaultTaxRate: 0.18, allowPartialPayments: true,
        invoicePrefix: 'NAVIX', autoReminders: true,
        defaultPaymentMethods: ['bank_transfer', 'mobile_money'],
        companyInfo: { name: 'Test Corp', address: 'Douala' },
      });
      assert.ok(result.success);
    });

    it('should reject invalid paymentTermsDays', () => {
      const result = updateBillingSettingsSchema.safeParse({
        paymentTermsDays: 0,
      });
      assert.ok(!result.success);
    });

    it('should reject invalid taxRate', () => {
      const result = updateBillingSettingsSchema.safeParse({
        defaultTaxRate: 2,
      });
      assert.ok(!result.success);
    });
  });

  describe('billingHistoryQuerySchema', () => {
    it('should accept empty query', () => {
      const result = billingHistoryQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept with params', () => {
      const result = billingHistoryQuerySchema.safeParse({ page: 1, limit: 50 });
      assert.ok(result.success);
    });
  });
});
