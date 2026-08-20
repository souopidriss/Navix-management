import { BaseRepository } from './BaseRepository.js';

class AuditRepository extends BaseRepository {
  constructor() {
    super('audit_logs');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'user_id', 'action', 'action_type',
      'entity_type', 'entity_id', 'status', 'severity', 'created_at',
    ];
  }

  allowedSortFields() {
    return ['created_at', 'action', 'entity_type', 'status', 'severity', 'action_type'];
  }

  formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      companyId: row.company_id,
      companyName: row.company_name || null,
      agencyId: row.agency_id || null,
      agencyName: row.agency_name || null,
      userId: row.user_id,
      userName: row.user_name || null,
      action: row.action,
      actionType: row.action_type || null,
      resourceType: row.entity_type,
      resourceId: row.entity_id,
      resourceName: row.resource_name || null,
      description: row.description || null,
      status: row.status || 'success',
      severity: row.severity || 'low',
      ipAddress: row.ip_address || null,
      userAgent: row.user_agent || null,
      oldValues: this.safeJson(row.old_values),
      newValues: this.safeJson(row.new_values),
      metadata: this.safeJson(row.metadata),
      createdAt: row.created_at,
    };
  }

  safeJson(value) {
    if (!value) return null;
    if (typeof value === 'object') return value;
    try {
      return JSON.parse(value);
    } catch {
      return null;
    }
  }

  async findAllWithJoins({ page = 1, limit = 20, filters = {}, sort = 'created_at', order = 'DESC', search = '' } = {}) {
    const conditions = [];
    const params = [];

    if (filters.company_id) {
      conditions.push('a.company_id = ?');
      params.push(filters.company_id);
    }
    if (filters.user_id) {
      conditions.push('a.user_id = ?');
      params.push(filters.user_id);
    }
    if (filters.action) {
      conditions.push('a.action = ?');
      params.push(filters.action);
    }
    if (filters.action_type) {
      conditions.push('a.action_type = ?');
      params.push(filters.action_type);
    }
    if (filters.entity_type) {
      conditions.push('a.entity_type = ?');
      params.push(filters.entity_type);
    }
    if (filters.entity_id) {
      conditions.push('a.entity_id = ?');
      params.push(filters.entity_id);
    }
    if (filters.status) {
      conditions.push('a.status = ?');
      params.push(filters.status);
    }
    if (filters.severity) {
      conditions.push('a.severity = ?');
      params.push(filters.severity);
    }
    if (filters.dateFrom) {
      conditions.push('a.created_at >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      conditions.push('a.created_at <= ?');
      params.push(filters.dateTo);
    }
    if (search) {
      conditions.push('(a.description LIKE ? OR a.action LIKE ? OR a.entity_type LIKE ? OR a.entity_id LIKE ?)');
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM audit_logs a ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT a.*, c.name as company_name, u.first_name, u.last_name
       FROM audit_logs a
       LEFT JOIN companies c ON a.company_id = c.id
       LEFT JOIN users u ON a.user_id = u.id
       ${where}
       ORDER BY a.${allowedSort} ${allowedOrder}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const formatted = rows.map((row) => {
      const base = this.formatResponse(row);
      base.userName = row.first_name && row.last_name
        ? `${row.first_name} ${row.last_name}`
        : base.userName;
      return base;
    });

    return { rows: formatted, total };
  }

  async findByIdWithJoins(id) {
    const row = await this.queryOne(
      `SELECT a.*, c.name as company_name, u.first_name, u.last_name
       FROM audit_logs a
       LEFT JOIN companies c ON a.company_id = c.id
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    if (!row) return null;
    const base = this.formatResponse(row);
    base.userName = row.first_name && row.last_name
      ? `${row.first_name} ${row.last_name}`
      : base.userName;
    return base;
  }

  async getStatistics(companyId) {
    const companyFilter = companyId ? 'WHERE company_id = ?' : '';
    const companyParams = companyId ? [companyId] : [];

    const today = new Date().toISOString().slice(0, 10);

    const [totalResult] = await this.db.query(
      `SELECT COUNT(*) as total FROM audit_logs ${companyFilter}`,
      companyParams
    );
    const total = totalResult[0]?.total || 0;

    const [todayResult] = await this.db.query(
      `SELECT COUNT(*) as today FROM audit_logs ${companyFilter ? companyFilter + ' AND' : 'WHERE'} DATE(created_at) = ?`,
      [...companyParams, today]
    );
    const todayCount = todayResult[0]?.today || 0;

    const statusRows = await this.query(
      `SELECT status, COUNT(*) as count FROM audit_logs ${companyFilter} GROUP BY status`,
      companyParams
    );
    const byStatus = Object.fromEntries(statusRows.map((r) => [r.status, r.count]));

    const severityRows = await this.query(
      `SELECT severity, COUNT(*) as count FROM audit_logs ${companyFilter} GROUP BY severity`,
      companyParams
    );
    const bySeverity = Object.fromEntries(severityRows.map((r) => [r.severity, r.count]));

    const actionRows = await this.query(
      `SELECT action, COUNT(*) as count FROM audit_logs ${companyFilter} GROUP BY action ORDER BY count DESC`,
      companyParams
    );
    const byAction = Object.fromEntries(actionRows.map((r) => [r.action, r.count]));

    const resourceRows = await this.query(
      `SELECT entity_type, COUNT(*) as count FROM audit_logs ${companyFilter} GROUP BY entity_type ORDER BY count DESC`,
      companyParams
    );
    const byResource = Object.fromEntries(resourceRows.map((r) => [r.entity_type, r.count]));

    return {
      total,
      today: todayCount,
      success: byStatus.success || 0,
      failed: byStatus.failed || 0,
      warning: byStatus.warning || 0,
      info: byStatus.info || 0,
      critical: bySeverity.critical || 0,
      high: bySeverity.high || 0,
      medium: bySeverity.medium || 0,
      low: bySeverity.low || 0,
      byAction,
      byResource,
    };
  }
}

export default new AuditRepository();
