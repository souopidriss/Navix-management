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
}

export default new RoleRepository();
