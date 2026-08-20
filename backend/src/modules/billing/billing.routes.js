import { Router } from 'express';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import {
  createBillingInvoiceSchema, billingInvoiceIdParamSchema, billingInvoiceQuerySchema,
  billingPaymentIdParamSchema, simulatePaymentSchema, billingPaymentQuerySchema,
  updateBillingSettingsSchema, billingHistoryQuerySchema,
} from './billing.schema.js';
import {
  listInvoicesHandler, getInvoiceByIdHandler, createInvoiceHandler,
  issueInvoiceHandler, cancelInvoiceHandler, downloadInvoiceHandler,
  getInvoiceItemsHandler,
  listPaymentsHandler, getPaymentByIdHandler,
  simulatePaymentHandler, refundPaymentHandler,
  getStatisticsHandler, getBillingHistoryHandler,
  getBillingSettingsHandler, updateBillingSettingsHandler,
  getCreditsHandler, getDiscountsHandler,
} from './billing.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/invoices', validateQuery(billingInvoiceQuerySchema), listInvoicesHandler);
router.get('/invoices/statistics', getStatisticsHandler);
router.get('/statistics', getStatisticsHandler);
router.get('/invoices/:id', validateParams(billingInvoiceIdParamSchema), getInvoiceByIdHandler);
router.get('/invoices/:id/items', validateParams(billingInvoiceIdParamSchema), getInvoiceItemsHandler);
router.get('/invoices/:id/download', validateParams(billingInvoiceIdParamSchema), downloadInvoiceHandler);
router.post('/invoices', requirePermission('billing.manage', 'invoices:create'), validate(createBillingInvoiceSchema), createInvoiceHandler);
router.post('/invoices/:id/issue', requirePermission('billing.manage', 'invoices:create'), validateParams(billingInvoiceIdParamSchema), issueInvoiceHandler);
router.post('/invoices/:id/cancel', requirePermission('billing.manage', 'invoices:create'), validateParams(billingInvoiceIdParamSchema), cancelInvoiceHandler);

router.get('/payments', validateQuery(billingPaymentQuerySchema), listPaymentsHandler);
router.get('/payments/:id', validateParams(billingPaymentIdParamSchema), getPaymentByIdHandler);
router.post('/payments/simulate', requirePermission('billing.manage'), validate(simulatePaymentSchema), simulatePaymentHandler);
router.post('/payments/:id/refund', requirePermission('billing.manage'), validateParams(billingPaymentIdParamSchema), refundPaymentHandler);

router.get('/history', validateQuery(billingHistoryQuerySchema), getBillingHistoryHandler);
router.get('/settings', getBillingSettingsHandler);
router.patch('/settings', requirePermission('billing.manage'), validate(updateBillingSettingsSchema), updateBillingSettingsHandler);
router.get('/credits', getCreditsHandler);
router.get('/discounts', getDiscountsHandler);

export default router;
