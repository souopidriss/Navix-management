import { BaseRepository } from './BaseRepository.js';

class InvoiceRepository extends BaseRepository {
  constructor() {
    super('invoices');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'client_id', 'partner_id', 'status',
      'deleted_at',
    ];
  }

  allowedSortFields() {
    return [
      'id', 'total', 'amount_paid', 'created_at', 'updated_at',
      'issued_at', 'due_at', 'status', 'reference',
    ];
  }

  async findByCompanyIdWithDetails(companyId, { page = 1, limit = 20, sort = 'created_at', order = 'DESC', filters = {} } = {}) {
    const conditions = ['i.company_id = ?', 'i.deleted_at IS NULL'];
    const params = [companyId];

    if (filters.status) { conditions.push('i.status = ?'); params.push(filters.status); }
    if (filters.client_id) { conditions.push('i.client_id = ?'); params.push(filters.client_id); }
    if (filters.partner_id) { conditions.push('i.partner_id = ?'); params.push(filters.partner_id); }

    if (filters.dateFrom) {
      conditions.push('i.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('i.created_at <= ?');
      params.push(filters.dateTo);
    }

    if (filters.search) {
      conditions.push('(i.reference LIKE ? OR i.notes LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM invoices i ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT i.*,
        c.name as client_name,
        p.name as partner_name
       FROM invoices i
       LEFT JOIN clients c ON c.id = i.client_id
       LEFT JOIN partners p ON p.id = i.partner_id
       ${where}
       ORDER BY i.${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findItemsByInvoiceId(invoiceId) {
    return this.query(
      `SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC, created_at ASC`,
      [invoiceId]
    );
  }

  async getNextReference(companyId) {
    const now = new Date();
    const year = now.getFullYear();
    const prefix = `INV-${year}`;

    const last = await this.queryOne(
      `SELECT reference FROM invoices WHERE company_id = ? AND reference LIKE ? ORDER BY created_at DESC LIMIT 1`,
      [companyId, `${prefix}-%`]
    );

    if (last) {
      const match = last.reference.match(/-(\d{4,})$/);
      const next = match ? Number(match[1]) + 1 : 1;
      return `${prefix}-${String(next).padStart(6, '0')}`;
    }
    return `${prefix}-000001`;
  }

  async getStatistics(companyId) {
    const stats = await this.queryOne(
      `SELECT
        COUNT(*) as totalCount,
        COALESCE(SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END), 0) as draftCount,
        COALESCE(SUM(CASE WHEN status = 'issued' OR status = 'sent' THEN 1 ELSE 0 END), 0) as issuedCount,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END), 0) as paidCount,
        COALESCE(SUM(CASE WHEN status = 'partially_paid' THEN 1 ELSE 0 END), 0) as partiallyPaidCount,
        COALESCE(SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END), 0) as overdueCount,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelledCount,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END), 0) as refundedCount,
        COALESCE(SUM(total), 0) as totalAmount,
        COALESCE(SUM(amount_paid), 0) as totalPaid,
        COALESCE(SUM(total) - SUM(amount_paid), 0) as totalOutstanding
       FROM invoices
       WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    return stats || {};
  }

  async updateAmountPaid(invoiceId, amountPaid, connection = null) {
    const executor = connection || this;
    await executor.query(
      `UPDATE invoices SET amount_paid = ?, updated_at = NOW() WHERE id = ?`,
      [amountPaid, invoiceId]
    );
  }
}

export default new InvoiceRepository();
