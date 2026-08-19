import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createTripSchema,
  updateTripSchema,
  finishTripSchema,
  tripQuerySchema,
  tripIdParamSchema,
} from '../../src/modules/trips/trip.schema.js';

describe('Trip Schemas', () => {
  describe('createTripSchema', () => {
    it('should accept valid minimal trip', () => {
      const data = {
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
      };
      const result = createTripSchema.safeParse(data);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.tripType, 'mission');
    });

    it('should accept valid full trip', () => {
      const data = {
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        tripType: 'delivery',
        purpose: 'Livraison materiel',
        departureLocation: 'Douala - Siege',
        arrivalLocation: 'Yaounde - Agence',
        departureDate: '2026-08-15',
        departureTime: '08:00',
        arrivalDate: '2026-08-15',
        arrivalTime: '14:00',
        plannedDistance: 245,
        estimatedDuration: 240,
        departureMileage: 50000,
        passengerCount: 2,
        cargoWeight: 500,
        notes: 'Test notes',
      };
      const result = createTripSchema.safeParse(data);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.tripType, 'delivery');
      assert.strictEqual(result.data.plannedDistance, 245);
    });

    it('should reject missing assignmentId', () => {
      const result = createTripSchema.safeParse({
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing departureLocation', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing arrivalLocation', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        departureDate: '2026-08-15',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing departureDate', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid tripType', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
        tripType: 'invalid_type',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid date format', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '15-08-2026',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject arrivalDate before departureDate', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
        arrivalDate: '2026-08-10',
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept all valid trip types', () => {
      const types = ['mission', 'delivery', 'transport', 'service', 'maintenance', 'personnel', 'trial'];
      for (const type of types) {
        const result = createTripSchema.safeParse({
          assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
          departureLocation: 'Douala',
          arrivalLocation: 'Yaounde',
          departureDate: '2026-08-15',
          tripType: type,
        });
        assert.strictEqual(result.success, true, `Type ${type} should be valid`);
      }
    });

    it('should default tripType to mission', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.tripType, 'mission');
    });

    it('should default numeric fields to 0 or omit them', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
      });
      assert.strictEqual(result.success, true);
      assert.ok(result.data.plannedDistance === 0 || result.data.plannedDistance === undefined);
    });

    it('should reject negative plannedDistance', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
        plannedDistance: -10,
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative passengerCount', () => {
      const result = createTripSchema.safeParse({
        assignmentId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        departureLocation: 'Douala',
        arrivalLocation: 'Yaounde',
        departureDate: '2026-08-15',
        passengerCount: -1,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('updateTripSchema', () => {
    it('should accept empty update', () => {
      const result = updateTripSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial update', () => {
      const result = updateTripSchema.safeParse({
        notes: 'Updated notes',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept all fields', () => {
      const result = updateTripSchema.safeParse({
        tripType: 'delivery',
        purpose: 'Updated purpose',
        departureLocation: 'Kribi',
        arrivalLocation: 'Edea',
        departureDate: '2026-09-01',
        plannedDistance: 180,
        notes: 'Updated',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid tripType', () => {
      const result = updateTripSchema.safeParse({
        tripType: 'invalid',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject arrivalDate before departureDate', () => {
      const result = updateTripSchema.safeParse({
        departureDate: '2026-08-15',
        arrivalDate: '2026-08-10',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('finishTripSchema', () => {
    it('should accept valid minimal finish', () => {
      const result = finishTripSchema.safeParse({
        arrivalDate: '2026-08-15',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept full finish payload', () => {
      const result = finishTripSchema.safeParse({
        arrivalDate: '2026-08-15',
        arrivalTime: '14:30',
        actualDistance: 250,
        arrivalMileage: 50250,
        actualDuration: 210,
        notes: 'Trajet termine sans incident',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.actualDistance, 250);
      assert.strictEqual(result.data.arrivalMileage, 50250);
    });

    it('should reject missing arrivalDate', () => {
      const result = finishTripSchema.safeParse({});
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid arrivalDate format', () => {
      const result = finishTripSchema.safeParse({
        arrivalDate: '15-08-2026',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative actualDistance', () => {
      const result = finishTripSchema.safeParse({
        arrivalDate: '2026-08-15',
        actualDistance: -10,
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative arrivalMileage', () => {
      const result = finishTripSchema.safeParse({
        arrivalDate: '2026-08-15',
        arrivalMileage: -100,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('tripQuerySchema', () => {
    it('should apply defaults', () => {
      const result = tripQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 20);
      assert.strictEqual(result.data.sort, 'departure_date');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should coerce page and limit to numbers', () => {
      const result = tripQuerySchema.safeParse({ page: '2', limit: '10' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 10);
    });

    it('should accept valid sort field', () => {
      const result = tripQuerySchema.safeParse({ sort: 'departure_date' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.sort, 'departure_date');
    });

    it('should reject invalid sort field', () => {
      const result = tripQuerySchema.safeParse({ sort: 'DROP TABLE' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid status filter', () => {
      const result = tripQuerySchema.safeParse({ status: 'planned' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.status, 'planned');
    });

    it('should accept search term', () => {
      const result = tripQuerySchema.safeParse({ search: 'Douala' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.search, 'Douala');
    });

    it('should reject limit > 100', () => {
      const result = tripQuerySchema.safeParse({ limit: 101 });
      assert.strictEqual(result.success, false);
    });

    it('should accept all valid status values', () => {
      const statuses = ['planned', 'in_progress', 'completed', 'cancelled', 'suspended'];
      for (const status of statuses) {
        const result = tripQuerySchema.safeParse({ status });
        assert.strictEqual(result.success, true, `Status ${status} should be valid`);
      }
    });

    it('should accept all valid trip type values', () => {
      const types = ['mission', 'delivery', 'transport', 'service', 'maintenance', 'personnel', 'trial'];
      for (const type of types) {
        const result = tripQuerySchema.safeParse({ tripType: type });
        assert.strictEqual(result.success, true, `Type ${type} should be valid`);
      }
    });
  });

  describe('tripIdParamSchema', () => {
    it('should accept valid non-empty ID', () => {
      const result = tripIdParamSchema.safeParse({
        id: '01J9A2B3C4D5E6F7G8H9J0K1L3',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty ID', () => {
      const result = tripIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });

    it('should accept any non-empty string', () => {
      const result = tripIdParamSchema.safeParse({ id: 'any-id-here' });
      assert.strictEqual(result.success, true);
    });
  });
});
