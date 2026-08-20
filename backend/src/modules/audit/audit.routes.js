import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validateQuery, validateParams, validate } from '../../middlewares/validate.js';
import { auditQuerySchema, auditIdParamSchema } from './audit.schema.js';
import { exportAuditBodySchema } from '../exports/export.schema.js';
import { exportAuditLogs } from '../exports/export.controller.js';
import * as auditController from './audit.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/statistics', requirePermission('audit:view'), auditController.statistics);

router.get('/resource-activity', requirePermission('audit:view'), auditController.resourceActivity);

router.get('/user/:userId', requirePermission('audit:view'), auditController.userActivity);

router.post('/export', requirePermission('audit:view'), validate(exportAuditBodySchema), exportAuditLogs);

router.get('/', requirePermission('audit:view'), validateQuery(auditQuerySchema), auditController.list);

router.get('/:id', requirePermission('audit:view'), validateParams(auditIdParamSchema), auditController.getById);

export default router;
