import * as billingInvoiceService from '../../services/billingInvoice.service.js';

function getCompanyId(req) {
  if (req.isGlobalAccess) return req.query.companyScopeId || req.tenantId;
  return req.tenantId;
}

export async function listInvoicesHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const result = await billingInvoiceService.listInvoices(companyId, {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      order: req.query.order,
      status: req.query.status,
    });
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
}

export async function getInvoiceByIdHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const invoice = await billingInvoiceService.getInvoiceById(req.params.id, companyId);
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function createInvoiceHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const invoice = await billingInvoiceService.createInvoice({
      ...req.body,
      companyId,
    }, { userId: req.user.id });
    res.status(201).json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function issueInvoiceHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const invoice = await billingInvoiceService.issueInvoice(req.params.id, {
      companyId,
      userId: req.user.id,
    });
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function cancelInvoiceHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const invoice = await billingInvoiceService.cancelInvoice(req.params.id, {
      companyId,
      userId: req.user.id,
    });
    res.json({ success: true, data: invoice });
  } catch (error) { next(error); }
}

export async function downloadInvoiceHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const invoice = await billingInvoiceService.getInvoiceById(req.params.id, companyId);
    res.json({
      success: true,
      data: {
        id: invoice.id,
        number: invoice.number,
        fileName: `${invoice.number}.pdf`,
        contentType: 'application/pdf',
        simulated: true,
      },
    });
  } catch (error) { next(error); }
}

export async function getInvoiceItemsHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const invoice = await billingInvoiceService.getInvoiceById(req.params.id, companyId);
    res.json({ success: true, data: invoice.items || [] });
  } catch (error) { next(error); }
}

export async function listPaymentsHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const result = await billingInvoiceService.listPayments(companyId, {
      page: req.query.page,
      limit: req.query.limit,
      sort: req.query.sort,
      order: req.query.order,
      status: req.query.status,
      method: req.query.method,
    });
    res.json({ success: true, data: result.data, pagination: result.pagination });
  } catch (error) { next(error); }
}

export async function getPaymentByIdHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const payment = await billingInvoiceService.getPaymentById(req.params.id, companyId);
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
}

export async function simulatePaymentHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const result = await billingInvoiceService.simulatePayment(req.body, {
      companyId,
      userId: req.user.id,
    });
    res.status(201).json({ success: true, data: result });
  } catch (error) { next(error); }
}

export async function refundPaymentHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const payment = await billingInvoiceService.refundPayment(req.params.id, {
      companyId,
      userId: req.user.id,
    });
    res.json({ success: true, data: payment });
  } catch (error) { next(error); }
}

export async function getStatisticsHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const stats = await billingInvoiceService.getStatistics(companyId);
    res.json({ success: true, data: stats });
  } catch (error) { next(error); }
}

export async function getBillingHistoryHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const result = await billingInvoiceService.getBillingHistory(companyId, {
      page: req.query.page,
      limit: req.query.limit,
    });
    res.json({ success: true, data: result.data || result, pagination: result.pagination });
  } catch (error) { next(error); }
}

export async function getBillingSettingsHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const settings = await billingInvoiceService.getBillingSettings(companyId);
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
}

export async function updateBillingSettingsHandler(req, res, next) {
  try {
    const companyId = getCompanyId(req);
    const settings = await billingInvoiceService.updateBillingSettings(companyId, req.body);
    res.json({ success: true, data: settings });
  } catch (error) { next(error); }
}

export async function getCreditsHandler(req, res, next) {
  try {
    res.json({ success: true, data: [] });
  } catch (error) { next(error); }
}

export async function getDiscountsHandler(req, res, next) {
  try {
    res.json({ success: true, data: [] });
  } catch (error) { next(error); }
}
