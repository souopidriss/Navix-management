import { BaseRepository } from './BaseRepository.js';

class DriverRepository extends BaseRepository {
  constructor() {
    super('drivers');
  }

  allowedFilterFields() {
    return [...super.allowedFilterFields(), 'agency_id', 'user_id', 'availability', 'license_category', 'is_active', 'gender'];
  }

  allowedSortFields() {
    return ['id', 'first_name', 'last_name', 'full_name', 'status', 'availability', 'license_expiry_date', 'years_experience', 'created_at', 'updated_at'];
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

  async findByCompanyId(companyId, { page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const baseFilters = { company_id: companyId, ...filters };
    const { where, params } = this.buildWhereClause(baseFilters, 'd');
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM drivers d ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(`
      SELECT d.*, a.name AS agency_name
      FROM drivers d
      LEFT JOIN agencies a ON a.id = d.agency_id
      ${where}
      ORDER BY d.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async findByIdWithDetails(id) {
    return this.queryOne(`
      SELECT d.*, a.name AS agency_name
      FROM drivers d
      LEFT JOIN agencies a ON a.id = d.agency_id
      WHERE d.id = ? AND d.deleted_at IS NULL
    `, [id]);
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(`
      SELECT d.*, a.name AS agency_name
      FROM drivers d
      LEFT JOIN agencies a ON a.id = d.agency_id
      WHERE d.id = ? AND d.company_id = ? AND d.deleted_at IS NULL
    `, [id, companyId]);
  }

  async employeeCodeExists(companyId, employeeCode, excludeId = null) {
    let sql = 'SELECT 1 as exists_flag FROM drivers WHERE company_id = ? AND employee_code = ? AND deleted_at IS NULL';
    const params = [companyId, employeeCode];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }

  async emailExists(companyId, email, excludeId = null) {
    if (!email) return false;
    let sql = 'SELECT 1 as exists_flag FROM drivers WHERE company_id = ? AND email = ? AND deleted_at IS NULL';
    const params = [companyId, email];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }

  async getStats(companyId) {
    const rows = await this.query(`
      SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'on_mission' THEN 1 ELSE 0 END) AS on_mission,
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available_status,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended,
        SUM(CASE WHEN status = 'on_leave' THEN 1 ELSE 0 END) AS on_leave,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive,
        SUM(CASE WHEN availability = 'available' THEN 1 ELSE 0 END) AS avail_available,
        SUM(CASE WHEN availability = 'busy' THEN 1 ELSE 0 END) AS avail_busy,
        SUM(CASE WHEN availability = 'unavailable' THEN 1 ELSE 0 END) AS avail_unavailable,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_flag,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_flag,
        SUM(CASE WHEN license_expiry_date IS NOT NULL AND license_expiry_date < CURDATE() THEN 1 ELSE 0 END) AS expired_licenses
      FROM drivers
      WHERE company_id = ? AND deleted_at IS NULL
    `, [companyId]);
    const row = rows[0];
    return {
      total: Number(row.total) || 0,
      active: Number(row.active) || 0,
      onMission: Number(row.on_mission) || 0,
      availableStatus: Number(row.available_status) || 0,
      suspended: Number(row.suspended) || 0,
      onLeave: Number(row.on_leave) || 0,
      inactive: Number(row.inactive) || 0,
      availAvailable: Number(row.avail_available) || 0,
      availBusy: Number(row.avail_busy) || 0,
      availUnavailable: Number(row.avail_unavailable) || 0,
      activeFlag: Number(row.active_flag) || 0,
      inactiveFlag: Number(row.inactive_flag) || 0,
      expiredLicenses: Number(row.expired_licenses) || 0,
    };
  }

  async countByCompany(companyId) {
    const result = await this.queryOne(
      'SELECT COUNT(*) as total FROM drivers WHERE company_id = ? AND deleted_at IS NULL',
      [companyId]
    );
    return result?.total || 0;
  }

  async search(companyId, searchTerm, { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = {}) {
    const searchPattern = `%${searchTerm}%`;
    const where = 'WHERE d.company_id = ? AND d.deleted_at IS NULL AND (d.first_name LIKE ? OR d.last_name LIKE ? OR d.full_name LIKE ? OR d.email LIKE ? OR d.phone LIKE ? OR d.employee_code LIKE ? OR d.license_number LIKE ?)';
    const params = [companyId, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM drivers d ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(`
      SELECT d.*, a.name AS agency_name
      FROM drivers d
      LEFT JOIN agencies a ON a.id = d.agency_id
      ${where}
      ORDER BY d.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async findDependencies(driverId) {
    const tables = [
      { name: 'assignments', column: 'driver_id' },
      { name: 'missions', column: 'driver_id' },
      { name: 'trips', column: 'driver_id' },
      { name: 'fuel', column: 'driver_id' },
    ];

    const dependencies = [];
    for (const table of tables) {
      try {
        const result = await this.queryOne(
          `SELECT COUNT(*) as count FROM ${table.name} WHERE ${table.column} = ?`,
          [driverId]
        );
        if (result?.count > 0) {
          dependencies.push({ table: table.name, count: result.count });
        }
      } catch {
        // table may not exist yet
      }
    }
    return dependencies;
  }

  async findByUserId(userId) {
    return this.queryOne(
      'SELECT * FROM drivers WHERE user_id = ? AND deleted_at IS NULL',
      [userId]
    );
  }
}

export default new DriverRepository();
