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
       WHERE r.code = ? OR r.name = ?`,
      [roleCode, roleCode]
    );
  }

  async findAll() {
    return this.query(
      `SELECT id, name, code, module, action, description FROM permissions ORDER BY module, action`
    );
  }

  async findByModule(module) {
    return this.query(
      `SELECT id, name, code, module, action, description FROM permissions WHERE module = ? ORDER BY action`,
      [module]
    );
  }

  async getModules() {
    return this.query(
      `SELECT module, COUNT(*) as count FROM permissions GROUP BY module ORDER BY module`
    );
  }

  async getStatistics() {
    const total = await this.queryOne(`SELECT COUNT(*) as count FROM permissions`);
    const byModule = await this.getModules();
    return {
      total: total?.count || 0,
      modules: byModule.length,
      byModule,
    };
  }

  async findByCode(code) {
    return this.queryOne(
      `SELECT * FROM ${this.tableName} WHERE code = ?`,
      [code]
    );
  }

  async findManyByCodes(codes) {
    if (!codes || codes.length === 0) return [];
    const placeholders = codes.map(() => '?').join(', ');
    return this.query(
      `SELECT id, name, code, module, action FROM ${this.tableName} WHERE code IN (${placeholders})`,
      codes
    );
  }
}

export default new PermissionRepository();
