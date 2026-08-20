import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createSubscriptionSchema, subscriptionIdParamSchema, subscriptionQuerySchema,
  changePlanSchema, cancelSubscriptionSchema, planIdParamSchema,
  companyIdParamSchema, createPlanSchema, updatePlanSchema,
} from '../../src/modules/subscriptions/subscription.schema.js';

describe('Subscription Schemas', () => {

  describe('createSubscriptionSchema', () => {
    it('should accept valid payload', () => {
      const result = createSubscriptionSchema.safeParse({
        companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1',
      });
      assert.ok(result.success);
      assert.strictEqual(result.data.billingInterval, 'monthly');
    });

    it('should accept with billingInterval yearly', () => {
      const result = createSubscriptionSchema.safeParse({
        companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
        planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1',
        billingInterval: 'yearly',
      });
      assert.ok(result.success);
    });

    it('should reject missing companyId', () => {
      const result = createSubscriptionSchema.safeParse({ planId: 'abc' });
      assert.ok(!result.success);
    });

    it('should reject missing planId', () => {
      const result = createSubscriptionSchema.safeParse({ companyId: 'abc' });
      assert.ok(!result.success);
    });

    it('should reject invalid billingInterval', () => {
      const result = createSubscriptionSchema.safeParse({
        companyId: 'a', planId: 'b', billingInterval: 'weekly',
      });
      assert.ok(!result.success);
    });

    it('should default billingInterval to monthly', () => {
      const result = createSubscriptionSchema.safeParse({
        companyId: 'a', planId: 'b',
      });
      assert.ok(result.success);
      assert.strictEqual(result.data.billingInterval, 'monthly');
    });
  });

  describe('subscriptionIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = subscriptionIdParamSchema.safeParse({ id: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject missing id', () => {
      const result = subscriptionIdParamSchema.safeParse({});
      assert.ok(!result.success);
    });

    it('should reject empty id', () => {
      const result = subscriptionIdParamSchema.safeParse({ id: '' });
      assert.ok(!result.success);
    });
  });

  describe('changePlanSchema', () => {
    it('should accept valid planId', () => {
      const result = changePlanSchema.safeParse({ planId: '01JT0B2C3D4E5F6G7H8J9K0L1M2' });
      assert.ok(result.success);
    });

    it('should reject missing planId', () => {
      const result = changePlanSchema.safeParse({});
      assert.ok(!result.success);
    });

    it('should reject empty planId', () => {
      const result = changePlanSchema.safeParse({ planId: '' });
      assert.ok(!result.success);
    });
  });

  describe('cancelSubscriptionSchema', () => {
    it('should accept empty payload', () => {
      const result = cancelSubscriptionSchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept with reason', () => {
      const result = cancelSubscriptionSchema.safeParse({ reason: 'Plus besoin' });
      assert.ok(result.success);
    });

    it('should reject reason too long', () => {
      const result = cancelSubscriptionSchema.safeParse({ reason: 'x'.repeat(501) });
      assert.ok(!result.success);
    });
  });

  describe('subscriptionQuerySchema', () => {
    it('should accept empty query', () => {
      const result = subscriptionQuerySchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept full query', () => {
      const result = subscriptionQuerySchema.safeParse({
        page: 1, limit: 20, sort: 'created_at', order: 'DESC',
        status: 'active', planId: 'abc', billingInterval: 'monthly', search: 'test',
        companyScopeId: '01J8A2B3C4D5E6F7G8H9J0K1L2',
      });
      assert.ok(result.success);
    });

    it('should reject invalid status', () => {
      const result = subscriptionQuerySchema.safeParse({ status: 'invalid' });
      assert.ok(!result.success);
    });

    it('should reject invalid sort', () => {
      const result = subscriptionQuerySchema.safeParse({ sort: 'invalid' });
      assert.ok(!result.success);
    });

    it('should reject invalid order', () => {
      const result = subscriptionQuerySchema.safeParse({ order: 'UP' });
      assert.ok(!result.success);
    });
  });

  describe('planIdParamSchema', () => {
    it('should accept valid planId', () => {
      const result = planIdParamSchema.safeParse({ planId: '01JT0A1B2C3D4E5F6G7H8J9K0L1' });
      assert.ok(result.success);
    });

    it('should reject missing planId', () => {
      const result = planIdParamSchema.safeParse({});
      assert.ok(!result.success);
    });
  });

  describe('companyIdParamSchema', () => {
    it('should accept valid companyId', () => {
      const result = companyIdParamSchema.safeParse({ companyId: '01J8A2B3C4D5E6F7G8H9J0K1L2' });
      assert.ok(result.success);
    });

    it('should reject missing companyId', () => {
      const result = companyIdParamSchema.safeParse({});
      assert.ok(!result.success);
    });
  });

  describe('createPlanSchema', () => {
    it('should accept valid plan', () => {
      const result = createPlanSchema.safeParse({
        name: 'Test Plan', code: 'test',
      });
      assert.ok(result.success);
    });

    it('should accept full plan', () => {
      const result = createPlanSchema.safeParse({
        name: 'Pro', code: 'pro', displayName: 'Professionnel',
        description: 'Plan pro', priceMonthly: 50000, priceYearly: 500000,
        currency: 'XAF', maxVehicles: 50, maxDrivers: 30, maxUsers: 15,
        maxAgencies: 10, maxDocuments: 1000, maxStorageGb: 20,
        maxTripsPerMonth: 5000, maxFuelRecordsPerMonth: 2500,
        maxMaintenanceRecordsPerMonth: 1000,
        features: ['vehicles', 'drivers'], trialDays: 14,
        isPopular: true, sortOrder: 2,
      });
      assert.ok(result.success);
    });

    it('should reject missing name', () => {
      const result = createPlanSchema.safeParse({ code: 'test' });
      assert.ok(!result.success);
    });

    it('should reject missing code', () => {
      const result = createPlanSchema.safeParse({ name: 'Test' });
      assert.ok(!result.success);
    });

    it('should reject negative price', () => {
      const result = createPlanSchema.safeParse({
        name: 'Test', code: 'test', priceMonthly: -100,
      });
      assert.ok(!result.success);
    });
  });

  describe('updatePlanSchema', () => {
    it('should accept empty update', () => {
      const result = updatePlanSchema.safeParse({});
      assert.ok(result.success);
    });

    it('should accept partial update', () => {
      const result = updatePlanSchema.safeParse({ name: 'Updated' });
      assert.ok(result.success);
    });

    it('should accept full update', () => {
      const result = updatePlanSchema.safeParse({
        name: 'Pro', code: 'pro', priceMonthly: 75000,
      });
      assert.ok(result.success);
    });
  });
});
