import * as notificationService from '../../services/notification.service.js';
import * as alertService from '../../services/alert.service.js';

function tenantCtx(req) {
  return {
    userId: req.user?.id,
    companyId: req.tenantId,
    isGlobalAccess: req.isGlobalAccess,
  };
}

export async function list(req, res, next) {
  try {
    const result = await notificationService.listNotifications(req.query, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getById(req, res, next) {
  try {
    const doc = await notificationService.getNotificationById(req.params.id, tenantCtx(req));
    res.json({ success: true, data: doc });
  } catch (err) { next(err); }
}

export async function unreadCount(req, res, next) {
  try {
    const result = await notificationService.getUnreadCount({ userId: req.user?.id });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function markRead(req, res, next) {
  try {
    const result = await notificationService.markAsRead(req.params.id, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function markUnread(req, res, next) {
  try {
    const result = await notificationService.markAsUnread(req.params.id, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function markAllRead(req, res, next) {
  try {
    const result = await notificationService.markAllAsRead(tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function archive(req, res, next) {
  try {
    const result = await notificationService.archiveNotification(req.params.id, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function dismiss(req, res, next) {
  try {
    const result = await notificationService.dismissNotification(req.params.id, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function remove(req, res, next) {
  try {
    const result = await notificationService.deleteNotification(req.params.id, tenantCtx(req));
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function statistics(req, res, next) {
  try {
    const data = await notificationService.getStatistics(tenantCtx(req));
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function alertRules(req, res, next) {
  try {
    const data = notificationService.getAlertRules();
    res.json({ success: true, data });
  } catch (err) { next(err); }
}

export async function create(req, res, next) {
  try {
    const result = await notificationService.createNotification(req.body, {
      companyId: req.tenantId || req.user?.companyId,
      userId: req.user.id,
    });
    if (!result) {
      return res.status(200).json({ success: true, data: null, message: 'Notification déjà existante (idempotence).' });
    }
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function listAlerts(req, res, next) {
  try {
    const result = await alertService.listAlerts(req.query, { companyId: req.tenantId });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function getAlertById(req, res, next) {
  try {
    const alert = await alertService.getAlertById(req.params.id, { companyId: req.tenantId });
    res.json({ success: true, data: alert });
  } catch (err) { next(err); }
}

export async function acknowledgeAlert(req, res, next) {
  try {
    const result = await alertService.acknowledgeAlert(req.params.id, {
      companyId: req.tenantId,
      userId: req.user?.id,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function resolveAlert(req, res, next) {
  try {
    const result = await alertService.resolveAlert(req.params.id, {
      companyId: req.tenantId,
      userId: req.user?.id,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function dismissAlert(req, res, next) {
  try {
    const result = await alertService.dismissAlert(req.params.id, {
      companyId: req.tenantId,
      userId: req.user?.id,
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
}

export async function alertStats(req, res, next) {
  try {
    const data = await alertService.getAlertStats({ companyId: req.tenantId });
    res.json({ success: true, data });
  } catch (err) { next(err); }
}
