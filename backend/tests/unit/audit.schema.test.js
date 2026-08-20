import { describe, it } from 'node:test';
import assert from 'node:assert';
import { auditQuerySchema, auditIdParamSchema } from '../../src/modules/audit/audit.schema.js';
import {
  AUDIT_ACTION_VALUES,
  AUDIT_ACTION_TYPE_VALUES,
  AUDIT_RESOURCE_VALUES,
  AUDIT_STATUS_VALUES,
  AUDIT_SEVERITY_VALUES,
} from '../../src/modules/audit/index.js';

describe('Audit Schemas', () => {
  describe('auditQuerySchema', () => {
    it('should apply defaults', () => {
      const result = auditQuerySchema.parse({});
      assert.strictEqual(result.page, 1);
      assert.strictEqual(result.limit, 20);
      assert.strictEqual(result.order, 'DESC');
      assert.strictEqual(result.search, '');
    });

    it('should coerce page and limit to numbers', () => {
      const result = auditQuerySchema.parse({ page: '3', limit: '50' });
      assert.strictEqual(result.page, 3);
      assert.strictEqual(result.limit, 50);
    });

    it('should accept valid sort field', () => {
      const result = auditQuerySchema.parse({ sort: 'action' });
      assert.strictEqual(result.sort, 'action');
    });

    it('should reject invalid sort field', () => {
      const result = auditQuerySchema.safeParse({ sort: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid order', () => {
      assert.strictEqual(auditQuerySchema.parse({ order: 'ASC' }).order, 'ASC');
      assert.strictEqual(auditQuerySchema.parse({ order: 'DESC' }).order, 'DESC');
    });

    it('should reject limit > 100', () => {
      const result = auditQuerySchema.safeParse({ limit: 101 });
      assert.strictEqual(result.success, false);
    });

    it('should accept search term', () => {
      const result = auditQuerySchema.parse({ search: 'login' });
      assert.strictEqual(result.search, 'login');
    });

    it('should accept valid action filter', () => {
      const result = auditQuerySchema.parse({ action: 'CREATE' });
      assert.strictEqual(result.action, 'CREATE');
    });

    it('should reject invalid action', () => {
      const result = auditQuerySchema.safeParse({ action: 'INVALID_ACTION' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid actionType filter', () => {
      const result = auditQuerySchema.parse({ actionType: 'authentication' });
      assert.strictEqual(result.actionType, 'authentication');
    });

    it('should reject invalid actionType', () => {
      const result = auditQuerySchema.safeParse({ actionType: 'bad_type' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid resourceType filter', () => {
      const result = auditQuerySchema.parse({ resourceType: 'vehicle' });
      assert.strictEqual(result.resourceType, 'vehicle');
    });

    it('should reject invalid resourceType', () => {
      const result = auditQuerySchema.safeParse({ resourceType: 'nonexistent' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid status filter', () => {
      const result = auditQuerySchema.parse({ status: 'success' });
      assert.strictEqual(result.status, 'success');
    });

    it('should reject invalid status', () => {
      const result = auditQuerySchema.safeParse({ status: 'unknown' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid severity filter', () => {
      const result = auditQuerySchema.parse({ severity: 'high' });
      assert.strictEqual(result.severity, 'high');
    });

    it('should reject invalid severity', () => {
      const result = auditQuerySchema.safeParse({ severity: 'mega' });
      assert.strictEqual(result.success, false);
    });

    it('should accept dateFrom and dateTo', () => {
      const result = auditQuerySchema.parse({ dateFrom: '2026-01-01', dateTo: '2026-12-31' });
      assert.strictEqual(result.dateFrom, '2026-01-01');
      assert.strictEqual(result.dateTo, '2026-12-31');
    });

    it('should accept userId filter', () => {
      const result = auditQuerySchema.parse({ userId: '01ABC123DEF4567890123456' });
      assert.strictEqual(result.userId, '01ABC123DEF4567890123456');
    });

    it('should accept entityId filter', () => {
      const result = auditQuerySchema.parse({ entityId: '01XYZ789' });
      assert.strictEqual(result.entityId, '01XYZ789');
    });

    it('should accept all valid action values', () => {
      for (const action of AUDIT_ACTION_VALUES) {
        const result = auditQuerySchema.parse({ action });
        assert.strictEqual(result.action, action);
      }
    });

    it('should accept all valid actionType values', () => {
      for (const actionType of AUDIT_ACTION_TYPE_VALUES) {
        const result = auditQuerySchema.parse({ actionType });
        assert.strictEqual(result.actionType, actionType);
      }
    });

    it('should accept all valid resourceType values', () => {
      for (const resourceType of AUDIT_RESOURCE_VALUES) {
        const result = auditQuerySchema.parse({ resourceType });
        assert.strictEqual(result.resourceType, resourceType);
      }
    });

    it('should accept all valid status values', () => {
      for (const status of AUDIT_STATUS_VALUES) {
        const result = auditQuerySchema.parse({ status });
        assert.strictEqual(result.status, status);
      }
    });

    it('should accept all valid severity values', () => {
      for (const severity of AUDIT_SEVERITY_VALUES) {
        const result = auditQuerySchema.parse({ severity });
        assert.strictEqual(result.severity, severity);
      }
    });
  });

  describe('auditIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = auditIdParamSchema.parse({ id: '01ABCDEF1234567890123456' });
      assert.strictEqual(result.id, '01ABCDEF1234567890123456');
    });

    it('should reject empty id', () => {
      const result = auditIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });

    it('should reject missing id', () => {
      const result = auditIdParamSchema.safeParse({});
      assert.strictEqual(result.success, false);
    });
  });
});
