import { Router } from 'express';
import { authenticate } from '../../middlewares/authenticate.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import {
  exportQuerySchema, exportSourceParamSchema,
  exportReportBodySchema, exportAuditBodySchema,
} from './export.schema.js';
import { exportData, exportReport, exportAuditLogs } from './export.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.post(
  '/reports',
  requirePermission('reports:export'),
  validate(exportReportBodySchema),
  exportReport,
);

router.post(
  '/audit-logs',
  requirePermission('audit:view', 'reports:export'),
  validate(exportAuditBodySchema),
  exportAuditLogs,
);

router.get(
  '/:source',
  requirePermission('reports:export'),
  validateParams(exportSourceParamSchema),
  validateQuery(exportQuerySchema),
  exportData,
);

export default router;
