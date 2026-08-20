import { Router } from 'express';
import { validate, validateParams, validateQuery } from '../../middlewares/validate.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { requirePermission } from '../../middlewares/requirePermission.js';
import { tenantScope } from '../../middlewares/tenantScope.js';
import {
  createTransactionSchema, transactionIdParamSchema, financeQuerySchema,
  createInvoiceSchema, updateInvoiceSchema, invoiceStatusSchema,
  invoiceIdParamSchema, invoiceQuerySchema, createPaymentSchema,
  paymentIdParamSchema, paymentQuerySchema, statsQuerySchema,
} from './finance.schema.js';
import {
  getWallet, getBalance, getStatistics, getFinancialSummary,
  listTransactions, getTransactionById, createTransaction, reverseTransaction,
  previewReference, getVehicleCosts, getCategoryStats,
  listInvoices, getInvoiceById, createInvoice, updateInvoice,
  updateInvoiceStatus, deleteInvoice, getInvoiceStatistics,
  listPayments, getPaymentById, createPayment, refundPayment,
  getPaymentStatistics,
} from './finance.controller.js';

const router = Router();

router.use(authenticate);
router.use(tenantScope);

router.get('/wallet', getWallet);
router.get('/wallet/balance', getBalance);
router.get('/wallet/statistics', validateQuery(statsQuerySchema), getStatistics);
router.get('/wallet/summary', getFinancialSummary);

router.get('/transactions/reference/preview', previewReference);
router.get('/transactions', validateQuery(financeQuerySchema), listTransactions);
router.get('/transactions/vehicle-costs/:vehicleId', getVehicleCosts);
router.get('/transactions/category-stats', validateQuery(statsQuerySchema), getCategoryStats);
router.get('/transactions/:id', validateParams(transactionIdParamSchema), getTransactionById);
router.post('/transactions', requirePermission('finance.manage', 'finance.create'), validate(createTransactionSchema), createTransaction);
router.post('/transactions/:id/reverse', requirePermission('finance.manage', 'finance.create'), validateParams(transactionIdParamSchema), reverseTransaction);

router.get('/invoices/statistics', getInvoiceStatistics);
router.get('/invoices', validateQuery(invoiceQuerySchema), listInvoices);
router.get('/invoices/:id', validateParams(invoiceIdParamSchema), getInvoiceById);
router.post('/invoices', requirePermission('finance.manage', 'invoices:create'), validate(createInvoiceSchema), createInvoice);
router.put('/invoices/:id', requirePermission('finance.manage', 'invoices:create'), validateParams(invoiceIdParamSchema), validate(updateInvoiceSchema), updateInvoice);
router.patch('/invoices/:id/status', requirePermission('finance.manage', 'invoices:create'), validateParams(invoiceIdParamSchema), validate(invoiceStatusSchema), updateInvoiceStatus);
router.delete('/invoices/:id', requirePermission('finance.manage', 'invoices:create'), validateParams(invoiceIdParamSchema), deleteInvoice);

router.get('/payments/statistics', getPaymentStatistics);
router.get('/payments', validateQuery(paymentQuerySchema), listPayments);
router.get('/payments/:id', validateParams(paymentIdParamSchema), getPaymentById);
router.post('/payments', requirePermission('finance.manage', 'finance.create'), validate(createPaymentSchema), createPayment);
router.post('/payments/:id/refund', requirePermission('finance.manage', 'finance.create'), validateParams(paymentIdParamSchema), refundPayment);

export default router;
