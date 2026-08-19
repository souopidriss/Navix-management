import { BaseRepository } from './BaseRepository.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super('notifications');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'user_id', 'type', 'category', 'severity',
      'status', 'is_read', 'kind', 'entity_type', 'entity_id', 'created_at',
    ];
  }

  allowedSortFields() {
    return ['created_at', 'severity', 'type', 'status', 'updated_at'];
  }

  async findById(id) {
    return this.queryOne(
      `SELECT * FROM notifications WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT * FROM notifications WHERE id = ? AND company_id = ? AND deleted_at IS NULL`,
      [id, companyId]
    );
  }

  async findByUserAndId(userId, id, companyId = null) {
    const conditions = ['id = ?', 'user_id = ?', 'deleted_at IS NULL'];
    const params = [id, userId];
    if (companyId) {
      conditions.push('company_id = ?');
      params.push(companyId);
    }
    return this.queryOne(
      `SELECT * FROM notifications WHERE ${conditions.join(' AND ')}`,
      params
    );
  }

  async findByUserAll(userId, { page = 1, limit = 50, sort = 'created_at', order = 'DESC', status, type, severity, category } = {}) {
    const conditions = ['user_id = ?', 'deleted_at IS NULL'];
    const params = [userId];

    if (status) { conditions.push('status = ?'); params.push(status); }
    if (type) { conditions.push('type = ?'); params.push(type); }
    if (severity) { conditions.push('severity = ?'); params.push(severity); }
    if (category) { conditions.push('category = ?'); params.push(category); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM notifications ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT * FROM notifications ${where} ORDER BY ${allowedSort} ${allowedOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findByCompanyAll(companyId, { page = 1, limit = 50, sort = 'created_at', order = 'DESC', status, type, severity, category, userId } = {}) {
    const conditions = ['company_id = ?', 'deleted_at IS NULL'];
    const params = [companyId];

    if (userId) { conditions.push('user_id = ?'); params.push(userId); }
    if (status) { conditions.push('status = ?'); params.push(status); }
    if (type) { conditions.push('type = ?'); params.push(type); }
    if (severity) { conditions.push('severity = ?'); params.push(severity); }
    if (category) { conditions.push('category = ?'); params.push(category); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM notifications ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT * FROM notifications ${where} ORDER BY ${allowedSort} ${allowedOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findUnreadCount(userId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND status = 'unread' AND deleted_at IS NULL`,
      [userId]
    );
    return result?.count || 0;
  }

  async findUnreadCountByCompany(companyId) {
    const result = await this.queryOne(
      `SELECT COUNT(*) as count FROM notifications WHERE company_id = ? AND status = 'unread' AND deleted_at IS NULL`,
      [companyId]
    );
    return result?.count || 0;
  }

  async markAsRead(id) {
    await this.query(
      `UPDATE notifications SET status = 'read', is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE id = ? AND status = 'unread' AND deleted_at IS NULL`,
      [id]
    );
    return this.findById(id);
  }

  async markAsUnread(id) {
    await this.query(
      `UPDATE notifications SET status = 'unread', is_read = 0, read_at = NULL WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return this.findById(id);
  }

  async markAllAsRead(userId, companyId = null) {
    const conditions = ['user_id = ?', 'status = \'unread\'', 'deleted_at IS NULL'];
    const params = [userId];
    if (companyId) {
      conditions.push('company_id = ?');
      params.push(companyId);
    }
    const result = await this.query(
      `UPDATE notifications SET status = 'read', is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE ${conditions.join(' AND ')}`,
      params
    );
    return result.affectedRows || 0;
  }

  async archive(id) {
    await this.query(
      `UPDATE notifications SET status = 'archived', is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return this.findById(id);
  }

  async dismiss(id) {
    await this.query(
      `UPDATE notifications SET status = 'dismissed', is_read = 1, read_at = COALESCE(read_at, NOW()) WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    return this.findById(id);
  }

  async findByKindAndEntity(kind, entityType, entityId, companyId) {
    return this.queryOne(
      `SELECT id FROM notifications WHERE kind = ? AND entity_type = ? AND entity_id = ? AND company_id = ? AND status != 'archived' AND deleted_at IS NULL`,
      [kind, entityType, entityId, companyId]
    );
  }

  async getStats(userId) {
    return this.queryOne(
      `SELECT
        COUNT(*) AS totalCount,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) AS unreadCount,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) AS readCount,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archivedCount,
        SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS dismissedCount,
        SUM(CASE WHEN severity = 'critical' AND status = 'unread' THEN 1 ELSE 0 END) AS criticalUnread,
        SUM(CASE WHEN severity = 'high' AND status = 'unread' THEN 1 ELSE 0 END) AS highUnread
      FROM notifications WHERE user_id = ? AND deleted_at IS NULL`,
      [userId]
    );
  }

  async getStatsByCompany(companyId) {
    return this.queryOne(
      `SELECT
        COUNT(*) AS totalCount,
        SUM(CASE WHEN status = 'unread' THEN 1 ELSE 0 END) AS unreadCount,
        SUM(CASE WHEN status = 'read' THEN 1 ELSE 0 END) AS readCount,
        SUM(CASE WHEN status = 'archived' THEN 1 ELSE 0 END) AS archivedCount,
        SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS dismissedCount,
        SUM(CASE WHEN severity = 'critical' AND status = 'unread' THEN 1 ELSE 0 END) AS criticalUnread,
        SUM(CASE WHEN severity = 'high' AND status = 'unread' THEN 1 ELSE 0 END) AS highUnread
      FROM notifications WHERE company_id = ? AND deleted_at IS NULL`,
      [companyId]
    );
  }

  async formatResponse(row) {
    if (!row) return null;
    let metadata = null;
    if (row.metadata) {
      if (typeof row.metadata === 'string') {
        try { metadata = JSON.parse(row.metadata); } catch { metadata = null; }
      } else {
        metadata = row.metadata;
      }
    }
    return {
      id: row.id,
      companyId: row.company_id,
      userId: row.user_id,
      kind: row.kind || '',
      type: row.type,
      category: row.category,
      severity: row.severity,
      title: row.title,
      message: row.message || '',
      status: row.status,
      isRead: Boolean(row.is_read),
      readAt: row.read_at || null,
      resourceType: row.entity_type || '',
      resourceId: row.entity_id || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at,
      expiresAt: row.expires_at || null,
      metadata,
    };
  }
}

export default new NotificationRepository();
