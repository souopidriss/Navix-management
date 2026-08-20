import { BaseRepository } from './BaseRepository.js';

class FinancialAccountRepository extends BaseRepository {
  constructor() {
    super('financial_accounts');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'account_type', 'status', 'currency', 'deleted_at',
    ];
  }

  allowedSortFields() {
    return ['id', 'balance', 'created_at', 'updated_at', 'name'];
  }

  async findByCompanyId(companyId, { page = 1, limit = 20, sort = 'created_at', order = 'DESC', filters = {} } = {}) {
    const conditions = ['company_id = ?', 'deleted_at IS NULL'];
    const params = [companyId];

    if (filters.account_type) { conditions.push('account_type = ?'); params.push(filters.account_type); }
    if (filters.status) { conditions.push('status = ?'); params.push(filters.status); }
    if (filters.search) {
      conditions.push('(name LIKE ? OR description LIKE ?)');
      const like = `%${filters.search}%`;
      params.push(like, like);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM financial_accounts ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT * FROM financial_accounts ${where} ORDER BY ${allowedSort} ${allowedOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async getDefaultAccount(companyId) {
    return this.queryOne(
      `SELECT * FROM financial_accounts WHERE company_id = ? AND status = 'active' AND deleted_at IS NULL ORDER BY account_type = 'main' DESC, created_at ASC LIMIT 1`,
      [companyId]
    );
  }

  async updateBalance(accountId, amount, connection = null) {
    const executor = connection || this;
    await executor.query(
      `UPDATE financial_accounts SET balance = balance + ?, total_in = IF(? > 0, total_in + ?, total_in), total_out = IF(? < 0, total_out + ABS(?), total_out), updated_at = NOW() WHERE id = ?`,
      [amount, amount, amount, amount, amount, accountId]
    );
  }

  async createDefaultAccount(companyId, currency = 'XAF') {
    const { generateId } = await import('../utils/id.js');
    const id = generateId();
    await this.query(
      `INSERT INTO financial_accounts (id, company_id, name, account_type, currency, balance, status) VALUES (?, ?, 'Compte principal', 'main', ?, 0, 'active')`,
      [id, companyId, currency]
    );
    return this.findById(id);
  }
}

export default new FinancialAccountRepository();
