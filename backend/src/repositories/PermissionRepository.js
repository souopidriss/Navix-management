import { BaseRepository } from './BaseRepository.js';

class PermissionRepository extends BaseRepository {
  constructor() {
    super('permissions');
  }

  async findByRoleId(roleId) {
    return this.query(
      `SELECT p.id, p.name, p.code, p.module, p.action
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       WHERE rp.role_id = ?`,
      [roleId]
    );
  }

  async findByRoleCode(roleCode) {
    return this.query(
      `SELECT p.id, p.name, p.code, p.module, p.action
       FROM permissions p
       INNER JOIN role_permissions rp ON p.id = rp.permission_id
       INNER JOIN roles r ON rp.role_id = r.id
       WHERE r.code = ?`,
      [roleCode]
    );
  }

  async findAll() {
    return this.query(
      `SELECT id, name, code, module, action FROM permissions ORDER BY module, action`
    );
  }

  async findByModule(module) {
    return this.query(
      `SELECT id, name, code, module, action FROM permissions WHERE module = ? ORDER BY action`,
      [module]
    );
  }
}

export default new PermissionRepository();
