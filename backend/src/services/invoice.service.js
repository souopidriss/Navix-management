import invoiceRepository from '../repositories/InvoiceRepository.js';
import { getPool } from '../database/index.js';
import { NotFoundError, ConflictError } from '../errors/index.js';
import { INVOICE_STATUS_TRANSITIONS } from '../modules/finance/index.js';
import { recordAudit } from './audit.service.js';

function formatInvoiceResponse(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyId: row.company_id,
    clientId: row.client_id || null,
    partnerId: row.partner_id || null,
    clientName: row.client_name || null,
    partnerName: row.partner_name || null,
    reference: row.reference,
    status: row.status,
    subtotal: Number(row.subtotal) || 0,
    taxRate: Number(row.tax_rate) || 0,
    taxAmount: Number(row.tax_amount) || 0,
    total: Number(row.total) || 0,
    amountPaid: Number(row.amount_paid) || 0,
    creditApplied: Number(row.credit_applied) || 0,
    remaining: (Number(row.total) || 0) - (Number(row.amount_paid) || 0) - (Number(row.credit_applied) || 0),
    currency: row.currency || 'XAF',
    issuedAt: row.issued_at || null,
    dueAt: row.due_at || null,
    paidAt: row.paid_at || null,
    notes: row.notes || '',
    items: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function isValidTransition(currentStatus, newStatus) {
  const allowed = INVOICE_STATUS_TRANSITIONS[currentStatus];
  return allowed && allowed.includes(newStatus);
}

function computeTotals(items) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += Number(item.amount) || (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);
  }
  return subtotal;
}

export async function listInvoices(companyId, query) {
  const result = await invoiceRepository.findByCompanyIdWithDetails(companyId, query);
  const invoices = [];

  for (const row of result.rows) {
    const invoice = formatInvoiceResponse(row);
    invoice.items = (await invoiceRepository.findItemsByInvoiceId(row.id)).map(item => ({
      id: item.id,
      description: item.description,
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unit_price) || 0,
      amount: Number(item.amount) || 0,
      itemKind: item.item_kind,
      sortOrder: item.sort_order,
    }));
    invoices.push(invoice);
  }

  return {
    data: invoices,
    pagination: {
      total: result.total,
      page: query.page || 1,
      limit: query.limit || 20,
      totalPages: Math.ceil(result.total / (query.limit || 20)),
    },
  };
}

export async function getInvoiceById(id, companyId) {
  const row = await invoiceRepository.findById(id);
  if (!row || row.company_id !== companyId || row.deleted_at) {
    throw new NotFoundError('Facture');
  }
  const invoice = formatInvoiceResponse(row);
  invoice.items = (await invoiceRepository.findItemsByInvoiceId(id)).map(item => ({
    id: item.id,
    description: item.description,
    quantity: Number(item.quantity) || 1,
    unitPrice: Number(item.unit_price) || 0,
    amount: Number(item.amount) || 0,
    itemKind: item.item_kind,
    sortOrder: item.sort_order,
  }));
  return invoice;
}

