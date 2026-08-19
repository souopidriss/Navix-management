import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createFuelSchema,
  updateFuelSchema,
  fuelQuerySchema,
  fuelIdParamSchema,
} from '../../src/modules/fuel/fuel.schema.js';

describe('Fuel Schemas', () => {
  describe('createFuelSchema', () => {
    const validMinimal = {
      vehicleId: '01ABCDEF123456789012345678',
      fuelType: 'diesel',
      quantity: 50,
      unitPrice: 600,
      mileage: 10000,
      stationName: 'TotalEnergies',
    };

    it('should accept valid minimal payload', () => {
      const result = createFuelSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
    });

    it('should accept full payload', () => {
      const result = createFuelSchema.safeParse({
        ...validMinimal,
        driverId: '01ABCDEF123456789012345679',
        tripId: '01ABCDEF12345678901234567A',
        stationName: 'TotalEnergies',
        stationCity: 'Douala',
        paymentMethod: 'fuel_card',
        invoiceNumber: 'FN-2026-001',
        notes: 'Plein routine',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing vehicleId', () => {
      const result = createFuelSchema.safeParse({ ...validMinimal, vehicleId: '' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing fuelType', () => {
      const result = createFuelSchema.safeParse({ ...validMinimal, fuelType: 'kerosene' });
      assert.strictEqual(result.success, false);
    });

    it('should reject quantity <= 0', () => {
      const result = createFuelSchema.safeParse({ ...validMinimal, quantity: 0 });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative unitPrice', () => {
      const result = createFuelSchema.safeParse({ ...validMinimal, unitPrice: -5 });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative mileage', () => {
      const result = createFuelSchema.safeParse({ ...validMinimal, mileage: -100 });
      assert.strictEqual(result.success, false);
    });

    it('should accept all fuel types', () => {
      for (const ft of ['diesel', 'essence', 'hybride', 'electrique']) {
        const result = createFuelSchema.safeParse({ ...validMinimal, fuelType: ft });
        assert.strictEqual(result.success, true, `fuelType ${ft} should be valid`);
      }
    });

    it('should default paymentMethod to cash', () => {
      const result = createFuelSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.paymentMethod, 'cash');
    });

    it('should reject invalid paymentMethod', () => {
      const result = createFuelSchema.safeParse({ ...validMinimal, paymentMethod: 'crypto' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('updateFuelSchema', () => {
    it('should accept empty update', () => {
      const result = updateFuelSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial update', () => {
      const result = updateFuelSchema.safeParse({ quantity: 100, unitPrice: 650 });
      assert.strictEqual(result.success, true);
    });

    it('should accept status update', () => {
      const result = updateFuelSchema.safeParse({ status: 'validated' });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid status', () => {
      const result = updateFuelSchema.safeParse({ status: 'unknown' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid fuelType', () => {
      const result = updateFuelSchema.safeParse({ fuelType: 'jet_fuel' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('fuelQuerySchema', () => {
    it('should apply defaults', () => {
      const result = fuelQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 20);
    });

    it('should coerce page and limit', () => {
      const result = fuelQuerySchema.safeParse({ page: '2', limit: '10' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 10);
    });

    it('should accept valid sort', () => {
      const result = fuelQuerySchema.safeParse({ sort: 'quantity' });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid sort', () => {
      const result = fuelQuerySchema.safeParse({ sort: 'secret_field' });
      assert.strictEqual(result.success, false);
    });

    it('should accept search term', () => {
      const result = fuelQuerySchema.safeParse({ search: 'Total' });
      assert.strictEqual(result.success, true);
    });

    it('should accept status filter', () => {
      const result = fuelQuerySchema.safeParse({ status: 'pending' });
      assert.strictEqual(result.success, true);
    });

    it('should accept fuelType filter', () => {
      const result = fuelQuerySchema.safeParse({ fuelType: 'diesel' });
      assert.strictEqual(result.success, true);
    });

    it('should reject limit > 100', () => {
      const result = fuelQuerySchema.safeParse({ limit: 200 });
      assert.strictEqual(result.success, false);
    });
  });

  describe('fuelIdParamSchema', () => {
    it('should accept valid ID', () => {
      const result = fuelIdParamSchema.safeParse({ id: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty ID', () => {
      const result = fuelIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });
  });
});
