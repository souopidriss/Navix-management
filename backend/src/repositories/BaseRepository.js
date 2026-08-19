import { generateId } from '../utils/id.js';
import { getPool } from '../database/index.js';

const ALLOWED_FILTER_FIELDS = [
  'id', 'company_id', 'created_at', 'updated_at', 'deleted_at',
  'status', 'name', 'email', 'phone', 'code', 'type',
];

export class BaseRepository {
  constructor(tableName) {
    this.tableName = tableName;
  }

  get db() {
    return getPool();
  }

  async query(sql, params = []) {
    const [rows] = await this.db.query(sql, params);
    return rows;
  }

  async queryOne(sql, params = []) {
    const rows = await this.query(sql, params);
    return rows[0] || null;
  }

  sanitizeFilterKey(key) {
    const allowed = this.allowedFilterFields();
    if (allowed.includes(key)) return key;
    return null;
  }

  allowedFilterFields() {
    return ALLOWED_FILTER_FIELDS;
  }

  buildWhereClause(filters) {
    const conditions = [];
    const params = [];

    for (const [key, value] of Object.entries(filters)) {
      if (value !== undefined && value !== null && value !== '') {
        const safeKey = this.sanitizeFilterKey(key);
        if (safeKey) {
          conditions.push(`${safeKey} = ?`);
          params.push(value);
        }
      }
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    return { where, params };
  }

  async findById(id) {
    return this.queryOne(`SELECT * FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async findAll({ page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const { where, params } = this.buildWhereClause(filters);
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT * FROM ${this.tableName} ${where} ORDER BY ${allowedSort} ${allowedOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async create(data) {
    const id = data.id || generateId();
    const now = new Date().toISOString();
    const record = { id, ...data, created_at: data.created_at || now, updated_at: now };

    const keys = Object.keys(record);
    const values = Object.values(record);
    const placeholders = keys.map(() => '?').join(', ');

    await this.query(
      `INSERT INTO ${this.tableName} (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );

    return record;
  }

  async update(id, data) {
    const now = new Date().toISOString();
    const updateData = { ...data, updated_at: now };

    const keys = Object.keys(updateData);
    const values = Object.values(updateData);
    const setClause = keys.map((k) => `${k} = ?`).join(', ');

    await this.query(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = ?`,
      [...values, id]
    );

    return this.findById(id);
  }

  async delete(id) {
    return this.query(`DELETE FROM ${this.tableName} WHERE id = ?`, [id]);
  }

  async softDelete(id) {
    const now = new Date().toISOString();
    return this.query(
      `UPDATE ${this.tableName} SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL`,
      [now, id]
    );
  }

  async count(filters = {}) {
    const { where, params } = this.buildWhereClause(filters);
    const result = await this.queryOne(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${where}`,
      params
    );
    return result?.total || 0;
  }

  async exists(filters) {
    const { where, params } = this.buildWhereClause(filters);
    const result = await this.queryOne(
      `SELECT 1 as exists_flag FROM ${this.tableName} ${where} LIMIT 1`,
      params
    );
    return !!result;
  }

  sanitizeSortField(field) {
    const allowed = this.allowedSortFields();
    if (allowed.includes(field)) return field;
    return 'created_at';
  }

  allowedSortFields() {
    return ['id', 'created_at', 'updated_at'];
  }

  generateId() {
    return generateId();
  }
}
