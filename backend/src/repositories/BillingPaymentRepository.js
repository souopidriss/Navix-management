import { BaseRepository } from './BaseRepository.js';

class BillingPaymentRepository extends BaseRepository {
  constructor() {
    super('billing_payments');
  }

  allowedFilterFields() {
    return ['id', 'company_id', 'invoice_id', 'status', 'method', 'number'];
  }

  allowedSortFields() {
    return ['id', 'created_at', 'updated_at', 'payment_date', 'amount', 'status', 'number'];
  }

  async findByCompanyIdWithDetails(companyId, { page = 1, limit = 20, sort = 'created_at', order = 'DESC', filters = {} } = {}) {
    const conditions = ['bp.company_id = ?'];
    const params = [companyId];

    if (filters.status) { conditions.push('bp.status = ?'); params.push(filters.status); }
    if (filters.method) { conditions.push('bp.method = ?'); params.push(filters.method); }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSort = ['created_at', 'updated_at', 'payment_date', 'amount', 'status', 'number'].includes(sort) ? `bp.${sort}` : 'bp.created_at';
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM billing_payments bp ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT bp.* FROM billing_payments bp ${where} ORDER BY ${allowedSort} ${allowedOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async getNextNumber(companyId) {
    const settings = await this.queryOne(
      'SELECT next_payment_number FROM billing_settings WHERE company_id = ?',
      [companyId]
    );
    const num = settings?.next_payment_number || 1;
    return `PAY-${new Date().getFullYear()}-${String(num).padStart(6, '0')}`;
  }

  async incrementPaymentNumber(companyId) {
    await this.queryOne(
      'UPDATE billing_settings SET next_payment_number = next_payment_number + 1 WHERE company_id = ?',
      [companyId]
    );
  }

  async hasDuplicateReference(reference, excludeId = null) {
    if (!reference) return false;
    let sql = 'SELECT 1 as exists_flag FROM billing_payments WHERE transaction_reference = ?';
    const params = [reference];
    if (excludeId) { sql += ' AND id != ?'; params.push(excludeId); }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }

  async getStatistics(companyId) {
    return this.queryOne(
      `SELECT
        COUNT(*) as totalPayments,
        SUM(CASE WHEN status = 'successful' THEN 1 ELSE 0 END) as successfulPayments,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedPayments,
        COALESCE(SUM(CASE WHEN status = 'successful' THEN amount ELSE 0 END), 0) as totalAmount,
        COALESCE(SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END), 0) as refundedAmount
       FROM billing_payments WHERE company_id = ?`,
      [companyId]
    );
  }
}

export default new BillingPaymentRepository();