export async function createInvoice(payload, { companyId, userId }) {
  const reference = await invoiceRepository.getNextReference(companyId);
  const { generateId } = await import('../utils/id.js');
  const id = generateId();

  const items = payload.items || [];
  const subtotal = computeTotals(items);
  const taxRate = payload.taxRate !== null && payload.taxRate !== undefined ? Number(payload.taxRate) : 0.18;
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + taxAmount;

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `INSERT INTO invoices
        (id, company_id, client_id, partner_id, reference, status, subtotal,
         tax_rate, tax_amount, total, amount_paid, credit_applied, currency,
         issued_at, due_at, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, 0, 0, 'XAF', NULL, ?, ?, NOW(), NOW())`,
      [
        id, companyId, payload.clientId || null, payload.partnerId || null,
        reference, subtotal, taxRate, taxAmount, total,
        payload.dueAt || null, payload.notes || null,
      ]
    );

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const itemId = generateId();
      const itemAmount = Number(item.amount) || (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);
      await conn.query(
        `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount, item_kind, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          itemId, id, item.description, item.quantity || 1,
          item.unit_price || 0, itemAmount,
          item.item_kind || 'usage', i,
        ]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const invoice = await getInvoiceById(id, companyId);

  recordAudit({
    companyId, userId,
    action: 'invoice.create',
    actionType: 'CREATE',
    entityType: 'invoice',
    entityId: id,
    description: `Facture ${reference} créée: ${total} XAF`,
    newValues: { reference, total, status: 'draft' },
  }).catch(() => {});

  return invoice;
}

export async function updateInvoiceStatus(id, newStatus, { companyId, userId }) {
  const row = await invoiceRepository.findById(id);
  if (!row || row.company_id !== companyId || row.deleted_at) {
    throw new NotFoundError('Facture');
  }

  if (!isValidTransition(row.status, newStatus)) {
    throw new ConflictError(`Transition de ${row.status} vers ${newStatus} non autorisée.`);
  }

  const updates = { status: newStatus };
  if (newStatus === 'issued' || newStatus === 'sent') {
    updates.issued_at = new Date().toISOString();
  }
  if (newStatus === 'paid') {
    updates.paid_at = new Date().toISOString();
    updates.amount_paid = row.total;
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    const setClauses = ['status = ?', 'updated_at = NOW()'];
    const params = [newStatus];

    if (updates.issued_at) { setClauses.push('issued_at = ?'); params.push(updates.issued_at); }
    if (updates.paid_at) { setClauses.push('paid_at = ?'); params.push(updates.paid_at); }
    if (updates.amount_paid !== null && updates.amount_paid !== undefined) { setClauses.push('amount_paid = ?'); params.push(updates.amount_paid); }

    params.push(id);
    await conn.query(
      `UPDATE invoices SET ${setClauses.join(', ')} WHERE id = ?`,
      params
    );

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await getInvoiceById(id, companyId);

  recordAudit({
    companyId, userId,
    action: `invoice.${newStatus}`,
    actionType: 'UPDATE',
    entityType: 'invoice',
    entityId: id,
    description: `Facture ${row.reference} → ${newStatus}`,
    oldValues: { status: row.status },
    newValues: { status: newStatus },
  }).catch(() => {});

  return updated;
}

export async function updateInvoice(id, payload, { companyId, userId }) {
  const row = await invoiceRepository.findById(id);
  if (!row || row.company_id !== companyId || row.deleted_at) {
    throw new NotFoundError('Facture');
  }

  if (row.status !== 'draft') {
    throw new ConflictError('Seules les factures en brouillon peuvent être modifiées.');
  }

  const conn = await getPool().getConnection();
  try {
    await conn.beginTransaction();

    if (payload.clientId !== undefined) {
      await conn.query('UPDATE invoices SET client_id = ?, updated_at = NOW() WHERE id = ?', [payload.clientId, id]);
    }
    if (payload.partnerId !== undefined) {
      await conn.query('UPDATE invoices SET partner_id = ?, updated_at = NOW() WHERE id = ?', [payload.partnerId, id]);
    }
    if (payload.dueAt !== undefined) {
      await conn.query('UPDATE invoices SET due_at = ?, updated_at = NOW() WHERE id = ?', [payload.dueAt, id]);
    }
    if (payload.notes !== undefined) {
      await conn.query('UPDATE invoices SET notes = ?, updated_at = NOW() WHERE id = ?', [payload.notes, id]);
    }

    if (payload.items && payload.items.length > 0) {
      await conn.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);

      const { generateId } = await import('../utils/id.js');
      let subtotal = 0;
      for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        const itemId = generateId();
        const itemAmount = Number(item.amount) || (Number(item.quantity) || 1) * (Number(item.unit_price) || 0);
        subtotal += itemAmount;
        await conn.query(
          `INSERT INTO invoice_items (id, invoice_id, description, quantity, unit_price, amount, item_kind, sort_order, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
          [itemId, id, item.description, item.quantity || 1, item.unit_price || 0, itemAmount, item.item_kind || 'usage', i]
        );
      }

      const taxRate = payload.taxRate !== null && payload.taxRate !== undefined ? Number(payload.taxRate) : Number(row.tax_rate);
      const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
      const total = subtotal + taxAmount;
      await conn.query(
        'UPDATE invoices SET subtotal = ?, tax_rate = ?, tax_amount = ?, total = ?, updated_at = NOW() WHERE id = ?',
        [subtotal, taxRate, taxAmount, total, id]
      );
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }

  const updated = await getInvoiceById(id, companyId);

  recordAudit({
    companyId, userId,
    action: 'invoice.update',
    actionType: 'UPDATE',
    entityType: 'invoice',
    entityId: id,
    description: `Facture ${row.reference} mise à jour`,
  }).catch(() => {});

  return updated;
}

export async function deleteInvoice(id, { companyId, userId }) {
  const row = await invoiceRepository.findById(id);
  if (!row || row.company_id !== companyId || row.deleted_at) {
    throw new NotFoundError('Facture');
  }

  if (row.status !== 'draft') {
    throw new ConflictError('Seules les factures en brouillon peuvent être supprimées.');
  }



  await invoiceRepository.softDelete(id);

  recordAudit({
    companyId, userId,
    action: 'invoice.delete',
    actionType: 'DELETE',
    entityType: 'invoice',
    entityId: id,
    description: `Facture ${row.reference} supprimée`,
  }).catch(() => {});
}

export async function getInvoiceStatistics(companyId) {
  return invoiceRepository.getStatistics(companyId);
}
