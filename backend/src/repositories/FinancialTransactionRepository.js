import { BaseRepository } from './BaseRepository.js';

class FinancialTransactionRepository extends BaseRepository {
  constructor() {
    super('financial_transactions');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'account_id', 'transaction_type', 'status',
      'direction', 'method', 'category', 'entity_type', 'entity_id',
      'created_by', 'deleted_at',
    ];
  }

  allowedSortFields() {
    return [
      'id', 'amount', 'created_at', 'updated_at', 'transaction_date',
      'status', 'transaction_type', 'direction',
    ];
  }

  async findByCompanyIdWithDetails(companyId, { page = 1, limit = 20, sort = 'transaction_date', order = 'DESC', filters = {} } = {}) {
    const conditions = ['t.company_id = ?'];
    const params = [companyId];

    if (filters.transaction_type) { conditions.push('t.transaction_type = ?'); params.push(filters.transaction_type); }
    if (filters.status) { conditions.push('t.status = ?'); params.push(filters.status); }
    if (filters.direction) { conditions.push('t.direction = ?'); params.push(filters.direction); }
    if (filters.method) { conditions.push('t.method = ?'); params.push(filters.method); }
    if (filters.category) { conditions.push('t.category = ?'); params.push(filters.category); }
    if (filters.entity_type) { conditions.push('t.entity_type = ?'); params.push(filters.entity_type); }
    if (filters.entity_id) { conditions.push('t.entity_id = ?'); params.push(filters.entity_id); }
    if (filters.account_id) { conditions.push('t.account_id = ?'); params.push(filters.account_id); }

    if (filters.dateFrom) {
      conditions.push('t.transaction_date >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('t.transaction_date <= ?');
      params.push(filters.dateTo);
    }

    if (filters.search) {
      conditions.push('(t.reference LIKE ? OR t.description LIKE ? OR t.label LIKE ? OR t.source LIKE ? OR t.destination LIKE ? OR t.counterparty LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like, like, like, like, like);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM financial_transactions t ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT t.*, fa.name as account_name
       FROM financial_transactions t
       LEFT JOIN financial_accounts fa ON fa.id = t.account_id
       ${where}
       ORDER BY t.${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async getNextReference(companyId) {
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const prefix = `TRX-${dateStr}`;

    const last = await this.queryOne(
      `SELECT reference FROM financial_transactions WHERE company_id = ? AND reference LIKE ? ORDER BY created_at DESC LIMIT 1`,
      [companyId, `${prefix}-%`]
    );

    if (last) {
      const match = last.reference.match(/-(\d{3,})$/);
      const next = match ? Number(match[1]) + 1 : 1;
      return `${prefix}-${String(next).padStart(3, '0')}`;
    }
    return `${prefix}-001`;
  }

  async getStatistics(companyId, { dateFrom, dateTo } = {}) {
    const conditions = ['company_id = ?', 'status IN ("completed", "success")'];
    const params = [companyId];

    if (dateFrom) { conditions.push('transaction_date >= ?'); params.push(dateFrom); }
    if (dateTo) { conditions.push('transaction_date <= ?'); params.push(dateTo); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const stats = await this.queryOne(
      `SELECT
        COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) as totalIncome,
        COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) as totalExpense,
        COUNT(*) as transactionCount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pendingCount,
        COALESCE(SUM(CASE WHEN status = 'completed' OR status = 'success' THEN 1 ELSE 0 END), 0) as completedCount,
        COALESCE(SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END), 0) as failedCount,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelledCount
       FROM financial_transactions ${where}`,
      params
    );

    const now = new Date();
    const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const currentMonthEnd = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31 23:59:59`;

    const monthStats = await this.queryOne(
      `SELECT
        COALESCE(SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END), 0) as incomeMonth,
        COALESCE(SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END), 0) as expenseMonth,
        COUNT(*) as transactionsMonth
       FROM financial_transactions
       WHERE company_id = ? AND status IN ('completed', 'success')
       AND transaction_date >= ? AND transaction_date <= ?`,
      [companyId, currentMonthStart, currentMonthEnd]
    );

    return {
      ...stats,
      incomeMonth: Number(monthStats?.incomeMonth) || 0,
      expenseMonth: Number(monthStats?.expenseMonth) || 0,
      transactionsMonth: Number(monthStats?.transactionsMonth) || 0,
      netBalance: (Number(stats?.totalIncome) || 0) - (Number(stats?.totalExpense) || 0),
    };
  }

  async getMonthlyEvolution(companyId, months = 6) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

    const rows = await this.query(
      `SELECT
        DATE_FORMAT(transaction_date, '%Y-%m') as month,
        SUM(CASE WHEN direction = 'in' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN direction = 'out' THEN amount ELSE 0 END) as expense
       FROM financial_transactions
       WHERE company_id = ? AND status IN ('completed', 'success')
       AND transaction_date >= ?
       GROUP BY DATE_FORMAT(transaction_date, '%Y-%m')
       ORDER BY month ASC`,
      [companyId, startDate]
    );

    return rows.map(r => ({
      month: r.month,
      income: Number(r.income) || 0,
      expense: Number(r.expense) || 0,
      balance: (Number(r.income) || 0) - (Number(r.expense) || 0),
    }));
  }

  async getVehicleCosts(companyId, vehicleId) {
    const row = await this.queryOne(
      `SELECT
        COALESCE(SUM(amount), 0) as totalCost,
        COUNT(*) as transactionCount
       FROM financial_transactions
       WHERE company_id = ? AND entity_type = 'vehicle' AND entity_id = ? AND status IN ('completed', 'success')`,
      [companyId, vehicleId]
    );
    return row || { totalCost: 0, transactionCount: 0 };
  }

  async getCategoryStats(companyId, { dateFrom, dateTo } = {}) {
    const conditions = ['company_id = ?', 'status IN ("completed", "success")'];
    const params = [companyId];

    if (dateFrom) { conditions.push('transaction_date >= ?'); params.push(dateFrom); }
    if (dateTo) { conditions.push('transaction_date <= ?'); params.push(dateTo); }

    const where = `WHERE ${conditions.join(' AND ')}`;

    const rows = await this.query(
      `SELECT category, transaction_type, direction,
        SUM(amount) as totalAmount, COUNT(*) as count
       FROM financial_transactions ${where}
       GROUP BY category, transaction_type, direction
       ORDER BY totalAmount DESC`,
      params
    );

    return rows.map(r => ({
      category: r.category || r.transaction_type,
      transactionType: r.transaction_type,
      direction: r.direction,
      totalAmount: Number(r.totalAmount) || 0,
      count: Number(r.count) || 0,
    }));
  }
}

export default new FinancialTransactionRepository();
