import { BaseRepository } from './BaseRepository.js';

class AlertRepository extends BaseRepository {
  constructor() {
    super('alerts');
  }

  allowedFilterFields() {
    return [
      'id', 'company_id', 'type', 'severity', 'status',
      'entity_type', 'entity_id', 'rule_code', 'acknowledged_by', 'created_at',
    ];
  }

  allowedSortFields() {
    return ['created_at', 'severity', 'type', 'status', 'updated_at'];
  }

  async findByCompanyIdAndId(companyId, id) {
    return this.queryOne(
      `SELECT * FROM alerts WHERE id = ? AND company_id = ?`,
      [id, companyId]
    );
  }

  async findByCompanyAll(companyId, { page = 1, limit = 50, sort = 'created_at', order = 'DESC', status, type, severity } = {}) {
    const conditions = ['company_id = ?'];
    const params = [companyId];

    if (status) { conditions.push('status = ?'); params.push(status); }
    if (type) { conditions.push('type = ?'); params.push(type); }
    if (severity) { conditions.push('severity = ?'); params.push(severity); }

    const where = `WHERE ${conditions.join(' AND ')}`;
    const allowedSort = this.sanitizeSortField(sort);
    const allowedOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const offset = (page - 1) * limit;

    const countResult = await this.queryOne(
      `SELECT COUNT(*) as total FROM alerts ${where}`,
      params
    );
    const total = countResult?.total || 0;

    const rows = await this.query(
      `SELECT * FROM alerts ${where} ORDER BY ${allowedSort} ${allowedOrder} LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { rows, total };
  }

  async findByRuleCodeAndEntity(ruleCode, companyId, entityType, entityId) {
    return this.queryOne(
      `SELECT id FROM alerts WHERE rule_code = ? AND company_id = ? AND entity_type = ? AND entity_id = ? AND status = 'active'`,
      [ruleCode, companyId, entityType, entityId]
    );
  }

  async acknowledge(id, userId) {
    await this.query(
      `UPDATE alerts SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = NOW() WHERE id = ? AND status = 'active'`,
      [userId, id]
    );
    return this.findById(id);
  }

  async resolve(id, userId = null) {
    await this.query(
      `UPDATE alerts SET status = 'resolved', resolved_at = NOW(), resolved_by = ? WHERE id = ? AND status IN ('active', 'acknowledged')`,
      [userId, id]
    );
    return this.findById(id);
  }

  async dismissAlert(id, userId = null) {
    await this.query(
      `UPDATE alerts SET status = 'dismissed', dismissed_at = NOW(), dismissed_by = ? WHERE id = ? AND status IN ('active', 'acknowledged')`,
      [userId, id]
    );
    return this.findById(id);
  }

  async getStats(companyId) {
    return this.queryOne(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) AS activeCount,
        SUM(CASE WHEN status = 'acknowledged' THEN 1 ELSE 0 END) AS acknowledgedCount,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) AS resolvedCount,
        SUM(CASE WHEN status = 'dismissed' THEN 1 ELSE 0 END) AS dismissedCount,
        SUM(CASE WHEN severity = 'critical' AND status = 'active' THEN 1 ELSE 0 END) AS criticalActive,
        SUM(CASE WHEN severity = 'high' AND status = 'active' THEN 1 ELSE 0 END) AS highActive
      FROM alerts WHERE company_id = ?`,
      [companyId]
    );
  }

  async formatResponse(row) {
    if (!row) return null;
    return {
      id: row.id,
      companyId: row.company_id,
      type: row.type,
      severity: row.severity,
      title: row.title,
      message: row.message || '',
      status: row.status,
      entityType: row.entity_type || '',
      entityId: row.entity_id || '',
      ruleCode: row.rule_code || '',
      acknowledgedBy: row.acknowledged_by || null,
      acknowledgedAt: row.acknowledged_at || null,
      resolvedBy: row.resolved_by || null,
      resolvedAt: row.resolved_at || null,
      dismissedBy: row.dismissed_by || null,
      dismissedAt: row.dismissed_at || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at || row.created_at,
    };
  }
}

export default new AlertRepository();
