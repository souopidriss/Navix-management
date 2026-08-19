import { BaseRepository } from './BaseRepository.js';

class AuthSessionRepository extends BaseRepository {
  constructor() {
    super('auth_sessions');
  }

  async createSession({ userId, refreshTokenHash, ipAddress, userAgent, expiresAt }) {
    const id = this.generateId();
    await this.query(
      `INSERT INTO ${this.tableName} (id, user_id, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, refreshTokenHash, ipAddress || null, userAgent || null, expiresAt]
    );
    return id;
  }

  async findValidByTokenHash(tokenHash) {
    return this.queryOne(
      `SELECT * FROM ${this.tableName}
       WHERE refresh_token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()
       LIMIT 1`,
      [tokenHash]
    );
  }

  async revokeSession(sessionId) {
    await this.query(
      `UPDATE ${this.tableName} SET revoked_at = NOW() WHERE id = ? AND revoked_at IS NULL`,
      [sessionId]
    );
  }

  async revokeAllByUser(userId) {
    await this.query(
      `UPDATE ${this.tableName} SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`,
      [userId]
    );
  }

  async updateLastUsed(sessionId) {
    await this.query(
      `UPDATE ${this.tableName} SET last_used_at = NOW() WHERE id = ?`,
      [sessionId]
    );
  }

  async cleanupExpired() {
    const result = await this.query(
      `DELETE FROM ${this.tableName} WHERE expires_at < NOW() OR revoked_at IS NOT NULL`
    );
    return result.affectedRows;
  }

  async countActiveByUser(userId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as count FROM ${this.tableName}
       WHERE user_id = ? AND revoked_at IS NULL AND expires_at > NOW()`,
      [userId]
    );
    return result?.count || 0;
  }
}

export default new AuthSessionRepository();
