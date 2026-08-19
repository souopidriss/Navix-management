import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  endAssignmentSchema,
  assignmentQuerySchema,
  assignmentIdParamSchema,
} from '../../src/modules/assignments/assignment.schema.js';

describe('Assignment Schemas', () => {
  describe('createAssignmentSchema', () => {
    it('should accept valid minimal assignment', () => {
      const data = {
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
      };
      const result = createAssignmentSchema.safeParse(data);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.assignmentType, 'temporary');
    });

    it('should accept valid full assignment', () => {
      const data = {
        agencyId: '01JA1B2C3D4E5F6G7H8J9K0L1M5',
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        assignmentType: 'permanent',
        startDate: '2026-08-01',
        expectedEndDate: '2027-08-01',
        startMileage: 41200,
        fuelLevelStart: 75,
        reason: 'Affectation permanente',
        destination: 'Douala',
        notes: 'Notes de test',
      };
      const result = createAssignmentSchema.safeParse(data);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.assignmentType, 'permanent');
    });

    it('should reject missing vehicleId', () => {
      const result = createAssignmentSchema.safeParse({
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing driverId', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        startDate: '2026-08-01',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing startDate', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid assignment type', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
        assignmentType: 'invalid_type',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid date format', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '01-08-2026',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject expectedEndDate before startDate', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
        expectedEndDate: '2026-07-01',
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept all valid assignment types', () => {
      const types = ['permanent', 'temporary', 'mission', 'replacement', 'maintenance', 'trial'];
      for (const type of types) {
        const result = createAssignmentSchema.safeParse({
          vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
          driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
          startDate: '2026-08-01',
          assignmentType: type,
        });
        assert.strictEqual(result.success, true, `Type ${type} should be valid`);
      }
    });

    it('should default assignmentType to temporary', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.assignmentType, 'temporary');
    });

    it('should accept startMileage as optional', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject fuelLevelStart > 100', () => {
      const result = createAssignmentSchema.safeParse({
        vehicleId: '01J9A2B3C4D5E6F7G8H9J0K1L3',
        driverId: '01J9N2P3Q4R5S6T7U8V9W0X1Y2Z3',
        startDate: '2026-08-01',
        fuelLevelStart: 150,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('updateAssignmentSchema', () => {
    it('should accept empty update', () => {
      const result = updateAssignmentSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial update', () => {
      const result = updateAssignmentSchema.safeParse({
        notes: 'Updated notes',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept all fields', () => {
      const result = updateAssignmentSchema.safeParse({
        assignmentType: 'mission',
        startDate: '2026-08-01',
        expectedEndDate: '2026-12-31',
        notes: 'Updated',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid assignmentType', () => {
      const result = updateAssignmentSchema.safeParse({
        assignmentType: 'invalid',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject expectedEndDate before startDate', () => {
      const result = updateAssignmentSchema.safeParse({
        startDate: '2026-08-01',
        expectedEndDate: '2026-07-01',
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('endAssignmentSchema', () => {
    it('should accept valid end payload', () => {
      const result = endAssignmentSchema.safeParse({
        endDate: '2026-09-01',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept full end payload', () => {
      const result = endAssignmentSchema.safeParse({
        endDate: '2026-09-01',
        endMileage: 45000,
        fuelLevelEnd: 50,
        reason: 'Mission terminée',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing endDate', () => {
      const result = endAssignmentSchema.safeParse({});
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid endDate format', () => {
      const result = endAssignmentSchema.safeParse({
        endDate: '01-09-2026',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject fuelLevelEnd > 100', () => {
      const result = endAssignmentSchema.safeParse({
        endDate: '2026-09-01',
        fuelLevelEnd: 150,
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative endMileage', () => {
      const result = endAssignmentSchema.safeParse({
        endDate: '2026-09-01',
        endMileage: -100,
      });
      assert.strictEqual(result.success, false);
    });
  });

  describe('assignmentQuerySchema', () => {
    it('should apply defaults', () => {
      const result = assignmentQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 20);
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should coerce page and limit to numbers', () => {
      const result = assignmentQuerySchema.safeParse({ page: '2', limit: '10' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 10);
    });

    it('should accept valid sort field', () => {
      const result = assignmentQuerySchema.safeParse({ sort: 'start_date' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.sort, 'start_date');
    });

    it('should reject invalid sort field', () => {
      const result = assignmentQuerySchema.safeParse({ sort: 'DROP TABLE' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid status filter', () => {
      const result = assignmentQuerySchema.safeParse({ status: 'active' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.status, 'active');
    });

    it('should accept search term', () => {
      const result = assignmentQuerySchema.safeParse({ search: 'Toyota' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.search, 'Toyota');
    });

    it('should reject limit > 100', () => {
      const result = assignmentQuerySchema.safeParse({ limit: 101 });
      assert.strictEqual(result.success, false);
    });

    it('should accept order ASC and DESC', () => {
      const asc = assignmentQuerySchema.safeParse({ order: 'ASC' });
      assert.strictEqual(asc.success, true);
      const desc = assignmentQuerySchema.safeParse({ order: 'DESC' });
      assert.strictEqual(desc.success, true);
    });

    it('should accept all valid status values', () => {
      const statuses = ['planned', 'active', 'completed', 'cancelled', 'suspended'];
      for (const status of statuses) {
        const result = assignmentQuerySchema.safeParse({ status });
        assert.strictEqual(result.success, true, `Status ${status} should be valid`);
      }
    });

    it('should accept all valid assignment type values', () => {
      const types = ['permanent', 'temporary', 'mission', 'replacement', 'maintenance', 'trial'];
      for (const type of types) {
        const result = assignmentQuerySchema.safeParse({ assignmentType: type });
        assert.strictEqual(result.success, true, `Type ${type} should be valid`);
      }
    });
  });

  describe('assignmentIdParamSchema', () => {
    it('should accept valid 26-char ID', () => {
      const result = assignmentIdParamSchema.safeParse({
        id: '01J9A2B3C4D5E6F7G8H9J0K1L3',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject short ID', () => {
      const result = assignmentIdParamSchema.safeParse({ id: 'short' });
      assert.strictEqual(result.success, false);
    });

    it('should reject long ID', () => {
      const result = assignmentIdParamSchema.safeParse({
        id: '01J9A2B3C4D5E6F7G8H9J0K1L3EXTRA',
      });
      assert.strictEqual(result.success, false);
    });
  });
});
