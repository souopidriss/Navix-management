import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  notificationIdParamSchema,
  notificationQuerySchema,
  createNotificationSchema,
  alertIdParamSchema,
  alertQuerySchema,
} from '../../src/modules/notifications/notification.schema.js';

describe('Notification Schemas', () => {
  describe('createNotificationSchema', () => {
    const validMinimal = {
      title: 'Test notification',
    };

    it('should accept valid minimal payload', () => {
      const result = createNotificationSchema.safeParse({ title: 'Test notification' });
      assert.strictEqual(result.success, true);
    });

    it('should accept valid full payload', () => {
      const result = createNotificationSchema.safeParse({
        userId: '01ABCDEF123456789012345678',
        title: 'Test notification',
        type: 'maintenance',
        category: 'warning',
        severity: 'high',
        message: 'Entretien bientôt dû',
        kind: 'maintenance_due_soon',
        entityType: 'maintenance',
        entityId: '01ABCDEF123456789012345678',
        metadata: { vehicleId: '01ABCDEF123456789012345678' },
        expiresAt: '2026-12-31T23:59:59.000Z',
      });
      assert.strictEqual(result.success, true);
    });

    it('should accept optional userId', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, userId: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject missing title', () => {
      const result = createNotificationSchema.safeParse({});
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid type', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, type: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid category', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, category: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid severity', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, severity: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should default type to system', () => {
      const result = createNotificationSchema.safeParse(validMinimal);
      assert.strictEqual(result.data.type, 'system');
    });

    it('should default category to info', () => {
      const result = createNotificationSchema.safeParse(validMinimal);
      assert.strictEqual(result.data.category, 'info');
    });

    it('should default severity to low', () => {
      const result = createNotificationSchema.safeParse(validMinimal);
      assert.strictEqual(result.data.severity, 'low');
    });

    it('should accept all valid types', () => {
      const types = ['system', 'maintenance', 'vehicle', 'driver', 'assignment', 'trip', 'fuel', 'document', 'billing', 'subscription', 'user', 'security', 'audit', 'report', 'incident', 'finance'];
      for (const t of types) {
        const result = createNotificationSchema.safeParse({ ...validMinimal, type: t });
        assert.strictEqual(result.success, true);
      }
    });

    it('should accept all valid severities', () => {
      for (const s of ['low', 'medium', 'high', 'critical']) {
        const result = createNotificationSchema.safeParse({ ...validMinimal, severity: s });
        assert.strictEqual(result.success, true);
      }
    });

    it('should accept all valid categories', () => {
      for (const c of ['info', 'success', 'warning', 'danger', 'reminder']) {
        const result = createNotificationSchema.safeParse({ ...validMinimal, category: c });
        assert.strictEqual(result.success, true);
      }
    });

    it('should reject invalid expiresAt format', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, expiresAt: 'not-a-date' });
      assert.strictEqual(result.success, false);
    });

    it('should accept valid expiresAt ISO format', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, expiresAt: '2026-12-31T23:59:59.000Z' });
      assert.strictEqual(result.success, true);
    });

    it('should accept null expiresAt', () => {
      const result = createNotificationSchema.safeParse({ ...validMinimal, expiresAt: null });
      assert.strictEqual(result.success, true);
    });
  });

  describe('notificationQuerySchema', () => {
    it('should apply defaults', () => {
      const result = notificationQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 50);
      assert.strictEqual(result.data.sort, 'created_at');
      assert.strictEqual(result.data.order, 'DESC');
    });

    it('should accept valid filters', () => {
      const result = notificationQuerySchema.safeParse({
        page: 2, limit: 10, sort: 'severity', order: 'ASC',
        status: 'unread', type: 'maintenance', severity: 'high', category: 'warning',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid sort', () => {
      const result = notificationQuerySchema.safeParse({ sort: 'invalid' });
      assert.strictEqual(result.success, false);
    });

    it('should reject invalid status', () => {
      const result = notificationQuerySchema.safeParse({ status: 'invalid' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('notificationIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = notificationIdParamSchema.safeParse({ id: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty id', () => {
      const result = notificationIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('alertIdParamSchema', () => {
    it('should accept valid id', () => {
      const result = alertIdParamSchema.safeParse({ id: '01ABCDEF123456789012345678' });
      assert.strictEqual(result.success, true);
    });

    it('should reject empty id', () => {
      const result = alertIdParamSchema.safeParse({ id: '' });
      assert.strictEqual(result.success, false);
    });
  });

  describe('alertQuerySchema', () => {
    it('should apply defaults', () => {
      const result = alertQuerySchema.safeParse({});
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.data.page, 1);
      assert.strictEqual(result.data.limit, 50);
    });

    it('should accept valid filters', () => {
      const result = alertQuerySchema.safeParse({
        page: 1, limit: 20, sort: 'severity', order: 'DESC',
        status: 'active', type: 'maintenance', severity: 'critical',
      });
      assert.strictEqual(result.success, true);
    });

    it('should reject invalid severity', () => {
      const result = alertQuerySchema.safeParse({ severity: 'invalid' });
      assert.strictEqual(result.success, false);
    });
  });
});
