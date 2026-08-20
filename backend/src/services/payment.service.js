import paymentRepository from '../repositories/PaymentRepository.js';
import invoiceRepository from '../repositories/InvoiceRepository.js';
import { getPool } from '../database/index.js';
import { NotFoundError, ConflictError, BadRequestError } from '../errors/index.js';
import { recordAudit } from './audit.service.js';

function formatPaymentResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    invoiceId: row.invoice_id,
    invoiceReference: row.invoice_reference || '',
    invoiceTotal: Number(row.invoice_total) || 0,
    invoiceAmountPaid: Number(row.invoice_amount_paid) || 0,
    amount: Number(row.amount) || 0,
    currency: row.currency || 'XAF',
    method: row.method,
    status: row.status,
    reference: row.reference || '',
    transactionReference: row.transaction_reference || '',
    notes: row.notes || '',
    paidAt: row.paid_at || null,
    createdBy: row.created_by || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPayments(companyId, query) {
  const result = await paymentRepository.findByCompanyIdWithDetails(companyId, query);
  return {
    data: result.rows.map(formatPaymentResponse),
    pagination: {
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 20,
      totalPages: Math.ceil(result.total / (query.limit || 20)),
    },
  };
}

export async function getPaymentById(id, companyId) {
  const row = await paymentRepository.queryOne(
    `SELECT p.*, i.reference as invoice_reference, i.total as invoice_total, i.amount_paid as invoice_amount_paid
     FROM payments p
     LEFT JOIN invoices i ON i.id = p.invoice_id
     WHERE p.id = ? AND p.company_id = ?`,
    [id, companyId]
  );
  if (!row) throw new NotFoundError('Paiement');
  return formatPaymentResponse(row);
}

export async function createPayment(payload, { companyId, userId }) {
  const invoice = await invoiceRepository.findById(payload.invoiceId);
  if (!invoice || invoice.company_id !== companyId || invoice.deleted_at) {
    throw new NotFoundError('Facture');
  }

  if (invoice.status === 'cancelled' || invoice.status === 'refunded') {
    throw new ConflictError('Cette facture ne peut plus recevoir de paiements.');
  }

  if (payload.transactionReference) {
    const isDuplicate = await paymentRepository.hasDuplicateReference(
      companyId, payload.invoiceId, payload.transactionReference
    );
    if (isDuplicate) {
      throw new ConflictError('Ce référence de transaction externe a déjà été utilisée.');
    }
  }

  const paymentAmount = Number(payload.amount);
  const currentPaid = Number(invoice.amount_paid) || 0;
  const totalAmount = Number(invoice.total) || 0;
  const remaining = totalAmount - currentPaid - (Number(invoice.credit_applied) || 0);

  if (paymentAmount <= 0) {
    throw new BadRequestError('Le montant du paiement doit être supérieur à zéro.');
  }

  if (paymentAmount > remaining) {
    throw new BadRequestError(`Le montant dépasse le reste à payer (${remaining} XAF).`, {
      remaining,
      requested: paymentAmount,
    });
  }

  const { generateId } = await import('../utils/id.js');
  const id = generateId();

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO payments
        (id, company_id, invoice_id, amount, currency, method, status,
         reference, transaction_reference, notes, paid_at, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, 'XAF', ?, 'completed', ?, ?, ?, NOW(), ?, NOW(), NOW())`,
      [
        id, companyId, payload.invoiceId, paymentAmount,
        payload.method || 'cash',
        payload.reference || null,
        payload.transactionReference || null,
        payload.notes || null, userId,
      ]
    );

    const newAmountPaid = currentPaid + paymentAmount;
    await conn.query(
      'UPDATE invoices SET amount_paid = ?, updated_at = NOW() WHERE id = ?',
      [newAmountPaid, payload.invoiceId]
    );

    if (newAmountPaid >= totalAmount) {
      await conn.query(
        "UPDATE invoices SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = ?",
        [payload.invoiceId]
      );
    } else {
      await conn.query(
        "UPDATE invoices SET status = 'partially_paid', updated_at = NOW() WHERE id = ?",
        [payload.invoiceId]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const payment = await getPaymentById(id, companyId);

  recordAudit({
    companyId, userId,
    action: 'payment.create',
    actionType: 'CREATE',
    entityType: 'payment',
    entityId: id,
    description: `Paiement ${paymentAmount} XAF pour facture ${invoice.reference}`,
    newValues: { amount: paymentAmount, method: payload.method, invoiceReference: invoice.reference },
  }).catch(() => {});

  return payment;
}

export async function refundPayment(id, { companyId, userId }) {
  const row = await paymentRepository.findById(id);
  if (!row || row.company_id !== companyId) {
    throw new NotFoundError('Paiement');
  }

  if (row.status === 'refunded') {
    throw new ConflictError('Ce paiement a déjà été remboursé.');
  }

  if (row.status !== 'completed') {
    throw new BadRequestError('Seuls les paiements complétés peuvent être remboursés.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      "UPDATE payments SET status = 'refunded', updated_at = NOW() WHERE id = ?",
      [id]
    );

    const invoice = await invoiceRepository.findById(row.invoice_id);
    if (invoice) {
      const newAmountPaid = Math.max(0, (Number(invoice.amount_paid) || 0) - Number(row.amount));
      let newStatus = 'partially_paid';
      if (newAmountPaid <= 0) {
        newStatus = 'draft';
      }
      await conn.query(
        'UPDATE invoices SET amount_paid = ?, status = ?, updated_at = NOW() WHERE id = ?',
        [newAmountPaid, newStatus, row.invoice_id]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await getPaymentById(id, companyId);

  recordAudit({
    companyId, userId,
    action: 'payment.refund',
    actionType: 'UPDATE',
    entityType: 'payment',
    entityId: id,
    description: `Remboursement paiement ${row.amount} XAF`,
    oldValues: { status: row.status },
    newValues: { status: 'refunded' },
  }).catch(() => {});

  return updated;
}

export async function getPaymentStatistics(companyId) {
  return paymentRepository.getStatistics(companyId);
}

export async function overdueCheck(companyId) {
  const pool = getPool();
  const result = await pool.query(
    `UPDATE invoices SET status = 'overdue', updated_at = NOW()
     WHERE company_id = ? AND status IN ('issued', 'sent')
     AND due_at IS NOT NULL AND due_at < NOW() AND deleted_at IS NULL`,
    [companyId]
  );
  return { updatedCount: result.affectedRows || 0 };
}
