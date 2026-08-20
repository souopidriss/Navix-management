import { Router } from 'express';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import {
  createInvoiceSchema, updateInvoiceSchema, invoiceStatusSchema,
  invoiceIdParamSchema, invoiceQuerySchema,
} from '../finance/finance.schema.js';
import {
  listInvoices, getInvoiceById, createInvoice, updateInvoice,
  updateInvoiceStatus, deleteInvoice, getInvoiceStatistics,
} from '../finance/finance.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/statistics', getInvoiceStatistics);
router.get('/', validateQuery(invoiceQuerySchema), listInvoices);
router.get('/:id', validateParams(invoiceIdParamSchema), getInvoiceById);
router.post('/', requirePermission('finance.manage', 'invoices:create'), validate(createInvoiceSchema), createInvoice);
router.put('/:id', requirePermission('finance.manage', 'invoices:create'), validateParams(invoiceIdParamSchema), validate(updateInvoiceSchema), updateInvoice);
router.patch('/:id/status', requirePermission('finance.manage', 'invoices:create'), validateParams(invoiceIdParamSchema), validate(invoiceStatusSchema), updateInvoiceStatus);
router.delete('/:id', requirePermission('finance.manage', 'invoices:create'), validateParams(invoiceIdParamSchema), deleteInvoice);

export default router;
