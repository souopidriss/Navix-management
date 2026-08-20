import billingInvoiceRepository from '../repositories/BillingInvoiceRepository.js';
import billingPaymentRepository from '../repositories/BillingPaymentRepository.js';
import billingSettingsRepository from '../repositories/BillingSettingsRepository.js';
import billingHistoryRepository from '../repositories/BillingHistoryRepository.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { getPool } from '../database/index.js';
import { generateId } from '../utils/id.js';
import { recordAudit } from './audit.service.js';

function formatInvoiceResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    subscriptionId: row.subscription_id,
    number: row.number,
    status: row.status,
    currency: row.currency || 'XAF',
    issuedDate: row.issued_date,
    dueDate: row.due_date,
    paidDate: row.paid_date,
    periodStart: row.period_start,
    periodEnd: row.period_end,
    subtotal: Number(row.subtotal) || 0,
    discountAmount: Number(row.discount_amount) || 0,
    taxRate: Number(row.tax_rate) || 0,
    taxAmount: Number(row.tax_amount) || 0,
    total: Number(row.total) || 0,
    creditApplied: Number(row.credit_applied) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    amountDue: Number(row.amount_due) || 0,
    notes: row.notes || null,
    items: row.items || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function formatPaymentResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    invoiceId: row.invoice_id,
    number: row.number,
    status: row.status,
    method: row.method,
    amount: Number(row.amount) || 0,
    currency: row.currency || 'XAF',
    transactionReference: row.transaction_reference || null,
    paymentDate: row.payment_date,
    receivedDate: row.received_date,
    failureReason: row.failure_reason || null,
    refundReason: row.refund_reason || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listInvoices(companyId, { page, limit, sort, order, status } = {}) {
  const filters = {};
  if (status) filters.status = status;

  const result = await billingInvoiceRepository.findByCompanyIdWithDetails(companyId, {
    page: page || 1,
    limit: limit || 20,
    sort: sort || 'created_at',
    order: order || 'DESC',
    filters,
  });

  return {
    data: result.rows.map(formatInvoiceResponse),
    pagination: {
      total: result.total,
      page: page || 1,
      limit: limit || 20,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function getInvoiceById(id, companyId) {
  const invoice = await billingInvoiceRepository.findWithItems(id);
  if (!invoice) throw new NotFoundError('Facture');
  if (companyId && invoice.company_id !== companyId) throw new NotFoundError('Facture');
  return formatInvoiceResponse(invoice);
}

export async function createInvoice({ companyId, subscriptionId, currency, taxRate, periodStart, periodEnd, items, status }, { userId } = {}) {
  const settings = await billingSettingsRepository.findOrCreate(companyId);
  const number = await billingInvoiceRepository.getNextNumber(companyId);

  let subtotal = 0;
  if (items && items.length > 0) {
    subtotal = items.reduce((sum, item) => {
      const amount = (item.quantity || 1) * (item.unitPrice || item.unit_price || 0);
      return sum + amount;
    }, 0);
  }

  const tax = subtotal * (taxRate || settings.default_tax_rate || 0);
  const total = subtotal + tax;

  const invoiceId = generateId();

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO billing_invoices (id, company_id, subscription_id, number, status, currency,
        issued_date, due_date, period_start, period_end, subtotal, tax_rate, tax_amount, total, amount_due, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [invoiceId, companyId, subscriptionId || null, number,
       status || 'draft', currency || settings.default_currency || 'XAF',
       status === 'issued' ? new Date().toISOString().split('T')[0] : null,
       new Date(Date.now() + (settings.payment_terms_days || 30) * 86400000).toISOString().split('T')[0],
       periodStart || null, periodEnd || null,
       subtotal, taxRate || settings.default_tax_rate || 0, tax, total, total, null]
    );

    if (items && items.length > 0) {
      for (const item of items) {
        const itemAmount = (item.quantity || 1) * (item.unitPrice || item.unit_price || 0);
        await conn.query(
          `INSERT INTO billing_invoice_items (id, invoice_id, kind, label, description, quantity, unit_price, tax_rate, amount, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [generateId(), invoiceId, item.kind || 'subscription_renewal',
           item.label || item.description || 'Service',
           item.description || null, item.quantity || 1,
           item.unitPrice || item.unit_price || 0,
           item.taxRate || item.tax_rate || 0, itemAmount]
        );
      }
    }

    await conn.query(
      'UPDATE billing_settings SET next_invoice_number = next_invoice_number + 1 WHERE company_id = ?',
      [companyId]
    );

    await conn.query(
      'INSERT INTO billing_history (id, company_id, invoice_id, type, message, amount, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [generateId(), companyId, invoiceId, 'invoice_created', `Facture ${number} créée`, total, currency || 'XAF']
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  recordAudit({ companyId, userId, action: 'billing.invoice_create', actionType: 'CREATE', entityType: 'billing_invoice', entityId: invoiceId, description: `Facture ${number} créée: ${total} XAF` }).catch(() => {});

  return getInvoiceById(invoiceId);
}

export async function issueInvoice(id, { companyId, userId } = {}) {
  const invoice = await billingInvoiceRepository.findById(id);
  if (!invoice) throw new NotFoundError('Facture');
  if (companyId && invoice.company_id !== companyId) throw new NotFoundError('Facture');
  if (invoice.status !== 'draft') throw new BadRequestError('Seules les factures en brouillon peuvent être émises.');

  await billingInvoiceRepository.update(id, {
    status: 'issued',
    issued_date: new Date().toISOString().split('T')[0],
  });

  const settings = await billingSettingsRepository.findOrCreate(invoice.company_id);
  const dueDate = new Date(Date.now() + (settings.payment_terms_days || 30) * 86400000).toISOString().split('T')[0];
  await billingInvoiceRepository.query('UPDATE billing_invoices SET due_date = ? WHERE id = ?', [dueDate, id]);

  recordAudit({ companyId: invoice.company_id, userId, action: 'billing.invoice_issue', actionType: 'UPDATE', entityType: 'billing_invoice', entityId: id, description: `Facture ${invoice.number} émise` }).catch(() => {});

  return getInvoiceById(id, companyId);
}

export async function cancelInvoice(id, { companyId, userId } = {}) {
  const invoice = await billingInvoiceRepository.findById(id);
  if (!invoice) throw new NotFoundError('Facture');
  if (companyId && invoice.company_id !== companyId) throw new NotFoundError('Facture');
  if (invoice.status === 'paid' || invoice.status === 'cancelled') {
    throw new BadRequestError('Cette facture ne peut pas être annulée.');
  }

  await billingInvoiceRepository.update(id, { status: 'cancelled', amount_due: 0 });

  recordAudit({ companyId: invoice.company_id, userId, action: 'billing.invoice_cancel', actionType: 'UPDATE', entityType: 'billing_invoice', entityId: id, description: `Facture ${invoice.number} annulée` }).catch(() => {});

  return getInvoiceById(id, companyId);
}

export async function simulatePayment({ invoiceId, method, amount, currency, transactionReference, paymentDate }, { companyId, userId } = {}) {
  const invoice = await billingInvoiceRepository.findById(invoiceId);
  if (!invoice) throw new NotFoundError('Facture');
  if (companyId && invoice.company_id !== companyId) throw new NotFoundError('Facture');

  const number = await billingPaymentRepository.getNextNumber(invoice.company_id);
  const paymentId = generateId();

  const payAmount = Number(amount) || Number(invoice.total);

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO billing_payments (id, company_id, invoice_id, number, status, method, amount, currency, transaction_reference, payment_date, received_date, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'successful', ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [paymentId, invoice.company_id, invoiceId, number,
       method || 'bank_transfer', payAmount,
       currency || invoice.currency, transactionReference || null,
       paymentDate || new Date().toISOString().split('T')[0],
       new Date().toISOString().split('T')[0]]
    );

    const newAmountPaid = Number(invoice.amount_paid) + payAmount;
    const newAmountDue = Math.max(0, Number(invoice.total) - newAmountPaid);
    const newStatus = newAmountDue <= 0 ? 'paid' : 'partially_paid';

    await conn.query(
      'UPDATE billing_invoices SET amount_paid = ?, amount_due = ?, status = ?, paid_date = ?, updated_at = NOW() WHERE id = ?',
      [newAmountPaid, newAmountDue, newStatus, new Date().toISOString().split('T')[0], invoiceId]
    );

    await conn.query(
      'UPDATE billing_settings SET next_payment_number = next_payment_number + 1 WHERE company_id = ?',
      [invoice.company_id]
    );

    await conn.query(
      'INSERT INTO billing_history (id, company_id, invoice_id, type, message, amount, currency, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())',
      [generateId(), invoice.company_id, invoiceId, 'payment_received', `Paiement ${number} reçu: ${payAmount} XAF`, payAmount, currency || 'XAF']
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  recordAudit({ companyId: invoice.company_id, userId, action: 'billing.payment_simulate', actionType: 'CREATE', entityType: 'billing_payment', entityId: paymentId, description: `Paiement simulé ${number}: ${payAmount} XAF` }).catch(() => {});

  const payment = await billingPaymentRepository.findById(paymentId);
  return { payment: formatPaymentResponse(payment), invoice: await getInvoiceById(invoiceId) };
}

export async function refundPayment(id, { companyId, userId } = {}) {
  const payment = await billingPaymentRepository.findById(id);
  if (!payment) throw new NotFoundError('Paiement');
  if (companyId && payment.company_id !== companyId) throw new NotFoundError('Paiement');
  if (payment.status !== 'successful') throw new BadRequestError('Seuls les paiements réussis peuvent être remboursés.');

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      'UPDATE billing_payments SET status = ?, refund_reason = ?, updated_at = NOW() WHERE id = ?',
      ['refunded', 'Remboursement simulé', id]
    );

    if (payment.invoice_id) {
      const invoice = await billingInvoiceRepository.findById(payment.invoice_id);
      if (invoice) {
        const newAmountPaid = Math.max(0, Number(invoice.amount_paid) - Number(payment.amount));
        const newAmountDue = Number(invoice.total) - newAmountPaid;
        await conn.query(
          'UPDATE billing_invoices SET amount_paid = ?, amount_due = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [newAmountPaid, newAmountDue, newAmountPaid <= 0 ? 'refunded' : 'partially_paid', invoice.id]
        );
      }
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  recordAudit({ companyId: payment.company_id, userId, action: 'billing.payment_refund', actionType: 'UPDATE', entityType: 'billing_payment', entityId: id, description: `Paiement ${payment.number} remboursé` }).catch(() => {});

  const updated = await billingPaymentRepository.findById(id);
  return formatPaymentResponse(updated);
}

export async function listPayments(companyId, { page, limit, sort, order, status, method } = {}) {
  const filters = {};
  if (status) filters.status = status;
  if (method) filters.method = method;

  const result = await billingPaymentRepository.findByCompanyIdWithDetails(companyId, {
    page: page || 1,
    limit: limit || 20,
    sort: sort || 'created_at',
    order: order || 'DESC',
    filters,
  });

  return {
    data: result.rows.map(formatPaymentResponse),
    pagination: {
      total: result.total,
      page: page || 1,
      limit: limit || 20,
      totalPages: Math.ceil(result.total / (limit || 20)),
    },
  };
}

export async function getPaymentById(id, companyId) {
  const payment = await billingPaymentRepository.findById(id);
  if (!payment) throw new NotFoundError('Paiement');
  if (companyId && payment.company_id !== companyId) throw new NotFoundError('Paiement');
  return formatPaymentResponse(payment);
}

export async function getStatistics(companyId) {
  const stats = await billingInvoiceRepository.getStatistics(companyId);
  return stats;
}

export async function getBillingHistory(companyId, { page, limit } = {}) {
  return billingHistoryRepository.findByCompanyId(companyId, { page: page || 1, limit: limit || 20 });
}

export async function getBillingSettings(companyId) {
  const settings = await billingSettingsRepository.findOrCreate(companyId);
  return {
    id: settings.id,
    defaultCurrency: settings.default_currency,
    paymentTermsDays: settings.payment_terms_days,
    defaultTaxRate: Number(settings.default_tax_rate),
    allowPartialPayments: !!settings.allow_partial_payments,
    invoicePrefix: settings.invoice_prefix,
    nextInvoiceNumber: settings.next_invoice_number,
    nextPaymentNumber: settings.next_payment_number,
    autoReminders: !!settings.auto_reminders,
    defaultPaymentMethods: settings.default_payment_methods ? (typeof settings.default_payment_methods === 'string' ? JSON.parse(settings.default_payment_methods) : settings.default_payment_methods) : ['bank_transfer'],
    companyInfo: settings.company_info ? (typeof settings.company_info === 'string' ? JSON.parse(settings.company_info) : settings.company_info) : {},
    updatedAt: settings.updated_at,
  };
}

export async function updateBillingSettings(companyId, data) {
  const settings = await billingSettingsRepository.findOrCreate(companyId);
  const payload = {};
  if (data.defaultCurrency) payload.default_currency = data.defaultCurrency;
  if (data.paymentTermsDays !== undefined) payload.payment_terms_days = data.paymentTermsDays;
  if (data.defaultTaxRate !== undefined) payload.default_tax_rate = data.defaultTaxRate;
  if (data.allowPartialPayments !== undefined) payload.allow_partial_payments = data.allowPartialPayments;
  if (data.invoicePrefix) payload.invoice_prefix = data.invoicePrefix;
  if (data.autoReminders !== undefined) payload.auto_reminders = data.autoReminders;
  if (data.defaultPaymentMethods) payload.default_payment_methods = JSON.stringify(data.defaultPaymentMethods);
  if (data.companyInfo) payload.company_info = JSON.stringify(data.companyInfo);

  if (Object.keys(payload).length > 0) {
    await billingSettingsRepository.update(settings.id, payload);
  }

  return getBillingSettings(companyId);
}
