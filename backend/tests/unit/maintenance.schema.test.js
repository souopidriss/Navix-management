import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createMaintenanceSchema,
  updateMaintenanceSchema,
  maintenanceQuerySchema,
  maintenanceIdParamSchema,
} from '../../src/modules/maintenance/maintenance.schema.js';

describe('Maintenance Schemas', () => {
  describe('createMaintenanceSchema', () => {
    const validMinimal = {
      vehicleId: '01ABCDEF123456789012345678',
      maintenanceType: 'vidange',
      scheduledDate: '2026-09-01',
      description: 'Vidange huile moteur',
    };

    it('should accept valid minimal payload', () => {
      const result = createMaintenanceSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
    });

    it('should accept valid full payload', () => {
      const result = createMaintenanceSchema.safeParse({
        ...validMinimal,
        priority: 'high',
        status: 'in_progress',
        workshop: 'Atelier Central',
        mechanic: 'Jean Dupont',
        supplier: 'TotalParts',
        startedAt: '2026-08-20',
        completedAt: '2026-08-21',
        nextMaintenanceDate: '2026-12-01',
        mileage: 50000,
        nextMileage: 60000,
        estimatedCost: 150000,
        actualCost: 140000,
        currency: 'EUR',
        diagnostic: 'Usure normale',
        performedWork: 'Vidange complète',
        replacedParts: ['filtre_huile', 'huile_5w30'],
        attachments: [{ name: 'facture.pdf', size: 1024, type: 'application/pdf', category: 'invoice' }],
        notes: 'Véhicule en bon état',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing vehicleId', () => {
      const result = createMaintenanceSchema.safeParse({ ...validMinimal, vehicleId: '' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing maintenanceType', () => {
      const { maintenanceType, ...rest } = validMinimal;
      const result = createMaintenanceSchema.safeParse(rest);
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid maintenanceType', () => {
      const result = createMaintenanceSchema.safeParse({ ...validMinimal, maintenanceType: 'custom_type' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing scheduledDate', () => {
      const { scheduledDate, ...rest } = validMinimal;
      const result = createMaintenanceSchema.safeParse(rest);
      assert.strictEqual(result.success, false);
    });

    it('should reject missing description', () => {
      const { description, ...rest } = validMinimal;
      const result = createMaintenanceSchema.safeParse(rest);
      assert.strictEqual(result.success, false);
    });

    it('should reject negative mileage', () => {
      const result = createMaintenanceSchema.safeParse({ ...validMinimal, mileage: -100 });
      assert.strictEqual(result.success, false);
    });

    it('should reject negative cost', () => {
      const result = createMaintenanceSchema.safeParse({ ...validMinimal, actualCost: -5000 });
      assert.strictEqual(result.success, false);
    });

    it('should accept all 14 maintenance types', () => {
      const types = [
        'vidange', 'revision', 'controle_technique', 'freinage', 'pneumatiques',
        'batterie', 'moteur', 'transmission', 'suspension', 'climatisation',
        'carrosserie', 'reparation', 'inspection', 'autre',
      ];
      for (const mt of types) {
        const result = createMaintenanceSchema.safeParse({ ...validMinimal, maintenanceType: mt });
        assert.strictEqual(result.success, true, `maintenanceType ${mt} should be valid`);
      }
    });

    it('should accept all 4 priorities', () => {
      for (const p of ['low', 'normal', 'high', 'urgent']) {
        const result = createMaintenanceSchema.safeParse({ ...validMinimal, priority: p });
        assert.strictEqual(result.success, true, `priority ${p} should be valid`);
      }
    });

    it('should accept all 5 statuses', () => {
      for (const s of ['planned', 'pending', 'in_progress', 'completed', 'cancelled']) {
        const result = createMaintenanceSchema.safeParse({ ...validMinimal, status: s });
        assert.strictEqual(result.success, true, `status ${s} should be valid`);
      }
    });

    it('should default priority to normal', () => {
      const result = createMaintenanceSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.priority, 'normal');
    });

    it('should default status to planned', () => {
      const result = createMaintenanceSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.status, 'planned');
    });

    it('should default currency to XAF', () => {
      const result = createMaintenanceSchema.safeParse(validMinimal);
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.currency, 'XAF');
    });
  });

  describe('updateMaintenanceSchema', () => {
    it('should accept empty update (all optional)', () => {
      const result = updateMaintenanceSchema.safeParse({});
      assert.strictEqual(result.success, true);
    });

    it('should accept partial update', () => {
      const result = updateMaintenanceSchema.safeParse({ mileage: 55000, actualCost: 120000 });
      assert.strictEqual(result.success, true);
    });

    it('should accept all fields', () => {
      const result = updateMaintenanceSchema.safeParse({
        vehicleId: '01ABCDEF123456789012345678',
        maintenanceType: 'revision',
        priority: 'urgent',
        status: 'completed',
        workshop: 'Atelier Nord',
        mechanic: 'Paul Martin',
        supplier: 'AutoParts Inc',
        scheduledDate: '2026-09-15',
        startedAt: '2026-09-15',
        completedAt: '2026-09-16',
        nextMaintenanceDate: '2027-03-15',
        mileage: 60000,
        nextMileage: 70000,
        estimatedCost: 200000,
        actualCost: 180000,
        currency: 'EUR',
        description: 'Révision complète',
        diagnostic: 'RAS',
        performedWork: 'Révision générale',
        replacedParts: ['filtre_air', 'bougies'],
        attachments: [{ name: 'rapport.pdf', size: 2048, type: 'application/pdf', category: 'report' }],
        notes: 'Véhicule révisé',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid status', () => {
      const result = updateMaintenanceSchema.safeParse({ status: 'unknown_status' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid maintenanceType', () => {
      const result = updateMaintenanceSchema.safeParse({ maintenanceType: 'custom_maintenance' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('maintenanceQuerySchema', () => {
    it('should apply defaults', () => {
      const result = maintenanceQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should accept valid sort fields', () => {
      const sortFields = ['scheduled_date', 'actual_cost', 'mileage_at_service', 'priority', 'created_at', 'status'];
      for (const sort of sortFields) {
        const result = maintenanceQuerySchema.safeParse({ sort });
        assert.strictEqual(result.success, true, `sort ${sort} should be valid`);
      }
    });

    it('should reject invalid sort', () => {
      const result = maintenanceQuerySchema.safeParse({ sort: 'secret_field' });
      assert.strictEqual(result.success, false);
    });

    it('should accept status filter', () => {
      const result = maintenanceQuerySchema.safeParse({ status: 'completed' });
      assert.strictEqual(result.success, true);
    });

    it('should accept search', () => {
      const result = maintenanceQuerySchema.safeParse({ search: 'vidange' });
      assert.strictEqual(result.success, true);
    });

    it('should accept maintenanceType filter', () => {
      const result = maintenanceQuerySchema.safeParse({ maintenanceType: 'freinage' });
      assert.strictEqual(result.success, true);
    });
  });

  describe('maintenanceIdParamSchema', () => {
    it('should accept valid ID', () => {
      const result = maintenanceIdParamSchema.safeParse({ id: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty ID', () => {
      const result = maintenanceIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });
  });
});
