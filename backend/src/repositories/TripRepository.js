import { BaseRepository } from './BaseRepository.js';
import { getPool } from '../database/index.js';

class TripRepository extends BaseRepository {
  constructor() {
    super('trips');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'vehicle_id', 'driver_id', 'assignment_id',
      'mission_id', 'status', 'trip_type', 'created_by',
      'created_at', 'updated_at', 'deleted_at',
    ];
  }

  allowedSortFields() {
    return [
      'id', 'created_at', 'updated_at', 'departure_date',
      'arrival_date', 'status', 'trip_number', 'trip_type',
      'actual_distance', 'actual_duration',
    ];
  }

  SELECT_WITH_JOINS = `t.*,
    v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
    v.model AS vehicle_model, v.mileage AS vehicle_mileage,
    d.first_name AS driver_first_name, d.last_name AS driver_last_name,
    d.full_name AS driver_full_name, d.employee_code AS driver_employee_code,
    d.phone AS driver_phone,
    a.assignment_number, a.assignment_type`;

  FROM_WITH_JOINS = `trips t
    LEFT JOIN vehicles v ON v.id = t.vehicle_id
    LEFT JOIN drivers d ON d.id = t.driver_id
    LEFT JOIN assignments a ON a.id = t.assignment_id`;

  async findByCompanyId(companyId, { page = 1, limit = 20, filters = {}, sort = 'departure_date', order = 'DESC' } = {}) {
    const conditions = ['t.company_id = ?', 't.deleted_at IS NULL'];
    const params = [companyId];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        const safeKey = this.sanitizeFilterKey(key);
        if (safeKey) {
          conditions.push(`t.${safeKey} = ?`);
          params.push(value);
        }
      }
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM trips t ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      ${where}
      ORDER BY t.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findByIdWithDetails(id) {
    return this.queryOne(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      WHERE t.id = ?`,
      [id]
    );
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      WHERE t.id = ? AND t.company_id = ? AND t.deleted_at IS NULL`,
      [id, companyId]
    );
  }

  async getNextTripNumber(companyId) {
    const result = await this.queryOne(
      `SELECT trip_number FROM trips WHERE company_id = ? ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );
    if (!result) return 'TRP-0001';
    const match = result.trip_number.match(/(\d+)$/);
    if (!match) return 'TRP-0001';
    const next = Number(match[1]) + 1;
    return `TRP-${String(next).padStart(4, '0')}`;
  }

  async getActiveByDriver(driverId) {
    return this.queryOne(
      `SELECT t.id, t.status FROM trips t
      WHERE t.driver_id = ? AND t.status IN ('in_progress', 'suspended') AND t.deleted_at IS NULL
      LIMIT 1`,
      [driverId]
    );
  }

  async findActiveTripByDriver(driverId) {
    return this.queryOne(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      WHERE t.driver_id = ? AND t.status IN ('in_progress', 'suspended') AND t.deleted_at IS NULL
      LIMIT 1`,
      [driverId]
    );
  }

  async findByDriverId(driverId, companyId, { page = 1, limit = 20, sort = 'departure_date', order = 'DESC' } = {}) {
    const conditions = ['t.driver_id = ?', 't.company_id = ?', 't.deleted_at IS NULL'];
    const params = [driverId, companyId];
    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM trips t ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      ${where}
      ORDER BY t.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findByAssignmentId(assignmentId, companyId) {
    return this.query(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      WHERE t.assignment_id = ? AND t.company_id = ? AND t.deleted_at IS NULL
      ORDER BY t.departure_date DESC`,
      [assignmentId, companyId]
    );
  }

  async getHistory(companyId, { page = 1, limit = 20, sort = 'departure_date', order = 'DESC' } = {}) {
    const conditions = ['t.company_id = ?', 't.deleted_at IS NULL', "t.status IN ('completed', 'cancelled')"];
    const params = [companyId];
    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM trips t ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      ${where}
      ORDER BY t.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async getStats(companyId) {
    const rows = await this.query(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) AS planned,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended
      FROM trips
      WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    const row = rows[0] || {};
    return {
      total: Number(row.total || 0),
      planned: Number(row.planned || 0),
      in_progress: Number(row.in_progress || 0),
      completed: Number(row.completed || 0),
      cancelled: Number(row.cancelled || 0),
      suspended: Number(row.suspended || 0),
    };
  }

  async search(companyId, searchTerm, { page = 1, limit = 20, sort = 'departure_date', order = 'DESC' } = {}) {
    const like = `%${searchTerm}%`;
    const conditions = [
      't.company_id = ?', 't.deleted_at IS NULL',
      `(t.trip_number LIKE ? OR t.origin LIKE ? OR t.destination LIKE ? OR t.purpose LIKE ?
        OR v.registration_number LIKE ? OR d.full_name LIKE ? OR d.employee_code LIKE ?)`,
    ];
    const params = [companyId, like, like, like, like, like, like, like];

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM trips t
        LEFT JOIN vehicles v ON v.id = t.vehicle_id
        LEFT JOIN drivers d ON d.id = t.driver_id
        ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT ${this.SELECT_WITH_JOINS}
      FROM ${this.FROM_WITH_JOINS}
      ${where}
      ORDER BY t.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async countByCompany(companyId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as count FROM trips WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    return result?.count || 0;
  }

  async beginTransaction() {
    const connection = await getPool().getConnection();
    await connection.beginTransaction();
    return connection;
  }

  async commitTransaction(connection) {
    await connection.commit();
    connection.release();
  }

  async rollbackTransaction(connection) {
    await connection.rollback();
    connection.release();
  }

  async queryWithConnection(connection, sql, params = []) {
    const [rows] = await connection.execute(sql, params);
    return rows;
  }

  async queryOneWithConnection(connection, sql, params = []) {
    const rows = await this.queryWithConnection(connection, sql, params);
    return rows[0] || null;
  }
}

export default new TripRepository();
