import { BaseRepository } from './BaseRepository.js';

class AgencyRepository extends BaseRepository {
  constructor() {
    super('agencies');
  }

  async findByCompanyId({ page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const conditions = ['a.company_id = ?', 'a.deleted_at IS NULL'];
    const params = [filters.company_id];

    if (filters.status) {
      conditions.push('a.status = ?');
      params.push(filters.status);
    }
    if (filters.search) {
      conditions.push('(a.name LIKE ? OR a.code LIKE ? OR a.city LIKE ?)');
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
    const offset = (safePage - 1) * safeLimit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM agencies a ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const allowedSort = ['name', 'code', 'status', 'created_at', 'updated_at'].includes(sort) ? sort : 'created_at';
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const rows = await this.query(
      `SELECT a.*,
        (SELECT COUNT(*) FROM vehicles v WHERE v.agency_id = a.id AND v.deleted_at IS NULL) AS vehicle_count,
        0 AS driver_count
       FROM agencies a ${where}
       ORDER BY a.${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return { rows, total };
  }

  async findByIdWithCounts(id) {
    return this.queryOne(
      `SELECT a.*,
        (SELECT COUNT(*) FROM vehicles v WHERE v.agency_id = a.id AND v.deleted_at IS NULL) AS vehicle_count,
        0 AS driver_count
       FROM agencies a
       WHERE a.id = ? AND a.deleted_at IS NULL`,
      [id]
    );
  }

  async findVehiclesByAgency(agencyId) {
    return this.query(
      `SELECT * FROM vehicles WHERE agency_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [agencyId]
    );
  }

  async findDriversByAgency(agencyId) {
    return this.query(
      `SELECT * FROM drivers WHERE agency_id = ? AND deleted_at IS NULL ORDER BY created_at DESC`,
      [agencyId]
    );
  }

  async getStats(companyId) {
    const result = await this.queryOne(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) AS closed
       FROM agencies WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    return result || { total: 0, active: 0, inactive: 0, closed: 0 };
  }

  async findByCompanyAndCode(companyId, code, excludeId = null) {
    let sql = `SELECT id FROM agencies WHERE company_id = ? AND code = ? AND deleted_at IS NULL`;
    const params = [companyId, code];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }

  async getRecentActivity(agencyId, limit = 10) {
    const rows = await this.query(
      `(SELECT 'vehicle' AS type, v.brand AS title, v.status AS description, v.created_at AS date
        FROM vehicles v WHERE v.agency_id = ? AND v.deleted_at IS NULL
        UNION ALL
        SELECT 'driver' AS type, d.full_name AS title, d.status AS description, d.created_at AS date
        FROM drivers d WHERE d.agency_id = ? AND d.deleted_at IS NULL
        ORDER BY date DESC LIMIT ?)`,
      [agencyId, agencyId, limit]
    );
    return rows;
  }

  async activate(id) {
    return this.query(
      `UPDATE agencies SET status = 'active', is_active = TRUE, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  async deactivate(id) {
    return this.query(
      `UPDATE agencies SET status = 'inactive', is_active = FALSE, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }
}

export default new AgencyRepository();
