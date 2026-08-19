import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema,
  vehicleIdParamSchema,
} from '../../src/modules/vehicles/vehicle.schema.js';

describe('Vehicle Schemas', () => {
  describe('createVehicleSchema', () => {
    it('should accept valid minimal vehicle', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept valid full vehicle', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        vin: '1HGBH41JXMN109186',
        engineNumber: 'ENG-001',
        brand: 'Toyota',
        model: 'Corolla',
        version: 'XLE',
        year: 2023,
        color: 'Blanc',
        fuelType: 'diesel',
        transmission: 'automatique',
        capacity: 5,
        mileage: 12000,
        groupCode: 'B',
        category: 'Berline',
        status: 'available',
        purchaseDate: '2023-06-15',
        purchasePrice: 15000000,
        insuranceExpiry: '2024-06-15',
        inspectionExpiry: '2024-03-20',
        registrationExpiry: '2024-12-31',
        notes: 'Vehicule neuf',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing registrationNumber', () => {
      const result = createVehicleSchema.safeParse({
        brand: 'Toyota',
        model: 'Corolla',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing brand', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        model: 'Corolla',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing model', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid fuel type', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        fuelType: 'kerosene',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid transmission', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        transmission: 'semi-auto',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid group code', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        groupCode: 'H',
      });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid VIN length', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        vin: '12345',
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid VIN (17 chars)', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        vin: '1HGBH41JXMN109186',
      });
      assert.strictEqual(result.success, true);
    });

    it('should default fuelType to diesel', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.fuelType, 'diesel');
    });

    it('should default transmission to manuelle', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.transmission, 'manuelle');
    });

    it('should default status to available', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
      });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.status, 'available');
    });

    it('should reject year before 1980', () => {
      const result = createVehicleSchema.safeParse({
        registrationNumber: 'AB-123-CD',
        brand: 'Toyota',
        model: 'Corolla',
        year: 1979,
      });
      assert.strictEqual(result.success, false);
    });

    it('should accept all 4 fuel types', () => {
      const fuels = ['diesel', 'essence', 'hybride', 'electrique'];
      for (const fuel of fuels) {
        const result = createVehicleSchema.safeParse({
          registrationNumber: 'AB-123-CD',
          brand: 'Toyota',
          model: 'Corolla',
          fuelType: fuel,
        });
        assert.strictEqual(result.success, true);
      }
    });

    it('should accept all 4 statuses', () => {
      const statuses = ['available', 'in_use', 'maintenance', 'out_of_service'];
      for (const status of statuses) {
        const result = createVehicleSchema.safeParse({
          registrationNumber: 'AB-123-CD',
          brand: 'Toyota',
          model: 'Corolla',
          status,
        });
        assert.strictEqual(result.success, true);
      }
    });
  });

  describe('updateVehicleSchema', () => {
    it('should accept empty update (all fields optional)', () => {
      const result = updateVehicleSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial update', () => {
      const result = updateVehicleSchema.safeParse({
        brand: 'Renault',
        mileage: 50000,
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept all fields', () => {
      const result = updateVehicleSchema.safeParse({
        registrationNumber: 'CD-456-EF',
        vin: '1HGBH41JXMN109186',
        brand: 'Renault',
        model: 'Clio',
        year: 2022,
        fuelType: 'essence',
        transmission: 'manuelle',
        status: 'in_use',
        mileage: 50000,
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept isActive boolean', () => {
      const result = updateVehicleSchema.safeParse({ isActive: true });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.isActive, true);
    });

    it('should accept null values for optional fields', () => {
      const result = updateVehicleSchema.safeParse({
        vin: null,
        color: null,
        notes: null,
      });
      assert.strictEqual(result.success, true);
    });
  });

  describe('vehicleQuerySchema', () => {
    it('should apply defaults', () => {
      const result = vehicleQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 20);
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should coerce page and limit to numbers', () => {
      const result = vehicleQuerySchema.safeParse({ page: '2', limit: '10' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 2);
      assert.strictEqual(result.data.limit, 10);
    });

    it('should accept valid sort field', () => {
      const result = vehicleQuerySchema.safeParse({ sort: 'brand' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.sort, 'brand');
    });

    it('should reject invalid sort field', () => {
      const result = vehicleQuerySchema.safeParse({ sort: 'DROP TABLE' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid status filter', () => {
      const result = vehicleQuerySchema.safeParse({ status: 'available' });
      assert.strictEqual(result.success, true);
    });

    it('should accept search term', () => {
      const result = vehicleQuerySchema.safeParse({ search: 'Toyota' });
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.search, 'Toyota');
    });

    it('should reject limit > 100', () => {
      const result = vehicleQuerySchema.safeParse({ limit: 200 });
      assert.strictEqual(result.success, false);
    });

    it('should accept order ASC and DESC', () => {
      assert.strictEqual(vehicleQuerySchema.safeParse({ order: 'ASC' }).success, true);
      assert.strictEqual(vehicleQuerySchema.safeParse({ order: 'DESC' }).success, true);
      assert.strictEqual(vehicleQuerySchema.safeParse({ order: 'asc' }).success, true);
      assert.strictEqual(vehicleQuerySchema.safeParse({ order: 'desc' }).success, true);
    });
  });

  describe('vehicleIdParamSchema', () => {
    it('should accept valid 26-char ID', () => {
      const id = '01HXYZ1234567890ABCDEF12AB';
      const result = vehicleIdParamSchema.safeParse({ id });
      assert.strictEqual(result.success, true);
    });

    it('should reject short ID', () => {
      const result = vehicleIdParamSchema.safeParse({ id: 'short' });
      assert.strictEqual(result.success, false);
    });

    it('should reject long ID', () => {
      const result = vehicleIdParamSchema.safeParse({ id: '01HXYZ1234567890ABCDEF12345' });
      assert.strictEqual(result.success, false);
    });
  });
});
