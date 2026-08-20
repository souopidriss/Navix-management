import { BaseRepository } from './BaseRepository.js';
import { getPool } from '../database/index.js';

class AssignmentRepository extends BaseRepository {
  constructor() {
    super('assignments');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'agency_id', 'vehicle_id', 'driver_id',
      'status', 'assignment_type', 'start_date', 'end_date',
      'created_at', 'updated_at', 'deleted_at',
    ];
  }

  allowedSortFields() {
    return [
      'id', 'created_at', 'updated_at', 'start_date', 'end_date',
      'status', 'assignment_number', 'assignment_type',
    ];
  }

  async findByCompanyId(companyId, { page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const conditions = ['a.company_id = ?', 'a.deleted_at IS NULL'];
    const params = [companyId];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        const safeKey = this.sanitizeFilterKey(key);
        if (safeKey) {
          conditions.push(`a.${safeKey} = ?`);
          params.push(value);
        }
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM assignments a ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT a.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model, v.status AS vehicle_status,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        d.full_name AS driver_full_name, d.employee_code AS driver_employee_code,
        d.status AS driver_status,
        ag.name AS agency_name
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      LEFT JOIN drivers d ON d.id = a.driver_id
      LEFT JOIN agencies ag ON ag.id = a.agency_id
      ${where}
      ORDER BY a.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async findByIdWithDetails(id) {
    return this.queryOne(
      `SELECT a.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model, v.status AS vehicle_status,
        v.mileage AS vehicle_mileage, v.fuel_type AS vehicle_fuel_type,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        d.full_name AS driver_full_name, d.employee_code AS driver_employee_code,
        d.phone AS driver_phone, d.status AS driver_status,
        ag.name AS agency_name
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      LEFT JOIN drivers d ON d.id = a.driver_id
      LEFT JOIN agencies ag ON ag.id = a.agency_id
      WHERE a.id = ?
    `, [id]);
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT a.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model, v.status AS vehicle_status,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        d.full_name AS driver_full_name, d.employee_code AS driver_employee_code,
        d.status AS driver_status,
        ag.name AS agency_name
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      LEFT JOIN drivers d ON d.id = a.driver_id
      LEFT JOIN agencies ag ON ag.id = a.agency_id
      WHERE a.id = ? AND a.company_id = ? AND a.deleted_at IS NULL
    `, [id, companyId]);
  }

  async findActiveByVehicle(vehicleId, excludeId = null) {
    let sql = `SELECT id FROM assignments WHERE vehicle_id = ? AND status = 'active' AND deleted_at IS NULL`;
    const params = [vehicleId];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }

  async findActiveByDriver(driverId, excludeId = null) {
    let sql = `SELECT id FROM assignments WHERE driver_id = ? AND status = 'active' AND deleted_at IS NULL`;
    const params = [driverId];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }

  async findOverlappingForVehicle(vehicleId, startDate, endDate, excludeId = null) {
    let sql = `
      SELECT id FROM assignments
      WHERE vehicle_id = ? AND status IN ('active', 'planned') AND deleted_at IS NULL
        AND (
          (end_date IS NULL AND ? >= start_date)
          OR (end_date IS NOT NULL AND ? <= end_date AND ? >= start_date)
        )
    `;
    const params = [vehicleId, startDate, endDate, startDate];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }

  async findOverlappingForDriver(driverId, startDate, endDate, excludeId = null) {
    let sql = `
      SELECT id FROM assignments
      WHERE driver_id = ? AND status IN ('active', 'planned') AND deleted_at IS NULL
        AND (
          (end_date IS NULL AND ? >= start_date)
          OR (end_date IS NOT NULL AND ? <= end_date AND ? >= start_date)
        )
    `;
    const params = [driverId, startDate, endDate, startDate];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }

  async getNextAssignmentNumber(companyId) {
    const result = await this.queryOne(
      `SELECT assignment_number FROM assignments WHERE company_id = ? ORDER BY created_at DESC LIMIT 1`,
      [companyId]
    );
    if (!result) return 'ASG-0001';
    const match = result.assignment_number.match(/(\d+)$/);
    if (!match) return 'ASG-0001';
    const next = Number(match[1]) + 1;
    return `ASG-${String(next).padStart(4, '0')}`;
  }

  async getCurrentByVehicle(vehicleId) {
    return this.queryOne(
      `SELECT a.*,
        d.full_name AS driver_full_name, d.employee_code AS driver_employee_code
      FROM assignments a
      LEFT JOIN drivers d ON d.id = a.driver_id
      WHERE a.vehicle_id = ? AND a.status = 'active' AND a.deleted_at IS NULL
    `, [vehicleId]);
  }

  async getCurrentByDriver(driverId) {
    return this.queryOne(
      `SELECT a.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      WHERE a.driver_id = ? AND a.status = 'active' AND a.deleted_at IS NULL
    `, [driverId]);
  }

  async getHistory(companyId, { page = 1, limit = 20, sort = 'end_date', order = 'DESC' } = {}) {
    const conditions = ['a.company_id = ?', 'a.deleted_at IS NULL', "a.status IN ('completed', 'cancelled')"];
    const params = [companyId];
    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM assignments a ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT a.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        d.full_name AS driver_full_name,
        ag.name AS agency_name
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      LEFT JOIN drivers d ON d.id = a.driver_id
      LEFT JOIN agencies ag ON ag.id = a.agency_id
      ${where}
      ORDER BY a.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async getStats(companyId) {
    const row = await this.queryOne(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'planned' THEN 1 ELSE 0 END) AS planned,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended
      FROM assignments
      WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    return {
      total: Number(row?.total || 0),
      active: Number(row?.active || 0),
      planned: Number(row?.planned || 0),
      completed: Number(row?.completed || 0),
      suspended: Number(row?.suspended || 0),
    };
  }

  async search(companyId, searchTerm, { page = 1, limit = 20, sort = 'created_at', order = 'DESC' } = {}) {
    const like = `%${searchTerm}%`;
    const conditions = [
      'a.company_id = ?', 'a.deleted_at IS NULL',
      `(a.assignment_number LIKE ? OR v.registration_number LIKE ? OR v.brand LIKE ?
        OR d.full_name LIKE ? OR d.employee_code LIKE ? OR a.destination LIKE ?)`,
    ];
    const params = [companyId, like, like, like, like, like, like];

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM assignments a
        LEFT JOIN vehicles v ON v.id = a.vehicle_id
        LEFT JOIN drivers d ON d.id = a.driver_id
        ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT a.*,
        v.registration_number AS vehicle_registration, v.brand AS vehicle_brand,
        v.model AS vehicle_model, v.status AS vehicle_status,
        d.first_name AS driver_first_name, d.last_name AS driver_last_name,
        d.full_name AS driver_full_name, d.employee_code AS driver_employee_code,
        d.status AS driver_status,
        ag.name AS agency_name
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      LEFT JOIN drivers d ON d.id = a.driver_id
      LEFT JOIN agencies ag ON ag.id = a.agency_id
      ${where}
      ORDER BY a.${allowedSort} ${allowedOrder}
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    return { rows, total };
  }

  async countByCompany(companyId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as count FROM assignments WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
    return result?.count || 0;
  }

  async findByVehicleId(vehicleId, companyId) {
    return this.query(
      `SELECT a.*, d.full_name AS driver_full_name
      FROM assignments a
      LEFT JOIN drivers d ON d.id = a.driver_id
      WHERE a.vehicle_id = ? AND a.company_id = ? AND a.deleted_at IS NULL
      ORDER BY a.start_date DESC`,
      [vehicleId, companyId]
    );
  }

  async findByDriverId(driverId, companyId) {
    return this.query(
      `SELECT a.*, v.registration_number AS vehicle_registration, v.brand AS vehicle_brand
      FROM assignments a
      LEFT JOIN vehicles v ON v.id = a.vehicle_id
      WHERE a.driver_id = ? AND a.company_id = ? AND a.deleted_at IS NULL
      ORDER BY a.start_date DESC`,
      [driverId, companyId]
    );
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

export default new AssignmentRepository();
