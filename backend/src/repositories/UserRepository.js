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
