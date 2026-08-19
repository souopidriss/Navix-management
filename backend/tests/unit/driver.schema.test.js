import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createDriverSchema,
  updateDriverSchema,
  driverQuerySchema,
  driverIdParamSchema,
} from '../../src/modules/drivers/driver.schema.js';

describe('Driver Schemas', () => {
  describe('createDriverSchema', () => {
    it('should accept valid minimal driver', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept valid full driver', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        gender: 'male',
        birthDate: '1990-05-15',
        phone: '+237690000000',
        email: 'jean.dupont@test.com',
        address: '123 Rue Principale',
        city: 'Douala',
        country: 'Cameroun',
        nationality: 'Camerounaise',
        licenseNumber: 'LIC-12345',
        licenseCategory: 'B',
        licenseIssueDate: '2020-01-15',
        licenseExpiryDate: '2025-01-15',
        yearsExperience: 5,
        employeeCode: 'DRV-001',
        status: 'active',
        availability: 'available',
        notes: 'Chauffeur expérimenté',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing firstName', () => {
      const result = createDriverSchema.safeParse({
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing lastName', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing employeeCode', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid gender', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
        gender: 'autre',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid license category', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
        licenseCategory: 'Z',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid status', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
        status: 'invalid',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid availability', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
        availability: 'invalid',
      });
      assert.strictEqual(result.success, false);
    });

    it('should default status to active', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.status, 'active');
    });

    it('should default availability to available', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.availability, 'available');
    });

    it('should default country to Cameroun', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.country, 'Cameroun');
    });

    it('should default yearsExperience to 0', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.yearsExperience, 0);
    });

    it('should reject invalid email', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
        email: 'invalid',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid date format', () => {
      const result = createDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        employeeCode: 'DRV-001',
        birthDate: '15/05/1990',
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept all valid genders', () => {
      const genders = ['male', 'female', 'other'];
      for (const gender of genders) {
        const result = createDriverSchema.safeParse({
          firstName: 'Jean',
          lastName: 'Dupont',
          employeeCode: 'DRV-001',
          gender,
        });
        assert.strictEqual(result.success, true);
      }
    });

    it('should accept all valid license categories', () => {
      const categories = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      for (const cat of categories) {
        const result = createDriverSchema.safeParse({
          firstName: 'Jean',
          lastName: 'Dupont',
          employeeCode: 'DRV-001',
          licenseCategory: cat,
        });
        assert.strictEqual(result.success, true);
      }
    });

    it('should accept all valid statuses', () => {
      const statuses = ['active', 'on_mission', 'available', 'suspended', 'on_leave', 'inactive'];
      for (const status of statuses) {
        const result = createDriverSchema.safeParse({
          firstName: 'Jean',
          lastName: 'Dupont',
          employeeCode: 'DRV-001',
          status,
        });
        assert.strictEqual(result.success, true);
      }
    });
  });

  describe('updateDriverSchema', () => {
    it('should accept empty update (all fields optional)', () => {
      const result = updateDriverSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial update', () => {
      const result = updateDriverSchema.safeParse({
        firstName: 'Pierre',
        yearsExperience: 10,
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept all fields', () => {
      const result = updateDriverSchema.safeParse({
        firstName: 'Jean',
        lastName: 'Dupont',
        gender: 'male',
        birthDate: '1990-05-15',
        phone: '+237690000000',
        email: 'jean@test.com',
        status: 'active',
        availability: 'available',
        yearsExperience: 5,
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept isActive boolean', () => {
      const result = updateDriverSchema.safeParse({ isActive: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.isActive, true);
    });

    it('should accept null values for optional fields', () => {
      const result = updateDriverSchema.safeParse({
        phone: null,
        email: null,
        notes: null,
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('driverQuerySchema', () => {
    it('should apply defaults', () => {
      const result = driverQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 20);
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should coerce page and limit to numbers', () => {
      const result = driverQuerySchema.safeParse({ page: '2', limit: '10' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 10);
    });

    it('should accept valid sort field', () => {
      const result = driverQuerySchema.safeParse({ sort: 'first_name' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.sort, 'first_name');
    });

    it('should reject invalid sort field', () => {
      const result = driverQuerySchema.safeParse({ sort: 'DROP TABLE' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid status filter', () => {
      const result = driverQuerySchema.safeParse({ status: 'active' });
      assert.strictEqual(result.success, true);
    });

    it('should accept search term', () => {
      const result = driverQuerySchema.safeParse({ search: 'Jean' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.search, 'Jean');
    });

    it('should reject limit > 100', () => {
      const result = driverQuerySchema.safeParse({ limit: 200 });
      assert.strictEqual(result.success, false);
    });

    it('should accept order ASC and DESC', () => {
      assert.strictEqual(driverQuerySchema.safeParse({ order: 'ASC' }).success, true);
      assert.strictEqual(driverQuerySchema.safeParse({ order: 'DESC' }).success, true);
      assert.strictEqual(driverQuerySchema.safeParse({ order: 'asc' }).success, true);
      assert.strictEqual(driverQuerySchema.safeParse({ order: 'desc' }).success, true);
    });
  });

  describe('driverIdParamSchema', () => {
    it('should accept valid 26-char ID', () => {
      const id = '01HXYZ1234567890ABCDEF12AB';
      const result = driverIdParamSchema.safeParse({ id });
      assert.strictEqual(result.success, true);
    });

    it('should reject short ID', () => {
      const result = driverIdParamSchema.safeParse({ id: 'short' });
      assert.strictEqual(result.success, false);
    });

    it('should reject long ID', () => {
      const result = driverIdParamSchema.safeParse({ id: '01HXYZ1234567890ABCDEF12345' });
      assert.strictEqual(result.success, false);
    });
  });
});
