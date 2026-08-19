import { BaseRepository } from './BaseRepository.js';

class CompanyRepository extends BaseRepository {
  constructor() {
    super('companies');
  }

  buildWhereClause(filters, prefix = '') {
    const conditions = [];
    const params = [];
    const pfx = prefix ? `${prefix}.` : '';

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        const safeKey = this.sanitizeFilterKey(key);
        if (safeKey) {
          conditions.push(`${pfx}${safeKey} = ?`);
          params.push(value);
        }
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
  }

  allowedFilterFields() {
    return [...super.allowedFilterFields(), 'slug', 'legal_name', 'country', 'city', 'subscription_plan', 'subscription_status', 'is_active'];
  }

  allowedSortFields() {
    return ['id', 'name', 'code', 'slug', 'status', 'created_at', 'updated_at'];
  }

  async findBySlug(slug) {
    return this.queryOne(
      'SELECT * FROM companies WHERE slug = ? AND deleted_at IS NULL',
      [slug]
    );
  }

  async findByCode(code) {
    return this.queryOne(
      'SELECT * FROM companies WHERE code = ? AND deleted_at IS NULL',
      [code]
    );
  }

  async findByIdWithOwner(id) {
    return this.queryOne(`
      SELECT c.*,
        u.id AS owner_id, u.first_name AS owner_first_name, u.last_name AS owner_last_name,
        u.email AS owner_email
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.role IN ('company_owner', 'client_enterprise') AND u.deleted_at IS NULL
      WHERE c.id = ? AND c.deleted_at IS NULL
    `, [id]);
  }

  async findWithCounts(id) {
    return this.queryOne(`
      SELECT c.*,
        (SELECT COUNT(*) FROM vehicles v WHERE v.company_id = c.id AND v.deleted_at IS NULL) AS vehicle_count,
        (SELECT COUNT(*) FROM drivers d WHERE d.company_id = c.id AND d.deleted_at IS NULL) AS driver_count,
        (SELECT COUNT(*) FROM agencies a WHERE a.company_id = c.id AND a.deleted_at IS NULL) AS agency_count
      FROM companies c
      WHERE c.id = ? AND c.deleted_at IS NULL
    `, [id]);
  }

  async findListWithCounts({ page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const { where, params } = this.buildWhereClause(filters, 'c');
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM companies c ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(`
      SELECT c.*,
        u.id AS owner_id, u.first_name AS owner_first_name, u.last_name AS owner_last_name,
        u.email AS owner_email,
        (SELECT COUNT(*) FROM vehicles v WHERE v.company_id = c.id AND v.deleted_at IS NULL) AS vehicle_count,
        (SELECT COUNT(*) FROM drivers d WHERE d.company_id = c.id AND d.deleted_at IS NULL) AS driver_count,
        (SELECT COUNT(*) FROM agencies a WHERE a.company_id = c.id AND a.deleted_at IS NULL) AS agency_count
      FROM companies c
      LEFT JOIN users u ON u.company_id = c.id AND u.role IN ('company_owner', 'client_enterprise') AND u.deleted_at IS NULL
      ${where}
      ORDER BY c.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async countActive() {
    const result = await this.queryOne(
      "SELECT COUNT(*) as total FROM companies WHERE deleted_at IS NULL AND status = 'active'"
    );
    return result?.total || 0;
  }

  async emailExists(email, excludeId = null) {
    let sql = 'SELECT 1 as exists_flag FROM companies WHERE email = ? AND deleted_at IS NULL';
    const params = [email];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }

  async codeExists(code, excludeId = null) {
    let sql = 'SELECT 1 as exists_flag FROM companies WHERE code = ? AND deleted_at IS NULL';
    const params = [code];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }

  async slugExists(slug, excludeId = null) {
    let sql = 'SELECT 1 as exists_flag FROM companies WHERE slug = ? AND deleted_at IS NULL';
    const params = [slug];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }
}

export default new CompanyRepository();
