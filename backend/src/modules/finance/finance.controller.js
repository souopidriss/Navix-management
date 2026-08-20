import * as financeService from '../../services/finance.service.js';
import * as invoiceService from '../../services/invoice.service.js';
import * as paymentService from '../../services/payment.service.js';

function parseQuery(req) {
  const raw = { ...req.query };
  if (raw.page) raw.page = Number(raw.page);
  if (raw.limit) raw.limit = Number(raw.limit);

  const filterKeys = ['transaction_type', 'status', 'direction', 'method', 'category', 'entity_type', 'entityId', 'dateFrom', 'dateTo', 'search', 'clientId', 'partnerId', 'invoiceId'];
  const filters = {};
  for (const key of filterKeys) {
    if (raw[key] !== undefined && raw[key] !== '') {
      filters[key] = raw[key];
      delete raw[key];
    }
  }

  return { ...raw, filters };
}

export async function getWallet(req, res, next) {
  try {
    const wallet = await financeService.getWallet(req.tenantId);
    res.json({ success: true, data: wallet });
  } catch (error) { next(error); }
}

export async function getBalance(req, res, next) {
  try {
    const balance = await financeService.getBalance(req.tenantId);
    res.json({ success: true, data: balance });
  } catch (error) { next(error); }
}

export async function getStatistics(req, res, next) {
  try {
    const stats = await financeService.getStatistics(req.tenantId, req.query);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}

export async function getFinancialSummary(req, res, next) {
  try {
    const summary = await financeService.getFinancialSummary(req.tenantId);
    res.json({ success: true, data: summary });
  } catch (error) { next(error); }
}

export async function listTransactions(req, res, next) {
  try {
    const query = parseQuery(req);
    const result = await financeService.listTransactions(req.tenantId, query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
}

export async function getTransactionById(req, res, next) {
  try {
    const tx = await financeService.getTransactionById(req.params.id, req.tenantId);
    res.json({ success: true, data: tx });
  } catch (error) { next(error); }
}

export async function createTransaction(req, res, next) {
  try {
    const tx = await financeService.createTransaction(req.body, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: tx });
  } catch (error) { next(error); }
}

export async function reverseTransaction(req, res, next) {
  try {
    const tx = await financeService.reverseTransaction(req.params.id, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.json({ success: true, data: tx });
  } catch (error) { next(error); }
}

export async function previewReference(req, res, next) {
  try {
    const ref = await financeService.previewReference(req.tenantId);
    res.json({ success: true, data: ref });
  } catch (error) { next(error); }
}

export async function getVehicleCosts(req, res, next) {
  try {
    const costs = await financeService.getVehicleCosts(req.tenantId, req.params.vehicleId);
    res.json({ success: true, data: costs });
  } catch (error) { next(error); }
}

export async function getCategoryStats(req, res, next) {
  try {
    const stats = await financeService.getCategoryStats(req.tenantId, req.query);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}

export async function listInvoices(req, res, next) {
  try {
    const query = parseQuery(req);
    const result = await invoiceService.listInvoices(req.tenantId, query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
}

export async function getInvoiceById(req, res, next) {
  try {
    const invoice = await invoiceService.getInvoiceById(req.params.id, req.tenantId);
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function createInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.createInvoice(req.body, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function updateInvoice(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoice(req.params.id, req.body, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function updateInvoiceStatus(req, res, next) {
  try {
    const invoice = await invoiceService.updateInvoiceStatus(req.params.id, req.body.status, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function deleteInvoice(req, res, next) {
  try {
    await invoiceService.deleteInvoice(req.params.id, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.json({ success: true, message: 'Facture supprimée.' });
  } catch (error) { next(error); }
}

export async function getInvoiceStatistics(req, res, next) {
  try {
    const stats = await invoiceService.getInvoiceStatistics(req.tenantId);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}

export async function listPayments(req, res, next) {
  try {
    const query = parseQuery(req);
    const result = await paymentService.listPayments(req.tenantId, query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
}

export async function getPaymentById(req, res, next) {
  try {
    const payment = await paymentService.getPaymentById(req.params.id, req.tenantId);
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
}

export async function createPayment(req, res, next) {
  try {
    const payment = await paymentService.createPayment(req.body, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) { next(error); }
}

export async function refundPayment(req, res, next) {
  try {
    const payment = await paymentService.refundPayment(req.params.id, {
      companyId: req.tenantId,
      userId: req.user.id,
    });
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
}

export async function getPaymentStatistics(req, res, next) {
  try {
    const stats = await paymentService.getPaymentStatistics(req.tenantId);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}
