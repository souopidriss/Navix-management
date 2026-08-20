import { BaseRepository } from './BaseRepository.js';

class BillingHistoryRepository extends BaseRepository {
  constructor() {
    super('billing_history');
  }

  async findByCompanyId(companyId, { page = 1, limit = 20 } = {}) {
    const countResult = await this.queryOne(
      'SELECT COUNT(*) as total FROM billing_history WHERE company_id = ?',
      [companyId]
    );
    const total = countResult?.total || 0;
    const offset = (page - 1) * limit;

    const rows = await this.query(
      'SELECT * FROM billing_history WHERE company_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [companyId, limit, offset]
    );

    return { rows, total };
  }
}

export default new BillingHistoryRepository();
