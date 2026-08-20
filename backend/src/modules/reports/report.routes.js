import { Router } from 'express';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import {
  reportQuerySchema, customReportSchema, savedReportSchema, savedReportUpdateSchema,
  savedReportIdParamSchema, savedReportQuerySchema, exportReportSchema,
} from './report.schema.js';
import {
  getReport, getDashboardMetrics, getCustomReport,
  listSavedReports, getSavedReport, createSavedReport, updateSavedReport, deleteSavedReport,
  exportReport, getCategories,
} from './report.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/statistics', requirePermission('reports:view'), validateQuery(reportQuerySchema), getDashboardMetrics);
router.get('/categories', requirePermission('reports:view'), getCategories);

router.get('/fleet', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'fleet'; next(); }, getReport);
router.get('/vehicles', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'vehicles'; next(); }, getReport);
router.get('/drivers', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'drivers'; next(); }, getReport);
router.get('/assignments', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'assignments'; next(); }, getReport);
router.get('/trips', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'trips'; next(); }, getReport);
router.get('/fuel', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'fuel'; next(); }, getReport);
router.get('/maintenance', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'maintenance'; next(); }, getReport);
router.get('/documents', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'documents'; next(); }, getReport);
router.get('/financial', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'financial'; next(); }, getReport);
router.get('/subscriptions', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'subscriptions'; next(); }, getReport);
router.get('/audit', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'audit'; next(); }, getReport);
router.get('/companies', requirePermission('reports:view'), validateQuery(reportQuerySchema), (req, res, next) => { req.params.type = 'companies'; next(); }, getReport);

router.post('/custom', requirePermission('reports:view'), validate(customReportSchema), getCustomReport);
router.post('/export', requirePermission('reports:export'), validate(exportReportSchema), exportReport);

router.get('/', requirePermission('reports:view'), validateQuery(savedReportQuerySchema), listSavedReports);
router.get('/:id', requirePermission('reports:view'), validateParams(savedReportIdParamSchema), getSavedReport);
router.post('/', requirePermission('reports:view'), validate(savedReportSchema), createSavedReport);
router.post('/:id', requirePermission('reports:view'), validateParams(savedReportIdParamSchema), validate(savedReportUpdateSchema), updateSavedReport);
router.delete('/:id', requirePermission('reports:view'), validateParams(savedReportIdParamSchema), deleteSavedReport);

export default router;
