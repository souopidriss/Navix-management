import { BaseRepository } from './BaseRepository.js';

class RoleRepository extends BaseRepository {
  constructor() {
    super('roles');
  }

  async findByCode(code) {
    return this.queryOne(
      `SELECT * FROM ${this.tableName} WHERE code = ? AND is_active = TRUE`,
      [code]
    );
  }

  async findByName(name) {
    return this.queryOne(
      `SELECT * FROM ${this.tableName} WHERE name = ? AND is_active = TRUE`,
      [name]
    );
  }

  async findWithPermissions(roleId) {
    const role = await this.findById(roleId);
    if (!role) return null;

    const permissions = await this.query(
      `SELECT p.id, p.name, p.code, p.module, p.action
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [roleId]
    );

    return { ...role, permissions };
  }

  async findByCodeWithPermissions(code) {
    const role = await this.findByCode(code);
    if (!role) return null;

    const permissions = await this.query(
      `SELECT p.id, p.name, p.code, p.module, p.action
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [role.id]
    );

    return { ...role, permissions };
  }

  async findWithPermissionsList(id) {
    const role = await this.findById(id);
    if (!role) return null;

    const permissions = await this.query(
      `SELECT p.code FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [id]
    );

    return { ...role, permissions: permissions.map((p) => p.code) };
  }

  async findAll({ page = 1, limit = 50, filters = {}, sort = 'created_at', order = 'DESC' } = {}) {
    const conditions = [];
    const params = [];

    if (filters.is_active !== undefined) {
      conditions.push('is_active = ?');
      params.push(filters.is_active);
    }
    if (filters.is_system !== undefined) {
      conditions.push('is_system = ?');
      params.push(filters.is_system);
    }
    if (filters.search) {
      conditions.push('(name LIKE ? OR code LIKE ? OR display_name LIKE ?)');
      const term = `%${filters.search}%`;
      params.push(term, term, term);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const safePage = Math.max(1, Math.floor(page));
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 100);
    const offset = (safePage - 1) * safeLimit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM ${this.tableName} ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const allowedSort = ['name', 'code', 'is_active', 'created_at', 'updated_at'];
    const safeSort = allowedSort.includes(sort) ? sort : 'created_at';
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const rows = await this.query(
      `SELECT r.*,
        (SELECT COUNT(*) FROM user_roles ur WHERE ur.role_id = r.id) AS users_count
       FROM ${this.tableName} r ${where}
       ORDER BY r.${safeSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return { rows, total };
  }

  async getPermissionIds(roleId) {
    const rows = await this.query(
      `SELECT permission_id FROM role_permissions WHERE role_id = ?`,
      [roleId]
    );
    return rows.map((r) => r.permission_id);
  }

  async syncPermissions(roleId, permissionIds) {
    await this.query(`DELETE FROM role_permissions WHERE role_id = ?`, [roleId]);
    if (permissionIds.length === 0) return;

    const now = new Date().toISOString();
    const values = permissionIds.map((pid) => `('${roleId}', '${pid}', '${now}')`).join(', ');
    await this.query(
      `INSERT INTO role_permissions (role_id, permission_id, created_at) VALUES ${values}`
    );
  }

  async countUsers(roleId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?`,
      [roleId]
    );
    return result?.count || 0;
  }

  async findByCodeOrName(code, name, excludeId = null) {
    let sql = `SELECT id FROM ${this.tableName} WHERE (code = ? OR name = ?)`;
    const params = [code, name];
    if (excludeId) {
      sql += ` AND id != ?`;
      params.push(excludeId);
    }
    return this.queryOne(sql, params);
  }
}

export default new RoleRepository();
