import { BaseRepository } from './BaseRepository.js';

class VehicleRepository extends BaseRepository {
  constructor() {
    super('vehicles');
  }

  allowedFilterFields() {
    return [...super.allowedFilterFields(), 'agency_id', 'vehicle_type_id', 'fuel_type', 'transmission', 'group_code', 'category', 'is_active'];
  }

  allowedSortFields() {
    return ['id', 'brand', 'model', 'year', 'mileage', 'status', 'fuel_type', 'group_code', 'created_at', 'updated_at'];
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
    const { where, params } = this.buildWhereClause(baseFilters, 'v');
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM vehicles v ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(`
      SELECT v.*, vt.name AS type_name, vt.display_name AS type_display_name,
        vg.name AS group_name, vg.display_name AS group_display_name
      FROM vehicles v
      LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
      LEFT JOIN vehicle_groups vg ON vg.code = v.group_code
      ${where}
      ORDER BY v.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async findByIdWithDetails(id) {
    return this.queryOne(`
      SELECT v.*, vt.name AS type_name, vt.display_name AS type_display_name,
        vg.name AS group_name, vg.display_name AS group_display_name
      FROM vehicles v
      LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
      LEFT JOIN vehicle_groups vg ON vg.code = v.group_code
      WHERE v.id = ? AND v.deleted_at IS NULL
    `, [id]);
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(`
      SELECT v.*, vt.name AS type_name, vt.display_name AS type_display_name,
        vg.name AS group_name, vg.display_name AS group_display_name
      FROM vehicles v
      LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
      LEFT JOIN vehicle_groups vg ON vg.code = v.group_code
      WHERE v.id = ? AND v.company_id = ? AND v.deleted_at IS NULL
    `, [id, companyId]);
  }

  async registrationExists(companyId, registrationNumber, excludeId = null) {
    let sql = 'SELECT 1 as exists_flag FROM vehicles WHERE company_id = ? AND registration_number = ? AND deleted_at IS NULL';
    const params = [companyId, registrationNumber];
    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }
    sql += ' LIMIT 1';
    const result = await this.queryOne(sql, params);
    return !!result;
  }

  async vinExists(vin, excludeId = null) {
    if (!vin) return false;
    let sql = 'SELECT 1 as exists_flag FROM vehicles WHERE vin = ? AND deleted_at IS NULL';
    const params = [vin];
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
        SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) AS available,
        SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) AS in_use,
        SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) AS maintenance,
        SUM(CASE WHEN status = 'out_of_service' THEN 1 ELSE 0 END) AS out_of_service,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive
      FROM vehicles
      WHERE company_id = ? AND deleted_at IS NULL
    `, [companyId]);
    const row = rows[0];
    return {
      total: Number(row.total) || 0,
      available: Number(row.available) || 0,
      inUse: Number(row.in_use) || 0,
      maintenance: Number(row.maintenance) || 0,
      outOfService: Number(row.out_of_service) || 0,
      active: Number(row.active) || 0,
      inactive: Number(row.inactive) || 0,
    };
  }

  async getGroupStats(companyId) {
    return this.query(`
      SELECT v.group_code, vg.name AS group_name, vg.display_name AS group_display_name,
        COUNT(*) AS count
      FROM vehicles v
      LEFT JOIN vehicle_groups vg ON vg.code = v.group_code
      WHERE v.company_id = ? AND v.deleted_at IS NULL
      GROUP BY v.group_code, vg.name, vg.display_name
      ORDER BY count DESC
    `, [companyId]);
  }

  async countByCompany(companyId) {
    const result = await this.queryOne(
      'SELECT COUNT(*) as total FROM vehicles WHERE company_id = ? AND deleted_at IS NULL',
      [companyId]
    );
    return result?.total || 0;
  }

  async search(companyId, searchTerm, { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = {}) {
    const searchPattern = `%${searchTerm}%`;
    const where = 'WHERE v.company_id = ? AND v.deleted_at IS NULL AND (v.registration_number LIKE ? OR v.vin LIKE ? OR v.brand LIKE ? OR v.model LIKE ? OR v.engine_number LIKE ?)';
    const params = [companyId, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM vehicles v ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(`
      SELECT v.*, vt.name AS type_name, vt.display_name AS type_display_name,
        vg.name AS group_name, vg.display_name AS group_display_name
      FROM vehicles v
      LEFT JOIN vehicle_types vt ON vt.id = v.vehicle_type_id
      LEFT JOIN vehicle_groups vg ON vg.code = v.group_code
      ${where}
      ORDER BY v.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async findDependencies(vehicleId) {
    const tables = [
      { name: 'assignments', column: 'vehicle_id' },
      { name: 'missions', column: 'vehicle_id' },
      { name: 'maintenance', column: 'vehicle_id' },
      { name: 'fuel', column: 'vehicle_id' },
      { name: 'trips', column: 'vehicle_id' },
    ];

    const dependencies = [];
    for (const table of tables) {
      try {
        const result = await this.queryOne(
          `SELECT COUNT(*) as count FROM ${table.name} WHERE ${table.column} = ?`,
          [vehicleId]
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
}

export default new VehicleRepository();
