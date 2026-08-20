import { BaseRepository } from './BaseRepository.js';

class BillingInvoiceRepository extends BaseRepository {
  constructor() {
    super('billing_invoices');
  }

  allowedFilterFields() {
    return ['id', 'company_id', 'subscription_id', 'status', 'number'];
  }

  allowedSortFields() {
    return ['id', 'created_at', 'updated_at', 'issued_date', 'due_date', 'total', 'status', 'number'];
  }

  async findByCompanyIdWithDetails(companyId, { page = 1, limit = 20, sort = 'created_at', order = 'DESC', filters = {} } = {}) {
    const conditions = ['bi.company_id = ?'];
    const params = [companyId];

    if (filters.status) { conditions.push('bi.status = ?'); params.push(filters.status); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSort = ['created_at', 'updated_at', 'issued_date', 'due_date', 'total', 'status', 'number'].includes(sort) ? `bi.${sort}` : 'bi.created_at';
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM billing_invoices bi ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT bi.*
       FROM billing_invoices bi
       ${where}
       ORDER BY ${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findItemsByInvoiceId(invoiceId) {
    return this.query(
      'SELECT * FROM billing_invoice_items WHERE invoice_id = ? ORDER BY created_at ASC',
      [invoiceId]
    );
  }

  async findWithItems(id) {
    const invoice = await this.findById(id);
    if (!invoice) return null;
    const items = await this.findItemsByInvoiceId(id);
    return { ...invoice, items };
  }

  async getNextNumber(companyId) {
    const settings = await this.queryOne(
      'SELECT next_invoice_number, invoice_prefix FROM billing_settings WHERE company_id = ?',
      [companyId]
    );
    const prefix = settings?.invoice_prefix || 'NAVIX';
    const num = settings?.next_invoice_number || 1;
    return `${prefix}-${new Date().getFullYear()}-${String(num).padStart(6, '0')}`;
  }

  async getStatistics(companyId) {
    const stats = await this.queryOne(
      `SELECT
        COUNT(*) as totalInvoices,
        SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paidInvoices,
        SUM(CASE WHEN status IN ('issued', 'overdue') THEN 1 ELSE 0 END) as unpaidInvoices,
        SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdueInvoices,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draftInvoices,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelledInvoices,
        SUM(CASE WHEN status = 'refunded' THEN 1 ELSE 0 END) as refundedInvoices,
        COALESCE(SUM(total), 0) as totalBilled,
        COALESCE(SUM(amount_paid), 0) as collected,
        COALESCE(SUM(amount_due), 0) as outstanding
       FROM billing_invoices WHERE company_id = ?`,
      [companyId]
    );
    return {
      ...stats,
      overdue: stats?.overdueInvoices || 0,
      collectionRate: stats?.totalBilled > 0 ? Number(((stats?.collected || 0) / stats.totalBilled * 100).toFixed(1)) : 0,
      currency: 'XAF',
    };
  }
}

export default new BillingInvoiceRepository();
