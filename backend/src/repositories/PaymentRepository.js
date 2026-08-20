import { BaseRepository } from './BaseRepository.js';

class PaymentRepository extends BaseRepository {
  constructor() {
    super('payments');
  }

  allowedFilterFields() {
    return ['id', 'company_id', 'invoice_id', 'status', 'method', 'created_by'];
  }

  allowedSortFields() {
    return ['id', 'amount', 'created_at', 'updated_at', 'paid_at', 'status'];
  }

  async findByCompanyIdWithDetails(companyId, { page = 1, limit = 20, sort = 'created_at', order = 'DESC', filters = {} } = {}) {
    const conditions = ['p.company_id = ?'];
    const params = [companyId];

    if (filters.invoice_id) { conditions.push('p.invoice_id = ?'); params.push(filters.invoice_id); }
    if (filters.status) { conditions.push('p.status = ?'); params.push(filters.status); }
    if (filters.method) { conditions.push('p.method = ?'); params.push(filters.method); }

    if (filters.search) {
      conditions.push('(p.reference LIKE ? OR p.transaction_reference LIKE ? OR p.notes LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM payments p ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT p.*,
        i.reference as invoice_reference,
        i.total as invoice_total,
        i.amount_paid as invoice_amount_paid
       FROM payments p
       LEFT JOIN invoices i ON i.id = p.invoice_id
       ${where}
       ORDER BY p.${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async getTotalPaidForInvoice(invoiceId, connection = null) {
    const executor = connection || this;
    const result = await executor.queryOne(
      `SELECT COALESCE(SUM(amount), 0) as totalPaid
       FROM payments
       WHERE invoice_id = ? AND status IN ('completed')`,
      [invoiceId]
    );
    return Number(result?.totalPaid) || 0;
  }

  async getStatistics(companyId) {
    const stats = await this.queryOne(
      `SELECT
        COUNT(*) as totalCount,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END), 0) as totalCompleted,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as totalPending,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN amount ELSE 0 END), 0) as totalFailed,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as totalRefunded,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END), 0) as completedCount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pendingCount
       FROM payments
       WHERE company_id = ?`,
      [companyId]
    );
    return stats || {};
  }

  async hasDuplicateReference(companyId, invoiceId, transactionReference) {
    if (!transactionReference) return false;
    const existing = await this.queryOne(
      `SELECT id FROM payments WHERE company_id = ? AND invoice_id = ? AND transaction_reference = ? AND status != 'failed'`,
      [companyId, invoiceId, transactionReference]
    );
    return !!existing;
  }
}

export default new PaymentRepository();
