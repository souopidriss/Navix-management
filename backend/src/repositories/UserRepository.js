import { BaseRepository } from './BaseRepository.js';

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return this.queryOne(
      `SELECT * FROM ${this.tableName} WHERE email = ? AND deleted_at IS NULL`,
      [email]
    );
  }

  async findByIdWithCompany(id) {
    return this.queryOne(
      `SELECT u.*, c.name AS company_name, c.slug AS company_slug
       FROM ${this.tableName} u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
  }

  async findWithRoles(id) {
    const user = await this.queryOne(
      `SELECT u.*, c.name AS company_name
       FROM ${this.tableName} u
       LEFT JOIN companies c ON u.company_id = c.id
       WHERE u.id = ? AND u.deleted_at IS NULL`,
      [id]
    );
    if (!user) return null;

    const roles = await this.query(
      `SELECT r.id, r.name, r.code, r.display_name
       FROM roles r
       INNER JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = ?`,
      [id]
    );

    return { ...user, roles };
  }

  async findByCompanyId({ page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const conditions = ['u.deleted_at IS NULL'];
    const params = [];

    if (filters.company_id) {
      conditions.push('u.company_id = ?');
      params.push(filters.company_id);
    }
    if (filters.status) {
      conditions.push('u.status = ?');
      params.push(filters.status);
    }
    if (filters.role) {
      conditions.push('u.role = ?');
      params.push(filters.role);
    }
    if (filters.search) {
      conditions.push('(u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)');
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
    const offset = (safePage - 1) * safeLimit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM ${this.tableName} u ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const allowedSort = ['first_name', 'last_name', 'email', 'role', 'status', 'created_at', 'updated_at', 'last_login_at'];
    const safeSort = allowedSort.includes(sort) ? sort : 'created_at';
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const rows = await this.query(
      `SELECT u.id, u.company_id, u.email, u.first_name, u.last_name, u.role, u.phone,
              u.avatar_url, u.status, u.last_login_at, u.created_at, u.updated_at
       FROM ${this.tableName} u ${where}
       ORDER BY u.${safeSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return { rows, total };
  }

  async getStatistics(companyId) {
    let where = 'WHERE deleted_at IS NULL';
    const params = [];
    if (companyId) {
      where += ' AND company_id = ?';
      params.push(companyId);
    }
    return this.queryOne(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) AS inactive,
        SUM(CASE WHEN status = 'suspended' THEN 1 ELSE 0 END) AS suspended,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending
       FROM ${this.tableName} ${where}`,
      params
    );
  }

  async findByCompanyAndEmail(companyId, email, excludeId = null) {
    let sql = `SELECT id FROM ${this.tableName} WHERE company_id = ? AND email = ? AND deleted_at IS NULL`;
    const params = [companyId, email];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }

  async activate(id) {
    return this.query(
      `UPDATE ${this.tableName} SET status = 'active', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  async deactivate(id) {
    return this.query(
      `UPDATE ${this.tableName} SET status = 'inactive', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  async suspend(id) {
    return this.query(
      `UPDATE ${this.tableName} SET status = 'suspended', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  async reactivate(id) {
    return this.query(
      `UPDATE ${this.tableName} SET status = 'active', updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  async updateLastLogin(id) {
    return this.query(
      `UPDATE ${this.tableName} SET last_login_at = NOW(), updated_at = NOW() WHERE id = ?`,
      [id]
    );
  }

  async updatePasswordHash(id, passwordHash) {
    return this.query(
      `UPDATE ${this.tableName} SET password_hash = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [passwordHash, id]
    );
  }

  async updateStatus(id, status) {
    return this.query(
      `UPDATE ${this.tableName} SET status = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL`,
      [status, id]
    );
  }
}

export default new UserRepository();
