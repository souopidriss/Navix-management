import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../../src/app.js';
import { createPool, closePool, getPool } from '../../src/database/index.js';

const PORT = 8107;
const BASE_URL = `http://localhost:${PORT}/api/v1`;
let server;

async function req(method, path, body, headers = {}) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => null);
  return { status: res.status, data };
}

before(async () => {
  createPool();
  await new Promise((resolve) => { server = app.listen(PORT, resolve); });
  const pool = getPool();
  await pool.query('DELETE FROM notifications WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['NotifIntTest%']);
  await pool.query('DELETE FROM alerts WHERE company_id IN (SELECT id FROM companies WHERE name LIKE ?)', ['NotifIntTest%']);
  await pool.query('DELETE FROM companies WHERE name LIKE ?', ['NotifIntTest%']);
  await pool.query('DELETE FROM users WHERE email LIKE ?', ['%notif_inttest%']);
});

after(async () => {
  if (server) server.close();
  await closePool();
});

describe('Notifications Integration', () => {
  let tokenA, tokenB, companyIdA, userIdA;

  before(async () => {
    const ts = Date.now();

    const reg1 = await req('POST', '/auth/register', {
      firstName: 'Notif', lastName: 'AdminA',
      email: `notif_inttest_a${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'NotifIntTest Corp A', role: 'client_enterprise',
    });
    assert.strictEqual(reg1.status, 201);
    tokenA = reg1.data.data.tokens.accessToken;
    companyIdA = reg1.data.data.company.id;
    userIdA = reg1.data.data.user.id;

    const reg2 = await req('POST', '/auth/register', {
      firstName: 'Notif', lastName: 'AdminB',
      email: `notif_inttest_b${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
      companyName: 'NotifIntTest Corp B', role: 'client_enterprise',
    });
    assert.strictEqual(reg2.status, 201);
    tokenB = reg2.data.data.tokens.accessToken;
  });

  describe('Notification CRUD', () => {
    let notificationId;

    it('should create a notification for authenticated user', async () => {
      const res = await req('POST', '/notifications', {
        type: 'maintenance',
        category: 'warning',
        severity: 'medium',
        title: 'Entretien bientôt dû',
        message: 'Vidange prévue dans 5 jours',
        kind: 'maintenance_due_soon',
        entityType: 'maintenance',
        entityId: '01ABCDEF123456789012345678',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.data.success, true);
      assert.ok(res.data.data.id);
      assert.strictEqual(res.data.data.type, 'maintenance');
      assert.strictEqual(res.data.data.category, 'warning');
      assert.strictEqual(res.data.data.severity, 'medium');
      assert.strictEqual(res.data.data.status, 'unread');
      assert.strictEqual(res.data.data.isRead, false);
      assert.strictEqual(res.data.data.readAt, null);
      assert.strictEqual(res.data.data.userId, userIdA);
      notificationId = res.data.data.id;
    });

    it('should create a second notification', async () => {
      const res = await req('POST', '/notifications', {
        type: 'document',
        category: 'danger',
        severity: 'high',
        title: 'Document expiré',
        message: 'Assurance expirée',
        kind: 'document_expired',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
    });

    it('should prevent duplicate by kind+entity (idempotence)', async () => {
      const res = await req('POST', '/notifications', {
        type: 'maintenance',
        category: 'warning',
        severity: 'medium',
        title: 'Entretien bientôt dû',
        kind: 'maintenance_due_soon',
        entityType: 'maintenance',
        entityId: '01ABCDEF123456789012345678',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data, null);
    });

    it('should list notifications for user A', async () => {
      const res = await req('GET', '/notifications', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.notifications));
      assert.ok(res.data.data.total >= 2);
      assert.ok(res.data.data.totalPages >= 1);
    });

    it('should get notification by id', async () => {
      const res = await req('GET', `/notifications/${notificationId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, notificationId);
      assert.strictEqual(res.data.data.title, 'Entretien bientôt dû');
    });

    it('should return 404 for unknown notification', async () => {
      const res = await req('GET', '/notifications/01ZZZZZZZZZZZZZZZZZZZZZZZZ', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should not see other user notifications', async () => {
      const res = await req('GET', `/notifications/${notificationId}`, null, {
        Authorization: `Bearer ${tokenB}`,
      });
      assert.strictEqual(res.status, 404);
    });

    it('should return unread count', async () => {
      const res = await req('GET', '/notifications/unread-count', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.count === 'number');
      assert.ok(res.data.data.count >= 2);
    });

    it('should mark notification as read', async () => {
      const res = await req('PATCH', `/notifications/${notificationId}/read`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'read');
      assert.strictEqual(res.data.data.isRead, true);
      assert.ok(res.data.data.readAt);
    });

    it('should be idempotent for mark as read', async () => {
      const res = await req('PATCH', `/notifications/${notificationId}/read`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'read');
    });

    it('should mark notification as unread', async () => {
      const res = await req('PATCH', `/notifications/${notificationId}/unread`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'unread');
      assert.strictEqual(res.data.data.isRead, false);
      assert.strictEqual(res.data.data.readAt, null);
    });

    it('should mark all as read (PATCH)', async () => {
      const res = await req('PATCH', '/notifications/read-all', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(res.data.data.count >= 1);
    });

    it('should archive notification', async () => {
      const createRes = await req('POST', '/notifications', {
        type: 'system',
        category: 'info',
        severity: 'low',
        title: 'Test archive',
      }, { Authorization: `Bearer ${tokenA}` });
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/notifications/${id}/archive`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'archived');
      assert.strictEqual(res.data.data.isRead, true);
    });

    it('should dismiss notification', async () => {
      const createRes = await req('POST', '/notifications', {
        type: 'system',
        category: 'info',
        severity: 'low',
        title: 'Test dismiss',
      }, { Authorization: `Bearer ${tokenA}` });
      const id = createRes.data.data.id;

      const res = await req('PATCH', `/notifications/${id}/dismiss`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'dismissed');
    });

    it('should soft-delete notification', async () => {
      const createRes = await req('POST', '/notifications', {
        type: 'system',
        category: 'info',
        severity: 'low',
        title: 'Test delete',
      }, { Authorization: `Bearer ${tokenA}` });
      const id = createRes.data.data.id;

      const res = await req('DELETE', `/notifications/${id}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, id);

      const getRes = await req('GET', `/notifications/${id}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(getRes.status, 404);
    });
  });

  describe('Statistics', () => {
    it('should return notification statistics', async () => {
      const res = await req('GET', '/notifications/statistics', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.totalCount === 'number');
      assert.ok(typeof res.data.data.unreadCount === 'number');
      assert.ok(typeof res.data.data.readCount === 'number');
      assert.ok(typeof res.data.data.archivedCount === 'number');
      assert.ok(typeof res.data.data.dismissedCount === 'number');
      assert.ok(typeof res.data.data.criticalUnread === 'number');
      assert.ok(typeof res.data.data.highUnread === 'number');
    });
  });

  describe('Alert Rules', () => {
    it('should return alert rules', async () => {
      const res = await req('GET', '/notifications/alert-rules', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data));
      assert.ok(res.data.data.length >= 12);
    });
  });

  describe('Alerts CRUD', () => {
    let alertId;

    it('should create alert via service (internal)', async () => {
      const alertService = await import('../../src/services/alert.service.js');
      const alert = await alertService.createAlert({
        type: 'maintenance',
        severity: 'high',
        title: 'Entretien en retard',
        message: 'Vidange dépassée de 10 jours',
        ruleCode: 'maintenance_overdue',
        entityType: 'maintenance',
        entityId: '01ABCDEF123456789012345678',
      }, { companyId: companyIdA });
      assert.ok(alert);
      alertId = alert.id;
    });

    it('should prevent duplicate alert', async () => {
      const alertService = await import('../../src/services/alert.service.js');
      const result = await alertService.createAlert({
        type: 'maintenance',
        severity: 'high',
        title: 'Entretien en retard',
        ruleCode: 'maintenance_overdue',
        entityType: 'maintenance',
        entityId: '01ABCDEF123456789012345678',
      }, { companyId: companyIdA });
      assert.strictEqual(result, null);
    });

    it('should list alerts', async () => {
      const res = await req('GET', '/notifications/alerts', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.data.data.alerts));
      assert.ok(res.data.data.total >= 1);
    });

    it('should get alert by id', async () => {
      const res = await req('GET', `/notifications/alerts/${alertId}`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.id, alertId);
      assert.ok(res.data.data.updatedAt);
    });

    it('should acknowledge alert', async () => {
      const res = await req('PATCH', `/notifications/alerts/${alertId}/acknowledge`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'acknowledged');
      assert.ok(res.data.data.acknowledgedAt);
    });

    it('should resolve alert with userId', async () => {
      const res = await req('PATCH', `/notifications/alerts/${alertId}/resolve`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'resolved');
      assert.ok(res.data.data.resolvedAt);
      assert.strictEqual(res.data.data.resolvedBy, userIdA);
    });

    it('should get alert stats', async () => {
      const res = await req('GET', '/notifications/alerts/stats/overview', null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.ok(typeof res.data.data.total === 'number');
      assert.ok(typeof res.data.data.activeCount === 'number');
    });

    it('should dismiss alert with userId', async () => {
      const alertService = await import('../../src/services/alert.service.js');
      const alert = await alertService.createAlert({
        type: 'vehicle',
        severity: 'medium',
        title: 'Véhicule à vérifier',
        ruleCode: 'vehicle_immobilized',
        entityType: 'vehicle',
        entityId: '01ABCDEF123456789012345678',
      }, { companyId: companyIdA });
      assert.ok(alert);

      const res = await req('PATCH', `/notifications/alerts/${alert.id}/dismiss`, null, {
        Authorization: `Bearer ${tokenA}`,
      });
      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.data.data.status, 'dismissed');
      assert.ok(res.data.data.dismissedAt);
      assert.strictEqual(res.data.data.dismissedBy, userIdA);
    });
  });

  describe('Tenant Isolation', () => {
    it('should not see company A notifications from company B', async () => {
      await req('POST', '/notifications', {
        type: 'system',
        category: 'info',
        severity: 'low',
        title: 'Tenant isolation test',
      }, { Authorization: `Bearer ${tokenA}` });

      const res = await req('GET', '/notifications', null, {
        Authorization: `Bearer ${tokenB}`,
      });
      assert.strictEqual(res.status, 200);
      const found = res.data.data.notifications.find((n) => n.title === 'Tenant isolation test');
      assert.strictEqual(found, undefined);
    });
  });

  describe('RBAC', () => {
    it('should reject create without notifications.manage', async () => {
      const ts = Date.now();
      const reg = await req('POST', '/auth/register', {
        firstName: 'Notif', lastName: 'Driver',
        email: `notif_inttest_driver${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
        companyName: 'NotifIntTest Corp A', role: 'driver',
      });
      const driverToken = reg.data.data.tokens.accessToken;

      const res = await req('POST', '/notifications', {
        type: 'system',
        title: 'Test RBAC',
      }, { Authorization: `Bearer ${driverToken}` });
      assert.strictEqual(res.status, 403);
    });

    it('should reject delete without notifications.manage', async () => {
      const ts = Date.now();
      const reg = await req('POST', '/auth/register', {
        firstName: 'Notif', lastName: 'Partner',
        email: `notif_inttest_partner${ts}@test.com`, password: 'Test1234', confirmPassword: 'Test1234',
        companyName: 'NotifIntTest Corp B', role: 'partner',
      });
      const partnerToken = reg.data.data.tokens.accessToken;

      const res = await req('DELETE', '/notifications/01ZZZZZZZZZZZZZZZZZZZZZZZZ', null, {
        Authorization: `Bearer ${partnerToken}`,
      });
      assert.strictEqual(res.status, 403);
    });
  });

  describe('Validation', () => {
    it('should reject notification with invalid type', async () => {
      const res = await req('POST', '/notifications', {
        type: 'invalid',
        title: 'Test',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject notification with missing title', async () => {
      const res = await req('POST', '/notifications', {
        type: 'system',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should reject notification with invalid expiresAt format', async () => {
      const res = await req('POST', '/notifications', {
        type: 'system',
        title: 'Test',
        expiresAt: 'not-a-date',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 422);
    });

    it('should accept notification with valid expiresAt ISO format', async () => {
      const res = await req('POST', '/notifications', {
        type: 'system',
        title: 'Test valid date',
        expiresAt: '2026-12-31T23:59:59.000Z',
      }, { Authorization: `Bearer ${tokenA}` });
      assert.strictEqual(res.status, 201);
    });
  });
});
