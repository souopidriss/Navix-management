import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  notificationIdParamSchema,
  notificationQuerySchema,
  createNotificationSchema,
  alertIdParamSchema,
  alertQuerySchema,
} from './notification.schema.js';
import * as notificationController from './notification.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/unread-count', notificationController.unreadCount);

router.patch('/read-all', notificationController.markAllRead);

router.get('/statistics', notificationController.statistics);

router.get('/alert-rules', notificationController.alertRules);

router.get('/alerts/stats/overview', notificationController.alertStats);

router.get('/alerts', validateQuery(alertQuerySchema), notificationController.listAlerts);

router.get('/alerts/:id', validateParams(alertIdParamSchema), notificationController.getAlertById);

router.patch('/alerts/:id/acknowledge', validateParams(alertIdParamSchema), notificationController.acknowledgeAlert);

router.patch('/alerts/:id/resolve', validateParams(alertIdParamSchema), notificationController.resolveAlert);

router.patch('/alerts/:id/dismiss', validateParams(alertIdParamSchema), notificationController.dismissAlert);

router.post('/', requirePermission('notifications.manage'), validate(createNotificationSchema), notificationController.create);

router.get('/', validateQuery(notificationQuerySchema), notificationController.list);

router.get('/:id', validateParams(notificationIdParamSchema), notificationController.getById);

router.patch('/:id/read', validateParams(notificationIdParamSchema), notificationController.markRead);

router.patch('/:id/unread', validateParams(notificationIdParamSchema), notificationController.markUnread);

router.patch('/:id/archive', validateParams(notificationIdParamSchema), notificationController.archive);

router.patch('/:id/dismiss', validateParams(notificationIdParamSchema), notificationController.dismiss);

router.delete('/:id', requirePermission('notifications.manage'), validateParams(notificationIdParamSchema), notificationController.remove);

export default router;
